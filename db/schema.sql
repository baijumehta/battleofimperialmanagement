-- Battle on Imperial planning database. Safe to re-run: every statement is idempotent.

CREATE TABLE IF NOT EXISTS event_settings (
  id              int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name            text NOT NULL DEFAULT 'Battle on Imperial Lacrosse Tournament',
  event_date      date NOT NULL DEFAULT '2027-03-13',
  location        text NOT NULL DEFAULT '',
  buyout_amount   numeric(10,2) NOT NULL DEFAULT 200,
  signup_message  text NOT NULL DEFAULT 'Every family helps make the tournament happen. Pick a shift below, or choose the buy-out option.',
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
  buyout        boolean NOT NULL DEFAULT false,
  buyout_paid   boolean NOT NULL DEFAULT false,
  notes         text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now()
);

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
