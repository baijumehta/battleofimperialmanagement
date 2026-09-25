import Link from "next/link";
import { SubmitButton } from "@/app/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { getOrganizers, getShifts } from "@/lib/data";
import { formatDate, timeRange } from "@/lib/format";
import { saveShift } from "../actions";
import { ShiftFields } from "./ShiftFields";

export default async function ShiftsPage() {
  await requireAdmin();
  const [shifts, organizers] = await Promise.all([getShifts(), getOrganizers()]);
  const areas = [...new Set(shifts.map((s) => s.area))];
  const multiDay = new Set(shifts.map((s) => formatDate(s.shift_date))).size > 1;

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Shifts</h1>
          <p className="muted">
            {shifts.length} shifts across {areas.length} areas. Parents see these on the sign-up page.
          </p>
        </div>
      </div>

      <details className="card">
        <summary className="btn secondary sm">+ Add a shift</summary>
        <form action={saveShift} className="stack" style={{ marginTop: "1rem" }}>
          <ShiftFields organizers={organizers} areas={areas} />
          <div>
            <SubmitButton>Add shift</SubmitButton>
          </div>
        </form>
      </details>

      {areas.map((area) => (
        <section key={area} className="card">
          <h2>{area}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Shift</th>
                  <th>Time</th>
                  <th>Lead</th>
                  <th>Filled</th>
                </tr>
              </thead>
              <tbody>
                {shifts
                  .filter((s) => s.area === area)
                  .map((s) => {
                    const pct = Math.min(100, Math.round((s.filled / s.slots) * 100));
                    return (
                      <tr key={s.id}>
                        <td>
                          <Link href={`/admin/shifts/${s.id}`}>
                            <strong>{s.title}</strong>
                          </Link>
                          {s.description && (
                            <>
                              <br />
                              <small>{s.description}</small>
                            </>
                          )}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {multiDay && `${formatDate(s.shift_date)} · `}
                          {timeRange(s.start_time, s.end_time)}
                        </td>
                        <td>{s.lead_name ?? <span className="muted">—</span>}</td>
                        <td style={{ minWidth: 120 }}>
                          <div className="row">
                            <div className={`bar ${pct >= 100 ? "full" : ""}`} style={{ flex: 1 }}>
                              <div style={{ width: `${pct}%` }} />
                            </div>
                            <small>
                              {s.filled}/{s.slots}
                            </small>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
