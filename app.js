(() => {
  const STORAGE_KEY = "mock_hotel_logs_v1";

  let activeHotelSession = null;
  let modalScrollCleanup = null;

  function nowMs() {
    return Date.now();
  }

  function safeJsonParse(s, fallback) {
    try { return JSON.parse(s); } catch (_) { return fallback; }
  }

  function getLogs() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEY), []) || [];
  }

  function setLogs(logs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }

  function logEvent(type, details) {
    const entry = {
      t: nowMs(),
      type,
      details: details || {},
      href: location.href,
      path: location.hash || "#results",
      ua: navigator.userAgent
    };
    const logs = getLogs();
    logs.push(entry);
    setLogs(logs);
  }

  function download(filename, text) {
    const a = document.createElement("a");
    a.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    a.setAttribute("download", filename);
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function qs() {
    const p = new URLSearchParams(location.search);
    const phaseRaw = p.get("phase") || "1";
    const phase = (phaseRaw === "2") ? "2" : "1";
    const condRaw = (p.get("cond") || "none").toLowerCase();
    const cond = (condRaw === "vanilla" || condRaw === "newsworthy") ? condRaw : "none";
    return { phase, cond };
  }

  const GALLERY_KEYS = ["room", "lobby", "bathroom", "exterior", "restaurant", "room2", "pool", "fitness", "business", "view"];

  function localHotelImage(hotelId, slot) {
    return "./images/" + hotelId + "-" + slot + ".jpg";
  }

  function buildHotelMediaMap() {
    const map = {};
    for (const id of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
      const gallery = {};
      for (const k of GALLERY_KEYS) gallery[k] = localHotelImage(id, k);
      map[id] = { thumb: localHotelImage(id, "thumb"), gallery };
    }
    return map;
  }

  const HOTEL_MEDIA = buildHotelMediaMap();

  function mediaThumb(hotelId) {
    const m = HOTEL_MEDIA[hotelId];
    return m && m.thumb ? m.thumb : "";
  }

  function mediaGallerySrc(hotelId, key) {
    const m = HOTEL_MEDIA[hotelId];
    return m && m.gallery && m.gallery[key] ? m.gallery[key] : "";
  }

  function makeSvgDataUri(seedText) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#dde7ff"/>
            <stop offset="1" stop-color="#fff6d7"/>
          </linearGradient>
          <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#0b1320" flood-opacity=".18"/>
          </filter>
        </defs>
        <rect width="1200" height="800" fill="url(#g)"/>
        <g filter="url(#s)">
          <rect x="90" y="120" width="1020" height="560" rx="34" fill="rgba(255,255,255,.70)" stroke="rgba(0,0,0,.06)"/>
        </g>
        <text x="130" y="220" font-family="ui-sans-serif, system-ui" font-size="44" font-weight="800" fill="#003b95">${escapeXml(seedText)}</text>
        <text x="130" y="280" font-family="ui-sans-serif, system-ui" font-size="22" fill="#2a3b5a">Placeholder photo</text>
        <circle cx="960" cy="450" r="120" fill="rgba(0,59,149,.10)"/>
        <circle cx="1010" cy="430" r="64" fill="rgba(254,187,2,.20)"/>
      </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function bindImgFallback(img) {
    if (!img || img.dataset.fallbackBound === "1") return;
    img.dataset.fallbackBound = "1";
    img.addEventListener("error", function onImgErr() {
      img.removeEventListener("error", onImgErr);
      const label = img.getAttribute("alt") || "Photo";
      img.src = makeSvgDataUri(label);
    });
  }

  function bindImgFallbacksIn(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll("img").forEach(bindImgFallback);
  }

  function escapeXml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function amenityIcon(label) {
    const l = String(label).toLowerCase().replace(/\u2011/g, "-");
    if ((l.includes("wi") && l.includes("fi")) || l.includes("internet")) return "📶";
    if (l.includes("pool")) return "🏊";
    if (l.includes("fitness") || l.includes("gym")) return "🏋️";
    if (l.includes("spa")) return "💆";
    if (l.includes("bar") || l.includes("restaurant") || l.includes("dining") || l.includes("breakfast")) return "🍽️";
    if (l.includes("parking")) return "🅿️";
    if (l.includes("laundry")) return "🧺";
    if (l.includes("concierge")) return "🛎️";
    if (l.includes("quiet")) return "🔇";
    if (l.includes("location") || l.includes("central")) return "📍";
    if (l.includes("reception") || l.includes("front desk") || l.includes("24")) return "🕐";
    if (l.includes("accessible") || l.includes("mobility")) return "♿";
    if (l.includes("kid") || l.includes("family")) return "👨‍👩‍👧";
    if (l.includes("social") || l.includes("lobby")) return "🛋️";
    if (l.includes("checkout") || l.includes("check-out")) return "🕛";
    if (l.includes("walkable") || l.includes("nightlife")) return "🌃";
    if (l.includes("room service")) return "🛎️";
    if (l.includes("view")) return "🌆";
    if (l.includes("spacious")) return "📐";
    if (l.includes("dining") || l.includes("on-site")) return "🍽️";
    return "✓";
  }

  function amenityChipHtml(a) {
    const icon = amenityIcon(a);
    return `<span class="amenity" data-amenity="${escapeXml(a)}"><span class="amenity__ico" aria-hidden="true">${icon}</span>${escapeXml(a)}</span>`;
  }

  function galleryImageSrc(hotel, photoId, cap) {
    const url = mediaGallerySrc(hotel.id, photoId);
    return url || makeSvgDataUri(`${hotel.name} – ${cap}`);
  }

  function buildPhotoGallery(hotel) {
    const labels = [
      { id: "room", cap: "Guest room" },
      { id: "lobby", cap: "Lobby" },
      { id: "bathroom", cap: "Bathroom" },
      { id: "exterior", cap: "Exterior" },
      { id: "restaurant", cap: "Restaurant" },
      { id: "room2", cap: "Second room" },
      { id: "pool", cap: "Pool & wellness" },
      { id: "fitness", cap: "Fitness center" },
      { id: "business", cap: "Business center" },
      { id: "view", cap: "City view" }
    ];
    const cells = labels.map(({ id, cap }) => {
      const src = galleryImageSrc(hotel, id, cap);
      return { id, cap, src };
    });
    const [p0, p1, p2, p3, p4, ...row2] = cells;
    const rowHtml = row2.map(p => `
      <div class="gitem">
        <img class="gimg" data-photo="${p.id}" alt="${escapeXml(p.cap)}" src="${p.src}" loading="lazy" decoding="async">
        <div class="gcaption">${escapeXml(p.cap)}</div>
      </div>
    `).join("");
    return `
      <div class="gallery" aria-label="Photo gallery">
        <div class="gitem gitem--hero">
          <img class="gimg" data-photo="${p0.id}" alt="${escapeXml(p0.cap)}" src="${p0.src}" loading="eager" decoding="async">
          <div class="gcaption">${escapeXml(p0.cap)}</div>
        </div>
        <div class="gitem">
          <img class="gimg" data-photo="${p1.id}" alt="${escapeXml(p1.cap)}" src="${p1.src}" loading="lazy" decoding="async">
          <div class="gcaption">${escapeXml(p1.cap)}</div>
        </div>
        <div class="gitem">
          <img class="gimg" data-photo="${p2.id}" alt="${escapeXml(p2.cap)}" src="${p2.src}" loading="lazy" decoding="async">
          <div class="gcaption">${escapeXml(p2.cap)}</div>
        </div>
        <div class="gitem">
          <img class="gimg" data-photo="${p3.id}" alt="${escapeXml(p3.cap)}" src="${p3.src}" loading="lazy" decoding="async">
          <div class="gcaption">${escapeXml(p3.cap)}</div>
        </div>
        <div class="gitem">
          <img class="gimg" data-photo="${p4.id}" alt="${escapeXml(p4.cap)}" src="${p4.src}" loading="lazy" decoding="async">
          <div class="gcaption">${escapeXml(p4.cap)}</div>
        </div>
        <div class="gallery__row">
          ${rowHtml}
        </div>
      </div>
    `;
  }

  const HOTELS = [
    {
      id: "h1",
      name: "Palmer House, a Hilton Hotel",
      brand: "Hilton",
      stars: 4,
      price: 279,
      neighborhood: "Chicago Loop",
      distance: "0.2 mi to Millennium Park",
      address: "17 E Monroe St, Chicago, IL",
      tags: ["Historic property", "Theater District"],
      amenities: ["Landmark lobby", "Fitness center", "On‑site dining", "Wi‑Fi"],
      room: "Standard King • ~320 sq ft",
      about: "Historic flagship hotel known for its grand lobby and central Loop location near theaters, Millennium Park, and the Art Institute.",
      policy: "Check‑in 3 PM • Check‑out 12 PM • 24‑hour front desk",
      cancellation: "Free cancellation until 48 hours before arrival (rate-dependent).",
      poi: ["Millennium Park", "Art Institute", "State/Lake CTA"],
      poiDetails: [
        { name: "Millennium Park", distance: "0.2 mi" },
        { name: "Art Institute of Chicago", distance: "0.3 mi" },
        { name: "State/Lake CTA", distance: "0.15 mi" }
      ],
      roomsDetail: [
        "Standard King — ~320 sq ft",
        "Double Queen — ~340 sq ft"
      ],
      guestRating: 8.4,
      guestReviewCount: 4120,
      ratingBreakdown: { Staff: 8.7, Facilities: 8.5, Cleanliness: 8.6, Comfort: 8.3, "Value for money": 8.2, Location: 9.3 },
      reviews: [
        { who: "United States • Business traveler", when: "Jan 2026", score10: 9, text: "The lobby is worth the trip alone—photos don’t do it justice. My room was clean and quiet enough for calls, though the bathroom felt a bit older than newer towers I’ve stayed in.", chips: ["Historic character", "Cleanliness", "Work trip"] },
        { who: "United Kingdom • Couple", when: "Dec 2025", score10: 8, text: "Perfect for shows and museums; we walked everywhere. Hallway noise picked up late at night, but staff were quick to help when we asked for a different floor.", chips: ["Walkability", "Staff", "Noise"] },
        { who: "Canada • Solo traveler", when: "Nov 2025", score10: 8, text: "Elevators were busy at peak times and breakfast lines moved slowly, but overall solid Loop value and easy access to the park.", chips: ["Location", "Breakfast wait", "Elevators"] }
      ]
    },
    {
      id: "h2",
      name: "Swissôtel Chicago",
      brand: "Swissôtel (Accor)",
      stars: 4,
      price: 269,
      neighborhood: "River East",
      distance: "0.4 mi to Navy Pier",
      address: "323 E Upper Wacker Dr, Chicago, IL",
      tags: ["River views", "Near Navy Pier"],
      amenities: ["Indoor pool", "Fitness center", "Dining", "Wi‑Fi"],
      room: "Classic King • ~350 sq ft",
      about: "Glass-tower hotel along the river with strong views and quick access to the Lakefront Trail and Navy Pier.",
      policy: "Check‑in 3 PM • Check‑out 12 PM",
      cancellation: "Free cancellation until 24 hours before arrival (rate-dependent).",
      poi: ["Chicago Riverwalk", "Navy Pier", "Magnificent Mile"],
      poiDetails: [
        { name: "Navy Pier", distance: "0.4 mi" },
        { name: "Riverwalk", distance: "0.1 mi" },
        { name: "Magnificent Mile", distance: "0.5 mi" }
      ],
      roomsDetail: [
        "Classic King — ~350 sq ft",
        "Double Queen — ~360 sq ft"
      ],
      guestRating: 8.6,
      guestReviewCount: 2890,
      ratingBreakdown: { Staff: 8.8, Facilities: 8.7, Cleanliness: 8.9, Comfort: 8.6, "Value for money": 8.1, Location: 9.0 },
      reviews: [
        { who: "United States • Family", when: "Jan 2026", score10: 9, text: "Kids loved the pool and we liked the views at night. Short rideshare to Navy Pier; rooms were modern and housekeeping was consistent.", chips: ["Pool", "Views", "Family"] },
        { who: "Germany • Business traveler", when: "Dec 2025", score10: 8, text: "Conference week meant elevators were slow during rush—plan extra time. Otherwise a comfortable base with reliable Wi‑Fi for video calls.", chips: ["Elevators", "Wi‑Fi", "Business"] },
        { who: "United States • Couple", when: "Oct 2025", score10: 8, text: "Great sunrise over the lake from our floor. On-site breakfast was pricey; we mostly walked to cafés along the river.", chips: ["Views", "Breakfast price", "River access"] }
      ]
    },
    {
      id: "h3",
      name: "Hyatt Regency Chicago",
      brand: "Hyatt",
      stars: 4,
      price: 249,
      neighborhood: "East Loop",
      distance: "0.3 mi to Chicago Riverwalk",
      address: "151 E Wacker Dr, Chicago, IL",
      tags: ["Convention access", "Large property"],
      amenities: ["Multiple restaurants", "Fitness center", "Business services", "Wi‑Fi"],
      room: "Standard King • ~300 sq ft",
      about: "One of the city’s largest hotels—popular with convention guests—with extensive dining and a short walk to the Riverwalk.",
      policy: "Check‑in 3 PM • Check‑out 11 AM",
      cancellation: "Free cancellation until 24 hours before arrival (rate-dependent).",
      poi: ["Riverwalk", "Millennium Park", "Grant Park"],
      poiDetails: [
        { name: "Chicago Riverwalk", distance: "0.3 mi" },
        { name: "Millennium Park", distance: "0.4 mi" },
        { name: "Grant Park", distance: "0.5 mi" }
      ],
      roomsDetail: [
        "Standard King — ~300 sq ft",
        "Double Queen — ~310 sq ft"
      ],
      guestRating: 8.2,
      guestReviewCount: 6830,
      ratingBreakdown: { Staff: 8.3, Facilities: 8.4, Cleanliness: 8.5, Comfort: 8.0, "Value for money": 8.1, Location: 8.9 },
      reviews: [
        { who: "United States • Conference attendee", when: "Feb 2026", score10: 8, text: "Expect long walks from the elevator to some towers—signage helps but it’s a maze the first day. Once oriented, it’s efficient and staff handle big crowds well.", chips: ["Layout", "Conventions", "Staff"] },
        { who: "Australia • Leisure", when: "Jan 2026", score10: 9, text: "Requested a higher river-facing room and it delivered—great skyline at night. Lobby coffee lines were long in the morning.", chips: ["River view", "Skyline", "Lobby busy"] },
        { who: "United States • Solo traveler", when: "Nov 2025", score10: 7, text: "Check-in queued during a major event weekend. Room was clean and basic—fine as a crash pad when you’re out all day.", chips: ["Check-in wait", "Clean room", "Value"] }
      ]
    },
    {
      id: "h4",
      name: "LondonHouse Chicago, Curio Collection",
      brand: "Hilton (Curio)",
      stars: 5,
      price: 329,
      neighborhood: "Michigan Avenue",
      distance: "0.1 mi to Chicago Riverwalk",
      address: "85 E Wacker Dr at Michigan Ave, Chicago, IL",
      tags: ["Rooftop bar", "River & Magnificent Mile"],
      amenities: ["Rooftop venue", "Fitness center", "Dining", "Wi‑Fi"],
      room: "King Room • ~280 sq ft",
      about: "Curio Collection hotel at Michigan and Wacker with a popular rooftop and quick access to the Riverwalk and shopping corridors.",
      policy: "Check‑in 4 PM • Check‑out 11 AM",
      cancellation: "Non‑refundable rates available; flexible rates vary.",
      poi: ["Riverwalk", "Magnificent Mile", "Wrigley Building"],
      poiDetails: [
        { name: "Chicago Riverwalk", distance: "0.1 mi" },
        { name: "Magnificent Mile", distance: "0.2 mi" },
        { name: "Wrigley Building", distance: "0.1 mi" }
      ],
      roomsDetail: [
        "King — ~280 sq ft",
        "Double Queen — ~300 sq ft"
      ],
      guestRating: 8.8,
      guestReviewCount: 3560,
      ratingBreakdown: { Staff: 9.0, Facilities: 8.8, Cleanliness: 9.0, Comfort: 8.6, "Value for money": 7.9, Location: 9.6 },
      reviews: [
        { who: "United States • Couple", when: "Dec 2025", score10: 10, text: "Rooftop at sunset was the highlight—worth booking ahead. Room was compact but stylish; we barely spent time inside anyway.", chips: ["Rooftop", "Design", "Location"] },
        { who: "United Kingdom • Leisure", when: "Nov 2025", score10: 8, text: "Valet and elevators backed up during a busy Friday; staff apologized and offered water while we waited. Beds were very comfortable.", chips: ["Peak waits", "Service recovery", "Beds"] },
        { who: "United States • Business traveler", when: "Oct 2025", score10: 9, text: "Walkable to meetings along the river. Housekeeping missed one afternoon but front desk sent someone within 20 minutes.", chips: ["Walkability", "Housekeeping", "Front desk"] }
      ]
    },
    {
      id: "h5",
      name: "Virgin Hotels Chicago",
      brand: "Virgin Hotels",
      stars: 4,
      price: 289,
      neighborhood: "Loop / Theater",
      distance: "0.2 mi to Chicago Theatre",
      address: "203 N Wabash Ave, Chicago, IL",
      tags: ["Design-forward", "On-site dining"],
      amenities: ["Commons Club", "Fitness room", "Pet-friendly", "Wi‑Fi"],
      room: "Chamber King • ~275 sq ft",
      about: "Design-led Virgin property with a social lobby concept and theater-district access; rooms use the brand’s two-chamber layout.",
      policy: "Check‑in 3 PM • Check‑out 12 PM",
      cancellation: "Free cancellation until 24–48 hours before arrival (rate-dependent).",
      poi: ["Chicago Theatre", "Millennium Park", "Art Institute"],
      poiDetails: [
        { name: "Chicago Theatre", distance: "0.2 mi" },
        { name: "Millennium Park", distance: "0.3 mi" },
        { name: "Art Institute", distance: "0.4 mi" }
      ],
      roomsDetail: [
        "Chamber King — ~275 sq ft",
        "Chamber Double — ~290 sq ft"
      ],
      guestRating: 8.5,
      guestReviewCount: 2140,
      ratingBreakdown: { Staff: 8.9, Facilities: 8.4, Cleanliness: 8.7, Comfort: 8.4, "Value for money": 8.0, Location: 9.1 },
      reviews: [
        { who: "United States • Friends", when: "Jan 2026", score10: 9, text: "Fun vibe and clever room layout once you get used to it. Late-night street noise on lower floors—ask for a higher room if you’re sensitive.", chips: ["Design", "Night noise", "Social spaces"] },
        { who: "Canada • Couple", when: "Dec 2025", score10: 8, text: "Commons Club drinks were great; service slowed when it got packed. Location made it easy to hop the L and explore.", chips: ["Bar", "Service pace", "Transit"] },
        { who: "United States • Solo traveler", when: "Nov 2025", score10: 8, text: "Wi‑Fi held up for streaming and work. Gym is small for a hotel this size but never crowded during my stay.", chips: ["Wi‑Fi", "Gym size"] }
      ]
    },
    {
      id: "h6",
      name: "Kimpton Hotel Monaco Chicago",
      brand: "Kimpton (IHG)",
      stars: 4,
      price: 259,
      neighborhood: "Chicago Loop",
      distance: "0.15 mi to Washington/Wabash L",
      address: "225 N Wabash Ave, Chicago, IL",
      tags: ["Boutique", "Pet-friendly"],
      amenities: ["Evening wine hour", "Yoga mats", "On‑site dining", "Wi‑Fi"],
      room: "Standard King • ~300 sq ft",
      about: "Boutique Kimpton in a historic building with playful design, pet-friendly policies, and strong theater-district walkability.",
      policy: "Check‑in 3 PM • Check‑out 12 PM",
      cancellation: "Free cancellation until 48 hours before arrival (rate-dependent).",
      poi: ["Chicago Theatre", "Riverwalk", "Millennium Park"],
      poiDetails: [
        { name: "Washington/Wabash CTA", distance: "0.15 mi" },
        { name: "Chicago Riverwalk", distance: "0.25 mi" },
        { name: "Millennium Park", distance: "0.35 mi" }
      ],
      roomsDetail: [
        "Standard King — ~300 sq ft",
        "Deluxe Double — ~320 sq ft"
      ],
      guestRating: 8.7,
      guestReviewCount: 1980,
      ratingBreakdown: { Staff: 9.2, Facilities: 8.3, Cleanliness: 8.8, Comfort: 8.5, "Value for money": 8.3, Location: 9.2 },
      reviews: [
        { who: "United States • Couple", when: "Jan 2026", score10: 9, text: "Front desk remembered we were celebrating and upgraded us—unexpected and kind. Walls are a bit thin; we heard neighbors once.", chips: ["Service", "Upgrade", "Noise"] },
        { who: "United States • Family + pet", when: "Dec 2025", score10: 9, text: "Traveling with a small dog was easy; no awkward fees at check-in. Wine hour was crowded but friendly.", chips: ["Pet-friendly", "Wine hour", "Fees clear"] },
        { who: "Ireland • Business traveler", when: "Oct 2025", score10: 8, text: "Boutique charm beats cookie-cutter towers for me. Desk chair could be better for long workdays.", chips: ["Character", "Ergonomic chair"] }
      ]
    }
  ];

  function starText(n) {
    let s = "";
    for (let i = 0; i < n; i++) s += "★";
    return s;
  }

  function formatMoney(n) {
    return "$" + String(n);
  }

  function bySort(value) {
    const hotels = HOTELS.slice();
    if (value === "price_low") hotels.sort((a,b) => a.price - b.price);
    if (value === "price_high") hotels.sort((a,b) => b.price - a.price);
    if (value === "stars_high") hotels.sort((a,b) => b.stars - a.stars);
    return hotels;
  }

  function renderResults() {
    const { phase } = qs();
    document.getElementById("phaseLabel").textContent = phase;
    const cond = qs().cond;
    document.getElementById("condLabel").textContent = cond;

    const coverStory = document.getElementById("coverStory");
    coverStory.style.display = (phase === "1") ? "block" : "none";

    const sortValue = document.getElementById("sortSelect").value;
    const hotels = bySort(sortValue);
    const results = document.getElementById("results");
    results.innerHTML = "";

    for (const h of hotels) {
      const card = document.createElement("article");
      card.className = "card";
      card.setAttribute("data-hotel-id", h.id);

      const img = mediaThumb(h.id) || makeSvgDataUri(h.name);
      card.innerHTML = `
        <div class="thumb">
          <div class="thumb__badge">${h.neighborhood}</div>
          <img class="thumb__img" alt="${escapeXml(h.name)} — exterior" src="${img}" loading="lazy" decoding="async">
        </div>
        <div class="card__body">
          <div>
            <h3 class="hotel-title">${h.name}</h3>
            <div class="card__brand">${escapeXml(h.brand)}</div>
            <div class="sub">${h.distance} • ${h.room}</div>
            <div class="stars" aria-label="${h.stars} stars">${starText(h.stars)}</div>
            <div>
              ${h.tags.map(t => `<span class="pill2">${t}</span>`).join("")}
            </div>
            <div class="amenities">
              ${h.amenities.map(a => amenityChipHtml(a)).join("")}
            </div>
          </div>

          <div class="priceBox">
            <div>
              <div class="price">${formatMoney(h.price)}</div>
              <div class="per">per night • taxes may apply</div>
            </div>
            <div class="cta">
              <button class="btn" type="button" data-open="${h.id}">See availability</button>
              <button class="btn2" type="button" data-open="${h.id}">View details</button>
            </div>
          </div>
        </div>
      `;

      results.appendChild(card);
      bindImgFallbacksIn(card);
    }
  }

  function ratingBreakdownRows(hotel) {
    const b = hotel.ratingBreakdown;
    if (!b) return "";
    return Object.keys(b).map(k => `
      <div class="breakdown__row">
        <span class="breakdown__k">${escapeXml(k)}</span>
        <span class="breakdown__v">${escapeXml(String(b[k]))}</span>
      </div>
    `).join("");
  }

  function modalTemplate(hotel) {
    const { phase, cond } = qs();

    const showReviews = (phase === "2");
    const summaryKind = cond;

    const vanillaSummary = {
      title: "AI summary (general)",
      tag: "Vanilla",
      text: "Guests mention the location and overall comfort most. Service is generally described as helpful. A few reviews note trade-offs like morning breakfast crowding or occasional noise depending on room placement.",
      bullets: ["Overall: mostly positive experiences", "Common mentions: location, comfort, staff", "Trade-offs: breakfast timing, noise variability"]
    };

    const newsSummary = {
      title: "AI summary (guided)",
      tag: "Newsworthiness-guided",
      text: "Most reviews align with what you’d expect, but a few points are especially informative given typical misbeliefs: noise can vary by room/side, and Wi‑Fi is mentioned as stable in specific contexts (calls/streaming).",
      bullets: ["High-signal: noise differences by room placement", "High-signal: Wi‑Fi stability for calls", "Low-signal: generic compliments repeated"]
    };

    let summary = null;
    if (showReviews && summaryKind === "vanilla") summary = vanillaSummary;
    if (showReviews && summaryKind === "newsworthy") summary = newsSummary;

    const phase1Banner = (phase === "1") ? `
      <div class="modal-banner" role="note">
        <strong>Recently relisted.</strong> This listing has recently been relisted on our platform. Guest ratings and reviews are being migrated and are not yet displayed.
      </div>
    ` : "";

    const poiRows = (hotel.poiDetails || []).map(p => `<dt>${escapeXml(p.name)}</dt><dd>${escapeXml(p.distance)}</dd>`).join("");

    return `
      <div class="modal-backdrop" data-close="1"></div>
      <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeXml(hotel.name)} details">
        <div class="modal__top">
          <div>
            <h2 class="modal__title">${escapeXml(hotel.name)}</h2>
            <div class="brand-pill">${escapeXml(hotel.brand)}</div>
            <div class="sub">${escapeXml(hotel.neighborhood)} • ${escapeXml(hotel.distance)} • <span aria-label="${hotel.stars} stars">${starText(hotel.stars)}</span></div>
          </div>
          <button class="xbtn" type="button" data-close="1" aria-label="Close">✕</button>
        </div>

        <div class="modal__scroll" id="hotelModalScroll" data-hotel-scroll="1">
          ${phase1Banner}
          <div class="modal__grid">
            <div class="modal__left">
              <div data-track-section="gallery" class="section section--flush">
              ${buildPhotoGallery(hotel)}
              </div>

              <div class="section">
                <h3>About this property</h3>
                <div data-track-section="description" class="track-slice">
                  <div class="kv">
                    <div class="k">Address</div><div>${escapeXml(hotel.address || "")}</div>
                    <div class="k">Description</div><div>${escapeXml(hotel.about)}</div>
                    <div class="k">Featured room</div><div>${escapeXml(hotel.room)}</div>
                  </div>
                </div>
                <details class="room-types-details" data-track-section="room_types" data-track-id="room_types_expand">
                  <summary class="room-types-details__summary">Room types &amp; sizes <span class="sub" style="font-weight:600">(tap to expand)</span></summary>
                  <div class="kv" style="margin-top:8px">
                    ${hotel.roomsDetail.map((r, i) => `<div class="k">Type ${i + 1}</div><div>${escapeXml(r)}</div>`).join("")}
                  </div>
                </details>
                <div data-track-section="policies" class="track-slice" style="margin-top:10px">
                  <div class="kv">
                    <div class="k">Check‑in / check‑out</div><div>${escapeXml(hotel.policy)}</div>
                    <div class="k">Cancellation</div><div>${escapeXml(hotel.cancellation)}</div>
                  </div>
                </div>
              </div>

              <div class="section" data-track-section="amenities">
                <h3>Amenities</h3>
                <div class="amenities">
                  ${hotel.amenities.map(a => amenityChipHtml(a)).join("")}
                </div>
              </div>
            </div>

            <div class="modal__right">
              <div class="section" data-track-section="map">
                <h3>Location</h3>
                <div class="map" id="mapBox" data-map="1" aria-label="Map area (interactive)">
                  <div class="pin" aria-hidden="true"></div>
                  <div class="map__hint">Landmarks: ${hotel.poi.map(escapeXml).join(" • ")}</div>
                </div>
                <dl class="map__landmarks">
                  ${poiRows}
                </dl>
              </div>

              <div class="section" data-track-section="price_cta">
                <h3>Price</h3>
                <div class="price">${formatMoney(hotel.price)}</div>
                <div class="per">per night</div>
                <div class="cta" style="margin-top:10px">
                  <button class="btn" type="button" data-book="${hotel.id}">Book this hotel</button>
                  <button class="btn2" type="button" data-fave="${hotel.id}">Save</button>
                </div>
              </div>

              ${summary ? `
                <div class="section" data-track-section="summary">
                  <div class="summary" id="summaryPanel">
                    <div class="summary__head">
                      <div class="summary__title">${escapeXml(summary.title)}</div>
                      <div class="tag">${escapeXml(summary.tag)}</div>
                    </div>
                    <div class="summary__text">${escapeXml(summary.text)}</div>
                    <ul class="summary__bullets">
                      ${summary.bullets.map(b => `<li>${escapeXml(b)}</li>`).join("")}
                    </ul>
                  </div>
                </div>
              ` : ``}

              ${showReviews ? `
                <div class="section">
                  <h3>Guest ratings</h3>
                  <div data-track-section="guest_ratings">
                  <div class="scorecard">
                    <div class="scorecard__big" aria-label="Overall guest score">${escapeXml(String(hotel.guestRating))}</div>
                    <div class="scorecard__meta">
                      <div class="scorecard__denom">/ 10</div>
                      <div class="scorecard__count">${Number(hotel.guestReviewCount || 0).toLocaleString()} reviews (prototype dataset)</div>
                    </div>
                  </div>
                  <div class="breakdown" aria-label="Rating by category">
                    ${ratingBreakdownRows(hotel)}
                  </div>
                  </div>
                <div class="reviews" id="reviews" data-track-section="reviews">
                  <div class="reviews__head">
                    <h3 style="margin:0">Guest reviews</h3>
                    <div class="tag">Sample of ${hotel.reviews.length} shown</div>
                  </div>
                  ${hotel.reviews.map(r => `
                    <div class="review" data-review="1">
                      <div class="review__meta">
                        <div><strong>${escapeXml(r.who)}</strong></div>
                        <div>${escapeXml(r.when)}${typeof r.score10 === "number" ? ` • <span class="review__score">${escapeXml(String(r.score10))}/10</span>` : ""}</div>
                      </div>
                      <div class="review__quote">“${escapeXml(r.text)}”</div>
                      <div class="chipRow">
                        ${r.chips.map(c => `<span class="chip" data-chip="${escapeXml(c)}">${escapeXml(c)}</span>`).join("")}
                      </div>
                    </div>
                  `).join("")}
                  <p class="review-proto-note">
                    <strong>Research prototype.</strong> Properties are real Chicago hotels; displayed scores and review texts are <em>curated for this study</em> from commonly discussed guest themes (not a live booking-site feed). For current ratings, consult the hotel or major OTAs.
                  </p>
                </div>
                </div>
              ` : ``}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function openHotelModal(hotelId, source) {
    const hotel = HOTELS.find(h => h.id === hotelId);
    if (!hotel) return;

    if (activeHotelSession) {
      logEvent("hotel_page_time", {
        hotelId: activeHotelSession.hotelId,
        durationMs: Date.now() - activeHotelSession.startedAt,
        reason: "replaced"
      });
      logEvent("hotel_scroll_depth", {
        hotelId: activeHotelSession.hotelId,
        maxDepth: activeHotelSession.maxScrollDepth || 0,
        reason: "replaced"
      });
    }

    activeHotelSession = { hotelId, startedAt: Date.now(), maxScrollDepth: 0 };

    const root = document.getElementById("modalRoot");
    if (typeof modalScrollCleanup === "function") modalScrollCleanup();

    root.setAttribute("data-active-hotel", hotelId);
    root.innerHTML = modalTemplate(hotel);
    bindImgFallbacksIn(root);
    root.setAttribute("data-active-hotel", hotelId);
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    location.hash = "#hotel/" + hotelId;

    logEvent("open_hotel", { hotelId, source });

    const mapBox = root.querySelector("[data-map='1']");
    let lastMapHoverMs = 0;
    if (mapBox) {
      mapBox.addEventListener("click", (e) => {
        logEvent("map_click", { hotelId, x: e.offsetX, y: e.offsetY });
        logEvent("map_interaction", { hotelId, kind: "click", x: e.offsetX, y: e.offsetY });
      });
      mapBox.addEventListener("mousemove", (e) => {
        const t = Date.now();
        if (t - lastMapHoverMs < 380) return;
        lastMapHoverMs = t;
        logEvent("map_interaction", { hotelId, kind: "mousemove", x: e.offsetX, y: e.offsetY });
      });
      mapBox.addEventListener("wheel", (e) => {
        logEvent("map_interaction", { hotelId, kind: "wheel", deltaY: e.deltaY });
      }, { passive: true });
    }

    const scrollEl = root.querySelector("[data-hotel-scroll='1']");
    if (scrollEl) {
      const onScroll = () => {
        if (!activeHotelSession || activeHotelSession.hotelId !== hotelId) return;
        const denom = Math.max(1, scrollEl.scrollHeight - scrollEl.clientHeight);
        const depth = Math.min(1, Math.max(0, scrollEl.scrollTop / denom));
        if (depth > activeHotelSession.maxScrollDepth) activeHotelSession.maxScrollDepth = depth;
        if (Math.random() < 0.12) {
          logEvent("scroll_depth", { hotelId, depth, context: "hotel_modal" });
        }
      };
      scrollEl.addEventListener("scroll", onScroll, { passive: true });
      modalScrollCleanup = () => {
        scrollEl.removeEventListener("scroll", onScroll);
        modalScrollCleanup = null;
      };
    } else {
      modalScrollCleanup = null;
    }

    root.querySelectorAll(".gimg").forEach(img => {
      img.addEventListener("click", () => {
        logEvent("photo_click", { hotelId, photo: img.getAttribute("data-photo") || "unknown" });
      });
    });

    root.querySelectorAll("[data-amenity]").forEach(a => {
      a.addEventListener("mouseenter", () => logEvent("amenity_hover", { hotelId, amenity: a.getAttribute("data-amenity") }));
      a.addEventListener("click", () => logEvent("amenity_click", { hotelId, amenity: a.getAttribute("data-amenity") }));
    });

    const summaryPanel = root.querySelector("#summaryPanel");
    if (summaryPanel) {
      logEvent("summary_impression", { hotelId, cond: qs().cond });
      summaryPanel.addEventListener("mouseenter", () => logEvent("summary_hover", { hotelId }));
    }

    const reviews = root.querySelector("#reviews");
    if (reviews) {
      reviews.addEventListener("mouseenter", () => logEvent("reviews_hover", { hotelId }));
      reviews.addEventListener("click", (e) => {
        const chip = e.target && e.target.closest && e.target.closest("[data-chip]");
        if (chip) logEvent("review_chip_click", { hotelId, chip: chip.getAttribute("data-chip") });
      });
    }

    root.querySelectorAll("[data-book]").forEach(b => {
      b.addEventListener("click", () => logEvent("book_click", { hotelId }));
    });
    root.querySelectorAll("[data-fave]").forEach(b => {
      b.addEventListener("click", () => logEvent("save_click", { hotelId }));
    });
  }

  function closeModal(source) {
    const root = document.getElementById("modalRoot");
    if (!root.classList.contains("is-open")) return;

    if (activeHotelSession) {
      logEvent("hotel_page_time", {
        hotelId: activeHotelSession.hotelId,
        durationMs: Date.now() - activeHotelSession.startedAt,
        closedVia: source
      });
      logEvent("hotel_scroll_depth", {
        hotelId: activeHotelSession.hotelId,
        maxDepth: activeHotelSession.maxScrollDepth || 0
      });
      activeHotelSession = null;
    }

    if (typeof modalScrollCleanup === "function") modalScrollCleanup();

    root.classList.remove("is-open");
    root.removeAttribute("data-active-hotel");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = "";
    document.body.style.overflow = "";
    if ((location.hash || "").startsWith("#hotel/")) location.hash = "#results";
    logEvent("close_modal", { source });
  }

  function wireGlobalHandlers() {
    const { phase } = qs();
    document.getElementById("phaseLabel").textContent = phase;
    document.getElementById("condLabel").textContent = qs().cond;

    document.getElementById("sortSelect").addEventListener("change", (e) => {
      logEvent("sort_change", { value: e.target.value });
      renderResults();
    });

    document.getElementById("downloadLogBtn").addEventListener("click", () => {
      const logs = getLogs();
      const lines = logs.map(x => JSON.stringify(x)).join("\n");
      download("mock_hotel_logs.jsonl", lines);
      logEvent("download_log", { count: logs.length });
    });

    document.getElementById("resetLogBtn").addEventListener("click", () => {
      setLogs([]);
      logEvent("reset_log", {});
    });

    document.addEventListener("click", (e) => {
      const open = e.target && e.target.closest && e.target.closest("[data-open]");
      if (open) {
        const hotelId = open.getAttribute("data-open");
        openHotelModal(hotelId, "results");
        return;
      }

      const close = e.target && e.target.closest && e.target.closest("[data-close='1']");
      if (close) {
        closeModal("click");
        return;
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal("escape");
    });

    window.addEventListener("scroll", () => {
      const modalRoot = document.getElementById("modalRoot");
      if (modalRoot && modalRoot.classList.contains("is-open")) return;
      const d = document.documentElement;
      const scrollTop = d.scrollTop || document.body.scrollTop || 0;
      const scrollHeight = d.scrollHeight || 1;
      const clientHeight = d.clientHeight || 1;
      const depth = Math.min(1, Math.max(0, scrollTop / Math.max(1, scrollHeight - clientHeight)));
      if (Math.random() < 0.06) logEvent("scroll_depth", { depth, context: "results_page" });
    }, { passive: true });

    document.addEventListener("mouseover", (e) => {
      const a = e.target && e.target.closest && e.target.closest("[data-amenity]");
      if (a) logEvent("amenity_hover", { amenity: a.getAttribute("data-amenity"), context: "results" });
    }, { passive: true });

    window.addEventListener("hashchange", () => {
      const h = location.hash || "";
      if (!h.startsWith("#hotel/")) return;
      const id = h.split("/")[1];
      openHotelModal(id, "deeplink");
    });
  }

  function init() {
    const p = new URLSearchParams(location.search);
    if (!p.get("phase")) {
      p.set("phase", "1");
      history.replaceState(null, "", location.pathname + "?" + p.toString());
    }

    renderResults();
    wireGlobalHandlers();

    logEvent("page_load", { phase: qs().phase, cond: qs().cond });

    const h = location.hash || "";
    if (h.startsWith("#hotel/")) {
      const id = h.split("/")[1];
      openHotelModal(id, "deeplink");
    }
  }

  init();
})();

