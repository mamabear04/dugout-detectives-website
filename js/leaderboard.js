document.addEventListener("DOMContentLoaded", async () => {
  const client = window.dugoutSupabase;
  const form = document.querySelector("#leaderboard-form");
  const body = document.querySelector("#leaderboard-body");
  const message = document.querySelector("#leaderboard-message");
  if (!client || !body) return;

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
  };

  const loadEntries = async () => {
    const { data, error } = await client
      .from("leaderboard_entries")
      .select("username, case_number, solve_seconds, completed_at")
      .order("solve_seconds", { ascending: true })
      .limit(100);

    body.innerHTML = "";
    if (error) {
      body.innerHTML = '<tr><td colspan="5">Scoreboard is warming up. Please check back soon.</td></tr>';
      return;
    }
    data.forEach((entry, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${index + 1}</td><td>${entry.username}</td><td>${entry.case_number}</td><td>${formatTime(entry.solve_seconds)}</td><td>${new Date(entry.completed_at).toLocaleDateString()}</td>`;
      body.appendChild(row);
    });
  };

  await loadEntries();

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { data: auth } = await client.auth.getUser();
    if (!auth?.user) {
      message.textContent = "Sign in before posting an official solve time.";
      message.className = "form-message error";
      return;
    }

    const data = new FormData(form);
    const hours = Number(data.get("hours") || 0);
    const minutes = Number(data.get("minutes") || 0);
    const seconds = Number(data.get("seconds") || 0);
    const total = hours * 3600 + minutes * 60 + seconds;
    const username = String(data.get("username") || "").trim();

    if (!username || total <= 0 || minutes > 59 || seconds > 59) {
      message.textContent = "Enter a username and a valid solve time.";
      message.className = "form-message error";
      return;
    }

    const { error } = await client.from("leaderboard_entries").upsert({
      user_id: auth.user.id,
      username,
      case_number: String(data.get("case_number") || "001"),
      solve_seconds: total,
      completed_at: new Date().toISOString()
    }, { onConflict: "user_id,case_number" });

    if (error) {
      message.textContent = error.message;
      message.className = "form-message error";
      return;
    }

    message.textContent = "Your time is on the scoreboard!";
    message.className = "form-message success";
    form.reset();
    await loadEntries();
  });
});
