(() => {
  const STORAGE_KEY = "mock_hotel_logs_v2";
  const UI_STATE_KEY = "mock_hotel_ui_state_v1";

  let activeHotelSession = null;
  let modalScrollCleanup = null;
  const REVIEW_INITIAL_VISIBLE = 12;
  const REVIEW_BATCH_VISIBLE = 24;

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

  function getUiState() {
    const state = safeJsonParse(localStorage.getItem(UI_STATE_KEY), {}) || {};
    return {
      selectedHotelId: state.selectedHotelId || "",
      savedHotelIds: Array.isArray(state.savedHotelIds) ? state.savedHotelIds : []
    };
  }

  function setUiState(state) {
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(state || {}));
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

  function pageState() {
    const p = new URLSearchParams(location.search);
    const path = location.pathname.toLowerCase();
    const reviewParam = (p.get("reviews") || "").toLowerCase();
    const bodyVersion = (document.body.dataset.reviewVersion || "auto").toLowerCase();
    const legacyPhase = p.get("phase");

    let showReviews = false;
    if (["1", "true", "yes", "with"].includes(reviewParam)) showReviews = true;
    else if (["0", "false", "no", "without"].includes(reviewParam)) showReviews = false;
    else if (bodyVersion === "with") showReviews = true;
    else if (bodyVersion === "without") showReviews = false;
    else if (path.includes("with-reviews") || legacyPhase === "2") showReviews = true;

    return {
      showReviews,
      versionLabel: showReviews ? "Phase 2 full reviews" : "Phase 1 browsing",
      phase: showReviews ? "2" : "1"
    };
  }

  function escapeXml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function amenityChipHtml(a) {
    return `<span class="amenity" data-amenity="${escapeXml(a)}">${escapeXml(a)}</span>`;
  }

  function pendryReviewDerivedSet() {
    const months = [
      "Jun 2026", "May 2026", "Mar 2026", "Jan 2026", "Oct 2025",
      "Sep 2025", "Aug 2025", "Jul 2025", "Jun 2025", "May 2025",
      "Mar 2025", "Jan 2025", "Dec 2024", "Nov 2024", "Oct 2024",
      "Sep 2024", "Aug 2024", "Jul 2024", "Jun 2024", "May 2024"
    ];
    const travelerMix = [
      "couple", "couple", "family", "group", "solo traveler",
      "business traveler", "friends on a weekend trip"
    ];
    const detailSentences = [
      "The historic architecture gave the stay a polished Chicago feel.",
      "Housekeeping kept the room fresh throughout the stay.",
      "The bed and pillows were a highlight after long days in the city.",
      "The concierge and front desk were easy to reach when we had questions.",
      "The bar and restaurant spaces made it convenient to stay in for part of the evening.",
      "Transit and major attractions were close enough that we walked more than expected.",
      "The gym and in-room amenities made the hotel feel more complete.",
      "It felt upscale without being too formal.",
      "The experience worked best when expectations around fees and reservations were clear.",
      "Small service touches helped balance the occasional old-building inconvenience."
    ];
    const baseReviews = [
      {
        score5: 5,
        chips: ["Location", "Service", "Cleanliness"],
        text: "The Michigan Avenue location made our plans easy, and the staff handled every request with warmth. The room felt spotless and comfortable."
      },
      {
        score5: 5,
        chips: ["Design", "Comfort", "Location"],
        text: "The building has a memorable Art Deco character, but the room still felt modern and easy to use. We loved being close to the river and Millennium Park."
      },
      {
        score5: 5,
        chips: ["Service", "Celebration", "Room comfort"],
        text: "The team made a special occasion feel personal with thoughtful service. Our room was spacious, clean and very comfortable."
      },
      {
        score5: 4,
        chips: ["Location", "Noise"],
        text: "The location is excellent for sightseeing, restaurants and transit. The trade-off was street noise at night, especially from sirens and traffic."
      },
      {
        score5: 4,
        chips: ["Room comfort", "Elevators"],
        text: "The room itself was comfortable and nicely styled. Elevator waits were the main annoyance during busier parts of the day."
      },
      {
        score5: 5,
        chips: ["Breakfast", "Service", "Convenience"],
        text: "Breakfast in the hotel was convenient and better than expected. Staff were quick to answer questions and made the stay feel smooth."
      },
      {
        score5: 4.5,
        chips: ["Architecture", "Room size", "Comfort"],
        text: "We liked the historic setting and the room had more space than we expected. The furniture and bedding made it easy to settle in."
      },
      {
        score5: 4,
        chips: ["Value", "Charges", "Location"],
        text: "The hotel is beautiful and the location is hard to beat. Extra charges and the overall price made the value feel less strong."
      },
      {
        score5: 5,
        chips: ["Cleanliness", "Housekeeping", "Service"],
        text: "The room was cleaned carefully each day and the common areas looked well maintained. Staff were friendly without feeling scripted."
      },
      {
        score5: 4,
        chips: ["Rooftop", "Bar", "Expectations"],
        text: "The bar areas had a good atmosphere and the hotel felt lively. We were disappointed when the rooftop was unavailable during part of the stay."
      },
      {
        score5: 4.5,
        chips: ["Fitness center", "Room service", "Comfort"],
        text: "The fitness center was better equipped than we expected, and room service arrived quickly. The room was quiet enough most of the time."
      },
      {
        score5: 4,
        chips: ["Noise", "Location", "Room size"],
        text: "The room size and central location were strong points. Noise from Michigan Avenue made sleep lighter than usual on one night."
      },
      {
        score5: 5,
        chips: ["Walkability", "Staff", "Design"],
        text: "We could walk to museums, the Riverwalk and shopping without much planning. The staff gave helpful directions and the hotel design felt special."
      },
      {
        score5: 4.5,
        chips: ["Cleanliness", "Comfort", "Amenities"],
        text: "The room was clean, the bathroom worked well and the bed was very comfortable. In-room amenities made short breaks between outings easy."
      },
      {
        score5: 4,
        chips: ["Room issue", "Cleanliness"],
        text: "Most of the stay was excellent, but one room detail needed more attention. The staff responded professionally and the room otherwise felt clean."
      },
      {
        score5: 5,
        chips: ["Concierge", "Service", "Luxury feel"],
        text: "The concierge reached out before arrival and helped us feel prepared. Service made the hotel feel like a true luxury stay."
      },
      {
        score5: 4,
        chips: ["Food", "Fees", "Comfort"],
        text: "The room was comfortable and dining in the hotel was convenient. Food and delivery fees felt high compared with the rest of the experience."
      },
      {
        score5: 5,
        chips: ["Family", "Location", "Cleanliness"],
        text: "For a family trip, the location made sightseeing simple. The room and public spaces were clean, and staff were patient with questions."
      },
      {
        score5: 4.5,
        chips: ["View", "Historic building", "Comfort"],
        text: "The historic building and interior style were a big part of the appeal. Our room was comfortable, though the view depended a lot on the floor."
      },
      {
        score5: 4,
        chips: ["Parking", "Value", "Location"],
        text: "The central location was convenient, but parking and add-on costs made the stay feel pricey. We still liked the hotel overall."
      },
      {
        score5: 5,
        chips: ["Bar", "Atmosphere", "Service"],
        text: "The lobby and bar had a great atmosphere after a day out. Staff remembered details and made the hotel feel welcoming."
      },
      {
        score5: 4,
        chips: ["Coffee", "Room amenities"],
        text: "The in-room coffee setup and minibar were useful, though we wished some amenities were easier to manage. The room itself was comfortable."
      },
      {
        score5: 4.5,
        chips: ["Transit", "Walkability", "Location"],
        text: "Nearby train stops made the city easy to navigate. We also walked to several attractions because the hotel is so central."
      },
      {
        score5: 4,
        chips: ["Noise", "Sleep quality"],
        text: "The bed was excellent, but outside noise could still be heard even from an upper floor. Light sleepers may want to request a quieter room."
      },
      {
        score5: 5,
        chips: ["Cleanliness", "Design", "Staff"],
        text: "The hotel looked beautiful inside and out, and the room felt carefully maintained. Staff made check-in and checkout easy."
      },
      {
        score5: 4.5,
        chips: ["Breakfast", "Restaurant", "Convenience"],
        text: "Breakfast and the cafe were convenient before heading out. The restaurant was not the main reason to stay, but it worked well for a busy schedule."
      },
      {
        score5: 4,
        chips: ["Bathroom", "Maintenance"],
        text: "The stay was comfortable overall, though a bathroom fixture needed attention. The rest of the room felt updated and clean."
      },
      {
        score5: 5,
        chips: ["Room size", "Comfort", "Service"],
        text: "The larger room category felt worth it for the extra space. Service was attentive and the bed made it easy to recover after long walks."
      },
      {
        score5: 4,
        chips: ["Check-in", "Service", "Amenities"],
        text: "Check-in took longer than expected, but staff handled the delay politely. Once settled, the amenities and location made the stay easy."
      },
      {
        score5: 4.5,
        chips: ["Historic building", "Vibe", "Location"],
        text: "The hotel has a strong sense of place and a stylish atmosphere. It worked especially well as a base for exploring central Chicago."
      },
      {
        score5: 5,
        chips: ["Valet", "Front desk", "Service"],
        text: "Valet and front desk service were both efficient and friendly. The team helped the stay feel calm even in a busy part of the city."
      },
      {
        score5: 4,
        chips: ["Rooftop", "Planning"],
        text: "We enjoyed the hotel but wished rooftop access had been clearer before arrival. The main bar and lobby spaces were still enjoyable."
      },
      {
        score5: 4.5,
        chips: ["Cleanliness", "Location", "Value"],
        text: "Cleanliness and location were the strongest parts of the stay. The rate was on the high side, but the convenience helped justify it."
      },
      {
        score5: 5,
        chips: ["Room comfort", "Quiet", "Bar"],
        text: "Our room felt restful and the bar was a pleasant place to end the day. The hotel felt polished from arrival to checkout."
      },
      {
        score5: 4,
        chips: ["Elevators", "Busy hotel"],
        text: "The hotel was busy, and the elevator setup occasionally slowed us down. Aside from that, the room and staff were very good."
      },
      {
        score5: 4.5,
        chips: ["Gym", "Amenities", "Staff"],
        text: "The gym and amenities were a nice surprise for a city hotel. Staff were consistently approachable and helpful."
      },
      {
        score5: 5,
        chips: ["Luxury feel", "Cleanliness", "Comfort"],
        text: "The stay felt luxurious without being uncomfortable or overly formal. The room was spotless and the bedding was excellent."
      },
      {
        score5: 4,
        chips: ["Food", "Value"],
        text: "Food at the property was convenient, but prices added up quickly. We appreciated having dining options on site anyway."
      },
      {
        score5: 4.5,
        chips: ["Transit", "Museums", "Location"],
        text: "The hotel made museum days simple because transit and major sights were nearby. We spent less time arranging transportation than expected."
      },
      {
        score5: 5,
        chips: ["Staff", "Return stay", "Location"],
        text: "The staff made us feel recognized and looked after. Between the service and the location, it is an easy hotel to choose again."
      },
      {
        score5: 4,
        chips: ["Fees", "Value", "Location"],
        text: "The stay was strong overall, but taxes, resort fees and other add-ons made the final bill feel higher than expected. The location still made the hotel very convenient."
      },
      {
        score5: 4.5,
        chips: ["Breakfast", "Service"],
        text: "Breakfast was good and the staff worked hard, though the setup could get crowded. It was still useful to have a reliable option inside the hotel."
      },
      {
        score5: 4,
        chips: ["Room assignment", "Fairness"],
        text: "The hotel is beautiful, but room assignments did not feel equally strong across our group. Friends on higher floors had a noticeably better experience."
      },
      {
        score5: 4,
        chips: ["Pillows", "Comfort"],
        text: "The room was clean and well located, but the pillows felt too firm for our sleep style. A softer option would have improved the stay."
      },
      {
        score5: 4,
        chips: ["Restaurant", "Cleanliness"],
        text: "The hotel itself felt upscale, but the restaurant area did not always match that standard. Breakfast choices were fine, yet table upkeep could be better."
      },
      {
        score5: 4.5,
        chips: ["Family", "Room placement"],
        text: "The building and location worked well for a family visit. It was less convenient when rooms for the same party ended up far apart."
      },
      {
        score5: 4,
        chips: ["Gym", "Renovation"],
        text: "The service and location were excellent, but renovation changes affected the gym experience during the stay. It was workable, just not as complete as expected."
      },
      {
        score5: 4.5,
        chips: ["Valet", "Concierge", "Service"],
        text: "The first impression was strong, especially from valet and concierge staff. The service felt courteous from arrival through checkout."
      },
      {
        score5: 4,
        chips: ["Rooftop", "Reservations"],
        text: "The rooftop views were a major draw, but access could be limited by private events or reservations. Planning ahead would have helped."
      },
      {
        score5: 4.5,
        chips: ["Architecture", "Room comfort"],
        text: "The restored building felt distinctive and the room finishes were high quality. Some corridors could use more character, but the main spaces were impressive."
      }
    ];

    return Array.from({ length: 200 }, (_, i) => {
      const base = baseReviews[i % baseReviews.length];
      const detail = detailSentences[Math.floor(i / baseReviews.length) % detailSentences.length];
      const who = travelerMix[(i + Math.floor(i / baseReviews.length)) % travelerMix.length];
      const when = months[i % months.length];
      return {
        who,
        when,
        score5: base.score5,
        text: `${base.text} ${detail}`,
        chips: base.chips
      };
    });
  }

  function viceroyReviewDerivedSet() {
    const months = [
      "Jun 2026", "May 2026", "Apr 2026", "Mar 2026", "Feb 2026",
      "Jan 2026", "Dec 2025", "Nov 2025", "Oct 2025", "Sep 2025",
      "Aug 2025", "Jul 2025", "Jun 2025", "May 2025", "Apr 2025",
      "Mar 2025", "Feb 2025", "Jan 2025", "Dec 2024", "Nov 2024"
    ];
    const travelerMix = [
      "couple", "couple", "family", "group", "solo traveler",
      "business traveler", "friends on a weekend trip"
    ];
    const detailSentences = [
      "The Gold Coast setting made restaurants, shopping and lakefront walks easy to fit into the day.",
      "The staff were quick to help with bags, directions and small room requests.",
      "The room design felt polished, with a large bathroom and comfortable bedding.",
      "The rooftop and pool were memorable, though access worked best when planned ahead.",
      "Housekeeping and front desk service shaped the stay more than any single amenity.",
      "The hotel felt lively without losing the boutique atmosphere.",
      "Costs like parking, amenity fees and food made the final bill worth watching.",
      "The area felt convenient and comfortable for returning in the evening.",
      "Minor maintenance issues were noticeable because the rest of the property felt high end.",
      "It was an easy base for a short Chicago trip."
    ];
    const baseReviews = [
      {
        score5: 4.5,
        chips: ["Location", "Design", "Room comfort"],
        text: "The hotel has a strong Gold Coast location and a stylish atmosphere. Our room felt clean, spacious and easy to settle into."
      },
      {
        score5: 4,
        chips: ["Breakfast", "Location"],
        text: "The location and overall vibe were excellent for a quick Chicago stay. Breakfast was convenient, but it felt more average than the rest of the hotel."
      },
      {
        score5: 4,
        chips: ["Rooftop", "Bar hours", "Room comfort"],
        text: "The room was comfortable and the staff were friendly throughout the stay. We wished the bar and rooftop opened earlier or stayed available later."
      },
      {
        score5: 5,
        chips: ["Upgrade", "Views", "Service"],
        text: "The larger room category felt luxurious, with great views and plenty of space. Bell service and front desk staff made arrival feel effortless."
      },
      {
        score5: 4,
        chips: ["Parking", "Value", "Service"],
        text: "Service at the curb was excellent, but parking was expensive and a little awkward on the busy street. A nearby garage made more sense for our plans."
      },
      {
        score5: 5,
        chips: ["Rooftop pool", "Dining", "Service"],
        text: "Morning swims on the rooftop pool were a highlight. Somerset and the coffee bar made it easy to stay close to the hotel between outings."
      },
      {
        score5: 4,
        chips: ["Cleanliness", "Room view", "Microwave"],
        text: "The room was clean, the view was lovely and the decor felt current. The only practical miss was not having an easy way to reheat leftovers."
      },
      {
        score5: 4.5,
        chips: ["Quiet", "Rooftop", "Comfort"],
        text: "The bed was very comfortable and the room stayed quiet. Cocktails on the rooftop made the evening feel special."
      },
      {
        score5: 4.5,
        chips: ["Dog friendly", "Location", "Room size"],
        text: "The hotel worked well for a long weekend, with a generous room and a walkable neighborhood. Staff were friendly and the property felt welcoming."
      },
      {
        score5: 5,
        chips: ["Bathroom", "Lighting", "Gym"],
        text: "The room controls, large shower and bathroom design were thoughtful. The gym was better than expected for a city hotel."
      },
      {
        score5: 5,
        chips: ["Welcome", "Lobby", "Decor"],
        text: "The decor felt elegant from the moment we walked in. Staff made the stay feel personal, and small lobby touches made the hotel feel warm."
      },
      {
        score5: 4,
        chips: ["Temperature", "Bathroom", "TV"],
        text: "The property is attractive and generally comfortable. Temperature control and a slow TV made the room feel less polished than expected."
      },
      {
        score5: 5,
        chips: ["Cleanliness", "Location"],
        text: "The room felt very clean and the location was exactly what we needed. It was simple to reach restaurants and shopping without a car."
      },
      {
        score5: 5,
        chips: ["Room service", "Views", "Service"],
        text: "The view made the room feel special, and service was quick when we called. The staff were consistently professional and kind."
      },
      {
        score5: 4,
        chips: ["Hallways", "Rooftop", "Cleanliness"],
        text: "The lobby and rooftop spaces had a great atmosphere. Some hallway and wall finishes looked ready for a refresh, but the room itself was comfortable."
      },
      {
        score5: 4,
        chips: ["Minibar", "Room layout"],
        text: "The room was lovely, but the stocked fridge left little room for our own food. It was a small inconvenience in an otherwise relaxing stay."
      },
      {
        score5: 4.5,
        chips: ["Housekeeping", "Towels", "Location"],
        text: "The location was excellent and the restaurant downstairs was convenient. Housekeeping was mostly good, though room replenishment could be more consistent."
      },
      {
        score5: 4,
        chips: ["Amenity fees", "Pool", "Value"],
        text: "The beds and bathroom were comfortable, and the hotel felt upscale. Extra daily fees were frustrating when we did not use the pool or gym."
      },
      {
        score5: 4,
        chips: ["Pool hours", "Family", "Food"],
        text: "The room worked well for our family and the location was strong. Pool hours and limited pool-level food made that amenity harder to use."
      },
      {
        score5: 4.5,
        chips: ["Restaurant", "Rooftop", "Staff"],
        text: "Rooftop drinks were a great way to end the day, and most staff were warm and attentive. One restaurant visit felt slower than the rest of the service."
      },
      {
        score5: 5,
        chips: ["Safety", "Quiet", "Location"],
        text: "The neighborhood felt safe and convenient, and the room was quieter than expected. We slept well and could walk to most of our plans."
      },
      {
        score5: 4,
        chips: ["Pillows", "View", "Bathroom"],
        text: "The bathroom and view were both impressive. The pillows were too soft for us, but staff helped with extra options."
      },
      {
        score5: 4,
        chips: ["Elevators", "Check-in"],
        text: "The room met our needs, but elevator waits were noticeable when one was out of service. Check-in also took more effort than it should have."
      },
      {
        score5: 4.5,
        chips: ["Style", "Minibar", "Shopping"],
        text: "The hotel style and room details made the stay feel polished. Being close to shops, restaurants and the lake was the biggest advantage."
      },
      {
        score5: 4,
        chips: ["Rooftop access", "Local crowd"],
        text: "The rooftop bar was beautiful but could be hard to access without a reservation. The room and concierge service still made the stay enjoyable."
      },
      {
        score5: 4.5,
        chips: ["Lake view", "Room cleanliness"],
        text: "Our lake-view room made the stay feel special and the bed was very comfortable. The floor could have used a little more attention, but the rest of the room was clean."
      },
      {
        score5: 4,
        chips: ["Restaurant", "Food quality", "Service"],
        text: "The property and front-of-house service were memorable. Lunch at the restaurant was less consistent, so we ate most meals elsewhere."
      },
      {
        score5: 4.5,
        chips: ["Business", "Quiet", "Wi-Fi"],
        text: "The room was quiet enough to work, and the Wi-Fi was reliable during calls. The location made it easy to meet people nearby."
      },
      {
        score5: 5,
        chips: ["Birthday", "Views", "Service"],
        text: "A celebration stay felt special because the team was welcoming and the room views were beautiful. The hotel felt polished without being cold."
      },
      {
        score5: 4,
        chips: ["Breakfast options", "Comfort"],
        text: "The room was modern, clean and spacious. Breakfast choices felt a bit limited compared with everything else the hotel does well."
      },
      {
        score5: 4.5,
        chips: ["Concierge", "Walkability"],
        text: "Concierge staff were a standout and remembered small details. We used the hotel as a base for walking through the Gold Coast and toward the lake."
      },
      {
        score5: 4,
        chips: ["Shower", "Maintenance"],
        text: "The bed and room design were excellent, but the shower temperature took patience. Small maintenance details stood out in such a nice property."
      },
      {
        score5: 4.5,
        chips: ["Cleanliness", "Security", "Amenities"],
        text: "The property felt clean, secure and well run. Seasonal amenities and lobby touches made the winter stay feel cozy."
      },
      {
        score5: 5,
        chips: ["Lakefront", "Restaurants", "Staff"],
        text: "It was easy to reach the lake, nearby restaurants and shopping from the hotel. Staff were consistently friendly and helpful."
      },
      {
        score5: 4,
        chips: ["Pool size", "Rooftop"],
        text: "The rooftop pool was a nice feature, but it is better for relaxing than lap swimming. The view and atmosphere still made it worthwhile."
      },
      {
        score5: 4.5,
        chips: ["Decor", "Quiet", "Breakfast"],
        text: "The Art Deco-inspired design, quiet room and comfortable bed made the stay restful. Breakfast downstairs was pleasant, though not the main highlight."
      }
    ];

    return Array.from({ length: 200 }, (_, i) => {
      const base = baseReviews[i % baseReviews.length];
      const detail = detailSentences[Math.floor(i / baseReviews.length) % detailSentences.length];
      const who = travelerMix[(i + Math.floor(i / baseReviews.length)) % travelerMix.length];
      const when = months[i % months.length];
      return {
        who,
        when,
        score5: base.score5,
        text: `${base.text} ${detail}`,
        chips: base.chips
      };
    });
  }

  function robeyReviewDerivedSet() {
    const months = [
      "Nov 2025", "Oct 2025", "Sep 2025", "Aug 2025", "Jul 2025",
      "May 2025", "Apr 2025", "Mar 2025", "Jan 2025", "Dec 2024",
      "Nov 2024", "Oct 2024", "Sep 2024", "Aug 2024", "Jun 2024",
      "May 2024", "Apr 2024", "Mar 2024", "Feb 2024", "Jan 2024"
    ];
    const travelerMix = [
      "couple", "family", "group", "solo traveler", "friends on a weekend trip",
      "business traveler", "couple"
    ];
    const detailSentences = [
      "The Wicker Park setting made the stay feel more local than touristy.",
      "Being close to Damen station made airport and downtown trips simple.",
      "The rooftop views were one of the most memorable parts of the stay.",
      "Cafe Robey made breakfast and easy meals feel built into the trip.",
      "The hotel worked best for guests who like a lively neighborhood atmosphere.",
      "Staff interactions made a big difference from check-in through valet.",
      "The design details helped the historic building feel current.",
      "Noise-sensitive guests would want to choose the room location carefully.",
      "The price felt easier to justify when using the bars, restaurants and location.",
      "Small-room trade-offs were easier to accept for a short city stay."
    ];
    const baseReviews = [
      {
        score5: 5,
        chips: ["Venue access", "Check-in", "Staff"],
        text: "The hotel was extremely convenient for a nearby venue, and check-in was easy. Valet and front desk staff were polite and welcoming."
      },
      {
        score5: 5,
        chips: ["Wicker Park", "Front desk", "Room view"],
        text: "The neighborhood made the trip fun from the start, with restaurants and shops close by. The room view and front desk help exceeded expectations."
      },
      {
        score5: 4.5,
        chips: ["Location", "Amenities", "Price"],
        text: "The location and amenities were excellent for a Wicker Park stay. The price was the main thing that gave us pause."
      },
      {
        score5: 4,
        chips: ["Art Deco", "Rooftop", "Room size"],
        text: "The historic building, rooftop bar and breakfast were all highlights. The room was small, but it was clean and comfortable."
      },
      {
        score5: 4.5,
        chips: ["Decor", "Bed", "Seating"],
        text: "The room decor felt cool and the bed was comfortable. A dresser or more relaxed seating would have made the space easier to use."
      },
      {
        score5: 5,
        chips: ["Local feel", "Restaurants", "Beds"],
        text: "This was a great choice for experiencing a more local part of Chicago. Nearby restaurants, breakfast and the comfortable beds made the stay easy."
      },
      {
        score5: 5,
        chips: ["Nightlife", "Updated room", "Staff"],
        text: "The rooms felt updated and the on-site nightlife added energy to the stay. Staff were friendly and made everything feel smooth."
      },
      {
        score5: 4,
        chips: ["Value", "Cozy atmosphere"],
        text: "The atmosphere was cozy and the location was hard to beat. It still felt a little expensive for the size and simplicity of the room."
      },
      {
        score5: 4.5,
        chips: ["Pool", "Rooftop", "Parking"],
        text: "The rooftop pool was lovely in the morning and the design throughout the hotel was strong. Parking required some planning and was easier to handle off site."
      },
      {
        score5: 5,
        chips: ["Repeat stay", "Cleanliness", "Staff"],
        text: "The hotel felt clean and easy to deal with, and the staff were consistently helpful. It is the kind of place we would book again."
      },
      {
        score5: 5,
        chips: ["Le Labo", "Room comfort", "Cafe"],
        text: "The room felt cozy and relaxing, with nice bathroom products and a pleasant scent. Cafe food delivered to the room made the stay feel especially convenient."
      },
      {
        score5: 4,
        chips: ["TV", "Streaming", "Comfort"],
        text: "The room was comfortable and temperature controls worked well. The TV and streaming setup lagged, which mattered more at night than during the day."
      },
      {
        score5: 5,
        chips: ["Historic building", "Dining", "Rooftop"],
        text: "The historic building has real character, and on-site dining made the visit easy. The rooftop bar added a strong sense of place."
      },
      {
        score5: 4,
        chips: ["Taxes", "Value", "Location"],
        text: "The location, room and staff were excellent. Chicago taxes and add-ons made the final price feel higher than expected."
      },
      {
        score5: 5,
        chips: ["Blue Line", "Venue", "Service"],
        text: "The hotel worked perfectly for a short concert trip, with the Blue Line close by. Staff were friendly and helpful with first-time city questions."
      },
      {
        score5: 5,
        chips: ["Views", "Linens", "Cleanliness"],
        text: "The room was extremely clean and the views from the bars were incredible. Bedding, linens and pillows made the room feel more luxurious than expected."
      },
      {
        score5: 4,
        chips: ["Storage", "Family"],
        text: "The hotel was comfortable and accommodating for a family stay. Storage space was limited, so unpacking for more than a night was difficult."
      },
      {
        score5: 4.5,
        chips: ["Old building", "Amenities", "View"],
        text: "The updated old-hotel feeling was thoughtful rather than dated. Robes, an umbrella and the skyline view were small details we appreciated."
      },
      {
        score5: 4,
        chips: ["Check-in", "Repeat stay"],
        text: "The location keeps us coming back, but check-in could feel too casual for a repeat guest. A little more recognition would improve the experience."
      },
      {
        score5: 4,
        chips: ["Mattress", "Ambience"],
        text: "The ambience and restaurants were great, and staying outside the Loop felt less hectic. The mattress was too hard for our sleep preference."
      },
      {
        score5: 4,
        chips: ["Train noise", "Loft room"],
        text: "The loft layout was useful and the shower facilities were strong. Being near the train tracks added some noise, though it did not ruin the stay."
      },
      {
        score5: 4.5,
        chips: ["UP Room", "Views", "Noise"],
        text: "The rooftop bar view was spectacular and breakfast was easy. Street and train noise took some getting used to."
      },
      {
        score5: 4.5,
        chips: ["Bikes", "606 trail", "Rooftop"],
        text: "The location, staff and city view made for a fantastic weekend. Borrowing bikes for the 606 and ending the night on the rooftop were standouts."
      },
      {
        score5: 4,
        chips: ["Seasonal pool", "Expectations"],
        text: "The hotel had a great vibe, but the seasonal pool closure was disappointing on a warm weekend. Clearer timing would have helped."
      },
      {
        score5: 4,
        chips: ["Club noise", "Top floor"],
        text: "The vibe and location were exactly what we wanted. On a top floor, music and furniture noise from the club made early sleep difficult."
      },
      {
        score5: 4,
        chips: ["Elevator noise", "Street noise"],
        text: "The cafe and neighborhood were great, but room placement mattered. Noise from the elevator area, street and nearby transit made sleep lighter than usual."
      },
      {
        score5: 4.5,
        chips: ["Cafe Robey", "Food", "City view"],
        text: "Cafe Robey was a real plus and the room had a strong city view. The hotel felt stylish without losing comfort."
      },
      {
        score5: 4,
        chips: ["Housekeeping", "Privacy"],
        text: "The room service and bedding were good, and the hotel mixed modern style with older character. Housekeeping was too persistent one morning."
      },
      {
        score5: 4,
        chips: ["Small room", "Blue Line"],
        text: "The hotel is right in Wicker Park and close to the Blue Line without feeling too noisy. The standard room was very tiny for the price."
      },
      {
        score5: 5,
        chips: ["Bars", "Breakfast", "Character"],
        text: "The hotel had great character, and both the rooftop and second-floor bar were enjoyable. Breakfast downstairs was a strong part of the stay."
      },
      {
        score5: 4.5,
        chips: ["Lighting", "Closet", "Restaurant"],
        text: "The room was clean, comfortable and had a nice view. The lighting system and small closet took some figuring out."
      },
      {
        score5: 4,
        chips: ["Bed comfort", "Quick stay"],
        text: "The location and staff were strong for a quick stay. The bed was less comfortable than expected."
      },
      {
        score5: 4.5,
        chips: ["Sound machine", "Train proximity"],
        text: "The hotel included thoughtful touches like a sound machine, which helped near the L. The free drink tickets were a nice arrival detail."
      },
      {
        score5: 4.5,
        chips: ["Door issue", "Service recovery"],
        text: "A late-night door lock issue was handled well by the staff. Breakfast at Cafe Robey helped the stay end on a good note."
      },
      {
        score5: 4.5,
        chips: ["Loft layout", "Family", "Rooftop"],
        text: "The loft room layout worked well for traveling with family. The rooftop bar view made the hotel feel different from a standard chain stay."
      },
      {
        score5: 4,
        chips: ["Valet", "Entrance"],
        text: "Meals, the bar and the staff were all very good. Finding the valet entrance was confusing the first time."
      }
    ];

    return Array.from({ length: 200 }, (_, i) => {
      const base = baseReviews[i % baseReviews.length];
      const detail = detailSentences[Math.floor(i / baseReviews.length) % detailSentences.length];
      const who = travelerMix[(i + Math.floor(i / baseReviews.length)) % travelerMix.length];
      const when = months[i % months.length];
      return {
        who,
        when,
        score5: base.score5,
        text: `${base.text} ${detail}`,
        chips: base.chips
      };
    });
  }

  function emilyReviewDerivedSet() {
    const months = [
      "May 2026", "Mar 2026", "Jan 2026", "Dec 2025", "Jul 2025",
      "Apr 2025", "Mar 2025", "Feb 2025", "Jan 2025", "Dec 2024",
      "Oct 2024", "Sep 2024", "Aug 2024", "Jul 2024", "May 2024",
      "Apr 2024", "Mar 2024", "Feb 2024", "Dec 2023", "Nov 2023"
    ];
    const travelerMix = [
      "couple", "group", "family", "solo traveler", "business traveler",
      "friends on a weekend trip", "couple"
    ];
    const detailSentences = [
      "The Fulton Market setting made restaurants and cafes feel immediately accessible.",
      "The modern design worked well for a short city stay.",
      "Staff service made the hotel feel friendlier than a typical downtown property.",
      "The restaurant, coffee bar and rooftop spaces added useful options without leaving the building.",
      "The hotel felt especially strong for travelers who want the West Loop rather than the Loop.",
      "Small room-practicality issues mattered more on longer stays.",
      "The overall value depended a lot on the nightly rate and parking needs.",
      "Cleanliness was one of the most consistent strengths.",
      "The neighborhood stayed lively, but the room still felt calm enough for rest.",
      "It was an easy base for dining, transit and United Center plans."
    ];
    const baseReviews = [
      {
        score5: 4.5,
        chips: ["Location", "Coffee", "Service"],
        text: "The location worked perfectly and the coffee downstairs was a convenient start to the morning. Service felt warm and easy."
      },
      {
        score5: 5,
        chips: ["Personalized service", "Cleanliness", "Restaurants"],
        text: "The team paid close attention to requests and made the stay feel personal. The room was clean, neat and close to many restaurants and cafes."
      },
      {
        score5: 4.5,
        chips: ["Lighting", "Room comfort"],
        text: "The room had useful lighting options and felt comfortable for a family stay. Everything worked smoothly during the visit."
      },
      {
        score5: 5,
        chips: ["Modern design", "Location"],
        text: "The hotel felt modern and well located. It was an easy choice for a quick West Loop trip."
      },
      {
        score5: 4,
        chips: ["Amenities", "AC", "Bar"],
        text: "The room was clean, comfortable and spacious enough for two people, with nice amenities like robes and a Bluetooth speaker. The air conditioning was finicky overnight."
      },
      {
        score5: 4.5,
        chips: ["Fitness studio", "Wi-Fi"],
        text: "The fitness studio was excellent and made it easy to keep a routine while traveling. Re-entering the Wi-Fi each day was annoying."
      },
      {
        score5: 4,
        chips: ["Fulton Market", "Bed firmness"],
        text: "The West Loop location was fun, with restaurants, bars and shops nearby. The bed felt firmer than we prefer, and the room took effort to cool down."
      },
      {
        score5: 5,
        chips: ["Quiet", "Cleanliness"],
        text: "The room felt extremely clean and surprisingly quiet. It was a simple, restful stay."
      },
      {
        score5: 4.5,
        chips: ["Baby-friendly", "Walkability"],
        text: "The location was walkable to plenty of restaurants and things to do. A crib and baby soap made traveling with a baby easier."
      },
      {
        score5: 5,
        chips: ["Rooftop movie", "Amenities", "Service"],
        text: "The minimalist design, rooftop movie night and hotel amenities made the stay memorable. Service was friendly and the location worked well for downtown plans."
      },
      {
        score5: 4.5,
        chips: ["Hospitality", "Cleanliness", "West Loop"],
        text: "The hotel felt clean, comfortable and hospitable in the heart of Fulton Market. Staff were accommodating throughout the stay."
      },
      {
        score5: 5,
        chips: ["Restaurant", "Minibar", "Room"],
        text: "The room, food and location were all strong. The minibar was a fun detail for a group stay."
      },
      {
        score5: 4,
        chips: ["Trendy", "Quiet", "Bed"],
        text: "The hotel felt trendy and close to Fulton Market while still being quiet. The bed could be better for the price."
      },
      {
        score5: 5,
        chips: ["Cafes", "Transit", "Location"],
        text: "The West Loop location put cafes, bars and restaurants all around us. Getting into the city center by train was straightforward."
      },
      {
        score5: 4.5,
        chips: ["Gym", "Reception", "Train noise"],
        text: "The reception team was friendly and professional, and the gym was a real plus. Train noise was present but not disruptive."
      },
      {
        score5: 4,
        chips: ["Pillows", "Storage", "Outlets"],
        text: "The room had enough space for luggage and the location was excellent for cocktails and restaurants. Flat pillows and a lack of USB plugs made the room less practical."
      },
      {
        score5: 4,
        chips: ["Parking", "Value"],
        text: "The room and location were great. Parking felt very expensive compared with the room rate."
      },
      {
        score5: 4.5,
        chips: ["Room size", "Decor", "Bed"],
        text: "The room was nicely sized and beautifully decorated. Bed and pillow comfort were the main weak points."
      },
      {
        score5: 4.5,
        chips: ["Coffee bar", "Design"],
        text: "The contemporary design looked sharp, and the coffee bar opened early enough to be useful. It was a pleasant stay for a solo traveler."
      },
      {
        score5: 4,
        chips: ["Lobby music", "Patio food", "Bed comfort"],
        text: "The front desk staff were nice and the patio food and coffee bar were convenient. The bed felt hard and the lobby music could be loud."
      },
      {
        score5: 4,
        chips: ["Restaurant", "Staff", "Linens"],
        text: "The lobby and restaurant had a fun atmosphere, and staff were accommodating. The bed and linens did not feel as comfortable as the rest of the room."
      },
      {
        score5: 5,
        chips: ["Staff", "Cleanliness", "Room"],
        text: "Staff were friendly and helpful, and the room felt very clean and put together. It was easy to recommend."
      },
      {
        score5: 4,
        chips: ["Fridge", "Microwave", "Recommendations"],
        text: "The property and staff recommendations were excellent. A usable fridge and microwave would have made the room more convenient."
      },
      {
        score5: 4.5,
        chips: ["West Loop", "Facilities", "Staff"],
        text: "The hotel was convenient for everything the West Loop offers. Facilities were clean and staff were helpful."
      },
      {
        score5: 4,
        chips: ["Price", "Cleanliness"],
        text: "The hotel was very clean and well located. The rate felt expensive for what we needed."
      },
      {
        score5: 5,
        chips: ["Activities", "Location"],
        text: "The location worked well for our activities. The stay was comfortable and straightforward."
      },
      {
        score5: 4.5,
        chips: ["Rooftop", "Cafe", "Restaurants"],
        text: "There were many restaurants nearby, and the hotel itself offered a rooftop theater, cafe and restaurant. It felt like there was plenty to do without much planning."
      },
      {
        score5: 4,
        chips: ["Small space", "Price"],
        text: "The location was the highlight. The room felt pricey for the amount of space."
      },
      {
        score5: 4.5,
        chips: ["Shelf space", "Coffee", "Minibar"],
        text: "The room was clean and comfortable, and transit access was easy. We missed having in-room coffee, more shelf space and room in the fridge."
      },
      {
        score5: 4,
        chips: ["Sound privacy", "Restaurant"],
        text: "The overall vibe was great and the downstairs restaurant was convenient. Hallway noise carried more than expected."
      },
      {
        score5: 4,
        chips: ["Dark room", "Shower pressure"],
        text: "The location and staff were great for a quick business trip. The room felt dark and the shower pressure was weaker than expected."
      },
      {
        score5: 4,
        chips: ["Dog fee", "Bathtub"],
        text: "The staff were wonderful and the room was comfortable. The dog fee was high, and the tub was not easy to step into."
      },
      {
        score5: 4,
        chips: ["TV", "Snacks", "Wi-Fi"],
        text: "The gym, rooftop cinema and bars made the hotel feel good value overall. In-room snacks were expensive, and the TV and casting setup were frustrating."
      },
      {
        score5: 4,
        chips: ["Maintenance", "Outlets"],
        text: "The location, staff and amenities were good. A shower drain and a couple of outlets needed more proactive maintenance."
      },
      {
        score5: 4,
        chips: ["Bathroom layout", "Lighting"],
        text: "The beds were comfortable and the hotel was close to restaurants and transit. The sink placement and dark lighting were inconvenient for getting ready."
      },
      {
        score5: 5,
        chips: ["Thanksgiving", "Staff", "Value"],
        text: "The West Loop location was near family and restaurants, and the hotel felt clean and affordable for a holiday weekend. Staff were cheerful and helpful."
      }
    ];

    return Array.from({ length: 200 }, (_, i) => {
      const base = baseReviews[i % baseReviews.length];
      const detail = detailSentences[Math.floor(i / baseReviews.length) % detailSentences.length];
      const who = travelerMix[(i + Math.floor(i / baseReviews.length)) % travelerMix.length];
      const when = months[i % months.length];
      return {
        who,
        when,
        score5: base.score5,
        text: `${base.text} ${detail}`,
        chips: base.chips
      };
    });
  }

  function nobuReviewDerivedSet() {
    const months = [
      "Jun 2026", "May 2026", "Apr 2026", "Mar 2026", "Feb 2026",
      "Jan 2026", "Oct 2025", "Jul 2025", "Jun 2025", "May 2025",
      "Apr 2025", "Mar 2025", "Feb 2025", "Jan 2025", "Dec 2024",
      "Nov 2024", "Oct 2024", "Sep 2024", "Aug 2024", "Jul 2024",
      "Jun 2024", "May 2024", "Apr 2024", "Mar 2024", "Feb 2024",
      "Jan 2024", "Dec 2023", "Nov 2023"
    ];
    const travelerMix = [
      "couple", "solo traveler", "group", "family", "business traveler",
      "birthday traveler", "honeymoon couple", "friends weekend", "wedding guest"
    ];
    const detailSentences = [
      "The West Loop setting made dining plans easy without much extra travel.",
      "The overall experience felt polished, quiet and design focused.",
      "Staff service was one of the clearest strengths across the stay.",
      "The hotel felt strongest for guests who want restaurants and nightlife nearby.",
      "The premium rate made small operational details more noticeable.",
      "Rooms generally felt spacious, clean and calm despite the busy neighborhood.",
      "The restaurant and rooftop gave the stay a more complete city-hotel feel.",
      "Amenities like the pool, steam room, Dyson tools and room controls stood out.",
      "Some travelers might prefer the Loop for easier access to classic sightseeing.",
      "The property worked especially well for celebrations, solo stays and weekend trips."
    ];
    const baseReviews = [
      {
        score5: 5,
        chips: ["Cleanliness", "Design", "Bathroom"],
        text: "The room felt very clean and design-forward, and the bathroom was a highlight. The location worked perfectly for a solo stay."
      },
      {
        score5: 4.5,
        chips: ["Restaurants", "Staff", "Parking"],
        text: "The hotel was modern and close to restaurants, shops and a gym. Staff were attentive throughout, but parking felt very expensive."
      },
      {
        score5: 5,
        chips: ["Birthday stay", "Service", "Welcome"],
        text: "Service made a birthday trip feel special, with welcoming staff and a very polished arrival. The stay felt luxurious without being stiff."
      },
      {
        score5: 4.5,
        chips: ["Sauna", "Bikes", "Maintenance"],
        text: "The hotel had a cool low-key atmosphere, free bikes and a well-maintained feel. The sauna booking was frustrating because it was not warmed up on time."
      },
      {
        score5: 5,
        chips: ["Vibe", "Bar", "Room"],
        text: "The understated Japanese-style vibe, bar, room and location were excellent. It felt like one of the strongest hotel stays in recent memory."
      },
      {
        score5: 4.5,
        chips: ["Comfort", "Lighting", "Value"],
        text: "The property looked beautiful and the bed was extremely comfortable. The rate was high enough that it would feel like a special-occasion choice."
      },
      {
        score5: 5,
        chips: ["Skyline view", "Bed", "Bathroom"],
        text: "The city view, comfortable bed and bathroom made the room feel memorable. It was easy to settle in and relax."
      },
      {
        score5: 5,
        chips: ["Staff", "Relaxing", "Comfort"],
        text: "The comfort level was high and the staff responded quickly and kindly. It felt like a strong place for a relaxing city break."
      },
      {
        score5: 5,
        chips: ["Luxury", "Food", "Service"],
        text: "The hotel felt modern and luxurious, with strong customer service and a polished restaurant experience. Everything felt carefully put together."
      },
      {
        score5: 5,
        chips: ["Rooftop", "Walkability", "Cocktails"],
        text: "The rooftop cocktails, spacious room and comfortable bed made a weekend stay feel easy. The surrounding area was cool and very walkable."
      },
      {
        score5: 5,
        chips: ["Amenities", "Cleanliness", "Food"],
        text: "Staff, cleanliness, amenities and food were all strong. The hotel felt consistent from check-in through departure."
      },
      {
        score5: 5,
        chips: ["Dyson amenities", "Pool", "Steam room"],
        text: "In-room details like the Dyson tools and steamer were genuinely useful. The pool and steam room felt calm and beautiful."
      },
      {
        score5: 4.5,
        chips: ["Parking", "Valet", "Luxury"],
        text: "The rooms had a luxury feel and the staff were attentive. Parking was poorly marked and valet retrieval took longer than expected."
      },
      {
        score5: 5,
        chips: ["Details", "Soaking tub", "Controls"],
        text: "Small design details made the room feel high-end, from the smooth curtains to the lighting controls. The soaking tub and bathroom products were standout features."
      },
      {
        score5: 4.5,
        chips: ["Gym", "Spa", "Room"],
        text: "The room was spacious and cozy, and the spa and steam room were enjoyable. The gym felt dark and tucked away compared with the rest of the hotel."
      },
      {
        score5: 5,
        chips: ["Restaurant", "Rooftop", "Food"],
        text: "The Nobu restaurant, rooftop and cocktails made the food experience feel special. The hotel worked well for travelers who care about dining."
      },
      {
        score5: 4.5,
        chips: ["Room service", "Fees"],
        text: "The deep soaking tub and room design were beautiful for a celebration stay. Room service fees and charges made ordering upstairs feel less appealing."
      },
      {
        score5: 4.5,
        chips: ["Quiet room", "Service", "Location"],
        text: "Even in a noisy area, the room felt quiet and comfortable. Room service and staff support made the visit smoother."
      },
      {
        score5: 5,
        chips: ["Birthday", "Upgrade", "Facilities"],
        text: "The staff made a birthday stay feel memorable with thoughtful service and beautiful facilities. The hotel felt special from the first interaction."
      },
      {
        score5: 4.5,
        chips: ["Breakfast", "Restaurant", "Pool"],
        text: "The rooms were large and the restaurant and bars were vibrant. Breakfast felt more plain than expected for a Nobu stay."
      },
      {
        score5: 4.5,
        chips: ["Yubune tub", "Minimalist design", "Dining fees"],
        text: "The Yubune room had a gorgeous wood tub, minimalist design and strong views. In-room dining charges and a limited breakfast menu were drawbacks."
      },
      {
        score5: 4,
        chips: ["Maintenance", "TV", "Cleanliness"],
        text: "The manager was accommodating and the room had a stylish feel. A broken TV, dirty bench and visible wear made the cost harder to justify."
      },
      {
        score5: 5,
        chips: ["Honeymoon", "Welcome", "Amenities"],
        text: "A welcome note and champagne made a honeymoon stay feel personal. The room had the amenities needed for a comfortable city visit."
      },
      {
        score5: 4.5,
        chips: ["Noise", "Restaurants", "Spacious room"],
        text: "The city-view room was spacious and comfortable, and the restaurant-heavy location was convenient. Night noise was noticeable."
      },
      {
        score5: 4,
        chips: ["Breakfast", "Rug", "Value"],
        text: "The room worked well for a one-night stay, but breakfast was not included and some room finishes needed attention. The price raised expectations."
      },
      {
        score5: 4,
        chips: ["Bar noise", "Interiors"],
        text: "The interiors were beautiful and the Fulton Market location was appealing. Noise from the rooftop or bar area carried into the room late at night."
      },
      {
        score5: 4.5,
        chips: ["Bathroom lighting", "Steamer"],
        text: "The Dyson hair dryer and steamer were welcome room details. Bathroom lighting was too dim for getting ready."
      },
      {
        score5: 5,
        chips: ["Rooftop", "Sushi", "Return stay"],
        text: "The hotel was beautiful and the rooftop restaurant made dinner memorable. Sushi upstairs was a highlight."
      },
      {
        score5: 4.5,
        chips: ["Food schedule", "Service"],
        text: "Service was exceptional and the room made it easy to relax. Food timing across the day was a little confusing."
      },
      {
        score5: 4,
        chips: ["Breakfast value", "Room comfort"],
        text: "The room had high ceilings, large windows and a very comfortable bed. Breakfast felt overpriced for what arrived."
      },
      {
        score5: 5,
        chips: ["Design", "Professional staff"],
        text: "The design was striking and the service team felt professional. The room made a strong first impression."
      },
      {
        score5: 4.5,
        chips: ["Street noise", "High ceilings", "View"],
        text: "The room felt luxurious and minimal, with high ceilings and a strong view. Outside noise came through more than expected."
      },
      {
        score5: 5,
        chips: ["Location", "Rooftop", "Rooms"],
        text: "The location, rooftop and room quality made the hotel feel exciting. It was a strong base for a West Loop weekend."
      },
      {
        score5: 5,
        chips: ["Meals", "Atmosphere", "Staff"],
        text: "The hotel delivered the whole package: friendly staff, relaxing atmosphere and memorable meals. The location made it even easier."
      },
      {
        score5: 4.5,
        chips: ["Gym", "Turndown", "Service"],
        text: "The design and location were excellent, and staff were friendly. The gym felt limited and service details like turndown and glassware were not always consistent."
      },
      {
        score5: 5,
        chips: ["Welcome drink", "Hospitality", "Design"],
        text: "A welcome drink and towel set a strong first impression. Hospitality, location and design all felt well aligned."
      },
      {
        score5: 5,
        chips: ["Train access", "Hip neighborhood"],
        text: "The hotel sat in a lively neighborhood full of restaurants and was still a quick train ride from central sights. The bed was extremely comfortable."
      },
      {
        score5: 4.5,
        chips: ["Onsen feel", "Pool", "Restaurant"],
        text: "The wooden bath created a calm, onsen-like feel, and the room had plenty of space. The pool and sauna were small but well kept."
      },
      {
        score5: 5,
        chips: ["West Loop", "Japanese style", "Staff"],
        text: "The Japanese-inspired style, West Loop location and staff made the hotel feel distinctive. It felt high-end without feeling generic."
      },
      {
        score5: 5,
        chips: ["Room size", "Front desk", "Bathroom"],
        text: "The room and bathroom were generous in size, and the front desk team was especially helpful. The neighborhood had plenty to do nearby."
      },
      {
        score5: 4.5,
        chips: ["Dim bathroom", "Rooftop view"],
        text: "The rooftop view and restaurant access were excellent. Bathroom lighting could be brighter."
      },
      {
        score5: 4.5,
        chips: ["Pool", "Steam room", "Late-night noise"],
        text: "The pool and steam room were a pleasant surprise, and the staff were personable. Late-night hallway or service-door noise was noticeable."
      },
      {
        score5: 4.5,
        chips: ["Boutique feel", "Fitness", "Textiles"],
        text: "The hotel felt boutique, cozy and carefully designed. Fitness amenities and room textiles felt a little basic for the price."
      },
      {
        score5: 4,
        chips: ["Housekeeping", "Signage", "Room dining"],
        text: "The room was a good size and in-room dining tasted good. Housekeeping follow-through and signage for the steam rooms could be better."
      },
      {
        score5: 5,
        chips: ["Breakfast", "Coffee", "Aesthetic"],
        text: "The aesthetic was comfortable, restrained and beautiful. Breakfast and coffee in the restaurant were a pleasant start to the day."
      },
      {
        score5: 5,
        chips: ["Valet", "Restaurant", "Service"],
        text: "The doorman, valet and restaurant team helped create a polished experience. The property felt warm despite its minimalist style."
      },
      {
        score5: 4.5,
        chips: ["Charged water", "Cleanliness"],
        text: "The staff were wonderful, the room was clean and the location was fantastic. Charging for bottled water felt odd at this price point."
      },
      {
        score5: 4.5,
        chips: ["Traffic noise", "Spacious room"],
        text: "The room was spacious, clean and easy to enjoy. Traffic noise was present, though it felt like part of staying in Chicago."
      },
      {
        score5: 4,
        chips: ["Cleanliness issue", "Design"],
        text: "The design was lovely and the hotel felt modern overall. A few cleanliness details in common areas and the room needed more care."
      }
    ];

    return Array.from({ length: 200 }, (_, i) => {
      const base = baseReviews[i % baseReviews.length];
      const detail = detailSentences[Math.floor(i / baseReviews.length) % detailSentences.length];
      const who = travelerMix[(i + Math.floor(i / baseReviews.length)) % travelerMix.length];
      const when = months[i % months.length];
      return {
        who,
        when,
        score5: base.score5,
        text: `${base.text} ${detail}`,
        chips: base.chips
      };
    });
  }

  function arloReviewDerivedSet() {
    const months = [
      "Jun 2026", "May 2026", "Apr 2026", "Mar 2026", "Feb 2026",
      "Jan 2026", "Dec 2025", "Nov 2025", "Oct 2025", "Sep 2025",
      "Aug 2025", "Jul 2025", "Jun 2025", "May 2025", "Apr 2025",
      "Mar 2025", "Feb 2025", "Jan 2025", "Dec 2024", "Nov 2024"
    ];
    const travelerMix = [
      "couple", "group", "solo traveler", "family", "business traveler",
      "friends weekend", "theater visitor", "first-time Chicago visitor"
    ];
    const detailSentences = [
      "The location near Millennium Park made sightseeing and transit simple.",
      "Staff interactions were a repeated strength, especially at the front desk.",
      "The room felt modern and comfortable for a short Chicago stay.",
      "Noise varied a lot depending on floor, view and room direction.",
      "The restaurant and bar made it easier to stay in after a long day.",
      "Small details like coffee, key cards, parking and housekeeping shaped the experience.",
      "The hotel worked well for walking to the Bean, theaters, shops and restaurants.",
      "For a downtown location, the room size and value felt rate-dependent.",
      "Cleanliness was usually strong, though a few reviews mentioned missed details.",
      "The stay felt best for travelers prioritizing location over a quiet resort-style room."
    ];
    const baseReviews = [
      {
        score5: 5,
        chips: ["Millennium Park", "Cleanliness", "Comfort"],
        text: "The room was clean and comfortable, and the hotel was right by Millennium Park. It would be an easy choice for another Chicago trip."
      },
      {
        score5: 4.5,
        chips: ["Facilities", "Key cards"],
        text: "The facilities and location were strong for a few nights in the city. The key cards were sensitive and needed extra attention."
      },
      {
        score5: 4,
        chips: ["Street noise", "Room move", "Blackout blinds"],
        text: "The location, staff, bed and shower were good, and the team helped with a room move. A low street-facing room was too loud, while a higher back-facing room was much quieter."
      },
      {
        score5: 4,
        chips: ["Check-in", "Room change"],
        text: "A room-type issue at check-in was handled professionally. The location made the short stay convenient."
      },
      {
        score5: 5,
        chips: ["Restaurant", "Bar", "Updated room"],
        text: "The hotel felt clean and updated, with a strong on-site restaurant and bar. It was a convenient base for a solo downtown stay."
      },
      {
        score5: 4.5,
        chips: ["Parking", "Staff", "Food"],
        text: "Beds, staff, food and location were all strong. Parking was confusing the first time."
      },
      {
        score5: 5,
        chips: ["Train stations", "Clean room"],
        text: "The location near Millennium Park and train stations was excellent. The room was clean, comfortable and easy to use."
      },
      {
        score5: 5,
        chips: ["Service recovery", "Taxi help"],
        text: "The staff went well beyond routine service when travel problems came up. They helped with police contacts, transportation and general support during a stressful day."
      },
      {
        score5: 4,
        chips: ["Breakfast", "Cleaning detail"],
        text: "The location, room size, bed, breakfast and espresso were all good. The floor and shower needed more careful cleaning."
      },
      {
        score5: 4.5,
        chips: ["Breakfast", "Bathroom", "Coffee"],
        text: "Breakfast, coffee, service and the location were excellent. Bathroom edges and shower details could have been cleaner."
      },
      {
        score5: 4,
        chips: ["Coffee maker", "Sofa", "Room comfort"],
        text: "The shower and bed were great, and the restaurant on site was useful. A regular coffee maker and a cleaner-looking settee would have improved the room."
      },
      {
        score5: 5,
        chips: ["Modern hotel", "Food", "Bathroom layout"],
        text: "The hotel felt clean, modern and well maintained, with strong dining options. The bathroom layout was different from a more traditional setup."
      },
      {
        score5: 5,
        chips: ["Festival", "Shopping", "Location"],
        text: "The hotel was ideal for a Millennium Park event and shopping nearby. It made the city feel very walkable."
      },
      {
        score5: 4.5,
        chips: ["Bean view", "Gym", "Staff"],
        text: "A room with a view toward the Bean made the stay feel special. Staff across the desk, bar and housekeeping were friendly, and the gym was kept very clean."
      },
      {
        score5: 5,
        chips: ["Cleanliness", "Repeat stay"],
        text: "The hotel was clean, comfortable and welcoming. It felt like a place worth booking again."
      },
      {
        score5: 5,
        chips: ["Room service", "Friendly staff"],
        text: "The room was comfortable and everyone was kind. More room service choices would have made staying in easier."
      },
      {
        score5: 4.5,
        chips: ["Towels", "Price"],
        text: "The location was the biggest strength. For three guests, the room should have been stocked with more towels, and the rate felt high."
      },
      {
        score5: 5,
        chips: ["Vibe", "Breakfast", "Staff"],
        text: "The hotel had a good vibe, a very convenient location and kind staff. Breakfast was also a strong part of the stay."
      },
      {
        score5: 5,
        chips: ["Directions", "Restaurants", "Service"],
        text: "Cleanliness and location were excellent, and staff helped with directions and restaurant ideas. The arrival experience felt welcoming."
      },
      {
        score5: 4.5,
        chips: ["Long stay", "Staff names", "Comfort"],
        text: "The hotel felt modern, clean and comfortable over a longer stay. The front office team made the visit feel personal."
      },
      {
        score5: 4.5,
        chips: ["Mini fridge", "Extras"],
        text: "The location, cleanliness and nearby parking were good. The in-room mini fridge and extras felt too upsold for the room rate."
      },
      {
        score5: 4,
        chips: ["Security", "Wi-Fi", "Housekeeping"],
        text: "The hotel felt secure at night and the room worked well for a group. Wi-Fi problems and delayed housekeeping made the stay less smooth."
      },
      {
        score5: 5,
        chips: ["Chicago newbies", "Staff"],
        text: "The hotel was a strong choice for first-time visitors. Staff made the stay feel easier and more fun."
      },
      {
        score5: 5,
        chips: ["Theater", "Check-in", "Coffee"],
        text: "The staff were personable at check-in and remembered event plans afterward. The hotel was convenient for the Chicago Theater, though the in-room coffee setup was not a favorite."
      },
      {
        score5: 5,
        chips: ["Park view", "Lake view", "Comfort"],
        text: "The room was clean and comfortable, with strong views of Millennium Park and the lake. Staff service added to the stay."
      },
      {
        score5: 4.5,
        chips: ["Customer service", "Pillows"],
        text: "Customer service and property cleanliness were strong. The pillows were the main comfort issue."
      },
      {
        score5: 4,
        chips: ["Restaurant", "Food"],
        text: "The restaurant food was a highlight. The rest of the stay was simple and convenient."
      },
      {
        score5: 5,
        chips: ["Family rooms", "Early check-in", "Late checkout"],
        text: "The staff honored a connecting-room request, offered early check-in and helped with late checkout. Traveling with kids felt much easier."
      },
      {
        score5: 4.5,
        chips: ["Bar", "Location"],
        text: "The location was excellent and staff were amazing. The bar stools and beer selection could be better."
      },
      {
        score5: 5,
        chips: ["Michigan Avenue", "Clean room"],
        text: "The room was clean and comfortable, and the Michigan Avenue location was hard to beat. It was an easy downtown stay."
      },
      {
        score5: 4,
        chips: ["Thin walls", "Sleep quality"],
        text: "The hotel was clean, well located and staffed by helpful people. Thin walls made it hard to sleep when neighbors were noisy."
      },
      {
        score5: 5,
        chips: ["Winter stay", "Location"],
        text: "Everything about the property worked well for a short winter stay. The only hard part was the weather outside."
      },
      {
        score5: 4.5,
        chips: ["Views", "Neighbor noise"],
        text: "The room had a great city view and friendly staff. Noise from nearby guests was noticeable in the morning."
      },
      {
        score5: 4.5,
        chips: ["Mini bar", "Coffee"],
        text: "The hotel was close to everything the guest wanted to do. The in-room bar and lack of free coffee made the room feel expensive."
      },
      {
        score5: 5,
        chips: ["Train station", "Repeat visit"],
        text: "The location near train service and downtown attractions made the stay easy. Customer service helped make it a repeat-choice hotel."
      },
      {
        score5: 4.5,
        chips: ["Sirens", "Michigan Avenue"],
        text: "The staff were great and Michigan Avenue was easy to access. Sirens and city noise were present at night."
      },
      {
        score5: 4,
        chips: ["Housekeeping wait", "Noise"],
        text: "The room was clean overall, but construction-like noise and a long wait for basic housekeeping supplies were frustrating."
      },
      {
        score5: 4.5,
        chips: ["Neighbor noise", "Restaurant discount"],
        text: "The staff were welcoming and the attached restaurant was useful, especially with a guest discount. Neighbor noise carried through the walls."
      },
      {
        score5: 5,
        chips: ["Birthday", "Parking"],
        text: "A birthday stay went well because of the location and helpful staff. Parking was expensive and not especially convenient."
      },
      {
        score5: 4.5,
        chips: ["Luggage storage", "Back entrance"],
        text: "The room was updated and spacious, and the back entrance made drop-off and pickup easier. Luggage storage helped extend the sightseeing day."
      },
      {
        score5: 4,
        chips: ["Housekeeping", "Security"],
        text: "The room was cozy and the staff were friendly. Housekeeping missed a safety detail by leaving the room unsecured after trash pickup."
      },
      {
        score5: 5,
        chips: ["Holiday trip", "Bar", "Remodeled room"],
        text: "The renovated room felt spacious and comfortable, and the bar staff were friendly. It worked well for a holiday-season downtown visit."
      },
      {
        score5: 4.5,
        chips: ["No view", "Clean room"],
        text: "The hotel was walkable and clean, with friendly staff. The room lacked a view, which mattered for guests expecting city scenery."
      },
      {
        score5: 4.5,
        chips: ["Lobby scent", "Location"],
        text: "The location was the clear highlight and the price felt reasonable. The lobby scent was stronger than expected."
      },
      {
        score5: 4.5,
        chips: ["Orange Line", "Shower pressure", "Staff"],
        text: "Access from Midway by train was convenient, staff handled requests well, and the shower pressure was excellent. The safe location inside the bed storage was unusual but workable."
      },
      {
        score5: 4,
        chips: ["Claustrophobic view", "Comfort"],
        text: "The room was large and the bed was comfortable. A window facing a nearby lit office made the room feel closed in."
      },
      {
        score5: 4,
        chips: ["Check-in time", "Schedule"],
        text: "The location and room were good. Check-in felt late for the trip schedule."
      },
      {
        score5: 4.5,
        chips: ["Room size", "Ambience", "Timing"],
        text: "The ambience was nice, staff were friendly and the room felt larger than expected. Earlier check-in and later checkout would have improved the stay."
      },
      {
        score5: 4.5,
        chips: ["Small room", "Deposit", "Photo booth"],
        text: "The hotel had memorable lobby details, a fair deposit and a beautiful view from a higher floor. The room was compact, especially for more than one traveler."
      }
    ];

    return Array.from({ length: 200 }, (_, i) => {
      const base = baseReviews[i % baseReviews.length];
      const detail = detailSentences[Math.floor(i / baseReviews.length) % detailSentences.length];
      const who = travelerMix[(i + Math.floor(i / baseReviews.length)) % travelerMix.length];
      const when = months[i % months.length];
      return {
        who,
        when,
        score5: base.score5,
        text: `${base.text} ${detail}`,
        chips: base.chips
      };
    });
  }

  const HOTELS = [
      {
          "id": "pendry-chicago",
          "name": "Pendry Chicago",
          "brand": "Lifestyle hotel",
          "hotelClass": "4-star hotel",
          "stars": 4,
          "priceNightly": 299,
          "neighborhood": "Chicago Loop",
          "address": "230 North Michigan Avenue, Chicago Loop, Chicago, IL 60601, United States",
          "distance": "1,100 ft walking from State/Lake station",
          "tags": [
              "Chicago Loop",
              "Restaurant and bar",
              "Fitness center"
          ],
          "amenities": [
              "Non-smoking rooms",
              "Room service",
              "Facilities for disabled guests",
              "4 restaurants",
              "Fitness center",
              "Private parking",
              "Free Wifi",
              "24-hour front desk",
              "Tea/Coffee maker in all rooms",
              "Good breakfast"
          ],
          "about": "Pendry Chicago is located in Chicago city center on North Michigan Avenue, with easy access to key attractions, restaurants, transit and the lakefront. Rooms include private bathrooms, air-conditioning, city or river views, mini-bars and flat-screen TVs.",
          "aboutSections": [
              {
                  "title": "Prime location",
                  "text": "Pendry Chicago is located in Chicago city center, offering easy access to key attractions. Ohio Street Beach is a 19-minute walk away, while the Art Institute of Chicago lies less than 0.6 mi from the hotel."
              },
              {
                  "title": "Comfortable accommodations",
                  "text": "Rooms feature private bathrooms, air-conditioning, city or river views, and modern amenities such as mini-bars and flat-screen TVs."
              },
              {
                  "title": "Dining experience",
                  "text": "The modern, romantic restaurant serves French and American cuisines for lunch, dinner, high tea and cocktails. Breakfast is available as an American a la carte."
              },
              {
                  "title": "Nearby activities",
                  "text": "Guests can participate in bike tours, visit an ice-skating rink, or engage in kayaking or canoeing. Midway International Airport is 11 mi away."
              },
              {
                  "title": "Exceptional facilities",
                  "text": "Guests enjoy a fitness center, free bicycles, terrace, restaurant, bar and complimentary WiFi. Additional amenities include a lounge, games room and electric vehicle charging station."
              }
          ],
          "facts": [
              "Excellent location rated 9.7/10 from 798 reviews.",
              "Room option: King Guestroom, 295 sq ft, 1 king bed.",
              "Subway/metro and train access is 1,100 ft walking from State/Lake station.",
              "Real guests, real stays and real opinions."
          ],
          "locationNotes": [
              "Millennium Park",
              "Cloud Gate",
              "Chicago Riverwalk",
              "Art Institute of Chicago"
          ],
          "locationScoreText": "Excellent location - rated 9.7/10",
          "areaMapText": "Excellent location",
          "guestLovedNote": "Guests loved walking around the neighborhood.",
          "guestRating": 4.85,
          "guestReviewCount": 798,
          "ratingBreakdown": {
              "Location": 4.85,
              "Rooms": 4.6,
              "Value": 4.2,
              "Cleanliness": 4.7,
              "Service": 4.5,
              "Sleep Quality": 4.3
          },
          "areaInfo": [
              {
                  "title": "What's nearby",
                  "items": [
                      ["Bridgehouse and Chicago River Museum", "650 ft"],
                      ["Chicago Vietnam Veterans Memorial", "750 ft"],
                      ["Millennium Park", "1,300 ft"],
                      ["Aon Center", "1,400 ft"],
                      ["Chicago Tribune Tower", "1,500 ft"],
                      ["Marina City", "1,550 ft"],
                      ["Cloud Gate - The Bean", "1,900 ft"],
                      ["Chicago Riverwalk", "2,000 ft"],
                      ["Maggie Daley Park", "2,200 ft"],
                      ["Picasso Statue", "2,450 ft"]
                  ]
              },
              {
                  "title": "Top attractions",
                  "items": [
                      ["Art Institute of Chicago", "2,750 ft"],
                      ["Water Tower Chicago", "0.7 mi"],
                      ["360 Chicago", "0.9 mi"],
                      ["Chicago Museum of Contemporary Art", "0.9 mi"],
                      ["Grant Park", "0.9 mi"],
                      ["Buckingham Memorial Fountain", "1 mi"],
                      ["Navy Pier", "1.1 mi"],
                      ["Willis Tower", "1.1 mi"],
                      ["Field Museum Of Natural History", "1.6 mi"],
                      ["Adler Planetarium & Astronomy Museum", "2.2 mi"]
                  ]
              },
              {
                  "title": "Beaches in the neighborhood",
                  "items": [
                      ["Ohio Street Beach", "1 mi"],
                      ["Oak Street Beach", "1.5 mi"],
                      ["North Avenue Beach", "2 mi"],
                      ["Fullerton Beach", "2.8 mi"],
                      ["Oakwood Beach", "5 mi"]
                  ]
              },
              {
                  "title": "Public transit",
                  "items": [
                      ["Train - State/Lake", "1,100 ft"],
                      ["Train - Millennium Station", "1,150 ft"],
                      ["Subway - Lake", "1,250 ft"],
                      ["Subway - Washington", "2,500 ft"]
                  ]
              },
              {
                  "title": "Restaurants and cafes",
                  "items": [
                      ["Restaurant - Chateau Carbide", "10 ft"],
                      ["Restaurant - Morton's", "250 ft"],
                      ["Restaurant - Sweetwater", "550 ft"]
                  ]
              },
              {
                  "title": "Natural beauty",
                  "items": [
                      ["Lake - Elite Yacht Services", "2,650 ft"],
                      ["Peak - Players Hill (187m)", "8 mi"]
                  ]
              },
              {
                  "title": "Closest airports",
                  "items": [
                      ["Midway International Airport", "10 mi"],
                      ["Chicago O'Hare International Airport", "16 mi"]
                  ]
              }
          ],
          "reviews": pendryReviewDerivedSet()
      },
      {
          "id": "viceroy-chicago",
          "name": "Viceroy Chicago",
          "brand": "Lifestyle hotel",
          "hotelClass": "5-star hotel",
          "stars": 5,
          "priceNightly": 305,
          "neighborhood": "Gold Coast",
          "address": "1118 North State Street, Chicago, IL 60610, United States",
          "distance": "1,250 ft walking from Clark/Division station",
          "tags": [
              "Gold Coast",
              "Rooftop bar",
              "Seasonal rooftop pool"
          ],
          "amenities": [
              "Outdoor swimming pool",
              "Non-smoking rooms",
              "Room service",
              "Facilities for disabled guests",
              "2 restaurants",
              "Fitness center",
              "Private parking",
              "Free Wifi",
              "24-hour front desk",
              "Tea/Coffee maker in all rooms"
          ],
          "about": "A historic Gold Coast hotel steps from shopping, dining and entertainment near the Magnificent Mile, with a rooftop bar and lounge, panoramic city views, on-site dining and a seasonal rooftop pool.",
          "aboutSections": [
              {
                  "title": "Gold Coast location",
                  "text": "Just steps away from the famed shopping, dining and entertainment on the Magnificent Mile, this historic hotel is located in Chicago's Gold Coast neighborhood and features a rooftop bar and lounge with panoramic city views, on-site dining and a seasonal rooftop pool."
              },
              {
                  "title": "Modern guest rooms",
                  "text": "Every modern guest room at Viceroy Chicago provides a flat-screen cable TV, plush lounge seating and complimentary WiFi. A fully-stocked mini-bar and coffee machine are also included."
              },
              {
                  "title": "Dining experience",
                  "text": "Somerset offers dishes inspired by modern, Midwest flavors for breakfast, lunch and dinner. Guests can enjoy crafted cocktails and small plates amid sweeping skyline views at the rooftop bar and lounge. In-room dining services are also offered for guest convenience."
              },
              {
                  "title": "Facilities",
                  "text": "The hotel offers a state-of-the-art fitness center, along with 14,012 square feet of meeting and event space."
              },
              {
                  "title": "Nearby attractions",
                  "text": "Oak Street Beach is a 10-minute walk away. The hotel is less than 2 miles away from Navy Pier and Millennium Park."
              }
          ],
          "facts": [
              "Excellent location rated 9.5/10 from 935 reviews.",
              "Modern guest rooms include flat-screen cable TV, plush lounge seating, complimentary WiFi, minibar and coffee machine.",
              "Subway access is 1,250 ft walking from Clark/Division station.",
              "Couples in particular like the location, rating it 9.5 for a two-person trip."
          ],
          "locationNotes": [
              "Oak Street Beach",
              "Magnificent Mile",
              "Navy Pier",
              "Millennium Park"
          ],
          "locationScoreText": "Excellent location - rated 9.5/10",
          "areaMapText": "Excellent location",
          "guestLovedNote": "Guests loved walking around the neighborhood.",
          "guestRating": 4.75,
          "guestReviewCount": 935,
          "ratingBreakdown": {
              "Location": 4.75,
              "Rooms": 4.5,
              "Value": 4,
              "Cleanliness": 4.6,
              "Service": 4.4,
              "Sleep Quality": 4.2
          },
          "areaInfo": [
              {
                  "title": "What's nearby",
                  "items": [
                      ["Chicago Lakefront Trail", "2,200 ft"],
                      ["360 Chicago", "2,250 ft"],
                      ["Charnley-Persky House Museum", "2,250 ft"],
                      ["Loyola University Museum Of Art", "2,450 ft"],
                      ["Water Tower Chicago", "2,500 ft"],
                      ["Chicago Museum of Contemporary Art", "0.6 mi"],
                      ["Chicago History Museum", "0.8 mi"],
                      ["Arts Club Of Chicago", "0.8 mi"],
                      ["Chicago Tribune Tower", "0.9 mi"],
                      ["Time Life Building", "1 mi"]
                  ]
              },
              {
                  "title": "Top attractions",
                  "items": [
                      ["Lincoln Park Zoo", "1.4 mi"],
                      ["Navy Pier", "1.5 mi"],
                      ["Millennium Park", "1.5 mi"],
                      ["Cloud Gate - The Bean", "1.6 mi"],
                      ["Art Institute of Chicago", "1.7 mi"],
                      ["Willis Tower", "2 mi"],
                      ["Grant Park", "2.1 mi"],
                      ["Buckingham Memorial Fountain", "2.2 mi"],
                      ["Field Museum Of Natural History", "2.8 mi"],
                      ["Adler Planetarium & Astronomy Museum", "3.4 mi"]
                  ]
              },
              {
                  "title": "Beaches in the neighborhood",
                  "items": [
                      ["Oak Street Beach", "2,350 ft"],
                      ["North Avenue Beach", "1 mi"],
                      ["Ohio Street Beach", "1.2 mi"],
                      ["Fullerton Beach", "1.7 mi"],
                      ["Montrose Beach", "5 mi"]
                  ]
              },
              {
                  "title": "Public transit",
                  "items": [
                      ["Subway - Clark/Division", "1,250 ft"],
                      ["Subway - Chicago", "2,100 ft"],
                      ["Train - Chicago", "0.8 mi"],
                      ["Train - Merchandise Mart", "1.2 mi"]
                  ]
              },
              {
                  "title": "Restaurants and cafes",
                  "items": [
                      ["Restaurant - Somerset", "3.3 ft"],
                      ["Restaurant - Goddess and Grocer", "50 ft"],
                      ["Restaurant - Velvet Taco", "50 ft"]
                  ]
              },
              {
                  "title": "Natural beauty",
                  "items": [
                      ["Lake - Elite Yacht Services", "0.9 mi"],
                      ["Peak - Players Hill (187m)", "8 mi"]
                  ]
              },
              {
                  "title": "Closest airports",
                  "items": [
                      ["Midway International Airport", "11 mi"],
                      ["Chicago O'Hare International Airport", "14 mi"]
                  ]
              }
          ],
          "reviews": viceroyReviewDerivedSet()
      },
      {
          "id": "the-robey-chicago",
          "name": "The Robey, Chicago, a Member of Design Hotels",
          "brand": "Design hotel",
          "hotelClass": "4-star hotel",
          "stars": 4,
          "priceNightly": 289,
          "neighborhood": "Wicker Park",
          "address": "2018 W North Avenue, Wicker Park, Chicago, IL 60647, United States",
          "distance": "300 ft walking from Damen station",
          "tags": [
              "Wicker Park",
              "Rooftop lounge",
              "Design hotel"
          ],
          "amenities": [
              "Outdoor swimming pool",
              "Non-smoking rooms",
              "Room service",
              "Facilities for disabled guests",
              "5 restaurants",
              "Fitness center",
              "Private parking",
              "Free Wifi",
              "24-hour front desk",
              "Bar"
          ],
          "about": "A historic hotel in the heart of Wicker Park with on-site dining, free WiFi, hardwood floors, 400-thread count sheets, Cafe Robey, Clever Coyote, The Up Room rooftop lounge and Solana seasonal rooftop.",
          "aboutSections": [
              {
                  "title": "Wicker Park location",
                  "text": "Located in the heart of Chicago's Wicker Park neighborhood, this historic hotel is 3 miles away from the shopping, dining and entertainment on the Magnificent Mile. On-site dining and free WiFi are available."
              },
              {
                  "title": "Light-filled rooms",
                  "text": "Hardwood floors and 400-thread count sheets are featured in every light-filled room. A flat-screen TV and a Bluetooth-enabled sound system with TV connectivity are included."
              },
              {
                  "title": "Dining and rooftops",
                  "text": "Guests can enjoy morning coffee at Cafe Robey, New American fare for breakfast, lunch and dinner, and drinks at Clever Coyote. The Up Room rooftop lounge offers year-round city views, while Solana is a seasonal rooftop space atop the Hollander Building."
              },
              {
                  "title": "Nearby attractions",
                  "text": "The United Center, home of the Chicago Bulls, is a 14-minute drive away. Lincoln Park Zoo and Wrigley Field are both 3 miles away."
              }
          ],
          "facts": [
              "Excellent location rated 9.6/10 from 235 reviews.",
              "Room option: King Room, 330 sq ft, 1 king bed.",
              "Subway access is 300 ft walking from Damen station.",
              "Couples in particular like the location, rating it 9.6 for a two-person trip."
          ],
          "locationNotes": [
              "Damen station",
              "Wicker Park",
              "United Center",
              "Lincoln Park Zoo"
          ],
          "locationScoreText": "Excellent location - rated 9.6/10",
          "areaMapText": "Excellent location",
          "guestLovedNote": "Guests loved walking around the neighborhood.",
          "guestRating": 4.8,
          "guestReviewCount": 235,
          "ratingBreakdown": {
              "Location": 4.8,
              "Rooms": 4.5,
              "Value": 4.2,
              "Cleanliness": 4.7,
              "Service": 4.4,
              "Sleep Quality": 4
          },
          "amenityDetails": {
              "scoreLine": "Great facilities! Review score, 9.1",
              "groups": [
                  {
                      "title": "Great for your stay",
                      "items": [
                          "5 restaurants",
                          "Parking",
                          "Private bathroom",
                          "Free Wifi",
                          "Air conditioning",
                          "Fitness center",
                          "Non-smoking rooms",
                          "Facilities for disabled guests",
                          "Room service",
                          "Valet parking"
                      ]
                  },
                  {
                      "title": "Bathroom",
                      "items": [
                          "Toilet paper",
                          "Towels",
                          "Slippers",
                          "Private bathroom",
                          "Toilet",
                          "Hairdryer"
                      ]
                  },
                  {
                      "title": "Parking",
                      "body": "Private parking is available on site; reservation is not possible and costs $49 per day.",
                      "items": [
                          "Valet parking",
                          "Accessible parking"
                      ]
                  },
                  {
                      "title": "Front Desk Services",
                      "items": [
                          "Invoice provided",
                          "Concierge",
                          "Baggage storage",
                          "24-hour front desk"
                      ]
                  },
                  {
                      "title": "Family friendly",
                      "items": [
                          "Kids' meals - additional charge"
                      ]
                  },
                  {
                      "title": "Cleaning Services",
                      "items": [
                          "Daily housekeeping",
                          "Suit press - additional charge",
                          "Ironing service - additional charge",
                          "Dry cleaning - additional charge",
                          "Laundry - additional charge"
                      ]
                  },
                  {
                      "title": "Accessibility",
                      "items": [
                          "Visual aids (tactile signs)",
                          "Visual aids (Braille)",
                          "Lowered sink",
                          "Raised toilet",
                          "Toilet with grab rails",
                          "Wheelchair accessible",
                          "Upper floors accessible by elevator"
                      ]
                  },
                  {
                      "title": "Outdoor swimming pool",
                      "body": "Additional charge",
                      "items": [
                          "Opening times",
                          "Seasonal",
                          "All ages welcome",
                          "Pool is on rooftop",
                          "Pool with view",
                          "Shallow end",
                          "Pool/Beach towels",
                          "Pool bar",
                          "Beach chairs/Loungers",
                          "Beach umbrellas"
                      ]
                  }
              ]
          },
          "reviews": robeyReviewDerivedSet()
      },
      {
          "id": "the-emily-hotel",
          "name": "The Emily Hotel",
          "brand": "Independent hotel",
          "hotelClass": "4-star hotel",
          "stars": 4,
          "priceNightly": 295,
          "neighborhood": "West Loop",
          "address": "311 North Morgan Street, West Loop, Chicago, IL 60607, United States",
          "distance": "600 ft walking from Morgan station",
          "tags": [
              "West Loop",
              "Rooftop lounge",
              "Terrace"
          ],
          "amenities": [
              "Non-smoking rooms",
              "Facilities for disabled guests",
              "Restaurant",
              "Fitness center",
              "Private parking",
              "Free Wifi",
              "Family rooms",
              "24-hour front desk",
              "Bar",
              "Terrace"
          ],
          "about": "A downtown Chicago hotel in the West Loop restaurant district with on-site dining, a rooftop lounge and garden, contemporary rooms with free WiFi, locally made artwork and a 24-hour fitness center.",
          "aboutSections": [
              {
                  "title": "West Loop location",
                  "text": "Located among the bustling restaurant scene in the city's West Loop neighborhood, this downtown Chicago hotel features on-site dining, a rooftop lounge and garden, and contemporary guest rooms with free WiFi."
              },
              {
                  "title": "Contemporary rooms",
                  "text": "Adorned with original locally-made artwork, every modern room at The Emily Hotel provides a flat-screen TV, Bluetooth radio and fully-stocked mini-bar."
              },
              {
                  "title": "Guest convenience",
                  "text": "A 24-hour fitness center and 24-hour front desk are available on-site for guest convenience. Valet parking services are also offered."
              },
              {
                  "title": "Nearby attractions",
                  "text": "United Center is 1.2 mi away from the hotel. Millennium Park and Michigan Avenue's Magnificent Mile are both a 10-minute drive away."
              }
          ],
          "facts": [
              "Excellent location rated 9.3/10 from 273 reviews.",
              "Room option: Standard King Room, 290 sq ft, 1 king bed.",
              "Subway access is 600 ft walking from Morgan station.",
              "Couples in particular like the location, rating it 9.4 for a two-person trip."
          ],
          "locationNotes": [
              "Morgan station",
              "United Center",
              "Restaurant Row",
              "Millennium Park"
          ],
          "locationScoreText": "Excellent location - rated 9.3/10",
          "areaMapText": "Excellent location",
          "guestLovedNote": "Guests loved walking around the neighborhood.",
          "guestRating": 4.65,
          "guestReviewCount": 273,
          "ratingBreakdown": {
              "Location": 4.65,
              "Rooms": 4.2,
              "Value": 4,
              "Cleanliness": 4.5,
              "Service": 4.3,
              "Sleep Quality": 4
          },
          "areaInfo": [
              {
                  "title": "What's nearby",
                  "items": [
                      ["Chicago Riverwalk", "1.2 mi"],
                      ["Picasso Statue", "1.3 mi"],
                      ["Willis Tower", "1.4 mi"],
                      ["Chicago Vietnam Veterans Memorial", "1.4 mi"],
                      ["Marina City", "1.4 mi"],
                      ["Bridgehouse and Chicago River Museum", "1.6 mi"],
                      ["Chicago Tribune Tower", "1.6 mi"],
                      ["Millennium Park", "1.7 mi"],
                      ["Cloud Gate - The Bean", "1.8 mi"],
                      ["Grant Park", "1.8 mi"]
                  ]
              },
              {
                  "title": "Top attractions",
                  "items": [
                      ["Harold Washington Library Center", "1.9 mi"],
                      ["Art Institute of Chicago", "1.9 mi"],
                      ["Water Tower Chicago", "2 mi"],
                      ["360 Chicago", "2.2 mi"],
                      ["Chicago Museum of Contemporary Art", "2.2 mi"],
                      ["Buckingham Memorial Fountain", "2.4 mi"],
                      ["Navy Pier", "2.4 mi"],
                      ["Field Museum Of Natural History", "3 mi"],
                      ["Lincoln Park Zoo", "3.3 mi"],
                      ["Adler Planetarium & Astronomy Museum", "3.6 mi"]
                  ]
              },
              {
                  "title": "Beaches in the neighborhood",
                  "items": [
                      ["Ohio Street Beach", "2.4 mi"],
                      ["Oak Street Beach", "2.5 mi"],
                      ["North Avenue Beach", "3.1 mi"],
                      ["Fullerton Beach", "3.8 mi"]
                  ]
              },
              {
                  "title": "Public transit",
                  "items": [
                      ["Subway - Morgan", "600 ft"],
                      ["Subway - Grand", "2,650 ft"],
                      ["Train - Ogilvie Transportation Center", "0.9 mi"],
                      ["Train - Union Station", "1.2 mi"]
                  ]
              },
              {
                  "title": "Restaurants and cafes",
                  "items": [
                      ["Cafe/Bar - Little Wild", "10 ft"],
                      ["Restaurant - Selva", "50 ft"],
                      ["Restaurant - Swift & Sons", "100 ft"]
                  ]
              },
              {
                  "title": "Natural beauty",
                  "items": [
                      ["Lake - Elite Yacht Services", "1.8 mi"],
                      ["Peak - Players Hill (187m)", "6 mi"]
                  ]
              },
              {
                  "title": "Closest airports",
                  "items": [
                      ["Midway International Airport", "9 mi"],
                      ["Chicago O'Hare International Airport", "14 mi"]
                  ]
              }
          ],
          "reviews": emilyReviewDerivedSet()
      },
      {
          "id": "nobu-hotel-chicago",
          "name": "Nobu Hotel Chicago",
          "brand": "Lifestyle hotel",
          "hotelClass": "5-star hotel",
          "stars": 5,
          "priceNightly": 309,
          "neighborhood": "West Loop",
          "address": "155 North Peoria Street, Chicago, IL 60607",
          "distance": "0.6 mi walking from Ogilvie Transportation Center station",
          "tags": [
              "West Loop",
              "Indoor pool",
              "Japanese dining"
          ],
          "amenities": [
              "Indoor swimming pool",
              "Non-smoking rooms",
              "Facilities for disabled guests",
              "Fitness center",
              "Room service",
              "2 restaurants",
              "Free WiFi",
              "Tea/Coffee maker in all rooms",
              "Bar",
              "Good breakfast"
          ],
          "about": "Nobu Hotel Chicago offers luxurious rooms with private bathrooms, free WiFi and modern amenities in Chicago's West Loop. Guests can use the sauna, fitness center, indoor swimming pool and steam room, with Japanese and Asian dining on site.",
          "aboutSections": [
              {
                  "title": "Elegant accommodations",
                  "text": "Nobu Hotel Chicago offers luxurious rooms with private bathrooms, free WiFi and modern amenities. Guests enjoy a sauna, fitness center, indoor swimming pool and steam room."
              },
              {
                  "title": "Dining experience",
                  "text": "The hotel features a family-friendly restaurant serving Japanese and Asian cuisine in a modern and romantic ambiance. Breakfast options include American and Asian styles, while dinner and cocktails are available. Special dietary menus cater to vegetarian, vegan, gluten-free and dairy-free preferences."
              },
              {
                  "title": "Prime location",
                  "text": "Located 16 minutes from Union Station and 1.1 mi from Willis Tower, the hotel is near attractions including the Art Institute of Chicago and Navy Pier. Midway International Airport is 11 mi away. Nearby activities include ice-skating, kayaking and canoeing."
              },
              {
                  "title": "Exceptional service",
                  "text": "The hotel offers a 24-hour front desk, concierge and room service. Additional amenities include a paid shuttle, car hire and paid off-site private parking."
              }
          ],
          "facts": [
              "Excellent location rated 9.5/10 from 373 reviews.",
              "Room option: Yubune King, 439 sq ft, 1 king bed.",
              "Couples in particular like the location, rating it 9.5 for a two-person trip.",
              "Nearby transit includes Ogilvie Transportation Center and Union Station."
          ],
          "locationNotes": [
              "Ogilvie Transportation Center",
              "Union Station",
              "Willis Tower",
              "Art Institute of Chicago"
          ],
          "locationScoreText": "Excellent location - rated 9.5/10",
          "guestLovedNote": "Guests loved walking around the neighborhood.",
          "guestRating": 4.75,
          "guestReviewCount": 373,
          "ratingBreakdown": {
              "Location": 4.75,
              "Rooms": 4.4,
              "Value": 3.9,
              "Cleanliness": 4.6,
              "Service": 4.5,
              "Sleep Quality": 4.2
          },
          "areaInfo": [
              {
                  "title": "What's nearby",
                  "items": [
                      ["Picasso Statue", "1.1 mi"],
                      ["Chicago Riverwalk", "1.1 mi"],
                      ["Willis Tower", "1.1 mi"],
                      ["Chicago Vietnam Veterans Memorial", "1.3 mi"],
                      ["Marina City", "1.3 mi"],
                      ["Millennium Park", "1.5 mi"],
                      ["Bridgehouse and Chicago River Museum", "1.5 mi"],
                      ["Cloud Gate - The Bean", "1.5 mi"],
                      ["Grant Park", "1.6 mi"],
                      ["Harold Washington Library Center", "1.6 mi"]
                  ]
              },
              {
                  "title": "Top attractions",
                  "items": [
                      ["Art Institute of Chicago", "1.7 mi"],
                      ["Dearborn Station", "1.9 mi"],
                      ["Water Tower Chicago", "2.1 mi"],
                      ["Buckingham Memorial Fountain", "2.1 mi"],
                      ["360 Chicago", "2.2 mi"],
                      ["Chicago Museum of Contemporary Art", "2.2 mi"],
                      ["Navy Pier", "2.4 mi"],
                      ["Field Museum Of Natural History", "2.8 mi"],
                      ["Adler Planetarium & Astronomy Museum", "3.3 mi"],
                      ["Lincoln Park Zoo", "3.3 mi"]
                  ]
              },
              {
                  "title": "Beaches in the neighborhood",
                  "items": [
                      ["Ohio Street Beach", "2.3 mi"],
                      ["Oak Street Beach", "2.5 mi"],
                      ["North Avenue Beach", "3.2 mi"],
                      ["Fullerton Beach", "3.8 mi"]
                  ]
              },
              {
                  "title": "Public transit",
                  "items": [
                      ["Subway - Morgan", "1,050 ft"],
                      ["Subway - Clinton", "2,400 ft"],
                      ["Train - Ogilvie Transportation Center", "0.6 mi"],
                      ["Train - Union Station", "0.9 mi"]
                  ]
              },
              {
                  "title": "Restaurants and cafes",
                  "items": [
                      ["Restaurant - Maude's Liquor Bar", "100 ft"],
                      ["Restaurant - Lena Brava", "150 ft"],
                      ["Restaurant - Nobu Chicago", "150 ft"]
                  ]
              },
              {
                  "title": "Natural beauty",
                  "items": [
                      ["Lake - Elite Yacht Services", "1.8 mi"],
                      ["Peak - Players Hill (187m)", "6 mi"]
                  ]
              },
              {
                  "title": "Closest airports",
                  "items": [
                      ["Midway International Airport", "9 mi"],
                      ["Chicago O'Hare International Airport", "15 mi"]
                  ]
              }
          ],
          "reviews": nobuReviewDerivedSet()
      },
      {
          "id": "arlo-chicago",
          "name": "Arlo Chicago",
          "brand": "Independent-style hotel",
          "hotelClass": "4-star hotel",
          "stars": 4,
          "priceNightly": 289,
          "neighborhood": "Chicago Loop",
          "address": "168 North Michigan Avenue, Chicago Loop, Chicago, IL 60601, United States",
          "distance": "550 ft walking from Millennium Station station",
          "tags": [
              "Chicago Loop",
              "Near Millennium Park",
              "Restaurant"
          ],
          "amenities": [
              "Non-smoking rooms",
              "Room service",
              "Facilities for disabled guests",
              "Restaurant",
              "Fitness center",
              "Parking",
              "Free Wifi",
              "24-hour front desk",
              "Bar",
              "Good breakfast"
          ],
          "about": "A Chicago Loop hotel less than a 5-minute walk from Millennium Park and Cloud Gate, with a fitness center, on-site restaurant and rooms with desks, flat-screen TVs, private bathrooms and fridges.",
          "aboutSections": [
              {
                  "title": "Central Loop location",
                  "text": "Located in Chicago, less than a 5-minute walk to Millennium Park and Cloud Gate - The Bean, Arlo Chicago provides a fitness center and an on-site restaurant. The property is within walking distance to CIBC Theater, Bank of America Theater and Art Institute of Chicago."
              },
              {
                  "title": "Guest rooms",
                  "text": "All rooms are fitted with a desk, a flat-screen TV and a private bathroom. All rooms also provide guests with a fridge."
              },
              {
                  "title": "Breakfast and dining",
                  "text": "An American breakfast is available every morning at Arlo Chicago. About Last Knife, the on-site steakhouse restaurant, offers American, seafood and local cuisine."
              },
              {
                  "title": "Front desk guidance",
                  "text": "When guests need guidance on where to visit, the reception will be happy to provide advice."
              },
              {
                  "title": "Nearby attractions",
                  "text": "Chicago Symphony Orchestra and Shops at Northbridge are less than a 10-minute walk away. DePaul University is less than 0.6 mi from Arlo Chicago, while Chicago Board of Trade Building is a 12-minute walk from the property."
              }
          ],
          "facts": [
              "Overall guest score rated 8.9/10 from 1,955 reviews.",
              "Excellent location rated 9.7/10 from guest reviews.",
              "Room option: Standard King Room, 220 sq ft, 1 king bed.",
              "Subway/metro and train access is 550 ft walking from Millennium Station station.",
              "Couples in particular like the location, rating it 9.8 for a two-person trip.",
              "The nearest airport is Midway International Airport, 9.3 mi from the property."
          ],
          "locationNotes": [
              "Millennium Station",
              "Millennium Park",
              "Cloud Gate",
              "Art Institute of Chicago"
          ],
          "locationScoreText": "Excellent location - rated 9.7/10",
          "areaMapText": "Excellent location",
          "guestLovedNote": "Guests loved walking around the neighborhood.",
          "guestRating": 4.45,
          "guestReviewCount": 1955,
          "ratingBreakdown": {
              "Staff": 4.6,
              "Facilities": 4.55,
              "Cleanliness": 4.65,
              "Comfort": 4.7,
              "Value for money": 4.3,
              "Location": 4.85,
              "Free WiFi": 4.55
          },
          "areaInfo": [
              {
                  "title": "What's nearby",
                  "items": [
                      ["Millennium Park", "800 ft"],
                      ["Chicago Vietnam Veterans Memorial", "950 ft"],
                      ["Bridgehouse and Chicago River Museum", "1,200 ft"],
                      ["Aon Center", "1,200 ft"],
                      ["Cloud Gate - The Bean", "1,350 ft"],
                      ["Grant Park", "1,550 ft"],
                      ["Maggie Daley Park", "1,700 ft"],
                      ["Picasso Statue", "1,900 ft"],
                      ["Chicago Tribune Tower", "2,050 ft"],
                      ["Marina City", "2,050 ft"]
                  ]
              },
              {
                  "title": "Top attractions",
                  "items": [
                      ["Art Institute of Chicago", "2,200 ft"],
                      ["Water Tower Chicago", "0.8 mi"],
                      ["Buckingham Memorial Fountain", "0.9 mi"],
                      ["360 Chicago", "1 mi"],
                      ["Willis Tower", "1 mi"],
                      ["Chicago Museum of Contemporary Art", "1 mi"],
                      ["Navy Pier", "1.2 mi"],
                      ["Field Museum Of Natural History", "1.5 mi"],
                      ["Adler Planetarium & Astronomy Museum", "2.1 mi"],
                      ["Lincoln Park Zoo", "2.7 mi"]
                  ]
              },
              {
                  "title": "Beaches in the neighborhood",
                  "items": [
                      ["Ohio Street Beach", "1.1 mi"],
                      ["Oak Street Beach", "1.6 mi"],
                      ["North Avenue Beach", "2.1 mi"],
                      ["Fullerton Beach", "2.9 mi"],
                      ["Oakwood Beach", "5 mi"]
                  ]
              },
              {
                  "title": "Public transit",
                  "items": [
                      ["Train - Millennium Station", "650 ft"],
                      ["Train - State/Lake", "1,050 ft"],
                      ["Subway - Lake", "1,150 ft"],
                      ["Subway - Washington", "1,950 ft"]
                  ]
              },
              {
                  "title": "Restaurants and cafes",
                  "items": [
                      ["Cafe/Bar - About Last Knife", "3.3 ft"],
                      ["Restaurant - Five Guys Burgers and Fries", "100 ft"],
                      ["Restaurant - Sweetgreen", "200 ft"]
                  ]
              },
              {
                  "title": "Natural beauty",
                  "items": [
                      ["Lake - Elite Yacht Services", "3,200 ft"],
                      ["Peak - Players Hill (187m)", "8 mi"]
                  ]
              },
              {
                  "title": "Closest airports",
                  "items": [
                      ["Midway International Airport", "10 mi"],
                      ["Chicago O'Hare International Airport", "16 mi"]
                  ]
              }
          ],
          "reviews": arloReviewDerivedSet()
      }
  ];

  function formatCount(n) {
    return Number(n || 0).toLocaleString();
  }

  function bookingScore(score5) {
    return (Number(score5 || 0) * 2).toFixed(1);
  }

  function bookingScoreWord(score10) {
    const score = Number(score10 || 0);
    if (score >= 9.0) return "Wonderful";
    if (score >= 8.5) return "Excellent";
    if (score >= 8.0) return "Very Good";
    if (score >= 7.0) return "Good";
    return "Pleasant";
  }

  function displayFact(item) {
    const text = String(item || "");
    const ratingMatch = text.match(/^Tripadvisor lists a ([\d.]+)\/5 traveler rating from ([\d,]+) reviews\.$/);
    if (ratingMatch) return `Guest rating: ${bookingScore(ratingMatch[1])}/10 from ${ratingMatch[2]} reviews.`;
    return text
      .replace(/^Tripadvisor classifies the property as /, "Hotel class: ")
      .replace(/^Tripadvisor lists the address as /, "Address: ")
      .replace(/^Tripadvisor lists the style as /, "Style: ")
      .replace(/^Tripadvisor lists /, "Property details: ")
      .replace(/^Tripadvisor notes /, "Property details: ");
  }

  function hotelMapQuery(hotel) {
    return `${hotel.name}, ${hotel.address}, Chicago, Illinois`;
  }

  function hotelMapUrl(hotel) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotelMapQuery(hotel))}`;
  }

  function hotelMapEmbedUrl(hotel) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(hotelMapQuery(hotel))}&output=embed`;
  }

  function scrollIntoModalView(target, offset = 12) {
    if (!target) return;
    const scrollEl = target.closest("[data-hotel-scroll='1']");
    if (!scrollEl) {
      target.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }
    const targetTop = target.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop - offset;
    scrollEl.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  }

  function setReviewVisibleCount(reviews, nextVisible, shouldScroll) {
    const total = Number(reviews.dataset.reviewTotal || 0);
    const initial = Number(reviews.dataset.reviewInitial || REVIEW_INITIAL_VISIBLE);
    const step = Number(reviews.dataset.reviewStep || REVIEW_BATCH_VISIBLE);
    const visible = Math.max(0, Math.min(total, Number(nextVisible || 0)));

    reviews.dataset.reviewVisible = String(visible);
    reviews.querySelectorAll("[data-review-index]").forEach(review => {
      const index = Number(review.getAttribute("data-review-index") || 0);
      review.hidden = index >= visible;
    });

    const status = reviews.querySelector("[data-review-status]");
    if (status) status.textContent = reviewStatusText(visible, total);

    const remaining = Math.max(0, total - visible);
    const showMore = reviews.querySelector("[data-review-action='show-more']");
    if (showMore) {
      showMore.hidden = remaining <= 0;
      if (remaining > 0) showMore.textContent = `Show ${formatCount(Math.min(step, remaining))} more`;
    }

    const showAll = reviews.querySelector("[data-review-action='show-all']");
    if (showAll) showAll.hidden = visible >= total;

    const collapse = reviews.querySelector("[data-review-action='collapse']");
    if (collapse) collapse.hidden = visible <= initial;

    if (shouldScroll) scrollIntoModalView(reviews);
  }

  function starText(n) {
    return `${n}-star`;
  }

  function bySort(value) {
    const hotels = HOTELS.slice();
    if (value === "class_high") hotels.sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));
    if (value === "name") hotels.sort((a, b) => a.name.localeCompare(b.name));
    return hotels;
  }

  function renderVersionLinks() {
    const { showReviews } = pageState();
    document.querySelectorAll("[data-version-link]").forEach(link => {
      const target = link.getAttribute("data-version-link");
      link.classList.toggle("is-active", (target === "with") === showReviews);
    });
  }

  function renderResults() {
    const state = pageState();
    const phaseLabel = document.getElementById("phaseLabel");
    const condLabel = document.getElementById("condLabel");
    if (phaseLabel) phaseLabel.textContent = state.versionLabel;
    if (condLabel) condLabel.textContent = "Chicago";
    renderVersionLinks();

    const coverStory = document.getElementById("coverStory");
    if (coverStory) {
      coverStory.style.display = "block";
      const coverText = coverStory.querySelector(".callout__text");
      if (coverText) {
        coverText.textContent = state.showReviews
          ? "Full Reviews Control: participants read guest ratings and individual review excerpts. No AI summary is shown in this version."
          : "Guest ratings and reviews are not displayed in this version.";
      }
      const coverTitle = coverStory.querySelector(".callout__title");
      if (coverTitle) coverTitle.textContent = state.showReviews ? "Information treatment:" : "Hotel information:";
    }

    const sortSelect = document.getElementById("sortSelect");
    const sortValue = sortSelect ? sortSelect.value : "recommended";
    const hotels = bySort(sortValue);
    const results = document.getElementById("results");
    results.innerHTML = "";

    for (const h of hotels) {
      const card = document.createElement("article");
      card.className = "card card--text";
      card.setAttribute("data-hotel-id", h.id);

      const score10 = bookingScore(h.guestRating);
      const scoreBox = state.showReviews ? `
        <div class="booking-scoreline">
          <div>
            <div class="booking-scoreword">${escapeXml(bookingScoreWord(score10))}</div>
            <div class="booking-reviewcount">${formatCount(h.guestReviewCount)} reviews</div>
          </div>
          <div class="booking-score">${escapeXml(score10)}</div>
        </div>
      ` : `
        <div class="booking-no-score">
          <strong>Guest reviews hidden</strong>
          <span>Review information is not shown in this version.</span>
        </div>
      `;

      card.innerHTML = `
        <div class="card__body">
          <div>
            <h3 class="hotel-title">${escapeXml(h.name)}</h3>
            <div class="sub"><button class="map-link" type="button" data-map="${escapeXml(h.id)}">Show on map</button> - ${escapeXml(h.neighborhood)} - ${escapeXml(h.address)}</div>
            <div class="listing-meta">${escapeXml(h.hotelClass)} - ${escapeXml(h.distance)}</div>
            <div class="booking-roomline">One selected room option available for this mock listing</div>
            <div>
              ${h.tags.map(t => `<span class="pill2">${escapeXml(t)}</span>`).join("")}
            </div>
            <div class="amenities">
              ${h.amenities.slice(0, 4).map(a => amenityChipHtml(a)).join("")}
            </div>
          </div>

          <div class="priceBox priceBox--text">
            ${scoreBox}
            <div>
              <div class="price price--words">$${h.priceNightly}</div>
              <div class="per">per night - comparable study rate</div>
            </div>
            <div class="cta">
              <button class="btn" type="button" data-open="${h.id}">See availability</button>
              <button class="btn2" type="button" data-open="${h.id}">${state.showReviews ? "Read reviews" : "View property details"}</button>
            </div>
          </div>
        </div>
      `;

      results.appendChild(card);
    }
  }

  function ratingBreakdownRows(hotel) {
    const b = hotel.ratingBreakdown;
    if (!b) return "";
    return Object.keys(b).map(k => `
      <div class="breakdown__row">
        <span class="breakdown__k">${escapeXml(k)}</span>
        <span class="breakdown__v">${escapeXml(bookingScore(b[k]))}</span>
      </div>
    `).join("");
  }

  function reviewStatusText(visible, total) {
    if (!total) return "No comments shown";
    if (visible >= total) return `Showing all ${formatCount(total)} comments`;
    return `Showing 1-${formatCount(visible)} of ${formatCount(total)} comments`;
  }

  function reviewCardHtml(review, index, initialVisible) {
    return `
      <div class="review" data-review="1" data-review-index="${index}"${index >= initialVisible ? " hidden" : ""}>
        <div class="review__meta">
          <div><strong>${escapeXml(review.who === "Tripadvisor reviewer" ? "Guest reviewer" : review.who)}</strong></div>
          <div>${escapeXml(review.when)}${typeof review.score5 === "number" ? ` - <span class="review__score">${escapeXml(String(review.score5))}/5</span>` : ""}</div>
        </div>
        <div class="review__quote">"${escapeXml(review.text)}"</div>
        <div class="chipRow">
          ${review.chips.map(c => `<span class="chip" data-chip="${escapeXml(c)}">${escapeXml(c)}</span>`).join("")}
        </div>
      </div>
    `;
  }

  function reviewsHtml(hotel) {
    const reviews = Array.isArray(hotel.reviews) ? hotel.reviews : [];
    const total = reviews.length;
    const initialVisible = total;
    return `
      <div
        class="reviews"
        id="reviews"
        data-track-section="reviews"
        data-review-total="${total}"
        data-review-visible="${initialVisible}"
        data-review-initial="${initialVisible}"
        data-review-step="${REVIEW_BATCH_VISIBLE}">
        <div class="reviews__head">
          <h3 style="margin:0">Review-derived guest comments</h3>
          <div class="tag">Based on review themes</div>
        </div>
        <div class="reviews__tools">
          <div class="reviews__count" data-review-status aria-live="polite">${escapeXml(reviewStatusText(initialVisible, total))}</div>
          <div class="reviews__actions">
            <button class="review-action review-action--quiet" type="button" data-review-action="back-top">Back to top</button>
          </div>
        </div>
        <div class="reviews__list" data-review-list>
          ${reviews.map((review, index) => reviewCardHtml(review, index, initialVisible)).join("")}
        </div>
      </div>
    `;
  }

  function factList(items) {
    return `
      <ul class="fact-list">
        ${items.map(item => `<li>${escapeXml(displayFact(item))}</li>`).join("")}
      </ul>
    `;
  }

  function aboutSectionsHtml(hotel) {
    if (!Array.isArray(hotel.aboutSections) || !hotel.aboutSections.length) {
      return `
        <div class="kv">
          <div class="k">Address</div><div>${escapeXml(hotel.address)}</div>
          <div class="k">Description</div><div>${escapeXml(hotel.about)}</div>
          <div class="k">Hotel class</div><div>${escapeXml(hotel.hotelClass)}</div>
        </div>
      `;
    }

    return `
      <div class="property-summary">
        <div class="kv property-summary__kv">
          <div class="k">Address</div><div>${escapeXml(hotel.address)}</div>
          <div class="k">Hotel class</div><div>${escapeXml(hotel.hotelClass)}</div>
          <div class="k">Transit</div><div>${escapeXml(hotel.distance)}</div>
        </div>
        <div class="property-pill-row">
          ${hotel.guestLovedNote ? `<span class="property-pill">${escapeXml(hotel.guestLovedNote)}</span>` : ""}
          ${hotel.locationScoreText ? `<span class="property-map-pill">${escapeXml(hotel.locationScoreText)}</span>` : ""}
        </div>
        <div class="about-card-grid">
          ${hotel.aboutSections.map(section => `
            <div class="about-card">
              <h4>${escapeXml(section.title)}</h4>
              <p>${escapeXml(section.text)}</p>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function areaInfoHtml(hotel) {
    if (!Array.isArray(hotel.areaInfo) || !hotel.areaInfo.length) return "";
    return `
      <div class="hotel-area-section" data-track-section="area_info">
        <div class="hotel-area-head">
          <div>
            <h3>Hotel area info</h3>
            <div class="property-pill-row">
              ${hotel.guestLovedNote ? `<span class="property-pill">${escapeXml(hotel.guestLovedNote)}</span>` : ""}
              ${hotel.locationScoreText ? `<button class="map-link property-map-pill" type="button" data-map="${escapeXml(hotel.id)}">${escapeXml(hotel.areaMapText || hotel.locationScoreText)} - show map</button>` : ""}
            </div>
          </div>
          <button class="btn hotel-area-cta" type="button" data-open="${escapeXml(hotel.id)}">See availability</button>
        </div>
        <div class="area-grid">
          ${hotel.areaInfo.map(group => `
            <div class="area-card">
              <h4>${escapeXml(group.title)}</h4>
              <div class="area-list">
                ${group.items.map(([name, distance]) => `
                  <div class="area-row">
                    <span>${escapeXml(name)}</span>
                    <strong>${escapeXml(distance)}</strong>
                  </div>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function amenityDetailsHtml(hotel) {
    if (!hotel.amenityDetails || !Array.isArray(hotel.amenityDetails.groups) || !hotel.amenityDetails.groups.length) return "";
    return `
      <div class="amenity-details-section" data-track-section="amenity_details">
        <div class="amenity-details-head">
          <div>
            <h3>Amenities of ${escapeXml(hotel.name)}</h3>
            ${hotel.amenityDetails.scoreLine ? `<div class="amenity-score-line">${escapeXml(hotel.amenityDetails.scoreLine)}</div>` : ""}
          </div>
          <button class="btn hotel-area-cta" type="button" data-open="${escapeXml(hotel.id)}">See availability</button>
        </div>
        <div class="amenity-detail-popular">
          <h4>Most popular amenities</h4>
          <div class="amenities">
            ${hotel.amenities.map(a => amenityChipHtml(a)).join("")}
          </div>
        </div>
        <div class="amenity-detail-grid">
          ${hotel.amenityDetails.groups.map(group => `
            <div class="amenity-detail-card">
              <h4>${escapeXml(group.title)}</h4>
              ${group.body ? `<p>${escapeXml(group.body)}</p>` : ""}
              <ul>
                ${group.items.map(item => `<li>${escapeXml(item)}</li>`).join("")}
              </ul>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function modalTemplate(hotel) {
    const state = pageState();
    const uiState = getUiState();
    const isSelected = uiState.selectedHotelId === hotel.id;
    const isSaved = uiState.savedHotelIds.includes(hotel.id);
    const actionStatus = isSelected
      ? `${hotel.name} is selected.`
      : isSaved
        ? `${hotel.name} is saved.`
        : "";
    return `
      <div class="modal-backdrop" data-close="1"></div>
      <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeXml(hotel.name)} details">
        <div class="modal__top">
          <div>
            <h2 class="modal__title">${escapeXml(hotel.name)}</h2>
            <div class="brand-pill">${escapeXml(hotel.brand)}</div>
            <div class="sub">${escapeXml(hotel.neighborhood)} - ${escapeXml(hotel.hotelClass)}</div>
          </div>
          <button class="xbtn" type="button" data-close="1" aria-label="Close">x</button>
        </div>

        <div class="modal__scroll" id="hotelModalScroll" data-hotel-scroll="1">
          <div class="modal__grid">
            <div class="modal__left">
              <div class="section">
                <h3>About this property</h3>
                <div data-track-section="description" class="track-slice">
                  ${aboutSectionsHtml(hotel)}
                </div>
              </div>

              <div class="section" data-track-section="facts">
                <h3>Verified hotel facts</h3>
                ${factList(hotel.facts)}
              </div>

              <div class="section" data-track-section="amenities">
                <h3>Most popular amenities</h3>
                <div class="amenities">
                  ${hotel.amenities.map(a => amenityChipHtml(a)).join("")}
                </div>
              </div>
            </div>

            <div class="modal__right">
              <div class="section section--availability" data-track-section="price_cta">
                <h3>Availability</h3>
                <div class="price price--words">$${hotel.priceNightly}</div>
                <div class="per">per night - comparable study rate for this experiment.</div>
                <div class="cta availability-actions">
                  <button class="btn${isSelected ? " is-selected" : ""}" type="button" data-book="${hotel.id}">${isSelected ? "Selected" : "Select hotel"}</button>
                  <button class="btn2${isSaved ? " is-saved" : ""}" type="button" data-fave="${hotel.id}">${isSaved ? "Saved" : "Save"}</button>
                  <div class="action-status" data-action-status aria-live="polite">${escapeXml(actionStatus)}</div>
                </div>
              </div>

              ${state.showReviews ? `
                <div class="section section--ratings">
                  <h3>Guest ratings</h3>
                  <div data-track-section="guest_ratings">
                      <div class="scorecard">
                      <div class="scorecard__big" aria-label="Overall guest score">${escapeXml(bookingScore(hotel.guestRating))}</div>
                      <div class="scorecard__meta">
                        <div class="scorecard__denom">/ 10</div>
                        <div class="scorecard__count">${formatCount(hotel.guestReviewCount)} guest reviews</div>
                      </div>
                    </div>
                    <div class="breakdown" aria-label="Rating by category">
                      ${ratingBreakdownRows(hotel)}
                    </div>
                  </div>
                </div>
              ` : ``}
            </div>
          </div>
          ${amenityDetailsHtml(hotel)}
          ${areaInfoHtml(hotel)}
          ${state.showReviews ? reviewsHtml(hotel) : ""}
        </div>
      </div>
    `;
  }

  function mapModalTemplate(hotel) {
    const mapUrl = hotelMapUrl(hotel);
    const embedUrl = hotelMapEmbedUrl(hotel);
    return `
      <div class="modal-backdrop" data-close="1"></div>
      <div class="modal map-modal" role="dialog" aria-modal="true" aria-label="${escapeXml(hotel.name)} map">
        <div class="modal__top">
          <div>
            <h2 class="modal__title">${escapeXml(hotel.name)}</h2>
            <div class="sub">${escapeXml(hotel.address)}</div>
          </div>
          <button class="xbtn" type="button" data-close="1" aria-label="Close">x</button>
        </div>
        <div class="modal__scroll map-modal__body">
          <iframe
            class="map-frame"
            title="${escapeXml(hotel.name)} map location"
            src="${escapeXml(embedUrl)}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
          <div class="map-address">
            <strong>Address</strong>
            <span>${escapeXml(hotel.address)}</span>
          </div>
          <div class="map-actions">
            <a class="btn" href="${escapeXml(mapUrl)}" target="_blank" rel="noreferrer">Open larger map</a>
            <button class="btn2" type="button" data-open="${hotel.id}">View hotel details</button>
          </div>
        </div>
      </div>
    `;
  }

  function openMapModal(hotelId) {
    const hotel = HOTELS.find(h => h.id === hotelId);
    if (!hotel) {
      if ((location.hash || "").startsWith("#map/")) location.hash = "#results";
      return;
    }

    if (activeHotelSession) {
      closeModal("map");
    }

    const root = document.getElementById("modalRoot");
    if (typeof modalScrollCleanup === "function") modalScrollCleanup();
    activeHotelSession = null;

    root.setAttribute("data-active-map", hotelId);
    root.removeAttribute("data-active-hotel");
    root.innerHTML = mapModalTemplate(hotel);
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    location.hash = "#map/" + hotelId;
    logEvent("open_map", { hotelId, address: hotel.address });
  }

  function openHotelModal(hotelId, source) {
    const hotel = HOTELS.find(h => h.id === hotelId);
    if (!hotel) {
      if ((location.hash || "").startsWith("#hotel/")) location.hash = "#results";
      return;
    }

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
    root.removeAttribute("data-active-map");
    root.innerHTML = modalTemplate(hotel);
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    location.hash = "#hotel/" + hotelId;

    logEvent("open_hotel", { hotelId, source, reviews: pageState().showReviews });

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

    root.querySelectorAll("[data-amenity]").forEach(a => {
      a.addEventListener("mouseenter", () => logEvent("amenity_hover", { hotelId, amenity: a.getAttribute("data-amenity") }));
      a.addEventListener("click", () => logEvent("amenity_click", { hotelId, amenity: a.getAttribute("data-amenity") }));
    });

    const reviews = root.querySelector("#reviews");
    if (reviews) {
      reviews.addEventListener("mouseenter", () => logEvent("reviews_hover", { hotelId }));
      reviews.addEventListener("click", (e) => {
        const actionButton = e.target && e.target.closest && e.target.closest("[data-review-action]");
        if (actionButton) {
          const action = actionButton.getAttribute("data-review-action");
          const visible = Number(reviews.dataset.reviewVisible || 0);
          const total = Number(reviews.dataset.reviewTotal || 0);
          const initial = Number(reviews.dataset.reviewInitial || REVIEW_INITIAL_VISIBLE);
          const step = Number(reviews.dataset.reviewStep || REVIEW_BATCH_VISIBLE);

          if (action === "show-more") {
            const nextVisible = Math.min(total, visible + step);
            setReviewVisibleCount(reviews, nextVisible, false);
            logEvent("reviews_show_more", { hotelId, visible: nextVisible, total });
          }
          if (action === "show-all") {
            setReviewVisibleCount(reviews, total, false);
            logEvent("reviews_show_all", { hotelId, total });
          }
          if (action === "collapse") {
            setReviewVisibleCount(reviews, initial, true);
            logEvent("reviews_collapse", { hotelId, visible: initial, total });
          }
          if (action === "back-top") {
            const scrollEl = root.querySelector("[data-hotel-scroll='1']");
            if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: "smooth" });
            logEvent("reviews_back_top", { hotelId });
          }
          return;
        }

        const chip = e.target && e.target.closest && e.target.closest("[data-chip]");
        if (chip) logEvent("review_chip_click", { hotelId, chip: chip.getAttribute("data-chip") });
      });
    }

    root.querySelectorAll("[data-book]").forEach(b => {
      b.addEventListener("click", () => {
        const uiState = getUiState();
        uiState.selectedHotelId = hotelId;
        setUiState(uiState);
        b.textContent = "Selected";
        b.classList.add("is-selected");
        const status = root.querySelector("[data-action-status]");
        if (status) status.textContent = `${hotel.name} selected.`;
        logEvent("book_click", { hotelId, selected: true });
      });
    });
    root.querySelectorAll("[data-fave]").forEach(b => {
      b.addEventListener("click", () => {
        const uiState = getUiState();
        const saved = new Set(uiState.savedHotelIds);
        const willSave = !saved.has(hotelId);
        if (willSave) saved.add(hotelId);
        else saved.delete(hotelId);
        uiState.savedHotelIds = Array.from(saved);
        setUiState(uiState);
        b.textContent = willSave ? "Saved" : "Save";
        b.classList.toggle("is-saved", willSave);
        const status = root.querySelector("[data-action-status]");
        if (status) status.textContent = willSave ? `${hotel.name} saved.` : `${hotel.name} removed from saved hotels.`;
        logEvent("save_click", { hotelId, saved: willSave });
      });
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
    root.removeAttribute("data-active-map");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = "";
    document.body.style.overflow = "";
    if ((location.hash || "").startsWith("#hotel/") || (location.hash || "").startsWith("#map/")) location.hash = "#results";
    logEvent("close_modal", { source });
  }

  function wireGlobalHandlers() {
    const state = pageState();
    const phaseLabel = document.getElementById("phaseLabel");
    const condLabel = document.getElementById("condLabel");
    if (phaseLabel) phaseLabel.textContent = state.versionLabel;
    if (condLabel) condLabel.textContent = "Chicago";
    renderVersionLinks();

    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        logEvent("sort_change", { value: e.target.value });
        renderResults();
      });
    }

    const downloadLogBtn = document.getElementById("downloadLogBtn");
    if (downloadLogBtn) {
      downloadLogBtn.addEventListener("click", () => {
        const logs = getLogs();
        const lines = logs.map(x => JSON.stringify(x)).join("\n");
        download("mock_hotel_logs.jsonl", lines);
        logEvent("download_log", { count: logs.length });
      });
    }

    const resetLogBtn = document.getElementById("resetLogBtn");
    if (resetLogBtn) {
      resetLogBtn.addEventListener("click", () => {
        setLogs([]);
        logEvent("reset_log", {});
      });
    }

    document.addEventListener("click", (e) => {
      const open = e.target && e.target.closest && e.target.closest("[data-open]");
      if (open) {
        const hotelId = open.getAttribute("data-open");
        openHotelModal(hotelId, "results");
        return;
      }

      const map = e.target && e.target.closest && e.target.closest("[data-map]");
      if (map) {
        const hotelId = map.getAttribute("data-map");
        openMapModal(hotelId);
        return;
      }

      const close = e.target && e.target.closest && e.target.closest("[data-close='1']");
      if (close) {
        closeModal("click");
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
      if (h.startsWith("#hotel/")) {
        const id = h.split("/")[1];
        openHotelModal(id, "deeplink");
      }
      if (h.startsWith("#map/")) {
        const id = h.split("/")[1];
        openMapModal(id);
      }
    });
  }

  function init() {
    renderResults();
    wireGlobalHandlers();

    logEvent("page_load", {
      phase: pageState().phase,
      reviews: pageState().showReviews,
      city: "Chicago"
    });

    const h = location.hash || "";
    if (h.startsWith("#hotel/")) {
      const id = h.split("/")[1];
      openHotelModal(id, "deeplink");
    }
    if (h.startsWith("#map/")) {
      const id = h.split("/")[1];
      openMapModal(id);
    }
  }

  init();
})();
