# Battle on Imperial: Tournament Organizer

Volunteer and event management for the 3/13 lacrosse tournament. Built with Next.js, runs on Vercel, stores data in Neon Postgres.

## What's in it

**Volunteer sign-up page (`/`, public).** Volunteering is optional. Parents and siblings of players, high school students earning volunteer hours, and other community volunteers say who they are, enter their contact info, and pick one or more shifts. The page shows the location, what volunteers need to know (report times, briefing, privacy, no medical care beyond training) and the public contact info. Students also give their school and grade. Full shifts can't be picked. If someone signs up again with the same email, the new shifts go on their existing record.

**Organizer area (`/admin`, needs the team password):**

| Page | What it's for |
|---|---|
| Dashboard | Days to go, % of shift slots filled, volunteers by type, eateries booked, money raised, shifts short on people, open tasks, lead roles assigned |
| Day-of | The operations manual for tournament day: emergency info, command contact sheet, master timeline (highlights the current step on event day), radio plan and standard calls, checkable opening/midday/closing checklists, per-game field checklist, volunteer posts with links to rosters, all procedures (field, check-in, officials, scoring, locker rooms, vendors, parking, medical/weather/evacuation, delays, decision rights) and a debrief form. Prints as a manual. |
| Staffing | Lead roles from the staffing scope: assign people and phone numbers (this feeds the Day-of contact sheet), compare the volunteer deployment matrix with posted shifts, event priorities and equipment owners. |
| Shifts | Add and edit shifts by post (parking, check-in, field runners…), set how many people each needs, assign an organizer lead. Each shift has a roster page with check-in, add/remove people, and print. |
| Volunteers | Everyone who signed up. Filter by parents & siblings, high school students, students whose hours still need signing off, and people without a shift. Student hours come from the shifts they're checked in on, and you can mark their hours signed off. Download a CSV with hours. |
| Eateries | Street-team tracker for give-back days: status, which organizer owns it, contact, estimated and actual $ |
| Sponsors | Sponsors, vendor tents, food trucks (Manhattan Stitch Co is already in) |
| Tasks | Team to-dos with an owner and due date, including the 30/14/7-day and event-week deadlines and open items from the staffing scope |
| Team | Add, edit, or deactivate organizers |
| Settings | Event name, date, location, public contact info, emergency details (venue address, ambulance access, AEDs, medical area, shelter), sign-up page message, and a switch to open/close sign-ups |

Starter data comes from Lydie's kickoff message (organizers, eateries, Manhattan Stitch Co, first tasks) and her 2027 Event Operations Manual and Full Event Staffing & Scope of Work (shifts from the volunteer deployment matrix, lead roles, checklists, debrief prompts, deadlines). Reference text from the manual lives in `lib/ops-manual.ts`; anything filled in or checked off on the day is in the database. `db/seed-ops.sql` runs on every `npm run db:setup` and only fills in what's missing.

## Setup

### 1. Neon
1. Create a project at [neon.tech](https://neon.tech).
2. Copy the **pooled** connection string (Dashboard → Connect).

### 2. Local
```bash
npm install
cp .env.example .env.local     # then fill in the three values
npm run db:setup               # creates tables + starter data (safe to re-run)
npm run dev                    # http://localhost:3000
```

`.env.local` values:
- `DATABASE_URL`: the Neon connection string
- `ADMIN_PASSWORD`: the shared password organizers use at `/login`
- `SESSION_SECRET`: any long random string (`openssl rand -hex 32`)

### 3. Vercel
1. Push this folder to a GitHub repo and import it in Vercel. The defaults are fine.
2. Under Project → Settings → Environment Variables, add the same three variables.
   (Or use Vercel's Neon integration, which sets `DATABASE_URL` for you.)
3. Deploy. Give parents the root URL and give organizers `/admin`.

`npm run db:setup` only needs to run once against the production database. Run it from your machine with the production `DATABASE_URL` in `.env.local`.

## Notes
- All organizers share one password. Change `ADMIN_PASSWORD` in Vercel and redeploy to rotate it. Changing `SESSION_SECRET` signs everyone out.
- Schema is in `db/schema.sql`. Starter data is in `db/seed.sql`, which only loads when the organizers table is empty.
