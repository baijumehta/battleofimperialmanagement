"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { str } from "@/lib/form";
import { VOLUNTEER_TYPES } from "@/lib/format";

export type SignupResult =
  | { ok: true; name: string; shifts: string[]; student: boolean }
  | { ok: false; error: string }
  | null;

export async function submitSignup(_prev: SignupResult, fd: FormData): Promise<SignupResult> {
  const settings = await getSettings();
  if (!settings.signups_open) return { ok: false, error: "Sign-ups are closed right now." };
  if (str(fd, "website")) return { ok: false, error: "Something went wrong." }; // honeypot for bots

  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const phone = str(fd, "phone");
  const type = str(fd, "volunteer_type");
  const school = type === "student" ? str(fd, "school") : "";
  const player = str(fd, "player_name");
  const team = str(fd, "team");
  const notes = str(fd, "notes");
  const shiftIds = fd.getAll("shift").map(Number).filter(Boolean);

  if (!name) return { ok: false, error: "Please enter your name." };
  if (!VOLUNTEER_TYPES.some(([k]) => k === type)) return { ok: false, error: "Please tell us how you’re connected to the tournament." };
  if (!email && !phone) return { ok: false, error: "Please give us an email or phone number so we can reach you." };
  if (type === "student" && !school) return { ok: false, error: "Please enter your school so we can sign off your volunteer hours." };
  if (shiftIds.length === 0) return { ok: false, error: "Please pick at least one shift." };

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

  // Reuse the same volunteer record if this email has signed up before.
  const existing = email ? await sql`SELECT id FROM volunteers WHERE lower(email) = ${email} LIMIT 1` : [];
  let volunteerId: number;
  if (existing[0]) {
    volunteerId = existing[0].id;
    await sql`
      UPDATE volunteers SET
        name = ${name},
        volunteer_type = ${type},
        phone = COALESCE(NULLIF(${phone}, ''), phone),
        school = COALESCE(NULLIF(${school}, ''), school),
        player_name = COALESCE(NULLIF(${player}, ''), player_name),
        team = COALESCE(NULLIF(${team}, ''), team),
        notes = CASE WHEN ${notes} = '' THEN notes ELSE trim(notes || chr(10) || ${notes}) END
      WHERE id = ${volunteerId}`;
  } else {
    const [row] = await sql`
      INSERT INTO volunteers (name, email, phone, volunteer_type, school, player_name, team, notes)
      VALUES (${name}, ${email}, ${phone}, ${type}, ${school}, ${player}, ${team}, ${notes})
      RETURNING id`;
    volunteerId = row.id;
  }

  await sql`
    INSERT INTO signups (shift_id, volunteer_id)
    SELECT id, ${volunteerId} FROM shifts WHERE id = ANY(${shiftIds}::int[])
    ON CONFLICT (shift_id, volunteer_id) DO NOTHING`;
  const rows = await sql`SELECT title FROM shifts WHERE id = ANY(${shiftIds}::int[]) ORDER BY shift_date, start_time`;

  revalidatePath("/", "layout");
  return { ok: true, name, shifts: rows.map((r) => r.title), student: type === "student" };
}
