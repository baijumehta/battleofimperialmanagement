import Link from "next/link";
import { getSettings, getShifts } from "@/lib/data";
import { daysUntil, formatDate, timeRange } from "@/lib/format";
import { VOLUNTEER_RULES } from "@/lib/ops-manual";
import { SignupForm } from "./SignupForm";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const [settings, shifts] = await Promise.all([getSettings(), getShifts()]);
  const days = daysUntil(settings.event_date);

  return (
    <>
      <header className="hero">
        <div className="container narrow">
          <h1>{settings.name}</h1>
          <p>
            {formatDate(settings.event_date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            {settings.location && ` · ${settings.location}`}
            {days > 0 && ` · ${days} days to go`}
          </p>
        </div>
      </header>
      <main className="container narrow stack">
        <p>{settings.signup_message}</p>
        <div className="info-box">
          <strong>Good to know</strong>
          <ul>
            {VOLUNTEER_RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        {settings.signups_open ? (
          <SignupForm
            shifts={shifts.map((s) => ({
              id: s.id,
              area: s.area,
              title: s.title,
              description: s.description,
              time: timeRange(s.start_time, s.end_time),
              open: s.slots - s.filled,
            }))}
          />
        ) : (
          <div className="card">Volunteer sign-ups are closed right now. Please check back soon.</div>
        )}
        {(settings.website || settings.contact_email || settings.contact_phone) && (
          <p className="muted" style={{ textAlign: "center", margin: 0 }}>
            Questions?{" "}
            {[
              settings.contact_email && (
                <a key="e" href={`mailto:${settings.contact_email}`}>
                  {settings.contact_email}
                </a>
              ),
              settings.contact_phone && (
                <a key="p" href={`tel:${settings.contact_phone}`}>
                  {settings.contact_phone}
                </a>
              ),
              settings.website && (
                <a key="w" href={`https://${settings.website.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer">
                  {settings.website}
                </a>
              ),
            ]
              .filter(Boolean)
              .flatMap((el, i) => (i ? [" · ", el] : [el]))}
          </p>
        )}
        <p className="muted" style={{ textAlign: "center" }}>
          <Link href="/admin">Organizer login</Link>
        </p>
      </main>
    </>
  );
}
