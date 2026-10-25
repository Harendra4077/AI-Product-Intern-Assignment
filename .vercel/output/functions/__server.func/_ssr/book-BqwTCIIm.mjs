import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as ClientShell } from "./ClientShell-v85r9nEe.mjs";
import { _ as updateAppointment, a as WEEKDAYS, b as useNow, d as formatDateLong, g as toISODate, h as normalizePhone, l as cn, p as formatTime, r as SLOTS, s as availableSlots, t as Button, u as createAppointment, v as useAppointments, y as useMe } from "./appointments-api-Dz8aRK4k.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Route } from "./book-B9EoOum_.mjs";
import { t as Input } from "./input-Cn6lbiEq.mjs";
import { t as Label } from "./label-DGboPD0T.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/book-BqwTCIIm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Book() {
	const { reschedule } = Route.useSearch();
	const navigate = useNavigate();
	const { me, setMe } = useMe();
	const { data = [] } = useAppointments();
	const now = useNow();
	const original = reschedule ? data.find((a) => a.id === reschedule) : void 0;
	const days = (0, import_react.useMemo)(() => {
		const out = [];
		const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		for (let i = 0; i < 14; i++) out.push(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i));
		return out;
	}, [now.toDateString()]);
	const [date, setDate] = (0, import_react.useState)(toISODate(now));
	const [time, setTime] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (me) {
			setName(me.name);
			setPhone(me.phone);
		}
	}, [me]);
	const free = availableSlots(date, data, now, reschedule);
	(0, import_react.useEffect)(() => {
		if (time && !free.includes(time)) setTime(null);
	}, [free.join(","), time]);
	const submit = async () => {
		if (!time) {
			toast.error("Choose a time slot");
			return;
		}
		setBusy(true);
		try {
			if (original) {
				await updateAppointment(original.id, {
					appt_date: date,
					appt_time: time,
					confirmed_at: null
				});
				toast.success(`Moved to ${formatDateLong(date)}, ${formatTime(time)}`);
			} else {
				const p = normalizePhone(phone);
				if (name.trim().length < 2) throw new Error("Please enter your name");
				if (!p) throw new Error("Enter a valid 10-digit mobile number");
				await createAppointment({
					client_name: name.trim(),
					phone: p,
					appt_date: date,
					appt_time: time,
					source: "client"
				});
				setMe({
					name: name.trim(),
					phone: p
				});
				toast.success("You're booked! 🌿");
			}
			navigate({ to: "/" });
		} catch (e) {
			toast.error(e.message);
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ClientShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-semibold",
			children: original ? "Pick a new time" : "Book a consultation"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-muted-foreground",
			children: original ? `Currently ${formatDateLong(original.appt_date)} at ${formatTime(original.appt_time)}.` : "30 minutes, in person or on call."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground",
			children: "Day"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-2",
			children: days.map((d) => {
				const iso = toISODate(d);
				const n = availableSlots(iso, data, now, reschedule).length;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setDate(iso),
					disabled: n === 0,
					className: cn("flex min-w-16 flex-col items-center rounded-2xl border px-3 py-3 transition", iso === date ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50", n === 0 && "opacity-40"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs",
							children: WEEKDAYS[d.getDay()]?.slice(0, 3)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-2xl font-semibold",
							children: d.getDate()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] opacity-75",
							children: n === 0 ? "full" : `${n} free`
						})
					]
				}, iso);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "mt-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground",
			children: ["Time · ", formatDateLong(date)]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4",
			children: SLOTS.map((s) => {
				const ok = free.includes(s);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					disabled: !ok,
					onClick: () => setTime(s),
					className: cn("rounded-xl border py-2.5 text-sm font-medium transition", time === s ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50", !ok && "cursor-not-allowed bg-muted text-muted-foreground line-through opacity-50"),
					children: formatTime(s)
				}, s);
			})
		}),
		!original && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid gap-4 rounded-3xl border bg-card p-5 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "name",
					children: "Your name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "name",
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "Riya Shah"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "phone",
					children: "Mobile (WhatsApp)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "phone",
					value: phone,
					onChange: (e) => setPhone(e.target.value),
					placeholder: "98200 11111",
					inputMode: "tel"
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: submit,
			disabled: busy || !time,
			size: "lg",
			className: "mt-6 w-full rounded-full",
			children: time ? `${original ? "Move to" : "Book"} ${formatTime(time)}, ${formatDateLong(date)}` : "Choose a time"
		})
	] });
}
//#endregion
export { Book as component };
