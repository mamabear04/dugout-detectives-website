document.addEventListener("DOMContentLoaded", async () => {
  const db = window.dugoutSupabase;

  const rows = document.querySelector("#leaderboard-rows");
  const form = document.querySelector("#leaderboard-form");
  const message = document.querySelector("#leaderboard-message");

  const solverCount = document.querySelector("#solver-count");
  const fastestTime = document.querySelector("#fastest-time");

  const filterButtons = document.querySelectorAll(
    ".scoreboard-filter"
  );

  const preview = document.querySelector("#solve-time-preview");
  const hoursInput = document.querySelector("#solve-hours");
  const minutesInput = document.querySelector("#solve-minutes");
  const secondsInput = document.querySelector("#solve-seconds");

  let allEntries = [];
  let activeFilter = "all";

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

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(value));
  };

  const updatePreview = () => {
    const total =
      Number(hoursInput.value || 0) * 3600
      + Number(minutesInput.value || 0) * 60
      + Number(secondsInput.value || 0);

    preview.textContent = formatTime(total);
  };

  [hoursInput, minutesInput, secondsInput].forEach((input) => {
    input.addEventListener("input", updatePreview);
  });

  const setPodiumCard = (id, entry) => {
    const card = document.querySelector(id);

    const name = card.querySelector(".podium-name");
    const time = card.querySelector(".podium-time");

    if (!entry) {
      name.textContent = "Waiting";
      time.textContent = "No time posted";
      return;
    }

    name.textContent = entry.username;
    time.textContent = formatTime(entry.solve_seconds);
  };

  const filteredEntries = () => {
    if (activeFilter === "all") {
      return allEntries;
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(activeFilter));

    return allEntries.filter((entry) => {
      return entry.updated_at
        && new Date(entry.updated_at) >= cutoff;
    });
  };

  const render = () => {
    const entries = filteredEntries();

    solverCount.textContent = entries.length.toLocaleString();
    fastestTime.textContent = entries.length
      ? formatTime(entries[0].solve_seconds)
      : "—";

    setPodiumCard("#podium-first", entries[0]);
    setPodiumCard("#podium-second", entries[1]);
    setPodiumCard("#podium-third", entries[2]);

    if (!entries.length) {
      rows.innerHTML = `
        <div class="scoreboard-empty">
          <strong>No official times yet.</strong>
          <span>Be the first solver to enter the lineup.</span>
        </div>
      `;
      return;
    }

    rows.innerHTML = entries.map((entry, index) => `
      <div class="scoreboard-row">
        <span class="rank-cell">${index + 1}</span>
        <span class="solver-cell">${entry.username}</span>
        <span>#${entry.case_number}</span>
        <span class="time-cell">${formatTime(entry.solve_seconds)}</span>
        <span class="date-cell">${formatDate(entry.updated_at)}</span>
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
      rows.innerHTML = `
        <div class="scoreboard-empty">
          <strong>Scoreboard unavailable.</strong>
          <span>
            Complete the Supabase setup before publishing
            official standings.
          </span>
        </div>
      `;
      return;
    }

    allEntries = Array.isArray(data) ? data : [];
    render();
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;

      filterButtons.forEach((item) => {
        item.classList.toggle(
          "active",
          item === button
        );
      });

      render();
    });
  });

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
      Number(hoursInput.value || 0) * 3600
      + Number(minutesInput.value || 0) * 60
      + Number(secondsInput.value || 0);

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
      "Your best time is now on the official scoreboard.";
    message.className = "form-message good";

    await load();
  });

  updatePreview();
  await load();
});
