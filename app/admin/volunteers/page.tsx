import { ConfirmButton, SubmitButton } from "@/app/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { VOLUNTEER_TYPES, VOLUNTEER_TYPE_SHORT, hours } from "@/lib/format";
import { deleteVolunteer, saveVolunteer, toggleHoursSignedOff } from "../actions";

type Filter = "all" | "family" | "student" | "unsigned" | "none";

export default async function VolunteersPage({ searchParams }: { searchParams: Promise<{ f?: Filter; q?: string }> }) {
  await requireAdmin();
  const { f = "all", q = "" } = await searchParams;
  const rows = await sql`
    SELECT v.*,
      coalesce(string_agg(s.title, ', ' ORDER BY s.start_time), '') AS shift_titles,
      count(s.id)::int AS shift_count,
      coalesce(sum(extract(epoch FROM s.end_time - s.start_time) / 3600), 0)::float AS hours_scheduled,
      coalesce(sum(extract(epoch FROM s.end_time - s.start_time) / 3600) FILTER (WHERE su.checked_in), 0)::float AS hours_worked
    FROM volunteers v
    LEFT JOIN signups su ON su.volunteer_id = v.id
    LEFT JOIN shifts s ON s.id = su.shift_id
    GROUP BY v.id
    ORDER BY v.name`;

  const needle = q.toLowerCase();
  const list = rows.filter((v) => {
    if (
      needle &&
      ![v.name, v.email, v.phone, v.player_name, v.team, v.school].some((x: string) => x.toLowerCase().includes(needle))
    )
      return false;
    if (f === "family") return v.volunteer_type === "parent" || v.volunteer_type === "sibling";
    if (f === "student") return v.volunteer_type === "student";
    if (f === "unsigned") return v.volunteer_type === "student" && v.hours_worked > 0 && !v.hours_signed_off;
    if (f === "none") return v.shift_count === 0;
    return true;
  });

  const filters: [Filter, string][] = [
    ["all", `All (${rows.length})`],
    ["family", "Parents & siblings"],
    ["student", "HS students"],
    ["unsigned", "Hours to sign off"],
    ["none", "No shift yet"],
  ];

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Volunteers</h1>
          <p className="muted">
            Everyone who signed up, plus anyone you add here. Student hours count once they’re checked in on a shift roster.
          </p>
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
        <input name="q" defaultValue={q} placeholder="Search name, school, player…" style={{ maxWidth: 260 }} />
      </form>

      <section className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Connection</th>
                <th>Shifts</th>
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
                    <strong>{v.name}</strong>{" "}
                    <span className={`badge ${v.volunteer_type === "student" ? "info" : ""}`}>
                      {VOLUNTEER_TYPE_SHORT[v.volunteer_type]}
                    </span>
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
                    {v.volunteer_type === "student" ? (
                      v.school
                    ) : (
                      <>
                        {v.player_name}
                        {v.team && <small> · {v.team}</small>}
                      </>
                    )}
                  </td>
                  <td>
                    {v.shift_titles ? <div>{v.shift_titles}</div> : <span className="badge bad">No shift yet</span>}
                    {v.volunteer_type === "student" && v.shift_count > 0 && (
                      <form action={toggleHoursSignedOff} className="row" style={{ marginTop: 4 }}>
                        <input type="hidden" name="id" value={v.id} />
                        <span className={`badge ${v.hours_signed_off ? "ok" : v.hours_worked > 0 ? "warn" : ""}`}>
                          {hours(v.hours_worked)} worked of {hours(v.hours_scheduled)}
                          {v.hours_signed_off && " · signed off"}
                        </span>
                        {(v.hours_worked > 0 || v.hours_signed_off) && (
                          <button className="btn ghost sm">{v.hours_signed_off ? "Undo sign-off" : "Mark signed off"}</button>
                        )}
                      </form>
                    )}
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
        <label>Type</label>
        <select name="volunteer_type" defaultValue={v?.volunteer_type ?? "parent"}>
          {VOLUNTEER_TYPES.map(([k, t]) => (
            <option key={k} value={k}>
              {t}
            </option>
          ))}
        </select>
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
        <label>School & grade (students)</label>
        <input name="school" defaultValue={v?.school} />
      </div>
      <div>
        <label>Player</label>
        <input name="player_name" defaultValue={v?.player_name} />
      </div>
      <div>
        <label>Team</label>
        <input name="team" defaultValue={v?.team} />
      </div>
      <label className="check field-full">
        <input type="checkbox" name="hours_signed_off" defaultChecked={v?.hours_signed_off} /> Student hours signed off
      </label>
      <div className="field-full">
        <label>Notes</label>
        <textarea name="notes" defaultValue={v?.notes} />
      </div>
    </div>
  );
}
