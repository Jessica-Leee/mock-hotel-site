(() => {
  const ASSIGNMENT_STORAGE_PREFIX = "mock_hotel_shared_assignment_v1";
  const SCENARIOS = [
    {
      id: "business_conference",
      title: "Trip Scenario: Business Conference",
      description: "You are booking for yourself as a business traveler attending a multi-day conference. Duration: 3 nights. Budget: up to $200/night. You need reliable internet, minimal noise, and easy access to the conference venue.",
      rows: [
        ["Cleanliness", "2 moderately important", false],
        ["Service quality", "2 - moderately important", false],
        ["Room comfort", "2 - moderately important", false],
        ["Wi-Fi reliability", "3 - most important", true],
        ["Noise level", "3 - most important", true],
        ["Location convenience", "3 - most important", true],
        ["Value for money", "1 - moderately important", false],
        ["Breakfast quality", "1 - least important", false]
      ]
    },
    {
      id: "family_vacation",
      title: "Trip Scenario: Family Vacation",
      description: "You are booking for yourself, your spouse, and two young children (ages 5 and 8). Duration: 4 nights. Budget: up to $180/night. Safety and comfort for the children are the top priority.",
      rows: [
        ["Cleanliness", "3 - most important", true],
        ["Service quality", "2 - moderately important", false],
        ["Room comfort", "3 - most important", true],
        ["Wi-Fi reliability", "2 - moderately important", false],
        ["Noise level", "2 - moderately important", false],
        ["Location convenience", "2 - moderately important", false],
        ["Value for money", "2 - moderately important", false],
        ["Breakfast quality", "2 - moderately important", false]
      ]
    },
    {
      id: "romantic_getaway",
      title: "Trip Scenario: Romantic Getaway",
      description: "You are booking for yourself and your partner for a romantic weekend trip. Duration: 2 nights. Budget: up to $220/night. You want a relaxing, comfortable, and memorable experience.",
      rows: [
        ["Cleanliness", "2 - moderately important", false],
        ["Service quality", "3 - most important", true],
        ["Room comfort", "3 - most important", true],
        ["Wi-Fi reliability", "1 - least important", false],
        ["Noise level", "3 - most important", true],
        ["Location convenience", "2 - moderately important", false],
        ["Value for money", "2 - moderately important", false],
        ["Breakfast quality", "2 - moderately important", false]
      ]
    },
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
    },
    {
      id: "friends_group_trip",
      title: "Trip Scenario: Friends Group Trip",
      description: "You are booking for yourself and three close friends for a social weekend. Duration: 3 nights. Budget: up to $160/night. You want a lively, central location to enjoy the city together.",
      rows: [
        ["Cleanliness", "2 - moderately important", false],
        ["Service quality", "2 - moderately important", false],
        ["Room comfort", "2 - moderately important", false],
        ["Wi-Fi reliability", "2 - moderately important", false],
        ["Noise level", "2 - moderately important", false],
        ["Location convenience", "3 - most important", true],
        ["Value for money", "2 - moderately important", false],
        ["Breakfast quality", "2 - moderately important", false]
      ]
    },
    {
      id: "elderly_parents",
      title: "Trip Scenario: Visit with Elderly Parents",
      description: "You are booking for your elderly parents (both in their 70s, with limited mobility). Duration: 4 nights. Budget: up to $190/night. Comfort, accessibility, and attentive service are top priorities.",
      rows: [
        ["Cleanliness", "2 - moderately important", false],
        ["Service quality", "3 - most important", true],
        ["Room comfort", "3 - most important", true],
        ["Wi-Fi reliability", "1 - least important", false],
        ["Noise level", "3 - most important", true],
        ["Location convenience", "2 - moderately important", false],
        ["Value for money", "2 - moderately important", false],
        ["Breakfast quality", "2 - moderately important", false]
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

  function participantStorageSuffix() {
    const params = new URLSearchParams(location.search || "");
    const identity = params.get("PROLIFIC_PID") || params.get("prolific_pid") || params.get("participant_id") ||
      params.get("SESSION_ID") || params.get("session_id") || "anonymous";
    return encodeURIComponent(identity);
  }

  function assignedScenario() {
    const key = `${ASSIGNMENT_STORAGE_PREFIX}:${participantStorageSuffix()}`;
    let assignment = {};
    try { assignment = JSON.parse(localStorage.getItem(key)) || {}; }
    catch (_) { assignment = {}; }
    return SCENARIOS.find(scenario => scenario.id === assignment.scenario_id) || null;
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
