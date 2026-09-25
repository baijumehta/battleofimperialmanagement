import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton, SubmitButton } from "@/app/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getOrganizers, getShifts } from "@/lib/data";
import { formatDate, timeRange } from "@/lib/format";
import { addToShift, deleteShift, removeSignup, saveShift, toggleCheckIn } from "../../actions";
import { ShiftFields } from "../ShiftFields";
import { PrintButton } from "@/app/components/PrintButton";

export default async function ShiftDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  const [shifts, organizers, roster, others] = await Promise.all([
    getShifts(),
    getOrganizers(),
    sql`SELECT su.id, su.checked_in, v.id AS volunteer_id, v.name, v.email, v.phone, v.player_name, v.team
        FROM signups su JOIN volunteers v ON v.id = su.volunteer_id
        WHERE su.shift_id = ${id} ORDER BY v.name`,
    sql`SELECT id, name FROM volunteers
        WHERE id NOT IN (SELECT volunteer_id FROM signups WHERE shift_id = ${id})
        ORDER BY name`,
  ]);
  const shift = shifts.find((s) => s.id === id);
  if (!shift) notFound();
  const areas = [...new Set(shifts.map((s) => s.area))];

  return (
    <div className="stack">
      <p className="no-print">
        <Link href="/admin/shifts">← All shifts</Link>
      </p>
      <div className="page-head">
        <div>
          <h1>{shift.title}</h1>
          <p className="muted">
            {shift.area} · {formatDate(shift.shift_date, { weekday: "short" })} · {timeRange(shift.start_time, shift.end_time)}
            {shift.lead_name && ` · Lead: ${shift.lead_name}`}
          </p>
        </div>
        <div className="row no-print">
          <span className={`badge ${shift.filled >= shift.slots ? "ok" : "warn"}`}>
            {shift.filled}/{shift.slots} filled
          </span>
          <PrintButton />
        </div>
      </div>

      <section className="card">
        <h2>Roster</h2>
        {roster.length === 0 ? (
          <p className="muted">Nobody yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Here</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Player / team</th>
                  <th className="no-print"></th>
                </tr>
              </thead>
              <tbody>
                {roster.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <form action={toggleCheckIn}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className={`btn sm ${r.checked_in ? "" : "ghost"}`} title="Toggle check-in">
                          {r.checked_in ? "✓" : "☐"}
                        </button>
                      </form>
                    </td>
                    <td>{r.name}</td>
                    <td>
                      {r.phone && <a href={`tel:${r.phone}`}>{r.phone}</a>}
                      {r.phone && r.email && <br />}
                      {r.email && <a href={`mailto:${r.email}`}>{r.email}</a>}
                    </td>
                    <td>
                      {r.player_name}
                      {r.team && <small> · {r.team}</small>}
                    </td>
                    <td className="num no-print">
                      <form action={removeSignup}>
                        <input type="hidden" name="id" value={r.id} />
                        <ConfirmButton message={`Remove ${r.name} from this shift?`}>Remove</ConfirmButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card no-print">
        <h2>Add someone</h2>
        <div className="grid grid-2">
          <form action={addToShift} className="stack">
            <input type="hidden" name="shift_id" value={id} />
            <div>
              <label>Existing volunteer</label>
              <select name="volunteer_id" required defaultValue="">
                <option value="" disabled>
                  Choose…
                </option>
                {others.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <SubmitButton className="btn secondary">Add to shift</SubmitButton>
            </div>
          </form>
          <form action={addToShift} className="stack">
            <input type="hidden" name="shift_id" value={id} />
            <div className="fields">
              <div>
                <label>New person</label>
                <input name="name" required placeholder="Name" />
              </div>
              <div>
                <label>Phone</label>
                <input name="phone" type="tel" />
              </div>
              <div>
                <label>Email</label>
                <input name="email" type="email" />
              </div>
            </div>
            <div>
              <SubmitButton className="btn secondary">Add new volunteer</SubmitButton>
            </div>
          </form>
        </div>
      </section>

      <details className="card no-print">
        <summary className="btn ghost sm">Edit this shift</summary>
        <form action={saveShift} className="stack" style={{ marginTop: "1rem" }}>
          <ShiftFields shift={shift} organizers={organizers} areas={areas} />
          <div className="row">
            <SubmitButton>Save changes</SubmitButton>
          </div>
        </form>
        <form action={deleteShift} style={{ marginTop: "1rem" }}>
          <input type="hidden" name="id" value={id} />
          <ConfirmButton message="Delete this shift and its sign-ups?">Delete shift</ConfirmButton>
        </form>
      </details>
    </div>
  );
}
