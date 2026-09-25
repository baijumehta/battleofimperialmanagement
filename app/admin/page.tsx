import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getSettings, getShifts } from "@/lib/data";
import { daysUntil, formatDate, money, timeRange } from "@/lib/format";

export default async function Dashboard() {
  await requireAdmin();
  const [settings, shifts, [vol], [eat], [spon], tasks] = await Promise.all([
    getSettings(),
    getShifts(),
    sql`SELECT count(*)::int AS total,
               count(*) FILTER (WHERE buyout)::int AS buyouts,
               count(*) FILTER (WHERE buyout AND buyout_paid)::int AS paid
        FROM volunteers`,
    sql`SELECT count(*)::int AS total,
               count(*) FILTER (WHERE status = 'booked')::int AS booked,
               count(*) FILTER (WHERE status = 'not_contacted')::int AS untouched,
               coalesce(sum(est_amount) FILTER (WHERE status = 'booked'), 0) AS est,
               coalesce(sum(actual_amount), 0) AS actual
        FROM eateries`,
    sql`SELECT count(*) FILTER (WHERE status = 'confirmed')::int AS confirmed,
               count(*) FILTER (WHERE status IN ('prospect','in_talks'))::int AS pending,
               coalesce(sum(amount) FILTER (WHERE status = 'confirmed'), 0) AS amount
        FROM sponsors`,
    sql`SELECT t.*, o.name AS owner_name FROM tasks t
        LEFT JOIN organizers o ON o.id = t.owner_id
        WHERE NOT t.done
        ORDER BY t.due_date NULLS LAST, t.created_at
        LIMIT 8`,
  ]);

  const slots = shifts.reduce((n, s) => n + s.slots, 0);
  const filled = shifts.reduce((n, s) => n + Math.min(s.filled, s.slots), 0);
  const pct = slots ? Math.round((filled / slots) * 100) : 0;
  const days = daysUntil(settings.event_date);
  const needs = shifts.filter((s) => s.filled < s.slots).sort((a, b) => a.filled / a.slots - b.filled / b.slots).slice(0, 6);
  const buyoutTotal = Number(settings.buyout_amount) * vol.paid;

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>{settings.name}</h1>
          <p className="muted">
            {formatDate(settings.event_date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            {settings.location && ` · ${settings.location}`}
          </p>
        </div>
        <div className="stat" style={{ textAlign: "right" }}>
          <div className="value">{days > 0 ? days : days === 0 ? "Today!" : "Done"}</div>
          <div className="label">{days > 0 ? "days to go" : ""}</div>
        </div>
      </div>

      <div className="stats">
        <div className="card stat">
          <div className="value">{pct}%</div>
          <div className="label">
            Shift slots filled ({filled}/{slots})
          </div>
          <div className={`bar ${pct >= 100 ? "full" : ""}`} style={{ marginTop: 8 }}>
            <div style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="card stat">
          <div className="value">{vol.total}</div>
          <div className="label">Volunteer families</div>
        </div>
        <div className="card stat">
          <div className="value">
            {vol.paid}/{vol.buyouts}
          </div>
          <div className="label">Buy-outs paid ({money(buyoutTotal)})</div>
        </div>
        <div className="card stat">
          <div className="value">
            {eat.booked}/{eat.total}
          </div>
          <div className="label">Eateries booked ({eat.untouched} not contacted)</div>
        </div>
        <div className="card stat">
          <div className="value">{money(Number(eat.actual) + Number(spon.amount) + buyoutTotal)}</div>
          <div className="label">Raised so far</div>
        </div>
        <div className="card stat">
          <div className="value">{spon.confirmed}</div>
          <div className="label">Sponsors confirmed ({spon.pending} in progress)</div>
        </div>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <div className="row between">
            <h2>Shifts that need people</h2>
            <Link href="/admin/shifts">All shifts →</Link>
          </div>
          {needs.length === 0 ? (
            <p className="muted">{shifts.length ? "Every shift is full. 🎉" : "No shifts yet."}</p>
          ) : (
            <table>
              <tbody>
                {needs.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link href={`/admin/shifts/${s.id}`}>{s.title}</Link>
                      <br />
                      <small>
                        {s.area} · {timeRange(s.start_time, s.end_time)}
                      </small>
                    </td>
                    <td className="num">
                      <span className="badge warn">{s.slots - s.filled} open</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <div className="row between">
            <h2>Open tasks</h2>
            <Link href="/admin/tasks">All tasks →</Link>
          </div>
          {tasks.length === 0 ? (
            <p className="muted">Nothing open.</p>
          ) : (
            <table>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td className="num">
                      <small>{t.owner_name ?? "Unassigned"}</small>
                      {t.due_date && (
                        <>
                          <br />
                          <small>due {formatDate(t.due_date)}</small>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
