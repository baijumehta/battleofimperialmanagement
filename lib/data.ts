import { sql } from "./db";

export type Settings = {
  name: string;
  event_date: Date;
  location: string;
  website: string;
  contact_email: string;
  contact_phone: string;
  venue_address: string;
  ambulance_access: string;
  aed_locations: string;
  medical_area: string;
  shelter_location: string;
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

export type StaffRole = {
  id: number;
  sort: number;
  role: string;
  quantity: string;
  report_time: string;
  radio: string;
  post: string;
  scope: string;
  assignee: string;
  phone: string;
  notes: string;
};

export async function getStaffRoles(): Promise<StaffRole[]> {
  return (await sql`SELECT * FROM staff_roles ORDER BY sort, id`) as StaffRole[];
}

export type ChecklistItem = { id: number; list: "opening" | "midday" | "closing"; sort: number; item: string; done: boolean; done_at: Date | null };

export async function getChecklist(): Promise<ChecklistItem[]> {
  return (await sql`SELECT * FROM checklist_items ORDER BY list, sort, id`) as ChecklistItem[];
}
