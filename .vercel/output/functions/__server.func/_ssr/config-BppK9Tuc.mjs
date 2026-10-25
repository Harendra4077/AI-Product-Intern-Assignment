//#region node_modules/.nitro/vite/services/ssr/assets/config-BppK9Tuc.js
var supabaseUrl = {
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_SUPABASE_ANON_KEY": "your-anon-key-here",
	"VITE_SUPABASE_PROJECT_ID": "sywhguqnagpofytwupfr",
	"VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_DOEghyNlDNaX2DHRogFfxg_hY9Ls_tP",
	"VITE_SUPABASE_URL": "https://sywhguqnagpofytwupfr.supabase.co"
}["VITE_SUPABASE_URL"]?.trim();
var supabaseKey = {
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_SUPABASE_ANON_KEY": "your-anon-key-here",
	"VITE_SUPABASE_PROJECT_ID": "sywhguqnagpofytwupfr",
	"VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_DOEghyNlDNaX2DHRogFfxg_hY9Ls_tP",
	"VITE_SUPABASE_URL": "https://sywhguqnagpofytwupfr.supabase.co"
}["VITE_SUPABASE_PUBLISHABLE_KEY"]?.trim();
var isSupabaseConfigured = Boolean(supabaseUrl && !supabaseUrl.includes("your-project-id") && supabaseKey && !supabaseKey.toLowerCase().startsWith("your-"));
//#endregion
export { isSupabaseConfigured as t };
