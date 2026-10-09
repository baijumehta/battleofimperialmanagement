-- Battle on Imperial planning database. Safe to re-run: every statement is idempotent.

CREATE TABLE IF NOT EXISTS event_settings (
  id              int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name            text NOT NULL DEFAULT 'Battle on Imperial Lacrosse Tournament',
  event_date      date NOT NULL DEFAULT '2027-03-13',
  location        text NOT NULL DEFAULT '',
  signup_message  text NOT NULL DEFAULT 'We need volunteers to make the tournament happen! Parents and siblings of players are welcome, and high school students can earn volunteer hours. Pick one or more shifts below.',
  signups_open    boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS organizers (
  id          serial PRIMARY KEY,
  name        text NOT NULL,
  email       text NOT NULL DEFAULT '',
  phone       text NOT NULL DEFAULT '',
  focus       text NOT NULL DEFAULT '',
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shifts (
  id            serial PRIMARY KEY,
  area          text NOT NULL,
  title         text NOT NULL,
  description   text NOT NULL DEFAULT '',
  shift_date    date NOT NULL DEFAULT '2027-03-13',
  start_time    time NOT NULL,
  end_time      time NOT NULL,
  slots         int  NOT NULL DEFAULT 1 CHECK (slots > 0),
  lead_id       int REFERENCES organizers(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS volunteers (
  id            serial PRIMARY KEY,
  name          text NOT NULL,
  email         text NOT NULL DEFAULT '',
  phone         text NOT NULL DEFAULT '',
  player_name   text NOT NULL DEFAULT '',
  team          text NOT NULL DEFAULT '',
  volunteer_type text NOT NULL DEFAULT 'parent'
                 CHECK (volunteer_type IN ('parent','sibling','student','other')),
  school        text NOT NULL DEFAULT '',
  hours_signed_off boolean NOT NULL DEFAULT false,
  notes         text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Oct 2026: the board dropped the mandatory parent buy-out and opened volunteering to
-- siblings and high school students earning service hours.
ALTER TABLE event_settings DROP COLUMN IF EXISTS buyout_amount;
ALTER TABLE volunteers DROP COLUMN IF EXISTS buyout;
ALTER TABLE volunteers DROP COLUMN IF EXISTS buyout_paid;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS volunteer_type text NOT NULL DEFAULT 'parent'
  CHECK (volunteer_type IN ('parent','sibling','student','other'));
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS school text NOT NULL DEFAULT '';
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS hours_signed_off boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS signups (
  id            serial PRIMARY KEY,
  shift_id      int NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  volunteer_id  int NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  checked_in    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (shift_id, volunteer_id)
);

-- Restaurant "give-back day" fundraisers for 3/13
CREATE TABLE IF NOT EXISTS eateries (
  id              serial PRIMARY KEY,
  name            text NOT NULL,
  status          text NOT NULL DEFAULT 'not_contacted'
                  CHECK (status IN ('not_contacted','contacted','interested','booked','declined')),
  owner_id        int REFERENCES organizers(id) ON DELETE SET NULL,
  contact         text NOT NULL DEFAULT '',
  est_amount      numeric(10,2) NOT NULL DEFAULT 0,
  actual_amount   numeric(10,2) NOT NULL DEFAULT 0,
  notes           text NOT NULL DEFAULT '',
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sponsors (
  id          serial PRIMARY KEY,
  name        text NOT NULL,
  kind        text NOT NULL DEFAULT 'sponsor' CHECK (kind IN ('sponsor','vendor','food','other')),
  status      text NOT NULL DEFAULT 'prospect'
              CHECK (status IN ('prospect','in_talks','confirmed','declined')),
  owner_id    int REFERENCES organizers(id) ON DELETE SET NULL,
  contact     text NOT NULL DEFAULT '',
  amount      numeric(10,2) NOT NULL DEFAULT 0,
  notes       text NOT NULL DEFAULT '',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id          serial PRIMARY KEY,
  title       text NOT NULL,
  owner_id    int REFERENCES organizers(id) ON DELETE SET NULL,
  due_date    date,
  done        boolean NOT NULL DEFAULT false,
  notes       text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS signups_shift_idx ON signups(shift_id);
CREATE INDEX IF NOT EXISTS signups_volunteer_idx ON signups(volunteer_id);

-- Oct 2026: day-of operations and staffing, from Lydie's Event Operations Manual
-- and Full Event Staffing & Scope of Work.
ALTER TABLE event_settings
  ADD COLUMN IF NOT EXISTS website          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email    text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_phone    text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS venue_address    text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ambulance_access text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS aed_locations    text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS medical_area     text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS shelter_location text NOT NULL DEFAULT '';

-- Lead roles from the staffing plan; doubles as the day-of contact sheet.
CREATE TABLE IF NOT EXISTS staff_roles (
  id           serial PRIMARY KEY,
  sort         int  NOT NULL DEFAULT 0,
  role         text NOT NULL,
  quantity     text NOT NULL DEFAULT '',
  report_time  text NOT NULL DEFAULT '',
  radio        text NOT NULL DEFAULT '',
  post         text NOT NULL DEFAULT '',
  scope        text NOT NULL DEFAULT '',
  assignee     text NOT NULL DEFAULT '',
  phone        text NOT NULL DEFAULT '',
  notes        text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id       serial PRIMARY KEY,
  list     text NOT NULL CHECK (list IN ('opening','midday','closing')),
  sort     int  NOT NULL DEFAULT 0,
  item     text NOT NULL,
  done     boolean NOT NULL DEFAULT false,
  done_at  timestamptz
);

CREATE TABLE IF NOT EXISTS debrief_notes (
  id      serial PRIMARY KEY,
  sort    int  NOT NULL DEFAULT 0,
  prompt  text NOT NULL,
  notes   text NOT NULL DEFAULT '',
  owner   text NOT NULL DEFAULT ''
);
