import { isSignedIn } from "@/lib/auth";
import { sql } from "@/lib/db";

function csvCell(v: unknown) {
  const s = v == null ? "" : String(v);
  // Prefix formula-like values so spreadsheets don't execute them.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function GET() {
  if (!(await isSignedIn())) return new Response("Unauthorized", { status: 401 });

  const rows = await sql`
    SELECT v.name, v.email, v.phone, v.player_name, v.team, v.buyout, v.buyout_paid, v.notes,
      coalesce(string_agg(s.area || ': ' || s.title, '; ' ORDER BY s.start_time), '') AS shifts
    FROM volunteers v
    LEFT JOIN signups su ON su.volunteer_id = v.id
    LEFT JOIN shifts s ON s.id = su.shift_id
    GROUP BY v.id ORDER BY v.name`;

  const header = ["Name", "Email", "Phone", "Player", "Team", "Shifts", "Buy-out", "Buy-out paid", "Notes"];
  const lines = [header, ...rows.map((r) => [r.name, r.email, r.phone, r.player_name, r.team, r.shifts, r.buyout ? "yes" : "", r.buyout_paid ? "yes" : "", r.notes])];
  const body = lines.map((l) => l.map(csvCell).join(",")).join("\r\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="volunteers.csv"',
    },
  });
}
