import { ConfirmButton, SubmitButton } from "@/app/components/ConfirmButton";
import { OrganizerSelect } from "@/app/components/OrganizerSelect";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getOrganizers, type Organizer } from "@/lib/data";
import { SPONSOR_KINDS, SPONSOR_STATUSES, label, money } from "@/lib/format";
import { deleteSponsor, saveSponsor } from "../actions";

const BADGE: Record<string, string> = { prospect: "", in_talks: "warn", confirmed: "ok", declined: "bad" };

export default async function SponsorsPage() {
  await requireAdmin();
  const [organizers, rows] = await Promise.all([
    getOrganizers(),
    sql`SELECT s.*, o.name AS owner_name FROM sponsors s
        LEFT JOIN organizers o ON o.id = s.owner_id
        ORDER BY array_position(ARRAY['confirmed','in_talks','prospect','declined'], s.status), s.name`,
  ]);
  const confirmed = rows.filter((r) => r.status === "confirmed").reduce((n, r) => n + Number(r.amount), 0);

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Sponsors & vendors</h1>
          <p className="muted">Sponsors, tents, food trucks and partners. {money(confirmed)} confirmed.</p>
        </div>
      </div>

      <section className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Owner</th>
                <th className="num">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">
                    None yet.
                  </td>
                </tr>
              )}
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.name}</strong>
                    {s.contact && (
                      <>
                        <br />
                        <small>{s.contact}</small>
                      </>
                    )}
                    {s.notes && (
                      <>
                        <br />
                        <small className="muted">{s.notes}</small>
                      </>
                    )}
                  </td>
                  <td>{label(SPONSOR_KINDS, s.kind)}</td>
                  <td>
                    <span className={`badge ${BADGE[s.status]}`}>{label(SPONSOR_STATUSES, s.status)}</span>
                  </td>
                  <td>{s.owner_name ?? <span className="muted">—</span>}</td>
                  <td className="num">{money(s.amount)}</td>
                  <td style={{ minWidth: 70 }}>
                    <details className="edit">
                      <summary>Edit</summary>
                      <form action={saveSponsor} className="stack" style={{ minWidth: 260 }}>
                        <SponsorFields s={s} organizers={organizers} />
                        <SubmitButton className="btn sm">Save</SubmitButton>
                      </form>
                      <form action={deleteSponsor} style={{ marginTop: 8 }}>
                        <input type="hidden" name="id" value={s.id} />
                        <ConfirmButton message={`Delete ${s.name}?`}>Delete</ConfirmButton>
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
        <summary className="btn secondary sm">+ Add a sponsor or vendor</summary>
        <form action={saveSponsor} className="stack" style={{ marginTop: "1rem" }}>
          <SponsorFields organizers={organizers} />
          <div>
            <SubmitButton>Add</SubmitButton>
          </div>
        </form>
      </details>
    </div>
  );
}

function SponsorFields({ s, organizers }: { s?: Record<string, any>; organizers: Organizer[] }) {
  return (
    <div className="fields">
      {s && <input type="hidden" name="id" value={s.id} />}
      <div>
        <label>Name</label>
        <input name="name" required defaultValue={s?.name} />
      </div>
      <div>
        <label>Type</label>
        <select name="kind" defaultValue={s?.kind ?? "sponsor"}>
          {SPONSOR_KINDS.map(([k, t]) => (
            <option key={k} value={k}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Status</label>
        <select name="status" defaultValue={s?.status ?? "prospect"}>
          {SPONSOR_STATUSES.map(([k, t]) => (
            <option key={k} value={k}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Owner</label>
        <OrganizerSelect name="owner_id" organizers={organizers} value={s?.owner_id} />
      </div>
      <div>
        <label>Contact</label>
        <input name="contact" defaultValue={s?.contact} />
      </div>
      <div>
        <label>Amount $</label>
        <input name="amount" type="number" min={0} step="1" defaultValue={s ? Number(s.amount) : ""} />
      </div>
      <div className="field-full">
        <label>Notes</label>
        <textarea name="notes" defaultValue={s?.notes} />
      </div>
    </div>
  );
}
