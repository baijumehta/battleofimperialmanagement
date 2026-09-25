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
  ('Decide on the parent buy-out policy', NULL, 'Lydie suggested a $200 buy-out for families who can''t volunteer'),
  ('Form a street team to book eatery give-back days for 3/13', NULL, 'See the Eateries page'),
  ('Follow up with Manhattan Stitch Co on swag tent sponsorship', (SELECT id FROM organizers WHERE name = 'Lydie'), '');

-- Draft shift plan. Edit or delete these once the team agrees on logistics.
INSERT INTO shifts (area, title, description, start_time, end_time, slots) VALUES
  ('Setup',       'Field & tent setup',         'Tents, tables, signage, field markers',     '06:30', '08:30', 8),
  ('Check-in',    'Team check-in (AM)',         'Greet teams, hand out schedules and wristbands', '07:30', '11:00', 3),
  ('Check-in',    'Team check-in (PM)',         'Greet teams, hand out schedules and wristbands', '11:00', '14:30', 3),
  ('Concessions', 'Snack bar (AM)',             'Sell snacks and drinks',                     '08:00', '11:30', 4),
  ('Concessions', 'Snack bar (Midday)',         'Sell snacks and drinks',                     '11:30', '14:30', 4),
  ('Concessions', 'Snack bar (PM)',             'Sell snacks and drinks, close out',          '14:30', '17:30', 4),
  ('Swag tent',   'Swag tent (AM)',             'Merch sales with Manhattan Stitch Co',       '08:00', '12:30', 2),
  ('Swag tent',   'Swag tent (PM)',             'Merch sales with Manhattan Stitch Co',       '12:30', '17:00', 2),
  ('Fields',      'Field marshal (AM)',         'Keep games on schedule, run scores to HQ',   '08:00', '12:30', 4),
  ('Fields',      'Field marshal (PM)',         'Keep games on schedule, run scores to HQ',   '12:30', '17:00', 4),
  ('Parking',     'Parking & traffic (AM)',     'Direct cars, keep lanes clear',              '07:00', '10:30', 3),
  ('Teardown',    'Teardown & cleanup',         'Break down tents, trash sweep',             '17:00', '19:00', 8);
