import { isSignedIn } from "@/lib/auth";
import { sql } from "@/lib/db";
import { VOLUNTEER_TYPE_SHORT } from "@/lib/format";

function csvCell(v: unknown) {
  const s = v == null ? "" : String(v);
  // Prefix formula-like values so spreadsheets don't execute them.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function GET() {
  if (!(await isSignedIn())) return new Response("Unauthorized", { status: 401 });

  const rows = await sql`
    SELECT v.name, v.volunteer_type, v.email, v.phone, v.school, v.player_name, v.team, v.hours_signed_off, v.notes,
      coalesce(string_agg(s.area || ': ' || s.title, '; ' ORDER BY s.start_time), '') AS shifts,
      coalesce(sum(extract(epoch FROM s.end_time - s.start_time) / 3600), 0)::float AS hours_scheduled,
      coalesce(sum(extract(epoch FROM s.end_time - s.start_time) / 3600) FILTER (WHERE su.checked_in), 0)::float AS hours_worked
    FROM volunteers v
    LEFT JOIN signups su ON su.volunteer_id = v.id
    LEFT JOIN shifts s ON s.id = su.shift_id
    GROUP BY v.id ORDER BY v.name`;

  const header = ["Name", "Type", "Email", "Phone", "School", "Player", "Team", "Shifts", "Hours scheduled", "Hours worked", "Hours signed off", "Notes"];
  const lines = [
    header,
    ...rows.map((r) => [
      r.name,
      VOLUNTEER_TYPE_SHORT[r.volunteer_type],
      r.email,
      r.phone,
      r.school,
      r.player_name,
      r.team,
      r.shifts,
      r.hours_scheduled,
      r.hours_worked,
      r.hours_signed_off ? "yes" : "",
      r.notes,
    ]),
  ];
  const body = lines.map((l) => l.map(csvCell).join(",")).join("\r\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="volunteers.csv"',
    },
  });
}
