document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#solution-form");
  const input = document.querySelector("#solution-name");
  const result = document.querySelector("#verification-result");
  const reward = document.querySelector("#case-solved-reward");

  if (!form || !input || !result) {
    return;
  }

  /*
   * Case File #001 solution.
   *
   * The name is encoded only to avoid displaying it plainly
   * during a casual glance at this file. This is not intended
   * as strong security.
   */
  const encodedSolution = "YWRkeXNvbg==";

  const normalizeName = (value) => {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "");
  };

  const officialSolution = normalizeName(
    window.atob(encodedSolution)
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const submittedName = normalizeName(input.value);

    result.className = "verification-result";
    result.textContent = "";

    if (!submittedName) {
      result.classList.add("result-error");
      result.textContent =
        "Enter the remaining name before verifying.";
      return;
    }

    if (submittedName === officialSolution) {
      result.classList.add("result-success");

      result.innerHTML = `
        <strong>CASE SOLVED</strong>
        <span>
          Your final remaining name matches the official
          Case File #001 solution.
        </span>
      `;

      if (reward) {
        reward.hidden = false;
        reward.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }

      input.disabled = true;

      const button = form.querySelector("button");

      if (button) {
        button.disabled = true;
        button.textContent = "Case Verified";
      }

      return;
    }

    result.classList.add("result-incorrect");

    result.innerHTML = `
      <strong>INVESTIGATION INCOMPLETE</strong>
      <span>
        That name does not match the official record.
        Review the evidence files and check your eliminations.
      </span>
    `;

    if (reward) {
      reward.hidden = true;
    }

    input.focus();
    input.select();
  });
});