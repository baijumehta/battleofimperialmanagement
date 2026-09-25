import { ConfirmButton, SubmitButton } from "@/app/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { money } from "@/lib/format";
import { deleteVolunteer, saveVolunteer, toggleBuyoutPaid } from "../actions";

type Filter = "all" | "shifts" | "buyout" | "unpaid" | "none";

export default async function VolunteersPage({ searchParams }: { searchParams: Promise<{ f?: Filter; q?: string }> }) {
  await requireAdmin();
  const { f = "all", q = "" } = await searchParams;
  const [settings, rows] = await Promise.all([
    getSettings(),
    sql`SELECT v.*,
          coalesce(string_agg(s.title, ', ' ORDER BY s.start_time), '') AS shift_titles,
          count(s.id)::int AS shift_count
        FROM volunteers v
        LEFT JOIN signups su ON su.volunteer_id = v.id
        LEFT JOIN shifts s ON s.id = su.shift_id
        GROUP BY v.id
        ORDER BY v.name`,
  ]);

  const needle = q.toLowerCase();
  const list = rows.filter((v) => {
    if (needle && ![v.name, v.email, v.phone, v.player_name, v.team].some((x: string) => x.toLowerCase().includes(needle)))
      return false;
    if (f === "shifts") return v.shift_count > 0;
    if (f === "buyout") return v.buyout;
    if (f === "unpaid") return v.buyout && !v.buyout_paid;
    if (f === "none") return v.shift_count === 0 && !v.buyout;
    return true;
  });

  const filters: [Filter, string][] = [
    ["all", `All (${rows.length})`],
    ["shifts", "Working a shift"],
    ["buyout", "Buy-out"],
    ["unpaid", "Buy-out unpaid"],
    ["none", "No shift yet"],
  ];

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Volunteers</h1>
          <p className="muted">Everyone who signed up on the parent page, plus anyone you add here.</p>
        </div>
        <a className="btn ghost sm" href="/admin/volunteers/export">
          Download CSV
        </a>
      </div>

      <form className="row" method="get">
        {filters.map(([key, text]) => (
          <button key={key} name="f" value={key} className={`btn sm ${f === key ? "" : "ghost"}`}>
            {text}
          </button>
        ))}
        <input name="q" defaultValue={q} placeholder="Search name, player, team…" style={{ maxWidth: 260 }} />
      </form>

      <section className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Player / team</th>
                <th>Helping with</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted">
                    No one matches.
                  </td>
                </tr>
              )}
              {list.map((v) => (
                <tr key={v.id}>
                  <td>
                    <strong>{v.name}</strong>
                    {v.notes && (
                      <>
                        <br />
                        <small style={{ whiteSpace: "pre-line" }}>{v.notes}</small>
                      </>
                    )}
                  </td>
                  <td>
                    {v.phone && <a href={`tel:${v.phone}`}>{v.phone}</a>}
                    {v.phone && v.email && <br />}
                    {v.email && <a href={`mailto:${v.email}`}>{v.email}</a>}
                  </td>
                  <td>
                    {v.player_name}
                    {v.team && <small> · {v.team}</small>}
                  </td>
                  <td>
                    {v.shift_titles && <div>{v.shift_titles}</div>}
                    {v.buyout && (
                      <form action={toggleBuyoutPaid} className="row" style={{ marginTop: 4 }}>
                        <input type="hidden" name="id" value={v.id} />
                        <span className={`badge ${v.buyout_paid ? "ok" : "warn"}`}>
                          {money(settings.buyout_amount)} buy-out · {v.buyout_paid ? "paid" : "unpaid"}
                        </span>
                        <button className="btn ghost sm">{v.buyout_paid ? "Mark unpaid" : "Mark paid"}</button>
                      </form>
                    )}
                    {!v.shift_titles && !v.buyout && <span className="badge bad">Not assigned</span>}
                  </td>
                  <td style={{ minWidth: 70 }}>
                    <details className="edit">
                      <summary>Edit</summary>
                      <form action={saveVolunteer} className="stack" style={{ minWidth: 260 }}>
                        <VolunteerFields v={v} />
                        <SubmitButton className="btn sm">Save</SubmitButton>
                      </form>
                      <form action={deleteVolunteer} style={{ marginTop: 8 }}>
                        <input type="hidden" name="id" value={v.id} />
                        <ConfirmButton message={`Delete ${v.name} and their shift sign-ups?`}>Delete</ConfirmButton>
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
        <summary className="btn secondary sm">+ Add a volunteer</summary>
        <form action={saveVolunteer} className="stack" style={{ marginTop: "1rem" }}>
          <VolunteerFields />
          <div>
            <SubmitButton>Add volunteer</SubmitButton>
          </div>
        </form>
      </details>
    </div>
  );
}

function VolunteerFields({ v }: { v?: Record<string, any> }) {
  return (
    <div className="fields">
      {v && <input type="hidden" name="id" value={v.id} />}
      <div>
        <label>Name</label>
        <input name="name" required defaultValue={v?.name} />
      </div>
      <div>
        <label>Email</label>
        <input name="email" type="email" defaultValue={v?.email} />
      </div>
      <div>
        <label>Phone</label>
        <input name="phone" type="tel" defaultValue={v?.phone} />
      </div>
      <div>
        <label>Player</label>
        <input name="player_name" defaultValue={v?.player_name} />
      </div>
      <div>
        <label>Team</label>
        <input name="team" defaultValue={v?.team} />
      </div>
      <div className="field-full row">
        <label className="check">
          <input type="checkbox" name="buyout" defaultChecked={v?.buyout} /> Buy-out
        </label>
        <label className="check">
          <input type="checkbox" name="buyout_paid" defaultChecked={v?.buyout_paid} /> Paid
        </label>
      </div>
      <div className="field-full">
        <label>Notes</label>
        <textarea name="notes" defaultValue={v?.notes} />
      </div>
    </div>
  );
}
