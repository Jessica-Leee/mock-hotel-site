(() => {
  const SCENARIOS = [
    {
      id: "solo_city_exploration",
      title: "Trip Scenario: Solo City Exploration",
      description: "You are booking for yourself as a solo leisure traveler. Duration: 3 nights. Budget: up to $150/night. You will be out most of the day and need a comfortable, well-located base.",
      rows: [
        ["Cleanliness", "2 - moderately important", false],
        ["Service quality", "2 - moderately important", false],
        ["Room comfort", "2 - moderately important", false],
        ["Wi-Fi reliability", "2 - moderately important", false],
        ["Noise level", "2 - moderately important", false],
        ["Location convenience", "3 - most important", true],
        ["Value for money", "3 - most important", true],
        ["Breakfast quality", "1 - least important", false]
      ]
    }
  ];

  let lastTrigger = null;

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function assignedScenario() {
    return SCENARIOS[0];
  }

  function profileRowsHtml(rows) {
    return rows.map(row => `
      <div class="shopper-profile-row${row[2] ? " is-top" : ""}" role="row">
        <div role="cell">${row[2] ? `<strong>${escapeHtml(row[0])}</strong>` : escapeHtml(row[0])}</div>
        <div role="cell">${row[2] ? `<strong>${escapeHtml(row[1])}</strong>` : escapeHtml(row[1])}</div>
      </div>
    `).join("");
  }

  function ensureModalRoot() {
    let root = document.getElementById("shopperProfileModalRoot");
    if (root) return root;
    root = document.createElement("div");
    root.id = "shopperProfileModalRoot";
    root.className = "modal-root shopper-profile-modal-root";
    root.setAttribute("aria-hidden", "true");
    document.body.appendChild(root);
    return root;
  }

  function openProfile(trigger) {
    const root = ensureModalRoot();
    const scenario = assignedScenario();
    lastTrigger = trigger || document.activeElement;
    root.dataset.previousOverflow = document.body.style.overflow || "";
    root.innerHTML = `
      <div class="modal-backdrop" data-close-shopper-profile></div>
      <section class="modal shopper-profile-modal" role="dialog" aria-modal="true" aria-labelledby="shopperProfileTitle">
        <div class="modal__top">
          <h2 class="modal__title" id="shopperProfileTitle">Review scenario and preferences</h2>
          <button class="xbtn" type="button" data-close-shopper-profile aria-label="Close">x</button>
        </div>
        <div class="shopper-profile-modal__body">
          ${scenario ? `
            <section class="shopper-scenario">
              <h3>${escapeHtml(scenario.title)}</h3>
              <p>${escapeHtml(scenario.description)}</p>
            </section>
            <section class="shopper-preferences">
              <h3>Your Attribute Preference Profile</h3>
              <p>Importance scale: 1 = least important, 2 = moderately important, 3 = most important. <strong>Bold</strong> = top priorities for this trip.</p>
              <div class="shopper-profile-table" role="table" aria-label="Attribute preference profile">
                ${profileRowsHtml(scenario.rows)}
              </div>
            </section>
          ` : `
            <p class="shopper-profile-unavailable">Your shopper profile is not available yet. Please complete the profile step before continuing.</p>
          `}
        </div>
      </section>
    `;
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const closeButton = root.querySelector("[data-close-shopper-profile]");
    if (closeButton) closeButton.focus();
  }

  function closeProfile() {
    const root = document.getElementById("shopperProfileModalRoot");
    if (!root || !root.classList.contains("is-open")) return;
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = "";
    document.body.style.overflow = root.dataset.previousOverflow || "";
    if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
    lastTrigger = null;
  }

  document.addEventListener("click", event => {
    const openButton = event.target && event.target.closest && event.target.closest("[data-view-shopper-profile]");
    if (openButton) {
      openProfile(openButton);
      return;
    }
    const closeButton = event.target && event.target.closest && event.target.closest("[data-close-shopper-profile]");
    if (closeButton) closeProfile();
  });

  document.addEventListener("keydown", event => {
    const root = document.getElementById("shopperProfileModalRoot");
    if (event.key !== "Escape" || !root || !root.classList.contains("is-open")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    closeProfile();
  }, true);

  window.HOTEL_SHOPPER_PROFILE = { open: openProfile, close: closeProfile };
})();
