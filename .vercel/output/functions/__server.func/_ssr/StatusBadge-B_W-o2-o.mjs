import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as STATUS_LABEL, l as cn } from "./appointments-api-Dz8aRK4k.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StatusBadge-B_W-o2-o.js
var import_jsx_runtime = require_jsx_runtime();
var STATUS_CLASS = {
	booked: "bg-status-booked-soft text-status-booked border-status-booked/30",
	done: "bg-status-done-soft text-status-done border-status-done/30",
	no_show: "bg-status-noshow-soft text-status-noshow border-status-noshow/30",
	cancelled: "bg-muted text-muted-foreground border-border"
};
function StatusBadge({ status, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", STATUS_CLASS[status], className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-current" }), STATUS_LABEL[status]]
	});
}
//#endregion
export { StatusBadge as n, STATUS_CLASS as t };
