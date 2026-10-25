const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"]?.trim();
const supabaseKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  !supabaseUrl.includes("your-project-id") &&
  supabaseKey &&
  !supabaseKey.toLowerCase().startsWith("your-"),
);
