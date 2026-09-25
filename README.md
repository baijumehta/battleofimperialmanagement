# Battle on Imperial: Tournament Organizer

Volunteer and event management for the 3/13 lacrosse tournament. Built with Next.js, runs on Vercel, stores data in Neon Postgres.

## What's in it

**Parent sign-up page (`/`, public).** Parents enter their info and pick one or more shifts, or choose the buy-out. Full shifts can't be picked. If a parent signs up again with the same email, the new shifts go on their existing record.

**Organizer area (`/admin`, needs the team password):**

| Page | What it's for |
|---|---|
| Dashboard | Days to go, % of shift slots filled, buy-outs, eateries booked, money raised, shifts short on people, open tasks |
| Shifts | Add and edit shifts by area (setup, concessions, swag tent…), set how many people each needs, assign an organizer lead. Each shift has a roster page with check-in, add/remove people, and print. |
| Volunteers | Everyone who signed up. Filter by who's on a shift, who chose the buy-out, whose buy-out is unpaid, and who hasn't picked anything. Mark buy-outs paid. Download a CSV. |
| Eateries | Street-team tracker for give-back days: status, which organizer owns it, contact, estimated and actual $ |
| Sponsors | Sponsors, vendor tents, food trucks (Manhattan Stitch Co is already in) |
| Tasks | Team to-dos with an owner and due date |
| Team | Add, edit, or deactivate organizers |
| Settings | Event name, date, location, buy-out amount, sign-up page message, and a switch to open/close sign-ups |

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
