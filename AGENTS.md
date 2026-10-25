## Project rules
- Client app (`/`, `/book`, `/appointments`) and nutritionist dashboard (`/dashboard`) read one `appointments` table with live updates, so both sides always show the same data.
- No login by design (assignment requires open access); clients are remembered on-device by normalised 10-digit phone.
- Double booking is prevented by a unique index on (date, time) for non-cancelled rows; the UI also hides taken slots.
- Pure booking rules live in `src/lib/appointments.ts` with tests next to it.
- Dashboard status options use the shared status list so every supported appointment state remains editable.
