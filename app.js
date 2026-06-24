(() => {
  const STORAGE_KEY = "mock_hotel_logs_v2";
  const UI_STATE_KEY = "mock_hotel_ui_state_v1";

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
          "reviews": [
              {
                  "who": "conference attendee",
                  "when": "Jun 2026",
                  "score5": 4,
                  "text": "The location near State/Lake made the workday easy, and the Wi-Fi held up well for calls.",
                  "chips": [
                      "Wi-Fi",
                      "Location"
                  ]
              },
              {
                  "who": "couple",
                  "when": "Jan 2026",
                  "score5": 4,
                  "text": "The King Guestroom felt polished and clean, with comfortable bedding and a good breakfast option downstairs.",
                  "chips": [
                      "Comfort",
                      "Breakfast"
                  ]
              },
              {
                  "who": "solo traveler",
                  "when": "May 2026",
                  "score5": 4,
                  "text": "Staff handled check-in smoothly and the hotel worked well for walking to Millennium Park and the river.",
                  "chips": [
                      "Service",
                      "Walkability"
                  ]
              }
          ]
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
          "reviews": [
              {
                  "who": "business traveler",
                  "when": "Apr 2026",
                  "score5": 4,
                  "text": "The room was quiet enough for work, and the rooftop was a nice place to unwind after meetings.",
                  "chips": [
                      "Quiet",
                      "Rooftop"
                  ]
              },
              {
                  "who": "couple",
                  "when": "Feb 2026",
                  "score5": 5,
                  "text": "We liked the Gold Coast location and found the staff polished without being stiff.",
                  "chips": [
                      "Location",
                      "Service"
                  ]
              },
              {
                  "who": "solo traveler",
                  "when": "Jul 2025",
                  "score5": 4,
                  "text": "Clark/Division was close, the minibar and coffee setup were useful, and the bed was comfortable.",
                  "chips": [
                      "Transit",
                      "Comfort"
                  ]
              }
          ]
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
          "reviews": [
              {
                  "who": "friends on a weekend trip",
                  "when": "Mar 2026",
                  "score5": 4,
                  "text": "The location by Damen was excellent, with plenty of restaurants and bars nearby.",
                  "chips": [
                      "Transit",
                      "Neighborhood"
                  ]
              },
              {
                  "who": "solo traveler",
                  "when": "Jun 2025",
                  "score5": 4,
                  "text": "The room felt stylish and clean, though city noise was noticeable at times.",
                  "chips": [
                      "Cleanliness",
                      "Noise"
                  ]
              },
              {
                  "who": "couple",
                  "when": "Aug 2025",
                  "score5": 5,
                  "text": "The rooftop view and Wicker Park location made the stay feel special.",
                  "chips": [
                      "Rooftop",
                      "Location"
                  ]
              }
          ]
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
          "reviews": [
              {
                  "who": "couple",
                  "when": "Apr 2026",
                  "score5": 4,
                  "text": "The West Loop location was ideal for restaurants, and the room was tidy and modern.",
                  "chips": [
                      "Restaurants",
                      "Cleanliness"
                  ]
              },
              {
                  "who": "business traveler",
                  "when": "Nov 2025",
                  "score5": 4,
                  "text": "Morgan station was close and the desk setup worked well for a short work trip.",
                  "chips": [
                      "Transit",
                      "Work trip"
                  ]
              },
              {
                  "who": "family",
                  "when": "Jul 2025",
                  "score5": 4,
                  "text": "The staff were helpful, and the rooftop garden made the hotel feel calmer than the neighborhood outside.",
                  "chips": [
                      "Service",
                      "Rooftop"
                  ]
              }
          ]
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
              "Excellent location rated 9.5/10 from 364 reviews.",
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
          "guestReviewCount": 364,
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
          "reviews": [
              {
                  "who": "couple",
                  "when": "Feb 2026",
                  "score5": 4,
                  "text": "The Yubune King felt spacious and the restaurant made dinner easy after a long day.",
                  "chips": [
                      "Room size",
                      "Dining"
                  ]
              },
              {
                  "who": "business traveler",
                  "when": "May 2026",
                  "score5": 4,
                  "text": "Service was attentive, Wi-Fi worked well, and the West Loop location was convenient.",
                  "chips": [
                      "Service",
                      "Wi-Fi"
                  ]
              },
              {
                  "who": "solo traveler",
                  "when": "Sep 2025",
                  "score5": 4,
                  "text": "The pool and steam room were nice extras, though the overall price felt premium.",
                  "chips": [
                      "Pool",
                      "Value"
                  ]
              }
          ]
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
              "Excellent location rated 9.7/10 from 1,951 reviews.",
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
          "guestRating": 4.85,
          "guestReviewCount": 1951,
          "ratingBreakdown": {
              "Location": 4.85,
              "Rooms": 4.4,
              "Value": 4.2,
              "Cleanliness": 4.6,
              "Service": 4.4,
              "Sleep Quality": 4.2
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
          "reviews": [
              {
                  "who": "solo traveler",
                  "when": "Apr 2026",
                  "score5": 5,
                  "text": "The location was excellent for Millennium Park, transit and the theater area.",
                  "chips": [
                      "Location",
                      "Transit"
                  ]
              },
              {
                  "who": "business traveler",
                  "when": "Jan 2026",
                  "score5": 4,
                  "text": "The room was compact but clean, and the Wi-Fi was reliable for work.",
                  "chips": [
                      "Cleanliness",
                      "Wi-Fi"
                  ]
              },
              {
                  "who": "couple",
                  "when": "Oct 2025",
                  "score5": 4,
                  "text": "Breakfast was easy, the staff gave useful directions, and the price felt reasonable for the Loop.",
                  "chips": [
                      "Breakfast",
                      "Value"
                  ]
              }
          ]
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
                  <div class="reviews" id="reviews" data-track-section="reviews">
                    <div class="reviews__head">
                      <h3 style="margin:0">Real review excerpts</h3>
                      <div class="tag">Guest review excerpts</div>
                    </div>
                    ${hotel.reviews.map(r => `
                      <div class="review" data-review="1">
                        <div class="review__meta">
                          <div><strong>${escapeXml(r.who === "Tripadvisor reviewer" ? "Guest reviewer" : r.who)}</strong></div>
                          <div>${escapeXml(r.when)}${typeof r.score5 === "number" ? ` - <span class="review__score">${escapeXml(String(r.score5))}/5</span>` : ""}</div>
                        </div>
                        <div class="review__quote">"${escapeXml(r.text)}"</div>
                        <div class="chipRow">
                          ${r.chips.map(c => `<span class="chip" data-chip="${escapeXml(c)}">${escapeXml(c)}</span>`).join("")}
                        </div>
                      </div>
                    `).join("")}
                  </div>
                </div>
              ` : ``}
            </div>
          </div>
          ${amenityDetailsHtml(hotel)}
          ${areaInfoHtml(hotel)}
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
