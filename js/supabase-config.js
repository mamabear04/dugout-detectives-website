window.DUGOUT_SUPABASE_URL = "https://ketngbvkwxdfhodykepn.supabase.co";
window.DUGOUT_SUPABASE_KEY = "sb_publishable_xoK5FbAuUzfwh9kNobowRg_xmjwnBs3";

if (window.supabase) {
  window.dugoutSupabase = window.supabase.createClient(
    window.DUGOUT_SUPABASE_URL,
    window.DUGOUT_SUPABASE_KEY
  );
}
