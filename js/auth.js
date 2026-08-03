document.addEventListener("DOMContentLoaded", async () => {
  const db = window.dugoutSupabase;
  const tabs = document.querySelectorAll("[data-auth-tab]");
  const signin = document.querySelector("#signin-form");
  const signup = document.querySelector("#signup-form");
  const message = document.querySelector("#auth-message");
  const panel = document.querySelector("#signed-in-panel");
  const panelCopy = document.querySelector("#signed-in-copy");

  const setMessage = (text, good = false) => {
    message.textContent = text;
    message.className = `form-message ${good ? "good" : "bad"}`;
  };

  const showSession = async (session) => {
    if (!session) return;
    signin.hidden = true;
    signup.hidden = true;
    document.querySelector(".auth-tabs").hidden = true;
    panel.hidden = false;
    const { data } = await db.from("profiles").select("username").eq("id", session.user.id).maybeSingle();
    panelCopy.textContent = `Signed in as ${data?.username || session.user.email}.`;
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.toggle("active", item === tab));
    signin.hidden = tab.dataset.authTab !== "signin";
    signup.hidden = tab.dataset.authTab !== "signup";
    message.textContent = "";
  }));

  signin.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { data, error } = await db.auth.signInWithPassword({
      email: document.querySelector("#signin-email").value,
      password: document.querySelector("#signin-password").value
    });
    if (error) return setMessage(error.message);
    setMessage("Welcome back.", true);
    showSession(data.session);
  });

  signup.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.querySelector("#signup-username").value.trim();
    const email = document.querySelector("#signup-email").value.trim();
    const password = document.querySelector("#signup-password").value;
    const { data, error } = await db.auth.signUp({ email, password, options: { data: { username } } });
    if (error) return setMessage(error.message);
    setMessage(data.session ? "Account created." : "Check your email to confirm your account.", true);
    if (data.session) showSession(data.session);
  });

  document.querySelector("#signout-button").addEventListener("click", async () => {
    await db.auth.signOut();
    location.reload();
  });

  const { data } = await db.auth.getSession();
  showSession(data.session);
});
