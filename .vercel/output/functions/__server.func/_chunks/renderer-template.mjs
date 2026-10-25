import { r as HTTPResponse } from "../_libs/h3+rou3+srvx.mjs";
//#region #nitro/virtual/renderer-template
var rendererTemplate = () => new HTTPResponse("<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/favicon.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <meta name=\"description\" content=\"Kayro – Wellness appointment management platform for nutritionists and their clients. Book consultations, track attendance, and never miss a session.\" />\n    <meta name=\"keywords\" content=\"nutrition, appointment booking, wellness, health, consultation\" />\n    <meta name=\"theme-color\" content=\"#354B3C\" />\n\n    <!-- Open Graph -->\n    <meta property=\"og:title\" content=\"Kayro – Wellness Appointment Platform\" />\n    <meta property=\"og:description\" content=\"Book and manage nutrition consultations with ease.\" />\n    <meta property=\"og:type\" content=\"website\" />\n\n    <!-- Google Fonts preconnect -->\n    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />\n    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin />\n\n    <title>Kayro – Wellness Appointments</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.tsx\"><\/script>\n  </body>\n</html>\n", { headers: { "content-type": "text/html; charset=utf-8" } });
//#endregion
//#region node_modules/nitro/dist/runtime/internal/routes/renderer-template.mjs
function renderIndexHTML(event) {
	return rendererTemplate(event.req);
}
//#endregion
export { renderIndexHTML as default };
