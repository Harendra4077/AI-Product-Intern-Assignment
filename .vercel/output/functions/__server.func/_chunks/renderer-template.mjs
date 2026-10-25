import { t as serverFetch } from "../index.mjs";
import { t as renderToResponse } from "../_libs/rendu.mjs";
//#region #nitro/virtual/renderer-template
var template = (async (__context__) => {
	const __chunks__ = [];
	const echo = (chunk) => {
		__chunks__.push(chunk);
	};
	const { htmlspecialchars, setCookie, redirect, $REQUEST, $METHOD, $URL, $HEADERS, $COOKIES, $RESPONSE } = __context__;
	echo(globalThis.__nitro_vite_envs__?.["ssr"]?.fetch($REQUEST) || "");
	echo("\n");
	function concatStreams(chunks) {
		const encoder = new TextEncoder();
		return new ReadableStream({ async pull(controller) {
			for (let chunk of chunks) {
				if (typeof chunk === "function") chunk = chunk();
				if (chunk instanceof Promise) {
					chunk = await chunk;
					if (!chunk) continue;
					if (chunk instanceof Response) chunk = chunk.body;
					if (!(chunk instanceof ReadableStream)) {
						controller.enqueue(chunk instanceof Uint8Array ? chunk : encoder.encode(chunk));
						continue;
					}
				}
				if (chunk instanceof ReadableStream) {
					const reader = chunk.getReader();
					while (true) {
						const { value, done } = await reader.read();
						if (done) break;
						controller.enqueue(value);
					}
					reader.releaseLock();
				} else controller.enqueue(chunk instanceof Uint8Array ? chunk : encoder.encode(chunk));
			}
			controller.close();
		} });
	}
	return concatStreams(__chunks__);
});
var rendererTemplate = (request) => renderToResponse(template, {
	request,
	context: { serverFetch }
});
//#endregion
//#region node_modules/nitro/dist/runtime/internal/routes/renderer-template.mjs
function renderIndexHTML(event) {
	return rendererTemplate(event.req);
}
//#endregion
export { renderIndexHTML as default };
