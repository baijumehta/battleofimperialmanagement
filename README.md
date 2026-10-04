# Battle on Imperial: Tournament Organizer

Volunteer and event management for the 3/13 lacrosse tournament. Built with Next.js, runs on Vercel, stores data in Neon Postgres.

## What's in it

**Volunteer sign-up page (`/`, public).** Volunteering is optional. Parents and siblings of players, high school students earning volunteer hours, and other community volunteers say who they are, enter their contact info, and pick one or more shifts. Students also give their school and grade. Full shifts can't be picked. If someone signs up again with the same email, the new shifts go on their existing record.

**Organizer area (`/admin`, needs the team password):**

| Page | What it's for |
|---|---|
| Dashboard | Days to go, % of shift slots filled, volunteers by type, eateries booked, money raised, shifts short on people, open tasks |
| Shifts | Add and edit shifts by area (setup, concessions, swag tent…), set how many people each needs, assign an organizer lead. Each shift has a roster page with check-in, add/remove people, and print. |
| Volunteers | Everyone who signed up. Filter by parents & siblings, high school students, students whose hours still need signing off, and people without a shift. Student hours come from the shifts they're checked in on, and you can mark their hours signed off. Download a CSV with hours. |
| Eateries | Street-team tracker for give-back days: status, which organizer owns it, contact, estimated and actual $ |
| Sponsors | Sponsors, vendor tents, food trucks (Manhattan Stitch Co is already in) |
| Tasks | Team to-dos with an owner and due date |
| Team | Add, edit, or deactivate organizers |
| Settings | Event name, date, location, sign-up page message, and a switch to open/close sign-ups |

Starter data comes from Lydie's kickoff message: the five organizers, the 12 eateries (Juice It Up already booked), Manhattan Stitch Co, a first set of tasks, and a **draft** shift plan you can edit or delete.

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
