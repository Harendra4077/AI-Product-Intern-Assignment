// Pure helpers shared by the client app and the nutritionist dashboard.

export type Status = "booked" | "done" | "no_show" | "cancelled";

export type Appointment = {
  id: string;
  client_name: string;
  phone: string | null;
  appt_date: string; // YYYY-MM-DD
  appt_time: string; // HH:MM[:SS]
  status: Status;
  confirmed_at: string | null;
  source: string;
  created_at: string;
};

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  done: "Done",
  no_show: "No-show",
  cancelled: "Cancelled",
};

export const DASHBOARD_STATUSES: Status[] = ["booked", "done", "no_show", "cancelled"];

/** Consultation slots: 30 minutes, 09:00 to 17:30. */
export const SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let h = 9; h < 18; h++) {
    for (const m of [0, 30]) out.push(`${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`);
  }
  return out;
})();

/** Normalise Indian phone numbers to 10 digits ("98200 11111", "+91 9820011111" -> "9820011111"). */
export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;
  let d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d.length === 10 ? d : null;
}

export function formatPhone(p: string | null): string {
  if (!p) return "—";
  return p.length === 10 ? `${p.slice(0, 5)} ${p.slice(5)}` : p;
}

export const hhmm = (t: string) => t.slice(0, 5);

export function formatTime(t: string): string {
  const [h = 0, m = 0] = hhmm(t).split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function apptDateTime(a: Pick<Appointment, "appt_date" | "appt_time">): Date {
  const [y = 0, mo = 1, d = 1] = a.appt_date.split("-").map(Number);
  const [h = 0, mi = 0] = hhmm(a.appt_time).split(":").map(Number);
  return new Date(y, mo - 1, d, h, mi);
}

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatDateLong(iso: string): string {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${WEEKDAYS[dt.getDay()]}, ${d} ${MONTHS[m - 1]}`;
}

/** Slots still free on a date. A slot is taken by any non-cancelled appointment; past slots are hidden. */
export function availableSlots(
  date: string,
  appts: Pick<Appointment, "id" | "appt_date" | "appt_time" | "status">[],
  now: Date,
  ignoreId?: string,
): string[] {
  const taken = new Set(
    appts
      .filter((a) => a.appt_date === date && a.status !== "cancelled" && a.id !== ignoreId)
      .map((a) => hhmm(a.appt_time)),
  );
  return SLOTS.filter((s) => {
    if (taken.has(s)) return false;
    return apptDateTime({ appt_date: date, appt_time: s }) > now;
  });
}

/** Count past no-shows for a phone number (used to flag likely no-shows). */
export function noShowCount(appts: Appointment[], phone: string | null): number {
  if (!phone) return 0;
  return appts.filter((a) => a.phone === phone && a.status === "no_show").length;
}

/** WhatsApp reminder link the nutritionist can send in one tap. */
export function whatsappReminderLink(a: Appointment, confirmUrl: string): string | null {
  if (!a.phone) return null;
  const msg = `Hi ${a.client_name.split(" ")[0]}, a reminder of your nutrition consultation on ${formatDateLong(a.appt_date)} at ${formatTime(a.appt_time)}. Please tap to confirm you're coming, or reschedule if you can't make it: ${confirmUrl}`;
  return `https://wa.me/91${a.phone}?text=${encodeURIComponent(msg)}`;
}
