import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime, j as Slot } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-Bjze75_W.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/appointments-api-BHn2ctuq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var STATUS_LABEL = {
	booked: "Booked",
	done: "Done",
	no_show: "No-show",
	cancelled: "Cancelled"
};
var DASHBOARD_STATUSES = [
	"booked",
	"done",
	"no_show",
	"cancelled"
];
/** Consultation slots: 30 minutes, 09:00 to 17:30. */
var SLOTS = (() => {
	const out = [];
	for (let h = 9; h < 18; h++) for (const m of [0, 30]) out.push(`${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`);
	return out;
})();
/** Normalise Indian phone numbers to 10 digits ("98200 11111", "+91 9820011111" -> "9820011111"). */
function normalizePhone(input) {
	if (!input) return null;
	let d = input.replace(/\D/g, "");
	if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
	if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
	return d.length === 10 ? d : null;
}
function formatPhone(p) {
	if (!p) return "—";
	return p.length === 10 ? `${p.slice(0, 5)} ${p.slice(5)}` : p;
}
var hhmm = (t) => t.slice(0, 5);
function formatTime(t) {
	const [h = 0, m = 0] = hhmm(t).split(":").map(Number);
	const suffix = h >= 12 ? "pm" : "am";
	return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${suffix}`;
}
function toISODate(d) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function apptDateTime(a) {
	const [y = 0, mo = 1, d = 1] = a.appt_date.split("-").map(Number);
	const [h = 0, mi = 0] = hhmm(a.appt_time).split(":").map(Number);
	return new Date(y, mo - 1, d, h, mi);
}
var WEEKDAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday"
];
var MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];
function formatDateLong(iso) {
	const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
	return `${WEEKDAYS[new Date(y, m - 1, d).getDay()]}, ${d} ${MONTHS[m - 1]}`;
}
/** Slots still free on a date. A slot is taken by any non-cancelled appointment; past slots are hidden. */
function availableSlots(date, appts, now, ignoreId) {
	const taken = new Set(appts.filter((a) => a.appt_date === date && a.status !== "cancelled" && a.id !== ignoreId).map((a) => hhmm(a.appt_time)));
	return SLOTS.filter((s) => {
		if (taken.has(s)) return false;
		return apptDateTime({
			appt_date: date,
			appt_time: s
		}) > now;
	});
}
/** Count past no-shows for a phone number (used to flag likely no-shows). */
function noShowCount(appts, phone) {
	if (!phone) return 0;
	return appts.filter((a) => a.phone === phone && a.status === "no_show").length;
}
/** WhatsApp reminder link the nutritionist can send in one tap. */
function whatsappReminderLink(a, confirmUrl) {
	if (!a.phone) return null;
	const msg = `Hi ${a.client_name.split(" ")[0]}, a reminder of your nutrition consultation on ${formatDateLong(a.appt_date)} at ${formatTime(a.appt_time)}. Please tap to confirm you're coming, or reschedule if you can't make it: ${confirmUrl}`;
	return `https://wa.me/91${a.phone}?text=${encodeURIComponent(msg)}`;
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var KEY = ["appointments"];
async function fetchAll() {
	const { data, error } = await supabase.from("appointments").select("*").order("appt_date", { ascending: true }).order("appt_time", { ascending: true });
	if (error) throw error;
	return data;
}
/** All appointments, kept live across the client app and dashboard. */
function useAppointments() {
	const qc = useQueryClient();
	(0, import_react.useEffect)(() => {
		const ch = supabase.channel(`appts-${Math.random().toString(36).slice(2)}`).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "appointments"
		}, () => qc.invalidateQueries({ queryKey: KEY })).subscribe();
		return () => {
			supabase.removeChannel(ch);
		};
	}, [qc]);
	return useQuery({
		queryKey: KEY,
		queryFn: fetchAll
	});
}
function friendly(error) {
	if (error.code === "23505") return /* @__PURE__ */ new Error("Sorry, that slot was just taken. Please pick another time.");
	return new Error(error.message);
}
async function createAppointment(input) {
	const { data, error } = await supabase.from("appointments").insert(input).select().single();
	if (error) throw friendly(error);
	return data;
}
async function updateAppointment(id, patch) {
	const { error } = await supabase.from("appointments").update(patch).eq("id", id);
	if (error) throw friendly(error);
}
var ME_KEY = "kayro-me";
function useMe() {
	const [me, setMeState] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(ME_KEY);
			if (raw) setMeState(JSON.parse(raw));
		} catch {}
		setReady(true);
	}, []);
	const setMe = (m) => {
		if (m) localStorage.setItem(ME_KEY, JSON.stringify(m));
		else localStorage.removeItem(ME_KEY);
		setMeState(m);
	};
	return {
		me,
		setMe,
		ready
	};
}
function useNow(intervalMs = 6e4) {
	const [now, setNow] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => setNow(/* @__PURE__ */ new Date()), intervalMs);
		return () => clearInterval(t);
	}, [intervalMs]);
	return now;
}
//#endregion
export { updateAppointment as _, WEEKDAYS as a, useNow as b, buttonVariants as c, formatDateLong as d, formatPhone as f, toISODate as g, normalizePhone as h, STATUS_LABEL as i, cn as l, noShowCount as m, DASHBOARD_STATUSES as n, apptDateTime as o, formatTime as p, SLOTS as r, availableSlots as s, Button as t, createAppointment as u, useAppointments as v, whatsappReminderLink as x, useMe as y };
