-- Day-of operations and staffing data from Lydie's Event Operations Manual and
-- Full Event Staffing & Scope of Work (2027). Runs on every `npm run db:setup`;
-- each block only fills in what is missing, so edits made in the site are kept.

-- Event details: fill blanks only.
UPDATE event_settings SET
  location      = CASE WHEN location = ''      THEN 'Canyon High School, Anaheim Hills, CA' ELSE location END,
  website       = CASE WHEN website = ''       THEN 'www.battleonimperial.com' ELSE website END,
  contact_email = CASE WHEN contact_email = '' THEN 'battleonimperial@gmail.com' ELSE contact_email END,
  contact_phone = CASE WHEN contact_phone = '' THEN '714-747-4770' ELSE contact_phone END
WHERE id = 1;

-- Volunteer shifts, built from the Volunteer Deployment Matrix (staffing scope §5).
-- Volunteers report 6:30 AM for the 6:45 briefing; final games end ~7:10 PM.
INSERT INTO shifts (area, title, description, start_time, end_time, slots)
SELECT v.* FROM (VALUES
  ('Parking & traffic', 'Parking: morning arrivals', 'High-visibility vest. Direct teams, spectators and vendors to approved parking; keep fire lanes and accessible routes clear.', '06:30'::time, '10:30'::time, 4),
  ('Parking & traffic', 'Parking: midday', 'Lighter coverage between the arrival and departure peaks.', '10:30', '15:00', 2),
  ('Parking & traffic', 'Parking: afternoon & departures', 'Departure peak after the final games. Keep pedestrians safe at crossings.', '15:00', '19:45', 4),
  ('Team check-in', 'Team check-in (AM)', 'Greet coaches, hand out coach packets, give directions and answer questions. Lost & Found is kept here.', '06:30', '13:00', 2),
  ('Team check-in', 'Team check-in (PM)', 'Greet coaches, hand out coach packets, give directions and answer questions. Lost & Found is kept here.', '12:45', '19:45', 2),
  ('Field runners', 'Field 1 runner (AM)', 'Deliver balls, forms, supplies and messages for Field 1.', '06:30', '13:00', 1),
  ('Field runners', 'Field 1 runner (PM)', 'Deliver balls, forms, supplies and messages for Field 1.', '12:45', '19:45', 1),
  ('Field runners', 'Field 2 runner (AM)', 'Deliver balls, forms, supplies and messages for Field 2.', '06:30', '13:00', 1),
  ('Field runners', 'Field 2 runner (PM)', 'Deliver balls, forms, supplies and messages for Field 2.', '12:45', '19:45', 1),
  ('Scorekeeping support', 'Scorekeeping support (AM)', 'Help the two field scorekeepers and double-check standings.', '06:30', '13:00', 2),
  ('Scorekeeping support', 'Scorekeeping support (PM)', 'Help the two field scorekeepers and double-check standings.', '12:45', '19:45', 2),
  ('Locker rooms & wayfinding', 'Locker rooms & wayfinding (AM)', 'Direct teams to approved locker rooms and warm-up areas. Keep spectators out of team-only spaces.', '06:30', '13:00', 2),
  ('Locker rooms & wayfinding', 'Locker rooms & wayfinding (PM)', 'Direct teams to approved locker rooms and warm-up areas. Keep spectators out of team-only spaces.', '12:45', '19:45', 2),
  ('Vendor support', 'Vendor support (AM)', 'Vendor check-in and load-in, trash and supply needs.', '06:30', '13:00', 2),
  ('Vendor support', 'Vendor support & breakdown (PM)', 'Trash and supply needs; help with the staggered vendor breakdown.', '12:45', '19:45', 1),
  ('Hospitality', 'Referee hospitality & runner (AM)', 'Refreshments for officials, water and ice restocks, supply runs.', '06:30', '13:00', 2),
  ('Hospitality', 'Referee hospitality & runner (PM)', 'Refreshments for officials, water and ice restocks, supply runs.', '12:45', '19:45', 2),
  ('Facility & trash', 'Facility & trash rover (AM)', 'Rounds of restrooms, spectator areas, bins, benches and the field perimeter.', '06:30', '13:00', 2),
  ('Facility & trash', 'Facility & trash rover (PM)', 'Rounds of restrooms, spectator areas, bins and benches, plus the end-of-day sweep.', '12:45', '19:45', 2),
  ('Floaters', 'Floater / break coverage (AM)', 'Cover breaks and unexpected lines wherever the Volunteer Lead sends you.', '06:30', '13:00', 2),
  ('Floaters', 'Floater / break coverage (PM)', 'Cover breaks and unexpected lines wherever the Volunteer Lead sends you.', '12:45', '19:45', 2)
) AS v(area, title, description, start_time, end_time, slots)
WHERE NOT EXISTS (SELECT 1 FROM shifts);

-- Lead roles (staffing scope §3) with radio channels and posts (operations manual quick reference).
INSERT INTO staff_roles (sort, role, quantity, report_time, radio, post, scope, assignee, phone, notes)
SELECT v.* FROM (VALUES
  (10,  'Event Director / Incident Commander', '1', '5:30 AM', 'Ch 1', 'Command / check-in', 'Overall authority; facility/school liaison; budget and contracts; approves schedule and major decisions; emergency coordination; final standings approval; closeout.', 'Lydie Gutfeld', '714-747-4770', 'Primary tournament contact'),
  (20,  'Operations Lead (Assistant Event Director)', '1', '5:30 AM', 'Ch 1', 'Command / field operations', 'Runs the command desk and radio channel; tracks both fields; manages schedule, staff deployment, escalation and site audits.', '', '', ''),
  (30,  'Field Coordinator, Field 1 (Varsity)', '1', '5:45 AM', 'Ch 2', 'Field 1', 'Safety and setup checks; team/official readiness; starts and ends; score confirmation; transitions; delay reporting.', '', '', ''),
  (40,  'Field Coordinator, Field 2 (JV)', '1', '5:45 AM', 'Ch 3', 'Field 2', 'Safety and setup checks; team/official readiness; starts and ends; score confirmation; transitions; delay reporting.', '', '', ''),
  (50,  'Scorekeeper, Field 1', '1', '6:30 AM', 'Ch 2', 'Field 1 score station', 'Records score, penalties/cards as required, actual start/end; verifies final score; submits results immediately.', '', '', ''),
  (60,  'Scorekeeper, Field 2', '1', '6:30 AM', 'Ch 3', 'Field 2 score station', 'Records score, penalties/cards as required, actual start/end; verifies final score; submits results immediately.', '', '', ''),
  (70,  'Standings / Schedule Lead', '1 (may be Operations)', '6:15 AM', 'Ch 1', 'Command', 'Maintains master schedule and results sheet; validates standings; flags missing scores and tie-breakers.', '', '', 'Results backup:'),
  (80,  'Referee Coordinator', '1', '6:15 AM', 'Ch 1', 'Officials'' hospitality', 'Confirms assignor and two officials per game; officials'' check-in, hospitality, incident escalation, assignment and payment reconciliation.', '', '', 'Assignor contact:'),
  (90,  'Team Services Lead (Check-In / Coach Services)', '2', '6:15 AM', 'Ch 1', 'Team check-in', 'Checks team, division, coach contact and requirements; hands out schedule, map, rules, emergency info, parking and locker-room assignment.', '', '', 'Check-in location:'),
  (100, 'Locker Room / Team Services', '2', '6:00 AM', 'Ch 1', 'Locker rooms', 'Opens and labels approved team spaces; monitors access, cleanliness, turnover and Lost & Found.', '', '', ''),
  (110, 'Vendor Coordinator', '1', '6:00 AM', 'Ch 1', 'Vendor area', 'Vendor load-in, placement, permits/documents, power and access, trash, safety and breakdown.', '', '', 'Vendor map:'),
  (120, 'Parking / Traffic Lead', '1 lead + 3–4 attendants', '6:15 AM', 'Ch 1', 'Main entrance / parking', 'Signs and cones; team/vendor/spectator directions; pedestrian conflict points; overflow plan; keeps emergency and ADA access clear.', '', '', 'Overflow plan:'),
  (130, 'Athletic Trainer / Medical', 'At least 1 qualified provider', 'Before warm-up', 'Ch 1 / direct call', 'Designated medical area', 'Medical area and response plan; player care, emergency access and return-to-play decisions within scope and event rules.', '', '', 'Medical location:'),
  (140, 'Facility / Field Support', '2–3', '5:45 AM', 'Ch 1', 'Fields & facility', 'Goals/nets, benches, field supplies, trash, restrooms, field hazards, equipment collection and facility sweep.', '', '', ''),
  (150, 'Hospitality / Runner Lead', '2', '6:15 AM', 'Ch 1', 'Officials'' hospitality', 'Referee refreshments/meals, water and ice restock, urgent supply runs and break coverage.', '', '', ''),
  (160, 'Volunteer Lead', '1', '6:15 AM', 'Ch 1', 'Team check-in', 'Volunteer roster, briefing, post assignments, breaks, attendance and redeployment.', '', '', ''),
  (170, 'Communications / Social Media', '1–2', '7:00 AM', '', 'Command', 'Approved schedule updates, scores, standings, vendor features, photography coordination and final recognition.', '', '', ''),
  (180, 'School / Facility Representative', '1', '', 'Ch 1 / phone', 'Facility', 'Facility access, emergency plan, AED and shelter locations, final walkthrough.', '', '', 'Facility emergency plan:'),
  (190, 'Referees', '2 per game (60 assignments)', 'Per assignor schedule', '', 'Fields', 'Officiate games, manage on-field rules and game safety, confirm final score with scorekeeper and field lead.', '', '', '')
) AS v(sort, role, quantity, report_time, radio, post, scope, assignee, phone, notes)
WHERE NOT EXISTS (SELECT 1 FROM staff_roles);

-- Opening, midday and closing checklists (operations manual §4, §14, §15).
INSERT INTO checklist_items (list, sort, item)
SELECT v.* FROM (VALUES
  ('opening', 1,  'Facility access confirmed; command and check-in locations established.'),
  ('opening', 2,  'Emergency vehicle access, fire lanes and accessible routes are open and unobstructed.'),
  ('opening', 3,  'AED locations, emergency address, ambulance access point and shelter/assembly areas confirmed with facility representative.'),
  ('opening', 4,  'Athletic trainer present and medical area identified; medical response and communication plan confirmed.'),
  ('opening', 5,  'Both fields inspected; goals/nets secure; surfaces free of hazards; benches and team/spectator boundaries set.'),
  ('opening', 6,  'Restrooms and approved locker/team areas open, clean, signed and supplied.'),
  ('opening', 7,  'Coach check-in station has final schedule, site map, rules, emergency details, parking information and contact sheet.'),
  ('opening', 8,  'Officials'' hospitality area has water, food/snacks, seating, schedule and field map.'),
  ('opening', 9,  'Vendor spaces marked; permits/documents checked as applicable; power and pedestrian access safe.'),
  ('opening', 10, 'Parking signs/cones installed; accessible parking/routes and emergency access protected.'),
  ('opening', 11, 'Trash/recycling bins placed; radios distributed and radio check completed.'),
  ('opening', 12, 'Weather status and suspension protocol reviewed; all staff/volunteer assignments and breaks confirmed.'),
  ('midday', 1,  'Both fields remain safe and playable; goals/nets secure.'),
  ('midday', 2,  'Team/spectator boundaries and medical access clear.'),
  ('midday', 3,  'Restrooms and locker rooms clean, supplied and free of hazards.'),
  ('midday', 4,  'Officials'' hospitality restocked; next crews confirmed.'),
  ('midday', 5,  'Vendor area clean; pedestrian paths and emergency access open.'),
  ('midday', 6,  'Parking signs remain visible; accessible routes and fire lanes clear.'),
  ('midday', 7,  'Trash/recycling emptied as needed.'),
  ('midday', 8,  'Water/ice, balls, score sheets and radio batteries restocked.'),
  ('midday', 9,  'All team scores entered; no missing or inconsistent results.'),
  ('midday', 10, 'Volunteer breaks covered; no post left unattended.'),
  ('midday', 11, 'Weather/safety status reviewed; delays and unresolved issues assigned to an owner.'),
  ('closing', 1,  'All games completed or formally dispositioned under the published rules.'),
  ('closing', 2,  'All scores entered and standings independently checked; Event Director approves public result.'),
  ('closing', 3,  'Officials released only after assignments and paperwork are reconciled.'),
  ('closing', 4,  'Vendors have broken down, removed materials and cleared assigned spaces.'),
  ('closing', 5,  'Both fields, benches, sidelines, locker rooms, restrooms, referee area and spectator areas inspected.'),
  ('closing', 6,  'Goals/nets and reusable equipment secured; radios, clipboards, signs and supplies collected.'),
  ('closing', 7,  'Trash/recycling completed; parking and pedestrian areas swept.'),
  ('closing', 8,  'Lost & Found inventoried and secured.'),
  ('closing', 9,  'Incident reports and outstanding facility/vendor issues documented.'),
  ('closing', 10, 'Facility representative receives final status; doors/access returned per facility direction.'),
  ('closing', 11, 'Payments/receipts and volunteer hours reconciled; 15-minute staff debrief completed.')
) AS v(list, sort, item)
WHERE NOT EXISTS (SELECT 1 FROM checklist_items);

-- Event debrief prompts (operations manual §17).
INSERT INTO debrief_notes (sort, prompt)
SELECT v.* FROM (VALUES
  (1, 'What went well?'),
  (2, 'What caused delays or confusion?'),
  (3, 'Any medical, safety or security incidents?'),
  (4, 'Referee / coach / team feedback'),
  (5, 'Vendor, parking or facility issues'),
  (6, 'Budget / payment items still open'),
  (7, 'Top improvements for next year')
) AS v(sort, prompt)
WHERE NOT EXISTS (SELECT 1 FROM debrief_notes);

-- Pre-event deliverables (staffing scope §9) and open items (§10). Added once each, by title.
INSERT INTO tasks (title, owner_id, due_date, notes)
SELECT v.title, o.id, v.due::date, v.notes FROM (VALUES
  ('Confirm field availability and event authorization with Canyon HS', 'Lydie', '2027-02-11', '30 days out · Event Director'),
  ('Confirm insurance and permits', 'Lydie', '2027-02-11', '30 days out · Event Director'),
  ('Confirm officials assignor: 60 assignments, report times, fees, weather and replacement policy', NULL, '2027-02-11', '30 days out · Referee Coordinator. Get it in writing.'),
  ('Confirm athletic trainer / medical coverage for the full event window', NULL, '2027-02-11', '30 days out'),
  ('Confirm vendor roster', NULL, '2027-02-11', '30 days out · Vendor Coordinator'),
  ('Confirm parking plan and overflow parking with the facility', NULL, '2027-02-11', '30 days out · Parking Lead'),
  ('Freeze the schedule framework and publish rules', 'Lydie', '2027-02-27', '14 days out · Event Director approves'),
  ('Confirm coach contacts and team counts', NULL, '2027-02-27', '14 days out · Team Services'),
  ('Send vendor load-in instructions', NULL, '2027-02-27', '14 days out · Vendor Coordinator'),
  ('Complete emergency site plan with facility staff (address, ambulance access, AEDs, shelter)', 'Lydie', '2027-02-27', '14 days out. Enter the details on Settings so they show on the Day-of page.'),
  ('Confirm all staff and volunteer names and phone numbers', NULL, '2027-03-06', '7 days out. Fill in names on the Staffing page.'),
  ('Confirm radios, supplies, and who is monitoring weather', NULL, '2027-03-06', '7 days out · Operations Lead'),
  ('Confirm the current game schedule', NULL, '2027-03-06', '7 days out · Standings / Schedule Lead'),
  ('Distribute final coach packet and staff manual', NULL, '2027-03-08', 'Event week · Team Services'),
  ('Confirm game timing and standings rules with the officials assignor', NULL, '2027-03-08', 'Event week · Referee Coordinator'),
  ('Confirm emergency locations and access', 'Lydie', '2027-03-08', 'Event week · Event Director with facility representative'),
  ('Decide pool naming: Varsity/JV or D2/D3, and use it everywhere', 'Lydie', NULL, 'Open item. Must be confirmed in writing before registration closes.'),
  ('Confirm field names, site map, accessible routes, locker rooms, check-in location, vendor map and overflow parking with the facility', NULL, NULL, 'Open item'),
  ('Confirm game rules: 40-min running clock, halftime, overtime/ties, substitutions, rosters and tie-breakers', NULL, NULL, 'Open item · with officials assignor and applicable authority'),
  ('Assign names and mobile numbers to every lead role', NULL, NULL, 'Open item. See the Staffing page.'),
  ('Decide champion recognition and any awards', NULL, NULL, 'Open item. Current format is standings only, no championship game.')
) AS v(title, owner_name, due, notes)
LEFT JOIN organizers o ON o.name = v.owner_name
WHERE NOT EXISTS (SELECT 1 FROM tasks t WHERE t.title = v.title);
