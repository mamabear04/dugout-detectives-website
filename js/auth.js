document.addEventListener("DOMContentLoaded", () => {
  const client = window.dugoutSupabase;
  const signupForm = document.querySelector("#signup-form");
  const loginForm = document.querySelector("#login-form");
  const logoutButton = document.querySelector("#logout-button");
  const message = document.querySelector("#auth-message");
  const profile = document.querySelector("#account-profile");

  const showMessage = (text, type = "info") => {
    if (!message) return;
    message.textContent = text;
    message.className = `form-message ${type}`;
  };

  if (!client) {
    showMessage("Account service is not configured.", "error");
    return;
  }

  client.auth.getUser().then(({ data }) => {
    if (data?.user && profile) {
      profile.hidden = false;
      profile.querySelector("[data-email]").textContent = data.user.email || "";
      logoutButton.hidden = false;
    }
  });

  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(signupForm);
    const username = String(data.get("username") || "").trim();
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");

    if (username.length < 3) return showMessage("Username must be at least 3 characters.", "error");
    if (password.length < 8) return showMessage("Password must be at least 8 characters.", "error");

    showMessage("Creating your detective profile...");
    const { error } = await client.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
    if (error) return showMessage(error.message, "error");
    signupForm.reset();
    showMessage("Account created. Check your email to confirm your account.", "success");
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    const { error } = await client.auth.signInWithPassword({
      email: String(data.get("email") || "").trim(),
      password: String(data.get("password") || "")
    });
    if (error) return showMessage(error.message, "error");
    window.location.href = "leaderboard.html";
  });

  logoutButton?.addEventListener("click", async () => {
    await client.auth.signOut();
    window.location.reload();
  });
});
