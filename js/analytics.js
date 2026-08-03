document.addEventListener("DOMContentLoaded", async () => {
  const client = window.dugoutSupabase;
  if (!client) return;

  try {
    const pagePath = window.location.pathname || "/";
    await client.rpc("record_site_visit", { visit_path: pagePath });
  } catch (error) {
    console.warn("Stadium Attendance tracking unavailable.");
  }
});
