"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { bool, num, optId, str } from "@/lib/form";

function refresh() {
  revalidatePath("/", "layout");
}

export async function logout() {
  await endSession();
  redirect("/login");
}

/* ---------- Team ---------- */

export async function saveOrganizer(fd: FormData) {
  await requireAdmin();
  const id = optId(fd, "id");
  const name = str(fd, "name");
  if (!name) return;
  const email = str(fd, "email");
  const phone = str(fd, "phone");
  const focus = str(fd, "focus");
  if (id) {
    await sql`UPDATE organizers SET name=${name}, email=${email}, phone=${phone}, focus=${focus}, active=${bool(fd, "active")} WHERE id=${id}`;
  } else {
    await sql`INSERT INTO organizers (name, email, phone, focus) VALUES (${name}, ${email}, ${phone}, ${focus})`;
  }
  refresh();
}

export async function deleteOrganizer(fd: FormData) {
  await requireAdmin();
  await sql`DELETE FROM organizers WHERE id=${optId(fd, "id")}`;
  refresh();
}

/* ---------- Shifts ---------- */

export async function saveShift(fd: FormData) {
  await requireAdmin();
  const id = optId(fd, "id");
  const area = str(fd, "area");
  const title = str(fd, "title");
  const start = str(fd, "start_time");
  const end = str(fd, "end_time");
  if (!area || !title || !start || !end) return;
  const description = str(fd, "description");
  const date = str(fd, "shift_date") || null;
  const slots = Math.max(1, num(fd, "slots", 1));
  const lead = optId(fd, "lead_id");
  if (id) {
    await sql`
      UPDATE shifts SET area=${area}, title=${title}, description=${description},
        shift_date=COALESCE(${date}::date, shift_date), start_time=${start}, end_time=${end},
        slots=${slots}, lead_id=${lead}
      WHERE id=${id}`;
  } else {
    await sql`
      INSERT INTO shifts (area, title, description, shift_date, start_time, end_time, slots, lead_id)
      VALUES (${area}, ${title}, ${description},
        COALESCE(${date}::date, (SELECT event_date FROM event_settings WHERE id = 1)),
        ${start}, ${end}, ${slots}, ${lead})`;
  }
  refresh();
}

export async function deleteShift(fd: FormData) {
  await requireAdmin();
  await sql`DELETE FROM shifts WHERE id=${optId(fd, "id")}`;
  refresh();
  redirect("/admin/shifts");
}

export async function addToShift(fd: FormData) {
  await requireAdmin();
  const shiftId = optId(fd, "shift_id");
  let volunteerId = optId(fd, "volunteer_id");
  const name = str(fd, "name");
  if (!volunteerId && name) {
    const [row] = await sql`
      INSERT INTO volunteers (name, email, phone) VALUES (${name}, ${str(fd, "email").toLowerCase()}, ${str(fd, "phone")})
      RETURNING id`;
    volunteerId = row.id;
  }
  if (!shiftId || !volunteerId) return;
  await sql`INSERT INTO signups (shift_id, volunteer_id) VALUES (${shiftId}, ${volunteerId}) ON CONFLICT DO NOTHING`;
  refresh();
}

export async function removeSignup(fd: FormData) {
  await requireAdmin();
  await sql`DELETE FROM signups WHERE id=${optId(fd, "id")}`;
  refresh();
}

export async function toggleCheckIn(fd: FormData) {
  await requireAdmin();
  await sql`UPDATE signups SET checked_in = NOT checked_in WHERE id=${optId(fd, "id")}`;
  refresh();
}

/* ---------- Volunteers ---------- */

export async function saveVolunteer(fd: FormData) {
  await requireAdmin();
  const id = optId(fd, "id");
  const name = str(fd, "name");
  if (!name) return;
  const v = {
    email: str(fd, "email").toLowerCase(),
    phone: str(fd, "phone"),
    player: str(fd, "player_name"),
    team: str(fd, "team"),
    type: str(fd, "volunteer_type") || "parent",
    school: str(fd, "school"),
    signedOff: bool(fd, "hours_signed_off"),
    notes: str(fd, "notes"),
  };
  if (id) {
    await sql`
      UPDATE volunteers SET name=${name}, email=${v.email}, phone=${v.phone}, player_name=${v.player},
        team=${v.team}, volunteer_type=${v.type}, school=${v.school}, hours_signed_off=${v.signedOff}, notes=${v.notes}
      WHERE id=${id}`;
  } else {
    await sql`
      INSERT INTO volunteers (name, email, phone, player_name, team, volunteer_type, school, hours_signed_off, notes)
      VALUES (${name}, ${v.email}, ${v.phone}, ${v.player}, ${v.team}, ${v.type}, ${v.school}, ${v.signedOff}, ${v.notes})`;
  }
  refresh();
}

export async function toggleHoursSignedOff(fd: FormData) {
  await requireAdmin();
  await sql`UPDATE volunteers SET hours_signed_off = NOT hours_signed_off WHERE id=${optId(fd, "id")}`;
  refresh();
}

export async function deleteVolunteer(fd: FormData) {
  await requireAdmin();
  await sql`DELETE FROM volunteers WHERE id=${optId(fd, "id")}`;
  refresh();
}

/* ---------- Eateries ---------- */

export async function saveEatery(fd: FormData) {
  await requireAdmin();
  const id = optId(fd, "id");
  const name = str(fd, "name");
  if (!name) return;
  const status = str(fd, "status") || "not_contacted";
  const owner = optId(fd, "owner_id");
  const contact = str(fd, "contact");
  const est = num(fd, "est_amount");
  const actual = num(fd, "actual_amount");
  const notes = str(fd, "notes");
  if (id) {
    await sql`
      UPDATE eateries SET name=${name}, status=${status}, owner_id=${owner}, contact=${contact},
        est_amount=${est}, actual_amount=${actual}, notes=${notes}, updated_at=now()
      WHERE id=${id}`;
  } else {
    await sql`
      INSERT INTO eateries (name, status, owner_id, contact, est_amount, actual_amount, notes)
      VALUES (${name}, ${status}, ${owner}, ${contact}, ${est}, ${actual}, ${notes})`;
  }
  refresh();
}

export async function setEateryStatus(fd: FormData) {
  await requireAdmin();
  await sql`UPDATE eateries SET status=${str(fd, "status")}, updated_at=now() WHERE id=${optId(fd, "id")}`;
  refresh();
}

export async function deleteEatery(fd: FormData) {
  await requireAdmin();
  await sql`DELETE FROM eateries WHERE id=${optId(fd, "id")}`;
  refresh();
}

/* ---------- Sponsors ---------- */

export async function saveSponsor(fd: FormData) {
  await requireAdmin();
  const id = optId(fd, "id");
  const name = str(fd, "name");
  if (!name) return;
  const kind = str(fd, "kind") || "sponsor";
  const status = str(fd, "status") || "prospect";
  const owner = optId(fd, "owner_id");
  const contact = str(fd, "contact");
  const amount = num(fd, "amount");
  const notes = str(fd, "notes");
  if (id) {
    await sql`
      UPDATE sponsors SET name=${name}, kind=${kind}, status=${status}, owner_id=${owner}, contact=${contact},
        amount=${amount}, notes=${notes}, updated_at=now()
      WHERE id=${id}`;
  } else {
    await sql`
      INSERT INTO sponsors (name, kind, status, owner_id, contact, amount, notes)
      VALUES (${name}, ${kind}, ${status}, ${owner}, ${contact}, ${amount}, ${notes})`;
  }
  refresh();
}

export async function deleteSponsor(fd: FormData) {
  await requireAdmin();
  await sql`DELETE FROM sponsors WHERE id=${optId(fd, "id")}`;
  refresh();
}

/* ---------- Tasks ---------- */

export async function saveTask(fd: FormData) {
  await requireAdmin();
  const id = optId(fd, "id");
  const title = str(fd, "title");
  if (!title) return;
  const owner = optId(fd, "owner_id");
  const due = str(fd, "due_date") || null;
  const notes = str(fd, "notes");
  if (id) {
    await sql`UPDATE tasks SET title=${title}, owner_id=${owner}, due_date=${due}, notes=${notes} WHERE id=${id}`;
  } else {
    await sql`INSERT INTO tasks (title, owner_id, due_date, notes) VALUES (${title}, ${owner}, ${due}, ${notes})`;
  }
  refresh();
}

export async function toggleTask(fd: FormData) {
  await requireAdmin();
  await sql`UPDATE tasks SET done = NOT done WHERE id=${optId(fd, "id")}`;
  refresh();
}

export async function deleteTask(fd: FormData) {
  await requireAdmin();
  await sql`DELETE FROM tasks WHERE id=${optId(fd, "id")}`;
  refresh();
}

/* ---------- Settings ---------- */

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  await sql`
    UPDATE event_settings SET
      name=${str(fd, "name")},
      event_date=${str(fd, "event_date")},
      location=${str(fd, "location")},
      signup_message=${str(fd, "signup_message")},
      signups_open=${bool(fd, "signups_open")}
    WHERE id = 1`;
  refresh();
}
