document.addEventListener("DOMContentLoaded", async () => {
  const db = window.dugoutSupabase;

  const rows = document.querySelector("#leaderboard-rows");
  const form = document.querySelector("#leaderboard-form");
  const message = document.querySelector("#leaderboard-message");

  const leaderName = document.querySelector("#board-leader-name");
  const bestTime = document.querySelector("#board-best-time");
  const solverCount = document.querySelector("#board-solver-count");

  const formatTime = (seconds) => {
    const total = Number(seconds) || 0;
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    return `${minutes}:${String(secs).padStart(2, "0")}`;
  };

  const renderEmpty = (title, copy) => {
    rows.innerHTML = `
      <div class="scoreboard-empty">
        <strong>${title}</strong>
        <p>${copy}</p>
      </div>
    `;

    leaderName.textContent = "Waiting";
    bestTime.textContent = "—";
    solverCount.textContent = "0";
  };

  const renderEntries = (entries) => {
    solverCount.textContent = entries.length.toLocaleString();

    if (!entries.length) {
      renderEmpty(
        "No official times yet.",
        "Be the first verified solver to enter the lineup."
      );
      return;
    }

    leaderName.textContent = entries[0].username;
    bestTime.textContent = formatTime(
      entries[0].solve_seconds
    );

    rows.innerHTML = entries.map((entry, index) => `
      <div class="scoreboard-row">
        <span class="rank-cell">${index + 1}</span>
        <span class="solver-cell">${entry.username}</span>
        <span>#${entry.case_number}</span>
        <span class="time-cell">${formatTime(entry.solve_seconds)}</span>
      </div>
    `).join("");
  };

  const load = async () => {
    const { data, error } = await db
      .from("leaderboard_public")
      .select("*")
      .eq("case_number", "001")
      .order("solve_seconds")
      .limit(100);

    if (error) {
      renderEmpty(
        "The scoreboard is ready for data.",
        "The visual scoreboard is live. Run the Supabase setup so reader accounts and official times can be stored and displayed."
      );
      return;
    }

    renderEntries(Array.isArray(data) ? data : []);
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const {
      data: { session }
    } = await db.auth.getSession();

    if (!session) {
      message.textContent =
        "Sign in before posting an official solve time.";
      message.className = "form-message bad";
      return;
    }

    const total =
      Number(document.querySelector("#solve-hours").value || 0) * 3600
      + Number(document.querySelector("#solve-minutes").value || 0) * 60
      + Number(document.querySelector("#solve-seconds").value || 0);

    if (total < 1) {
      message.textContent =
        "Enter a solve time greater than zero.";
      message.className = "form-message bad";
      return;
    }

    const { error } = await db
      .from("leaderboard_entries")
      .upsert(
        {
          user_id: session.user.id,
          case_number:
            document.querySelector("#case-number").value,
          solve_seconds: total
        },
        {
          onConflict: "user_id,case_number"
        }
      );

    if (error) {
      message.textContent = error.message;
      message.className = "form-message bad";
      return;
    }

    message.textContent =
      "Your official time is now on the scoreboard.";
    message.className = "form-message good";

    await load();
  });

  await load();
});
