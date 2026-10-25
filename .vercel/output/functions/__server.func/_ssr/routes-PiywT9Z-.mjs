import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { d as CircleCheck, g as CalendarCheck, h as CalendarPlus, l as Droplets, r as Salad, u as Clock } from "../_libs/lucide-react.mjs";
import { t as ClientShell } from "./ClientShell-v85r9nEe.mjs";
import { _ as updateAppointment, b as useNow, d as formatDateLong, h as normalizePhone, o as apptDateTime, p as formatTime, t as Button, v as useAppointments, y as useMe } from "./appointments-api-BHn2ctuq.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-B4Hiz6zU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-PiywT9Z-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function greeting(now) {
	const h = now.getHours();
	return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
function Home() {
	const { me, setMe, ready } = useMe();
	const { data = [] } = useAppointments();
	const now = useNow();
	const [phoneInput, setPhoneInput] = (0, import_react.useState)("");
	const next = (me ? data.filter((a) => a.phone === me.phone) : []).filter((a) => a.status === "booked" && apptDateTime(a) > now).sort((a, b) => +apptDateTime(a) - +apptDateTime(b))[0];
	const hoursAway = next ? (+apptDateTime(next) - +now) / 36e5 : 0;
	const findMe = () => {
		const p = normalizePhone(phoneInput);
		if (!p) {
			toast.error("Enter a 10-digit mobile number");
			return;
		}
		const match = data.find((a) => a.phone === p);
		if (!match) {
			toast.error("No bookings found for that number yet");
			return;
		}
		setMe({
			name: match.client_name,
			phone: p
		});
	};
	const confirm = async () => {
		if (!next) return;
		await updateAppointment(next.id, { confirmed_at: (/* @__PURE__ */ new Date()).toISOString() });
		toast.success("Thanks! Your nutritionist knows you're coming.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ClientShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted-foreground",
			children: [greeting(now), me ? "," : ""]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
			className: "mt-1 text-4xl font-semibold",
			children: [me ? me.name.split(" ")[0] : "Welcome", " 🌿"]
		}),
		ready && me && next && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-widest opacity-80",
					children: "Your next consultation"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 text-3xl font-semibold",
					children: formatDateLong(next.appt_date)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 flex items-center gap-2 text-lg opacity-90",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4" }),
						" ",
						formatTime(next.appt_time),
						" · 30 min"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 rounded-2xl bg-primary-foreground/10 p-4",
					children: next.confirmed_at ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5" }), " You've confirmed — see you then!"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm opacity-90",
						children: [hoursAway < 48 ? "It's coming up soon. " : "", "Let your nutritionist know you'll be there — or move it if plans changed."]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: confirm,
							variant: "secondary",
							className: "rounded-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCheck, {}), " I'll be there"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							className: "rounded-full hover:bg-primary-foreground/10 hover:text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/book",
								search: { reschedule: next.id },
								children: "Reschedule"
							})
						})]
					})] })
				})
			]
		}),
		ready && (!me || !next) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 rounded-3xl border bg-card p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-semibold",
					children: me ? "Nothing booked right now" : "Ready for your next step?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: "Pick a time that suits you — it takes under a minute."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "lg",
					className: "mt-5 rounded-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/book",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, {}), " Book a consultation"]
					})
				})
			]
		}),
		ready && !me && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4 rounded-3xl bg-muted p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-semibold",
					children: "Already booked?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Enter your mobile number to see your appointments."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: phoneInput,
						onChange: (e) => setPhoneInput(e.target.value),
						placeholder: "98200 11111",
						inputMode: "tel",
						className: "rounded-full bg-card"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: findMe,
						variant: "outline",
						className: "rounded-full",
						children: "Find me"
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8 grid gap-3 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				icon: Droplets,
				title: "Hydrate first",
				body: "A glass of water before each meal helps you notice real hunger."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				icon: Salad,
				title: "Half a plate of colour",
				body: "Fill half your plate with vegetables — simple and it adds up."
			})]
		}),
		me && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-10 text-center text-xs text-muted-foreground",
			children: [
				"Not ",
				me.name,
				"? ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "underline",
					onClick: () => setMe(null),
					children: "Switch"
				})
			]
		})
	] });
}
function Tip({ icon: Icon, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl border bg-card p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-10 place-items-center rounded-2xl bg-accent text-accent-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-3 text-lg font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: body
			})
		]
	});
}
//#endregion
export { Home as component };
