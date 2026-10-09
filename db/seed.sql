-- Starting data from Lydie's kickoff message. Only runs when the organizers table is empty.

INSERT INTO event_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO organizers (name, focus) VALUES
  ('Baiju', 'Volunteer site'),
  ('Jaime', ''),
  ('Laura', ''),
  ('Lydie', 'District approvals, sponsors'),
  ('Mike',  '');

INSERT INTO eateries (name, status, notes) VALUES
  ('Juice It Up',      'booked',        'Booked per Lydie'),
  ('Hive',             'not_contacted', ''),
  ('Pepz',             'not_contacted', ''),
  ('Zitos',            'not_contacted', ''),
  ('Raising Cane''s',  'not_contacted', ''),
  ('Pick Up Stix',     'not_contacted', ''),
  ('Bagel Me',         'not_contacted', ''),
  ('Taco Mesa',        'not_contacted', ''),
  ('Yogurtland',       'not_contacted', ''),
  ('Board & Brew',     'not_contacted', ''),
  ('Hummus Bean',      'not_contacted', ''),
  ('Poached',          'not_contacted', '');

INSERT INTO sponsors (name, kind, status, owner_id, notes) VALUES
  ('Manhattan Stitch Co', 'sponsor', 'in_talks',
   (SELECT id FROM organizers WHERE name = 'Lydie'),
   'Wants to sponsor the swag tent and run their own tent so other teams can order from them.');

INSERT INTO tasks (title, owner_id, notes) VALUES
  ('Schedule tournament team meeting (week after 10/1)', (SELECT id FROM organizers WHERE name = 'Lydie'), 'Lydie is free after State of the City on Thu 10/1'),
  ('Plan volunteer shift logistics', (SELECT id FROM organizers WHERE name = 'Baiju'), 'Shift list, areas, leads'),
  ('Reach out to local high schools about volunteer hours', NULL, 'Students can earn service hours by working a shift'),
  ('Form a street team to book eatery give-back days for 3/13', NULL, 'See the Eateries page'),
  ('Follow up with Manhattan Stitch Co on swag tent sponsorship', (SELECT id FROM organizers WHERE name = 'Lydie'), '');

-- Shifts, staffing roles, checklists and deadlines live in seed-ops.sql.
