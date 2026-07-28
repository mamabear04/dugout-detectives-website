document.addEventListener("DOMContentLoaded", () => {
  const names = Array.isArray(window.DUGOUT_ROSTER)
    ? window.DUGOUT_ROSTER
    : [];

  const searchInput =
    document.querySelector("#roster-search");

  const searchButton =
    document.querySelector("#roster-search-button");

  const searchResult =
    document.querySelector("#roster-search-result");

  const requestSection =
    document.querySelector("#name-request-section");

  const requestedName =
    document.querySelector("#requested-name");

  const letterNavigation =
    document.querySelector("#letter-navigation");

  const rosterList =
    document.querySelector("#roster-list");

  const rosterCount =
    document.querySelector("#roster-count");

  const previousButton =
    document.querySelector("#previous-roster-page");

  const nextButton =
    document.querySelector("#next-roster-page");

  const pageStatus =
    document.querySelector("#roster-page-status");

  const PAGE_SIZE = 200;

  let selectedLetter = "A";
  let currentPage = 1;

  const normalizeName = (value) => {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z'-]/g, "");
  };

  const normalizedRoster = new Set(
    names.map(normalizeName)
  );

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const namesForSelectedLetter = () => {
    return names.filter((name) => {
      return name
        .toUpperCase()
        .startsWith(selectedLetter);
    });
  };

  const renderLetters = () => {
    letterNavigation.innerHTML = "";

    letters.forEach((letter) => {
      const button = document.createElement("button");

      button.type = "button";
      button.textContent = letter;
      button.className = "letter-button";

      if (letter === selectedLetter) {
        button.classList.add("active");
      }

      button.addEventListener("click", () => {
        selectedLetter = letter;
        currentPage = 1;

        renderLetters();
        renderRoster();
      });

      letterNavigation.appendChild(button);
    });
  };

  const renderRoster = () => {
    const filteredNames = namesForSelectedLetter();

    const totalPages = Math.max(
      1,
      Math.ceil(filteredNames.length / PAGE_SIZE)
    );

    currentPage = Math.min(
      currentPage,
      totalPages
    );

    const start = (
      currentPage - 1
    ) * PAGE_SIZE;

    const visibleNames = filteredNames.slice(
      start,
      start + PAGE_SIZE
    );

    rosterList.innerHTML = "";

    visibleNames.forEach((name) => {
      const item = document.createElement("div");

      item.className = "roster-name";
      item.textContent = name;

      rosterList.appendChild(item);
    });

    rosterCount.textContent =
      `${filteredNames.length.toLocaleString()} names beginning with ${selectedLetter}`;

    pageStatus.textContent =
      `Page ${currentPage} of ${totalPages}`;

    previousButton.disabled =
      currentPage <= 1;

    nextButton.disabled =
      currentPage >= totalPages;
  };

  const searchRoster = () => {
    const submittedName = searchInput.value.trim();
    const normalized = normalizeName(submittedName);

    searchResult.className =
      "roster-search-result";

    searchResult.textContent = "";

    if (!normalized) {
      searchResult.classList.add(
        "roster-result-warning"
      );

      searchResult.textContent =
        "Enter a first name before searching.";

      requestSection.hidden = true;
      return;
    }

    if (normalizedRoster.has(normalized)) {
      searchResult.classList.add(
        "roster-result-found"
      );

      searchResult.innerHTML = `
        <strong>NAME FOUND</strong>
        <span>
          ${submittedName} appears in the official
          Case File #001 player roster.
        </span>
      `;

      requestSection.hidden = true;
      return;
    }

    searchResult.classList.add(
      "roster-result-missing"
    );

    searchResult.innerHTML = `
      <strong>NAME NOT FOUND</strong>
      <span>
        ${submittedName} does not appear in the
        Case File #001 player roster.
      </span>
    `;

    requestSection.hidden = false;
    requestedName.value = submittedName;

    requestSection.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  };

  searchButton.addEventListener(
    "click",
    searchRoster
  );

  searchInput.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        searchRoster();
      }
    }
  );

  previousButton.addEventListener(
    "click",
    () => {
      if (currentPage > 1) {
        currentPage -= 1;
        renderRoster();
      }
    }
  );

  nextButton.addEventListener(
    "click",
    () => {
      currentPage += 1;
      renderRoster();
    }
  );

  renderLetters();
  renderRoster();
});