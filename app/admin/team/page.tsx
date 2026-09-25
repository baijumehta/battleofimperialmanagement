import { ConfirmButton, SubmitButton } from "@/app/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getOrganizers } from "@/lib/data";
import { deleteOrganizer, saveOrganizer } from "../actions";

export default async function TeamPage() {
  await requireAdmin();
  const [organizers, load] = await Promise.all([
    getOrganizers(false),
    sql`SELECT o.id,
          (SELECT count(*) FROM tasks t WHERE t.owner_id = o.id AND NOT t.done)::int AS tasks,
          (SELECT count(*) FROM eateries e WHERE e.owner_id = o.id)::int AS eateries,
          (SELECT count(*) FROM shifts s WHERE s.lead_id = o.id)::int AS shifts
        FROM organizers o`,
  ]);
  const byId = new Map(load.map((l) => [l.id, l]));

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Organizing team</h1>
          <p className="muted">
            The people running the tournament. Anyone here can be assigned tasks, eateries, sponsors and shift leads.
          </p>
        </div>
      </div>

      <section className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Focus</th>
                <th>Contact</th>
                <th>Owns</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {organizers.map((o) => {
                const l = byId.get(o.id);
                return (
                  <tr key={o.id} style={o.active ? undefined : { opacity: 0.55 }}>
                    <td>
                      <strong>{o.name}</strong> {!o.active && <span className="badge">inactive</span>}
                    </td>
                    <td>{o.focus}</td>
                    <td>
                      {o.phone && <a href={`tel:${o.phone}`}>{o.phone}</a>}
                      {o.phone && o.email && <br />}
                      {o.email && <a href={`mailto:${o.email}`}>{o.email}</a>}
                    </td>
                    <td>
                      <small>
                        {l?.tasks ?? 0} open tasks · {l?.eateries ?? 0} eateries · {l?.shifts ?? 0} shift leads
                      </small>
                    </td>
                    <td style={{ minWidth: 70 }}>
                      <details className="edit">
                        <summary>Edit</summary>
                        <form action={saveOrganizer} className="stack" style={{ minWidth: 260 }}>
                          <input type="hidden" name="id" value={o.id} />
                          <OrganizerFields o={o} />
                          <label className="check">
                            <input type="checkbox" name="active" defaultChecked={o.active} /> Active
                          </label>
                          <SubmitButton className="btn sm">Save</SubmitButton>
                        </form>
                        <form action={deleteOrganizer} style={{ marginTop: 8 }}>
                          <input type="hidden" name="id" value={o.id} />
                          <ConfirmButton message={`Remove ${o.name}? Their tasks and eateries become unassigned.`}>
                            Remove
                          </ConfirmButton>
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

      <form action={saveOrganizer} className="card stack">
        <h2>Add an organizer</h2>
        <OrganizerFields />
        <div>
          <SubmitButton>Add to team</SubmitButton>
        </div>
      </form>
    </div>
  );
}

function OrganizerFields({ o }: { o?: { name: string; email: string; phone: string; focus: string } }) {
  return (
    <div className="fields">
      <div>
        <label>Name</label>
        <input name="name" required defaultValue={o?.name} />
      </div>
      <div>
        <label>Email</label>
        <input name="email" type="email" defaultValue={o?.email} />
      </div>
      <div>
        <label>Phone</label>
        <input name="phone" type="tel" defaultValue={o?.phone} />
      </div>
      <div>
        <label>Focus</label>
        <input name="focus" defaultValue={o?.focus} placeholder="e.g. Concessions, sponsors" />
      </div>
    </div>
  );
}
