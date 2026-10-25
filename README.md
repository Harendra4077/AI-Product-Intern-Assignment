# Nourish — a two-sided appointments app for a wellness practice

Nourish is a two-sided appointments app for a wellness practice: a **client app** for booking and managing nutrition consultations, and a **nutritionist dashboard** for managing them day to day. Both sides read and write the same appointments table in one live database, so a booking made on the client side appears on the dashboard instantly (and vice versa) with no refresh or sync step. The product exists to solve one specific problem from the practice's intake notes — **no-shows** — with arrival confirmation, WhatsApp reminders, repeat-no-show flags and a live no-show rate.

## Features

### Client app (no login)
- **Next appointment at a glance** on the home page, with a time-until hint and a one-tap **"I'll be there"** confirmation.
- **Booking**: pick a day (next 7 days), see only genuinely free 30-minute slots between 09:00–17:30, then enter name + phone. Taken slots are hidden, and double booking is blocked at the database level, not just in the UI.
- **My visits**: upcoming appointments with **reschedule** (pick a new slot; the old one is freed) and **cancel** (with a gentle "rather move it?" prompt first).
- **Remembered on-device**: clients are identified by their normalised 10-digit phone number stored locally — no accounts, no passwords.

### Nutritionist dashboard (`/dashboard`)
- **Every appointment** in one list with client name, phone, date, time and a colour-coded status: Booked (blue), Done (green), No-show (orange), Cancelled (grey). Statuses are editable per row.
- **Add an appointment by hand** (walk-ins, phone bookings); the occupied slot immediately disappears from the client booking page.
- **No-show helpers**:
  - who has **not confirmed** their arrival yet (clients confirm via "I'll be there");
  - a one-tap **WhatsApp reminder** with a prefilled message for unconfirmed upcoming visits;
  - a **repeat no-show flag** for clients with prior no-shows;
  - the practice-wide **no-show rate** in the stats header.
- **Filters**: "Today only" and "Show cancelled", so the working list stays clean.
- **Added status — Cancelled**: cancellations free up the slot for other clients *without* erasing the visit from history (a plain delete would lose the record; keeping the row "Booked" would wrongly block the slot). Cancelled rows are hidden by default and excluded from the double-booking index.

## Live demo
- **Client app**: the home page (`/`) — greeting, next appointment, booking and My visits.
- **Nutritionist dashboard**: `/dashboard`.

## Tech stack
- **TanStack Start v1** (React 19, Vite, server functions) — full-stack framework and routing via TanStack Router.
- **Tailwind CSS v4** with a sage/cream theme and shadcn/ui components; Fraunces + Figtree typefaces.
- **Postgres via Supabase** for storage, with **realtime** broadcast so both sides stay in sync, and **row-level security** policies plus a partial unique index preventing double booking.
- **TanStack Query** for data fetching/cache invalidation on realtime events.
- **Vitest** for the pure booking-logic tests.

## Getting started
1. **Clone** the repo and install dependencies:
   ```bash
   git clone <repo-url> nourish
   cd nourish
   bun install   # or: npm install
   ```
2. **Environment variables** — create a `.env` in the project root:
   ```bash
   VITE_SUPABASE_URL=<your project url>
   VITE_SUPABASE_PUBLISHABLE_KEY=<your publishable (anon) key>
   VITE_SUPABASE_PROJECT_ID=<your project ref>
   ```
   (The server-side `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PROJECT_ID` counterparts are read inside server functions. Add them to your server environment as well.)
3. **Database schema** — all tables, policies and seed data live in SQL migration files under `drizzle/migrations/` (e.g. `0000_migration.sql` creates the `appointments` table, its RLS policies, the anti-double-booking unique index, the realtime publication and the five sample rows). Apply the migration SQL to your database.
4. **Run the dev server**:
   ```bash
   bun run dev    # or: npm run dev
   ```
   then open the printed localhost URL. The client app is at `/`, the dashboard at `/dashboard`.
5. **Tests** (pure booking logic — normalisation, slots, formatting, no-show counting):
   ```bash
   bunx vitest run   # or: npm test
   ```

## Sample data
Five sample appointments are **seeded** with the schema (they ship inside the migration `INSERT`), covering the practice's existing messy records. The source rows arrived in **three different date formats**, mixed phone formats (spaces, an extra digit, one client with no phone at all) and loose times like **"11:30am"** and **"4 pm"**. Everything was normalised on load: phones to bare 10 digits (so Riya Shah's two rows correctly match one client), dates to ISO `YYYY-MM-DD`, and times to 24-hour `HH:MM` (11:30am → `11:30`, 4 pm → `16:00`). Meera Iyer has no phone and shows as "No phone" in the UI.

| Client | Date | Time | Status |
|---|---|---|---|
| Riya Shah | 2026-10-24 | 10:00 | booked |
| Arjun Mehta | 2026-10-24 | 11:30 | booked |
| Riya Shah | 2026-10-25 | 16:00 | booked |
| Meera Iyer | 2026-10-23 | 09:00 | done |
| Kabir Rao | 2026-10-22 | 14:00 | no-show |

## Project structure
```
src/
  routes/            # One file per page: index (client home), book,
                     # appointments (My visits), dashboard, __root (shell + fonts)
  lib/
    appointments.ts      # Pure booking rules: slots, phone/date/time
                         # normalisation + formatting, no-show counting
    appointments.test.ts # Vitest tests for the above
    appointments-api.ts  # Data layer: TanStack Query hooks + Supabase
                         # mutations, realtime invalidation, local client identity
  components/        # StatusBadge, ClientShell (mobile nav), shadcn/ui primitives
  integrations/supabase/  # Generated clients (browser + server + admin)
  styles.css         # Sage/cream theme tokens, status colours, fonts
  start.ts           # Server-function middleware (auth bearer attachment)
  test/              # Vitest setup + routing tests
drizzle/migrations/  # SQL schema, RLS policies, double-booking index, seed rows
```
