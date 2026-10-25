import { _ as createFileRoute, g as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/book-B9EoOum_.js
var $$splitComponentImporter = () => import("./book-BqwTCIIm.mjs");
var Route = createFileRoute("/book")({
	validateSearch: (s) => typeof s["reschedule"] === "string" ? { reschedule: s["reschedule"] } : {},
	head: () => ({ meta: [
		{ title: "Book a consultation — Nourish" },
		{
			name: "description",
			content: "Pick a day and a free time slot for your nutrition consultation."
		},
		{
			property: "og:title",
			content: "Book a consultation — Nourish"
		},
		{
			property: "og:description",
			content: "Pick a day and a free time slot for your nutrition consultation."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
