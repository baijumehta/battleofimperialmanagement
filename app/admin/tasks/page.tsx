import { ConfirmButton, SubmitButton } from "@/app/components/ConfirmButton";
import { OrganizerSelect } from "@/app/components/OrganizerSelect";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getOrganizers, type Organizer } from "@/lib/data";
import { daysUntil, formatDate, isoDate } from "@/lib/format";
import { deleteTask, saveTask, toggleTask } from "../actions";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ owner?: string }> }) {
  await requireAdmin();
  const { owner } = await searchParams;
  const [organizers, rows] = await Promise.all([
    getOrganizers(),
    sql`SELECT t.*, o.name AS owner_name FROM tasks t
        LEFT JOIN organizers o ON o.id = t.owner_id
        ORDER BY t.done, t.due_date NULLS LAST, t.created_at`,
  ]);
  const list = owner ? rows.filter((t) => String(t.owner_id ?? "none") === owner) : rows;
  const open = list.filter((t) => !t.done);
  const done = list.filter((t) => t.done);

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Tasks</h1>
          <p className="muted">{rows.filter((t) => !t.done).length} open</p>
        </div>
        <form method="get" className="row">
          <select name="owner" defaultValue={owner ?? ""} style={{ width: "auto" }}>
            <option value="">Everyone</option>
            {organizers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
            <option value="none">Unassigned</option>
          </select>
          <button className="btn ghost sm">Filter</button>
        </form>
      </div>

      <form action={saveTask} className="card stack">
        <div className="fields">
          <div className="field-full">
            <label>New task</label>
            <input name="title" required placeholder="What needs doing?" />
          </div>
          <div>
            <label>Owner</label>
            <OrganizerSelect name="owner_id" organizers={organizers} />
          </div>
          <div>
            <label>Due</label>
            <input name="due_date" type="date" />
          </div>
        </div>
        <div>
          <SubmitButton>Add task</SubmitButton>
        </div>
      </form>

      <TaskTable tasks={open} organizers={organizers} />
      {done.length > 0 && (
        <details>
          <summary className="muted" style={{ cursor: "pointer" }}>
            {done.length} completed
          </summary>
          <div style={{ marginTop: "0.75rem" }}>
            <TaskTable tasks={done} organizers={organizers} />
          </div>
        </details>
      )}
    </div>
  );
}

function TaskTable({ tasks, organizers }: { tasks: Record<string, any>[]; organizers: Organizer[] }) {
  if (tasks.length === 0) return <div className="card muted">Nothing here.</div>;
  return (
    <section className="card">
      <div className="table-wrap">
        <table>
          <tbody>
            {tasks.map((t) => {
              const overdue = !t.done && t.due_date && daysUntil(t.due_date) < 0;
              return (
                <tr key={t.id}>
                  <td style={{ width: 40 }}>
                    <form action={toggleTask}>
                      <input type="hidden" name="id" value={t.id} />
                      <button className={`btn sm ${t.done ? "" : "ghost"}`} title={t.done ? "Reopen" : "Mark done"}>
                        {t.done ? "✓" : "☐"}
                      </button>
                    </form>
                  </td>
                  <td style={t.done ? { textDecoration: "line-through", color: "var(--muted)" } : undefined}>
                    {t.title}
                    {t.notes && (
                      <>
                        <br />
                        <small className="muted">{t.notes}</small>
                      </>
                    )}
                  </td>
                  <td>{t.owner_name ?? <span className="badge warn">Unassigned</span>}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {t.due_date && <span className={`badge ${overdue ? "bad" : ""}`}>{formatDate(t.due_date)}</span>}
                  </td>
                  <td style={{ minWidth: 70 }}>
                    <details className="edit">
                      <summary>Edit</summary>
                      <form action={saveTask} className="stack" style={{ minWidth: 260 }}>
                        <input type="hidden" name="id" value={t.id} />
                        <div className="fields">
                          <div className="field-full">
                            <label>Task</label>
                            <input name="title" required defaultValue={t.title} />
                          </div>
                          <div>
                            <label>Owner</label>
                            <OrganizerSelect name="owner_id" organizers={organizers} value={t.owner_id} />
                          </div>
                          <div>
                            <label>Due</label>
                            <input name="due_date" type="date" defaultValue={isoDate(t.due_date)} />
                          </div>
                          <div className="field-full">
                            <label>Notes</label>
                            <textarea name="notes" defaultValue={t.notes} />
                          </div>
                        </div>
                        <SubmitButton className="btn sm">Save</SubmitButton>
                      </form>
                      <form action={deleteTask} style={{ marginTop: 8 }}>
                        <input type="hidden" name="id" value={t.id} />
                        <ConfirmButton message="Delete this task?">Delete</ConfirmButton>
                      </form>
                    </details>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
