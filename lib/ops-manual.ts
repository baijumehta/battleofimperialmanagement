// Reference content from Lydie's "Battle on Imperial Event Operations Manual 2027" and
// "Full Event Staffing & Scope of Work (UPDATED 2027)". Anything people fill in or check off
// on the day (contacts, checklists, debrief) lives in the database instead.

export const BASELINE = [
  ["Teams", "20 (10 Varsity, 10 JV)"],
  ["Games", "30 · 3 per team"],
  ["Fields", "2 · Field 1 Varsity, Field 2 JV"],
  ["Game slot", "40-min running clock + 5-min transition"],
  ["First whistle", "8:00 AM"],
  ["Last game", "Starts 6:30 PM, ends ~7:10 PM"],
  ["Officials", "2 per game · 60 assignments"],
  ["Format", "Pool / standings, no championship game"],
] as const;

export const BASELINE_NOTES = [
  "Team counts assume 10 Varsity and 10 JV pending final pool confirmation (Varsity/JV vs D2/D3 is still an open item).",
  "The earlier 6:00 PM finish can't fit 30 games on two fields with 45-minute slots. The adopted plan (Option 1) extends the final whistle to about 7:10 PM.",
];

// [minutes after midnight for "now" highlighting, label, action]
export const TIMELINE: [number | null, string, string][] = [
  [330, "5:30 AM", "Event Director and Operations Lead arrive; open command area, verify access, radios, emergency contacts, schedule and weather."],
  [345, "5:45 AM", "Field Coordinators and Facility Support arrive; inspect fields, goals/nets, benches, paths, locker rooms, restrooms, parking and vendor zone."],
  [360, "6:00 AM", "Setup begins: field stations, signs, check-in, officials' area, vendor spaces, trash stations, locker-room signs."],
  [375, "6:15 AM", "Team Services, Referee Coordinator, Parking Lead and Vendor Coordinator report; vendor load-in and parking deployment."],
  [390, "6:30 AM", "Scorekeepers and volunteers report; check-in and officials' hospitality ready."],
  [400, "6:40 AM", "Functional leads report GREEN / YELLOW / RED to Operations. Resolve all RED issues before opening play."],
  [405, "6:45 AM", "Mandatory staff/volunteer briefing: radio check, assignments, emergency actions and schedule review."],
  [420, "7:00 AM", "Team check-in fully staffed; first-wave team arrival and wayfinding."],
  [470, "7:50 AM", "Field Coordinators confirm first game: teams, officials, scorekeeper, balls, safe field and timing method."],
  [480, "8:00 AM", "First whistle."],
  [630, "10:30 AM", "First high-traffic audit: parking, restrooms, locker rooms, vendor area, field readiness and supplies."],
  [720, "Midday", "Full facility/field audit between game blocks (Midday checklist). Verify volunteer breaks and officials' hospitality."],
  [1110, "6:30 PM", "Final scheduled games begin."],
  [1150, "~7:10 PM", "Final games end; final score/standings verification and controlled breakdown begin (Closing checklist)."],
  [1170, "After final whistle", "Vendor breakdown, facility sweep, equipment/radio return, incidents and Lost & Found reconciliation, payment records and staff debrief."],
];

export const RADIO_CHANNELS = [
  ["1 · COMMAND", "Major operations, safety, schedule changes, facility and lead coordination", "Event Director, Operations, functional leads, Medical"],
  ["2 · FIELD 1", "Field 1 game operations", "Field Coordinator 1, scorekeeper, assigned runner"],
  ["3 · FIELD 2", "Field 2 game operations", "Field Coordinator 2, scorekeeper, assigned runner"],
] as const;

export const RADIO_CALLS = [
  ["How to start a call", "Recipient, then your post: “Command, Field 1.”"],
  ["Routine", "“Command, Field 1. Game 4 final score is 8–6. Field is ready for the next teams.”"],
  ["Delay", "“Command, Field 2. Start delayed approximately five minutes due to late official. Teams are staged.”"],
  ["Emergency", "“EMERGENCY, EMERGENCY, EMERGENCY. Field 1. Medical response needed.” Then give the exact location and access point."],
] as const;

export const RADIO_RULES = [
  "During an emergency, all nonessential radio traffic stops.",
  "Call 911 when appropriate. Don't wait for radio approval.",
  "If radios fail, use the printed mobile contact list or send a runner. Never leave a field unstaffed.",
];

export const FIELD_CHECKLIST = [
  "Correct teams / division / game number",
  "Two officials present",
  "Scorekeeper present with current schedule",
  "Goals, nets, anchors and playing surface safe",
  "Game balls and backup balls ready",
  "Benches, spectator boundaries and medical access clear",
  "Next teams and warm-up area identified",
  "Field status reported GREEN to Operations",
];

export const DECISION_RIGHTS = [
  ["Immediate field safety stop", "Officials / Field Coordinator / Medical", "Stop or hold activity as needed; notify Operations immediately."],
  ["Medical treatment / return to play", "Athletic Trainer / emergency medical personnel", "Clinical judgment stays with qualified medical personnel; event staff support access and communication."],
  ["Routine operational issue", "Relevant functional lead", "Resolve within role; elevate unresolved or recurring issues to Operations."],
  ["Schedule / field assignment change", "Event Director or Operations Lead", "Notify both fields, officials, coaches and scorekeepers; record the change and time."],
  ["Weather suspension / resumption", "Event Director, with facility and medical/officials", "Use the written venue/event protocol; no restart until the designated authority clears it."],
  ["Evacuation / shelter-in-place", "Emergency responders and facility command", "Event Director coordinates event messaging; follow venue plan and police/fire instructions."],
  ["Public statement / social post on an incident", "Event Director or designated communications lead", "Verified facts only; protect student/minor privacy."],
] as const;

export type Procedure = {
  id: string;
  title: string;
  items?: string[];
  table?: { head: string[]; rows: string[][] };
  sub?: { title: string; items: string[] }[];
};

export const PROCEDURES: Procedure[] = [
  {
    id: "principles",
    title: "Command principles",
    items: [
      "Safety first. No schedule, score, vendor or financial objective takes priority over safety.",
      "One chain of command: Event Director → Operations Lead → functional leads / Field Coordinators → volunteers.",
      "Field Coordinators may hold a field immediately for a hazard or urgent safety concern, then notify Operations.",
      "Only the Event Director / Operations Lead issues schedule changes affecting other games or fields.",
      "Medical and return-to-play decisions belong to qualified medical personnel and applicable rules.",
      "Use plain language on the radio. Emergency traffic takes priority.",
      "Every issue has an owner. Resolve it at the lowest appropriate level or escalate immediately.",
      "Protect student/minor privacy. Don't publish injury details, personal contact information or unverified reports.",
    ],
  },
  {
    id: "field",
    title: "Field opening & game-to-game procedure",
    table: {
      head: ["When", "Field Coordinator action"],
      rows: [
        ["Before first game", "Check surface, goals/nets/anchors, lines, benches, boundaries, game balls, score station, medical route, signs and radio."],
        ["10 min before start", "Confirm both teams present, two officials present, scorekeeper ready, balls ready, and the next game is the correct matchup."],
        ["5 min before start", "Clear previous teams, stage next teams, confirm officials are ready, keep spectators outside team/official areas."],
        ["At scheduled start", "Confirm whistle/start; record actual start time if delayed; alert Operations to any schedule impact."],
        ["During game", "Monitor perimeter, hazards, crowd behavior, access routes and timing. Officials control on-field play."],
        ["At final whistle", "Confirm score with official and scorekeeper; submit result immediately; record cards/penalties if required."],
        ["0–2 min after game", "Move teams off the playing area without crossing active play; stage next teams and officials."],
        ["By end of 5-min transition", "Field and score station ready for the next scheduled game."],
        ["If delayed / unsafe", "Notify Operations promptly. Don't shorten games or shift other games yourself. Hold the field as needed for safety."],
      ],
    },
  },
  {
    id: "checkin",
    title: "Team check-in & coach services",
    items: [
      "Welcome the coach; verify team/school name, category/pool, registration status and coach mobile number.",
      "Confirm any roster, waiver, eligibility or consent items required by the final event rules. Don't invent requirements on site.",
      "Hand out the coach packet: final schedule, field map, game format, standings/tie-breakers, emergency contacts, parking/overflow instructions, locker-room assignment and tournament contact.",
      "Confirm three scheduled game slots and explain where schedule updates will be posted.",
      "Record team arrival; direct players to their locker/team space, warm-up area and first field.",
      "If a team or coach is late, notify Operations and the Field Coordinator immediately. Don't promise a schedule change.",
      "Route rules disputes to the officials / Referee Coordinator and tournament-policy disputes to Operations.",
    ],
  },
  {
    id: "officials",
    title: "Officials check-in & hospitality",
    items: [
      "Referee Coordinator confirms assignor contact, arrival times, game-by-game crew assignments, payment arrangement and backup coverage.",
      "Check in officials; give them the schedule, field map, rules, game timing, emergency information and coordinator contact.",
      "Provide an officials-only rest area with seating, drinking water, food/snacks and secure bag space.",
      "Confirm two officials for every game before the field is released to start.",
      "If an official is late or absent, contact the Referee Coordinator and Operations immediately. Don't start with an incomplete crew unless the applicable authority expressly approves.",
      "Track completed assignments, late changes, incidents and payment records for reconciliation.",
    ],
  },
  {
    id: "scoring",
    title: "Scoring, standings & winner recognition",
    items: [
      "Each field has one scorekeeper. The official / Field Coordinator confirms the final score before it's submitted.",
      "Standings Lead enters each result promptly and cross-checks team names, scores and game count.",
      "Proposed points: win 3, tie 1, loss 0. Publish only after the final rules are confirmed.",
      "Proposed tie-breakers: head-to-head; goal differential capped at +8 per game; fewest goals allowed; most goals scored; coin toss or another pre-published rule.",
      "Three-game pool format: no additional championship game in the current 30-game schedule.",
      "Event Director reviews and approves final standings before public posting or recognition.",
      "Correct score errors through the designated process; keep the original score sheet and record the correction.",
    ],
  },
  {
    id: "lockers",
    title: "Locker rooms & facility services",
    items: [
      "Use only facility-approved locker rooms/team spaces; assignments are prepared ahead and included in coach packets.",
      "Post TEAM / COACH ONLY signage where appropriate; no spectator access to team-only areas.",
      "Inspect each space before opening, during the day and at closing; record damage, maintenance or cleanliness concerns.",
      "Keep routes between team spaces, warm-up areas and fields clear.",
      "Provide trash liners and basic supplies; tell Facility Support about spills, broken fixtures or hazards immediately.",
      "One central Lost & Found at Team Check-In. Log items and protect personal information.",
    ],
  },
  {
    id: "vendors",
    title: "Vendor check-in & operations",
    table: {
      head: ["Stage", "Vendor Coordinator action"],
      rows: [
        ["Before event", "Confirm vendor type, fee/payment status, space, footprint, tent/table/chair needs, power, arrival time, contact, and permit/insurance/fire requirements."],
        ["Load-in", "Check vendor in; direct to approved route and space; vehicles leave pedestrian and emergency routes after unloading."],
        ["Safety", "Keep fire lanes, accessible routes, field exits, locker-room entrances and emergency access clear; fix unsafe cords/power immediately."],
        ["During event", "Monitor pedestrian flow, cleanliness, trash, power issues and queues; escalate complaints or compliance concerns."],
        ["Breakdown", "Staggered exits; no vehicles in crowded pedestrian areas; inspect space for trash/damage."],
        ["Closeout", "Record departure and any unresolved issue, damage or payment/documentation follow-up."],
      ],
    },
  },
  {
    id: "parking",
    title: "Parking & traffic",
    items: [
      "Use the facility-approved parking map; team, spectator, official, vendor and staff areas only where permitted.",
      "Post directional signs at the main entrance and key decision points; wear high-visibility vests and carry radios.",
      "Finish vendor load-in during the approved window; move vehicles to approved parking before peak pedestrian movement.",
      "Keep fire lanes, emergency vehicle access, accessible parking and accessible pedestrian routes clear at all times.",
      "Put attendants at the highest-conflict vehicle/pedestrian spots during morning arrival and closing.",
      "Use the prewritten overflow parking message/map. Never send guests to unapproved private lots or streets.",
      "Route parking disputes to the Parking Lead; tell Operations about blocked access or safety conflicts immediately.",
    ],
  },
  {
    id: "emergency",
    title: "Medical, safety & emergency procedures",
    sub: [
      {
        title: "Serious injury / medical emergency",
        items: [
          "Call 911 when warranted; give the exact field/location and the best ambulance access point.",
          "Alert the Athletic Trainer and Command. Officials stop play as appropriate; keep players and spectators back and protect the responder route.",
          "Don't move an injured person unless there's immediate danger or responders direct it.",
          "Only qualified medical personnel provide treatment. Event staff support access, crowd control and coach/family communication.",
          "Document time, location, responders and actions through the incident-report process; protect medical privacy.",
        ],
      },
      {
        title: "Lightning / severe weather / unsafe field",
        items: [
          "Follow the written weather protocol agreed with the facility and tournament authority (suspension criteria, shelter locations, all-clear authority).",
          "On a suspension call, Field Coordinators stop play and send teams/spectators to the designated shelter; Operations communicates the instruction.",
          "Don't resume until the designated authority gives the all-clear. Record suspension/resumption times and notify coaches/officials.",
          "Unsafe field: stop using it, isolate the hazard, notify Operations, reopen only after inspection/clearance.",
        ],
      },
      {
        title: "Fire / evacuation / shelter-in-place / security threat",
        items: [
          "Follow facility emergency plans and instructions from police, fire and other responders.",
          "Use designated routes and assembly/shelter locations; keep emergency access clear; don't re-enter until authorized.",
          "For an active threat or security event, no speculation or unverified details on the radio. Follow law enforcement/facility direction.",
          "Event Director or designee issues concise, verified event-wide instructions when safe to do so.",
        ],
      },
      {
        title: "Lost child / vulnerable person",
        items: [
          "Notify Command immediately; get a factual description, last known location and the reporting adult's contact.",
          "Coordinate staff at approved entrances/exits without creating unsafe crowd movement; follow facility and law-enforcement guidance.",
          "Don't broadcast sensitive personal information over open channels or social media. Verify and document reunification.",
        ],
      },
    ],
  },
  {
    id: "delays",
    title: "Delay & schedule recovery",
    items: [
      "Field Coordinator reports the cause, affected game, estimated delay and whether field safety is affected.",
      "Operations assesses impact on both fields and consults the Event Director and officials as needed.",
      "Don't shorten games, remove the transition, change pool opponents or reassign teams without authorized approval consistent with published rules.",
      "Protect the unaffected field from unnecessary cascading changes.",
      "Tell affected coaches, officials, scorekeepers and field staff first, then other teams and public channels.",
      "Record original slot, actual start/end, who authorized the change, affected teams and communication time.",
      "If the schedule can't be recovered, the Event Director communicates the revised guarantee/outcome policy under the published rules. No ad hoc promises.",
    ],
  },
];

// Volunteer Deployment Matrix (staffing scope §5). `area` matches the shift area names.
export const VOLUNTEER_MATRIX = [
  { area: "Parking & traffic", suggested: "3–4", notes: "Peak arrivals and departure; rotate breaks; pedestrian safety." },
  { area: "Team check-in", suggested: "2", notes: "Coach packets, roster/status checklist, directions, questions." },
  { area: "Field runners", suggested: "2", notes: "One per field; balls, forms, supplies and messages." },
  { area: "Scorekeeping support", suggested: "2", notes: "Support the two scorekeepers and standings verification." },
  { area: "Locker rooms & wayfinding", suggested: "2", notes: "Direct teams; monitor approved access and cleanliness." },
  { area: "Vendor support", suggested: "1–2", notes: "Vendor check-in, load-in, trash and supply needs." },
  { area: "Hospitality", suggested: "2", notes: "Referee refreshments, ice/water, supply runs." },
  { area: "Facility & trash", suggested: "2", notes: "Restrooms, spectator areas, bins, benches, field perimeter." },
  { area: "Floaters", suggested: "2", notes: "Cover breaks and unexpected queues; assigned by Volunteer Lead." },
];

export const EQUIPMENT = [
  ["Goals, nets, anchors, field lines, benches", "Facility / Field Support + Field Coordinator", "Inspect before opening and after any impact or field concern."],
  ["Game balls / backup balls", "Field Coordinator / Referee Coordinator", "Enough approved balls at both fields; restock between games."],
  ["Score sheets, pens, clipboards, timing method", "Scorekeepers / Standings Lead", "One station per field plus spares."],
  ["Radios, chargers, backup phone list", "Operations Lead", "Radio check; channels and call signs briefed; phones as backup."],
  ["Signs, cones, high-visibility vests", "Parking Lead / Facility Support", "Entrances, fields, parking, accessible routes, vendor zone, locker rooms."],
  ["First aid, AED locations, emergency map", "Athletic Trainer / Facility Representative", "Verify exact location/access; post venue address and field access details."],
  ["Water, ice, referee hospitality", "Hospitality Lead / Referee Coordinator", "Restock; track dietary/meal arrangements where provided."],
  ["Trash/recycling bags, cleaning supplies", "Facility Support", "Check high-traffic areas midday and after close."],
  ["Coach packets, field map, rules", "Team Services", "Current version only; include contact and emergency information."],
] as const;

export const PRIORITIES = [
  "Player, spectator, staff, volunteer and official safety takes priority over schedule or revenue.",
  "Keep both fields on the approved 45-minute grid; only the Event Director / Operations Lead approves schedule changes.",
  "Every team gets three scheduled games; track completion and exceptions on the master schedule.",
  "Clear wayfinding, clean restrooms/locker rooms, accessible routes and prompt coach support.",
  "Medical and emergency vehicle access stays clear at all times.",
  "A professional officials' experience, organized vendor operations and accurate scores/standings.",
  "One chain of command and plain-language radio; document significant decisions and incidents.",
];

export const VOLUNTEER_RULES = [
  "Morning shifts report at 6:30 AM for the mandatory 6:45 AM briefing. Afternoon shifts check in with the Volunteer Lead at team check-in.",
  "Stay at your assigned post. If you need a break or relief, ask the Volunteer Lead.",
  "Follow the chain of command and bring problems to your lead.",
  "Protect players' privacy. Don't post or share photos or information about players or incidents.",
  "Don't give medical care beyond your training. Get the athletic trainer, and call 911 in an emergency.",
];
