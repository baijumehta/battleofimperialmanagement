import Link from "next/link";
import { ConfirmButton, SubmitButton } from "@/app/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { getShifts, getStaffRoles, type StaffRole } from "@/lib/data";
import { EQUIPMENT, PRIORITIES, VOLUNTEER_MATRIX } from "@/lib/ops-manual";
import { deleteStaffRole, saveStaffRole } from "../actions";

export default async function StaffingPage() {
  await requireAdmin();
  const [roles, shifts] = await Promise.all([getStaffRoles(), getShifts()]);
  const filled = roles.filter((r) => r.assignee).length;

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Staffing plan</h1>
          <p className="muted">
            Lead roles from Lydie’s staffing scope. Names and numbers entered here become the contact sheet on the{" "}
            <Link href="/admin/day-of#contacts">Day-of page</Link>.
          </p>
        </div>
        <span className={`badge ${filled === roles.length ? "ok" : "warn"}`}>
          {filled}/{roles.length} roles assigned
        </span>
      </div>

      <section className="card">
        <h2>Lead roles</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Needed</th>
                <th>Reports</th>
                <th>Assigned</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.role}</strong>
                    {(r.radio || r.post) && (
                      <small className="muted">
                        {" "}
                        · {[r.radio, r.post].filter(Boolean).join(" · ")}
                      </small>
                    )}
                    <br />
                    <small>{r.scope}</small>
                    {r.notes && (
                      <>
                        <br />
                        <small className="muted">{r.notes}</small>
                      </>
                    )}
                  </td>
                  <td>
                    <small>{r.quantity}</small>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <small>{r.report_time}</small>
                  </td>
                  <td>
                    {r.assignee ? (
                      <>
                        {r.assignee}
                        {r.phone && (
                          <>
                            <br />
                            <a href={`tel:${r.phone}`}>{r.phone}</a>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="badge warn">Unassigned</span>
                    )}
                  </td>
                  <td style={{ minWidth: 70 }}>
                    <details className="edit">
                      <summary>Edit</summary>
                      <form action={saveStaffRole} className="stack" style={{ minWidth: 280 }}>
                        <RoleFields r={r} />
                        <SubmitButton className="btn sm">Save</SubmitButton>
                      </form>
                      <form action={deleteStaffRole} style={{ marginTop: 8 }}>
                        <input type="hidden" name="id" value={r.id} />
                        <ConfirmButton message={`Delete the ${r.role} role?`}>Delete role</ConfirmButton>
                      </form>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <details className="edit" style={{ marginTop: "0.75rem" }}>
          <summary>+ Add a role</summary>
          <form action={saveStaffRole} className="stack">
            <RoleFields />
            <div>
              <SubmitButton className="btn sm">Add role</SubmitButton>
            </div>
          </form>
        </details>
      </section>

      <section className="card">
        <div className="row between">
          <h2>Volunteer deployment</h2>
          <Link href="/admin/shifts">Edit shifts →</Link>
        </div>
        <p className="muted">
          Suggested coverage from the staffing scope compared with the shifts posted on the sign-up page (10–14 volunteers on
          duty at a time).
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Post</th>
                <th>Suggested at once</th>
                <th>Shifts posted</th>
                <th className="num">Signed up</th>
              </tr>
            </thead>
            <tbody>
              {VOLUNTEER_MATRIX.map((m) => {
                const posts = shifts.filter((s) => s.area === m.area);
                const slots = posts.reduce((n, s) => n + s.slots, 0);
                const signed = posts.reduce((n, s) => n + Math.min(s.filled, s.slots), 0);
                return (
                  <tr key={m.area}>
                    <td>
                      <strong>{m.area}</strong>
                      <br />
                      <small>{m.notes}</small>
                    </td>
                    <td>{m.suggested}</td>
                    <td>
                      {posts.length ? (
                        <small>
                          {posts.length} shift{posts.length === 1 ? "" : "s"}, {slots} spots
                        </small>
                      ) : (
                        <span className="badge bad">No shifts</span>
                      )}
                    </td>
                    <td className="num">
                      <span className={`badge ${slots && signed >= slots ? "ok" : "warn"}`}>
                        {signed}/{slots}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-2">
        <section className="card">
          <h2>Event priorities</h2>
          <ul>
            {PRIORITIES.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h2>Pre-event deadlines</h2>
          <p>
            The 30-day, 14-day, 7-day and event-week deliverables and the open items from the staffing scope are on the{" "}
            <Link href="/admin/tasks">Tasks page</Link>, with due dates.
          </p>
          <ul>
            <li>Feb 11: 30 days out (facility, insurance, officials, medical, vendors, parking)</li>
            <li>Feb 27: 14 days out (freeze schedule, rules, coach contacts, emergency site plan)</li>
            <li>Mar 6: 7 days out (staff names, radios, supplies, weather monitoring)</li>
            <li>Mar 8: event week (coach packet, staff manual, rules with officials)</li>
          </ul>
        </section>
      </div>

      <section className="card">
        <h2>Equipment & supplies</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Owner</th>
                <th>Check / standard</th>
              </tr>
            </thead>
            <tbody>
              {EQUIPMENT.map(([item, owner, check]) => (
                <tr key={item}>
                  <td>
                    <strong>{item}</strong>
                  </td>
                  <td>{owner}</td>
                  <td>{check}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function RoleFields({ r }: { r?: StaffRole }) {
  return (
    <div className="fields">
      {r && <input type="hidden" name="id" value={r.id} />}
      <div className="field-full">
        <label>Role</label>
        <input name="role" required defaultValue={r?.role} />
      </div>
      <div>
        <label>Person assigned</label>
        <input name="assignee" defaultValue={r?.assignee} />
      </div>
      <div>
        <label>Mobile</label>
        <input name="phone" type="tel" defaultValue={r?.phone} />
      </div>
      <div>
        <label>Needed</label>
        <input name="quantity" defaultValue={r?.quantity} />
      </div>
      <div>
        <label>Reports at</label>
        <input name="report_time" defaultValue={r?.report_time} placeholder="e.g. 6:15 AM" />
      </div>
      <div>
        <label>Radio</label>
        <input name="radio" defaultValue={r?.radio} placeholder="e.g. Ch 1" />
      </div>
      <div>
        <label>Post / location</label>
        <input name="post" defaultValue={r?.post} />
      </div>
      <div className="field-full">
        <label>Responsibilities</label>
        <textarea name="scope" defaultValue={r?.scope} />
      </div>
      <div className="field-full">
        <label>Notes</label>
        <input name="notes" defaultValue={r?.notes} placeholder="Backup, assignor contact, overflow plan…" />
      </div>
    </div>
  );
}
