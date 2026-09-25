import { ConfirmButton, SubmitButton } from "@/app/components/ConfirmButton";
import { OrganizerSelect } from "@/app/components/OrganizerSelect";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getOrganizers, getSettings, type Organizer } from "@/lib/data";
import { EATERY_STATUSES, formatDate, label, money } from "@/lib/format";
import { deleteEatery, saveEatery, setEateryStatus } from "../actions";

const BADGE: Record<string, string> = {
  not_contacted: "",
  contacted: "info",
  interested: "warn",
  booked: "ok",
  declined: "bad",
};

export default async function EateriesPage() {
  await requireAdmin();
  const [settings, organizers, rows] = await Promise.all([
    getSettings(),
    getOrganizers(),
    sql`SELECT e.*, o.name AS owner_name FROM eateries e
        LEFT JOIN organizers o ON o.id = e.owner_id
        ORDER BY array_position(ARRAY['booked','interested','contacted','not_contacted','declined'], e.status), e.name`,
  ]);
  const booked = rows.filter((r) => r.status === "booked");
  const est = booked.reduce((n, r) => n + Number(r.est_amount), 0);
  const actual = rows.reduce((n, r) => n + Number(r.actual_amount), 0);

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Eatery give-back days</h1>
          <p className="muted">
            Street team tracker for {formatDate(settings.event_date, { month: "long", day: "numeric" })}. Assign each spot to an
            organizer and move it along as you hear back.
          </p>
        </div>
      </div>

      <div className="stats">
        {EATERY_STATUSES.map(([key, text]) => (
          <div key={key} className="card stat">
            <div className="value">{rows.filter((r) => r.status === key).length}</div>
            <div className="label">{text}</div>
          </div>
        ))}
        <div className="card stat">
          <div className="value">{money(actual || est)}</div>
          <div className="label">{actual ? "Received" : "Estimated from booked"}</div>
        </div>
      </div>

      <section className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Eatery</th>
                <th>Status</th>
                <th>Owner</th>
                <th className="num">Est. / actual</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td>
                    <strong>{e.name}</strong>
                    {e.contact && (
                      <>
                        <br />
                        <small>{e.contact}</small>
                      </>
                    )}
                    {e.notes && (
                      <>
                        <br />
                        <small className="muted">{e.notes}</small>
                      </>
                    )}
                  </td>
                  <td>
                    <form action={setEateryStatus} className="row">
                      <input type="hidden" name="id" value={e.id} />
                      <span className={`badge ${BADGE[e.status]}`}>{label(EATERY_STATUSES, e.status)}</span>
                      <select name="status" defaultValue={e.status} style={{ width: "auto" }} aria-label="Change status">
                        {EATERY_STATUSES.map(([k, t]) => (
                          <option key={k} value={k}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <button className="btn ghost sm">Set</button>
                    </form>
                  </td>
                  <td>{e.owner_name ?? <span className="badge warn">Unassigned</span>}</td>
                  <td className="num">
                    {money(e.est_amount)} / {money(e.actual_amount)}
                  </td>
                  <td style={{ minWidth: 70 }}>
                    <details className="edit">
                      <summary>Edit</summary>
                      <form action={saveEatery} className="stack" style={{ minWidth: 260 }}>
                        <EateryFields e={e} organizers={organizers} />
                        <SubmitButton className="btn sm">Save</SubmitButton>
                      </form>
                      <form action={deleteEatery} style={{ marginTop: 8 }}>
                        <input type="hidden" name="id" value={e.id} />
                        <ConfirmButton message={`Delete ${e.name}?`}>Delete</ConfirmButton>
                      </form>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <details className="card">
        <summary className="btn secondary sm">+ Add an eatery</summary>
        <form action={saveEatery} className="stack" style={{ marginTop: "1rem" }}>
          <EateryFields organizers={organizers} />
          <div>
            <SubmitButton>Add eatery</SubmitButton>
          </div>
        </form>
      </details>
    </div>
  );
}

function EateryFields({ e, organizers }: { e?: Record<string, any>; organizers: Organizer[] }) {
  return (
    <div className="fields">
      {e && <input type="hidden" name="id" value={e.id} />}
      <div>
        <label>Name</label>
        <input name="name" required defaultValue={e?.name} />
      </div>
      <div>
        <label>Status</label>
        <select name="status" defaultValue={e?.status ?? "not_contacted"}>
          {EATERY_STATUSES.map(([k, t]) => (
            <option key={k} value={k}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Owner</label>
        <OrganizerSelect name="owner_id" organizers={organizers} value={e?.owner_id} />
      </div>
      <div>
        <label>Contact</label>
        <input name="contact" defaultValue={e?.contact} placeholder="Manager name, phone" />
      </div>
      <div>
        <label>Estimated $</label>
        <input name="est_amount" type="number" min={0} step="1" defaultValue={e ? Number(e.est_amount) : ""} />
      </div>
      <div>
        <label>Actual $</label>
        <input name="actual_amount" type="number" min={0} step="1" defaultValue={e ? Number(e.actual_amount) : ""} />
      </div>
      <div className="field-full">
        <label>Notes</label>
        <textarea name="notes" defaultValue={e?.notes} placeholder="Flyer requirements, % back, hours…" />
      </div>
    </div>
  );
}
