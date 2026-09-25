import Link from "next/link";
import { getSettings, getShifts } from "@/lib/data";
import { daysUntil, formatDate, money, timeRange } from "@/lib/format";
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
        {settings.signups_open ? (
          <SignupForm
            buyoutLabel={money(settings.buyout_amount)}
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
        <p className="muted" style={{ textAlign: "center" }}>
          <Link href="/admin">Organizer login</Link>
        </p>
      </main>
    </>
  );
}
