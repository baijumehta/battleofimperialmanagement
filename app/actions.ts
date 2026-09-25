"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { str } from "@/lib/form";

export type SignupResult =
  | { ok: true; name: string; shifts: string[]; buyout: boolean }
  | { ok: false; error: string }
  | null;

export async function submitSignup(_prev: SignupResult, fd: FormData): Promise<SignupResult> {
  const settings = await getSettings();
  if (!settings.signups_open) return { ok: false, error: "Sign-ups are closed right now." };
  if (str(fd, "website")) return { ok: false, error: "Something went wrong." }; // honeypot for bots

  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const phone = str(fd, "phone");
  const player = str(fd, "player_name");
  const team = str(fd, "team");
  const notes = str(fd, "notes");
  const buyout = str(fd, "choice") === "buyout";
  const shiftIds = buyout ? [] : fd.getAll("shift").map(Number).filter(Boolean);

  if (!name) return { ok: false, error: "Please enter your name." };
  if (!email && !phone) return { ok: false, error: "Please give us an email or phone number so we can reach you." };
  if (!buyout && shiftIds.length === 0) return { ok: false, error: "Pick at least one shift, or choose the buy-out option." };

  if (shiftIds.length) {
    const full = await sql`
      SELECT s.title FROM shifts s
      LEFT JOIN signups su ON su.shift_id = s.id
      WHERE s.id = ANY(${shiftIds}::int[])
      GROUP BY s.id
      HAVING count(su.id) >= s.slots`;
    if (full.length) {
      return {
        ok: false,
        error: `Sorry, these shifts just filled up: ${full.map((r) => r.title).join(", ")}. Please pick another.`,
      };
    }
  }

  // Reuse the same volunteer record if this email has signed up before.
  const existing = email ? await sql`SELECT id FROM volunteers WHERE lower(email) = ${email} LIMIT 1` : [];
  let volunteerId: number;
  if (existing[0]) {
    volunteerId = existing[0].id;
    await sql`
      UPDATE volunteers SET
        name = ${name},
        phone = COALESCE(NULLIF(${phone}, ''), phone),
        player_name = COALESCE(NULLIF(${player}, ''), player_name),
        team = COALESCE(NULLIF(${team}, ''), team),
        buyout = buyout OR ${buyout},
        notes = CASE WHEN ${notes} = '' THEN notes ELSE trim(notes || chr(10) || ${notes}) END
      WHERE id = ${volunteerId}`;
  } else {
    const [row] = await sql`
      INSERT INTO volunteers (name, email, phone, player_name, team, buyout, notes)
      VALUES (${name}, ${email}, ${phone}, ${player}, ${team}, ${buyout}, ${notes})
      RETURNING id`;
    volunteerId = row.id;
  }

  let titles: string[] = [];
  if (shiftIds.length) {
    await sql`
      INSERT INTO signups (shift_id, volunteer_id)
      SELECT id, ${volunteerId} FROM shifts WHERE id = ANY(${shiftIds}::int[])
      ON CONFLICT (shift_id, volunteer_id) DO NOTHING`;
    const rows = await sql`
      SELECT title FROM shifts WHERE id = ANY(${shiftIds}::int[]) ORDER BY shift_date, start_time`;
    titles = rows.map((r) => r.title);
  }

  revalidatePath("/", "layout");
  return { ok: true, name, shifts: titles, buyout };
}
