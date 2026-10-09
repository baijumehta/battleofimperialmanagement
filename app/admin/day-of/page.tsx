import Link from "next/link";
import { ConfirmButton, SubmitButton } from "@/app/components/ConfirmButton";
import { PrintButton } from "@/app/components/PrintButton";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getChecklist, getSettings, getShifts, getStaffRoles, type ChecklistItem } from "@/lib/data";
import { formatDate, isoDate, timeRange } from "@/lib/format";
import {
  BASELINE,
  BASELINE_NOTES,
  DECISION_RIGHTS,
  FIELD_CHECKLIST,
  PROCEDURES,
  RADIO_CALLS,
  RADIO_CHANNELS,
  RADIO_RULES,
  TIMELINE,
} from "@/lib/ops-manual";
import { resetChecklist, saveDebrief, toggleChecklistItem } from "../actions";

const LISTS = [
  ["opening", "Opening / site-wide", "Before first whistle"],
  ["midday", "Midday audit", "Between game blocks"],
  ["closing", "Closing", "After final whistle"],
] as const;

// Tournament runs in Anaheim Hills, so "now" is Pacific time regardless of where the server runs.
function pacificNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default async function DayOfPage() {
  await requireAdmin();
  const [settings, roles, checklist, shifts, debrief] = await Promise.all([
    getSettings(),
    getStaffRoles(),
    getChecklist(),
    getShifts(),
    sql`SELECT * FROM debrief_notes ORDER BY sort, id`,
  ]);

  const now = pacificNow();
  const eventDay = now.date === isoDate(settings.event_date);
  const currentStep = eventDay ? TIMELINE.filter(([m]) => m !== null && m <= now.minutes).length - 1 : -1;
  const onDuty = (s: (typeof shifts)[number]) =>
    eventDay && toMinutes(s.start_time) <= now.minutes && now.minutes < toMinutes(s.end_time);

  const emergency = [
    ["Venue address", settings.venue_address],
    ["Ambulance access point", settings.ambulance_access],
    ["AED locations", settings.aed_locations],
    ["Medical area", settings.medical_area],
    ["Shelter / assembly", settings.shelter_location],
  ];
  const missingEmergency = emergency.filter(([, v]) => !v).length;
  const unfilled = roles.filter((r) => !r.assignee).length;

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Day-of operations</h1>
          <p className="muted">
            {formatDate(settings.event_date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            {settings.location && ` · ${settings.location}`}
          </p>
        </div>
        <div className="row no-print">
          <PrintButton label="Print manual" expand="details.proc" />
        </div>
      </div>

      <nav className="chips no-print" aria-label="Jump to section">
        {[
          ["#emergency", "Emergency"],
          ["#contacts", "Contacts"],
          ["#timeline", "Timeline"],
          ["#radio", "Radio"],
          ["#checklists", "Checklists"],
          ["#posts", "Volunteer posts"],
          ["#procedures", "Procedures"],
          ["#debrief", "Debrief"],
        ].map(([href, text]) => (
          <a key={href} href={href}>
            {text}
          </a>
        ))}
      </nav>

      <section id="emergency" className="card emergency">
        <h2>Emergency: call 911 first</h2>
        <p>
          Then call Command on <strong>Channel 1</strong>: “EMERGENCY, EMERGENCY, EMERGENCY” plus your exact location. All other
          radio traffic stops. Don’t wait for radio approval to call 911.
        </p>
        <dl className="facts">
          {emergency.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v || <span className="badge bad">Not set</span>}</dd>
            </div>
          ))}
        </dl>
        {missingEmergency > 0 && (
          <p className="no-print" style={{ margin: "0.75rem 0 0" }}>
            <small>
              The manual requires these to be confirmed with the facility before event day.{" "}
              <Link href="/admin/settings">Fill them in on Settings →</Link>
            </small>
          </p>
        )}
      </section>

      <section className="card">
        <h2>Operating baseline</h2>
        <dl className="facts">
          {BASELINE.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        {BASELINE_NOTES.map((n) => (
          <p key={n} style={{ margin: "0.5rem 0 0" }}>
            <small className="muted">{n}</small>
          </p>
        ))}
      </section>

      <section id="contacts" className="card">
        <div className="row between">
          <h2>Command & contacts</h2>
          <Link href="/admin/staffing" className="no-print">
            Edit on Staffing →
          </Link>
        </div>
        {unfilled > 0 && (
          <p>
            <span className="badge warn">{unfilled} roles have no one assigned</span>
          </p>
        )}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Person</th>
                <th>Phone</th>
                <th>Radio</th>
                <th>Post</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.role}</strong>
                    {r.report_time && <small className="muted"> · in at {r.report_time}</small>}
                  </td>
                  <td>{r.assignee || <span className="muted">—</span>}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.phone ? <a href={`tel:${r.phone}`}>{r.phone}</a> : ""}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.radio}</td>
                  <td>{r.post}</td>
                </tr>
              ))}
              <tr>
                <td>
                  <strong>Emergency</strong>
                </td>
                <td>911</td>
                <td>
                  <a href="tel:911">911</a>
                </td>
                <td></td>
                <td>
                  <small>Venue address and ambulance access posted at check-in and both fields</small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="timeline" className="card">
        <h2>Master timeline</h2>
        {!eventDay && <p className="muted">On event day the current step is highlighted.</p>}
        <div className="table-wrap">
          <table>
            <tbody>
              {TIMELINE.map(([, time, action], i) => (
                <tr key={time} className={i === currentStep ? "now" : undefined}>
                  <td style={{ whiteSpace: "nowrap", width: 1 }}>
                    <strong>{time}</strong>
                  </td>
                  <td>
                    {action}
                    {i === currentStep && <span className="badge info"> Now</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="radio" className="card">
        <h2>Radio plan</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Channel</th>
                <th>Use</th>
                <th>Users</th>
              </tr>
            </thead>
            <tbody>
              {RADIO_CHANNELS.map(([ch, use, users]) => (
                <tr key={ch}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <strong>{ch}</strong>
                  </td>
                  <td>{use}</td>
                  <td>{users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 style={{ marginTop: "1rem" }}>Standard calls</h3>
        <dl className="facts single">
          {RADIO_CALLS.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <ul>
          {RADIO_RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section id="checklists" className="stack">
        <h2>Checklists</h2>
        <div className="grid grid-3">
          {LISTS.map(([key, title, when]) => (
            <Checklist key={key} list={key} title={title} when={when} items={checklist.filter((c) => c.list === key)} />
          ))}
        </div>
        <div className="card">
          <h3>Field checklist (every game)</h3>
          <ul className="checks">
            {FIELD_CHECKLIST.map((c) => (
              <li key={c}>☐ {c}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="posts" className="card">
        <div className="row between">
          <h2>Volunteer posts</h2>
          <Link href="/admin/shifts" className="no-print">
            All shifts →
          </Link>
        </div>
        <p className="muted">Open a post to see its roster and check people in.</p>
        <div className="table-wrap">
          <table>
            <tbody>
              {shifts.map((s) => (
                <tr key={s.id} className={onDuty(s) ? "now" : undefined}>
                  <td>
                    <Link href={`/admin/shifts/${s.id}`}>{s.title}</Link>
                    {onDuty(s) && <span className="badge info"> On now</span>}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{timeRange(s.start_time, s.end_time)}</td>
                  <td className="num">
                    <span className={`badge ${s.filled >= s.slots ? "ok" : "warn"}`}>
                      {s.filled}/{s.slots}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="procedures" className="stack">
        <h2>Procedures</h2>
        <details className="card proc">
          <summary>Command & decision rights</summary>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Decision / issue</th>
                  <th>Who decides</th>
                  <th>Escalation / guardrail</th>
                </tr>
              </thead>
              <tbody>
                {DECISION_RIGHTS.map(([d, who, g]) => (
                  <tr key={d}>
                    <td>
                      <strong>{d}</strong>
                    </td>
                    <td>{who}</td>
                    <td>{g}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        {PROCEDURES.map((p) => (
          <details key={p.id} className="card proc" open={p.id === "emergency"}>
            <summary>{p.title}</summary>
            {p.items && (
              <ul>
                {p.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            )}
            {p.table && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {p.table.head.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {p.table.rows.map(([a, b]) => (
                      <tr key={a}>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <strong>{a}</strong>
                        </td>
                        <td>{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {p.sub?.map((s) => (
              <div key={s.title}>
                <h3 style={{ marginTop: "0.75rem" }}>{s.title}</h3>
                <ul>
                  {s.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </details>
        ))}
      </section>

      <section id="debrief" className="card stack">
        <div>
          <h2>Event debrief</h2>
          <p className="muted">15-minute staff debrief after close. Notes save per question.</p>
        </div>
        {debrief.map((d) => (
          <form key={d.id} action={saveDebrief} className="debrief">
            <input type="hidden" name="id" value={d.id} />
            <label htmlFor={`debrief-${d.id}`}>{d.prompt}</label>
            <textarea id={`debrief-${d.id}`} name="notes" defaultValue={d.notes} />
            <div className="row">
              <input name="owner" defaultValue={d.owner} placeholder="Action owner" style={{ maxWidth: 220 }} />
              <SubmitButton className="btn sm secondary">Save</SubmitButton>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}

function Checklist({ list, title, when, items }: { list: string; title: string; when: string; items: ChecklistItem[] }) {
  const done = items.filter((i) => i.done).length;
  return (
    <div className="card">
      <div className="row between">
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span className={`badge ${done === items.length && items.length ? "ok" : ""}`}>
          {done}/{items.length}
        </span>
      </div>
      <p className="muted" style={{ margin: "0 0 0.5rem" }}>
        <small>{when}</small>
      </p>
      <ul className="checklist">
        {items.map((i) => (
          <li key={i.id}>
            <form action={toggleChecklistItem}>
              <input type="hidden" name="id" value={i.id} />
              <button className={`check-btn${i.done ? " done" : ""}`} aria-pressed={i.done}>
                <span className="box">{i.done ? "✓" : ""}</span>
                <span>{i.item}</span>
              </button>
            </form>
          </li>
        ))}
      </ul>
      {done > 0 && (
        <form action={resetChecklist} className="no-print" style={{ marginTop: "0.5rem" }}>
          <input type="hidden" name="list" value={list} />
          <ConfirmButton message={`Uncheck every item on the ${title} checklist?`} className="btn ghost sm">
            Reset
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}
