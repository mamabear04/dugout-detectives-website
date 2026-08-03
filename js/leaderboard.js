document.addEventListener("DOMContentLoaded", async () => {
  const db = window.dugoutSupabase;
  const rows = document.querySelector("#leaderboard-rows");
  const form = document.querySelector("#leaderboard-form");
  const message = document.querySelector("#leaderboard-message");

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${m}:${String(s).padStart(2,"0")}`;
  };

  const load = async () => {
    const { data, error } = await db.from("leaderboard_public").select("*").eq("case_number","001").order("solve_seconds").limit(100);
    if (error) {
      rows.innerHTML = '<p class="loading-row">The scoreboard will appear after the Supabase setup is complete.</p>';
      return;
    }
    if (!data.length) {
      rows.innerHTML = '<p class="loading-row">No times yet. Be the first solver listed.</p>';
      return;
    }
    rows.innerHTML = data.map((row, index) => `
      <div class="scoreboard-row">
        <strong>${index + 1}</strong><span>${row.username}</span><span>#${row.case_number}</span><span>${formatTime(row.solve_seconds)}</span>
      </div>`).join("");
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { data: { session } } = await db.auth.getSession();
    if (!session) {
      message.textContent = "Sign in before posting a time.";
      message.className = "form-message bad";
      return;
    }
    const total = Number(document.querySelector("#solve-hours").value) * 3600
      + Number(document.querySelector("#solve-minutes").value) * 60
      + Number(document.querySelector("#solve-seconds").value);
    if (total < 1) {
      message.textContent = "Enter a time greater than zero.";
      return;
    }
    const { error } = await db.from("leaderboard_entries").upsert({
      user_id: session.user.id,
      case_number: document.querySelector("#case-number").value,
      solve_seconds: total
    }, { onConflict: "user_id,case_number" });
    if (error) {
      message.textContent = error.message;
      message.className = "form-message bad";
      return;
    }
    message.textContent = "Your best time is now on the scoreboard.";
    message.className = "form-message good";
    load();
  });

  load();
});
