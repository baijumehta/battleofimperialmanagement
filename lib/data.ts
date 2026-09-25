import { sql } from "./db";

export type Settings = {
  name: string;
  event_date: Date;
  location: string;
  buyout_amount: string;
  signup_message: string;
  signups_open: boolean;
};

export type Organizer = { id: number; name: string; email: string; phone: string; focus: string; active: boolean };

export async function getSettings(): Promise<Settings> {
  const rows = await sql`SELECT * FROM event_settings WHERE id = 1`;
  if (rows[0]) return rows[0] as Settings;
  const [created] = await sql`INSERT INTO event_settings (id) VALUES (1) RETURNING *`;
  return created as Settings;
}

export async function getOrganizers(activeOnly = true): Promise<Organizer[]> {
  const rows = activeOnly
    ? await sql`SELECT * FROM organizers WHERE active ORDER BY name`
    : await sql`SELECT * FROM organizers ORDER BY active DESC, name`;
  return rows as Organizer[];
}

export type ShiftRow = {
  id: number;
  area: string;
  title: string;
  description: string;
  shift_date: Date;
  start_time: string;
  end_time: string;
  slots: number;
  lead_id: number | null;
  lead_name: string | null;
  filled: number;
};

export async function getShifts(): Promise<ShiftRow[]> {
  const rows = await sql`
    SELECT s.*, o.name AS lead_name, count(su.id)::int AS filled
    FROM shifts s
    LEFT JOIN organizers o ON o.id = s.lead_id
    LEFT JOIN signups su ON su.shift_id = s.id
    GROUP BY s.id, o.name
    ORDER BY s.shift_date, s.start_time, s.area, s.title`;
  return rows as ShiftRow[];
}
