(() => {
  const STORAGE_KEY = "mock_hotel_logs_v2";
  const UI_STATE_KEY = "mock_hotel_ui_state_v1";

  let activeHotelSession = null;
  let modalScrollCleanup = null;
  const REVIEW_INITIAL_VISIBLE = 12;
  const REVIEW_BATCH_VISIBLE = 24;

  const EMBEDDED_EXACT_HOTEL_REVIEWS = {
    "pendry-chicago": [
      {
        "reviewer": "Bernadette",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Queen Queen Guestroom",
        "stay": "3 nights · June 2026",
        "guestType": "Couple",
        "reviewed": "June 11, 2026",
        "title": "Design, comfort, and convenience- exactly what we wanted for our NeoCon visit!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Elegant but not pretentious. Great location and friendly staff. The beds were very comfortable and the rooms were clean. Will definitely stay there again.",
        "negative": "",
        "body": "Elegant but not pretentious. Great location and friendly staff. The beds were very comfortable and the rooms were clean. Will definitely stay there again."
      },
      {
        "reviewer": "Lisa",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "3 nights · June 2026",
        "guestType": "Couple",
        "reviewed": "June 6, 2026",
        "title": "We look forward to returning!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "historic building location\nexceptional staff; above and beyond bellman service; we felt well taken care of",
        "negative": "no cashier at the property",
        "body": "historic building location\nexceptional staff; above and beyond bellman service; we felt well taken care of\nno cashier at the property"
      },
      {
        "reviewer": "Kirrily",
        "activeSince": "Active since 2012",
        "country": "United States",
        "room": "Queen Queen Guestroom",
        "stay": "2 nights · May 2026",
        "guestType": "Couple",
        "reviewed": "May 30, 2026",
        "title": "Stunning stay in a Chicago icon",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Gorgeously appointed hotel in a fantastic location. The building is iconic and the staff were so helpful and delightful. They could not have done enough to assist.",
        "negative": "Nothing. It was perfect!",
        "body": "Gorgeously appointed hotel in a fantastic location. The building is iconic and the staff were so helpful and delightful. They could not have done enough to assist.\nNothing. It was perfect!"
      },
      {
        "reviewer": "Todd",
        "activeSince": "Active since 2013",
        "country": "Canada",
        "room": "Corner King",
        "stay": "3 nights · May 2026",
        "guestType": "Couple",
        "reviewed": "May 25, 2026",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Spacious room and a fantastic location",
        "negative": "Traffic noise was very loud… but quieted late in the evenings",
        "body": "Spacious room and a fantastic location\nTraffic noise was very loud… but quieted late in the evenings"
      },
      {
        "reviewer": "Abigail",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Queen Queen Guestroom",
        "stay": "3 nights · March 2026",
        "guestType": "Group",
        "reviewed": "March 16, 2026",
        "title": "Had an above and beyond experience. The service and cleanliness of the hotel made this hotel a new favorite.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The staff was extremely accommodating. The room was cleaned to perfection every day we were there. Above and beyond.",
        "negative": "",
        "body": "The staff was extremely accommodating. The room was cleaned to perfection every day we were there. Above and beyond."
      },
      {
        "reviewer": "Andrea",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "6 nights · March 2026",
        "guestType": "Couple",
        "reviewed": "March 15, 2026",
        "title": "Came to town for spring break and had a great time.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location. Walking distance to a lot of attractions: art institute,river, bus and train stops",
        "negative": "",
        "body": "Great location. Walking distance to a lot of attractions: art institute,river, bus and train stops"
      },
      {
        "reviewer": "Moises",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "2 nights · February 2026",
        "guestType": "Couple",
        "reviewed": "March 14, 2026",
        "title": "Excellent",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Excellent\nExcellent",
        "negative": "",
        "body": "Excellent\nExcellent"
      },
      {
        "reviewer": "Kortni",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Corner King",
        "stay": "3 nights · March 2026",
        "guestType": "Group",
        "reviewed": "March 13, 2026",
        "title": "Excellent, no notes!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Loved our stay!!! The staff was so friendly and they even surprised me with a bottle of champagne and cupcakes for my birthday. The room was super spacious and clean. This was by far one of my favorite hotel stays.",
        "negative": "Only wished the rooftop was open on Sunday for brunch!",
        "body": "Loved our stay!!! The staff was so friendly and they even surprised me with a bottle of champagne and cupcakes for my birthday. The room was super spacious and clean. This was by far one of my favorite hotel stays.\nOnly wished the rooftop was open on Sunday for brunch!"
      },
      {
        "reviewer": "Spriha",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "City King",
        "stay": "1 night · January 2026",
        "guestType": "Couple",
        "reviewed": "January 18, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location and amazingly good value. We received a complimentary upgrade because our room wasn't ready and they even comped us some drinks at the bar while we waited. The concierge texted us a few days in advance to ask how they could help which was a nice touch. Great service that made it truly feel like a luxury hotel. And you can't beat the unique architecture.",
        "negative": "The on-site restaurant is just so-so but in room dining was excellent. Did think it was a bit odd they charged both an $8 delivery fee and a 22% service charge for it, thought it should have been one or the either given the service is just in the delivery",
        "body": "Great location and amazingly good value. We received a complimentary upgrade because our room wasn't ready and they even comped us some drinks at the bar while we waited. The concierge texted us a few days in advance to ask how they could help which was a nice touch. Great service that made it truly feel like a luxury hotel. And you can't beat the unique architecture.\nThe on-site restaurant is just so-so but in room dining was excellent. Did think it was a bit odd they charged both an $8 delivery fee and a 22% service charge for it, thought it should have been one or the either given the service is just in the delivery"
      },
      {
        "reviewer": "Cathy",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "City King",
        "stay": "1 night · December 2025",
        "guestType": "Couple",
        "reviewed": "January 5, 2026",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The people who worked there were great! Quick",
        "negative": "Quick service.",
        "body": "The people who worked there were great! Quick\nQuick service."
      },
      {
        "reviewer": "Nassyre",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Corner King",
        "stay": "5 nights · December 2025",
        "guestType": "Couple",
        "reviewed": "January 2, 2026",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Breakfast inside the hotel was pretty good and convenient when not looking to leave the room. The complementary water and espresso shots in the room also make for a great jump start or night cap when you wanted to maintain your comfort. Perry did everything to make sure any question, concern, or need was handled promptly.",
        "negative": "After a long morning of moving about the city we returned to the hotel bar area with food that we had purchased before returning and were told that outside food was not allowed in the bar/restaurant area. We returned during check in time so the small lobby was full and there was nowhere else to dine while our room was being turned.",
        "body": "Breakfast inside the hotel was pretty good and convenient when not looking to leave the room. The complementary water and espresso shots in the room also make for a great jump start or night cap when you wanted to maintain your comfort. Perry did everything to make sure any question, concern, or need was handled promptly.\nAfter a long morning of moving about the city we returned to the hotel bar area with food that we had purchased before returning and were told that outside food was not allowed in the bar/restaurant area. We returned during check in time so the small lobby was full and there was nowhere else to dine while our room was being turned."
      },
      {
        "reviewer": "Don",
        "activeSince": "Active since 2014",
        "country": "Australia",
        "room": "Corner King",
        "stay": "4 nights · October 2025",
        "guestType": "Couple",
        "reviewed": "October 25, 2025",
        "title": "A beautiful hotel",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "A very beautiful hotel, a large light filled room with tasteful styling",
        "negative": "",
        "body": "A very beautiful hotel, a large light filled room with tasteful styling"
      },
      {
        "reviewer": "Mikew49",
        "activeSince": "Active since 2013",
        "country": "United Kingdom",
        "room": "Accessible King Guest Room",
        "stay": "3 nights · October 2025",
        "guestType": "Couple",
        "reviewed": "October 13, 2025",
        "title": "Great location, but could be very noisy.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location, comfortable bed",
        "negative": "Very noisy, even on 21st floor. Traffic noise especially bad on our first night. Wardrobe in our room was awkward to access.",
        "body": "Location, comfortable bed\nVery noisy, even on 21st floor. Traffic noise especially bad on our first night. Wardrobe in our room was awkward to access."
      },
      {
        "reviewer": "Casey",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Accessible 2 Queen Guestroom",
        "stay": "3 nights · October 2025",
        "guestType": "Couple",
        "reviewed": "October 10, 2025",
        "title": "We enjoyed Chicago but should’ve just stayed at the Four seasons",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "It’s a great location and they gave our boys a welcome penguin.\nWe couldn’t see the rooftop view bc our boys were 8 & 10 and it’s 21 and up. We would’ve loved to have a “free” family picture. The room service food was about a 5 (crudités, pasta and a chicken sandwich $150)",
        "negative": "Only one side of the elevators went to our floor, spent a little time waiting.",
        "body": "It’s a great location and they gave our boys a welcome penguin.\nWe couldn’t see the rooftop view bc our boys were 8 & 10 and it’s 21 and up. We would’ve loved to have a “free” family picture. The room service food was about a 5 (crudités, pasta and a chicken sandwich $150)\nOnly one side of the elevators went to our floor, spent a little time waiting."
      },
      {
        "reviewer": "Jennifer",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Accessible King Guest Room",
        "stay": "4 nights · October 2025",
        "guestType": "Family",
        "reviewed": "October 5, 2025",
        "title": "Wonderful! Everything was top notch!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Hotel was fantastic!! The staff? Exceptional! I will be going back in a heart beat.",
        "negative": "Michigan Ave is quite noisy on Friday and Saturday evening. Not quite the Hotel's fault but it is a very busy area.",
        "body": "Hotel was fantastic!! The staff? Exceptional! I will be going back in a heart beat.\nMichigan Ave is quite noisy on Friday and Saturday evening. Not quite the Hotel's fault but it is a very busy area."
      },
      {
        "reviewer": "Jill",
        "activeSince": "Active since 2013",
        "country": "United Kingdom",
        "room": "King Guestroom",
        "stay": "3 nights · September 2025",
        "guestType": "Couple",
        "reviewed": "September 29, 2025",
        "title": "Enjoyed every minute",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Central Chicago, very walkable to all our destinations",
        "negative": "In-room information",
        "body": "Central Chicago, very walkable to all our destinations\nIn-room information"
      },
      {
        "reviewer": "Dalila",
        "activeSince": "Active since 2021",
        "country": "United Kingdom",
        "room": "Queen Queen Guestroom",
        "stay": "3 nights · September 2025",
        "guestType": "Group",
        "reviewed": "September 11, 2025",
        "title": "Fantastic, great location and even better staff",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "It’s in a fantastic location and easy to get to loads of other places within a short amount of time. The staff were very helpful and they have a fantastic concierge that knew everything and I’m very sure if he didn’t know it, it wasn’t worth knowing.",
        "negative": "",
        "body": "It’s in a fantastic location and easy to get to loads of other places within a short amount of time. The staff were very helpful and they have a fantastic concierge that knew everything and I’m very sure if he didn’t know it, it wasn’t worth knowing."
      },
      {
        "reviewer": "Alan",
        "activeSince": "Active since 2017",
        "country": "United Kingdom",
        "room": "Corner King",
        "stay": "5 nights · September 2025",
        "guestType": "Couple",
        "reviewed": "September 10, 2025",
        "title": "A lovely art deco Hotel in Central Chicago",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The accommodation was in a historic building with lots of interesting art deco features. The room was large and comfortable.",
        "negative": "whilst the room was large and comfortable, there were only two small windows and it was quite dark. Although we were on the top floor, the views were limited because of the tall buildings surrounding it.",
        "body": "The accommodation was in a historic building with lots of interesting art deco features. The room was large and comfortable.\nwhilst the room was large and comfortable, there were only two small windows and it was quite dark. Although we were on the top floor, the views were limited because of the tall buildings surrounding it."
      },
      {
        "reviewer": "Nomita",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "4 nights · September 2025",
        "guestType": "Couple",
        "reviewed": "September 6, 2025",
        "title": "Perfect in every which way except up this strange smell",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location\nCleanliness\nFriendly and helpful staff",
        "negative": "Our room has a strange smell ..",
        "body": "Location\nCleanliness\nFriendly and helpful staff\nOur room has a strange smell .."
      },
      {
        "reviewer": "Lopadchak",
        "activeSince": "Active since 2023",
        "country": "Canada",
        "room": "King Guestroom",
        "stay": "3 nights · August 2025",
        "guestType": "Family",
        "reviewed": "September 5, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Really clean room!",
        "negative": "",
        "body": "Really clean room!"
      },
      {
        "reviewer": "Diego",
        "activeSince": "Active since 2022",
        "country": "Spain",
        "room": "King Guestroom",
        "stay": "4 nights · August 2025",
        "guestType": "Couple",
        "reviewed": "August 31, 2025",
        "title": "When will I come back? :)",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Location, price, the bed (oh, God, the bed), the tea at the reception (😅)",
        "negative": "Cleanliness (it could be better, specially the robes) it’s my third time at the hotel and this is a recurrent problem",
        "body": "Location, price, the bed (oh, God, the bed), the tea at the reception (😅)\nCleanliness (it could be better, specially the robes) it’s my third time at the hotel and this is a recurrent problem"
      },
      {
        "reviewer": "Julia",
        "activeSince": "Active since 2015",
        "country": "United Kingdom",
        "room": "City King",
        "stay": "3 nights · August 2025",
        "guestType": "Solo traveler",
        "reviewed": "August 29, 2025",
        "title": "A beautiful stay in an iconic building",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "I had a beautiful, comfortable room that was very clean and had all the amenities I needed. Room service was quick and the fitness centre was well stocked.",
        "negative": "Elevators could be slow at times.",
        "body": "I had a beautiful, comfortable room that was very clean and had all the amenities I needed. Room service was quick and the fitness centre was well stocked.\nElevators could be slow at times."
      },
      {
        "reviewer": "Kenny",
        "activeSince": "",
        "country": "United States",
        "room": "Corner King",
        "stay": "4 nights · July 2025",
        "guestType": "Couple",
        "reviewed": "August 10, 2025",
        "title": "It was amazing 👏",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "I was able to walk around in please 🙏🏾. We enjoyed the Soul feeling .",
        "negative": "We enjoyed everything 🙌 ❤️",
        "body": "I was able to walk around in please 🙏🏾. We enjoyed the Soul feeling .\nWe enjoyed everything 🙌 ❤️"
      },
      {
        "reviewer": "Turkhia",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "3 nights · July 2025",
        "guestType": "Couple",
        "reviewed": "July 19, 2025",
        "title": "Comfortable",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location and cleanliness",
        "negative": "-",
        "body": "Location and cleanliness\n-"
      },
      {
        "reviewer": "Magalie",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Queen Queen Guestroom",
        "stay": "3 nights · July 2025",
        "guestType": "Group",
        "reviewed": "July 18, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "A beautiful historic hotel in a great location . Friendly staff. Great restaurant and bar.",
        "negative": "That the rooftop bar was closed for an event. I wished I could’ve experienced that.",
        "body": "A beautiful historic hotel in a great location . Friendly staff. Great restaurant and bar.\nThat the rooftop bar was closed for an event. I wished I could’ve experienced that."
      },
      {
        "reviewer": "Justin",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "City King",
        "stay": "4 nights · July 2025",
        "guestType": "Couple",
        "reviewed": "July 17, 2025",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Staff and housekeeping were amazing! The location is perfect - we walked everywhere and took the redline to most places.",
        "negative": "There were two elevators out of the three and you had to wait sometimes up to 15 minutes for an elevator to be free and not filled with people and you couldn’t fit. The sounds from the streets is crazy - we faced the street and it was so loud. From the fire trucks - to the protestors - to the honking. It was all night long.",
        "body": "Staff and housekeeping were amazing! The location is perfect - we walked everywhere and took the redline to most places.\nThere were two elevators out of the three and you had to wait sometimes up to 15 minutes for an elevator to be free and not filled with people and you couldn’t fit. The sounds from the streets is crazy - we faced the street and it was so loud. From the fire trucks - to the protestors - to the honking. It was all night long."
      },
      {
        "reviewer": "Mariella",
        "activeSince": "Active since 2011",
        "country": "United States",
        "room": "Accessible King Guest Room",
        "stay": "3 nights · July 2025",
        "guestType": "Couple",
        "reviewed": "July 10, 2025",
        "title": "Great location and great property, but noisy",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location and the size of the room.",
        "negative": "The noise that you could hear from the streets. It was hard to fall asleep and during the night I was woken up by the sirens from police and firefighters.",
        "body": "Location and the size of the room.\nThe noise that you could hear from the streets. It was hard to fall asleep and during the night I was woken up by the sirens from police and firefighters."
      },
      {
        "reviewer": "John",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "3 nights · July 2025",
        "guestType": "Couple",
        "reviewed": "July 8, 2025",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location",
        "negative": "Bill surcharges",
        "body": "Location\nBill surcharges"
      },
      {
        "reviewer": "Kirill",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Tower King",
        "stay": "4 nights · July 2025",
        "guestType": "Family",
        "reviewed": "July 3, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Good location, friendly staff, exceptional service. Art Deco style hotel but renovated and very clean. We had the stunning city view. Nice breakfasts in a cozy French-style cafe",
        "negative": "Nothing",
        "body": "Good location, friendly staff, exceptional service. Art Deco style hotel but renovated and very clean. We had the stunning city view. Nice breakfasts in a cozy French-style cafe\nNothing"
      },
      {
        "reviewer": "Melissa",
        "activeSince": "Active since 2016",
        "country": "Canada",
        "room": "Tower King",
        "stay": "3 nights · April 2025",
        "guestType": "Couple",
        "reviewed": "July 3, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "A beautiful piece of architecture in a great location.",
        "negative": "Some of the fixtures in the bathroom were broken.",
        "body": "A beautiful piece of architecture in a great location.\nSome of the fixtures in the bathroom were broken."
      },
      {
        "reviewer": "Rachel",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "3 nights · June 2025",
        "guestType": "Couple",
        "reviewed": "June 16, 2025",
        "title": "Our stay was perfect, relaxing and fun. Thank you for having such a warm and inviting hotel.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "What didn’t we like about the property?! The building and all the amenities were beautiful. The cafe, restaurants, lounge, bars, all just perfect. The rooms were quiet and comfortable and oh so clean! The concierge, front desk and the valet were so welcoming and helpful! The complimentary car was the perfect added touch. We would 100% stay here again and recommend it to everyone. It’s located in the perfect spot and so close to everything! I could go on and on…",
        "negative": "There’s nothing we didn’t like. Oh, the espresso machine in the room if I HaD to pick something haha.",
        "body": "What didn’t we like about the property?! The building and all the amenities were beautiful. The cafe, restaurants, lounge, bars, all just perfect. The rooms were quiet and comfortable and oh so clean! The concierge, front desk and the valet were so welcoming and helpful! The complimentary car was the perfect added touch. We would 100% stay here again and recommend it to everyone. It’s located in the perfect spot and so close to everything! I could go on and on…\nThere’s nothing we didn’t like. Oh, the espresso machine in the room if I HaD to pick something haha."
      },
      {
        "reviewer": "Nikki",
        "activeSince": "",
        "country": "United States",
        "room": "Corner King",
        "stay": "1 night · May 2025",
        "guestType": "Couple",
        "reviewed": "June 14, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "We were speechless walking into our room. Staff and room exceeded our expectations and we cannot wait to book again.",
        "negative": "",
        "body": "We were speechless walking into our room. Staff and room exceeded our expectations and we cannot wait to book again."
      },
      {
        "reviewer": "Leonard",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "Corner King",
        "stay": "3 nights · May 2025",
        "guestType": "Couple",
        "reviewed": "May 13, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "great location, service and room",
        "negative": "",
        "body": "great location, service and room"
      },
      {
        "reviewer": "Jamie",
        "activeSince": "",
        "country": "United Kingdom",
        "room": "Queen Queen Guestroom",
        "stay": "4 nights · May 2025",
        "guestType": "Solo traveler",
        "reviewed": "May 9, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Stunning hotel, great location.",
        "negative": "Rooftop bar open only on Friday and Saturday",
        "body": "Stunning hotel, great location.\nRooftop bar open only on Friday and Saturday"
      },
      {
        "reviewer": "Peter",
        "activeSince": "",
        "country": "United States",
        "room": "City King",
        "stay": "1 night · April 2025",
        "guestType": "Couple",
        "reviewed": "April 25, 2025",
        "title": "Nice stay saw a ballgame",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Walk to everything",
        "negative": "Pricey",
        "body": "Walk to everything\nPricey"
      },
      {
        "reviewer": "Guido",
        "activeSince": "Active since 2012",
        "country": "Germany",
        "room": "Corner King",
        "stay": "5 nights · March 2025",
        "guestType": "Couple",
        "reviewed": "March 18, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Very pretty building, nice furniture. Excellent bar with great personnell.",
        "negative": "Hmm. Free breakfast??",
        "body": "Very pretty building, nice furniture. Excellent bar with great personnell.\nHmm. Free breakfast??"
      },
      {
        "reviewer": "Stephanie",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Queen Queen Guestroom",
        "stay": "4 nights · March 2025",
        "guestType": "Family",
        "reviewed": "March 14, 2025",
        "title": "Stay here. This is a fabulous hotel.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "It is an absolutely beautiful, historic building in a wonderful location on Michigan Avenue, about 2 long blocks from the Riverwalk one way, and about 3 blocks from Millennium Park and Cloud Gate (“the Bean”) the other way. Anything you need you can find just steps away. The staff was phenomenal, from start to finish. Truly, it was the best customer service I think I’ve ever received at any hotel. The beds are comfy, rooms are very clean and well-appointed.",
        "negative": "The refrigerator in the room is a chiller, not a refrigerator. It kept drinks cold, but we did not feel like it was safe to keep food as we didn’t know how cold it would get. We did not love the in-room coffee machines. They were little espresso Keurig-type machines for little cups of coffee in small glass tumblers. The coffee was delicious, though. Finally, the hotel is on Michigan Avenue so there is a fair amount of street noise. We expected that based on location, but that may be an issue for some so I wanted to mention it. The rooftop lounge was closed, presumably because of the time of year, so if that’s something you’re looking for, make sure it’s open at the time of year you’re visiting.",
        "body": "It is an absolutely beautiful, historic building in a wonderful location on Michigan Avenue, about 2 long blocks from the Riverwalk one way, and about 3 blocks from Millennium Park and Cloud Gate (“the Bean”) the other way. Anything you need you can find just steps away. The staff was phenomenal, from start to finish. Truly, it was the best customer service I think I’ve ever received at any hotel. The beds are comfy, rooms are very clean and well-appointed.\nThe refrigerator in the room is a chiller, not a refrigerator. It kept drinks cold, but we did not feel like it was safe to keep food as we didn’t know how cold it would get. We did not love the in-room coffee machines. They were little espresso Keurig-type machines for little cups of coffee in small glass tumblers. The coffee was delicious, though. Finally, the hotel is on Michigan Avenue so there is a fair amount of street noise. We expected that based on location, but that may be an issue for some so I wanted to mention it. The rooftop lounge was closed, presumably because of the time of year, so if that’s something you’re looking for, make sure it’s open at the time of year you’re visiting."
      },
      {
        "reviewer": "Ruth",
        "activeSince": "Active since 2017",
        "country": "United Kingdom",
        "room": "King Guestroom",
        "stay": "4 nights · March 2025",
        "guestType": "Couple",
        "reviewed": "March 7, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Music played outside room all night until we complained and then it was turned off",
        "negative": "",
        "body": "Music played outside room all night until we complained and then it was turned off"
      },
      {
        "reviewer": "Jessica",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "River View Corner One Bedroom Suite",
        "stay": "2 nights · February 2025",
        "guestType": "Couple",
        "reviewed": "February 11, 2025",
        "title": "Definitely stay there again.Spacious rooms, nice people",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location, staff, accommodations",
        "negative": "The carpeting in the elevators",
        "body": "Location, staff, accommodations\nThe carpeting in the elevators"
      },
      {
        "reviewer": "Tracy",
        "activeSince": "Active since 2013",
        "country": "United Kingdom",
        "room": "King Guestroom",
        "stay": "1 night · January 2025",
        "guestType": "Solo traveler",
        "reviewed": "January 27, 2025",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Best hotel gym I’ve ever seen and such friendly welcoming staff",
        "negative": "",
        "body": "Best hotel gym I’ve ever seen and such friendly welcoming staff"
      },
      {
        "reviewer": "Callaghan",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "1 night · December 2024",
        "guestType": "Group",
        "reviewed": "January 18, 2025",
        "title": "Very good",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location",
        "negative": "Parking",
        "body": "Location\nParking"
      },
      {
        "reviewer": "Elena",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "2 nights · January 2025",
        "guestType": "Family",
        "reviewed": "January 4, 2025",
        "title": "Amazing historic hotel. Everything was perfect",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Clean, welcoming, great rooms and bathrooms. Location close to museums. Very nice restaurant in the hotel. Great place to stay",
        "negative": "I liked everything",
        "body": "Clean, welcoming, great rooms and bathrooms. Location close to museums. Very nice restaurant in the hotel. Great place to stay\nI liked everything"
      },
      {
        "reviewer": "Jani",
        "activeSince": "Active since 2017",
        "country": "Finland",
        "room": "King Guestroom",
        "stay": "4 nights · January 2025",
        "guestType": "Couple",
        "reviewed": "January 3, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Location, staff",
        "negative": "",
        "body": "Location, staff"
      },
      {
        "reviewer": "Charlie",
        "activeSince": "Active since 2016",
        "country": "Ireland",
        "room": "King Guestroom",
        "stay": "5 nights · December 2024",
        "guestType": "Couple",
        "reviewed": "January 3, 2025",
        "title": "Pleasant but surprise extra charges upon check in leave sour taste",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The location was great for accessing everything nearby in the loop\nUpon thought post check out the “incidental” charge of $125 a night was quite a surprise and not made very clear when booking. This should be highlighted more in the booking and not in the fine print. When staying for 6 nights it is no small money.",
        "negative": "Also the elevators are a bit fussy and unreliable",
        "body": "The location was great for accessing everything nearby in the loop\nUpon thought post check out the “incidental” charge of $125 a night was quite a surprise and not made very clear when booking. This should be highlighted more in the booking and not in the fine print. When staying for 6 nights it is no small money.\nAlso the elevators are a bit fussy and unreliable"
      },
      {
        "reviewer": "Rachel",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "City King",
        "stay": "4 nights · December 2024",
        "guestType": "Couple",
        "reviewed": "December 7, 2024",
        "title": "Excellent 10th anniversary trip!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Excellent location, very nice accommodations and friendly staff.",
        "negative": "The bar staff were a bit cold.",
        "body": "Excellent location, very nice accommodations and friendly staff.\nThe bar staff were a bit cold."
      },
      {
        "reviewer": "Susan",
        "activeSince": "Active since 2011",
        "country": "Canada",
        "room": "King Guestroom",
        "stay": "3 nights · November 2024",
        "guestType": "Family",
        "reviewed": "December 7, 2024",
        "title": "Weekend in Chicago",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location on Michigan ave. Amazing old building. Busy spot for 5-7 after work drinks. Nice sitting area downstairs.\nTea and coffee and apples available in the morning. Never used terrace upstairs.",
        "negative": "Parking expensive if you have a car. Requested room with a view...but it wasn't really a view...waste of $",
        "body": "Great location on Michigan ave. Amazing old building. Busy spot for 5-7 after work drinks. Nice sitting area downstairs.\nTea and coffee and apples available in the morning. Never used terrace upstairs.\nParking expensive if you have a car. Requested room with a view...but it wasn't really a view...waste of $"
      },
      {
        "reviewer": "Paola",
        "activeSince": "Active since 2016",
        "country": "Austria",
        "room": "King Guestroom",
        "stay": "5 nights · December 2024",
        "guestType": "Couple",
        "reviewed": "December 6, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Wonderful building, great location",
        "negative": "No attention to sustainability, towels are changed daily even when barely used",
        "body": "Wonderful building, great location\nNo attention to sustainability, towels are changed daily even when barely used"
      },
      {
        "reviewer": "Leonid",
        "activeSince": "",
        "country": "Israel",
        "room": "King Guestroom",
        "stay": "6 nights · December 2024",
        "guestType": "Solo traveler",
        "reviewed": "December 5, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great hotel",
        "negative": "",
        "body": "Great hotel"
      },
      {
        "reviewer": "Cacey",
        "activeSince": "",
        "country": "United States",
        "room": "City King",
        "stay": "1 night · November 2024",
        "guestType": "Couple",
        "reviewed": "November 14, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Staff was the best!! The VALET ROCKS!!!!",
        "negative": "",
        "body": "Staff was the best!! The VALET ROCKS!!!!"
      },
      {
        "reviewer": "Sanford",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Queen Queen Guestroom",
        "stay": "2 nights · November 2024",
        "guestType": "Couple",
        "reviewed": "November 10, 2024",
        "title": "The place I love the stay when in Chicago.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great property in a great location.",
        "negative": "Nothing",
        "body": "Great property in a great location.\nNothing"
      },
      {
        "reviewer": "Todd",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Corner Studio",
        "stay": "3 nights · November 2024",
        "guestType": "Family",
        "reviewed": "November 7, 2024",
        "title": "Fantastic, have already posted pics and comments on social media of how great our stay was highly recommend and will be",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The location And the cleanliness of the entire hotel was in impeccable",
        "negative": "Cannot think of a thing",
        "body": "The location And the cleanliness of the entire hotel was in impeccable\nCannot think of a thing"
      },
      {
        "reviewer": "James",
        "activeSince": "Active since 2020",
        "country": "United Kingdom",
        "room": "Queen Queen Guestroom",
        "stay": "3 nights · October 2024",
        "guestType": "Group",
        "reviewed": "October 26, 2024",
        "title": "We love the Pendry- we stay in the Pendry every time we visit.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great vibe",
        "negative": "Everything was excellent",
        "body": "Great vibe\nEverything was excellent"
      },
      {
        "reviewer": "Francine",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Corner King",
        "stay": "4 nights · October 2024",
        "guestType": "Couple",
        "reviewed": "October 21, 2024",
        "title": "The Pendry provides an exceptional, memorable experience!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The Pendry is a beautiful hotel in an historic building providing exceptional guest experiences.\nIt’s beautiful with views of amazing views of Chicago. Muriel, at the front desk, made our stay wonderful … upgrading our room and sending champagne to our room (We told her we were celebrating my husband’s birthday.)",
        "negative": "The bar is cozy and the bartender remembered our favorite evening beverage.",
        "body": "The Pendry is a beautiful hotel in an historic building providing exceptional guest experiences.\nIt’s beautiful with views of amazing views of Chicago. Muriel, at the front desk, made our stay wonderful … upgrading our room and sending champagne to our room (We told her we were celebrating my husband’s birthday.)\nThe bar is cozy and the bartender remembered our favorite evening beverage."
      },
      {
        "reviewer": "Simon",
        "activeSince": "Active since 2017",
        "country": "United Kingdom",
        "room": "King Guestroom",
        "stay": "3 nights · October 2024",
        "guestType": "Group",
        "reviewed": "October 7, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything about the hotel was perfect, we got an upgrade, rooms were superb, gym was refurbished and excellent. Bar/Lounge area had a great vibe and the staff couldn't be more helpful. Superb location for seeing the sights.",
        "negative": "Nothing.",
        "body": "Everything about the hotel was perfect, we got an upgrade, rooms were superb, gym was refurbished and excellent. Bar/Lounge area had a great vibe and the staff couldn't be more helpful. Superb location for seeing the sights.\nNothing."
      },
      {
        "reviewer": "Karie",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "3 nights · October 2024",
        "guestType": "Couple",
        "reviewed": "October 2, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Service was amazing.",
        "negative": "",
        "body": "Service was amazing."
      },
      {
        "reviewer": "Vida",
        "activeSince": "Active since 2012",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "3 nights · September 2024",
        "guestType": "Couple",
        "reviewed": "September 30, 2024",
        "title": "Wonderful and Loved❤️❤️😘",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The Location was perfect for Us!",
        "negative": "",
        "body": "The Location was perfect for Us!"
      },
      {
        "reviewer": "Marc",
        "activeSince": "Active since 2014",
        "country": "France",
        "room": "King Guestroom",
        "stay": "5 nights · September 2024",
        "guestType": "Solo traveler",
        "reviewed": "September 30, 2024",
        "title": "Very nice stay",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location is great in the middle of Chicago downtown. Very easy to move with train stations everywhere",
        "negative": "The refrigerator was Niort working and the cooling system was a little but noisy",
        "body": "Location is great in the middle of Chicago downtown. Very easy to move with train stations everywhere\nThe refrigerator was Niort working and the cooling system was a little but noisy"
      },
      {
        "reviewer": "Jennifer",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Accessible 2 Queen Guestroom",
        "stay": "3 nights · September 2024",
        "guestType": "Couple",
        "reviewed": "September 29, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location",
        "negative": "",
        "body": "Location"
      },
      {
        "reviewer": "Black",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "City King",
        "stay": "3 nights · September 2024",
        "guestType": "Couple",
        "reviewed": "September 29, 2024",
        "title": "Wonderful experience at the Pendry",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Customer service",
        "negative": "",
        "body": "Customer service"
      },
      {
        "reviewer": "Jorge",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "1 night · September 2024",
        "guestType": "Solo traveler",
        "reviewed": "September 26, 2024",
        "title": "The Pendry is awesome",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location. Muriel at the front desk was great.",
        "negative": "",
        "body": "Great location. Muriel at the front desk was great."
      },
      {
        "reviewer": "Darlyn",
        "activeSince": "",
        "country": "United States",
        "room": "Accessible King Guest Room",
        "stay": "1 night · September 2024",
        "guestType": "Group",
        "reviewed": "September 23, 2024",
        "title": "celebrated my bachelorette here and it was great",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "fabulous location!",
        "negative": "",
        "body": "fabulous location!"
      },
      {
        "reviewer": "Andrew",
        "activeSince": "Active since 2014",
        "country": "United Kingdom",
        "room": "Tower King",
        "stay": "3 nights · September 2024",
        "guestType": "Couple",
        "reviewed": "September 20, 2024",
        "title": "Relaxing and luxurious",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Beautiful building, very distinctive. Rooms were spotless.",
        "negative": "Style, character. Probably the prettiest building in Chicago.",
        "body": "Beautiful building, very distinctive. Rooms were spotless.\nStyle, character. Probably the prettiest building in Chicago."
      },
      {
        "reviewer": "David",
        "activeSince": "",
        "country": "United Kingdom",
        "room": "Corner King",
        "stay": "2 nights · September 2024",
        "guestType": "Group",
        "reviewed": "September 18, 2024",
        "title": "Beautiful hotel",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The hotel is in a great location and the rooms were exceptionally comfortable.",
        "negative": "Nothing from my perspective.",
        "body": "The hotel is in a great location and the rooms were exceptionally comfortable.\nNothing from my perspective."
      },
      {
        "reviewer": "Jeffery",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "City King",
        "stay": "4 nights · September 2024",
        "guestType": "Couple",
        "reviewed": "September 13, 2024",
        "title": "Very comfortable without being too stuffy and convenient in a very good part of the city. We will return",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Convenient location",
        "negative": "N/A",
        "body": "Convenient location\nN/A"
      },
      {
        "reviewer": "Lisa",
        "activeSince": "Active since 2018",
        "country": "Canada",
        "room": "City King",
        "stay": "3 nights · September 2024",
        "guestType": "Couple",
        "reviewed": "September 10, 2024",
        "title": "We loved our 3 nights stay at Pendry, ideal base for a couple's getaway to Chicago.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Very central location, beautiful hotel and spacious and clean room. The bed was very confortable. The fitness center was great and well equipped. Most of the staff we interacted with were friendly and helpful.",
        "negative": "Unfortunately we didn't get to try the rooftop terrasse that was closed for a private event.",
        "body": "Very central location, beautiful hotel and spacious and clean room. The bed was very confortable. The fitness center was great and well equipped. Most of the staff we interacted with were friendly and helpful.\nUnfortunately we didn't get to try the rooftop terrasse that was closed for a private event."
      },
      {
        "reviewer": "Jasmin",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Tower King",
        "stay": "3 nights · September 2024",
        "guestType": "Couple",
        "reviewed": "September 7, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Everything… the hotel is beautiful and the staff is exceptional",
        "negative": "",
        "body": "Everything… the hotel is beautiful and the staff is exceptional"
      },
      {
        "reviewer": "Upton",
        "activeSince": "Active since 2021",
        "country": "New Zealand",
        "room": "King Guestroom",
        "stay": "1 night · September 2024",
        "guestType": "Couple",
        "reviewed": "September 6, 2024",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Good location and big room. Friendly staff",
        "negative": "Had to argue over food / drink inclusions. Think it was more booking.coms error than from hotel. Rooftop bar was closed",
        "body": "Good location and big room. Friendly staff\nHad to argue over food / drink inclusions. Think it was more booking.coms error than from hotel. Rooftop bar was closed"
      },
      {
        "reviewer": "Della",
        "activeSince": "",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "4 nights · September 2024",
        "guestType": "Family",
        "reviewed": "September 6, 2024",
        "title": "Loved it!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Love the rooftop bar and the lobby bar. Loved that we were in a beautiful historic building - in fact the boat tour guide pointed out the ‘Champagne Building’ on our tour! Loved our spacious room and decor. Staff was very friendly!",
        "negative": "Our view was non existent - but understandable bc we were put on a lower floor. We did manage to get the same floor as our family - we were told the rooms were connected but they turned out to be quite far from each other..",
        "body": "Love the rooftop bar and the lobby bar. Loved that we were in a beautiful historic building - in fact the boat tour guide pointed out the ‘Champagne Building’ on our tour! Loved our spacious room and decor. Staff was very friendly!\nOur view was non existent - but understandable bc we were put on a lower floor. We did manage to get the same floor as our family - we were told the rooms were connected but they turned out to be quite far from each other.."
      },
      {
        "reviewer": "Colum",
        "activeSince": "Active since 2016",
        "country": "United Kingdom",
        "room": "King Guestroom",
        "stay": "4 nights · August 2024",
        "guestType": "Couple",
        "reviewed": "September 5, 2024",
        "title": "Nice hotel. Beautiful reception and bar areas. Extremely slow service in the bar.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The public areas on the ground floor were gorgeous.",
        "negative": "Very little attention or money had been spent on the other floors above ground level. The decor of the rooms has definitely been upsold in the photos, in reality they are rather drab.",
        "body": "The public areas on the ground floor were gorgeous.\nVery little attention or money had been spent on the other floors above ground level. The decor of the rooms has definitely been upsold in the photos, in reality they are rather drab."
      },
      {
        "reviewer": "Tatiana",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Queen Queen Guestroom",
        "stay": "2 nights · August 2024",
        "guestType": "Group",
        "reviewed": "September 5, 2024",
        "title": "Excellent location, near all the major attractions. Super clean and excellent amenities.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location, amenities, cleanliness.",
        "negative": "Long wait to check in.",
        "body": "Location, amenities, cleanliness.\nLong wait to check in."
      },
      {
        "reviewer": "Mark",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "4 nights · September 2024",
        "guestType": "Couple",
        "reviewed": "September 3, 2024",
        "title": "We will always stay at the Pendry Chicago.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location, the feel and vibe of atmosphere and deco, loved the building architecture and the location was within walking distance of Orange line and all most attractions.",
        "negative": "Coffee bar could be left out longer. Housekeeping could reset clock alarms in rooms for next guests.",
        "body": "Location, the feel and vibe of atmosphere and deco, loved the building architecture and the location was within walking distance of Orange line and all most attractions.\nCoffee bar could be left out longer. Housekeeping could reset clock alarms in rooms for next guests."
      },
      {
        "reviewer": "Raimey",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "3 nights · August 2024",
        "guestType": "Couple",
        "reviewed": "September 1, 2024",
        "title": "Exceptional hotel",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Wonderful housekeeping services, very friendly front desk, beautiful hotel, great location.",
        "negative": "",
        "body": "Wonderful housekeeping services, very friendly front desk, beautiful hotel, great location."
      },
      {
        "reviewer": "Melissa",
        "activeSince": "Active since 2015",
        "country": "Australia",
        "room": "Queen Queen Guestroom",
        "stay": "3 nights · August 2024",
        "guestType": "Group",
        "reviewed": "August 29, 2024",
        "title": "5 star joy 🥂",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Fantastic hotel with great service and vibe.",
        "negative": "Nothing to not like about The Pendry it’s fab!",
        "body": "Fantastic hotel with great service and vibe.\nNothing to not like about The Pendry it’s fab!"
      },
      {
        "reviewer": "Kathleen",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Queen Queen Guestroom",
        "stay": "3 nights · August 2024",
        "guestType": "Group",
        "reviewed": "August 17, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "needs elevators that work quicker",
        "negative": "",
        "body": "needs elevators that work quicker"
      },
      {
        "reviewer": "Brian",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Accessible King Guest Room",
        "stay": "3 nights · August 2024",
        "guestType": "Couple",
        "reviewed": "August 17, 2024",
        "title": "I want to live here",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Room service was on point both times. Bar Pendry is a cool spot with well made cocktails. Muriel at the front desk is a gem. She’s a wonderful representative for the hotel. Dlapo the bellman was so personable and efficient.",
        "negative": "Would have liked slippers at turn down.",
        "body": "Room service was on point both times. Bar Pendry is a cool spot with well made cocktails. Muriel at the front desk is a gem. She’s a wonderful representative for the hotel. Dlapo the bellman was so personable and efficient.\nWould have liked slippers at turn down."
      },
      {
        "reviewer": "Megan",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Queen Queen Guestroom",
        "stay": "1 night · July 2024",
        "guestType": "Group",
        "reviewed": "August 7, 2024",
        "title": "A lovely dreamy getaway with turndown service.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Clean. Quiet. Nobody in the halls. Bar was amazing.",
        "negative": "",
        "body": "Clean. Quiet. Nobody in the halls. Bar was amazing."
      },
      {
        "reviewer": "Randi",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Corner Studio",
        "stay": "4 nights · July 2024",
        "guestType": "Family",
        "reviewed": "August 4, 2024",
        "title": "It was great! Will stay again",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Spacious rooms with great beds & functional bathrooms. Nice bar with good cocktails, vibe & service",
        "negative": "",
        "body": "Spacious rooms with great beds & functional bathrooms. Nice bar with good cocktails, vibe & service"
      },
      {
        "reviewer": "Lucy",
        "activeSince": "Active since 2024",
        "country": "United Kingdom",
        "room": "Queen Queen Guestroom",
        "stay": "4 nights · July 2024",
        "guestType": "Group",
        "reviewed": "July 30, 2024",
        "title": "Great for long weekend first visit to Chicago",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location very central, very comfortable beds and very clean room",
        "negative": "Smelly bathroom - something wrong with the plumbing",
        "body": "Location very central, very comfortable beds and very clean room\nSmelly bathroom - something wrong with the plumbing"
      },
      {
        "reviewer": "Chris",
        "activeSince": "Active since 2011",
        "country": "United Kingdom",
        "room": "Corner King",
        "stay": "3 nights · July 2024",
        "guestType": "Couple",
        "reviewed": "July 28, 2024",
        "title": "Great location in iconic",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great location. Stayed here on my wife’s birthday trip. It’s a terrific boutique style hotel. Staff were very friendly, food was excellent, rooms very comfortable and a fantastic roof top bar.\nDownside was the a/c unit is quite noisy in room and we weren’t told we had to reserve the outside roof top bar. Nothing that was a major issue though. We would certainly consider using the hotel again.\nAir conditions unit noise\nNot being advised at checkin that we had to book the roof top terrace - for anytime !",
        "negative": "Booking.com not being clear that the ‘breakfast included’ part only extended to an allowance!",
        "body": "Great location. Stayed here on my wife’s birthday trip. It’s a terrific boutique style hotel. Staff were very friendly, food was excellent, rooms very comfortable and a fantastic roof top bar.\nDownside was the a/c unit is quite noisy in room and we weren’t told we had to reserve the outside roof top bar. Nothing that was a major issue though. We would certainly consider using the hotel again.\nAir conditions unit noise\nNot being advised at checkin that we had to book the roof top terrace - for anytime !\nBooking.com not being clear that the ‘breakfast included’ part only extended to an allowance!"
      },
      {
        "reviewer": "Elizabeth",
        "activeSince": "",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "3 nights · July 2024",
        "guestType": "Couple",
        "reviewed": "July 26, 2024",
        "title": "Very nice hotel in perfect location",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Quiet & great location, staff very pleasant",
        "negative": "Food/bar very expensive",
        "body": "Quiet & great location, staff very pleasant\nFood/bar very expensive"
      },
      {
        "reviewer": "Samantha",
        "activeSince": "Active since 2023",
        "country": "Australia",
        "room": "King Guestroom",
        "stay": "3 nights · July 2024",
        "guestType": "Couple",
        "reviewed": "July 20, 2024",
        "title": "Had a brilliant stay. Couldn’t fault it. It was luxe and very comfortable. Absolute bummer to have to leave!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Incredible location, rooms, facilities. Staff were lovely too and accommodating of requests.",
        "negative": "Nothing, other than the added taxes on checkout which I understand is common in America.",
        "body": "Incredible location, rooms, facilities. Staff were lovely too and accommodating of requests.\nNothing, other than the added taxes on checkout which I understand is common in America."
      },
      {
        "reviewer": "Julius",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "5 nights · July 2024",
        "guestType": "Family",
        "reviewed": "July 19, 2024",
        "title": "Enjoyed the location and amenities of the hotel. I would stay there again.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location, amenities, gym, lobby, service",
        "negative": "Elevators were slow",
        "body": "Location, amenities, gym, lobby, service\nElevators were slow"
      },
      {
        "reviewer": "Kathy",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "1 night · July 2024",
        "guestType": "Couple",
        "reviewed": "July 9, 2024",
        "title": "Art deco building with glamour in a great location for walking or taking the train to Chicago.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "When I first saw the Pendry two summers ago after walking through the first floor, I knew I wanted to stay there. A bonus is the location--only blocks from the South Shore Train Station's last stop at Millennium Park. We were able to walk everywhere we wanted to--including Chicago's River Walk, Museum of Contemporary Art, Art Institute, Chicago Cultural Center. The Art Deco architecture and interior decor exudes glamour and class, and we felt important staying in this hotel. The bedding and pillows were top-notch. The bathroom had a magnifying makeup mirror, always a plus. Instead of a coffee-maker, the room had an espresso machine. We enjoyed the brunch at Venteux, as well as the welcome cocktail! The best part was being able to check in and get into our room before noon and to stay until check-out. This made our stay in Chicago even better.\nThe chains on the window shades were stiff and should be oiled. A little WD-40 works wonders.",
        "negative": "It would have been nice to be able to go to the rooftop before evening hours. The rooftop was reserved for a private event on the day we checked in, so we never were able to get up there.",
        "body": "When I first saw the Pendry two summers ago after walking through the first floor, I knew I wanted to stay there. A bonus is the location--only blocks from the South Shore Train Station's last stop at Millennium Park. We were able to walk everywhere we wanted to--including Chicago's River Walk, Museum of Contemporary Art, Art Institute, Chicago Cultural Center. The Art Deco architecture and interior decor exudes glamour and class, and we felt important staying in this hotel. The bedding and pillows were top-notch. The bathroom had a magnifying makeup mirror, always a plus. Instead of a coffee-maker, the room had an espresso machine. We enjoyed the brunch at Venteux, as well as the welcome cocktail! The best part was being able to check in and get into our room before noon and to stay until check-out. This made our stay in Chicago even better.\nThe chains on the window shades were stiff and should be oiled. A little WD-40 works wonders.\nIt would have been nice to be able to go to the rooftop before evening hours. The rooftop was reserved for a private event on the day we checked in, so we never were able to get up there."
      },
      {
        "reviewer": "Syrpina",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "3 nights · July 2024",
        "guestType": "Couple",
        "reviewed": "July 7, 2024",
        "title": "I recommend",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Wonderful place! Very comfortable and clean. The location is great! Stuff was very friendly. Our vacation in Chicago was amazing with this hotel!",
        "negative": "Sometimes we waited a long time for the elevator to take us up to the room.",
        "body": "Wonderful place! Very comfortable and clean. The location is great! Stuff was very friendly. Our vacation in Chicago was amazing with this hotel!\nSometimes we waited a long time for the elevator to take us up to the room."
      },
      {
        "reviewer": "Marita",
        "activeSince": "Active since 2018",
        "country": "Canada",
        "room": "King Guestroom",
        "stay": "5 nights · June 2024",
        "guestType": "Couple",
        "reviewed": "June 25, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Front desk staff were excellent on all accounts, including door, car service, bellhop, and bar staff. Was pleasantly surprised at the value for our breakfast at the Venteux, the fried mini potatoes were amazing. Loved the walkability to everything we wanted to see, including a concert at Soldier Stadium and Cubs game at Wrigley Field. I looked into buying a pillow (from the online store) because it was so good, but it doesn't appear that they ship to Canada.",
        "negative": "The heat!! But I guess as a hotel you don't have much control over that. We were a little disappointed that our room was only on the 4th floor and didn't have much of a view, but we made up for it by just getting out to see more.",
        "body": "Front desk staff were excellent on all accounts, including door, car service, bellhop, and bar staff. Was pleasantly surprised at the value for our breakfast at the Venteux, the fried mini potatoes were amazing. Loved the walkability to everything we wanted to see, including a concert at Soldier Stadium and Cubs game at Wrigley Field. I looked into buying a pillow (from the online store) because it was so good, but it doesn't appear that they ship to Canada.\nThe heat!! But I guess as a hotel you don't have much control over that. We were a little disappointed that our room was only on the 4th floor and didn't have much of a view, but we made up for it by just getting out to see more."
      },
      {
        "reviewer": "Joshua",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Accessible 2 Queen Guestroom",
        "stay": "3 nights · June 2024",
        "guestType": "Family",
        "reviewed": "June 22, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Historic building, great rooms, friendly staff",
        "negative": "Slow elevators, weird/slow streaming on TV",
        "body": "Historic building, great rooms, friendly staff\nSlow elevators, weird/slow streaming on TV"
      },
      {
        "reviewer": "Kathryn",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "1 night · May 2024",
        "guestType": "Couple",
        "reviewed": "June 18, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Location",
        "negative": "",
        "body": "Location"
      },
      {
        "reviewer": "Cherie",
        "activeSince": "Active since 2017",
        "country": "New Zealand",
        "room": "King Guestroom",
        "stay": "3 nights · May 2024",
        "guestType": "Couple",
        "reviewed": "June 15, 2024",
        "title": "Great central location!",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location, friendly and attentive staff. Great breakfast choice and super comfortable bed.",
        "negative": "",
        "body": "Great location, friendly and attentive staff. Great breakfast choice and super comfortable bed."
      },
      {
        "reviewer": "James",
        "activeSince": "Active since 2013",
        "country": "United Kingdom",
        "room": "King Guestroom",
        "stay": "4 nights · May 2024",
        "guestType": "Solo traveler",
        "reviewed": "June 6, 2024",
        "title": "Beautiful Hotel",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Beautiful Hotel. Would stay again if visiting Chicago. Ideal location.",
        "negative": "Multiple messages about housekeeping etc that were more of an annoyance. Housekeeping missed a day despite being out of the room with 4 hours to spare, so disappointed about that. I was sent a message late on in the day, but to expect a guest to see and reply to it and not check the room for a second time over a period of hours is lacking for such an establishment.",
        "body": "Beautiful Hotel. Would stay again if visiting Chicago. Ideal location.\nMultiple messages about housekeeping etc that were more of an annoyance. Housekeeping missed a day despite being out of the room with 4 hours to spare, so disappointed about that. I was sent a message late on in the day, but to expect a guest to see and reply to it and not check the room for a second time over a period of hours is lacking for such an establishment."
      },
      {
        "reviewer": "Harriet",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Queen Queen Guestroom",
        "stay": "2 nights · May 2024",
        "guestType": "Group",
        "reviewed": "June 1, 2024",
        "title": "Beautiful days in Chicago",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "This property is beautiful. Located in the heart of Chicago, very near everything I had planned including a walk through Millenium Park, Grant Park and up the coast to the Navy Pier. We also took the Red Line to a White Sox game, had dinner in the hotel. I joked that the pillows were \"like butter\"...you'd have to be a Billy Crystal fan to get that one. But really, everything was just top TOP notch.",
        "negative": "It is pricey.",
        "body": "This property is beautiful. Located in the heart of Chicago, very near everything I had planned including a walk through Millenium Park, Grant Park and up the coast to the Navy Pier. We also took the Red Line to a White Sox game, had dinner in the hotel. I joked that the pillows were \"like butter\"...you'd have to be a Billy Crystal fan to get that one. But really, everything was just top TOP notch.\nIt is pricey."
      },
      {
        "reviewer": "Julie",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Tower King",
        "stay": "5 nights · May 2024",
        "guestType": "Couple",
        "reviewed": "May 29, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The Pendry was probably the most comfortable hotel I've ever stayed at. We certainly did not want to leave after our five days there. Our room was beautiful and very clean",
        "negative": "The wifi was pretty slow. The elevators in the lobby go to different parts of the hotel and as we were with many family members all over, it was extremely difficult to get to each other's rooms, as our keys did not work in all elevators. We were on the 30th floor in the Tower and the windows are double paned, but it was still noisy with sirens or loud music below. We didn't hear ordinary traffic from that height. We didn't mind, but others might be awoken by the noise.",
        "body": "The Pendry was probably the most comfortable hotel I've ever stayed at. We certainly did not want to leave after our five days there. Our room was beautiful and very clean\nThe wifi was pretty slow. The elevators in the lobby go to different parts of the hotel and as we were with many family members all over, it was extremely difficult to get to each other's rooms, as our keys did not work in all elevators. We were on the 30th floor in the Tower and the windows are double paned, but it was still noisy with sirens or loud music below. We didn't hear ordinary traffic from that height. We didn't mind, but others might be awoken by the noise."
      },
      {
        "reviewer": "Gail",
        "activeSince": "Active since 2015",
        "country": "Canada",
        "room": "City King",
        "stay": "5 nights · May 2024",
        "guestType": "Couple",
        "reviewed": "May 24, 2024",
        "title": "Good for us",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The location was fantastic. We paid for an upgrade and got a corner room on the 31st floor, overlooking the waterway. The staff were so accommodating and helpful. We were minutes from the Riverwalk, River North, and Streeterville areas where there were lots of shops and restaurants. It was easy to take transportation anywhere. Nice welcome drink! Thanks to Muriel for making us feel welcome!",
        "negative": "The sirens, from emergency vehicles, were frequent throughout both the day and night. We particularly did not appreciate hearing various cars ripping through the streets during the night. It warranted wearing ear plugs to get a \"quieter\" sleep. Aside, we would have liked to enjoy the rooftop area, but it was closed due to construction reopening in Summer 2024.",
        "body": "The location was fantastic. We paid for an upgrade and got a corner room on the 31st floor, overlooking the waterway. The staff were so accommodating and helpful. We were minutes from the Riverwalk, River North, and Streeterville areas where there were lots of shops and restaurants. It was easy to take transportation anywhere. Nice welcome drink! Thanks to Muriel for making us feel welcome!\nThe sirens, from emergency vehicles, were frequent throughout both the day and night. We particularly did not appreciate hearing various cars ripping through the streets during the night. It warranted wearing ear plugs to get a \"quieter\" sleep. Aside, we would have liked to enjoy the rooftop area, but it was closed due to construction reopening in Summer 2024."
      },
      {
        "reviewer": "Weam",
        "activeSince": "Active since 2010",
        "country": "Saudi Arabia",
        "room": "Queen Queen Guestroom",
        "stay": "5 nights · May 2024",
        "guestType": "Family",
        "reviewed": "May 21, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything. I've never enjoyed a hotel stay as much as I did at Pendry. The location, the so attentive and kind staff, the interiors, the luxury feel, their complementary refresher by the front desk.",
        "negative": "The room was a little tight, but very comfortable.",
        "body": "Everything. I've never enjoyed a hotel stay as much as I did at Pendry. The location, the so attentive and kind staff, the interiors, the luxury feel, their complementary refresher by the front desk.\nThe room was a little tight, but very comfortable."
      },
      {
        "reviewer": "Silvi",
        "activeSince": "Active since 2013",
        "country": "Canada",
        "room": "Tower King",
        "stay": "3 nights · April 2024",
        "guestType": "Couple",
        "reviewed": "May 18, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Aside from the fact that the room and bed were extremely comfortable, the assistance from the concierge team was A+. It began well before our arrival to help us plan our stay..",
        "negative": "",
        "body": "Aside from the fact that the room and bed were extremely comfortable, the assistance from the concierge team was A+. It began well before our arrival to help us plan our stay.."
      },
      {
        "reviewer": "Ruedi",
        "activeSince": "Active since 2020",
        "country": "Switzerland",
        "room": "King Guestroom",
        "stay": "3 nights · April 2024",
        "guestType": "Couple",
        "reviewed": "May 13, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Location downtown, close to restaurants an attractions.",
        "negative": "No buffet option for breakfast, limited options and small breakfast room.",
        "body": "Location downtown, close to restaurants an attractions.\nNo buffet option for breakfast, limited options and small breakfast room."
      },
      {
        "reviewer": "Iliana",
        "activeSince": "Active since 2021",
        "country": "Mexico",
        "room": "Corner Studio- Disability Access",
        "stay": "6 nights · May 2024",
        "guestType": "Family",
        "reviewed": "May 9, 2024",
        "title": "Beautiful historical building",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "We loved the location, friendliness of staff, the cocktails at the bar were 👍 great",
        "negative": "The waiting times for elevators and the misunderstanding and charges for extra night",
        "body": "We loved the location, friendliness of staff, the cocktails at the bar were 👍 great\nThe waiting times for elevators and the misunderstanding and charges for extra night"
      },
      {
        "reviewer": "Matthew",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Corner King",
        "stay": "5 nights · May 2024",
        "guestType": "Couple",
        "reviewed": "May 4, 2024",
        "title": "We had a great time and really enjoyed the staff during our stay.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The hotel was centrally located, very friendly staff and great amenities. Room was great as well.",
        "negative": "There wasn’t much I didn’t like about the property, with the exception of my room wasn’t cleaned one day and by the time we got back to our room housekeeping wasn’t available. We had left our room around 2:30 and I had texted that we were out of our room for the day and thought that was enough, but no one ever came and cleaned it. Other than that one day everything else was great.",
        "body": "The hotel was centrally located, very friendly staff and great amenities. Room was great as well.\nThere wasn’t much I didn’t like about the property, with the exception of my room wasn’t cleaned one day and by the time we got back to our room housekeeping wasn’t available. We had left our room around 2:30 and I had texted that we were out of our room for the day and thought that was enough, but no one ever came and cleaned it. Other than that one day everything else was great."
      },
      {
        "reviewer": "Donna",
        "activeSince": "Active since 2014",
        "country": "Australia",
        "room": "Queen Queen Guestroom",
        "stay": "3 nights · May 2024",
        "guestType": "Family",
        "reviewed": "May 3, 2024",
        "title": "Overall we loved it!",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The staff were amazing\nNothing was too much trouble. The concierge (didn't get his name but long dark dreadlocks) was so helpful & accommodating!\nThe barman remembered our order from 2 nights ago and when our luggage got taken up to our room, they offered additional robes, five suggestions of nearby chemists, grocery store & restaurants\nWe felt very at home!",
        "negative": "Nothing!",
        "body": "The staff were amazing\nNothing was too much trouble. The concierge (didn't get his name but long dark dreadlocks) was so helpful & accommodating!\nThe barman remembered our order from 2 nights ago and when our luggage got taken up to our room, they offered additional robes, five suggestions of nearby chemists, grocery store & restaurants\nWe felt very at home!\nNothing!"
      },
      {
        "reviewer": "Zabin",
        "activeSince": "Active since 2020",
        "country": "Canada",
        "room": "King Guestroom",
        "stay": "5 nights · April 2024",
        "guestType": "Group",
        "reviewed": "April 30, 2024",
        "title": "An exceptional location with large clean rooms and friendly staff.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Clean rooms. Good wifi. Felt very safe. Friendly staff.",
        "negative": "Gym was being renovated. Didn't want to go to a gym down the road, although it was offered.",
        "body": "Clean rooms. Good wifi. Felt very safe. Friendly staff.\nGym was being renovated. Didn't want to go to a gym down the road, although it was offered."
      },
      {
        "reviewer": "Vanderléia",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Corner King",
        "stay": "4 nights · April 2024",
        "guestType": "Couple",
        "reviewed": "April 25, 2024",
        "title": "Our stay at Pendry was perfect.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "We loved everything!",
        "negative": "N/A",
        "body": "We loved everything!\nN/A"
      },
      {
        "reviewer": "Luiz",
        "activeSince": "Active since 2013",
        "country": "Brazil",
        "room": "Queen Queen Guestroom",
        "stay": "4 nights · April 2024",
        "guestType": "Family",
        "reviewed": "April 22, 2024",
        "title": "Very good location, great staff.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Location was very good, close to everything. Staff was super friendly to my young daughters. Rooms are small but comfortable beds and good bathroom. The breakfast setup is not the best but staff worked hard to make up for it and food was good.",
        "negative": "",
        "body": "Location was very good, close to everything. Staff was super friendly to my young daughters. Rooms are small but comfortable beds and good bathroom. The breakfast setup is not the best but staff worked hard to make up for it and food was good."
      },
      {
        "reviewer": "Vyacheslav",
        "activeSince": "Active since 2015",
        "country": "United Arab Emirates",
        "room": "Corner Studio- Disability Access",
        "stay": "3 nights · April 2024",
        "guestType": "Couple",
        "reviewed": "April 21, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location. Very convenient to walk to all the sites and see the beautiful architecture of Chicago.\nImportant information\nA tax of 11.90 % is not included.\nResort fee of US$ 35 per night is not included.\nLocal administrative tax of 1% is not included.\nCity tax of 4.50 % is not included.",
        "negative": "But this is specific to the USA.",
        "body": "Great location. Very convenient to walk to all the sites and see the beautiful architecture of Chicago.\nImportant information\nA tax of 11.90 % is not included.\nResort fee of US$ 35 per night is not included.\nLocal administrative tax of 1% is not included.\nCity tax of 4.50 % is not included.\nBut this is specific to the USA."
      },
      {
        "reviewer": "Susana",
        "activeSince": "Active since 2011",
        "country": "Brazil",
        "room": "Queen Queen Guestroom",
        "stay": "4 nights · April 2024",
        "guestType": "Group",
        "reviewed": "April 20, 2024",
        "title": "Wonderful hotel. All impeccable services, I will definitely return",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Wonderful hotel. I go to Chicago every year. First time I stayed at the Pendry. Everything was wonderful, staff, location, everything impeccable.",
        "negative": "I liked everything. Nothing to complain",
        "body": "Wonderful hotel. I go to Chicago every year. First time I stayed at the Pendry. Everything was wonderful, staff, location, everything impeccable.\nI liked everything. Nothing to complain"
      },
      {
        "reviewer": "Sharon",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Queen Queen Guestroom",
        "stay": "4 nights · April 2024",
        "guestType": "Family",
        "reviewed": "April 19, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "I loved the building!!!!! Just beautiful, you should have afternoon champagne and strawberries for the guest in the champagne building. Work it! make it a big deal",
        "negative": "I didn't like that I was on the 23 floor and my kids were on the 4th.",
        "body": "I loved the building!!!!! Just beautiful, you should have afternoon champagne and strawberries for the guest in the champagne building. Work it! make it a big deal\nI didn't like that I was on the 23 floor and my kids were on the 4th."
      },
      {
        "reviewer": "Peter",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "6 nights · April 2024",
        "guestType": "Couple",
        "reviewed": "April 17, 2024",
        "title": "Convenient and satisfying.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Morning coffee service, attendant hailing taxi, personnel.",
        "negative": "",
        "body": "Morning coffee service, attendant hailing taxi, personnel."
      },
      {
        "reviewer": "Wojciech",
        "activeSince": "Active since 2013",
        "country": "Poland",
        "room": "King Guestroom",
        "stay": "3 nights · March 2024",
        "guestType": "Family",
        "reviewed": "April 16, 2024",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great location, nice hotel with history",
        "negative": "In the room in where I slept was noisy from the street despite the closed window:(",
        "body": "Great location, nice hotel with history\nIn the room in where I slept was noisy from the street despite the closed window:("
      },
      {
        "reviewer": "Philippe",
        "activeSince": "Active since 2013",
        "country": "Belgium",
        "room": "King Guestroom",
        "stay": "4 nights · April 2024",
        "guestType": "Solo traveler",
        "reviewed": "April 15, 2024",
        "title": "Expectations exceeded! Highly recommend it and would return on next visit.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Excelent location, historic building, excellent renovation maintaining authentic elements of the building, excelent quality and finish of rooms. Friendly staff. Beautiful bar and lobby.",
        "negative": "Breakfast a bit limited in choice but very good. Tables in restaurant were always very sticky…??",
        "body": "Excelent location, historic building, excellent renovation maintaining authentic elements of the building, excelent quality and finish of rooms. Friendly staff. Beautiful bar and lobby.\nBreakfast a bit limited in choice but very good. Tables in restaurant were always very sticky…??"
      },
      {
        "reviewer": "Lars",
        "activeSince": "Active since 2012",
        "country": "Uruguay",
        "room": "City King",
        "stay": "3 nights · April 2024",
        "guestType": "Solo traveler",
        "reviewed": "April 15, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The location and the building are great. The room has plenty of space. The breakfast was good although it wasn't a buffet.",
        "negative": "I didn't like that the breakfast area was crowded and I had to wait a long time to get a table for 1.",
        "body": "The location and the building are great. The room has plenty of space. The breakfast was good although it wasn't a buffet.\nI didn't like that the breakfast area was crowded and I had to wait a long time to get a table for 1."
      },
      {
        "reviewer": "Judy",
        "activeSince": "Active since 2014",
        "country": "United Kingdom",
        "room": "King Guestroom",
        "stay": "4 nights · April 2024",
        "guestType": "Family",
        "reviewed": "April 8, 2024",
        "title": "Fabulous, stylish hotel in a superb location. We loved it!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "We loved everything about The Pendry Hotel. Beautiful stylish hotel both inside and out. Great location, lovely rooms with huge comfortable beds. Very friendly helpful staff. We felt so relaxed and comfortable that we really didn’t want to leave after a four night stay.?",
        "negative": "it was perfect 👍",
        "body": "We loved everything about The Pendry Hotel. Beautiful stylish hotel both inside and out. Great location, lovely rooms with huge comfortable beds. Very friendly helpful staff. We felt so relaxed and comfortable that we really didn’t want to leave after a four night stay.?\nit was perfect 👍"
      },
      {
        "reviewer": "Margarida",
        "activeSince": "Active since 2019",
        "country": "United Kingdom",
        "room": "Accessible King Guest Room",
        "stay": "4 nights · March 2024",
        "guestType": "Solo traveler",
        "reviewed": "March 25, 2024",
        "title": "Beautiful architecture and great location",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great location and beautiful hotel bar.\nI was given a third floor room, whereas my friends that I travelled with, were given rooms in much higher floors, that were much better than mine - we paid the same rate.",
        "negative": "I think for such luxury hotels, there should be a more even experience provided.",
        "body": "Great location and beautiful hotel bar.\nI was given a third floor room, whereas my friends that I travelled with, were given rooms in much higher floors, that were much better than mine - we paid the same rate.\nI think for such luxury hotels, there should be a more even experience provided."
      },
      {
        "reviewer": "Kate",
        "activeSince": "Active since 2014",
        "country": "United Kingdom",
        "room": "Tower Studio",
        "stay": "2 nights · March 2024",
        "guestType": "Couple",
        "reviewed": "March 25, 2024",
        "title": "Fabulous hotel in great location.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Fantastic room (tower suite) with amazing view of the river. Room on 34th floor so nice and quiet. Super comfy bed and linens. Great housekeeping",
        "negative": "Breakfast service a bit confusing",
        "body": "Fantastic room (tower suite) with amazing view of the river. Room on 34th floor so nice and quiet. Super comfy bed and linens. Great housekeeping\nBreakfast service a bit confusing"
      },
      {
        "reviewer": "Anthony",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "City King",
        "stay": "3 nights · March 2024",
        "guestType": "Couple",
        "reviewed": "March 13, 2024",
        "title": "Overall excellent",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Dine in breakfast needs improvement",
        "negative": "Toast and greasy sausage",
        "body": "Dine in breakfast needs improvement\nToast and greasy sausage"
      },
      {
        "reviewer": "Wendy",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "1 night · February 2024",
        "guestType": "Family",
        "reviewed": "February 19, 2024",
        "title": "A wonderful night in Chicago.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Service was fantastic. Great decor and vibe",
        "negative": "",
        "body": "Service was fantastic. Great decor and vibe"
      },
      {
        "reviewer": "Oyassia",
        "activeSince": "Active since 2016",
        "country": "France",
        "room": "Queen Queen Guestroom",
        "stay": "5 nights · February 2024",
        "guestType": "Family",
        "reviewed": "February 18, 2024",
        "title": "Fantastic location, human and tailored-made service",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The location : perfect to visit by walk many fancy places",
        "negative": "The kindness of Murielle: she gave us a lot of recommandations, great places to visit and nice place for dinner",
        "body": "The location : perfect to visit by walk many fancy places\nThe kindness of Murielle: she gave us a lot of recommandations, great places to visit and nice place for dinner"
      },
      {
        "reviewer": "Robert",
        "activeSince": "",
        "country": "United States",
        "room": "Corner King",
        "stay": "1 night · January 2024",
        "guestType": "Couple",
        "reviewed": "February 16, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "My first interaction being with valet. Very courteous. Also the friendly concierge service was exceptional.",
        "negative": "",
        "body": "My first interaction being with valet. Very courteous. Also the friendly concierge service was exceptional."
      },
      {
        "reviewer": "Michal",
        "activeSince": "Active since 2013",
        "country": "Germany",
        "room": "Queen Queen Guestroom",
        "stay": "3 nights · February 2024",
        "guestType": "Group",
        "reviewed": "February 10, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Beautiful building, interior, bar...",
        "negative": "",
        "body": "Beautiful building, interior, bar..."
      },
      {
        "reviewer": "Talia",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "3 nights · January 2024",
        "guestType": "Couple",
        "reviewed": "January 31, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Amazing location, close to everything. Staff were friendly & responsive.",
        "negative": "",
        "body": "Amazing location, close to everything. Staff were friendly & responsive."
      },
      {
        "reviewer": "Alyssa",
        "activeSince": "",
        "country": "United States",
        "room": "Queen Queen Guestroom",
        "stay": "1 night · January 2024",
        "guestType": "Family",
        "reviewed": "January 10, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Updated rooms. VERY close to theaters and state street/Michigan Mile shopping.",
        "negative": "Rooms were a little tight but I would expect that with 2 queens in a city hotel.",
        "body": "Updated rooms. VERY close to theaters and state street/Michigan Mile shopping.\nRooms were a little tight but I would expect that with 2 queens in a city hotel."
      },
      {
        "reviewer": "Raul",
        "activeSince": "",
        "country": "Panama",
        "room": "Queen Queen Guestroom",
        "stay": "2 nights · January 2024",
        "guestType": "Family",
        "reviewed": "January 5, 2024",
        "title": "Great stay!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location and service were top. Best hotel I’ve stayed in Chicago, by far.",
        "negative": "Gym had been relocated due to renovation. It was fine, but not a gym at all 100%.",
        "body": "Location and service were top. Best hotel I’ve stayed in Chicago, by far.\nGym had been relocated due to renovation. It was fine, but not a gym at all 100%."
      },
      {
        "reviewer": "Adriana",
        "activeSince": "Active since 2022",
        "country": "Australia",
        "room": "Queen Queen Guestroom",
        "stay": "6 nights · January 2024",
        "guestType": "Family",
        "reviewed": "January 3, 2024",
        "title": "Staying at the Pendry made our holiday!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Excellent",
        "negative": "Nothing",
        "body": "Excellent\nNothing"
      },
      {
        "reviewer": "Brad",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "River View Corner One Bedroom Suite",
        "stay": "1 night · December 2023",
        "guestType": "Family",
        "reviewed": "January 1, 2024",
        "title": "Decadent, Festive, and fantastic river firework views - great way to spend New Year’s Eve",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Fantastic ambiance, super friendly / welcoming staff, and incredible views of the Chicago River. Room was spacious and clean.\nThe plush toy gifts for the kids upon check-in was a great touch and the whole atmosphere was very festive",
        "negative": "Not the best value / a bit pricey. The food on the in-room dining menu was relatively bland (although portions were sizable).",
        "body": "Fantastic ambiance, super friendly / welcoming staff, and incredible views of the Chicago River. Room was spacious and clean.\nThe plush toy gifts for the kids upon check-in was a great touch and the whole atmosphere was very festive\nNot the best value / a bit pricey. The food on the in-room dining menu was relatively bland (although portions were sizable)."
      },
      {
        "reviewer": "Fischer",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Accessible King Guest Room",
        "stay": "4 nights · December 2023",
        "guestType": "Couple",
        "reviewed": "December 29, 2023",
        "title": "Cozy and well located.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Rooms are specious and clean.",
        "negative": "The pillows are much too hard and high for the neck and the staff from the Venteux restaurant not up to standards.",
        "body": "Rooms are specious and clean.\nThe pillows are much too hard and high for the neck and the staff from the Venteux restaurant not up to standards."
      },
      {
        "reviewer": "Cristian",
        "activeSince": "Active since 2018",
        "country": "Mexico",
        "room": "King Guestroom",
        "stay": "5 nights · December 2023",
        "guestType": "Couple",
        "reviewed": "December 25, 2023",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Buena ubicación y muy buena atención",
        "negative": "Comodidad",
        "body": "Buena ubicación y muy buena atención\nComodidad"
      },
      {
        "reviewer": "Ellen",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "2 nights · December 2023",
        "guestType": "Couple",
        "reviewed": "December 15, 2023",
        "title": "GREAT",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Service great/clean /smells fantastic!",
        "negative": "",
        "body": "Service great/clean /smells fantastic!"
      },
      {
        "reviewer": "Samuel",
        "activeSince": "Active since 2016",
        "country": "Puerto Rico",
        "room": "Corner King",
        "stay": "5 nights · December 2023",
        "guestType": "Couple",
        "reviewed": "December 12, 2023",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Excellent in overall but since the first day my credit card was hacked",
        "negative": "",
        "body": "Excellent in overall but since the first day my credit card was hacked"
      },
      {
        "reviewer": "Elba",
        "activeSince": "Active since 2018",
        "country": "Brazil",
        "room": "Accessible King Guest Room",
        "stay": "5 nights · November 2023",
        "guestType": "Solo traveler",
        "reviewed": "December 6, 2023",
        "title": "Perfect!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything was absolutely perfect.",
        "negative": "Unfortunately, I cannot make reservations to dine at the rooftop because it was fully booked.",
        "body": "Everything was absolutely perfect.\nUnfortunately, I cannot make reservations to dine at the rooftop because it was fully booked."
      },
      {
        "reviewer": "Mary",
        "activeSince": "Active since 2013",
        "country": "Jersey",
        "room": "King Guestroom",
        "stay": "11 nights · December 2023",
        "guestType": "Couple",
        "reviewed": "December 5, 2023",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location excellent. Lovely clean hotel. Quiet.",
        "negative": "",
        "body": "Location excellent. Lovely clean hotel. Quiet."
      },
      {
        "reviewer": "Rajat",
        "activeSince": "Active since 2011",
        "country": "United States",
        "room": "Corner Studio",
        "stay": "3 nights · November 2023",
        "guestType": "Group",
        "reviewed": "December 3, 2023",
        "title": "Art deco masterpiece in heart of Chicago",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location at the foot of the Magnificent Mile. Amazing beautiful building. Up-scale property vibe with awesome scent, uber-friendly and helpful staff. Nice dining options - from lobby bar and rooftop cocktail lounge.",
        "negative": "Elevators took just a bit too long as only a few go to the main set of floors (others go to only top floors and rooftop lounge). Upgrade suite was not as large as expected and separate seating area was small-ish. No bathtub in bathroom.",
        "body": "Great location at the foot of the Magnificent Mile. Amazing beautiful building. Up-scale property vibe with awesome scent, uber-friendly and helpful staff. Nice dining options - from lobby bar and rooftop cocktail lounge.\nElevators took just a bit too long as only a few go to the main set of floors (others go to only top floors and rooftop lounge). Upgrade suite was not as large as expected and separate seating area was small-ish. No bathtub in bathroom."
      },
      {
        "reviewer": "Jonathan",
        "activeSince": "Active since 2016",
        "country": "United Kingdom",
        "room": "City King",
        "stay": "6 nights · November 2023",
        "guestType": "Couple",
        "reviewed": "November 30, 2023",
        "title": "Excellent",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Stunning building, location, staff\nLimited but very nice breakfast menu if not in room dining",
        "negative": "Limited but excellent bar menu",
        "body": "Stunning building, location, staff\nLimited but very nice breakfast menu if not in room dining\nLimited but excellent bar menu"
      },
      {
        "reviewer": "Michelina",
        "activeSince": "Active since 2012",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "7 nights · October 2023",
        "guestType": "Solo traveler",
        "reviewed": "November 29, 2023",
        "title": "great",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "like this Hotel, great location, staff",
        "negative": "Maybe they can be more attentive at the front desk",
        "body": "like this Hotel, great location, staff\nMaybe they can be more attentive at the front desk"
      },
      {
        "reviewer": "Kathy",
        "activeSince": "Active since 2015",
        "country": "Australia",
        "room": "King Guestroom",
        "stay": "4 nights · November 2023",
        "guestType": "Couple",
        "reviewed": "November 26, 2023",
        "title": "A little luxury with Excellence",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Beautiful Art Deco architecture and very comfortable lounge, bar area with a gorgeous fireplace and bistro.",
        "negative": "Nothing not to like",
        "body": "Beautiful Art Deco architecture and very comfortable lounge, bar area with a gorgeous fireplace and bistro.\nNothing not to like"
      },
      {
        "reviewer": "Eduardo",
        "activeSince": "Active since 2012",
        "country": "Brazil",
        "room": "Corner Studio",
        "stay": "4 nights · November 2023",
        "guestType": "Couple",
        "reviewed": "November 14, 2023",
        "title": "Perfect stay",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Abobe all, friendliness of Staff",
        "negative": "",
        "body": "Abobe all, friendliness of Staff"
      },
      {
        "reviewer": "Oleksandr",
        "activeSince": "Active since 2018",
        "country": "Canada",
        "room": "King Guestroom",
        "stay": "1 night · October 2023",
        "guestType": "Couple",
        "reviewed": "November 12, 2023",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Right in the downtown core, close to everything (including the Bean). The rooms are clean, the service is amazing.",
        "negative": "Nothing in particular comes to mind. I'd say the stay was near perfect",
        "body": "Right in the downtown core, close to everything (including the Bean). The rooms are clean, the service is amazing.\nNothing in particular comes to mind. I'd say the stay was near perfect"
      },
      {
        "reviewer": "Michael",
        "activeSince": "Active since 2016",
        "country": "Australia",
        "room": "River View Corner One Bedroom Suite",
        "stay": "1 night · October 2023",
        "guestType": "Group",
        "reviewed": "November 5, 2023",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Excellent location. Wonderful staff. Facilities awesome overall.",
        "negative": "",
        "body": "Excellent location. Wonderful staff. Facilities awesome overall."
      },
      {
        "reviewer": "David",
        "activeSince": "Active since 2012",
        "country": "Ireland",
        "room": "River View Corner One Bedroom Suite",
        "stay": "4 nights · October 2023",
        "guestType": "Family",
        "reviewed": "November 2, 2023",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location, beautiful building, large comfortable bed. Suite good fit for family of four.",
        "negative": "Sofa bed not the most comfortable.",
        "body": "Great location, beautiful building, large comfortable bed. Suite good fit for family of four.\nSofa bed not the most comfortable."
      },
      {
        "reviewer": "Sergio",
        "activeSince": "Active since 2013",
        "country": "Germany",
        "room": "Deluxe Corner Studio",
        "stay": "1 night · October 2023",
        "guestType": "Couple",
        "reviewed": "November 1, 2023",
        "title": "Fantastic design hotel",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "- The architecture is magnificent\n- The roof top bar is chic and has a splendid view\n- The rooms are super spacious and have modern architecture\n- Fantastic smell in the lobby\n- Too few elevators. Waiting times sometimes >5-10mins. Hotel guests compete with bar guests for access.",
        "negative": "- Acoustic isolation isn't great. You'll be hearing doors closing regularly. Noise from Michigan Av is very noticeable. There is a fire dept just a few feet away and there are fire trucks leaving regularly.",
        "body": "- The architecture is magnificent\n- The roof top bar is chic and has a splendid view\n- The rooms are super spacious and have modern architecture\n- Fantastic smell in the lobby\n- Too few elevators. Waiting times sometimes >5-10mins. Hotel guests compete with bar guests for access.\n- Acoustic isolation isn't great. You'll be hearing doors closing regularly. Noise from Michigan Av is very noticeable. There is a fire dept just a few feet away and there are fire trucks leaving regularly."
      },
      {
        "reviewer": "Sarah",
        "activeSince": "Active since 2013",
        "country": "United Kingdom",
        "room": "Accessible King Guest Room",
        "stay": "5 nights · October 2023",
        "guestType": "Couple",
        "reviewed": "October 31, 2023",
        "title": "Perfectly located hotel for our trip. I would stay here again.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Excellent location for sightseeing. Very comfortable Superking size bed. Complimentary coffee and fruit in reception in the morning. Beautiful skyline views from the bar on the 24th (?) Floor. Beautiful Art Deco building",
        "negative": "The complimentary hot water for tea in the reception was luke warm and not usable.",
        "body": "Excellent location for sightseeing. Very comfortable Superking size bed. Complimentary coffee and fruit in reception in the morning. Beautiful skyline views from the bar on the 24th (?) Floor. Beautiful Art Deco building\nThe complimentary hot water for tea in the reception was luke warm and not usable."
      },
      {
        "reviewer": "Abdullah",
        "activeSince": "Active since 2011",
        "country": "Saudi Arabia",
        "room": "Queen Queen Guestroom",
        "stay": "5 nights · October 2023",
        "guestType": "Solo traveler",
        "reviewed": "October 30, 2023",
        "title": "Didn’t regret staying here!",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The location is superb.\nThe staff all are very friendly.\nClean & elegant room.\nLove the vintage look of the hotel.",
        "negative": "Actually nothing… there are streets notice but this is the heart of Chicago!",
        "body": "The location is superb.\nThe staff all are very friendly.\nClean & elegant room.\nLove the vintage look of the hotel.\nActually nothing… there are streets notice but this is the heart of Chicago!"
      },
      {
        "reviewer": "Derek",
        "activeSince": "",
        "country": "United Kingdom",
        "room": "King Guestroom",
        "stay": "5 nights · October 2023",
        "guestType": "Couple",
        "reviewed": "October 29, 2023",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Excellent location and a great bar",
        "negative": "Air con could have been better",
        "body": "Excellent location and a great bar\nAir con could have been better"
      },
      {
        "reviewer": "Jon",
        "activeSince": "Active since 2015",
        "country": "United Kingdom",
        "room": "King Guestroom",
        "stay": "6 nights · October 2023",
        "guestType": "Solo traveler",
        "reviewed": "October 28, 2023",
        "title": "Very friendly staff, great art deco",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Friendly staff and the art deco/nouveau",
        "negative": "Corridors to room need a bit more interest",
        "body": "Friendly staff and the art deco/nouveau\nCorridors to room need a bit more interest"
      },
      {
        "reviewer": "Samantha",
        "activeSince": "",
        "country": "United States",
        "room": "Accessible King Guest Room",
        "stay": "3 nights · October 2023",
        "guestType": "Group",
        "reviewed": "October 28, 2023",
        "title": "Comfortable, hospitable, and fun.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Beautiful and historical",
        "negative": "N/A",
        "body": "Beautiful and historical\nN/A"
      },
      {
        "reviewer": "Michel",
        "activeSince": "Active since 2023",
        "country": "Canada",
        "room": "King Guestroom",
        "stay": "7 nights · October 2023",
        "guestType": "Couple",
        "reviewed": "October 24, 2023",
        "title": "A luxurious stay in downtown Chicago",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The Pendry is gorgeous hotel in a gorgeous building. Prices are steep for rooms in downtown Chicago but the Pendry and its staff offer top-rate accommodation for the price. The lobbies are spectacular. The service is excellent (particularly Muriel at the desk and Anis at the lobby bar). The room was very clean, comfortable and quiet (could use a little more art work maybe). The bathroom could be bigger but this is a historic building and there are certainly limitations. The rooftop bar offers great views of Chicago but was generally booked for events while we were there (October), limiting its usefulness for guests.",
        "negative": "The associated restaurant (Le Venteux) could be better at the price. The decor is a little cheap for a French bistro in a posh hotel and the place is not terribly clean (crumbs and stains on seats twice, tables not clean). The breakfast offering and service could be better (no tap payment in 2023?)",
        "body": "The Pendry is gorgeous hotel in a gorgeous building. Prices are steep for rooms in downtown Chicago but the Pendry and its staff offer top-rate accommodation for the price. The lobbies are spectacular. The service is excellent (particularly Muriel at the desk and Anis at the lobby bar). The room was very clean, comfortable and quiet (could use a little more art work maybe). The bathroom could be bigger but this is a historic building and there are certainly limitations. The rooftop bar offers great views of Chicago but was generally booked for events while we were there (October), limiting its usefulness for guests.\nThe associated restaurant (Le Venteux) could be better at the price. The decor is a little cheap for a French bistro in a posh hotel and the place is not terribly clean (crumbs and stains on seats twice, tables not clean). The breakfast offering and service could be better (no tap payment in 2023?)"
      },
      {
        "reviewer": "Bookstaver",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "3 nights · October 2023",
        "guestType": "Couple",
        "reviewed": "October 23, 2023",
        "title": "Love this hotel, but honor your upgrades!!!",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great location and lovely hotel",
        "negative": "I’ve stayed there 4 times. They upgraded my room from a King bed to 2 Queen bed for free. But when I checked out luckily I checked the bill because they tried to charge me an extra $800",
        "body": "Great location and lovely hotel\nI’ve stayed there 4 times. They upgraded my room from a King bed to 2 Queen bed for free. But when I checked out luckily I checked the bill because they tried to charge me an extra $800"
      },
      {
        "reviewer": "Sharon",
        "activeSince": "Active since 2015",
        "country": "United Kingdom",
        "room": "Queen Queen Guestroom",
        "stay": "9 nights · October 2023",
        "guestType": "Group",
        "reviewed": "October 20, 2023",
        "title": "Overall excellent downside external noise levels",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Friendly helpful staff, high quality interior design, very comfortable bed and bedding, great cafe venteux breakfast",
        "negative": "We were on 6th floor, noise levels terrible from traffic and refuse collection at 3am. You would honestly think there was no glass in windows. I’ve stayed in city hotels many times and not experienced noise like this!",
        "body": "Friendly helpful staff, high quality interior design, very comfortable bed and bedding, great cafe venteux breakfast\nWe were on 6th floor, noise levels terrible from traffic and refuse collection at 3am. You would honestly think there was no glass in windows. I’ve stayed in city hotels many times and not experienced noise like this!"
      },
      {
        "reviewer": "Tracy",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "King Guestroom",
        "stay": "1 night · October 2023",
        "guestType": "Couple",
        "reviewed": "October 12, 2023",
        "title": "amazing but a few things need help",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Rooms and lobby are beautiful staff was lovely",
        "negative": "coffee served in the morning was the worst coffee I have ever had",
        "body": "Rooms and lobby are beautiful staff was lovely\ncoffee served in the morning was the worst coffee I have ever had"
      },
      {
        "reviewer": "Alison",
        "activeSince": "Active since 2014",
        "country": "United Kingdom",
        "room": "Queen Queen Guestroom",
        "stay": "3 nights · October 2023",
        "guestType": "Group",
        "reviewed": "October 11, 2023",
        "title": "Many thanks to the helpful staff who helped us with luggage and working out how to get from the metro to airport-very ki",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Iconic building, perfect location and friendly staff",
        "negative": "",
        "body": "Iconic building, perfect location and friendly staff"
      },
      {
        "reviewer": "John-paul",
        "activeSince": "Active since 2018",
        "country": "Australia",
        "room": "Accessible King Guest Room",
        "stay": "5 nights · October 2023",
        "guestType": "Family",
        "reviewed": "October 9, 2023",
        "title": "Great stay for a week to participate in the Chicago Marathon",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location, clean, friendly staff and large room.",
        "negative": "-",
        "body": "Great location, clean, friendly staff and large room.\n-"
      },
      {
        "reviewer": "Isagarciaa",
        "activeSince": "Active since 2014",
        "country": "Mexico",
        "room": "King Guestroom",
        "stay": "5 nights · September 2023",
        "guestType": "Couple",
        "reviewed": "October 9, 2023",
        "title": "Awesome location",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location, awesome staff; very nice and helpful.",
        "negative": "Room was smaller than I expected, but it was good, clean and quiet.",
        "body": "Great location, awesome staff; very nice and helpful.\nRoom was smaller than I expected, but it was good, clean and quiet."
      },
      {
        "reviewer": "Jennifer",
        "activeSince": "Active since 2012",
        "country": "Australia",
        "room": "Accessible King Guest Room",
        "stay": "5 nights · October 2023",
        "guestType": "Solo traveler",
        "reviewed": "October 9, 2023",
        "title": "I enjoyed my quiet room and easy access to the river",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "LOVELY BUILDING, CLEAN AND CENTRAL\nThe Pendry Bar was very good with reasonable priced small meals",
        "negative": "The attached cafe Venteux was very ordinary",
        "body": "LOVELY BUILDING, CLEAN AND CENTRAL\nThe Pendry Bar was very good with reasonable priced small meals\nThe attached cafe Venteux was very ordinary"
      }
    ],
    "viceroy-chicago": [
      {
        "reviewer": "Elena",
        "activeSince": "Active since 2013",
        "country": "United Kingdom",
        "room": "Deluxe Queen Room with Two Queen Beds and Lake View",
        "stay": "1 night · June 2026",
        "guestType": "Couple",
        "reviewed": "June 17, 2026",
        "title": "Great location and good vibe at the hotel and in the that city area",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Beautiful location and room",
        "negative": "Breakfast at the hotel was average",
        "body": "Beautiful location and room\nBreakfast at the hotel was average"
      },
      {
        "reviewer": "Blair",
        "activeSince": "Active since 2017",
        "country": "United Kingdom",
        "room": "Deluxe King Room",
        "stay": "5 nights · June 2026",
        "guestType": "Group",
        "reviewed": "June 12, 2026",
        "title": "Loved the hotel.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Amazing location, room was great, very clean and spacious and the staff were brilliant.",
        "negative": "The bar wasn’t open late and the roof bar didn’t open til 5. Showers weren’t easy to regulate temperature",
        "body": "Amazing location, room was great, very clean and spacious and the staff were brilliant.\nThe bar wasn’t open late and the roof bar didn’t open til 5. Showers weren’t easy to regulate temperature"
      },
      {
        "reviewer": "Brian",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Grand King Room",
        "stay": "3 nights · June 2026",
        "guestType": "Couple",
        "reviewed": "June 9, 2026",
        "title": "High-end Chicago luxury with a top-notch staff",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Incredible stay - we ordered a Grand King room and ended up with a One Bedroom Lake View Suite. Pure luxury in all 3 rooms. Great views including a sliver of Lake Michigan. The staff was super kind - thank Brady for helping us off the street in a flash with our huge cart full of bags. Swam in the rooftop pool every morning and were the only ones in there. The Somerset restaurant was great - loved the potatoes. Separate to-go coffee bar was clutch.",
        "negative": "No parking or vehicle entryway, but the bellhop service on the curb was excellent. We ended up using spot hero to find a cheaper lot on the block that was around $40/day.",
        "body": "Incredible stay - we ordered a Grand King room and ended up with a One Bedroom Lake View Suite. Pure luxury in all 3 rooms. Great views including a sliver of Lake Michigan. The staff was super kind - thank Brady for helping us off the street in a flash with our huge cart full of bags. Swam in the rooftop pool every morning and were the only ones in there. The Somerset restaurant was great - loved the potatoes. Separate to-go coffee bar was clutch.\nNo parking or vehicle entryway, but the bellhop service on the curb was excellent. We ended up using spot hero to find a cheaper lot on the block that was around $40/day."
      },
      {
        "reviewer": "Dellann",
        "activeSince": "",
        "country": "United States",
        "room": "Deluxe Queen Room with Two Queen Beds and Lake View",
        "stay": "3 nights · June 2026",
        "guestType": "Solo traveler",
        "reviewed": "June 4, 2026",
        "title": "I DEF will come back and stay again! Highly recommend this hotel.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Loved the location and helpful, friendly staff, valet and bell service.",
        "negative": "",
        "body": "Loved the location and helpful, friendly staff, valet and bell service."
      },
      {
        "reviewer": "Kayla",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Deluxe King Room with Lake View",
        "stay": "3 nights · May 2026",
        "guestType": "Couple",
        "reviewed": "May 26, 2026",
        "title": "Overall, I will be back!",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Everything! The vibe was nice, stay friendly, very clean & room view/decor amazing!",
        "negative": "They don’t have a microwave to warm up guest leftovers. Not even one in back area just to use for such purposes.",
        "body": "Everything! The vibe was nice, stay friendly, very clean & room view/decor amazing!\nThey don’t have a microwave to warm up guest leftovers. Not even one in back area just to use for such purposes."
      },
      {
        "reviewer": "Cécile",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · May 2026",
        "guestType": "Couple",
        "reviewed": "May 24, 2026",
        "title": "Excellent hôtel, beautiful design in a lively neighborhood",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Rooftop and cocktails were amazing\nBed is super comfortable\nRoom are quiet",
        "negative": "A bit pricy",
        "body": "Rooftop and cocktails were amazing\nBed is super comfortable\nRoom are quiet\nA bit pricy"
      },
      {
        "reviewer": "Claudia",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "2 nights · May 2026",
        "guestType": "Couple",
        "reviewed": "May 14, 2026",
        "title": "Superb location modern clean hotel with great breakfast restaurant on site and rooftop bar.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great hotel, superb location, friendly staff, dog friendly and great rooftop bar. Generously sized rooms - will stay again.",
        "negative": "",
        "body": "Great hotel, superb location, friendly staff, dog friendly and great rooftop bar. Generously sized rooms - will stay again."
      },
      {
        "reviewer": "Geoffery",
        "activeSince": "Active since 2012",
        "country": "United States",
        "room": "Grand King Room",
        "stay": "2 nights · May 2026",
        "guestType": "Group",
        "reviewed": "May 12, 2026",
        "title": "I’ll be back",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Very comfortable bed and room. The staff is really helpful. The area is full of amazing restaurants and shopping.",
        "negative": "Everything was wonderful",
        "body": "Very comfortable bed and room. The staff is really helpful. The area is full of amazing restaurants and shopping.\nEverything was wonderful"
      },
      {
        "reviewer": "Amanda",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "Queen Room with Two Queen Beds",
        "stay": "3 nights · April 2026",
        "guestType": "Group",
        "reviewed": "May 4, 2026",
        "title": "A lovely long weekend. I hope to return.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Perfect location in beautiful Gold Coast!",
        "negative": "Location, style, room decor, bathroom",
        "body": "Perfect location in beautiful Gold Coast!\nLocation, style, room decor, bathroom"
      },
      {
        "reviewer": "Andrew",
        "activeSince": "Active since 2018",
        "country": "Peru",
        "room": "Deluxe King Room",
        "stay": "6 nights · May 2026",
        "guestType": "Couple",
        "reviewed": "May 4, 2026",
        "title": "Great hotel, great people, great location.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Cómodo, lindo, buen servicio y bien ubicado.",
        "negative": "Todo ok.",
        "body": "Cómodo, lindo, buen servicio y bien ubicado.\nTodo ok."
      },
      {
        "reviewer": "Pranav",
        "activeSince": "Active since 2011",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · April 2026",
        "guestType": "Couple",
        "reviewed": "April 28, 2026",
        "title": "Perfect weekend getaway in Chicago!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Well located, very friendly staff, loved the touches in the room and the controls for the lighting. Very spacious and thoughtfully designed rooms. Really loved the large shower. The gym was excellent as well.",
        "negative": "N/a",
        "body": "Well located, very friendly staff, loved the touches in the room and the controls for the lighting. Very spacious and thoughtfully designed rooms. Really loved the large shower. The gym was excellent as well.\nN/a"
      },
      {
        "reviewer": "Jomarra",
        "activeSince": "Active since 2026",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · March 2026",
        "guestType": "Solo traveler",
        "reviewed": "April 20, 2026",
        "title": "My stay was peaceful, relaxing, and a breath of fresh air made me actually want to relocate! I overly enjoyed my stay!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "It’s very beautiful on the inside they didn’t bother me while I was sleeping to do room service and they just made me overall feel welcomed! I would definitely come stay again I loved it!",
        "negative": "I loved the decor the staff was really nice and helpful and they had a cute candy caddy out in the lobby and fresh fruit water.",
        "body": "It’s very beautiful on the inside they didn’t bother me while I was sleeping to do room service and they just made me overall feel welcomed! I would definitely come stay again I loved it!\nI loved the decor the staff was really nice and helpful and they had a cute candy caddy out in the lobby and fresh fruit water."
      },
      {
        "reviewer": "Emel",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "2 nights · April 2026",
        "guestType": "Couple",
        "reviewed": "April 12, 2026",
        "title": "Style right on the point! Incredible and attentive staff.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything! Excellent style, perfect location incredible staff",
        "negative": "",
        "body": "Everything! Excellent style, perfect location incredible staff"
      },
      {
        "reviewer": "Amanda",
        "activeSince": "Active since 2023",
        "country": "Australia",
        "room": "Deluxe King Room",
        "stay": "2 nights · February 2026",
        "guestType": "Couple",
        "reviewed": "April 5, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Nice and clean, staff were very helpful",
        "negative": "Nothing",
        "body": "Nice and clean, staff were very helpful\nNothing"
      },
      {
        "reviewer": "Hanan",
        "activeSince": "Active since 2012",
        "country": "Brazil",
        "room": "Deluxe Queen Room with Two Queen Beds and Lake View",
        "stay": "6 nights · March 2026",
        "guestType": "Group",
        "reviewed": "March 30, 2026",
        "title": "It is worth the value",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location, staff very friendly, view, comfortable bed.",
        "negative": "The shower was ok. Not fantastic",
        "body": "Location, staff very friendly, view, comfortable bed.\nThe shower was ok. Not fantastic"
      },
      {
        "reviewer": "Elizabeth",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "Queen Room with Two Queen Beds",
        "stay": "2 nights · March 2026",
        "guestType": "Couple",
        "reviewed": "March 13, 2026",
        "title": "Thanks!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location, good value and comfortable",
        "negative": "",
        "body": "Location, good value and comfortable"
      },
      {
        "reviewer": "Brittany",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · March 2026",
        "guestType": "Couple",
        "reviewed": "March 11, 2026",
        "title": "Very nice property in a great location",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Views and bathrooms were great!",
        "negative": "Card hold",
        "body": "Views and bathrooms were great!\nCard hold"
      },
      {
        "reviewer": "Victoria",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Deluxe King Room with Lake View",
        "stay": "1 night · February 2026",
        "guestType": "Couple",
        "reviewed": "March 1, 2026",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Quality facility, well-decorated, generally comfortable",
        "negative": "temperature control was lacking. Our room was extremely hot in the winter. Bathtub took 30+ mins to fill with barely warm water. TV was so laggy it was unwatchable.",
        "body": "Quality facility, well-decorated, generally comfortable\ntemperature control was lacking. Our room was extremely hot in the winter. Bathtub took 30+ mins to fill with barely warm water. TV was so laggy it was unwatchable."
      },
      {
        "reviewer": "Joseph",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · January 2026",
        "guestType": "Solo traveler",
        "reviewed": "February 21, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Clean, and location",
        "negative": "Nothing to say here",
        "body": "Clean, and location\nNothing to say here"
      },
      {
        "reviewer": "Natasha",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "2 nights · February 2026",
        "guestType": "Family",
        "reviewed": "February 19, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything",
        "negative": "I loved everything",
        "body": "Everything\nI loved everything"
      },
      {
        "reviewer": "Michael",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "King Room",
        "stay": "1 night · February 2026",
        "guestType": "Couple",
        "reviewed": "February 15, 2026",
        "title": "Both times I’ve spent my Valentines days at the Viceroy have been the best experiences for me and my partner, I highly r",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "It’s such a well kept and beautiful hotel. The rooms are chic and elegant, the location was convenient for my activities and the staff was super helpful and friendly",
        "negative": "",
        "body": "It’s such a well kept and beautiful hotel. The rooms are chic and elegant, the location was convenient for my activities and the staff was super helpful and friendly"
      },
      {
        "reviewer": "Sharon",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Junior Suite",
        "stay": "2 nights · January 2026",
        "guestType": "Solo traveler",
        "reviewed": "January 31, 2026",
        "title": "I loved every moment of my staycation, view was amazing",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The property was extremely clean, customer service immaculate from all the staff, very urgent when you call for room service.",
        "negative": "Everything was perfect",
        "body": "The property was extremely clean, customer service immaculate from all the staff, very urgent when you call for room service.\nEverything was perfect"
      },
      {
        "reviewer": "Jennica",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Deluxe Queen Room with Two Queen Beds and Lake View",
        "stay": "1 night · January 2026",
        "guestType": "Couple",
        "reviewed": "January 28, 2026",
        "title": "My sister and I did a girl’s one day trip to Chicago and this was the best place to stay.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The Viceroy was in the best location for dinning, shopping, and spa treatments",
        "negative": "Nothing was disappointing!",
        "body": "The Viceroy was in the best location for dinning, shopping, and spa treatments\nNothing was disappointing!"
      },
      {
        "reviewer": "Fiona",
        "activeSince": "Active since 2012",
        "country": "United Kingdom",
        "room": "Deluxe King Room",
        "stay": "5 nights · November 2025",
        "guestType": "Couple",
        "reviewed": "January 17, 2026",
        "title": "Relaxing stay in a central location",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Location was excellent 👌 loved the rooftop bar in the evenings, staff were so lovely in the bar. Room was lovely and aroma upon entering the hotel.",
        "negative": "Room walls needed a paint refresh, carpets in hallway needed hoovered.",
        "body": "Location was excellent 👌 loved the rooftop bar in the evenings, staff were so lovely in the bar. Room was lovely and aroma upon entering the hotel.\nRoom walls needed a paint refresh, carpets in hallway needed hoovered."
      },
      {
        "reviewer": "Seaberry",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "Suite with Lake View",
        "stay": "1 night · December 2025",
        "guestType": "Couple",
        "reviewed": "January 10, 2026",
        "title": "My stay was greater than I could ever imagine.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything",
        "negative": "Nothing",
        "body": "Everything\nNothing"
      },
      {
        "reviewer": "Eartha",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "King Room",
        "stay": "1 night · December 2025",
        "guestType": "Family",
        "reviewed": "January 7, 2026",
        "title": "Sunday Night Getaway",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Staff, room, and premises as a whole were lovely.",
        "negative": "Didn't like all the food for purchase already in the fridge. Had to move it around to make room for the food I bought with me.",
        "body": "Staff, room, and premises as a whole were lovely.\nDidn't like all the food for purchase already in the fridge. Had to move it around to make room for the food I bought with me."
      },
      {
        "reviewer": "Anne",
        "activeSince": "Active since 2014",
        "country": "United Kingdom",
        "room": "Deluxe Room with Two Queen Beds- Disability Access",
        "stay": "4 nights · December 2025",
        "guestType": "Family",
        "reviewed": "December 28, 2025",
        "title": "Great location and friendly staff",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "It’s a great location and friendly, helpful staff. Rooms are spacious and the beds are comfy.",
        "negative": "",
        "body": "It’s a great location and friendly, helpful staff. Rooms are spacious and the beds are comfy."
      },
      {
        "reviewer": "Daniel",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Grand King Room",
        "stay": "3 nights · November 2025",
        "guestType": "Couple",
        "reviewed": "December 15, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "We love the location and friendly staff.",
        "negative": "We had to ask two days to have new towels and bed made.",
        "body": "We love the location and friendly staff.\nWe had to ask two days to have new towels and bed made."
      },
      {
        "reviewer": "Cristie",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · December 2025",
        "guestType": "Solo traveler",
        "reviewed": "December 8, 2025",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location. Quiet. Extra security, fun hot chocolate bar, good amenities",
        "negative": "",
        "body": "Location. Quiet. Extra security, fun hot chocolate bar, good amenities"
      },
      {
        "reviewer": "Lauren",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · December 2025",
        "guestType": "Solo traveler",
        "reviewed": "December 4, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Beautiful property and in the perfect location for restaurants, bars and shops!",
        "negative": "",
        "body": "Beautiful property and in the perfect location for restaurants, bars and shops!"
      },
      {
        "reviewer": "Rjtonya",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Deluxe King Room with Lake View",
        "stay": "2 nights · November 2025",
        "guestType": "Couple",
        "reviewed": "November 17, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything! The view, the food, the room and the location! It was perfect.",
        "negative": "The pillows were too soft for our liking.",
        "body": "Everything! The view, the food, the room and the location! It was perfect.\nThe pillows were too soft for our liking."
      },
      {
        "reviewer": "Justin",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Deluxe King Room with Lake View",
        "stay": "2 nights · November 2025",
        "guestType": "Group",
        "reviewed": "November 10, 2025",
        "title": "Perfect location near everything!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Excellent staff and facilities Alison was amazing she needs a raise!",
        "negative": "Liked it all",
        "body": "Excellent staff and facilities Alison was amazing she needs a raise!\nLiked it all"
      },
      {
        "reviewer": "Debra",
        "activeSince": "Active since 2017",
        "country": "United Kingdom",
        "room": "Deluxe King Room",
        "stay": "4 nights · October 2025",
        "guestType": "Couple",
        "reviewed": "October 27, 2025",
        "title": "Great location, comfortable, high quality rooms.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great location. Lovely comfy beds. Large, luxury bathroom.",
        "negative": "",
        "body": "Great location. Lovely comfy beds. Large, luxury bathroom."
      },
      {
        "reviewer": "Angela",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Suite with Lake View",
        "stay": "5 nights · October 2025",
        "guestType": "Couple",
        "reviewed": "October 21, 2025",
        "title": "Good location and felt safe.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The location was great.",
        "negative": "The restaurant closes early.",
        "body": "The location was great.\nThe restaurant closes early."
      },
      {
        "reviewer": "Francis",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "King Room",
        "stay": "6 nights · October 2025",
        "guestType": "Couple",
        "reviewed": "October 20, 2025",
        "title": "Enjoyable, pleasant and comfortable.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Breakfast at the Somerset was very enjoyable. Rooftop drinks was a great way to spend time. All the staff were pleasant and very helpful at all times.",
        "negative": "The lobby coffee bar closed a bit early for me.",
        "body": "Breakfast at the Somerset was very enjoyable. Rooftop drinks was a great way to spend time. All the staff were pleasant and very helpful at all times.\nThe lobby coffee bar closed a bit early for me."
      },
      {
        "reviewer": "Aileen",
        "activeSince": "Active since 2014",
        "country": "Ireland",
        "room": "Deluxe King Room",
        "stay": "7 nights · October 2025",
        "guestType": "Family",
        "reviewed": "October 20, 2025",
        "title": "We thoroughly enjoyed our stay, George, Alison, Melissa and Iryna were so welcoming and helpful.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Location was perfect in that one felt safe in the immediate area. The room was comfortable and kept clean throughout our stay. Rooftop bar was most enjoyable post dinner. One female waiter (name escapes me)was exceptionally good; she remembered our nightcap cocktails some nights later! Excellent staff earlier in the week in the ground floor restaurant. The two girls were amazingly attentive.",
        "negative": "Bathroom: a little difficult to help husband with disability into the bath. Without the wooden board at the end of bath, it would have been impossible. Restaurant staff on night of 14 October less than attentive. There was no sign of waiter to replenish drinks, we had eventually, to go seek help. A manager subsequently apologised and a dessert with candle for my husband's birthday was presented to him.",
        "body": "Location was perfect in that one felt safe in the immediate area. The room was comfortable and kept clean throughout our stay. Rooftop bar was most enjoyable post dinner. One female waiter (name escapes me)was exceptionally good; she remembered our nightcap cocktails some nights later! Excellent staff earlier in the week in the ground floor restaurant. The two girls were amazingly attentive.\nBathroom: a little difficult to help husband with disability into the bath. Without the wooden board at the end of bath, it would have been impossible. Restaurant staff on night of 14 October less than attentive. There was no sign of waiter to replenish drinks, we had eventually, to go seek help. A manager subsequently apologised and a dessert with candle for my husband's birthday was presented to him."
      },
      {
        "reviewer": "Eran",
        "activeSince": "Active since 2013",
        "country": "Israel",
        "room": "Deluxe King Room with Lake View",
        "stay": "5 nights · October 2025",
        "guestType": "Couple",
        "reviewed": "October 15, 2025",
        "title": "Overall a great hotel with good value for money.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything was great. Location, Staff, Cleanliness. Paying attention for even small details, for example, in the Chicago marathon day, they provided water bottles, fruit and protein bars. A great place to stay in.",
        "negative": "The pool is too small, in case you plan on lap swimming.",
        "body": "Everything was great. Location, Staff, Cleanliness. Paying attention for even small details, for example, in the Chicago marathon day, they provided water bottles, fruit and protein bars. A great place to stay in.\nThe pool is too small, in case you plan on lap swimming."
      },
      {
        "reviewer": "Paul",
        "activeSince": "Active since 2020",
        "country": "United Kingdom",
        "room": "Deluxe King Room",
        "stay": "4 nights · October 2025",
        "guestType": "Couple",
        "reviewed": "October 15, 2025",
        "title": "One of the best hotels I have stayed at.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location, extremely clean and really fantastic staff",
        "negative": "Nothing",
        "body": "Great location, extremely clean and really fantastic staff\nNothing"
      },
      {
        "reviewer": "William",
        "activeSince": "Active since 2022",
        "country": "United Kingdom",
        "room": "Deluxe King Room",
        "stay": "3 nights · October 2025",
        "guestType": "Couple",
        "reviewed": "October 14, 2025",
        "title": "Amazing location, very clean, modern and spacious room. Would recommend",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Clean and spacious rooms. Tastefully decorated",
        "negative": "Breakfast options a little limited",
        "body": "Clean and spacious rooms. Tastefully decorated\nBreakfast options a little limited"
      },
      {
        "reviewer": "Monique",
        "activeSince": "Active since 2012",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · October 2025",
        "guestType": "Couple",
        "reviewed": "October 8, 2025",
        "title": "Mark the doorman was exceptional. He pushed the handicap button to make sure the door was open every time we cam back. I",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location was great! Comfortable bed. Staff was friendly.",
        "negative": "",
        "body": "Location was great! Comfortable bed. Staff was friendly."
      },
      {
        "reviewer": "Christen",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "King Room",
        "stay": "2 nights · September 2025",
        "guestType": "Solo traveler",
        "reviewed": "September 29, 2025",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The service, location, and atmosphere were great. And the room was very accommodating.",
        "negative": "The mattress weren’t comfortable and I turned down the temperature on the thermostat to 65 degrees to cool off the room, due to it being hot outside and it still was not cooling the room.",
        "body": "The service, location, and atmosphere were great. And the room was very accommodating.\nThe mattress weren’t comfortable and I turned down the temperature on the thermostat to 65 degrees to cool off the room, due to it being hot outside and it still was not cooling the room."
      },
      {
        "reviewer": "Takeena",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "King Room",
        "stay": "1 night · August 2025",
        "guestType": "Couple",
        "reviewed": "September 25, 2025",
        "title": "Wonderful stay",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything",
        "negative": "N/A",
        "body": "Everything\nN/A"
      },
      {
        "reviewer": "Javier",
        "activeSince": "Active since 2012",
        "country": "Panama",
        "room": "Deluxe King Room",
        "stay": "1 night · September 2025",
        "guestType": "Couple",
        "reviewed": "September 22, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The location is great and the staff is very friendly.",
        "negative": "",
        "body": "The location is great and the staff is very friendly."
      },
      {
        "reviewer": "Ann",
        "activeSince": "Active since 2015",
        "country": "United Kingdom",
        "room": "Deluxe King Room",
        "stay": "4 nights · September 2025",
        "guestType": "Couple",
        "reviewed": "September 17, 2025",
        "title": "Fab 4 night stay in a gorgeous hotel",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Beautiful hotel in a fantastic location, everywhere was clean and the staff were so pleasant and friendly, pool although small was lovely for a morning swim !!\nWould fully recommend ❤️😁",
        "negative": "Nothing really",
        "body": "Beautiful hotel in a fantastic location, everywhere was clean and the staff were so pleasant and friendly, pool although small was lovely for a morning swim !!\nWould fully recommend ❤️😁\nNothing really"
      },
      {
        "reviewer": "Deanna",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Grand King Room with Lake View",
        "stay": "3 nights · September 2025",
        "guestType": "Couple",
        "reviewed": "September 8, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Location is good and staff was friendly and professional.",
        "negative": "Bathroom could have been cleaner and missing body wash.",
        "body": "Location is good and staff was friendly and professional.\nBathroom could have been cleaner and missing body wash."
      },
      {
        "reviewer": "Alicia",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Grand King Room with Lake View",
        "stay": "2 nights · August 2025",
        "guestType": "Couple",
        "reviewed": "September 5, 2025",
        "title": "It was great. Only thing was parking was terrible and not worth the cost to valet",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "It was clean, great location and walking distance to most things",
        "negative": "Parking",
        "body": "It was clean, great location and walking distance to most things\nParking"
      },
      {
        "reviewer": "Michelle",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Deluxe King Room with Lake View",
        "stay": "2 nights · August 2025",
        "guestType": "Couple",
        "reviewed": "September 2, 2025",
        "title": "Lovely hotel",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Beautiful hotel, amazing bathroom. Great location. Staff were always pleasant and helpful.",
        "negative": "pillows are awful though they brought extra on request",
        "body": "Beautiful hotel, amazing bathroom. Great location. Staff were always pleasant and helpful.\npillows are awful though they brought extra on request"
      },
      {
        "reviewer": "Mokhtar",
        "activeSince": "Active since 2011",
        "country": "Germany",
        "room": "King Room",
        "stay": "5 nights · August 2025",
        "guestType": "Couple",
        "reviewed": "August 27, 2025",
        "title": "👍🏼",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "👍🙏🏼😘",
        "negative": "Everything was wonderful.grace place to be",
        "body": "👍🙏🏼😘\nEverything was wonderful.grace place to be"
      },
      {
        "reviewer": "Marc",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Deluxe Queen Room with Two Queen Beds and Lake View",
        "stay": "5 nights · August 2025",
        "guestType": "Family",
        "reviewed": "August 13, 2025",
        "title": "The location was excellent and the property itself was",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The hotel was clean, the beds were super comfortable and the staff was very attentive.",
        "negative": "",
        "body": "The hotel was clean, the beds were super comfortable and the staff was very attentive."
      },
      {
        "reviewer": "Robert",
        "activeSince": "Active since 2012",
        "country": "United Kingdom",
        "room": "Deluxe King Room with Lake View",
        "stay": "3 nights · July 2025",
        "guestType": "Couple",
        "reviewed": "July 28, 2025",
        "title": "Great visit to an amazing city",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Staff were extremely polite and helpful. Location is good, just a mile from the river. Close to some good restaurants and bars...and a lot of high end shops.",
        "negative": "Nothing",
        "body": "Staff were extremely polite and helpful. Location is good, just a mile from the river. Close to some good restaurants and bars...and a lot of high end shops.\nNothing"
      },
      {
        "reviewer": "Daiva",
        "activeSince": "Active since 2014",
        "country": "United Kingdom",
        "room": "Deluxe Queen Room with Two Queen Beds and Lake View",
        "stay": "7 nights · July 2025",
        "guestType": "Group",
        "reviewed": "July 28, 2025",
        "title": "Lovely hotel",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location and really good service. Our coffee machine stopped working after couple of days and was replaced on the same day with extra coffee pods.\nGreat people work in this hotel!",
        "negative": "Location and the people that work there",
        "body": "Great location and really good service. Our coffee machine stopped working after couple of days and was replaced on the same day with extra coffee pods.\nGreat people work in this hotel!\nLocation and the people that work there"
      },
      {
        "reviewer": "Dmitry",
        "activeSince": "Active since 2015",
        "country": "Canada",
        "room": "Deluxe King Room",
        "stay": "3 nights · June 2025",
        "guestType": "Couple",
        "reviewed": "July 25, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Room and manager.",
        "negative": "",
        "body": "Room and manager."
      },
      {
        "reviewer": "Jason",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Queen Room with Two Queen Beds",
        "stay": "2 nights · June 2025",
        "guestType": "Family",
        "reviewed": "July 21, 2025",
        "title": "Comfortable and Great DT Chicago Location",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location with walkability to the Magnificent Mile, restaurants and to Lake Michigan. Bar and restaurant on the property were great. Staff was very helpful and friendly. Beds were comfortable, bathrooms were large.",
        "negative": "A bit fed up with the extra daily 'amenity' and 'resort fee' charges for hotels that aren't resorts. It has a outdoor pool (didn't use) and a typical exercise room (also didn't use), so extra fees are a waste of money and for nothing special.",
        "body": "Great location with walkability to the Magnificent Mile, restaurants and to Lake Michigan. Bar and restaurant on the property were great. Staff was very helpful and friendly. Beds were comfortable, bathrooms were large.\nA bit fed up with the extra daily 'amenity' and 'resort fee' charges for hotels that aren't resorts. It has a outdoor pool (didn't use) and a typical exercise room (also didn't use), so extra fees are a waste of money and for nothing special."
      },
      {
        "reviewer": "Amy",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Suite with Lake View",
        "stay": "5 nights · July 2025",
        "guestType": "Family",
        "reviewed": "July 20, 2025",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Our room was amazing.\nThe pool closes at 5 pm every day. Kids were not allowed to eat at the rooftop restaurant. There was no food, drinks during the day at the pool , or even a bathroom on the pool level.",
        "negative": "Also the pull out couch is very uncomfortable.",
        "body": "Our room was amazing.\nThe pool closes at 5 pm every day. Kids were not allowed to eat at the rooftop restaurant. There was no food, drinks during the day at the pool , or even a bathroom on the pool level.\nAlso the pull out couch is very uncomfortable."
      },
      {
        "reviewer": "Camila",
        "activeSince": "",
        "country": "United States",
        "room": "King Room",
        "stay": "1 night · May 2025",
        "guestType": "Couple",
        "reviewed": "July 17, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The staff was very accommodating and friendly. We felt welcomed and safe.",
        "negative": "",
        "body": "The staff was very accommodating and friendly. We felt welcomed and safe."
      },
      {
        "reviewer": "Richard",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "2 nights · July 2025",
        "guestType": "Group",
        "reviewed": "July 12, 2025",
        "title": "Excellent Location and Value",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "If you like cozy, quiet and peaceful then this is your place!",
        "negative": "",
        "body": "If you like cozy, quiet and peaceful then this is your place!"
      },
      {
        "reviewer": "Jade",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Deluxe King Room with Lake View",
        "stay": "5 nights · July 2025",
        "guestType": "Couple",
        "reviewed": "July 2, 2025",
        "title": "Great clean hotel in great location.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Clean, good AC, nice shower,",
        "negative": "Pool is too small",
        "body": "Clean, good AC, nice shower,\nPool is too small"
      },
      {
        "reviewer": "William",
        "activeSince": "Active since 2016",
        "country": "Zimbabwe",
        "room": "Deluxe King Room",
        "stay": "4 nights · June 2025",
        "guestType": "Family",
        "reviewed": "June 28, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Excellent location",
        "negative": "The bar on the 16th floor very popular and required a booking to secure seating",
        "body": "Excellent location\nThe bar on the 16th floor very popular and required a booking to secure seating"
      },
      {
        "reviewer": "Lauren",
        "activeSince": "",
        "country": "United States",
        "room": "Queen Room with Two Queen Beds",
        "stay": "1 night · June 2025",
        "guestType": "Couple",
        "reviewed": "June 28, 2025",
        "title": "Great place, except shower would not drain fast enough",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Nice staff, comfortable beds, great food",
        "negative": "Bathtub flooded",
        "body": "Nice staff, comfortable beds, great food\nBathtub flooded"
      },
      {
        "reviewer": "Paul",
        "activeSince": "Active since 2012",
        "country": "United Kingdom",
        "room": "Deluxe King Room",
        "stay": "1 night · June 2025",
        "guestType": "Couple",
        "reviewed": "June 20, 2025",
        "title": "As long as you don’t need to park you can’t go wrong",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location, well appointed and staffed hotel of quality . Great rooftop pool",
        "negative": "A small issue - slightly inattentive service in the restaurant. Swingeing valet parking charge of $95 overnight",
        "body": "Great location, well appointed and staffed hotel of quality . Great rooftop pool\nA small issue - slightly inattentive service in the restaurant. Swingeing valet parking charge of $95 overnight"
      },
      {
        "reviewer": "Ron",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · February 2025",
        "guestType": "Couple",
        "reviewed": "February 15, 2025",
        "title": "Great stay! Front desk could have been more helpful, but vallet went out of his way to be friendly and helpful even thou",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location!",
        "negative": "Pricing seems to be increasing rapidly",
        "body": "Location!\nPricing seems to be increasing rapidly"
      },
      {
        "reviewer": "Tracy",
        "activeSince": "Active since 2013",
        "country": "United Kingdom",
        "room": "Deluxe King Room",
        "stay": "1 night · February 2025",
        "guestType": "Solo traveler",
        "reviewed": "February 6, 2025",
        "title": "Won’t stay anywhere else in Chicago",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Loved everything about this hotel, lovely warm welcome from Mark the concierge, room was gorgeous, lovely breakfast and cocktails on the 18th floor",
        "negative": "Nothing",
        "body": "Loved everything about this hotel, lovely warm welcome from Mark the concierge, room was gorgeous, lovely breakfast and cocktails on the 18th floor\nNothing"
      },
      {
        "reviewer": "Pavielle",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Grand King Room with Lake View",
        "stay": "1 night · January 2025",
        "guestType": "Solo traveler",
        "reviewed": "February 3, 2025",
        "title": "Treated myself for my birthday and I will definitely be returning",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The views in the room are breathtaking and the staff was amazing princess treatment the entire time.",
        "negative": "",
        "body": "The views in the room are breathtaking and the staff was amazing princess treatment the entire time."
      },
      {
        "reviewer": "Bridgette",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "King Room",
        "stay": "1 night · January 2025",
        "guestType": "Couple",
        "reviewed": "January 20, 2025",
        "title": "Nice Chicago Weekend Stay",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Really unique decor, large bathrooms with rain shower, comfortable beds, friendly staff, nice amenities.",
        "negative": "Valet was hard to get to do to location and it being a busy street, but quick friendly service was helpful.",
        "body": "Really unique decor, large bathrooms with rain shower, comfortable beds, friendly staff, nice amenities.\nValet was hard to get to do to location and it being a busy street, but quick friendly service was helpful."
      },
      {
        "reviewer": "David",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Grand King Room",
        "stay": "3 nights · January 2025",
        "guestType": "Couple",
        "reviewed": "January 9, 2025",
        "title": "Looking forward to staying whenever we are in Chicago",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Clean, beautifully appointed",
        "negative": "Loved everything",
        "body": "Clean, beautifully appointed\nLoved everything"
      },
      {
        "reviewer": "Jacquelyn",
        "activeSince": "Active since 2021",
        "country": "Sweden",
        "room": "Deluxe King Room",
        "stay": "2 nights · December 2024",
        "guestType": "Couple",
        "reviewed": "January 5, 2025",
        "title": "Great spot - will stay again when back in Chi!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Loved the room, felt very welcoming and cosy with all the necessary amenities! Great location, walking distance to everything in the city centre. Nice and helpful staff!",
        "negative": "",
        "body": "Loved the room, felt very welcoming and cosy with all the necessary amenities! Great location, walking distance to everything in the city centre. Nice and helpful staff!"
      },
      {
        "reviewer": "Gordon",
        "activeSince": "Active since 2016",
        "country": "United Kingdom",
        "room": "Deluxe King Room",
        "stay": "4 nights · December 2024",
        "guestType": "Couple",
        "reviewed": "January 4, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Nothing. Everything was 1st class.",
        "negative": "",
        "body": "Nothing. Everything was 1st class."
      },
      {
        "reviewer": "Randall",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Queen Room with Two Queen Beds",
        "stay": "2 nights · December 2024",
        "guestType": "Family",
        "reviewed": "January 2, 2025",
        "title": "Our stay was excellent.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The location, with food and shopping around the area",
        "negative": "N/A",
        "body": "The location, with food and shopping around the area\nN/A"
      },
      {
        "reviewer": "Elizabeth",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "King Room",
        "stay": "2 nights · December 2024",
        "guestType": "Couple",
        "reviewed": "December 31, 2024",
        "title": "Come for the 5 stars, stay for the decor.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "If you love mid-century and art deco design, this is the place for you. It’s so fun and beautiful.",
        "negative": "",
        "body": "If you love mid-century and art deco design, this is the place for you. It’s so fun and beautiful."
      },
      {
        "reviewer": "Stuart",
        "activeSince": "Active since 2019",
        "country": "United Kingdom",
        "room": "Deluxe Queen Room with Two Queen Beds and Lake View",
        "stay": "7 nights · June 2025",
        "guestType": "Family",
        "reviewed": "June 20, 2025",
        "title": "Amazing I would highly recommend",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Friendly staff. Lovely food and comfortable room.\nGreat location too",
        "negative": "Roof bar should be open. No drinks or food service up there and pool closing at 5pm",
        "body": "Friendly staff. Lovely food and comfortable room.\nGreat location too\nRoof bar should be open. No drinks or food service up there and pool closing at 5pm"
      },
      {
        "reviewer": "Karen",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Grand King Room with Lake View",
        "stay": "3 nights · June 2025",
        "guestType": "Couple",
        "reviewed": "June 15, 2025",
        "title": "Exceptional hotel in a great location.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Location, boutique style, well decorated, great rooms with view of the Lake. Exceptional staff. Rooftop bar and pool.",
        "negative": "Weddings took place while we were there and on our 2nd day our room was not serviced prior to 4:30.",
        "body": "Location, boutique style, well decorated, great rooms with view of the Lake. Exceptional staff. Rooftop bar and pool.\nWeddings took place while we were there and on our 2nd day our room was not serviced prior to 4:30."
      },
      {
        "reviewer": "Dennis",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Grand King Room with Lake View",
        "stay": "1 night · June 2025",
        "guestType": "Couple",
        "reviewed": "June 11, 2025",
        "title": "Great",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything!",
        "negative": "",
        "body": "Everything!"
      },
      {
        "reviewer": "Bilal",
        "activeSince": "Active since 2015",
        "country": "United Arab Emirates",
        "room": "Grand King Room",
        "stay": "1 night · April 2025",
        "guestType": "Solo traveler",
        "reviewed": "June 10, 2025",
        "title": "Stylish Comfort in the Heart of the City",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Viceroy Chicago offers an exceptional blend of modern luxury and classic elegance. From the moment I arrived, the attention to detail and warm service stood out. The room was not only beautifully designed with a contemporary aesthetic but also spacious and immaculately clean.\nThe bed was incredibly comfortable, ensuring restful sleep each night. I especially appreciated the upscale amenities and thoughtful touches throughout the space. The location is fantastic—situated in a vibrant neighborhood with easy access to top restaurants, shopping, and attractions.",
        "negative": "Whether you're visiting for business or leisure, Viceroy Chicago delivers a refined and memorable stay. Highly recommended.",
        "body": "Viceroy Chicago offers an exceptional blend of modern luxury and classic elegance. From the moment I arrived, the attention to detail and warm service stood out. The room was not only beautifully designed with a contemporary aesthetic but also spacious and immaculately clean.\nThe bed was incredibly comfortable, ensuring restful sleep each night. I especially appreciated the upscale amenities and thoughtful touches throughout the space. The location is fantastic—situated in a vibrant neighborhood with easy access to top restaurants, shopping, and attractions.\nWhether you're visiting for business or leisure, Viceroy Chicago delivers a refined and memorable stay. Highly recommended."
      },
      {
        "reviewer": "Aasiyah",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "Junior Suite",
        "stay": "2 nights · June 2025",
        "guestType": "Family",
        "reviewed": "June 10, 2025",
        "title": "I didn’t want to leave. The view was amazing.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Very beautiful hotel",
        "negative": "There was some scratches on the floor in the bedroom other then that everything else was amazing",
        "body": "Very beautiful hotel\nThere was some scratches on the floor in the bedroom other then that everything else was amazing"
      },
      {
        "reviewer": "Matthew",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · June 2025",
        "guestType": "Couple",
        "reviewed": "June 9, 2025",
        "title": "loved it in the heart of the city",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "excellent how the new 18th floor bar area looks",
        "negative": "Need more bottled water in the room- Fridge",
        "body": "excellent how the new 18th floor bar area looks\nNeed more bottled water in the room- Fridge"
      },
      {
        "reviewer": "Melony",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Deluxe King Room - Disability Access",
        "stay": "2 nights · May 2025",
        "guestType": "Couple",
        "reviewed": "June 2, 2025",
        "title": "Room was OK but met our needs",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location to our event",
        "negative": "One of the two elevators was broken. This caused lengthy waits at times. Front desk at check-in gave us the wrong room number, which caused us to have to go up and down and wait even longer to get into a room.",
        "body": "Location to our event\nOne of the two elevators was broken. This caused lengthy waits at times. Front desk at check-in gave us the wrong room number, which caused us to have to go up and down and wait even longer to get into a room."
      },
      {
        "reviewer": "Arif",
        "activeSince": "Active since 2012",
        "country": "Turkey",
        "room": "Suite with Lake View",
        "stay": "2 nights · May 2025",
        "guestType": "Family",
        "reviewed": "June 2, 2025",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Room was excellent",
        "negative": "Elevators were not enough and price / standart ratio was not right",
        "body": "Room was excellent\nElevators were not enough and price / standart ratio was not right"
      },
      {
        "reviewer": "Thilo",
        "activeSince": "Active since 2015",
        "country": "Panama",
        "room": "Deluxe King Room - Disability Access",
        "stay": "6 nights · May 2025",
        "guestType": "Couple",
        "reviewed": "June 1, 2025",
        "title": "Chicago by foot and in style!",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Best of all is location and style!",
        "negative": "Not a lot.",
        "body": "Best of all is location and style!\nNot a lot."
      },
      {
        "reviewer": "Christopher",
        "activeSince": "Active since 2023",
        "country": "Turks & Caicos Islands",
        "room": "Deluxe King Room",
        "stay": "4 nights · May 2025",
        "guestType": "Couple",
        "reviewed": "May 20, 2025",
        "title": "Amazing",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Relaxing",
        "negative": "Nothing",
        "body": "Relaxing\nNothing"
      },
      {
        "reviewer": "Gibson",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Deluxe Queen Room with Two Queen Beds and Lake View",
        "stay": "1 night · May 2025",
        "guestType": "Group",
        "reviewed": "May 20, 2025",
        "title": "Great staff and wonderful location. I would stay there again!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location",
        "negative": "Rooms were a little on the small side",
        "body": "Location\nRooms were a little on the small side"
      },
      {
        "reviewer": "Jessica",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Deluxe King Room with Lake View",
        "stay": "3 nights · April 2025",
        "guestType": "Couple",
        "reviewed": "May 16, 2025",
        "title": "Beautiful hotel and staff was absolutely fantastic!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The view as superb!",
        "negative": "",
        "body": "The view as superb!"
      },
      {
        "reviewer": "Welsh",
        "activeSince": "Active since 2022",
        "country": "United Kingdom",
        "room": "Grand King Room with Lake View",
        "stay": "7 nights · May 2025",
        "guestType": "Couple",
        "reviewed": "May 11, 2025",
        "title": "Viceroy city break",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Centrally located, nice area. Our room was at the front of the hotel with a lake view, could be noisy at times.\nVery comfortable sleeps on the whole. Friendly concierge staff. Nice 'candy cart' put out for Friday through to Sundays...which you pay for with a daily amenity charge.",
        "negative": "There's a popular small rooftop bar which locals use and can be difficult to get into unless reserved.",
        "body": "Centrally located, nice area. Our room was at the front of the hotel with a lake view, could be noisy at times.\nVery comfortable sleeps on the whole. Friendly concierge staff. Nice 'candy cart' put out for Friday through to Sundays...which you pay for with a daily amenity charge.\nThere's a popular small rooftop bar which locals use and can be difficult to get into unless reserved."
      },
      {
        "reviewer": "Kayla",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Suite with Lake View",
        "stay": "4 nights · May 2025",
        "guestType": "Couple",
        "reviewed": "May 9, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The view was immaculate.",
        "negative": "There was nothing we didn't like.",
        "body": "The view was immaculate.\nThere was nothing we didn't like."
      },
      {
        "reviewer": "Stefano",
        "activeSince": "Active since 2017",
        "country": "Italy",
        "room": "Deluxe Queen Room with Two Queen Beds and Lake View",
        "stay": "9 nights · May 2025",
        "guestType": "Family",
        "reviewed": "May 3, 2025",
        "title": "Fantastic location and view, recommended!",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Location, room, view from the room",
        "negative": "The floor in the room was not super clean, the rest was okay",
        "body": "Location, room, view from the room\nThe floor in the room was not super clean, the rest was okay"
      },
      {
        "reviewer": "Dngerousbeauty",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Deluxe Queen Room with Two Queen Beds and Lake View",
        "stay": "5 nights · April 2025",
        "guestType": "Family",
        "reviewed": "May 2, 2025",
        "title": "The Viceroy was a pleasant surprise that we'll return to everytime Chicago beckons",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "First and foremost, In an industry where customer service usually leaves a lot to be desiresd, Mister Camerons attention to detail and professionalism is to be commended. All guests were greeted by name. And at vatious times, greeted respectfully in their native language. For that alone we'll not soon forget his kindness.",
        "negative": "The restaurant could use a bit of help. The wait time to receive our order was unecessarily lengthy. And once received, everyone at our table noted key irregularities with their dishes that should have been caught during plating: overcooked chicken breasts, hollow falafels, and wilted salad greens, etc. After two unsatisfactory lunches we collectively decided to forgo the restaurant and venture out for all subsequent meals.",
        "body": "First and foremost, In an industry where customer service usually leaves a lot to be desiresd, Mister Camerons attention to detail and professionalism is to be commended. All guests were greeted by name. And at vatious times, greeted respectfully in their native language. For that alone we'll not soon forget his kindness.\nThe restaurant could use a bit of help. The wait time to receive our order was unecessarily lengthy. And once received, everyone at our table noted key irregularities with their dishes that should have been caught during plating: overcooked chicken breasts, hollow falafels, and wilted salad greens, etc. After two unsatisfactory lunches we collectively decided to forgo the restaurant and venture out for all subsequent meals."
      },
      {
        "reviewer": "Elizabeth",
        "activeSince": "Active since 2018",
        "country": "United Kingdom",
        "room": "Deluxe Queen Room with Two Queen Beds and Lake View",
        "stay": "4 nights · April 2025",
        "guestType": "Family",
        "reviewed": "April 21, 2025",
        "title": "The location is perfect with friendly, helpful staff.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Perfect location for exploring downtown Chicago and Lincoln Park area. Great view from the room. Comfortable beds.",
        "negative": "Some amenities were not available during the week and some were out of season but we knew that prior to booking so not a problem.",
        "body": "Perfect location for exploring downtown Chicago and Lincoln Park area. Great view from the room. Comfortable beds.\nSome amenities were not available during the week and some were out of season but we knew that prior to booking so not a problem."
      },
      {
        "reviewer": "Naishad",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · April 2025",
        "guestType": "Couple",
        "reviewed": "April 15, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Amazing property.",
        "negative": "I liked everything.",
        "body": "Amazing property.\nI liked everything."
      },
      {
        "reviewer": "David",
        "activeSince": "Active since 2012",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · March 2025",
        "guestType": "Solo traveler",
        "reviewed": "April 14, 2025",
        "title": "Nice hotel with some surprising basic flaws.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The rooftop bar is excellent. And the ground floor restaurant is reliably pleasant. The location is superb.",
        "negative": "Housekeeping was hit or miss over an extended stay. Didn't seem to replenish everything each day. More annoying was the quality of bath towels provided in a top dollar room: pretty much gym quality and rough. When asked for replacements, there were more of the same. Easy fix! Upgrade to some nice towels, please.",
        "body": "The rooftop bar is excellent. And the ground floor restaurant is reliably pleasant. The location is superb.\nHousekeeping was hit or miss over an extended stay. Didn't seem to replenish everything each day. More annoying was the quality of bath towels provided in a top dollar room: pretty much gym quality and rough. When asked for replacements, there were more of the same. Easy fix! Upgrade to some nice towels, please."
      },
      {
        "reviewer": "Kendrick",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "King Room",
        "stay": "1 night · March 2025",
        "guestType": "Couple",
        "reviewed": "April 5, 2025",
        "title": "Great location",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Love the location. Great staff.",
        "negative": "",
        "body": "Love the location. Great staff."
      },
      {
        "reviewer": "Daisy",
        "activeSince": "Active since 2022",
        "country": "Canada",
        "room": "Deluxe King Room",
        "stay": "3 nights · March 2025",
        "guestType": "Couple",
        "reviewed": "March 19, 2025",
        "title": "The Viceroy offers art deco charm, great service, and comfort.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "My partner and I booked the viceroy for it's art deco history and the fact that the modern redesign retained the inspiration from the art deco era. We found the hotel to be beautiful, full of kind cheerful staff. We liked the candy in the lobby and the environmentally friendly options. Our room was comfortable and quiet and the bathroom was beautiful. We ate in the restaurant downstairs and had an excellent breakfast again with very nice staff. An absolutely stunning hotel.",
        "negative": "I would have liked a few more options for pillows on the bed as the pillows were feather-soft but my neck prefers something firmer. finding the right temperature for the room was difficult as the spring weather was inconsistent.",
        "body": "My partner and I booked the viceroy for it's art deco history and the fact that the modern redesign retained the inspiration from the art deco era. We found the hotel to be beautiful, full of kind cheerful staff. We liked the candy in the lobby and the environmentally friendly options. Our room was comfortable and quiet and the bathroom was beautiful. We ate in the restaurant downstairs and had an excellent breakfast again with very nice staff. An absolutely stunning hotel.\nI would have liked a few more options for pillows on the bed as the pillows were feather-soft but my neck prefers something firmer. finding the right temperature for the room was difficult as the spring weather was inconsistent."
      },
      {
        "reviewer": "Mary",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · February 2025",
        "guestType": "Group",
        "reviewed": "March 18, 2025",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Bed and bedding were excellent, as was customer service.",
        "negative": "There wasn't much area to sit in the room. No real couch or lounging option... just sort of a Cleopatra couch.",
        "body": "Bed and bedding were excellent, as was customer service.\nThere wasn't much area to sit in the room. No real couch or lounging option... just sort of a Cleopatra couch."
      },
      {
        "reviewer": "Sav",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Grand King Room with Lake View",
        "stay": "2 nights · March 2025",
        "guestType": "Couple",
        "reviewed": "March 17, 2025",
        "title": "Great Stay",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Spent the weekend at the Viceroy to celebrate a birthday. The hotel staff welcomed us enthusiastically and made us feel like we were in good hands. The room was clean, comfortable and had stunning views of the city and lake. Location was prime and had easy access to public transportation if we wanted to venture to other parts of the city. Everything was great from the moment we checked in until we checked out.",
        "negative": "N/A.",
        "body": "Spent the weekend at the Viceroy to celebrate a birthday. The hotel staff welcomed us enthusiastically and made us feel like we were in good hands. The room was clean, comfortable and had stunning views of the city and lake. Location was prime and had easy access to public transportation if we wanted to venture to other parts of the city. Everything was great from the moment we checked in until we checked out.\nN/A."
      },
      {
        "reviewer": "Jorge",
        "activeSince": "Active since 2012",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "2 nights · March 2025",
        "guestType": "Couple",
        "reviewed": "March 9, 2025",
        "title": "Excellent",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Super clean",
        "negative": "Nothing",
        "body": "Super clean\nNothing"
      },
      {
        "reviewer": "Tori",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Grand King Room",
        "stay": "1 night · February 2025",
        "guestType": "Couple",
        "reviewed": "February 24, 2025",
        "title": "We had an excellent time.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Beautiful room, very clean, and staff was very helpful and friendly.",
        "negative": "No complaints here!",
        "body": "Beautiful room, very clean, and staff was very helpful and friendly.\nNo complaints here!"
      },
      {
        "reviewer": "Quiyanna",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "King Room",
        "stay": "2 nights · February 2025",
        "guestType": "Couple",
        "reviewed": "February 24, 2025",
        "title": "The viceroy provided us with tip tier luxury service. 10/10 I would recommend",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "the ambiance, the customer service, the views!!",
        "negative": "They did not have a microwave to reheat food",
        "body": "the ambiance, the customer service, the views!!\nThey did not have a microwave to reheat food"
      },
      {
        "reviewer": "Elizabeth",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "4 nights · February 2025",
        "guestType": "Couple",
        "reviewed": "February 16, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "staff-- so helpful and friendly. the view was great -- 8th floor so not very high but there are no buildings right next to the hotel that would block the view; location great for bars, restaurants, window shopping. We walked to Lincoln Park and the Chicago History Museum, past a Frank Lloyd Wright house (actually called the Charnley-Persky House Museum) and Astor St. historical district. The river walk is a bit of a hike but worth it because the hotel neighborhood (near north side/gold coast) was so walkable, a bit more mellow but still definitely in the city. Also, more restaurants are open beyond business hours (i.e. weekends) near the Viceroy compared with the Riverwalk area. Lou Malnati's right next door, a few markets within a block or two. Bed was very soft which I prefer. Never heard our neighbors -- very quiet.",
        "negative": "",
        "body": "staff-- so helpful and friendly. the view was great -- 8th floor so not very high but there are no buildings right next to the hotel that would block the view; location great for bars, restaurants, window shopping. We walked to Lincoln Park and the Chicago History Museum, past a Frank Lloyd Wright house (actually called the Charnley-Persky House Museum) and Astor St. historical district. The river walk is a bit of a hike but worth it because the hotel neighborhood (near north side/gold coast) was so walkable, a bit more mellow but still definitely in the city. Also, more restaurants are open beyond business hours (i.e. weekends) near the Viceroy compared with the Riverwalk area. Lou Malnati's right next door, a few markets within a block or two. Bed was very soft which I prefer. Never heard our neighbors -- very quiet."
      }
    ],
    "the-robey-chicago": [
      {
        "reviewer": "Jada",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "Queen + Bunk Loft",
        "stay": "1 night · November 2025",
        "guestType": "Group",
        "reviewed": "November 11, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "How close it was to the venue we were attending and how easy check in and velet service was. Staff was very polite and friendly!",
        "negative": "No complaints",
        "body": "How close it was to the venue we were attending and how easy check in and velet service was. Staff was very polite and friendly!\nNo complaints"
      },
      {
        "reviewer": "Chadwick",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Queen + Bunk Loft",
        "stay": "1 night · November 2025",
        "guestType": "Family",
        "reviewed": "November 4, 2025",
        "title": "I will definitely stay at the Roby when I return to the area.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Staff at check I. Were super nice and helpful. Always professional and welcoming.",
        "negative": "",
        "body": "Staff at check I. Were super nice and helpful. Always professional and welcoming."
      },
      {
        "reviewer": "Cifuentes",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "Queen Room",
        "stay": "1 night · October 2025",
        "guestType": "Group",
        "reviewed": "November 3, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "My best friend and I came up from Indy to enjoy the neighborhood for a couple days. Jose at the front reception was great! So nice and informative, really had our night starting off great! The rooms exceeded our expectations. The vibes, the window views, everything truly went perfect. We got to enjoy brunch at Cafe Robey and it was delicious! Highly recommend their biscuits and gravy. We also got to enjoy Le Labo just next door to the hotel, definitely should check out their Chicago limited scent. We had an amazing time, and staying at The Robey made is all the more fun!",
        "negative": "",
        "body": "My best friend and I came up from Indy to enjoy the neighborhood for a couple days. Jose at the front reception was great! So nice and informative, really had our night starting off great! The rooms exceeded our expectations. The vibes, the window views, everything truly went perfect. We got to enjoy brunch at Cafe Robey and it was delicious! Highly recommend their biscuits and gravy. We also got to enjoy Le Labo just next door to the hotel, definitely should check out their Chicago limited scent. We had an amazing time, and staying at The Robey made is all the more fun!"
      },
      {
        "reviewer": "Francisca",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Queen Room",
        "stay": "3 nights · September 2025",
        "guestType": "Couple",
        "reviewed": "September 10, 2025",
        "title": "Great! Highly recommended.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location. Great amenities.",
        "negative": "The price",
        "body": "Great location. Great amenities.\nThe price"
      },
      {
        "reviewer": "Wendy",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "King Room",
        "stay": "1 night · August 2025",
        "guestType": "Couple",
        "reviewed": "September 4, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Everything!!",
        "negative": "The cost!! But for two nights it was worth it",
        "body": "Everything!!\nThe cost!! But for two nights it was worth it"
      },
      {
        "reviewer": "Mary",
        "activeSince": "",
        "country": "United States",
        "room": "Queen Room",
        "stay": "1 night · August 2025",
        "guestType": "Solo traveler",
        "reviewed": "August 19, 2025",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Loved the art deco building, the location, the rooftop bar, and the breakfast. The room was small, but clean and comfortable.",
        "negative": "I felt the front desk staff were a bit snobby, particularly the person who checked me out.",
        "body": "Loved the art deco building, the location, the rooftop bar, and the breakfast. The room was small, but clean and comfortable.\nI felt the front desk staff were a bit snobby, particularly the person who checked me out."
      },
      {
        "reviewer": "Julianeal21",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Queen + Bunk Loft",
        "stay": "2 nights · August 2025",
        "guestType": "Family",
        "reviewed": "August 16, 2025",
        "title": "Comfortable, clean, stylish hotel perfect for local flavor.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "This was a very nice hotel if you wanted to experience a local vs super touristy part of Chicago. There were multiple restaurants and we liked the breakfast and the rooftop tacos. The staff was very friendly. There were TONS of nearby places to eat. Locally we mainly thrift shopped. Beds super comfortable.",
        "negative": "The trade off is it’s not super close to classic tourist sites.",
        "body": "This was a very nice hotel if you wanted to experience a local vs super touristy part of Chicago. There were multiple restaurants and we liked the breakfast and the rooftop tacos. The staff was very friendly. There were TONS of nearby places to eat. Locally we mainly thrift shopped. Beds super comfortable.\nThe trade off is it’s not super close to classic tourist sites."
      },
      {
        "reviewer": "Bryan",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Urban King - Hearing Accessible",
        "stay": "1 night · July 2025",
        "guestType": "Couple",
        "reviewed": "July 30, 2025",
        "title": "Amazing staff, updated rooms, great nightlife on site",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Beautiful room and an awesome location",
        "negative": "We loved everything about it",
        "body": "Beautiful room and an awesome location\nWe loved everything about it"
      },
      {
        "reviewer": "Diane",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Queen/Twin Loft- Mobility/Hearing - Transfer Shower",
        "stay": "3 nights · July 2025",
        "guestType": "Family",
        "reviewed": "July 7, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Nice decor, comfy bed, cool atmosphere, great location",
        "negative": "Could have used a dresser, could have used more comfortable seating",
        "body": "Nice decor, comfy bed, cool atmosphere, great location\nCould have used a dresser, could have used more comfortable seating"
      },
      {
        "reviewer": "Henry",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Queen Room",
        "stay": "3 nights · May 2025",
        "guestType": "Group",
        "reviewed": "May 29, 2025",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Incredible location, very cozy atmosphere",
        "negative": "A bit pricey for what it is",
        "body": "Incredible location, very cozy atmosphere\nA bit pricey for what it is"
      },
      {
        "reviewer": "Alison",
        "activeSince": "Active since 2012",
        "country": "United Kingdom",
        "room": "King Room",
        "stay": "3 nights · May 2024",
        "guestType": "Couple",
        "reviewed": "June 29, 2024",
        "title": "Great hotel, loved being more of a local than a visitor",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Love the location and the design of the room - simple, comfortable and clean. Great views back to the city. Breakfast in Cafe Robey was fab. Everyone was friendly and helpful. Oh, and the cocktails by the splash pool in the sunshine, and rooftop cocktails before heading out for an evening - these are a must!!",
        "negative": "Nothing I can think of.",
        "body": "Love the location and the design of the room - simple, comfortable and clean. Great views back to the city. Breakfast in Cafe Robey was fab. Everyone was friendly and helpful. Oh, and the cocktails by the splash pool in the sunshine, and rooftop cocktails before heading out for an evening - these are a must!!\nNothing I can think of."
      },
      {
        "reviewer": "Mohammad",
        "activeSince": "Active since 2019",
        "country": "Canada",
        "room": "King Room",
        "stay": "4 nights · June 2024",
        "guestType": "Solo traveler",
        "reviewed": "June 27, 2024",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Everything was almost spot on.\nI wish they had a microwave in the room",
        "negative": "I wish their tv supported other streaming services. I wish I could at keast cast to the tv myself.",
        "body": "Everything was almost spot on.\nI wish they had a microwave in the room\nI wish their tv supported other streaming services. I wish I could at keast cast to the tv myself."
      },
      {
        "reviewer": "Stephen",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "King Room",
        "stay": "2 nights · April 2024",
        "guestType": "Couple",
        "reviewed": "June 6, 2024",
        "title": "Amazing hotel in an amazing location.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Very clean room. Amazing location. Honestly one of the best hotels in chicago if you aren't trying to stay in the loop and want to experience more of the neighborhood feel of Wicker park. Near amazing bars and restaurants plus next to a train stop.",
        "negative": "Valet service was not always at the desk so had to wait a while. It is pricy for the size of the room",
        "body": "Very clean room. Amazing location. Honestly one of the best hotels in chicago if you aren't trying to stay in the loop and want to experience more of the neighborhood feel of Wicker park. Near amazing bars and restaurants plus next to a train stop.\nValet service was not always at the desk so had to wait a while. It is pricy for the size of the room"
      },
      {
        "reviewer": "Caitlin",
        "activeSince": "Active since 2016",
        "country": "Indonesia",
        "room": "Queen Room",
        "stay": "1 night · May 2024",
        "guestType": "Couple",
        "reviewed": "May 28, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "We loved the hotel so much! The views, the comfort, the staff and small details. Would definitely come back!",
        "negative": "",
        "body": "We loved the hotel so much! The views, the comfort, the staff and small details. Would definitely come back!"
      },
      {
        "reviewer": "Misty",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "King Room",
        "stay": "3 nights · May 2024",
        "guestType": "Couple",
        "reviewed": "May 27, 2024",
        "title": "Great start to summer.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Very modern with an antique touch. Great room service. Comfortable beds.",
        "negative": "Housekeeping was relentless. Even came when I was showering. Made me feel uncomfortable.",
        "body": "Very modern with an antique touch. Great room service. Comfortable beds.\nHousekeeping was relentless. Even came when I was showering. Made me feel uncomfortable."
      },
      {
        "reviewer": "David",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Queen Room",
        "stay": "1 night · March 2024",
        "guestType": "Couple",
        "reviewed": "May 2, 2024",
        "title": "Great hotel in the heart of Wicker Park",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Love this property. It’s a little quirky but very cool. Great location as well.",
        "negative": "No complaints",
        "body": "Love this property. It’s a little quirky but very cool. Great location as well.\nNo complaints"
      },
      {
        "reviewer": "Kristi",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Queen Room",
        "stay": "3 nights · April 2024",
        "guestType": "Couple",
        "reviewed": "May 2, 2024",
        "title": "Great location, stylish hotel, very small room",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location is great in Wicker Park. Right next to the Blue Line but did not feel too noisy. Amazing bakery, bars right outside the doors.",
        "negative": "For the price, the room was very very very tiny, seemed more suitable for one person",
        "body": "Location is great in Wicker Park. Right next to the Blue Line but did not feel too noisy. Amazing bakery, bars right outside the doors.\nFor the price, the room was very very very tiny, seemed more suitable for one person"
      },
      {
        "reviewer": "Sara",
        "activeSince": "Active since 2013",
        "country": "United Kingdom",
        "room": "Double Queen Loft- Hearing Accessible",
        "stay": "2 nights · March 2024",
        "guestType": "Family",
        "reviewed": "April 28, 2024",
        "title": "Lovely hotel with great character",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Really welcoming friendly staff. Comfortable stylish room. Enjoyed the roof top bar and the one on the second floor. The bistro is great for breakfast too.\nFantastic location for exploring Chicago",
        "negative": "Nothing really. Aircon unit outside our bedroom which was a little loud but not an issue really.",
        "body": "Really welcoming friendly staff. Comfortable stylish room. Enjoyed the roof top bar and the one on the second floor. The bistro is great for breakfast too.\nFantastic location for exploring Chicago\nNothing really. Aircon unit outside our bedroom which was a little loud but not an issue really."
      },
      {
        "reviewer": "Kimberly",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Landmark Queen - Hearing Accessible",
        "stay": "3 nights · March 2024",
        "guestType": "Couple",
        "reviewed": "April 5, 2024",
        "title": "It was a great hotel in a great neighborhood",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The rooftop bar",
        "negative": "",
        "body": "The rooftop bar"
      },
      {
        "reviewer": "Wendy",
        "activeSince": "",
        "country": "United States",
        "room": "Queen + Bunk Loft",
        "stay": "1 night · March 2024",
        "guestType": "Family",
        "reviewed": "March 28, 2024",
        "title": "Clean, comfortable, and enjoyable",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location, meal, bar all great. Staff great as well",
        "negative": "Finding the valet was a little difficult since we approached from a direction that we could not see the Balet sign",
        "body": "Location, meal, bar all great. Staff great as well\nFinding the valet was a little difficult since we approached from a direction that we could not see the Balet sign"
      },
      {
        "reviewer": "Continue readingMegan",
        "activeSince": "",
        "country": "United States",
        "room": "King Room",
        "stay": "2 nights · February 2024",
        "guestType": "Couple",
        "reviewed": "March 23, 2024",
        "title": "Excellent hotel in the best neighborhood in Chicago.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Loved the room design! The bed was very comfortable. The view was stunning. We lived in Chicago for 17 years and have never seen the city from that vantage point before.",
        "negative": "NA",
        "body": "Loved the room design! The bed was very comfortable. The view was stunning. We lived in Chicago for 17 years and have never seen the city from that vantage point before.\nNA"
      },
      {
        "reviewer": "Tiia",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Queen Room",
        "stay": "3 nights · February 2024",
        "guestType": "Solo traveler",
        "reviewed": "March 18, 2024",
        "title": "Conveniently located, happening environment and comfortable for resting. Perfect.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "While the room was intimate it was good, clean, nice view. Restaurant was great. Great food and service. Comfortable. 90's bar was a nice hang out in the day since there is no lobby lounge to relax.",
        "negative": "The lighting system is a little confusing and the closet is too small. No drawers for clothes. Prefer not being by the elevator next time.",
        "body": "While the room was intimate it was good, clean, nice view. Restaurant was great. Great food and service. Comfortable. 90's bar was a nice hang out in the day since there is no lobby lounge to relax.\nThe lighting system is a little confusing and the closet is too small. No drawers for clothes. Prefer not being by the elevator next time."
      },
      {
        "reviewer": "Steven",
        "activeSince": "",
        "country": "United States",
        "room": "Queen + Twin Loft",
        "stay": "1 night · March 2024",
        "guestType": "Family",
        "reviewed": "March 18, 2024",
        "title": "Awesome alternative to all the cookie-cutter chain hotels, would definitely consider a return visit.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Very cool building and room layout. Queen w/ lofted twin was a perfect fit for us with our college-aged son. View from the rooftop bar was amazing and we were only a short distance from our entertainment location for the evening (Andy's Jazz Club).",
        "negative": "",
        "body": "Very cool building and room layout. Queen w/ lofted twin was a perfect fit for us with our college-aged son. View from the rooftop bar was amazing and we were only a short distance from our entertainment location for the evening (Andy's Jazz Club)."
      },
      {
        "reviewer": "Amy",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Queen Room",
        "stay": "1 night · February 2024",
        "guestType": "Solo traveler",
        "reviewed": "February 27, 2024",
        "title": "Quaint and cozy, perfect for what I needed",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Happy with valet service, the location was convenient to the event I was attending. Staff was wonderful :)",
        "negative": "",
        "body": "Happy with valet service, the location was convenient to the event I was attending. Staff was wonderful :)"
      },
      {
        "reviewer": "Vivian",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Urban King - Hearing Accessible",
        "stay": "5 nights · January 2024",
        "guestType": "Family",
        "reviewed": "February 8, 2024",
        "title": "Friendly & competent staff.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Nice rooms, good restaurants & bar with a view. Best of all - great staff. Always helpful & friendly.",
        "negative": "Nothing",
        "body": "Nice rooms, good restaurants & bar with a view. Best of all - great staff. Always helpful & friendly.\nNothing"
      },
      {
        "reviewer": "John",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "King Room",
        "stay": "2 nights · January 2024",
        "guestType": "Couple",
        "reviewed": "January 30, 2024",
        "title": "It fulfilled our expectations.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Staff was delightful, room spacious and very comfortable, breakfast delicious!",
        "negative": "Would have liked a down comforter.",
        "body": "Staff was delightful, room spacious and very comfortable, breakfast delicious!\nWould have liked a down comforter."
      },
      {
        "reviewer": "Lena",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Queen Room",
        "stay": "2 nights · January 2024",
        "guestType": "Couple",
        "reviewed": "January 18, 2024",
        "title": "Great location, uncomfortable beds. Nice hotel for a quick stay.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great location, friendly staff.",
        "negative": "The beds were very uncomfortable.",
        "body": "Great location, friendly staff.\nThe beds were very uncomfortable."
      },
      {
        "reviewer": "Ambar",
        "activeSince": "",
        "country": "United States",
        "room": "Urban King - Hearing Accessible",
        "stay": "1 night · December 2023",
        "guestType": "Couple",
        "reviewed": "January 16, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "location. Free drink tickets and the sound machine was a big plus for being so close to the L",
        "negative": "Nothing, really.",
        "body": "location. Free drink tickets and the sound machine was a big plus for being so close to the L\nNothing, really."
      },
      {
        "reviewer": "B",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Double Queen Loft",
        "stay": "2 nights · December 2023",
        "guestType": "Group",
        "reviewed": "January 13, 2024",
        "title": "Excellent stay. Superb customer service.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "We had an issue with our hotel room door lock late at night. The staff made it right! The breakfast at Cafe Robey was very good.",
        "negative": "",
        "body": "We had an issue with our hotel room door lock late at night. The staff made it right! The breakfast at Cafe Robey was very good."
      },
      {
        "reviewer": "David",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Queen Room",
        "stay": "3 nights · January 2024",
        "guestType": "Couple",
        "reviewed": "January 9, 2024",
        "title": "Cool property in the heart of Wicker Park",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location, atmosphere, staff",
        "negative": "Valet is not ideal",
        "body": "Location, atmosphere, staff\nValet is not ideal"
      },
      {
        "reviewer": "Brian",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Queen Room",
        "stay": "1 night · June 2026",
        "guestType": "Couple",
        "reviewed": "June 9, 2026",
        "title": "Flat iron fun in the heart of Wicker Park",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Loved the design everywhere - the hotel is wonderfully put together and a pleasure to look at. The staff were great, serious and committed to our enjoyment of the stay. The rooftop pool at Solana was lovely to have hotel-exclusive access in the morning.",
        "negative": "We skipped the valet and looked for cheaper parking; ended up on the street at the meters. Nothing much you can do to avoid that. No issues and found spots within 5 minute walk.",
        "body": "Loved the design everywhere - the hotel is wonderfully put together and a pleasure to look at. The staff were great, serious and committed to our enjoyment of the stay. The rooftop pool at Solana was lovely to have hotel-exclusive access in the morning.\nWe skipped the valet and looked for cheaper parking; ended up on the street at the meters. Nothing much you can do to avoid that. No issues and found spots within 5 minute walk."
      },
      {
        "reviewer": "Trussoni",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "Queen + Bunk Loft",
        "stay": "1 night · April 2026",
        "guestType": "Couple",
        "reviewed": "May 6, 2026",
        "title": "Loved it. Will stay there a lot",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Clean and easy to deal with the staff.",
        "negative": "Entries were confusing",
        "body": "Clean and easy to deal with the staff.\nEntries were confusing"
      },
      {
        "reviewer": "Lee",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "Double Queen Loft- Hearing Accessible",
        "stay": "2 nights · April 2026",
        "guestType": "Couple",
        "reviewed": "April 26, 2026",
        "title": "Perfect.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "I’ve stayed at The Robey many times and I never have anything but great things to say about it.",
        "negative": "Nothing.",
        "body": "I’ve stayed at The Robey many times and I never have anything but great things to say about it.\nNothing."
      },
      {
        "reviewer": "Michael",
        "activeSince": "",
        "country": "United States",
        "room": "King Room",
        "stay": "3 nights · April 2026",
        "guestType": "Couple",
        "reviewed": "April 14, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location, character of historic building and fittings. Staff very helpful and friendly. On-site dining. Rooftop bar.",
        "negative": "Nothing. But as always in Chicago, the many additional taxes add up.",
        "body": "Location, character of historic building and fittings. Staff very helpful and friendly. On-site dining. Rooftop bar.\nNothing. But as always in Chicago, the many additional taxes add up."
      },
      {
        "reviewer": "Madison",
        "activeSince": "Active since 2026",
        "country": "United States",
        "room": "Landmark Queen - Hearing Accessible",
        "stay": "1 night · March 2026",
        "guestType": "Couple",
        "reviewed": "March 3, 2026",
        "title": "Very luxe, very relaxing.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "A very comfortable, inviting stay. I love the Le Labo bathroom products! The room smelled great and was very cozy. Cafe food delivered right to the room. Temperature adjustments to the rooms were easy and quick. All of the employees were very nice and helpful. Loved that there was a noise machine provided as well.",
        "negative": "The TV was lagging when trying to use the streaming services, but I just put the TV on to fall asleep, not my main point of focus for my trip!",
        "body": "A very comfortable, inviting stay. I love the Le Labo bathroom products! The room smelled great and was very cozy. Cafe food delivered right to the room. Temperature adjustments to the rooms were easy and quick. All of the employees were very nice and helpful. Loved that there was a noise machine provided as well.\nThe TV was lagging when trying to use the streaming services, but I just put the TV on to fall asleep, not my main point of focus for my trip!"
      },
      {
        "reviewer": "Vigil",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Queen Room",
        "stay": "2 nights · January 2026",
        "guestType": "Solo traveler",
        "reviewed": "February 24, 2026",
        "title": "great value, good location",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "great value, good location.",
        "negative": "",
        "body": "great value, good location."
      },
      {
        "reviewer": "Nicole",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "King Room",
        "stay": "3 nights · December 2025",
        "guestType": "Couple",
        "reviewed": "January 24, 2026",
        "title": "Perfect Boutique Hotel in Historic Building!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Such a great building and amenities. Plus the location in Wicker Park was perfect for our Holiday Vacation visiting family.",
        "negative": "The surrounding neighborhood or a neighborhood close to the hotel",
        "body": "Such a great building and amenities. Plus the location in Wicker Park was perfect for our Holiday Vacation visiting family.\nThe surrounding neighborhood or a neighborhood close to the hotel"
      },
      {
        "reviewer": "Janet",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "King Suite",
        "stay": "1 night · November 2025",
        "guestType": "Couple",
        "reviewed": "December 6, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Very fun restaurants and bars on site.",
        "negative": "",
        "body": "Very fun restaurants and bars on site."
      },
      {
        "reviewer": "Thomas",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "Urban King - Mobility/Hearing Accessible - Tub",
        "stay": "2 nights · November 2025",
        "guestType": "Couple",
        "reviewed": "November 12, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Loved the view, location, venue, bars, the staff. Really enjoyed everything.",
        "negative": "Only thing I'd say is the hold on the room charge to reimburse the money back to my card after checkout, but I understand it may take a few days.",
        "body": "Loved the view, location, venue, bars, the staff. Really enjoyed everything.\nOnly thing I'd say is the hold on the room charge to reimburse the money back to my card after checkout, but I understand it may take a few days."
      },
      {
        "reviewer": "Jennifer",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Queen + Bunk Loft",
        "stay": "1 night · November 2025",
        "guestType": "Family",
        "reviewed": "November 11, 2025",
        "title": "One night stay- made very comfortable",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location, clean, friendly, awesome neighborhood",
        "negative": "",
        "body": "Location, clean, friendly, awesome neighborhood"
      },
      {
        "reviewer": "Madison",
        "activeSince": "",
        "country": "United States",
        "room": "Queen/Twin Loft- Mobility/Hearing - Transfer Shower",
        "stay": "1 night · May 2025",
        "guestType": "Family",
        "reviewed": "May 17, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "close and convenient for where we were going and a lot of things are in walking distance.",
        "negative": "",
        "body": "close and convenient for where we were going and a lot of things are in walking distance."
      },
      {
        "reviewer": "Lorrie",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Double Queen Loft",
        "stay": "3 nights · May 2025",
        "guestType": "Group",
        "reviewed": "May 5, 2025",
        "title": "The Robey was a perfect spot to experience Chicago.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The Robey was extremely clean, the staff was amazing, the views from the second floor and roof were incredible, they have the most comfortable linens, beds, pillows etc! The location was perfect for us.",
        "negative": "",
        "body": "The Robey was extremely clean, the staff was amazing, the views from the second floor and roof were incredible, they have the most comfortable linens, beds, pillows etc! The location was perfect for us."
      },
      {
        "reviewer": "Becky",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Queen Room",
        "stay": "1 night · March 2025",
        "guestType": "Couple",
        "reviewed": "March 26, 2025",
        "title": "The staff was amazing, the facility was amazing, and the free passes to the gym down the street was really a great bonus",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "It was an overall great experience. Great neighborhood, close to everything. The upper room was amazing. We wish we could’ve stayed longer.",
        "negative": "It was a little bit hard to find the front entrance, but that in the way impacted our stay. Now that we know the next time we stay, there won’t be a problem.",
        "body": "It was an overall great experience. Great neighborhood, close to everything. The upper room was amazing. We wish we could’ve stayed longer.\nIt was a little bit hard to find the front entrance, but that in the way impacted our stay. Now that we know the next time we stay, there won’t be a problem."
      },
      {
        "reviewer": "Christine",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "King Room",
        "stay": "2 nights · March 2025",
        "guestType": "Family",
        "reviewed": "March 23, 2025",
        "title": "Comfortable and accommodating",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Lack of storage to unpack",
        "negative": "",
        "body": "Lack of storage to unpack"
      },
      {
        "reviewer": "Rachel",
        "activeSince": "",
        "country": "United States",
        "room": "Queen Room",
        "stay": "1 night · February 2025",
        "guestType": "Couple",
        "reviewed": "February 27, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Loved the updated old hotel feeling. Everything was very luxurious and thoughtful. The view was spectacular, I kept getting distracted by just staring out the window, and we were only on the 6th floor! Robes, an umbrella, nice shampoo and conditioner, it was all included!",
        "negative": "",
        "body": "Loved the updated old hotel feeling. Everything was very luxurious and thoughtful. The view was spectacular, I kept getting distracted by just staring out the window, and we were only on the 6th floor! Robes, an umbrella, nice shampoo and conditioner, it was all included!"
      },
      {
        "reviewer": "Joseph",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Queen/Twin Loft- Mobility/Hearing - Transfer Shower",
        "stay": "1 night · December 2024",
        "guestType": "Family",
        "reviewed": "January 21, 2025",
        "title": "Stayed with family members on Christmas Eve after attending a Christmas celebration.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Rooms were very nice. Met our needs well. Mini-bar was stocked with complimentary beverages. Valet parking worked well. Staff was courteous and friendly.",
        "negative": "N/A",
        "body": "Rooms were very nice. Met our needs well. Mini-bar was stocked with complimentary beverages. Valet parking worked well. Staff was courteous and friendly.\nN/A"
      },
      {
        "reviewer": "Alexander",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Queen Room",
        "stay": "2 nights · November 2024",
        "guestType": "Solo traveler",
        "reviewed": "January 10, 2025",
        "title": "seems more expensive than most other hotels.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "location",
        "negative": "a little too casual at check in. i stay here a lot and should get a Hello Again!",
        "body": "location\na little too casual at check in. i stay here a lot and should get a Hello Again!"
      },
      {
        "reviewer": "Willliam",
        "activeSince": "Active since 2011",
        "country": "United States",
        "room": "Queen Room",
        "stay": "1 night · December 2024",
        "guestType": "Couple",
        "reviewed": "January 5, 2025",
        "title": "We'll try to come back",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Nice location. It was a short trip so we didn't have much time to explore.\n1- We very excited about the bars and food options in the hotel. We couldn't have been more disappointed in Clever Coyote. The food was terrible. The ambience was blah and the drinks were just okay. It looked so promising. Fortunately we left and stumbled onto one of the best places on our trip.",
        "negative": "2- We travel very frequently and book the majority of our hotels through AA hotel portal and Booking dot come. There are never any dates available in the AA portal( closely approaching zero on an asymptote) which was why it took us so long to stay at this hotel. We waited until we reached the highest status on AA then booked through Booking.",
        "body": "Nice location. It was a short trip so we didn't have much time to explore.\n1- We very excited about the bars and food options in the hotel. We couldn't have been more disappointed in Clever Coyote. The food was terrible. The ambience was blah and the drinks were just okay. It looked so promising. Fortunately we left and stumbled onto one of the best places on our trip.\n2- We travel very frequently and book the majority of our hotels through AA hotel portal and Booking dot come. There are never any dates available in the AA portal( closely approaching zero on an asymptote) which was why it took us so long to stay at this hotel. We waited until we reached the highest status on AA then booked through Booking."
      },
      {
        "reviewer": "Erin",
        "activeSince": "Active since 2015",
        "country": "United Kingdom",
        "room": "Queen Room",
        "stay": "2 nights · December 2024",
        "guestType": "Solo traveler",
        "reviewed": "December 16, 2024",
        "title": "Beautiful sexy chic art deco hotel in a vibrant neighbourhood",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "I have a very hard time finding anything wrong with this hotel it’s minimal chic art deco interior gives me so much satisfaction, it’s just so beautiful and simple.",
        "negative": "The only thing I would say is maybe more duvet or blankets for the bed, it needs a bit of cosier touch with the bedding, take note of soho house bedding as for the price you should match this standard of quality.",
        "body": "I have a very hard time finding anything wrong with this hotel it’s minimal chic art deco interior gives me so much satisfaction, it’s just so beautiful and simple.\nThe only thing I would say is maybe more duvet or blankets for the bed, it needs a bit of cosier touch with the bedding, take note of soho house bedding as for the price you should match this standard of quality."
      },
      {
        "reviewer": "Yong",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Queen Room",
        "stay": "4 nights · November 2024",
        "guestType": "Solo traveler",
        "reviewed": "December 4, 2024",
        "title": "The Robey has great ambience, lovely restaurants, and is the best place to stay in Wicker Park.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location was perfect for my trip. Staying outside of the Loop is so much less hectic.",
        "negative": "Mattress was too hard.",
        "body": "Location was perfect for my trip. Staying outside of the Loop is so much less hectic.\nMattress was too hard."
      },
      {
        "reviewer": "Evan",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "Landmark Queen - Hearing Accessible",
        "stay": "1 night · November 2024",
        "guestType": "Couple",
        "reviewed": "November 10, 2024",
        "title": "Excellent stay",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location, price, and nightlife. Very clean and staff was wonderful. Will be booking at again when in Wicker Park",
        "negative": "🤷",
        "body": "Great location, price, and nightlife. Very clean and staff was wonderful. Will be booking at again when in Wicker Park\n🤷"
      },
      {
        "reviewer": "Mohamed",
        "activeSince": "Active since 2015",
        "country": "United Kingdom",
        "room": "Queen/Twin Loft- Mobility/Hearing - Transfer Shower",
        "stay": "1 night · November 2024",
        "guestType": "Group",
        "reviewed": "November 4, 2024",
        "title": "Great location and a trendy comfortable stay",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great bedding and super showering facilities. The loft was a bit loud next to the train tracks but not bad enough to hinder sleep. It was the best possible location for using the train in and out of the airport and in a great neighborhood.",
        "negative": "Not much really. Just that the pool was seasonally closed. This was not clear while booking and the value for money is not the best. Everything else was great!",
        "body": "Great bedding and super showering facilities. The loft was a bit loud next to the train tracks but not bad enough to hinder sleep. It was the best possible location for using the train in and out of the airport and in a great neighborhood.\nNot much really. Just that the pool was seasonally closed. This was not clear while booking and the value for money is not the best. Everything else was great!"
      },
      {
        "reviewer": "Sandra",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Urban King - Hearing Accessible",
        "stay": "3 nights · October 2024",
        "guestType": "Couple",
        "reviewed": "October 28, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location, UP bar was great and view spectacular, great breakfast location",
        "negative": "Street and L noise took some getting use to",
        "body": "Great location, UP bar was great and view spectacular, great breakfast location\nStreet and L noise took some getting use to"
      },
      {
        "reviewer": "Marcus",
        "activeSince": "Active since 2012",
        "country": "United States",
        "room": "Urban King - Mobility/Hearing Accessible - Tub",
        "stay": "3 nights · October 2024",
        "guestType": "Couple",
        "reviewed": "October 26, 2024",
        "title": "We had aFANTASTIC weekend at the Robby",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location, fabulous view. Wonderful and helpful staff. Loaned us bikes to ride on the 606. Bar on the roof is fantastic for watching the sun set and the moon come up",
        "negative": "Pool was closed for season even though it was a warm Fall weekend in Chicago.",
        "body": "Great location, fabulous view. Wonderful and helpful staff. Loaned us bikes to ride on the 606. Bar on the roof is fantastic for watching the sun set and the moon come up\nPool was closed for season even though it was a warm Fall weekend in Chicago."
      },
      {
        "reviewer": "Aimee",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "King Room",
        "stay": "3 nights · September 2024",
        "guestType": "Couple",
        "reviewed": "September 17, 2024",
        "title": "A great place to stay to enjoy Chicago! We will definitely stay here again.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The king room was very spacious and we had a great view of the city skyline. The food in Cafe Robey was fantastic!",
        "negative": "No complaints",
        "body": "The king room was very spacious and we had a great view of the city skyline. The food in Cafe Robey was fantastic!\nNo complaints"
      },
      {
        "reviewer": "Heath",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "King Room",
        "stay": "3 nights · August 2024",
        "guestType": "Couple",
        "reviewed": "September 3, 2024",
        "title": "Great vibe, cool place, but top floor rooms must contend with noise from club above until 1am.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Vibe, location",
        "negative": "Being on the top floor, the noise from the club above is pretty full-on. Not a huge deal breaker for us as we are there for the vibe but if you want to sleep before 1am, be warned. That being said, the club above decided to drag around chairs and tables directly above us starting at around 6am the next morning. This was super disruptive and inconsiderate to any guests on the 12th floor.",
        "body": "Vibe, location\nBeing on the top floor, the noise from the club above is pretty full-on. Not a huge deal breaker for us as we are there for the vibe but if you want to sleep before 1am, be warned. That being said, the club above decided to drag around chairs and tables directly above us starting at around 6am the next morning. This was super disruptive and inconsiderate to any guests on the 12th floor."
      },
      {
        "reviewer": "Robert",
        "activeSince": "Active since 2011",
        "country": "Australia",
        "room": "Queen Room",
        "stay": "1 night · August 2024",
        "guestType": "Solo traveler",
        "reviewed": "August 17, 2024",
        "title": "Great vibe, pick your room carefully, if you can",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great vibe, great ground floor cafe that rocked all day in a cool neighbourhood",
        "negative": "The noise from the nearby elevator area, the front street and the nearby subway line made sleeping very difficult. And it was not a cheap hotel booking.",
        "body": "Great vibe, great ground floor cafe that rocked all day in a cool neighbourhood\nThe noise from the nearby elevator area, the front street and the nearby subway line made sleeping very difficult. And it was not a cheap hotel booking."
      },
      {
        "reviewer": "Pamela",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Queen/Twin Loft- Mobility/Hearing - Transfer Shower",
        "stay": "2 nights · July 2024",
        "guestType": "Family",
        "reviewed": "July 6, 2024",
        "title": "I want to live in the Robey!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The ambience. The absolute cleanliness and quality of beds and linens. The staff found my watch and kept it safe is priceless to me. The rooftop pool and bar are dreamy and unforgettable.",
        "negative": "",
        "body": "The ambience. The absolute cleanliness and quality of beds and linens. The staff found my watch and kept it safe is priceless to me. The rooftop pool and bar are dreamy and unforgettable."
      },
      {
        "reviewer": "Kevin",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "King Room",
        "stay": "4 nights · June 2024",
        "guestType": "Solo traveler",
        "reviewed": "July 1, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location/staff/amenities",
        "negative": "",
        "body": "Location/staff/amenities"
      },
      {
        "reviewer": "Lucy",
        "activeSince": "Active since 2014",
        "country": "United Kingdom",
        "room": "Queen Room",
        "stay": "3 nights · September 2023",
        "guestType": "Couple",
        "reviewed": "November 6, 2023",
        "title": "Fantastic location. Hotel was pleasant enough and the ground floor cafe was outstanding.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The restaurant and bar options in the building were very good.",
        "negative": "We were told we would get complimentary beers in our room fridge each day, but we didn't get any.",
        "body": "The restaurant and bar options in the building were very good.\nWe were told we would get complimentary beers in our room fridge each day, but we didn't get any."
      },
      {
        "reviewer": "Mary",
        "activeSince": "Active since 2021",
        "country": "United Kingdom",
        "room": "King Room",
        "stay": "3 nights · August 2023",
        "guestType": "Solo traveler",
        "reviewed": "October 23, 2023",
        "title": "Comfortable, well-equiped room, great location",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location, amenities",
        "negative": "Nothing!",
        "body": "Location, amenities\nNothing!"
      },
      {
        "reviewer": "Andrew",
        "activeSince": "Active since 2015",
        "country": "United Kingdom",
        "room": "King Suite",
        "stay": "5 nights · October 2023",
        "guestType": "Couple",
        "reviewed": "October 18, 2023",
        "title": "Great place to explore Chicago",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Wicker Park is a great location for local independent shops and restaurants. Easy access to downtown. Great design and lovely room. Rooftop bar has great views and cafe does a lovely brunch",
        "negative": "",
        "body": "Wicker Park is a great location for local independent shops and restaurants. Easy access to downtown. Great design and lovely room. Rooftop bar has great views and cafe does a lovely brunch"
      },
      {
        "reviewer": "Emma",
        "activeSince": "Active since 2014",
        "country": "United Kingdom",
        "room": "King Room",
        "stay": "4 nights · October 2023",
        "guestType": "Couple",
        "reviewed": "October 17, 2023",
        "title": "Iconic building , stylish rooms with amazing views in great location",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great location, fantastic views and beautiful building",
        "negative": "There was a bit of noise from the L train but our guide book had advised us of this so we were prepared",
        "body": "Great location, fantastic views and beautiful building\nThere was a bit of noise from the L train but our guide book had advised us of this so we were prepared"
      },
      {
        "reviewer": "Katrina",
        "activeSince": "",
        "country": "United States",
        "room": "King Room",
        "stay": "3 nights · October 2023",
        "guestType": "Family",
        "reviewed": "October 12, 2023",
        "title": "An amazing mother daughter long weekend getaway",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Breakfast was amazing. Service was perfect. Upon arrival they were able to book a dinner reservation for that night which was tremendously helpful. The valet was very quick in retrieving my car.",
        "negative": "There really wasn’t anything we didn’t like.",
        "body": "Breakfast was amazing. Service was perfect. Upon arrival they were able to book a dinner reservation for that night which was tremendously helpful. The valet was very quick in retrieving my car.\nThere really wasn’t anything we didn’t like."
      },
      {
        "reviewer": "Luann",
        "activeSince": "",
        "country": "United States",
        "room": "Queen + Bunk Loft",
        "stay": "1 night · September 2023",
        "guestType": "Family",
        "reviewed": "October 5, 2023",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "We absolutely loved the style and design of the hotel and the room. It was so unique but also extremely comfortable and roomy.",
        "negative": "",
        "body": "We absolutely loved the style and design of the hotel and the room. It was so unique but also extremely comfortable and roomy."
      },
      {
        "reviewer": "Kristina",
        "activeSince": "",
        "country": "United States",
        "room": "Double Queen Loft- Hearing Accessible",
        "stay": "2 nights · October 2023",
        "guestType": "Family",
        "reviewed": "October 5, 2023",
        "title": "The location and condition of The Robey hotel made the price worth it for us, we would absolutely stay here again.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The property is very conveniently located in the heart of the Wicker Park neighborhood of Chicago. It is a super cool building and the rooms are well maintained and clean. Everyone that we encountered was friendly and helpful. The neighborhood had everything we needed in walking distance from the hotel.",
        "negative": "",
        "body": "The property is very conveniently located in the heart of the Wicker Park neighborhood of Chicago. It is a super cool building and the rooms are well maintained and clean. Everyone that we encountered was friendly and helpful. The neighborhood had everything we needed in walking distance from the hotel."
      },
      {
        "reviewer": "Vivian",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Double Queen Loft",
        "stay": "1 night · July 2023",
        "guestType": "Couple",
        "reviewed": "September 30, 2023",
        "title": "Closest hotel to our daughter",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The room we had was away from the blue line, which was great. I booked a minimalist room, which was better than expected. Our view was of a rooftop garden.\n1. Could not get into the rooftop lounge, even though there were plenty of open tables.\n2. The gap under the door lets too much light into the room.",
        "negative": "3. Curtains did not close all the way. Let too much light into the room.",
        "body": "The room we had was away from the blue line, which was great. I booked a minimalist room, which was better than expected. Our view was of a rooftop garden.\n1. Could not get into the rooftop lounge, even though there were plenty of open tables.\n2. The gap under the door lets too much light into the room.\n3. Curtains did not close all the way. Let too much light into the room."
      },
      {
        "reviewer": "Darnell",
        "activeSince": "",
        "country": "United States",
        "room": "Queen Room",
        "stay": "2 nights · September 2023",
        "guestType": "Solo traveler",
        "reviewed": "September 24, 2023",
        "title": "It was excellent.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The cleanses and view. It was nice.",
        "negative": "Nothing.",
        "body": "The cleanses and view. It was nice.\nNothing."
      },
      {
        "reviewer": "Alison",
        "activeSince": "",
        "country": "United States",
        "room": "Urban King - Mobility/Hearing Accessible - Tub",
        "stay": "2 nights · September 2023",
        "guestType": "Couple",
        "reviewed": "September 8, 2023",
        "title": "Great location while visiting family and enjoying Chicago",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Cafe Robey was great for brunch. The rooftop views and areas to have a drink were amazing. Chocolate chip cookies at 4pm were a treat. The room was well laid out and super clean. The blackout blinds - WOW! All of the architectural features of the building, such as the ornate elevator doors, were lovely.",
        "negative": "There was only 1 bedside table and lamp for a king bed. The chairs and small table were utilitarian, but a more comfortable chair to read in would have been nice. The pool was tiny.",
        "body": "Cafe Robey was great for brunch. The rooftop views and areas to have a drink were amazing. Chocolate chip cookies at 4pm were a treat. The room was well laid out and super clean. The blackout blinds - WOW! All of the architectural features of the building, such as the ornate elevator doors, were lovely.\nThere was only 1 bedside table and lamp for a king bed. The chairs and small table were utilitarian, but a more comfortable chair to read in would have been nice. The pool was tiny."
      },
      {
        "reviewer": "Van",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "King Room",
        "stay": "3 nights · July 2023",
        "guestType": "Couple",
        "reviewed": "August 25, 2023",
        "title": "Cool hotel, very nice room, great location, cool barsto enjoy a drink in, especially the rooftop bar",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Room was cool layout, very nice, clean, spacious, nice view. Enjoyed the cafe and especially the rooftop bar. Great cocktails and amazing view.",
        "negative": "Nothing in particular. Overall, a great stay!",
        "body": "Room was cool layout, very nice, clean, spacious, nice view. Enjoyed the cafe and especially the rooftop bar. Great cocktails and amazing view.\nNothing in particular. Overall, a great stay!"
      },
      {
        "reviewer": "Willow",
        "activeSince": "Active since 2022",
        "country": "Australia",
        "room": "Landmark Queen - Hearing Accessible",
        "stay": "3 nights · August 2023",
        "guestType": "Couple",
        "reviewed": "August 25, 2023",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Having a swanky cafe within, makes for a nice addition to the great chill-out spaces, The Coyote and Cabana. We also loved the art deco elevators, sash windows, high ceilings and comfort a a great view from 11th floor.",
        "negative": "",
        "body": "Having a swanky cafe within, makes for a nice addition to the great chill-out spaces, The Coyote and Cabana. We also loved the art deco elevators, sash windows, high ceilings and comfort a a great view from 11th floor."
      },
      {
        "reviewer": "Braun",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Queen Room",
        "stay": "1 night · August 2023",
        "guestType": "Couple",
        "reviewed": "August 18, 2023",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Style and location. Comfortable bed.",
        "negative": "",
        "body": "Style and location. Comfortable bed."
      },
      {
        "reviewer": "Sheila",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Urban King - Mobility/Hearing Accessible - Tub",
        "stay": "2 nights · August 2023",
        "guestType": "Couple",
        "reviewed": "August 14, 2023",
        "title": "Great neighborhood location, easy walk to the train. We would stay here again.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Groovy setting, tasteful upgrades keeping the vintage feel.",
        "negative": "Key was hard to get used to…I left it in the door 2x",
        "body": "Groovy setting, tasteful upgrades keeping the vintage feel.\nKey was hard to get used to…I left it in the door 2x"
      },
      {
        "reviewer": "Laura",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Double Queen Loft",
        "stay": "3 nights · July 2023",
        "guestType": "Family",
        "reviewed": "July 23, 2023",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Wish they could have accommodated an early check in",
        "negative": "",
        "body": "Wish they could have accommodated an early check in"
      },
      {
        "reviewer": "Kevin",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "King Room",
        "stay": "3 nights · June 2023",
        "guestType": "Couple",
        "reviewed": "July 23, 2023",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Good Location. Good energy in hotel. Excellent night curtains for sleeping. Staff was engaged and helpful.",
        "negative": "In Room light switches are not always well labeled.",
        "body": "Good Location. Good energy in hotel. Excellent night curtains for sleeping. Staff was engaged and helpful.\nIn Room light switches are not always well labeled."
      },
      {
        "reviewer": "Dawn",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Queen + Twin Loft",
        "stay": "4 nights · July 2023",
        "guestType": "Couple",
        "reviewed": "July 19, 2023",
        "title": "The perfect hotel for a chicago stay.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The convenience of being able to walk downstairs and have a restaurant available. And not just a restaurant, but an excellent restaurant! The discount was very nice, the gym, The bus and metro.... Everything made it I really wonderful stay.",
        "negative": "A small desk and chair in the room would have been Helpful.",
        "body": "The convenience of being able to walk downstairs and have a restaurant available. And not just a restaurant, but an excellent restaurant! The discount was very nice, the gym, The bus and metro.... Everything made it I really wonderful stay.\nA small desk and chair in the room would have been Helpful."
      },
      {
        "reviewer": "Mary",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "King Room",
        "stay": "2 nights · September 2025",
        "guestType": "Couple",
        "reviewed": "September 27, 2025",
        "title": "would stay here again in a heartbeat, fantastic views",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "would stay here again, super nice and comfortable, great tacos on the roof when you need a snack",
        "negative": "location isn't my favorite in chicago, it's a bit sprawly, but still, it is walking distance to a few great places in wicker park, so it's on my list of top hotels to stay in for a short time",
        "body": "would stay here again, super nice and comfortable, great tacos on the roof when you need a snack\nlocation isn't my favorite in chicago, it's a bit sprawly, but still, it is walking distance to a few great places in wicker park, so it's on my list of top hotels to stay in for a short time"
      },
      {
        "reviewer": "Pamela",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "Queen Room",
        "stay": "7 nights · November 2024",
        "guestType": "Solo traveler",
        "reviewed": "November 3, 2024",
        "title": "Great hotel with excellent amenities in a great walkable neighborhood.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Good location with great restaurants within walking distance or short Uber ride. Great walkable neighborhoods nearby and Wicker Park only 2 blocks away. Good shopping with small boutiques and well known stores all within walking distance.\nThe hotel has great amenities (free water, soda,beer in the mini fridge), robes and slippers. The room was lovely with large windows to let in light, a marble top table for working or eating and a good size bathroom.",
        "negative": "The Clever Coyote is open to guest during the day and is a great co-working space but could use more comfortable seating if you want to just hangout with a coffee and read a book.",
        "body": "Good location with great restaurants within walking distance or short Uber ride. Great walkable neighborhoods nearby and Wicker Park only 2 blocks away. Good shopping with small boutiques and well known stores all within walking distance.\nThe hotel has great amenities (free water, soda,beer in the mini fridge), robes and slippers. The room was lovely with large windows to let in light, a marble top table for working or eating and a good size bathroom.\nThe Clever Coyote is open to guest during the day and is a great co-working space but could use more comfortable seating if you want to just hangout with a coffee and read a book."
      },
      {
        "reviewer": "Maria",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Queen/Twin Loft- Mobility/Hearing - Transfer Shower",
        "stay": "2 nights · June 2024",
        "guestType": "Solo traveler",
        "reviewed": "August 15, 2024",
        "title": "Beautiful hotel in historic building.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Very beautifully designed hotel.",
        "negative": "The height of the bed in the ADA room was a bit too high. I made it work but if they could make the mattress even 2\" lower, that would be better.",
        "body": "Very beautifully designed hotel.\nThe height of the bed in the ADA room was a bit too high. I made it work but if they could make the mattress even 2\" lower, that would be better."
      },
      {
        "reviewer": "Caouette",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Landmark Queen - Hearing Accessible",
        "stay": "1 night · May 2024",
        "guestType": "Couple",
        "reviewed": "May 29, 2024",
        "title": "It was fine.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Did not like looking for entrance ! I liked the art deco style.",
        "negative": "Better lighting in hallway.",
        "body": "Did not like looking for entrance ! I liked the art deco style.\nBetter lighting in hallway."
      },
      {
        "reviewer": "Samantha",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "King Room",
        "stay": "1 night · March 2024",
        "guestType": "Couple",
        "reviewed": "March 18, 2024",
        "title": "Relaxing and fun!",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "It was a great location; the room was adequate. Quiet and plenty to do on-site. The food and drinks were excellent at all the bars and restaurants.",
        "negative": "The bathroom's layout was odd. We did not like seeing the person on the toilet versus having an opaque wall.",
        "body": "It was a great location; the room was adequate. Quiet and plenty to do on-site. The food and drinks were excellent at all the bars and restaurants.\nThe bathroom's layout was odd. We did not like seeing the person on the toilet versus having an opaque wall."
      },
      {
        "reviewer": "Kelly",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Urban King - Mobility/Hearing Accessible - Tub",
        "stay": "1 night · November 2023",
        "guestType": "Couple",
        "reviewed": "December 24, 2023",
        "title": "Unique historic building with cozy, smaller rooms and beautiful rooftop lounge views located conveniently to the blue li",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Rooftop view and lounge and restaurant onsite; friendly staff; access to the nearby athletic club.",
        "negative": "No sink area/surface area in bathroom to place any toiletries etc. Area around bed very tight.",
        "body": "Rooftop view and lounge and restaurant onsite; friendly staff; access to the nearby athletic club.\nNo sink area/surface area in bathroom to place any toiletries etc. Area around bed very tight."
      },
      {
        "reviewer": "Vick",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Queen Room",
        "stay": "2 nights · October 2023",
        "guestType": "Family",
        "reviewed": "October 9, 2023",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Convenient location near train, and location was quite walkable. The mattress was also very comfortable.",
        "negative": "The elevator seemed pretty outdated and getting in and out of the hotel did not feel very ADA friendly. I the closet space in the rooms were limited and they wish they had a full ironing board versus just the smaller one.",
        "body": "Convenient location near train, and location was quite walkable. The mattress was also very comfortable.\nThe elevator seemed pretty outdated and getting in and out of the hotel did not feel very ADA friendly. I the closet space in the rooms were limited and they wish they had a full ironing board versus just the smaller one."
      },
      {
        "reviewer": "Michael",
        "activeSince": "",
        "country": "United States",
        "room": "King Room",
        "stay": "2 nights · August 2023",
        "guestType": "Solo traveler",
        "reviewed": "August 22, 2023",
        "title": "I enjoyed my stay but felt a bit ripped off if I am being honest.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great location, room was clean",
        "negative": "Felt it was WAY overpriced",
        "body": "Great location, room was clean\nFelt it was WAY overpriced"
      },
      {
        "reviewer": "Helen",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "King Room",
        "stay": "3 nights · July 2023",
        "guestType": "Couple",
        "reviewed": "July 17, 2023",
        "title": "Historic Design Hotel in the Heart of Wicker Park",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Comfy bed, black out shades, pretty quiet despite being on a busy corner, nice bath products and collaboration with Le Labo (enjoyed getting a sample)",
        "negative": "Small bathroom. The bathroom door opens towards the bathroom instead of towards the hall. No air vents in bathroom. I wish there were bigger water bottles included with the daily facilities fee.",
        "body": "Comfy bed, black out shades, pretty quiet despite being on a busy corner, nice bath products and collaboration with Le Labo (enjoyed getting a sample)\nSmall bathroom. The bathroom door opens towards the bathroom instead of towards the hall. No air vents in bathroom. I wish there were bigger water bottles included with the daily facilities fee."
      },
      {
        "reviewer": "Michelle",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "King Room",
        "stay": "1 night · July 2023",
        "guestType": "Couple",
        "reviewed": "July 15, 2023",
        "title": "Great place for a night out in the city!",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "View from the rooftop and lounge were AMAZING! Room was cool and the bed was super comfy! If you’re looking for an area to do a lot of bar/ club music hopping this area is for perfect for you. Bustling neighborhood with tons of people watching to be had. Soundproof ish rooms blocked out any major noises but realistically you can’t quite down the city",
        "negative": "Wish the pool was a little bigger but still had a great time with a great view of one of the best cities!",
        "body": "View from the rooftop and lounge were AMAZING! Room was cool and the bed was super comfy! If you’re looking for an area to do a lot of bar/ club music hopping this area is for perfect for you. Bustling neighborhood with tons of people watching to be had. Soundproof ish rooms blocked out any major noises but realistically you can’t quite down the city\nWish the pool was a little bigger but still had a great time with a great view of one of the best cities!"
      },
      {
        "reviewer": "Suzanne",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "King Room",
        "stay": "3 nights · December 2023",
        "guestType": "Family",
        "reviewed": "January 2, 2024",
        "title": "Rude front desk staff",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "I had a nice room. The restaurant had decent foo.",
        "negative": "The front desk staff was rude. I would definitely not recommend this hotel or stay here again.",
        "body": "I had a nice room. The restaurant had decent foo.\nThe front desk staff was rude. I would definitely not recommend this hotel or stay here again."
      },
      {
        "reviewer": "Kristin",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Double Queen Loft",
        "stay": "2 nights · July 2023",
        "guestType": "Group",
        "reviewed": "August 1, 2023",
        "title": "Interested and great for your 20s",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The beds were really comfortable and the on site food options were nice to have and tasted great.",
        "negative": "The venue seemed a bit overpriced for what you got. Not a bitg hotel and the pool was pretty small / overrated. Last, if your floor was too high, you could hear everything going on at the clubs above.",
        "body": "The beds were really comfortable and the on site food options were nice to have and tasted great.\nThe venue seemed a bit overpriced for what you got. Not a bitg hotel and the pool was pretty small / overrated. Last, if your floor was too high, you could hear everything going on at the clubs above."
      },
      {
        "reviewer": "Rafe",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "King Suite",
        "stay": "2 nights · April 2026",
        "guestType": "Couple",
        "reviewed": "April 18, 2026",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great views. Comfortable Bed. Clean room. Thoughtful amenities and decor. Pleasant and professional staff.",
        "negative": "",
        "body": "Great views. Comfortable Bed. Clean room. Thoughtful amenities and decor. Pleasant and professional staff."
      },
      {
        "reviewer": "Amy",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Double Queen Loft",
        "stay": "1 night · May 2026",
        "guestType": "Family",
        "reviewed": "May 7, 2026",
        "title": "Fun and different hotel. Pricey for one night but great location.",
        "scoredLabel": "Scored 7.0",
        "scoreText": "7.0",
        "score10": 7,
        "positive": "The view from the room is nice. The roof is covered in greenary and was better than just a roof with vents. Also able to see train from room, but did not hear it at all.",
        "negative": "The app for hotel made it seem you could add on additional items pretty easily. I tried to opt in for early check in, and beverages, but neither of those we were able to do. We were able to drop our bags, but I would not have come straight to the hotel if we knew we could not check in.",
        "body": "The view from the room is nice. The roof is covered in greenary and was better than just a roof with vents. Also able to see train from room, but did not hear it at all.\nThe app for hotel made it seem you could add on additional items pretty easily. I tried to opt in for early check in, and beverages, but neither of those we were able to do. We were able to drop our bags, but I would not have come straight to the hotel if we knew we could not check in."
      },
      {
        "reviewer": "Liz",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Queen + Bunk Loft",
        "stay": "4 nights · October 2025",
        "guestType": "Couple",
        "reviewed": "October 24, 2025",
        "title": "Great location with improvement opportunities",
        "scoredLabel": "Scored 6.0",
        "scoreText": "6.0",
        "score10": 6,
        "positive": "Great location\nThe Up Room was amazing- great drinks, views, staff\nNice add ons included in extra amenity fee\nLove the old building and style, room design was unique, boutique hotel vibe\nThe front desk person at arrival was great and gave us great recommendations.\nRestaurant/ bar options on property\n- When we went to bed the first night, we found that the sheets weren’t clean. There was what looked like food stains (or worse?) and crumbs in the bed (still trying to figure that one out). Since housekeeping wasn’t there at night, we had to change rooms at 12am. No one on staff seemed to really care- someone came by to give new keys but no one apologized or followed up- which seems strange for a 4 star hotel. Even when I mentioned it at checkout, the front desk person said “ok” and nothing else.\n- Rooms are not sound proof at all and walls are thin- we could hear the tv in the room next door loud and clear and banging from above, and the train coming by every 5-10 mins. (Our room was directly outside the L, like very directly- eye level with passengers. I actually didn’t mind this as one of the quirks of the old building, and don’t mind the train sounds, I imagine this might not be the room for everyone.)\n- While I appreciate the quirkiness of the rooms, our room was oddly and not practically designed. Small things but create the overall experience. The sink splashes, doors to shower and toilet that bang into each other, there was not enough room next to the sink to put your stuff, the pipe intended to hang your clothes isn’t high enough for long items so they drag on the floor.\n- There was construction being done to the downstairs restaurant the day we checked out. It was incredibly loud, which made any of the lobby and restaurant totally unavailable.",
        "negative": "- With all of this, this just didn’t seem like a $500/night stay. I expected a certain level of comfort and service and there were improvements that could be made.",
        "body": "Great location\nThe Up Room was amazing- great drinks, views, staff\nNice add ons included in extra amenity fee\nLove the old building and style, room design was unique, boutique hotel vibe\nThe front desk person at arrival was great and gave us great recommendations.\nRestaurant/ bar options on property\n- When we went to bed the first night, we found that the sheets weren’t clean. There was what looked like food stains (or worse?) and crumbs in the bed (still trying to figure that one out). Since housekeeping wasn’t there at night, we had to change rooms at 12am. No one on staff seemed to really care- someone came by to give new keys but no one apologized or followed up- which seems strange for a 4 star hotel. Even when I mentioned it at checkout, the front desk person said “ok” and nothing else.\n- Rooms are not sound proof at all and walls are thin- we could hear the tv in the room next door loud and clear and banging from above, and the train coming by every 5-10 mins. (Our room was directly outside the L, like very directly- eye level with passengers. I actually didn’t mind this as one of the quirks of the old building, and don’t mind the train sounds, I imagine this might not be the room for everyone.)\n- While I appreciate the quirkiness of the rooms, our room was oddly and not practically designed. Small things but create the overall experience. The sink splashes, doors to shower and toilet that bang into each other, there was not enough room next to the sink to put your stuff, the pipe intended to hang your clothes isn’t high enough for long items so they drag on the floor.\n- There was construction being done to the downstairs restaurant the day we checked out. It was incredibly loud, which made any of the lobby and restaurant totally unavailable.\n- With all of this, this just didn’t seem like a $500/night stay. I expected a certain level of comfort and service and there were improvements that could be made."
      },
      {
        "reviewer": "Renee",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Queen Room",
        "stay": "1 night · December 2024",
        "guestType": "Couple",
        "reviewed": "December 29, 2024",
        "title": "Hotel amenities great. Noisy with the ‘L’ Blue line across the street",
        "scoredLabel": "Scored 1.0",
        "scoreText": "1.0",
        "score10": 1,
        "positive": "The Art Deco Style. Comfortable bed & bedding",
        "negative": "Too loud. Heard the ‘L’ blue line train running all night long",
        "body": "The Art Deco Style. Comfortable bed & bedding\nToo loud. Heard the ‘L’ blue line train running all night long"
      },
      {
        "reviewer": "Ali",
        "activeSince": "",
        "country": "United States",
        "room": "Queen Room",
        "stay": "4 nights · August 2024",
        "guestType": "Couple",
        "reviewed": "August 15, 2024",
        "title": "rooms need to inspected for better comfort....different floor hot spots are nice and location great",
        "scoredLabel": "Scored 6.0",
        "scoreText": "6.0",
        "score10": 6,
        "positive": "liked the location of the hotel and the different floors especially the pool and up room",
        "negative": "bathroom seat was uncomfortable....window curtains were to thin and letting sun into the room at early morning waking me up. full body mirror was hard to use with curtain in the way. shower floor was outdated",
        "body": "liked the location of the hotel and the different floors especially the pool and up room\nbathroom seat was uncomfortable....window curtains were to thin and letting sun into the room at early morning waking me up. full body mirror was hard to use with curtain in the way. shower floor was outdated"
      },
      {
        "reviewer": "Megan",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Double Queen Loft",
        "stay": "2 nights · July 2024",
        "guestType": "Family",
        "reviewed": "July 28, 2024",
        "title": "We won’t stay with our kids again sadly.",
        "scoredLabel": "Scored 5.0",
        "scoreText": "5.0",
        "score10": 5,
        "positive": "The location and the restaurant were great! Staff was friendly.",
        "negative": "We stayed in a room in the annex with 2 queen beds. The room was very loud and we all had a difficult time sleeping. The staff could not move us to another room because it was sold out and they tried to come fix the noise but could not. A high pitched screeching noise coming from the pipes and a very loud AC unit kept our whole family from sleeping along with very loud other guests and thin walls.",
        "body": "The location and the restaurant were great! Staff was friendly.\nWe stayed in a room in the annex with 2 queen beds. The room was very loud and we all had a difficult time sleeping. The staff could not move us to another room because it was sold out and they tried to come fix the noise but could not. A high pitched screeching noise coming from the pipes and a very loud AC unit kept our whole family from sleeping along with very loud other guests and thin walls."
      },
      {
        "reviewer": "Amanda",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Double Queen Loft- Hearing Accessible",
        "stay": "1 night · April 2024",
        "guestType": "Family",
        "reviewed": "April 28, 2024",
        "title": "You’re definitely paying for the location",
        "scoredLabel": "Scored 6.0",
        "scoreText": "6.0",
        "score10": 6,
        "positive": "The location was ideal",
        "negative": "For a double queen room for $500 you would think it would’ve been nice and cozy. Instead, it felt like you were in a prison cell - bare concrete walls, no art on the walls, black metal piping for everything from including hanging window curtains. It was just sad",
        "body": "The location was ideal\nFor a double queen room for $500 you would think it would’ve been nice and cozy. Instead, it felt like you were in a prison cell - bare concrete walls, no art on the walls, black metal piping for everything from including hanging window curtains. It was just sad"
      },
      {
        "reviewer": "Woodards",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Queen + Twin Loft",
        "stay": "1 night · March 2024",
        "guestType": "Couple",
        "reviewed": "March 19, 2024",
        "title": "Nice but quality of room did not refelct the price",
        "scoredLabel": "Scored 7.0",
        "scoreText": "7.0",
        "score10": 7,
        "positive": "Terrific location and a modern hotel with lots of amenities.",
        "negative": "Room was way too small. Almost too Boutiquey. No privacy for the sink or storage for essentials like toothbrush etc.",
        "body": "Terrific location and a modern hotel with lots of amenities.\nRoom was way too small. Almost too Boutiquey. No privacy for the sink or storage for essentials like toothbrush etc."
      },
      {
        "reviewer": "Wendy",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Queen + Twin Loft",
        "stay": "2 nights · March 2024",
        "guestType": "Solo traveler",
        "reviewed": "March 16, 2024",
        "title": "Not great value for money",
        "scoredLabel": "Scored 6.0",
        "scoreText": "6.0",
        "score10": 6,
        "positive": "Beautiful hotel, friendly staff, great location.\nI can’t tell you how many times I knocked my head into the useless bunk bed in a room that was meant for one or two people (there’s a double bed too, this was the only room that was available when I booked). I would have preferred to have a table to put my laptop on and a comfortable chair there.\nThere’s no extra safety lock on the door, which made me feel unsafe (my hotel room has been broken into before with a key at another four star hotel).\nThere’s no light in the shower, so you’re essentially showering in the dark. There’s no toilet brush. There’s hardly any space for toiletries. There’s no recycling bin so I guess everything goes into the trash and this hotel was supposed to be ‘travel sustainable level 1’?\nI was never offered the complimentary token for a drink that apparently I was supposed to get when I checked in. The fridge wasn’t cold. They took a $100 deposit, why? Because I, a 54 year old woman who’s here to see an art exhibition, am going to trash the room? Also, $100 isn’t going to cover that, so it just ends up pissing people off. Hopefully I’ll get it back ‘in a few days’…\nAll of these things are not an absolute disaster, but the price I paid doesn’t reflect the level of luxury and amenities that I would expect for that kind of money ($267 a night). This more like a three star $150 a night type of place.",
        "negative": "A bunk bed or bunk beds in a room at The Robey, Chicago, a Member of Design Hotels",
        "body": "Beautiful hotel, friendly staff, great location.\nI can’t tell you how many times I knocked my head into the useless bunk bed in a room that was meant for one or two people (there’s a double bed too, this was the only room that was available when I booked). I would have preferred to have a table to put my laptop on and a comfortable chair there.\nThere’s no extra safety lock on the door, which made me feel unsafe (my hotel room has been broken into before with a key at another four star hotel).\nThere’s no light in the shower, so you’re essentially showering in the dark. There’s no toilet brush. There’s hardly any space for toiletries. There’s no recycling bin so I guess everything goes into the trash and this hotel was supposed to be ‘travel sustainable level 1’?\nI was never offered the complimentary token for a drink that apparently I was supposed to get when I checked in. The fridge wasn’t cold. They took a $100 deposit, why? Because I, a 54 year old woman who’s here to see an art exhibition, am going to trash the room? Also, $100 isn’t going to cover that, so it just ends up pissing people off. Hopefully I’ll get it back ‘in a few days’…\nAll of these things are not an absolute disaster, but the price I paid doesn’t reflect the level of luxury and amenities that I would expect for that kind of money ($267 a night). This more like a three star $150 a night type of place.\nA bunk bed or bunk beds in a room at The Robey, Chicago, a Member of Design Hotels"
      },
      {
        "reviewer": "Elizabeth",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Queen Room",
        "stay": "2 nights · September 2023",
        "guestType": "Couple",
        "reviewed": "September 27, 2023",
        "title": "Good",
        "scoredLabel": "Scored 7.0",
        "scoreText": "7.0",
        "score10": 7,
        "positive": "Overall, the location of the hotel is perfect. So many restaurants, bars and shops in walkable distance. The train is also right there so getting to the loop was really fast! The view from the room was incredible as well.",
        "negative": "The amenities at the hotel were a little disappointing. We had planned to use the pool and roof deck, but both were closed for the entire time we were there without notifying guests beforehand (not a mechanical issue/ closed for private events all day). I felt like the price of the room was so high because of the amenities, and we were unable to use any. The room is very basic, not lux at all, so this was a little disappointing. You are really paying for the location.",
        "body": "Overall, the location of the hotel is perfect. So many restaurants, bars and shops in walkable distance. The train is also right there so getting to the loop was really fast! The view from the room was incredible as well.\nThe amenities at the hotel were a little disappointing. We had planned to use the pool and roof deck, but both were closed for the entire time we were there without notifying guests beforehand (not a mechanical issue/ closed for private events all day). I felt like the price of the room was so high because of the amenities, and we were unable to use any. The room is very basic, not lux at all, so this was a little disappointing. You are really paying for the location."
      }
    ],
    "the-emily-hotel": [
      {
        "reviewer": "Emma",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "1 night · April 2026",
        "guestType": "Couple",
        "reviewed": "May 31, 2026",
        "title": "Great service location and coffee downstairs",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location",
        "negative": "Cant think of anything",
        "body": "Great location\nCant think of anything"
      },
      {
        "reviewer": "Julie",
        "activeSince": "Active since 2019",
        "country": "Indonesia",
        "room": "Medium",
        "stay": "2 nights · May 2026",
        "guestType": "Group",
        "reviewed": "May 20, 2026",
        "title": "Exceptional. One of the best stay we ever had.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything. But top of the line is the location, close to many restaurants and cafes and how Personalized the service was. Their attention to detail was exceptional. And they really were helpful in giving their best effort in attending to our request. The room was clean and neat.",
        "negative": "Nothing",
        "body": "Everything. But top of the line is the location, close to many restaurants and cafes and how Personalized the service was. Their attention to detail was exceptional. And they really were helpful in giving their best effort in attending to our request. The room was clean and neat.\nNothing"
      },
      {
        "reviewer": "Josephine",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Double",
        "stay": "4 nights · March 2026",
        "guestType": "Family",
        "reviewed": "March 13, 2026",
        "title": "Wonderful stay!!",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Multiple options for lighting",
        "negative": "All good",
        "body": "Multiple options for lighting\nAll good"
      },
      {
        "reviewer": "Tabatha",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Medium",
        "stay": "2 nights · March 2026",
        "guestType": "Couple",
        "reviewed": "March 12, 2026",
        "title": "Great",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location",
        "negative": "Very modern",
        "body": "Location\nVery modern"
      },
      {
        "reviewer": "Grace",
        "activeSince": "Active since 2026",
        "country": "United States",
        "room": "Double",
        "stay": "1 night · March 2026",
        "guestType": "Group",
        "reviewed": "March 11, 2026",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The hotel was clean, in a central location, and offered great amenities, especially for young adults. The hotel restaurant and bar had a nice crowd but weren't overcrowded. The room was perfectly comfortable with ample space for two people. While sparsely decorated, the Bluetooth speaker was a nice touch, and the robes were comfortable.",
        "negative": "The air conditioner was finicky and turned off in the middle of the night. The coffee bar was oddly stocked, but otherwise we loved it.",
        "body": "The hotel was clean, in a central location, and offered great amenities, especially for young adults. The hotel restaurant and bar had a nice crowd but weren't overcrowded. The room was perfectly comfortable with ample space for two people. While sparsely decorated, the Bluetooth speaker was a nice touch, and the robes were comfortable.\nThe air conditioner was finicky and turned off in the middle of the night. The coffee bar was oddly stocked, but otherwise we loved it."
      },
      {
        "reviewer": "Antione",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Medium",
        "stay": "1 night · February 2026",
        "guestType": "Family",
        "reviewed": "February 18, 2026",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Wonderful amenities. Friendly staff.",
        "negative": "",
        "body": "Wonderful amenities. Friendly staff."
      },
      {
        "reviewer": "Jahnabi",
        "activeSince": "",
        "country": "United States",
        "room": "Medium",
        "stay": "2 nights · January 2026",
        "guestType": "Group",
        "reviewed": "January 17, 2026",
        "title": "Excellent place for work stay and be able to relax after the day is over.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The fitness studio was excellent. I could do my workouts each day.",
        "negative": "It was annoying to keep doing the wifi for each day you were there. The wifi should work for all they time you are there without having to keep updating it.",
        "body": "The fitness studio was excellent. I could do my workouts each day.\nIt was annoying to keep doing the wifi for each day you were there. The wifi should work for all they time you are there without having to keep updating it."
      },
      {
        "reviewer": "Carey",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "2 nights · December 2025",
        "guestType": "Couple",
        "reviewed": "January 17, 2026",
        "title": "Simple luxury at an affordable price!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "This was our first Christmas trip to Chicago and we needed to find a hotel that was close to where our kids live. The Emily fit the bill perfectly! The location in the West Loop/Fulton Market was really fun - lots of restaurants, bars and shopping are very close by. The hotel is lovely and the room - a deluxe king - was very nice. I did find the bed to be a bit too firm for my liking and had a dickens of a time trying to get the room cool enough for a good night's sleep. Despite those two hiccups, I would still recommend this lovely hotel to all travelers coming to the West Loop/Fulton Market area.",
        "negative": "Beds a bit on the firm side.",
        "body": "This was our first Christmas trip to Chicago and we needed to find a hotel that was close to where our kids live. The Emily fit the bill perfectly! The location in the West Loop/Fulton Market was really fun - lots of restaurants, bars and shopping are very close by. The hotel is lovely and the room - a deluxe king - was very nice. I did find the bed to be a bit too firm for my liking and had a dickens of a time trying to get the room cool enough for a good night's sleep. Despite those two hiccups, I would still recommend this lovely hotel to all travelers coming to the West Loop/Fulton Market area.\nBeds a bit on the firm side."
      },
      {
        "reviewer": "Qiuyi",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Double",
        "stay": "2 nights · December 2025",
        "guestType": "Couple",
        "reviewed": "December 15, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The room was EXTREMELY clean and quiet.",
        "negative": "",
        "body": "The room was EXTREMELY clean and quiet."
      },
      {
        "reviewer": "Amy",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Medium",
        "stay": "1 night · November 2025",
        "guestType": "Couple",
        "reviewed": "December 10, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Wonderful location, walkable to lots of restaurants and things to do. The room felt modern yet functional. They provided us with a crib and baby soap which we thought was a nice touch for those traveling with a baby!",
        "negative": "",
        "body": "Wonderful location, walkable to lots of restaurants and things to do. The room felt modern yet functional. They provided us with a crib and baby soap which we thought was a nice touch for those traveling with a baby!"
      },
      {
        "reviewer": "Lonna",
        "activeSince": "Active since 2011",
        "country": "United States",
        "room": "Double",
        "stay": "2 nights · July 2025",
        "guestType": "Family",
        "reviewed": "July 22, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "We loved the modern minimalist vibe of the decor. The service and amenities of the hotel were excellent! Enjoyed the rooftop movie night on the hotel roof. (Definitely check it out if you are there in the summer). The location is great for restaurants and touring downtown sites. Highly recommend!",
        "negative": "Everything was excellent.",
        "body": "We loved the modern minimalist vibe of the decor. The service and amenities of the hotel were excellent! Enjoyed the rooftop movie night on the hotel roof. (Definitely check it out if you are there in the summer). The location is great for restaurants and touring downtown sites. Highly recommend!\nEverything was excellent."
      },
      {
        "reviewer": "Joseph",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Double",
        "stay": "1 night · July 2025",
        "guestType": "Couple",
        "reviewed": "July 21, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Exceptionally clean, comfortable, and hospitable hotel located in the heart of the West Loop Fulton Market neighborhood. I was impressed with the friendliness and overall accommodating nature of the staff.",
        "negative": "",
        "body": "Exceptionally clean, comfortable, and hospitable hotel located in the heart of the West Loop Fulton Market neighborhood. I was impressed with the friendliness and overall accommodating nature of the staff."
      },
      {
        "reviewer": "Mindi",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Double",
        "stay": "2 nights · June 2025",
        "guestType": "Group",
        "reviewed": "July 10, 2025",
        "title": "Great location, great stay and awesome restaurant",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great loc, great food, great room - loved the mini bar",
        "negative": "all was great!",
        "body": "Great loc, great food, great room - loved the mini bar\nall was great!"
      },
      {
        "reviewer": "Anne",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Large",
        "stay": "1 night · April 2025",
        "guestType": "Couple",
        "reviewed": "April 27, 2025",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Trendy space - close to Fulton market, city stay but quiet.",
        "negative": "Bed could be better for this price. Pillows were great!",
        "body": "Trendy space - close to Fulton market, city stay but quiet.\nBed could be better for this price. Pillows were great!"
      },
      {
        "reviewer": "James",
        "activeSince": "Active since 2013",
        "country": "United Kingdom",
        "room": "Standard King Room",
        "stay": "4 nights · April 2025",
        "guestType": "Couple",
        "reviewed": "April 22, 2025",
        "title": "Cool hotel in great location",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Very cool hotel in a fantastic location in West Loop. Surrounded by lots of cool cafes, bars and restaurants and just a short metro ride into the city centre.",
        "negative": "Nothing - everything was great",
        "body": "Very cool hotel in a fantastic location in West Loop. Surrounded by lots of cool cafes, bars and restaurants and just a short metro ride into the city centre.\nNothing - everything was great"
      },
      {
        "reviewer": "Rod",
        "activeSince": "Active since 2016",
        "country": "Australia",
        "room": "Double",
        "stay": "3 nights · March 2025",
        "guestType": "Group",
        "reviewed": "April 1, 2025",
        "title": "Great hotel. 10/10",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything was great!!",
        "negative": "",
        "body": "Everything was great!!"
      },
      {
        "reviewer": "Karilee",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "1 night · March 2025",
        "guestType": "Couple",
        "reviewed": "March 24, 2025",
        "title": "Very friendly staff, really nice hotel with a good vibe.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Very modern and nice looking",
        "negative": "",
        "body": "Very modern and nice looking"
      },
      {
        "reviewer": "Louisa",
        "activeSince": "Active since 2015",
        "country": "Australia",
        "room": "Standard King Room",
        "stay": "2 nights · February 2025",
        "guestType": "Family",
        "reviewed": "February 10, 2025",
        "title": "Highly recommended for a trendy Chicago experience",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Amazing all round experience. Leo and the reception team were very friendly and professional. Great gym, I feel like it's under utilised down there, but was perfect for me. Loved the in-room coffee and even the train noises weren't too disruptive! Will recommend.",
        "negative": "Pricing was too high for my budget on Monday/ Tuesday nights, otherwise I would have enjoyed staying longer.",
        "body": "Amazing all round experience. Leo and the reception team were very friendly and professional. Great gym, I feel like it's under utilised down there, but was perfect for me. Loved the in-room coffee and even the train noises weren't too disruptive! Will recommend.\nPricing was too high for my budget on Monday/ Tuesday nights, otherwise I would have enjoyed staying longer."
      },
      {
        "reviewer": "Andrea",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Medium",
        "stay": "3 nights · January 2025",
        "guestType": "Couple",
        "reviewed": "January 22, 2025",
        "title": "Perfect Location for Exploring the West Loop",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The hotel is very nice and we loved the location for some amazing cocktail bars and restaurants. The Fulton Market area is all around you and it is very close to the train and not far from The United Center. We had some great cocktails at Fora. We tried to go to Selva but it was not open when we were free to go. The room was nice and plenty of room to store luggage.",
        "negative": "The pillows were very flat and uncomfortable. There are no USB plugs anywhere in the room, make sure you have plug adapters!",
        "body": "The hotel is very nice and we loved the location for some amazing cocktail bars and restaurants. The Fulton Market area is all around you and it is very close to the train and not far from The United Center. We had some great cocktails at Fora. We tried to go to Selva but it was not open when we were free to go. The room was nice and plenty of room to store luggage.\nThe pillows were very flat and uncomfortable. There are no USB plugs anywhere in the room, make sure you have plug adapters!"
      },
      {
        "reviewer": "Michael",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "2 nights · December 2024",
        "guestType": "Couple",
        "reviewed": "January 7, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Room was great and in a great location.",
        "negative": "Parking cost was 1/2 the cost of the room",
        "body": "Room was great and in a great location.\nParking cost was 1/2 the cost of the room"
      },
      {
        "reviewer": "Not helpfulBozena",
        "activeSince": "Active since 2013",
        "country": "Ireland",
        "room": "Medium",
        "stay": "3 nights · October 2024",
        "guestType": "Couple",
        "reviewed": "October 18, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Excellent room, service and location.",
        "negative": "",
        "body": "Excellent room, service and location."
      },
      {
        "reviewer": "Katie",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "2 nights · October 2024",
        "guestType": "Couple",
        "reviewed": "October 13, 2024",
        "title": "Overall a great stay",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location and beautifully decorated, nice size rooms",
        "negative": "Uncomfortable pillows and bed",
        "body": "Great location and beautifully decorated, nice size rooms\nUncomfortable pillows and bed"
      },
      {
        "reviewer": "Giovanni",
        "activeSince": "Active since 2013",
        "country": "Italy",
        "room": "Double",
        "stay": "5 nights · October 2024",
        "guestType": "Solo traveler",
        "reviewed": "October 6, 2024",
        "title": "lovely staying",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "great contemporary design",
        "negative": "nice coffee bar open since early morning",
        "body": "great contemporary design\nnice coffee bar open since early morning"
      },
      {
        "reviewer": "Barbara",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Double",
        "stay": "1 night · August 2024",
        "guestType": "Couple",
        "reviewed": "September 21, 2024",
        "title": "Nice stay in cool area of Chicago",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great location. Nice front desk staff. Good food on patio. Nice coffee bar.",
        "negative": "Bed was very hard and uncomfortable. Sometimes the music in the lobby was a bit loud.",
        "body": "Great location. Nice front desk staff. Good food on patio. Nice coffee bar.\nBed was very hard and uncomfortable. Sometimes the music in the lobby was a bit loud."
      },
      {
        "reviewer": "Gordon",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Medium",
        "stay": "2 nights · September 2024",
        "guestType": "Couple",
        "reviewed": "September 8, 2024",
        "title": "If mattresses were better quality we would give this property a higher rating.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Good location, Attractive lobby and fun restaurant/bar, accommodating and friendly staff, spacious and attractive room.",
        "negative": "The bed was hard and uncomfortable and the linens had an unpleasant scent.",
        "body": "Good location, Attractive lobby and fun restaurant/bar, accommodating and friendly staff, spacious and attractive room.\nThe bed was hard and uncomfortable and the linens had an unpleasant scent."
      },
      {
        "reviewer": "Paris",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "2 nights · August 2024",
        "guestType": "Group",
        "reviewed": "August 30, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Staff was very friendly and helpful. Room was amazing very clean and put together.",
        "negative": "N/A",
        "body": "Staff was very friendly and helpful. Room was amazing very clean and put together.\nN/A"
      },
      {
        "reviewer": "Michael",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Double",
        "stay": "3 nights · August 2024",
        "guestType": "Group",
        "reviewed": "August 8, 2024",
        "title": "Would definitely recommend the Emily hotel and Edson/edison was awesome with the recommendations",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything about this property was amazing!",
        "negative": "Only thing I would ask for is a microwave and a fully available fridge (not one that’s full of stuff already)",
        "body": "Everything about this property was amazing!\nOnly thing I would ask for is a microwave and a fully available fridge (not one that’s full of stuff already)"
      },
      {
        "reviewer": "Andrew",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Double",
        "stay": "2 nights · August 2024",
        "guestType": "Group",
        "reviewed": "August 5, 2024",
        "title": "Great hotel in a great location for convenience to the West Loop. Clean, comfy and great staff. Highly recommend.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Very convenient location if you want to be close to all that the West Loop offers. Beds were comfy and facilities very clean. Staff were very helpful.",
        "negative": "Nothing",
        "body": "Very convenient location if you want to be close to all that the West Loop offers. Beds were comfy and facilities very clean. Staff were very helpful.\nNothing"
      },
      {
        "reviewer": "Torres",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Medium",
        "stay": "3 nights · June 2024",
        "guestType": "Couple",
        "reviewed": "July 11, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Very clean, good location",
        "negative": "Expensive",
        "body": "Very clean, good location\nExpensive"
      },
      {
        "reviewer": "Jason",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "1 night · July 2024",
        "guestType": "Couple",
        "reviewed": "July 6, 2024",
        "title": "Excellent time and very comfortable",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location for activities.",
        "negative": "Nothing",
        "body": "Location for activities.\nNothing"
      },
      {
        "reviewer": "Continue readingDana",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Double",
        "stay": "1 night · May 2024",
        "guestType": "Family",
        "reviewed": "May 30, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "There are so many restaurants near the hotel. Additionally, the hotel has much to offer with its rooftop theater, restaurant and cafe on site.",
        "negative": "",
        "body": "There are so many restaurants near the hotel. Additionally, the hotel has much to offer with its rooftop theater, restaurant and cafe on site."
      },
      {
        "reviewer": "Beth",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Medium",
        "stay": "1 night · February 2024",
        "guestType": "Couple",
        "reviewed": "May 19, 2024",
        "title": "Great location",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great location",
        "negative": "Pricey for small space",
        "body": "Great location\nPricey for small space"
      },
      {
        "reviewer": "Paula",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "1 night · May 2024",
        "guestType": "Couple",
        "reviewed": "May 12, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Simple and clean with super friendly staff",
        "negative": "",
        "body": "Simple and clean with super friendly staff"
      },
      {
        "reviewer": "Kathryn",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "4 nights · May 2024",
        "guestType": "Couple",
        "reviewed": "May 6, 2024",
        "title": "Excellent Location, Rooms Could Use a Little More Practicality",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location! Loved the ease from which I could get from the airport to the hotel and access the transit system in general without needing to rent a car. Tons of amazing restaurants in the area and super close and easy to get to downtown. Rooms are very clean and the beds are comfortable.",
        "negative": "There is no coffee maker in the room, you have to go purchase it from their cafe downstairs each day. Additionally, the rooms are lacking in shelf space with no drawers and limited hangers supplied, so it did feel like I couldn't fully unpack throughout my stay. Also, the fridge is full of items you can purchase, but this leaves barely any room to use the fridge for any personal items you may bring in.",
        "body": "Great location! Loved the ease from which I could get from the airport to the hotel and access the transit system in general without needing to rent a car. Tons of amazing restaurants in the area and super close and easy to get to downtown. Rooms are very clean and the beds are comfortable.\nThere is no coffee maker in the room, you have to go purchase it from their cafe downstairs each day. Additionally, the rooms are lacking in shelf space with no drawers and limited hangers supplied, so it did feel like I couldn't fully unpack throughout my stay. Also, the fridge is full of items you can purchase, but this leaves barely any room to use the fridge for any personal items you may bring in."
      },
      {
        "reviewer": "Belle",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "2 nights · April 2024",
        "guestType": "Family",
        "reviewed": "April 24, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location, walkable to shops restaurants and the train",
        "negative": "",
        "body": "Great location, walkable to shops restaurants and the train"
      },
      {
        "reviewer": "Kali",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Double",
        "stay": "1 night · April 2024",
        "guestType": "Group",
        "reviewed": "April 21, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Very modern and clean.",
        "negative": "",
        "body": "Very modern and clean."
      },
      {
        "reviewer": "Alert",
        "activeSince": "Active since 2011",
        "country": "Israel",
        "room": "Double",
        "stay": "6 nights · February 2024",
        "guestType": "Solo traveler",
        "reviewed": "March 30, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Stylish, convenient and overall high quality. Including restaurants and caffe.",
        "negative": "",
        "body": "Stylish, convenient and overall high quality. Including restaurants and caffe."
      },
      {
        "reviewer": "Logan",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Double",
        "stay": "1 night · March 2024",
        "guestType": "Group",
        "reviewed": "March 23, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location was excellent for where I need d to be in the city. Staff was super friendly and responsive. The room was clean and comfortable. All for a price that was cheaper than other hotels in the area.",
        "negative": "",
        "body": "Location was excellent for where I need d to be in the city. Staff was super friendly and responsive. The room was clean and comfortable. All for a price that was cheaper than other hotels in the area."
      },
      {
        "reviewer": "Tenoch",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "1 night · March 2024",
        "guestType": "Couple",
        "reviewed": "March 2, 2024",
        "title": "Excellent spot, great value",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The overall vibe was amazing and having a restaurant downstairs was super convenient. The room was cozy and had everything we needed.",
        "negative": "There was not a lot of sound privacy. It felt like you could hear everything going on in the hallway outside",
        "body": "The overall vibe was amazing and having a restaurant downstairs was super convenient. The room was cozy and had everything we needed.\nThere was not a lot of sound privacy. It felt like you could hear everything going on in the hallway outside"
      },
      {
        "reviewer": "Catalina",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "2 nights · February 2024",
        "guestType": "Solo traveler",
        "reviewed": "February 20, 2024",
        "title": "Good hotel for a quick business trip",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location and staff were great. Greeted by chocolate strawberries for Valentine’s Day. Bed was clean and comfortable",
        "negative": "Rooms are a little dark. Water pressure on the shower was a bit weak.",
        "body": "Location and staff were great. Greeted by chocolate strawberries for Valentine’s Day. Bed was clean and comfortable\nRooms are a little dark. Water pressure on the shower was a bit weak."
      },
      {
        "reviewer": "Continue readingKathryn",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "1 night · December 2023",
        "guestType": "Couple",
        "reviewed": "December 28, 2023",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location, wonderful staff, comfortable room.",
        "negative": "Dog fee is really expensive ($100), bath tub is difficult to get in and out of for short people.",
        "body": "Great location, wonderful staff, comfortable room.\nDog fee is really expensive ($100), bath tub is difficult to get in and out of for short people."
      },
      {
        "reviewer": "John",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "3 nights · November 2023",
        "guestType": "Couple",
        "reviewed": "November 26, 2023",
        "title": "It was a very positive and comfortable experience.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location in West Loop. Near family and great restaurants. Very clean and affordable for Thanksgiving weekend. Staff were cheerful and very helpful. Highly recommend.",
        "negative": "",
        "body": "Great location in West Loop. Near family and great restaurants. Very clean and affordable for Thanksgiving weekend. Staff were cheerful and very helpful. Highly recommend."
      },
      {
        "reviewer": "Christienne",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Double",
        "stay": "2 nights · October 2023",
        "guestType": "Group",
        "reviewed": "November 26, 2023",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Really nice",
        "negative": "",
        "body": "Really nice"
      },
      {
        "reviewer": "Katherine",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "3 nights · November 2023",
        "guestType": "Couple",
        "reviewed": "November 6, 2023",
        "title": "The friendliness of the staff enabled all of our nervous concerns to disappear. So helpful & kind!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "We actually didn't have breakfast, but we did linger with guests in your lobby with coffee, etc from the coffee shop. Wonderful!",
        "negative": "I truly enjoyed my stay.",
        "body": "We actually didn't have breakfast, but we did linger with guests in your lobby with coffee, etc from the coffee shop. Wonderful!\nI truly enjoyed my stay."
      },
      {
        "reviewer": "James",
        "activeSince": "Active since 2015",
        "country": "United Kingdom",
        "room": "Standard King Room",
        "stay": "4 nights · October 2023",
        "guestType": "Couple",
        "reviewed": "October 13, 2023",
        "title": "New hotel with a great atmosphere and facilities",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The Emily felt new and was very clean and tidy. The hotel had a great atmosphere, nice restaurant, coffee shop, and a rooftop cinema! The hotel is opposite the Google office in Fulton Market, which felt like an up and coming area of Chicago.",
        "negative": "",
        "body": "The Emily felt new and was very clean and tidy. The hotel had a great atmosphere, nice restaurant, coffee shop, and a rooftop cinema! The hotel is opposite the Google office in Fulton Market, which felt like an up and coming area of Chicago."
      },
      {
        "reviewer": "Ivan",
        "activeSince": "Active since 2021",
        "country": "United Kingdom",
        "room": "Large",
        "stay": "4 nights · September 2023",
        "guestType": "Couple",
        "reviewed": "September 30, 2023",
        "title": "Great hotel, great location, great staff and very good value for money",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location near the city centre, restaurants and bars. Bed was super comfortable, great gym, rooftop cinema and bars in the actual hotel. Great value for money.",
        "negative": "In rook refreshments and snacks are expensive. Water should be free at least. TV wasn't good, no Netflix or anything, doesn't sync via screen mirroring with iPhones. Good thing I brought my Google TV otherwise it would have been a bit boring sitting in the room. Wifi also doesn't sync well with my Chromecast so had to use hotspot.",
        "body": "Great location near the city centre, restaurants and bars. Bed was super comfortable, great gym, rooftop cinema and bars in the actual hotel. Great value for money.\nIn rook refreshments and snacks are expensive. Water should be free at least. TV wasn't good, no Netflix or anything, doesn't sync via screen mirroring with iPhones. Good thing I brought my Google TV otherwise it would have been a bit boring sitting in the room. Wifi also doesn't sync well with my Chromecast so had to use hotspot."
      },
      {
        "reviewer": "Tyler",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Large",
        "stay": "2 nights · September 2023",
        "guestType": "Solo traveler",
        "reviewed": "September 8, 2023",
        "title": "the Emily hotel is always a great place to stay. The staff is great, the accommodation are top notch",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "location is great. style of hotel is perfect!",
        "negative": "",
        "body": "location is great. style of hotel is perfect!"
      },
      {
        "reviewer": "Beth",
        "activeSince": "Active since 2018",
        "country": "Netherlands",
        "room": "Large",
        "stay": "3 nights · August 2023",
        "guestType": "Solo traveler",
        "reviewed": "August 30, 2023",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Sleek, modern, and spacious rooms. Friendly staff and nice amenities.",
        "negative": "",
        "body": "Sleek, modern, and spacious rooms. Friendly staff and nice amenities."
      },
      {
        "reviewer": "B",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "1 night · August 2023",
        "guestType": "Couple",
        "reviewed": "August 17, 2023",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location, staff, amenities",
        "negative": "Shower drain backed up (you would expect housekeeping or engineering would have noticed this and addressed it before another guest (us) had to experience it. Also, a couple of outlets did not work properly, again the expectation is for a proactive approach to these kinds of things.",
        "body": "Location, staff, amenities\nShower drain backed up (you would expect housekeeping or engineering would have noticed this and addressed it before another guest (us) had to experience it. Also, a couple of outlets did not work properly, again the expectation is for a proactive approach to these kinds of things."
      },
      {
        "reviewer": "Sally",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Double",
        "stay": "1 night · July 2023",
        "guestType": "Family",
        "reviewed": "July 5, 2023",
        "title": "Nice hotel in up and coming neighborhood",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Close to restaurants and public transportation. Comfy beds.",
        "negative": "Sink is outside the bathroom and lighting makes it hard to do make-up. Very dark.",
        "body": "Close to restaurants and public transportation. Comfy beds.\nSink is outside the bathroom and lighting makes it hard to do make-up. Very dark."
      },
      {
        "reviewer": "Lukas",
        "activeSince": "Active since 2014",
        "country": "United Kingdom",
        "room": "Medium",
        "stay": "3 nights · October 2025",
        "guestType": "Solo traveler",
        "reviewed": "November 4, 2025",
        "title": "Great hotel in Chicago",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Nice, clean and in a very good neighbourhood\nRooms are spacious and overall very comfortable. M&G products in the shower are a great touch!",
        "negative": "Rather pricey and none of the bars/restaurants were available due to numerous private events. Sort of defeats the purpose of hotel bar/restaurant",
        "body": "Nice, clean and in a very good neighbourhood\nRooms are spacious and overall very comfortable. M&G products in the shower are a great touch!\nRather pricey and none of the bars/restaurants were available due to numerous private events. Sort of defeats the purpose of hotel bar/restaurant"
      },
      {
        "reviewer": "Yves",
        "activeSince": "Active since 2019",
        "country": "Netherlands",
        "room": "Standard King Room",
        "stay": "2 nights · August 2025",
        "guestType": "Solo traveler",
        "reviewed": "October 29, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "It is very close to the L trains, and the staff on Thursday evening warmly welcomed me. The interior of the hotel is probably one of the best among the boutique hotels in town! The room was very clean and comfortable, and there was a very cute little radio in the room.",
        "negative": "The surrounding neighborhood or a neighborhood close to the hotel",
        "body": "It is very close to the L trains, and the staff on Thursday evening warmly welcomed me. The interior of the hotel is probably one of the best among the boutique hotels in town! The room was very clean and comfortable, and there was a very cute little radio in the room.\nThe surrounding neighborhood or a neighborhood close to the hotel"
      },
      {
        "reviewer": "Mathew",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Medium",
        "stay": "1 night · August 2025",
        "guestType": "Couple",
        "reviewed": "October 19, 2025",
        "title": "Great hotel definitely stay again",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great staff, excellent location",
        "negative": "Nothing",
        "body": "Great staff, excellent location\nNothing"
      },
      {
        "reviewer": "Nita",
        "activeSince": "Active since 2016",
        "country": "United Kingdom",
        "room": "Double",
        "stay": "3 nights · October 2025",
        "guestType": "Family",
        "reviewed": "October 17, 2025",
        "title": "Great stay of you wish to be in a place where there are great restaurants!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location",
        "negative": "Was noisy on Friday night plus AC was loud",
        "body": "Great location\nWas noisy on Friday night plus AC was loud"
      },
      {
        "reviewer": "Sandrine",
        "activeSince": "Active since 2021",
        "country": "Netherlands",
        "room": "Double",
        "stay": "5 nights · October 2025",
        "guestType": "Family",
        "reviewed": "October 15, 2025",
        "title": "Perfect stay in Chicago to participate in the Marathon",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Excellent location ! Friendly staff. Nice room although could benefit from having a little bit more space to store luggage and clothes.",
        "negative": "Chris, the dining manager went above and beyond ! I had an important board meeting and he kindly put the private dining room at my disposal at 6:00am in the morning ! Thank you Chris 😎",
        "body": "Excellent location ! Friendly staff. Nice room although could benefit from having a little bit more space to store luggage and clothes.\nChris, the dining manager went above and beyond ! I had an important board meeting and he kindly put the private dining room at my disposal at 6:00am in the morning ! Thank you Chris 😎"
      },
      {
        "reviewer": "Peter",
        "activeSince": "Active since 2017",
        "country": "United Kingdom",
        "room": "Standard King Room",
        "stay": "3 nights · October 2025",
        "guestType": "Couple",
        "reviewed": "October 14, 2025",
        "title": "Well located smart hotel, excellent base for exploring the city.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Smart hotel with clean rooms, decent coffee bags in room, coffee shop below and in a nice area for food/drink/shopping and access to the city centre and airport.",
        "negative": "Quite a bit of fri/sat night street noise - so bring earplugs.",
        "body": "Smart hotel with clean rooms, decent coffee bags in room, coffee shop below and in a nice area for food/drink/shopping and access to the city centre and airport.\nQuite a bit of fri/sat night street noise - so bring earplugs."
      },
      {
        "reviewer": "Kelly",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Medium",
        "stay": "1 night · September 2025",
        "guestType": "Couple",
        "reviewed": "September 28, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location",
        "negative": "N/A",
        "body": "Location\nN/A"
      },
      {
        "reviewer": "Dvorak",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Double",
        "stay": "1 night · September 2025",
        "guestType": "Group",
        "reviewed": "September 25, 2025",
        "title": "Convenient location and nice rooms.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The rooms were beautiful, bathrooms were accessible and good water pressure in the shower. Very convenient location to the venue where we were attending a concert. Walkable area with a CVS, McDonalds, Train station, and Duncan Donuts nearby. The valet and staff were fantastic.",
        "negative": "The 2 rooms I booked together were on different floors, there was no free breakfast which I have grown accustomed to at other hotels. 80 a night for parking is a bit steep as well. I also didn't like the abundance of alcohol left in the mini bar. I was traveling with 20 year-olds who didn't need to be around that.",
        "body": "The rooms were beautiful, bathrooms were accessible and good water pressure in the shower. Very convenient location to the venue where we were attending a concert. Walkable area with a CVS, McDonalds, Train station, and Duncan Donuts nearby. The valet and staff were fantastic.\nThe 2 rooms I booked together were on different floors, there was no free breakfast which I have grown accustomed to at other hotels. 80 a night for parking is a bit steep as well. I also didn't like the abundance of alcohol left in the mini bar. I was traveling with 20 year-olds who didn't need to be around that."
      },
      {
        "reviewer": "Sandra",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Medium",
        "stay": "3 nights · September 2025",
        "guestType": "Couple",
        "reviewed": "September 20, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Located in a great neighborhood across the street from Google.",
        "negative": "Small coffee shop with limited menu and seating is the only breakfast option in the hotel.",
        "body": "Located in a great neighborhood across the street from Google.\nSmall coffee shop with limited menu and seating is the only breakfast option in the hotel."
      },
      {
        "reviewer": "Bindi",
        "activeSince": "Active since 2015",
        "country": "United Kingdom",
        "room": "Medium",
        "stay": "5 nights · August 2025",
        "guestType": "Couple",
        "reviewed": "September 5, 2025",
        "title": "Great place to stay!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Stayed in several places on our trip and this was by far the best. Great location, lovely room and great staff",
        "negative": "The fierce aircon in the public areas",
        "body": "Stayed in several places on our trip and this was by far the best. Great location, lovely room and great staff\nThe fierce aircon in the public areas"
      },
      {
        "reviewer": "Willliam",
        "activeSince": "Active since 2011",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "2 nights · December 2024",
        "guestType": "Couple",
        "reviewed": "January 3, 2025",
        "title": "Nice hotel with great location.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location",
        "negative": "We were two separate groups neither of our rooms was ready until 3:00. I realize that’s the check in time but prioritize room turn over for the people whose flights arrive early.",
        "body": "Location\nWe were two separate groups neither of our rooms was ready until 3:00. I realize that’s the check in time but prioritize room turn over for the people whose flights arrive early."
      },
      {
        "reviewer": "Paula",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Double",
        "stay": "1 night · December 2024",
        "guestType": "Group",
        "reviewed": "January 2, 2025",
        "title": "Unique West Loop Boutique Hotel! Rooms were quiet and comfortable.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Beautiful hotel located in the revitalized West Loop area of Chicago. Was heavily industrial area at one time, but now full of shopping a restaurants. I would consider this a boutique hotel, rooms are decent sized and have unique touches, like simple retro furniture, shelving and lighting. Walls are painted dark gray and add to the \"cozy\" feel of the room. The extra's like a fully stocked wine fridge and snacks available for purchase add a bit of \"luxury\" to the room. The room was super quiet even though our room was right over the outdoor patio. Great for couples or a girls weekend. Staff was super nice and helpful.",
        "negative": "I wished I could have stayed for more then one night. The price of this hotel is on the higher side and there are added fees like parking (if you want your vehicle parked on site) and the mini bar add if you choose to take advantage. For the money, staying one night is pretty pricey. There were other amenities offered by the hotel like a rooftop bar and movie theater which I hear are cool in the summer. But that should not deter anyone if you are looking to stay somewhere nice and enjoy some of Chicago's unique qualities.",
        "body": "Beautiful hotel located in the revitalized West Loop area of Chicago. Was heavily industrial area at one time, but now full of shopping a restaurants. I would consider this a boutique hotel, rooms are decent sized and have unique touches, like simple retro furniture, shelving and lighting. Walls are painted dark gray and add to the \"cozy\" feel of the room. The extra's like a fully stocked wine fridge and snacks available for purchase add a bit of \"luxury\" to the room. The room was super quiet even though our room was right over the outdoor patio. Great for couples or a girls weekend. Staff was super nice and helpful.\nI wished I could have stayed for more then one night. The price of this hotel is on the higher side and there are added fees like parking (if you want your vehicle parked on site) and the mini bar add if you choose to take advantage. For the money, staying one night is pretty pricey. There were other amenities offered by the hotel like a rooftop bar and movie theater which I hear are cool in the summer. But that should not deter anyone if you are looking to stay somewhere nice and enjoy some of Chicago's unique qualities."
      },
      {
        "reviewer": "Robin",
        "activeSince": "Active since 2012",
        "country": "United States",
        "room": "Medium",
        "stay": "2 nights · October 2024",
        "guestType": "Couple",
        "reviewed": "December 26, 2024",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Lovely boutique hotel. Nice lobby. Great location as super fun neighborhood.",
        "negative": "Small rooms and not much space to move around. Room we were given had essentially no view other than the prep kitchen for the place behind the restaurant.",
        "body": "Lovely boutique hotel. Nice lobby. Great location as super fun neighborhood.\nSmall rooms and not much space to move around. Room we were given had essentially no view other than the prep kitchen for the place behind the restaurant."
      },
      {
        "reviewer": "Denise",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Double",
        "stay": "1 night · December 2024",
        "guestType": "Family",
        "reviewed": "December 23, 2024",
        "title": "Perfect location, beautiful lobby.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Could not have asked for a better location! Two block walk to many amazing restaurants, and beautifully decorated.",
        "negative": "Bonus, if you’re there for the holidays it’s close to the Jack Frost pop up!",
        "body": "Could not have asked for a better location! Two block walk to many amazing restaurants, and beautifully decorated.\nBonus, if you’re there for the holidays it’s close to the Jack Frost pop up!"
      },
      {
        "reviewer": "Pat",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Medium",
        "stay": "1 night · December 2024",
        "guestType": "Family",
        "reviewed": "December 22, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Nice common areas - great location. Very clean.",
        "negative": "The bed was a bit too firm. The bedding was not as luxurious as I would have expected at a swanky hotel",
        "body": "Nice common areas - great location. Very clean.\nThe bed was a bit too firm. The bedding was not as luxurious as I would have expected at a swanky hotel"
      },
      {
        "reviewer": "Mcbarry",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "1 night · December 2024",
        "guestType": "Group",
        "reviewed": "December 9, 2024",
        "title": "Great location!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "I loved being located in the Fulton Market area, but on a quieter street. Everything was walkable that we needed. The room was comfortable and bigger than I expected for a city room. Perfect for my needs! Wish I got to stay more than one night.",
        "negative": "Nothing! Really enjoyed the property.",
        "body": "I loved being located in the Fulton Market area, but on a quieter street. Everything was walkable that we needed. The room was comfortable and bigger than I expected for a city room. Perfect for my needs! Wish I got to stay more than one night.\nNothing! Really enjoyed the property."
      },
      {
        "reviewer": "Jaime",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "2 nights · November 2024",
        "guestType": "Couple",
        "reviewed": "December 6, 2024",
        "title": "Just where and what we wanted. We'll be back!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "We walked or took the train everywhere from the hotel. Perfect location with lots of food and drinks right around the corner. Also went to the United Center and it was a quick 5 min train ride! Room was big, clean, perfect, quiet, and worth the price.",
        "negative": "Would have liked an actual coffee pot and tiny microwave in the room.",
        "body": "We walked or took the train everywhere from the hotel. Perfect location with lots of food and drinks right around the corner. Also went to the United Center and it was a quick 5 min train ride! Room was big, clean, perfect, quiet, and worth the price.\nWould have liked an actual coffee pot and tiny microwave in the room."
      },
      {
        "reviewer": "Chris",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Double",
        "stay": "3 nights · November 2024",
        "guestType": "Solo traveler",
        "reviewed": "November 29, 2024",
        "title": "Clean, great location, spacious, with a great rooftop bar.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The location is great. The room was spacious and the bed comfy.",
        "negative": "The room didn’t have any drawers for storage (aside from a closet). It was a room with two double beds and it was directly above the lobby floor so you could hear music.",
        "body": "The location is great. The room was spacious and the bed comfy.\nThe room didn’t have any drawers for storage (aside from a closet). It was a room with two double beds and it was directly above the lobby floor so you could hear music."
      },
      {
        "reviewer": "Zulema",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Medium",
        "stay": "1 night · November 2024",
        "guestType": "Couple",
        "reviewed": "November 28, 2024",
        "title": "Clean modern hotel in the heart of Fulton Market",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Rooms were clean, spacious, and stocked with everything you may need. The location is great as well.",
        "negative": "Although we were on the fourth floor (highest floor ir goes to) the window was facing the generators/vents on the roof. I’m not sure if the buzzing was coming from there but we had to ask for earplugs and front desk was able to provide those for us.",
        "body": "Rooms were clean, spacious, and stocked with everything you may need. The location is great as well.\nAlthough we were on the fourth floor (highest floor ir goes to) the window was facing the generators/vents on the roof. I’m not sure if the buzzing was coming from there but we had to ask for earplugs and front desk was able to provide those for us."
      },
      {
        "reviewer": "Charlotte",
        "activeSince": "Active since 2019",
        "country": "Switzerland",
        "room": "Medium",
        "stay": "3 nights · October 2024",
        "guestType": "Solo traveler",
        "reviewed": "October 26, 2024",
        "title": "Great place to stay in Chicago",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The Emily Hotel's location was great, super close to the subway to go to the more touristy areas, and the neighborhood was full of hip bars and restaurants.\nI stayed here for the Chicago marathon and has a super easy access to the event with the subway.\nThe staff was very nice, i got to store my luggage before check-in and after check-out.\nThe room was very spacious and clean and had many amenities.\nI got a welcome card with some snacks and water which was a very nice touch.\nThe only negatives were the view (I had a view over a ventilation system on which people where working so I kept the blinds closed) which didn't really matter as i was out exploring the city during the day and the lack of slippers (as I forgot to bring my all).\nAll in all I had a great experience and these two small negative points didn't really affect my trip.\nMost importantly, the room was super clean and the bed was extremely comfortable.",
        "negative": "Would definitely recommend!",
        "body": "The Emily Hotel's location was great, super close to the subway to go to the more touristy areas, and the neighborhood was full of hip bars and restaurants.\nI stayed here for the Chicago marathon and has a super easy access to the event with the subway.\nThe staff was very nice, i got to store my luggage before check-in and after check-out.\nThe room was very spacious and clean and had many amenities.\nI got a welcome card with some snacks and water which was a very nice touch.\nThe only negatives were the view (I had a view over a ventilation system on which people where working so I kept the blinds closed) which didn't really matter as i was out exploring the city during the day and the lack of slippers (as I forgot to bring my all).\nAll in all I had a great experience and these two small negative points didn't really affect my trip.\nMost importantly, the room was super clean and the bed was extremely comfortable.\nWould definitely recommend!"
      },
      {
        "reviewer": "Ingrid",
        "activeSince": "Active since 2010",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "1 night · May 2026",
        "guestType": "Solo traveler",
        "reviewed": "June 8, 2026",
        "title": "I would stay again.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Friendly Staff. Nice coffee shop. Comfortable room.",
        "negative": "Hope you’re an early riser. The very loud train starts coming through at 6am.",
        "body": "Friendly Staff. Nice coffee shop. Comfortable room.\nHope you’re an early riser. The very loud train starts coming through at 6am."
      },
      {
        "reviewer": "Emily",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Medium",
        "stay": "1 night · May 2026",
        "guestType": "Couple",
        "reviewed": "May 21, 2026",
        "title": "easy low-key stay in fulton market.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "loved the simple but very well laid out rooms - lots of shelves and places to hang things. also LOVE that the windows open. that for me is huge. Ditto the coffee shop downstairs. Staff was terrific. As was the location - so many good restaurants nearby. We meant to use the gym but never did but we did peek in and it is a pretty decent size for a hotel gym and love that they have pelotons!",
        "negative": "would have loved a better breakfast option on the weekend. full brunch didn't start til 11 and we are early risers so all that was available were some pretty basic things at the cafe. prices were VERY high on the weekend. I loved my simple low-key room but it should NOT have been almost $600/night!",
        "body": "loved the simple but very well laid out rooms - lots of shelves and places to hang things. also LOVE that the windows open. that for me is huge. Ditto the coffee shop downstairs. Staff was terrific. As was the location - so many good restaurants nearby. We meant to use the gym but never did but we did peek in and it is a pretty decent size for a hotel gym and love that they have pelotons!\nwould have loved a better breakfast option on the weekend. full brunch didn't start til 11 and we are early risers so all that was available were some pretty basic things at the cafe. prices were VERY high on the weekend. I loved my simple low-key room but it should NOT have been almost $600/night!"
      },
      {
        "reviewer": "Steven",
        "activeSince": "Active since 2011",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "3 nights · March 2026",
        "guestType": "Family",
        "reviewed": "March 24, 2026",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great location",
        "negative": "Bed uncomfortable, not a great or even good value",
        "body": "Great location\nBed uncomfortable, not a great or even good value"
      },
      {
        "reviewer": "Lisa",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Large",
        "stay": "1 night · August 2025",
        "guestType": "Family",
        "reviewed": "August 29, 2025",
        "title": "Quick night in Market District",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Desirable location for our visit. We love the Market area and close to daughter’s home. The rooms are very spacious with a large bathtub. Decor is industrial chic.",
        "negative": "N/A",
        "body": "Desirable location for our visit. We love the Market area and close to daughter’s home. The rooms are very spacious with a large bathtub. Decor is industrial chic.\nN/A"
      },
      {
        "reviewer": "William",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Medium",
        "stay": "1 night · August 2025",
        "guestType": "Couple",
        "reviewed": "August 26, 2025",
        "title": "The hotel was our main hub and had a great vibe, including a movie theater: great",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "location: excellent; breakfast menu: average; staff: very responsive",
        "negative": "breakfast menu: pork belly very dry and unflavorful",
        "body": "location: excellent; breakfast menu: average; staff: very responsive\nbreakfast menu: pork belly very dry and unflavorful"
      },
      {
        "reviewer": "Julianeal21",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Medium",
        "stay": "1 night · August 2025",
        "guestType": "Family",
        "reviewed": "August 16, 2025",
        "title": "Great hotel in the West Loop, a little out of the way for daytime tourist stuff",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The hotel is in a fun area where people come to go out to dinner. We went to the movies on the roof at night. Very fun! Big lobby and a coffee place at hotel. Liked the room a lot. I read other reviews that the rooms were basic but ours had soft carpet and a big bathroom and a king bed. Was great.",
        "negative": "It’s out of the way for touristy stuff. I don’t like to stay right in the tourist or downtown area but this was prob a little too far. The hotel seems like is where tech companies and twentysomethings live. It’s nice to see and come have dinner but no need to hang out there for longer than a day. I felt like I had to go out and stay out all day and only come home at the end of the day.",
        "body": "The hotel is in a fun area where people come to go out to dinner. We went to the movies on the roof at night. Very fun! Big lobby and a coffee place at hotel. Liked the room a lot. I read other reviews that the rooms were basic but ours had soft carpet and a big bathroom and a king bed. Was great.\nIt’s out of the way for touristy stuff. I don’t like to stay right in the tourist or downtown area but this was prob a little too far. The hotel seems like is where tech companies and twentysomethings live. It’s nice to see and come have dinner but no need to hang out there for longer than a day. I felt like I had to go out and stay out all day and only come home at the end of the day."
      },
      {
        "reviewer": "Janice",
        "activeSince": "",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "7 nights · August 2024",
        "guestType": "Solo traveler",
        "reviewed": "August 25, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Staff was great. Always tried to be helpful.",
        "negative": "No little store to buy toothpaste, water after hours, advil etc. Mini bar charge of .59 cents to purchase the water which costs $5.00 is a bit much.",
        "body": "Staff was great. Always tried to be helpful.\nNo little store to buy toothpaste, water after hours, advil etc. Mini bar charge of .59 cents to purchase the water which costs $5.00 is a bit much."
      },
      {
        "reviewer": "Bard",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Double",
        "stay": "3 nights · August 2024",
        "guestType": "Family",
        "reviewed": "August 3, 2024",
        "title": "Comfortable and walkable area.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The front desk personnel were exceptional. The coffee shop and pastries were amazing.",
        "negative": "Walls are thin. Doors in hallway are loud opening and closing. Can hear train. Heard toilet flushing from either next door room or room above. Noisy. Was expensive overall.",
        "body": "The front desk personnel were exceptional. The coffee shop and pastries were amazing.\nWalls are thin. Doors in hallway are loud opening and closing. Can hear train. Heard toilet flushing from either next door room or room above. Noisy. Was expensive overall."
      },
      {
        "reviewer": "Shani",
        "activeSince": "Active since 2012",
        "country": "South Africa",
        "room": "Medium",
        "stay": "3 nights · July 2023",
        "guestType": "Solo traveler",
        "reviewed": "October 16, 2023",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location was great, decor downstairs was good and coffee place was cute. Room was clean.",
        "negative": "Rooms smelled and felt like there was damp.. to the degree that I had a physical response.... there was a moldy feel even though the hotel seems brand new. I felt it was expensive for what it was.",
        "body": "Location was great, decor downstairs was good and coffee place was cute. Room was clean.\nRooms smelled and felt like there was damp.. to the degree that I had a physical response.... there was a moldy feel even though the hotel seems brand new. I felt it was expensive for what it was."
      },
      {
        "reviewer": "Kylie",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Double",
        "stay": "2 nights · October 2023",
        "guestType": "Group",
        "reviewed": "October 10, 2023",
        "title": "I would",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "I love how vibey of the hotel was. The staff was friendly, and helpful. The room was clean, and the shower pressure was fantastic. The neighborhood was facntastic",
        "negative": "I wish the shower had fans, I kinda wish the staff had name tags on, and I wish they had a mini fridge to put my left over food.",
        "body": "I love how vibey of the hotel was. The staff was friendly, and helpful. The room was clean, and the shower pressure was fantastic. The neighborhood was facntastic\nI wish the shower had fans, I kinda wish the staff had name tags on, and I wish they had a mini fridge to put my left over food."
      },
      {
        "reviewer": "Sylvia",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "2 nights · September 2023",
        "guestType": "Couple",
        "reviewed": "September 25, 2023",
        "title": "Nice rooms and friendly staff. Would stay again!",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "They were very friendly. Room was comfortable. They accommodated our early arrival which was super nice. The lobby area and coffee shop were very nice. Didn’t use rooftop terrace but heard it was very nice.",
        "negative": "The hallway carpet was a bit dark and gave impression of being old but perhaps wasn’t that old but colors made it look dirty or old. It’s on the pricy side.",
        "body": "They were very friendly. Room was comfortable. They accommodated our early arrival which was super nice. The lobby area and coffee shop were very nice. Didn’t use rooftop terrace but heard it was very nice.\nThe hallway carpet was a bit dark and gave impression of being old but perhaps wasn’t that old but colors made it look dirty or old. It’s on the pricy side."
      },
      {
        "reviewer": "Jessica",
        "activeSince": "Active since 2020",
        "country": "Canada",
        "room": "Medium",
        "stay": "2 nights · September 2024",
        "guestType": "Solo traveler",
        "reviewed": "September 23, 2024",
        "title": "Hotel, itself was awesome. Emphasis on the amazing and friendly staff who shared my joy of getting my Kickstarter oracle",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The staff were incredibly kind and it was definitely the best part of my stay. I hope they all get raises, especially the night crew. The pillows were really comfortable and fluffy too.\nThe rooms are really lovely and the amenities available, like having an umbrella to use and malin + goetz shampoo, conditioner and body wash were really good. It really came in handy, as I was extending my stay last minute and had run out of some essentials. They also let me check in early which was really great!\nThey were kind enough to give me a bunch of extra makeup remover wipes as one wasn’t enough to take off my waterproof/smudge proof stuff. There is also a steamer in the closet which was really handy.\nThe location was not for me. It’s in the west loop and incredibly touristy. The night life was very clubby and the restaurants and attractions in the area were not my thing. I think it would be for a lot of people but if you want to explore neighbourhoods in the north like wicker park, Logan square, Avondale and beyond, it was hard getting an Uber and a little far. It was the only draw back. If you can get a spot at duck duck goat, though for dim sum, it’s awesome and is right around the corner.\nAlso, the toilet paper was awful. Like sandpaper:D",
        "negative": "Everything else was great.",
        "body": "The staff were incredibly kind and it was definitely the best part of my stay. I hope they all get raises, especially the night crew. The pillows were really comfortable and fluffy too.\nThe rooms are really lovely and the amenities available, like having an umbrella to use and malin + goetz shampoo, conditioner and body wash were really good. It really came in handy, as I was extending my stay last minute and had run out of some essentials. They also let me check in early which was really great!\nThey were kind enough to give me a bunch of extra makeup remover wipes as one wasn’t enough to take off my waterproof/smudge proof stuff. There is also a steamer in the closet which was really handy.\nThe location was not for me. It’s in the west loop and incredibly touristy. The night life was very clubby and the restaurants and attractions in the area were not my thing. I think it would be for a lot of people but if you want to explore neighbourhoods in the north like wicker park, Logan square, Avondale and beyond, it was hard getting an Uber and a little far. It was the only draw back. If you can get a spot at duck duck goat, though for dim sum, it’s awesome and is right around the corner.\nAlso, the toilet paper was awful. Like sandpaper:D\nEverything else was great."
      },
      {
        "reviewer": "Dr",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "3 nights · January 2026",
        "guestType": "Solo traveler",
        "reviewed": "February 10, 2026",
        "title": "JUST OK.",
        "scoredLabel": "Scored 6.0",
        "scoreText": "6.0",
        "score10": 6,
        "positive": "N/A",
        "negative": "The room had a college dorm industrial feel.",
        "body": "N/A\nThe room had a college dorm industrial feel."
      },
      {
        "reviewer": "James",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "Medium",
        "stay": "1 night · September 2025",
        "guestType": "Couple",
        "reviewed": "September 21, 2025",
        "title": "The hotel and staff are great, but the hotel is too loud in the middle of the night",
        "scoredLabel": "Scored 6.0",
        "scoreText": "6.0",
        "score10": 6,
        "positive": "The hotel was very loud. Guests were loud walking down the hallway at 2 am and again around 2:30 am. A very drunk guest woke me up before 5 am and was arguing with a staff member. I ended up only getting 3 hours of sleep so have been a zombie all day. We were in town for our daughter's engagement and will find a quieter venue the next time we stay in the city.",
        "negative": "The noise level in the middle of the night",
        "body": "The hotel was very loud. Guests were loud walking down the hallway at 2 am and again around 2:30 am. A very drunk guest woke me up before 5 am and was arguing with a staff member. I ended up only getting 3 hours of sleep so have been a zombie all day. We were in town for our daughter's engagement and will find a quieter venue the next time we stay in the city.\nThe noise level in the middle of the night"
      },
      {
        "reviewer": "Tajc",
        "activeSince": "Active since 2022",
        "country": "Australia",
        "room": "Standard King Room",
        "stay": "2 nights · September 2025",
        "guestType": "Solo traveler",
        "reviewed": "September 10, 2025",
        "title": "Loved the venue but found that over my two day stay",
        "scoredLabel": "Scored 7.0",
        "scoreText": "7.0",
        "score10": 7,
        "positive": "Amazing location.\nNo drawers for smalls ie underwear\nNo room service\nVery loud room from side street noise\nInternet did not connect as reception set it up wrong ie sign in asked for last name but they had put first name",
        "negative": "Room phone did not work",
        "body": "Amazing location.\nNo drawers for smalls ie underwear\nNo room service\nVery loud room from side street noise\nInternet did not connect as reception set it up wrong ie sign in asked for last name but they had put first name\nRoom phone did not work"
      },
      {
        "reviewer": "Julie",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Double",
        "stay": "1 night · July 2025",
        "guestType": "Family",
        "reviewed": "August 1, 2025",
        "title": "Location was good but probably won’t stay here again.",
        "scoredLabel": "Scored 7.0",
        "scoreText": "7.0",
        "score10": 7,
        "positive": "Location, staff were very friendly, beds were comfortable",
        "negative": "Awakened early morning by a loud noise coming from HVAC. At this price point, I was expecting something more from this hotel. Housekeeping let themselves into our room at 10 a.m. while we were in there! Check out was at 11 a.m.",
        "body": "Location, staff were very friendly, beds were comfortable\nAwakened early morning by a loud noise coming from HVAC. At this price point, I was expecting something more from this hotel. Housekeeping let themselves into our room at 10 a.m. while we were in there! Check out was at 11 a.m."
      },
      {
        "reviewer": "Michael",
        "activeSince": "Active since 2013",
        "country": "Austria",
        "room": "Double",
        "stay": "4 nights · October 2024",
        "guestType": "Couple",
        "reviewed": "October 22, 2024",
        "title": "Good location, price performance bad",
        "scoredLabel": "Scored 7.0",
        "scoreText": "7.0",
        "score10": 7,
        "positive": "Good location, many restaurants and bars nearby. Not too far from center of Chicago. Nice room with enough place for a longer stay.\n$600 Deposit is excessive. Refund took 7 days!\nHigh price - but no complimentary daily bottle of water. $5 for one bottle is also excessive\nHigh price - but only 1 room service for 4 nights.",
        "negative": "Summary: seems that guests should pay as much as possible - for bad service",
        "body": "Good location, many restaurants and bars nearby. Not too far from center of Chicago. Nice room with enough place for a longer stay.\n$600 Deposit is excessive. Refund took 7 days!\nHigh price - but no complimentary daily bottle of water. $5 for one bottle is also excessive\nHigh price - but only 1 room service for 4 nights.\nSummary: seems that guests should pay as much as possible - for bad service"
      },
      {
        "reviewer": "Djunnaymed",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "Double",
        "stay": "3 nights · October 2024",
        "guestType": "Group",
        "reviewed": "October 7, 2024",
        "title": "Overall the price seems steep for the quality of the stay. The location almost makes up for it.",
        "scoredLabel": "Scored 6.0",
        "scoreText": "6.0",
        "score10": 6,
        "positive": "Great location. The décor/lobby/restaurant all looked great. Valet services were efficient. Staff was all friendly and accommodating.",
        "negative": "Thin walls with nightly noise disturbances from . The beds were not very supportive. Lights flickering at times in the bathroom.",
        "body": "Great location. The décor/lobby/restaurant all looked great. Valet services were efficient. Staff was all friendly and accommodating.\nThin walls with nightly noise disturbances from . The beds were not very supportive. Lights flickering at times in the bathroom."
      },
      {
        "reviewer": "Babak",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "1 night · June 2024",
        "guestType": "Couple",
        "reviewed": "August 19, 2024",
        "title": "It was a good experience, but it wouldn't be my first choice in the area.",
        "scoredLabel": "Scored 7.0",
        "scoreText": "7.0",
        "score10": 7,
        "positive": "The location and the staff were great",
        "negative": "The room was dark and just didn't feel comfortable.",
        "body": "The location and the staff were great\nThe room was dark and just didn't feel comfortable."
      },
      {
        "reviewer": "Kali",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Standard King Room",
        "stay": "1 night · May 2024",
        "guestType": "Couple",
        "reviewed": "May 30, 2024",
        "title": "Alright.",
        "scoredLabel": "Scored 6.0",
        "scoreText": "6.0",
        "score10": 6,
        "positive": "There is a lot to do in the area near the hotel.",
        "negative": "My room smelled like cleaner or paint possibly? The odor was very strong I got a headache walking into the room. I had to open the window for a few hours to help with the smell. The conditioner dispenser also fell off the shower in the middle of the night and woke us up.",
        "body": "There is a lot to do in the area near the hotel.\nMy room smelled like cleaner or paint possibly? The odor was very strong I got a headache walking into the room. I had to open the window for a few hours to help with the smell. The conditioner dispenser also fell off the shower in the middle of the night and woke us up."
      },
      {
        "reviewer": "Friederike",
        "activeSince": "Active since 2016",
        "country": "Germany",
        "room": "Standard King Room",
        "stay": "1 night · December 2023",
        "guestType": "Couple",
        "reviewed": "January 2, 2024",
        "title": "Good",
        "scoredLabel": "Scored 7.0",
        "scoreText": "7.0",
        "score10": 7,
        "positive": "Big Roms, had everything we needed",
        "negative": "There was pumping Music which was a lil loud at night",
        "body": "Big Roms, had everything we needed\nThere was pumping Music which was a lil loud at night"
      },
      {
        "reviewer": "Madison",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Medium",
        "stay": "2 nights · October 2023",
        "guestType": "Couple",
        "reviewed": "October 26, 2023",
        "title": "Beautiful surface level appearance hides flaws that detract from the overall experience.",
        "scoredLabel": "Scored 6.0",
        "scoreText": "6.0",
        "score10": 6,
        "positive": "The room was pretty, clean, and a good size. Staff were helpful and pleasant. Restaurants in the hotel were good. Phenomenal location.\nOur TV didn’t have any way for us to use it - we couldn’t stream to it, watch cable, and we couldn’t find any way to plug into it.\nThe water pressure in the shower was shockingly low and excessive in the sink.",
        "negative": "Honestly, the pricing was high for what we got. The location almost made up for it.",
        "body": "The room was pretty, clean, and a good size. Staff were helpful and pleasant. Restaurants in the hotel were good. Phenomenal location.\nOur TV didn’t have any way for us to use it - we couldn’t stream to it, watch cable, and we couldn’t find any way to plug into it.\nThe water pressure in the shower was shockingly low and excessive in the sink.\nHonestly, the pricing was high for what we got. The location almost made up for it."
      },
      {
        "reviewer": "Jeanne",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "Double",
        "stay": "1 night · August 2023",
        "guestType": "Couple",
        "reviewed": "August 27, 2023",
        "title": "Great stay for quick 24 hr visit. All good except that bed was not comfortable.",
        "scoredLabel": "Scored 7.0",
        "scoreText": "7.0",
        "score10": 7,
        "positive": "Location!",
        "negative": "Price.",
        "body": "Location!\nPrice."
      },
      {
        "reviewer": "Taylor",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Large",
        "stay": "1 night · August 2023",
        "guestType": "Couple",
        "reviewed": "August 15, 2023",
        "title": "Great Location, But Dirty & Shabby",
        "scoredLabel": "Scored 5.0",
        "scoreText": "5.0",
        "score10": 5,
        "positive": "The location of this hotel is great and so are the common areas. The restaurants and rooftop bar are great and it has a really nice vibe.",
        "negative": "I was shocked at the state of our room. It felt VERY outdated and shabby. The carpet was honestly filthy and the tub had not been cleaned at all. There was hair and soap in there from the previous tenant. I was really upset with our room in comparison to the lobby and restaurants. It felt like they had completely redone those areas and just put shabby old ikea furniture in a dirty room for us to sleep in. Not to mention, we were on the 2nd floor and it was so loud. Because of the restaurant and bar, there were guests standing right below our window all night making noise. I wouldn't stay here again unless I hear that they completely renovate the guest rooms...",
        "body": "The location of this hotel is great and so are the common areas. The restaurants and rooftop bar are great and it has a really nice vibe.\nI was shocked at the state of our room. It felt VERY outdated and shabby. The carpet was honestly filthy and the tub had not been cleaned at all. There was hair and soap in there from the previous tenant. I was really upset with our room in comparison to the lobby and restaurants. It felt like they had completely redone those areas and just put shabby old ikea furniture in a dirty room for us to sleep in. Not to mention, we were on the 2nd floor and it was so loud. Because of the restaurant and bar, there were guests standing right below our window all night making noise. I wouldn't stay here again unless I hear that they completely renovate the guest rooms..."
      },
      {
        "reviewer": "Ugo",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Medium",
        "stay": "1 night · June 2026",
        "guestType": "Solo traveler",
        "reviewed": "June 21, 2026",
        "title": "Fair",
        "scoredLabel": "Scored 5.0",
        "scoreText": "5.0",
        "score10": 5,
        "positive": "The bed was comfortable and the hotel is in an amazing location.",
        "negative": "The walls are paper thin, I could hear people in the hallway and noise from outside the hotel.",
        "body": "The bed was comfortable and the hotel is in an amazing location.\nThe walls are paper thin, I could hear people in the hallway and noise from outside the hotel."
      },
      {
        "reviewer": "Lisa",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Double",
        "stay": "1 night · May 2026",
        "guestType": "Couple",
        "reviewed": "June 15, 2026",
        "title": "Overpriced and disappointing",
        "scoredLabel": "Scored 6.0",
        "scoreText": "6.0",
        "score10": 6,
        "positive": "Great location if staying in the loop",
        "negative": "Decor was cheap, room felt like a dorm room",
        "body": "Great location if staying in the loop\nDecor was cheap, room felt like a dorm room"
      }
    ],
    "nobu-hotel-chicago": [
      {
        "reviewer": "Nikhil",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Yubune King",
        "stay": "3 nights · June 2026",
        "guestType": "Solo traveler",
        "reviewed": "June 20, 2026",
        "title": "Love the space, bathrooms are great, and location is perfect",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Very clean and design forward rooms.",
        "negative": "Rooms could have a little more lighting options to help in evenings if working! But it’s ok",
        "body": "Very clean and design forward rooms.\nRooms could have a little more lighting options to help in evenings if working! But it’s ok"
      },
      {
        "reviewer": "Leandro",
        "activeSince": "Active since 2025",
        "country": "Brazil",
        "room": "Yubune King",
        "stay": "2 nights · June 2026",
        "guestType": "Couple",
        "reviewed": "June 14, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Modern hotel, located a few steps from a bunch of nice restaurants, gym, and some shops. Rooms had a great view of the city and the staff was attentive and friendly all the time",
        "negative": "Parking very expensive",
        "body": "Modern hotel, located a few steps from a bunch of nice restaurants, gym, and some shops. Rooms had a great view of the city and the staff was attentive and friendly all the time\nParking very expensive"
      },
      {
        "reviewer": "Aubrey",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Yubune King",
        "stay": "2 nights · June 2026",
        "guestType": "Couple",
        "reviewed": "June 2, 2026",
        "title": "Always perfect!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything!",
        "negative": "",
        "body": "Everything!"
      },
      {
        "reviewer": "Ela",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Deluxe City View",
        "stay": "1 night · May 2026",
        "guestType": "Couple",
        "reviewed": "May 19, 2026",
        "title": "Amazing! Best hotel in the city. The service is incredible. I enjoyed my birthday trip a lot!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The best staff ever, very friendly and professional. They make you feel welcomed.",
        "negative": "Absolutely nothing. Everything was perfect",
        "body": "The best staff ever, very friendly and professional. They make you feel welcomed.\nAbsolutely nothing. Everything was perfect"
      },
      {
        "reviewer": "Maria",
        "activeSince": "Active since 2018",
        "country": "Portugal",
        "room": "Deluxe City View",
        "stay": "4 nights · March 2026",
        "guestType": "Couple",
        "reviewed": "May 15, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great hotel.",
        "negative": "Every time we come to Chicago is our first option.",
        "body": "Great hotel.\nEvery time we come to Chicago is our first option."
      },
      {
        "reviewer": "Vernon",
        "activeSince": "Active since 2012",
        "country": "United Kingdom",
        "room": "Yubune King",
        "stay": "4 nights · May 2026",
        "guestType": "Couple",
        "reviewed": "May 9, 2026",
        "title": "Cool low key minimalist Nobu hotel in a trendy up and comming meat packing district of Chicago",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Near many restaurants.\nArea had a cool vibe\nThey provided free electric bikes and helmets\nAll very well maintained\nSauna wasn’t working In men’s area\nStaff said couples could use the ladies sauna for a pre booked 1hour sessions but the sauna was not turned on and it took 1/2 hour to warm up so we wasted time waiting\nWe explained to staff to warm up the sauna 1/2 before the booked time the next time we booked a slot but this wasn’t done the second time and it just took ages to warm up so we just left it.",
        "negative": "Minor complaint; otherwise stay was perfect",
        "body": "Near many restaurants.\nArea had a cool vibe\nThey provided free electric bikes and helmets\nAll very well maintained\nSauna wasn’t working In men’s area\nStaff said couples could use the ladies sauna for a pre booked 1hour sessions but the sauna was not turned on and it took 1/2 hour to warm up so we wasted time waiting\nWe explained to staff to warm up the sauna 1/2 before the booked time the next time we booked a slot but this wasn’t done the second time and it just took ages to warm up so we just left it.\nMinor complaint; otherwise stay was perfect"
      },
      {
        "reviewer": "Ian",
        "activeSince": "Active since 2010",
        "country": "United Kingdom",
        "room": "Deluxe City View",
        "stay": "3 nights · May 2026",
        "guestType": "Group",
        "reviewed": "May 5, 2026",
        "title": "Loved this hotel. Outstanding in virtually every aspect. One of the very best hotels I’ve stayed in.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The vibe, the staff, the location, the bar, the room. Understated cool, Japan style.",
        "negative": "Only tiny comments (not a complaint)… the bath towels are tiny. And the addition of a Bluetooth speaker in the room would have added to it.",
        "body": "The vibe, the staff, the location, the bar, the room. Understated cool, Japan style.\nOnly tiny comments (not a complaint)… the bath towels are tiny. And the addition of a Bluetooth speaker in the room would have added to it."
      },
      {
        "reviewer": "Kathryn",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Deluxe City View",
        "stay": "1 night · March 2026",
        "guestType": "Couple",
        "reviewed": "April 28, 2026",
        "title": "Beautiful property, welcoming staff, so comfortable!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Beautiful visually, lighting is stunning. Beds were extremely comfortable. Personalized note and chocolates upon arrival were a very nice touch. Room we requested was granted.",
        "negative": "This is a high end hotel and the costs match that. Given that, we might not choose to stay here every time.",
        "body": "Beautiful visually, lighting is stunning. Beds were extremely comfortable. Personalized note and chocolates upon arrival were a very nice touch. Room we requested was granted.\nThis is a high end hotel and the costs match that. Given that, we might not choose to stay here every time."
      },
      {
        "reviewer": "Heather",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Yubune King",
        "stay": "2 nights · April 2026",
        "guestType": "Solo traveler",
        "reviewed": "April 27, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great view of the Chicago skyline. Comfortable bed and amazing bathroom.",
        "negative": "",
        "body": "Great view of the Chicago skyline. Comfortable bed and amazing bathroom."
      },
      {
        "reviewer": "Неофидов",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Zen Deluxe Suite",
        "stay": "2 nights · April 2026",
        "guestType": "Solo traveler",
        "reviewed": "April 19, 2026",
        "title": "Great for relax and vacation.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "High level of comfort and incredibly responsive staff.",
        "negative": "I cannot live there permanently.",
        "body": "High level of comfort and incredibly responsive staff.\nI cannot live there permanently."
      },
      {
        "reviewer": "Not helpfulTulba",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "Deluxe City View",
        "stay": "1 night · March 2026",
        "guestType": "Couple",
        "reviewed": "March 29, 2026",
        "title": "Everything was perfect, luxurious and great costumers service.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Modern, luxurious",
        "negative": "Everything was great.",
        "body": "Modern, luxurious\nEverything was great."
      },
      {
        "reviewer": "Katie",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Deluxe City View",
        "stay": "2 nights · March 2026",
        "guestType": "Group",
        "reviewed": "March 17, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Amazing stay here over St Patrick’s weekend. Staff could not have been friendlier or more accommodating throughout our 2 night stay!\nSpacious rooms, comfy bed, delicious cocktails on the rooftop bar and in a a very cool & walkable area.",
        "negative": "Will stay here again next time we visit!!",
        "body": "Amazing stay here over St Patrick’s weekend. Staff could not have been friendlier or more accommodating throughout our 2 night stay!\nSpacious rooms, comfy bed, delicious cocktails on the rooftop bar and in a a very cool & walkable area.\nWill stay here again next time we visit!!"
      },
      {
        "reviewer": "Brooke",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Deluxe City View",
        "stay": "3 nights · March 2026",
        "guestType": "Couple",
        "reviewed": "March 15, 2026",
        "title": "Clean, comfortable, chic & great staff!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Staff was so great & friendly! Luxe and comfortable hotel. Would definitely come back :)",
        "negative": "N/A",
        "body": "Staff was so great & friendly! Luxe and comfortable hotel. Would definitely come back :)\nN/A"
      },
      {
        "reviewer": "Aubrey",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Yubune King",
        "stay": "2 nights · February 2026",
        "guestType": "Couple",
        "reviewed": "March 10, 2026",
        "title": "Beautiful weekend away",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Staff, cleanliness, amenities, food, everything was fantastic! Like always!",
        "negative": "",
        "body": "Staff, cleanliness, amenities, food, everything was fantastic! Like always!"
      },
      {
        "reviewer": "Marco",
        "activeSince": "Active since 2019",
        "country": "Switzerland",
        "room": "Yubune King",
        "stay": "1 night · January 2026",
        "guestType": "Solo traveler",
        "reviewed": "February 14, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "I love this luxury hotel. The style, the people, it just felt all great!",
        "negative": "",
        "body": "I love this luxury hotel. The style, the people, it just felt all great!"
      },
      {
        "reviewer": "Jomela",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · February 2026",
        "guestType": "Solo traveler",
        "reviewed": "February 11, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The staff was beyond wonderful and helpful, a Black was always right outside the door. So many restaurants and bars located within a mile each way. Also loved the Dyson hair dryer, the flat iron, the steamer. The steam room and pool were beautiful and peaceful",
        "negative": "The only I wasn’t fond of was was a bit too comfortable, made me want to stay in instead of explore the city lol",
        "body": "The staff was beyond wonderful and helpful, a Black was always right outside the door. So many restaurants and bars located within a mile each way. Also loved the Dyson hair dryer, the flat iron, the steamer. The steam room and pool were beautiful and peaceful\nThe only I wasn’t fond of was was a bit too comfortable, made me want to stay in instead of explore the city lol"
      },
      {
        "reviewer": "Amanda",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Yubune King",
        "stay": "1 night · February 2026",
        "guestType": "Couple",
        "reviewed": "February 11, 2026",
        "title": "Lovely",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great ambience",
        "negative": "Nothing",
        "body": "Great ambience\nNothing"
      },
      {
        "reviewer": "Xongitiko",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "2 nights · January 2026",
        "guestType": "Couple",
        "reviewed": "January 31, 2026",
        "title": "Had a lovely time celebrating my birthday.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The rooms are lovely .",
        "negative": "Nothing .",
        "body": "The rooms are lovely .\nNothing ."
      },
      {
        "reviewer": "Steven",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · December 2025",
        "guestType": "Solo traveler",
        "reviewed": "January 5, 2026",
        "title": "Beautiful place in the city. Don’t bring a car",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Everything except parking situation. Nice rooms luxury feel. Attentive staff",
        "negative": "Parking not well marked and costly. Took 25 min for valet to retrieve our car and had to ask twice.",
        "body": "Everything except parking situation. Nice rooms luxury feel. Attentive staff\nParking not well marked and costly. Took 25 min for valet to retrieve our car and had to ask twice."
      },
      {
        "reviewer": "Noura",
        "activeSince": "Active since 2012",
        "country": "Kuwait",
        "room": "Deluxe City View",
        "stay": "4 nights · October 2025",
        "guestType": "Solo traveler",
        "reviewed": "October 13, 2025",
        "title": "A great experience and will come here again soon",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything specially the staff",
        "negative": "Nothing.",
        "body": "Everything specially the staff\nNothing."
      },
      {
        "reviewer": "A general view of Chicago or a view of the city taken from the hotelMark",
        "activeSince": "Active since 2010",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "4 nights · August 2025",
        "guestType": "Couple",
        "reviewed": "October 4, 2025",
        "title": "Don’t try so hard - you have a beautiful hotel (building, rooms and.common spaces) there’s no need to be so arrogant and",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great room!",
        "negative": "Roof top bar is a joke - could be much better managed to give hotel guests priority.",
        "body": "Great room!\nRoof top bar is a joke - could be much better managed to give hotel guests priority."
      },
      {
        "reviewer": "Luiz",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "2 nights · July 2025",
        "guestType": "Couple",
        "reviewed": "July 30, 2025",
        "title": "A beautifully designed, detail-oriented luxury hotel that made my birthday stay feel truly special.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "This is one of the most stylish and well-designed hotels I’ve ever stayed in. Every detail—from the smooth-gliding curtain handles to the Dyson hair dryer and Nespresso machine—exudes luxury and thoughtful design. The signature bed was incredibly comfortable, and the room felt both high-end and cozy. I loved the intuitive controls for lighting, and ambiance, especially the privacy button instead of a door hanger.\nThe bathroom lighting was perfect, and all the in-room amenities and products were high quality. The spa and steam room were also a highlight, and the pool was beautiful. The staff were very thoughtful and professional, and even surprised me with Nobu sweets and chocolates for my birthday, which made the experience extra special.\nThe location is excellent too—easy access to great restaurants, bike paths, and public transit. Overall, it felt like a real treat and the perfect place to celebrate.",
        "negative": "The gym felt a bit dark and closed off, as it doesn't have windows and feels a bit like a basement space—not ideal for a workout, but a minor downside in an otherwise outstanding stay.",
        "body": "This is one of the most stylish and well-designed hotels I’ve ever stayed in. Every detail—from the smooth-gliding curtain handles to the Dyson hair dryer and Nespresso machine—exudes luxury and thoughtful design. The signature bed was incredibly comfortable, and the room felt both high-end and cozy. I loved the intuitive controls for lighting, and ambiance, especially the privacy button instead of a door hanger.\nThe bathroom lighting was perfect, and all the in-room amenities and products were high quality. The spa and steam room were also a highlight, and the pool was beautiful. The staff were very thoughtful and professional, and even surprised me with Nobu sweets and chocolates for my birthday, which made the experience extra special.\nThe location is excellent too—easy access to great restaurants, bike paths, and public transit. Overall, it felt like a real treat and the perfect place to celebrate.\nThe gym felt a bit dark and closed off, as it doesn't have windows and feels a bit like a basement space—not ideal for a workout, but a minor downside in an otherwise outstanding stay."
      },
      {
        "reviewer": "Craig",
        "activeSince": "Active since 2014",
        "country": "United Kingdom",
        "room": "Sake Suite",
        "stay": "1 night · July 2025",
        "guestType": "Solo traveler",
        "reviewed": "July 29, 2025",
        "title": "Great place to stay, would highly recommend the rooftop bar",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location and wonderful facilities",
        "negative": "",
        "body": "Great location and wonderful facilities"
      },
      {
        "reviewer": "Dr",
        "activeSince": "Active since 2020",
        "country": "South Africa",
        "room": "Deluxe City View",
        "stay": "2 nights · July 2025",
        "guestType": "Solo traveler",
        "reviewed": "July 13, 2025",
        "title": "Best hotel in Chicago!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Best hotel in Chicago!",
        "negative": "",
        "body": "Best hotel in Chicago!"
      },
      {
        "reviewer": "William",
        "activeSince": "Active since 2021",
        "country": "United Kingdom",
        "room": "Deluxe City View",
        "stay": "3 nights · June 2025",
        "guestType": "Group",
        "reviewed": "July 12, 2025",
        "title": "Bachelor Party",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Probably one of the nicest rooms I've ever stayed in. Photos just don't do it justice. Excellent bathroom, comfy bed, location was excellent if you want a vibrant and exciting area to be in. Minutes from one of the best burgers in the world. Just what we needed",
        "negative": "",
        "body": "Probably one of the nicest rooms I've ever stayed in. Photos just don't do it justice. Excellent bathroom, comfy bed, location was excellent if you want a vibrant and exciting area to be in. Minutes from one of the best burgers in the world. Just what we needed"
      },
      {
        "reviewer": "Daiva",
        "activeSince": "Active since 2014",
        "country": "United Kingdom",
        "room": "Deluxe King Room",
        "stay": "2 nights · July 2025",
        "guestType": "Couple",
        "reviewed": "July 6, 2025",
        "title": "Luxury comfort and design",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything! Beautiful design and very comfortable stay.",
        "negative": "",
        "body": "Everything! Beautiful design and very comfortable stay."
      },
      {
        "reviewer": "Creighton",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Yubune King",
        "stay": "1 night · June 2025",
        "guestType": "Solo traveler",
        "reviewed": "July 2, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Good location to lots of food and shopping options. Nice staff. Great spot for access to 94 to avoid downtown.",
        "negative": "There was a clicking sound in the room that may have been intended to sound like crickets or cicadas to cover up sound of AC/fan. Not sure but was kind of annoying. The bed wasn't made real well by cleaning staff and sheets were not tight on the make. The wooden tub looked a little sketch and worn. Could have had better breakfast options. Rooftop bar closes WAY too early (930pm)...",
        "body": "Good location to lots of food and shopping options. Nice staff. Great spot for access to 94 to avoid downtown.\nThere was a clicking sound in the room that may have been intended to sound like crickets or cicadas to cover up sound of AC/fan. Not sure but was kind of annoying. The bed wasn't made real well by cleaning staff and sheets were not tight on the make. The wooden tub looked a little sketch and worn. Could have had better breakfast options. Rooftop bar closes WAY too early (930pm)..."
      },
      {
        "reviewer": "Brittany",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Yubune King",
        "stay": "2 nights · May 2025",
        "guestType": "Couple",
        "reviewed": "June 24, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "My husband and I stayed here for our wedding and it was beautiful! We loved the deep soaker tub!",
        "negative": "The only thing i didnt like was how expensive the room service was. The extra taxes/fees and the $5 delivery fee for the restaurant in the building made the room service a little less enjoyable. That was kinda crazy. Might as well just got to the restaurant to save a few bucks.",
        "body": "My husband and I stayed here for our wedding and it was beautiful! We loved the deep soaker tub!\nThe only thing i didnt like was how expensive the room service was. The extra taxes/fees and the $5 delivery fee for the restaurant in the building made the room service a little less enjoyable. That was kinda crazy. Might as well just got to the restaurant to save a few bucks."
      },
      {
        "reviewer": "Bashaer",
        "activeSince": "Active since 2015",
        "country": "United Arab Emirates",
        "room": "Yubune King",
        "stay": "7 nights · June 2025",
        "guestType": "Couple",
        "reviewed": "June 7, 2025",
        "title": "Relaxing stay in a busy part of town. Tranquil vibes and delicious food.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Walking distance to restaurants and shops.",
        "negative": "View of the room is of a pickle ball court",
        "body": "Walking distance to restaurants and shops.\nView of the room is of a pickle ball court"
      },
      {
        "reviewer": "Donald",
        "activeSince": "Active since 2011",
        "country": "United States",
        "room": "Deluxe City View",
        "stay": "2 nights · May 2025",
        "guestType": "Couple",
        "reviewed": "May 30, 2025",
        "title": "Nice facility,\"\"\"",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location, clean, nice staff.",
        "negative": "",
        "body": "Great location, clean, nice staff."
      },
      {
        "reviewer": "Little Japanese influence, over-priced.Hughes",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · May 2025",
        "guestType": "Couple",
        "reviewed": "May 26, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "This property is absolutely amazing from the staff, cleanliness, location, convenience, absolutely everything was amazing! The staff was so accommodating and made us feel so welcomed! I will always be staying with Nobu going forward.",
        "negative": "",
        "body": "This property is absolutely amazing from the staff, cleanliness, location, convenience, absolutely everything was amazing! The staff was so accommodating and made us feel so welcomed! I will always be staying with Nobu going forward."
      },
      {
        "reviewer": "Karin",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Deluxe City View",
        "stay": "4 nights · April 2025",
        "guestType": "Couple",
        "reviewed": "April 18, 2025",
        "title": "I will continue to seek out Nobu hotels in my future travel. Five stars isn't enough.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The food and cocktails at the Nobu restaurant and rooftop was exceptional.",
        "negative": "Everything smacked of perfection.",
        "body": "The food and cocktails at the Nobu restaurant and rooftop was exceptional.\nEverything smacked of perfection."
      },
      {
        "reviewer": "Maria",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · March 2025",
        "guestType": "Couple",
        "reviewed": "April 9, 2025",
        "title": "Perfect place",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Amazing hotel as always!",
        "negative": "",
        "body": "Amazing hotel as always!"
      },
      {
        "reviewer": "Stephen",
        "activeSince": "Active since 2012",
        "country": "United Kingdom",
        "room": "Deluxe King Room",
        "stay": "4 nights · March 2025",
        "guestType": "Couple",
        "reviewed": "March 10, 2025",
        "title": "Luxury in the West Loop",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "An unbelievable experience. Beautiful room, fab staff, amazing facilities. The Tanoshi hour was a treat as well, superb value for amazing food and drink.",
        "negative": "",
        "body": "An unbelievable experience. Beautiful room, fab staff, amazing facilities. The Tanoshi hour was a treat as well, superb value for amazing food and drink."
      },
      {
        "reviewer": "Noah",
        "activeSince": "",
        "country": "United States",
        "room": "ZEN Suite",
        "stay": "3 nights · March 2025",
        "guestType": "Couple",
        "reviewed": "March 10, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The location was perfect in the west loop of Chicago, surrounded by endless restaurants and bars.",
        "negative": "",
        "body": "The location was perfect in the west loop of Chicago, surrounded by endless restaurants and bars."
      },
      {
        "reviewer": "Anastasiia",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Yubune King",
        "stay": "1 night · February 2025",
        "guestType": "Solo traveler",
        "reviewed": "March 1, 2025",
        "title": "Definitely would love to stay there again",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "I loved that the property was so modern and up to date. The people that work at the hotel and at the restaurant are so nice and helpful! I loved my room. It was big and specious. They have an amazing gym and steam room as well. Chataun went far beyond and made me feel like at home.",
        "negative": "",
        "body": "I loved that the property was so modern and up to date. The people that work at the hotel and at the restaurant are so nice and helpful! I loved my room. It was big and specious. They have an amazing gym and steam room as well. Chataun went far beyond and made me feel like at home."
      },
      {
        "reviewer": "Mamduh",
        "activeSince": "Active since 2012",
        "country": "Saudi Arabia",
        "room": "Deluxe King Room",
        "stay": "7 nights · December 2024",
        "guestType": "Couple",
        "reviewed": "February 11, 2025",
        "title": "Unforgettable",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "In fact, everything about the hotel was wonderful, starting from the reception staff to the beautiful room that was on the eighth floor. Although the area is noisy, the room was quiet and comfortable. The room service was wonderful. In fact, the beauty of the hotel and its location made my visit to Chicago unforgettable.",
        "negative": "Nothing",
        "body": "In fact, everything about the hotel was wonderful, starting from the reception staff to the beautiful room that was on the eighth floor. Although the area is noisy, the room was quiet and comfortable. The room service was wonderful. In fact, the beauty of the hotel and its location made my visit to Chicago unforgettable.\nNothing"
      },
      {
        "reviewer": "Plamedie",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Yubune King",
        "stay": "1 night · February 2025",
        "guestType": "Couple",
        "reviewed": "February 4, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "It’s a great atmosphere. The staff were extra friendly. Check in was very smooth. The place smelled amazing.",
        "negative": "Nothing. Everything was great.",
        "body": "It’s a great atmosphere. The staff were extra friendly. Check in was very smooth. The place smelled amazing.\nNothing. Everything was great."
      },
      {
        "reviewer": "Karen",
        "activeSince": "Active since 2016",
        "country": "Belgium",
        "room": "Deluxe King Room",
        "stay": "1 night · January 2025",
        "guestType": "Group",
        "reviewed": "January 24, 2025",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The staff was amazing..",
        "negative": "",
        "body": "The staff was amazing.."
      },
      {
        "reviewer": "Faith",
        "activeSince": "Active since 2015",
        "country": "South Africa",
        "room": "Deluxe King Room",
        "stay": "3 nights · January 2025",
        "guestType": "Family",
        "reviewed": "January 5, 2025",
        "title": "excellent, I give it a 20/10. if I travel to Chicago again, I’ll most definitely book Nobu again",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "staff super friendly, kind and always willing to help. property is modern and classy.",
        "negative": "",
        "body": "staff super friendly, kind and always willing to help. property is modern and classy."
      },
      {
        "reviewer": "nothing at allLanise",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Yubune King",
        "stay": "3 nights · December 2024",
        "guestType": "Couple",
        "reviewed": "January 5, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Exceptional staff! Chataun provided us with complimentary upgrades and made our trip extra special. This was a birthday trip and it’s one we will never forget thanks to the amazing service and beautiful facilities.",
        "negative": "",
        "body": "Exceptional staff! Chataun provided us with complimentary upgrades and made our trip extra special. This was a birthday trip and it’s one we will never forget thanks to the amazing service and beautiful facilities."
      },
      {
        "reviewer": "Apollonia",
        "activeSince": "Active since 2018",
        "country": "United Kingdom",
        "room": "Deluxe City View",
        "stay": "3 nights · December 2024",
        "guestType": "Family",
        "reviewed": "January 5, 2025",
        "title": "We loved our stay!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Its stunning inside rooms very spacious staff lovely.",
        "negative": "Nothing",
        "body": "Its stunning inside rooms very spacious staff lovely.\nNothing"
      },
      {
        "reviewer": "Francesco",
        "activeSince": "Active since 2015",
        "country": "Italy",
        "room": "Yubune King",
        "stay": "3 nights · December 2024",
        "guestType": "Family",
        "reviewed": "January 4, 2025",
        "title": "Perfect hotel to visit Chicago",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Nice hotel in the food and nightlife district. Nice large rooms, swimming pool ok. Very vibrant bars and excellent restaurant. The staff was really great and nice",
        "negative": "I would have expected a Nobu style breakfast while it was plain American breakfast",
        "body": "Nice hotel in the food and nightlife district. Nice large rooms, swimming pool ok. Very vibrant bars and excellent restaurant. The staff was really great and nice\nI would have expected a Nobu style breakfast while it was plain American breakfast"
      },
      {
        "reviewer": "Jadechi",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "Yubune King",
        "stay": "1 night · December 2024",
        "guestType": "Couple",
        "reviewed": "January 2, 2025",
        "title": "Stylish and No-Frills Hotel in Chicago's West Loop",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "This was our second time staying in the Yubune King room which comes with a standalone wood tub. (Most rooms don't come with bathtubs.) We love Japanese Minimalist design. The bathroom was gorgeous and so were the views. The front desk staff were much friendlier this time around, too. There are many restaurants and bars in the neighborhood. The Dyson hair dryer was a nice amenity.",
        "negative": "In-room dining had a 20% service charge with a $5 delivery fee, excluding tips. There is no table, so we used the TV wall shelf with one regular chair and a lounge chair. The breakfast selection was extremely limited. Being from Chicago, the West Loop doesn't have as many CTA options as River North/the Loop. I recommend other neighborhoods if you're looking for a place near popular attractions.",
        "body": "This was our second time staying in the Yubune King room which comes with a standalone wood tub. (Most rooms don't come with bathtubs.) We love Japanese Minimalist design. The bathroom was gorgeous and so were the views. The front desk staff were much friendlier this time around, too. There are many restaurants and bars in the neighborhood. The Dyson hair dryer was a nice amenity.\nIn-room dining had a 20% service charge with a $5 delivery fee, excluding tips. There is no table, so we used the TV wall shelf with one regular chair and a lounge chair. The breakfast selection was extremely limited. Being from Chicago, the West Loop doesn't have as many CTA options as River North/the Loop. I recommend other neighborhoods if you're looking for a place near popular attractions."
      },
      {
        "reviewer": "Ashley",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · December 2024",
        "guestType": "Couple",
        "reviewed": "January 1, 2025",
        "title": "A nice way to bring in the new year!",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The manager was kind and accommodating",
        "negative": "Tv was broke in my first room. In the second room the bench was dirty. Just doesn’t seem like they are keeping up the property for the cost per night.",
        "body": "The manager was kind and accommodating\nTv was broke in my first room. In the second room the bench was dirty. Just doesn’t seem like they are keeping up the property for the cost per night."
      },
      {
        "reviewer": "Melissa",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · December 2024",
        "guestType": "Couple",
        "reviewed": "December 21, 2024",
        "title": "Excellent Stay",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything about our stay was great",
        "negative": "",
        "body": "Everything about our stay was great"
      },
      {
        "reviewer": "Holly",
        "activeSince": "Active since 2017",
        "country": "United Kingdom",
        "room": "Deluxe City View",
        "stay": "3 nights · December 2024",
        "guestType": "Couple",
        "reviewed": "December 6, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The staff were great, friendly and helpful. We had a lovely welcome letter and champagne in the room\nAs we had just been married",
        "negative": "Nothing everything was great!",
        "body": "The staff were great, friendly and helpful. We had a lovely welcome letter and champagne in the room\nAs we had just been married\nNothing everything was great!"
      },
      {
        "reviewer": "Perdomo",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Deluxe City View",
        "stay": "1 night · November 2024",
        "guestType": "Family",
        "reviewed": "November 18, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The hotel and facilities are beautiful. The city view room is spacious and comfortable.",
        "negative": "The location is great for its vicinity to restaurants and shops but is has become extremely loud at night.",
        "body": "The hotel and facilities are beautiful. The city view room is spacious and comfortable.\nThe location is great for its vicinity to restaurants and shops but is has become extremely loud at night."
      },
      {
        "reviewer": "Thomas",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · November 2024",
        "guestType": "Couple",
        "reviewed": "November 16, 2024",
        "title": "Good one night stay hotel, though certainly not up to Japanese standards.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Breakfast was not included.\nAt this price breakfast should be included.\nOur rug border had a large tear in it.",
        "negative": "I don’t like the hotel’s appropriation of “Zen Experience “ as a marketing tool. It’s inaccurate and awkward.",
        "body": "Breakfast was not included.\nAt this price breakfast should be included.\nOur rug border had a large tear in it.\nI don’t like the hotel’s appropriation of “Zen Experience “ as a marketing tool. It’s inaccurate and awkward."
      },
      {
        "reviewer": "Rodney",
        "activeSince": "Active since 2014",
        "country": "United Kingdom",
        "room": "Deluxe King Room",
        "stay": "1 night · September 2024",
        "guestType": "Couple",
        "reviewed": "November 10, 2024",
        "title": "Amazing stay",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great location if you want to be at the Fulton Market District. Loved the interiors",
        "negative": "we can here the noise from the bar upstairs from our room in the middle of the night.",
        "body": "Great location if you want to be at the Fulton Market District. Loved the interiors\nwe can here the noise from the bar upstairs from our room in the middle of the night."
      },
      {
        "reviewer": "Not helpfulGlenn",
        "activeSince": "Active since 2012",
        "country": "Australia",
        "room": "Deluxe King Room",
        "stay": "5 nights · November 2024",
        "guestType": "Family",
        "reviewed": "November 10, 2024",
        "title": "The perfect base when you visit Chicago.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "It's an experience. A sophisticated hotel for sophisticated people. Location is perfect, surrounding neighbourhood has a great range of food, shops and access to the entire city.",
        "negative": "",
        "body": "It's an experience. A sophisticated hotel for sophisticated people. Location is perfect, surrounding neighbourhood has a great range of food, shops and access to the entire city."
      },
      {
        "reviewer": "Mara",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · October 2024",
        "guestType": "Solo traveler",
        "reviewed": "November 5, 2024",
        "title": "I wish I had more time to enjoy the property and its amenities; I was there for less than 24 hours.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "I have a Dyson hairdryer at home and loved having one available in the bathroom. I also loved having a steamer.",
        "negative": "Lighting in the bathroom is very dim from a female perspective and too dark for applying makeup. Luckily I travel with my own lighted makeup mirror.",
        "body": "I have a Dyson hairdryer at home and loved having one available in the bathroom. I also loved having a steamer.\nLighting in the bathroom is very dim from a female perspective and too dark for applying makeup. Luckily I travel with my own lighted makeup mirror."
      },
      {
        "reviewer": "Kristine",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "Yubune King",
        "stay": "2 nights · October 2024",
        "guestType": "Solo traveler",
        "reviewed": "November 1, 2024",
        "title": "Perfect solo getaway",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The bed is so comfortable! The shower pressure amazing! The staff went above and beyond to ensure I had a really great stay! Very accommodating. Everyone was amazing. The staff that worked during my stay. They deserve all of the praise in the world. They were truly amazing.",
        "negative": "I wish the lighting in the bathroom was better. It wasn’t awful but it was a little difficult to do my makeup with the warm light settings.",
        "body": "The bed is so comfortable! The shower pressure amazing! The staff went above and beyond to ensure I had a really great stay! Very accommodating. Everyone was amazing. The staff that worked during my stay. They deserve all of the praise in the world. They were truly amazing.\nI wish the lighting in the bathroom was better. It wasn’t awful but it was a little difficult to do my makeup with the warm light settings."
      },
      {
        "reviewer": "Dawn",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "2 nights · October 2024",
        "guestType": "Solo traveler",
        "reviewed": "October 23, 2024",
        "title": "I'll be back. My niece lives in town!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything was beautiful. I especially loved the upper rooftop restaurant. Sushi was AMAZING.",
        "negative": "I like discounts. BUT, you do get what you pay for!",
        "body": "Everything was beautiful. I especially loved the upper rooftop restaurant. Sushi was AMAZING.\nI like discounts. BUT, you do get what you pay for!"
      },
      {
        "reviewer": "Evan",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Yubune King",
        "stay": "3 nights · September 2024",
        "guestType": "Couple",
        "reviewed": "October 19, 2024",
        "title": "Relaxing chaos",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Exceptional service",
        "negative": "Breakfast and food options at different times of day was very confusing.",
        "body": "Exceptional service\nBreakfast and food options at different times of day was very confusing."
      },
      {
        "reviewer": "July",
        "activeSince": "Active since 2022",
        "country": "South Africa",
        "room": "Deluxe King Room",
        "stay": "4 nights · October 2024",
        "guestType": "Solo traveler",
        "reviewed": "October 14, 2024",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The room was spacious with large windows and high ceilings. The bed was super comfortable and I had everything I needed in the room for a comfortable stay.",
        "negative": "I had breakfast at the hotel one morning and I asked for poached eggs, the eggs were overcooked and I think I overpaid for what I got.",
        "body": "The room was spacious with large windows and high ceilings. The bed was super comfortable and I had everything I needed in the room for a comfortable stay.\nI had breakfast at the hotel one morning and I asked for poached eggs, the eggs were overcooked and I think I overpaid for what I got."
      },
      {
        "reviewer": "Brodey",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "2 nights · October 2024",
        "guestType": "Solo traveler",
        "reviewed": "October 6, 2024",
        "title": "Most stylish hotel I’ve ever stayed with a wonderful and professional service staff. Bravo all around.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Design elements were incredible!",
        "negative": "I have no complaints about it.",
        "body": "Design elements were incredible!\nI have no complaints about it."
      },
      {
        "reviewer": "Jonathan",
        "activeSince": "Active since 2020",
        "country": "Australia",
        "room": "Zen Deluxe Suite",
        "stay": "1 night · September 2024",
        "guestType": "Solo traveler",
        "reviewed": "October 4, 2024",
        "title": "Proper foot massage with a view n dat",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "One of the best breakfast I have ever had.",
        "negative": "Have more wine and food in the room",
        "body": "One of the best breakfast I have ever had.\nHave more wine and food in the room"
      },
      {
        "reviewer": "Kim",
        "activeSince": "Active since 2011",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · September 2024",
        "guestType": "Solo traveler",
        "reviewed": "September 18, 2024",
        "title": "Great location and luxurious hotel",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Luxurious and minimal. Room had high ceilings and gorgeous view.",
        "negative": "Quite loud outside and you could hear the outside noise in the room.",
        "body": "Luxurious and minimal. Room had high ceilings and gorgeous view.\nQuite loud outside and you could hear the outside noise in the room."
      },
      {
        "reviewer": "Bretag",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "2 nights · September 2024",
        "guestType": "Couple",
        "reviewed": "September 8, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location, incredible rooftop and wonderful rooms!!!",
        "negative": "",
        "body": "Great location, incredible rooftop and wonderful rooms!!!"
      },
      {
        "reviewer": "Murray",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · September 2024",
        "guestType": "Couple",
        "reviewed": "September 3, 2024",
        "title": "Excellent location, amenities, and service",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location in the West Loop, you’re in the middle of everything.",
        "negative": "None",
        "body": "Great location in the West Loop, you’re in the middle of everything.\nNone"
      },
      {
        "reviewer": "Elyssia",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · July 2024",
        "guestType": "Couple",
        "reviewed": "August 18, 2024",
        "title": "Beautiful hotel",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "This place was the whole package. Great staff, relaxing atmosphere, and some of the best meals I've ever had. All in a great location too.",
        "negative": "It can get pretty pricey, but the quality of the hotel makes it worth it.",
        "body": "This place was the whole package. Great staff, relaxing atmosphere, and some of the best meals I've ever had. All in a great location too.\nIt can get pretty pricey, but the quality of the hotel makes it worth it."
      },
      {
        "reviewer": "Ayanna",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · August 2024",
        "guestType": "Group",
        "reviewed": "August 14, 2024",
        "title": "Superb. Would love to return or stay at another location.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Everything: location, decor, scent, staff, amenities.",
        "negative": "Found a hair in bathroom sink",
        "body": "Everything: location, decor, scent, staff, amenities.\nFound a hair in bathroom sink"
      },
      {
        "reviewer": "Rita",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · August 2024",
        "guestType": "Couple",
        "reviewed": "August 6, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Nice facilities, cool roof top bar, very friendly and attentive staff.",
        "negative": "",
        "body": "Nice facilities, cool roof top bar, very friendly and attentive staff."
      },
      {
        "reviewer": "Patricia",
        "activeSince": "",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "2 nights · August 2024",
        "guestType": "Group",
        "reviewed": "August 6, 2024",
        "title": "We will be back",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Food was delicious",
        "negative": "",
        "body": "Food was delicious"
      },
      {
        "reviewer": "Terrence",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "2 nights · August 2024",
        "guestType": "Family",
        "reviewed": "August 5, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location",
        "negative": "",
        "body": "Great location"
      },
      {
        "reviewer": "Xavier",
        "activeSince": "Active since 2011",
        "country": "Hong Kong",
        "room": "Yubune King",
        "stay": "5 nights · July 2024",
        "guestType": "Couple",
        "reviewed": "August 1, 2024",
        "title": "Very nice stay in great location and nice design.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Location and design\nStaff were friendly\nAlthough it had some weight machine, the gym is limited overall. Does not miss much just some machine and bigger weights to be able to have something decent.",
        "negative": "Service was good but not always perfect (turndown service not done in first day, not changing dirty glassware…)",
        "body": "Location and design\nStaff were friendly\nAlthough it had some weight machine, the gym is limited overall. Does not miss much just some machine and bigger weights to be able to have something decent.\nService was good but not always perfect (turndown service not done in first day, not changing dirty glassware…)"
      },
      {
        "reviewer": "Sepi",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · July 2024",
        "guestType": "Couple",
        "reviewed": "July 29, 2024",
        "title": "Excellent location, great hospitality, beautiful design.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Excellent location, great hospitality, beautiful design. Loved the welcome drink and towel",
        "negative": "No complaints",
        "body": "Excellent location, great hospitality, beautiful design. Loved the welcome drink and towel\nNo complaints"
      },
      {
        "reviewer": "Aysegul",
        "activeSince": "Active since 2014",
        "country": "Sweden",
        "room": "Yubune King",
        "stay": "3 nights · July 2024",
        "guestType": "Couple",
        "reviewed": "July 27, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The location is amazing, in a hip neighbourhood full of restaurants, 15 mins L train ride from the centre. Everything about the hotel is amazing. Roof top and restaurant is top notch. The bed is extremely comfortable. The staff was lovely. We liked every minute of it and definitely will be back.",
        "negative": "",
        "body": "The location is amazing, in a hip neighbourhood full of restaurants, 15 mins L train ride from the centre. Everything about the hotel is amazing. Roof top and restaurant is top notch. The bed is extremely comfortable. The staff was lovely. We liked every minute of it and definitely will be back."
      },
      {
        "reviewer": "Taylor",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Deluxe City View",
        "stay": "2 nights · July 2024",
        "guestType": "Couple",
        "reviewed": "July 22, 2024",
        "title": "We had a fabulous time staying at Nobu and will definitely be back!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "We loved staying at Nobu for a long weekend! We were in town for a wedding in Fulton market area and had an exceptional time. The hotel was located in the middle of everything and within walking distance to plenty of great restaurants, bars and shopping. The facilities were pristine and our room was very comfortable. The hotel was even able to accommodate us earlier than check in time due to arriving earlier than expected. We will definitely be back!",
        "negative": "Given the location of the property it can get noisy at night. This really didn’t bother us but could be important to know for other guests.",
        "body": "We loved staying at Nobu for a long weekend! We were in town for a wedding in Fulton market area and had an exceptional time. The hotel was located in the middle of everything and within walking distance to plenty of great restaurants, bars and shopping. The facilities were pristine and our room was very comfortable. The hotel was even able to accommodate us earlier than check in time due to arriving earlier than expected. We will definitely be back!\nGiven the location of the property it can get noisy at night. This really didn’t bother us but could be important to know for other guests."
      },
      {
        "reviewer": "Anna",
        "activeSince": "Active since 2014",
        "country": "Netherlands",
        "room": "Yubune King",
        "stay": "5 nights · April 2024",
        "guestType": "Group",
        "reviewed": "June 21, 2024",
        "title": "Nobu is amazing as always",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Very minimalistic, yet sophisticated property in the best japanese traditions. Beautifully decorated and extremely spacious room with great views, in-room wooden bath with all the required necessities gives a feeling of staying at onsen, which helps if you'd rather be in Japan, but are stuck in Chicago :) Small, but well-maintained sauna and swimming pool on the ground floor - both were completely empty during my stay. Nobu restaurant is on the first floor, the food is amazing as always! Try their fatty tuna tartar with caviar - you won't regret it!",
        "negative": "Would be nice to have discounts at the restaurant for the hotel clients",
        "body": "Very minimalistic, yet sophisticated property in the best japanese traditions. Beautifully decorated and extremely spacious room with great views, in-room wooden bath with all the required necessities gives a feeling of staying at onsen, which helps if you'd rather be in Japan, but are stuck in Chicago :) Small, but well-maintained sauna and swimming pool on the ground floor - both were completely empty during my stay. Nobu restaurant is on the first floor, the food is amazing as always! Try their fatty tuna tartar with caviar - you won't regret it!\nWould be nice to have discounts at the restaurant for the hotel clients"
      },
      {
        "reviewer": "Jonathan",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "2 nights · March 2024",
        "guestType": "Couple",
        "reviewed": "June 8, 2024",
        "title": "Great experience at a high end hotel.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Beautiful Japanese style hotel in the west loop. Great staff amazing location.",
        "negative": "Nothing",
        "body": "Beautiful Japanese style hotel in the west loop. Great staff amazing location.\nNothing"
      },
      {
        "reviewer": "Abhishek",
        "activeSince": "Active since 2018",
        "country": "India",
        "room": "Deluxe King Room",
        "stay": "4 nights · May 2024",
        "guestType": "Family",
        "reviewed": "May 19, 2024",
        "title": "Perfect location, excellent staff and a beautiful view from the room.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Best possible location, amazing staff, superb room & view",
        "negative": "",
        "body": "Best possible location, amazing staff, superb room & view"
      },
      {
        "reviewer": "Alastair",
        "activeSince": "Active since 2017",
        "country": "United Kingdom",
        "room": "Deluxe King Room",
        "stay": "5 nights · May 2024",
        "guestType": "Couple",
        "reviewed": "May 4, 2024",
        "title": "Lovely hotel in a vibrant neighbourhood close to the centre of Chicago",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location, roof top bar, gym, staff",
        "negative": "Gym could have been bigger with addition of rowing machines.",
        "body": "Location, roof top bar, gym, staff\nGym could have been bigger with addition of rowing machines."
      },
      {
        "reviewer": "Maria",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "4 nights · April 2024",
        "guestType": "Couple",
        "reviewed": "May 1, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Amazing hotel! Location is perfect too.",
        "negative": "",
        "body": "Amazing hotel! Location is perfect too."
      },
      {
        "reviewer": "Romero",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "2 nights · April 2024",
        "guestType": "Couple",
        "reviewed": "April 29, 2024",
        "title": "Attentive staff, clean and large room, aesthetically pleasing.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The room size was great. As was location.",
        "negative": "Noisy neighborhood.",
        "body": "The room size was great. As was location.\nNoisy neighborhood."
      },
      {
        "reviewer": "Tanesha",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Zen Deluxe Suite",
        "stay": "1 night · April 2024",
        "guestType": "Solo traveler",
        "reviewed": "April 27, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "My stay was wonderful. I treated myself to one night in the Zen Suite for my birthday and I enjoyed every second. To the relaxing soak in the soaking tub to the cool environment at the rooftop bar. The staff was super friendly and helpful. Using arrival I was greeted my the wonderful front desk staff. In my room I had a complimentary bottle of wine waiting for me wit a nice birthday card from the hotel. I was able to request a late check out time as well. I couldn't have asked for a better way to celebrate my special day! The views from my room were amazing! Thank you Nobu for helping to make my birthday so special!",
        "negative": "",
        "body": "My stay was wonderful. I treated myself to one night in the Zen Suite for my birthday and I enjoyed every second. To the relaxing soak in the soaking tub to the cool environment at the rooftop bar. The staff was super friendly and helpful. Using arrival I was greeted my the wonderful front desk staff. In my room I had a complimentary bottle of wine waiting for me wit a nice birthday card from the hotel. I was able to request a late check out time as well. I couldn't have asked for a better way to celebrate my special day! The views from my room were amazing! Thank you Nobu for helping to make my birthday so special!"
      },
      {
        "reviewer": "Jane",
        "activeSince": "Active since 2017",
        "country": "United Kingdom",
        "room": "Deluxe King Room",
        "stay": "4 nights · March 2024",
        "guestType": "Couple",
        "reviewed": "April 27, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "We had an amazing stay at the Nobu for our Honeymoon. We were welcomed with a much needed hot drink and hot towel whilst we checked in - the lobby smelled amazing! Our room was spacious and had all the amenities we required and we loved the Google Chrome and Dyson hair dryer. All the staff were wonderful and we will definitely look to stay in another Nobu location in the future.",
        "negative": "",
        "body": "We had an amazing stay at the Nobu for our Honeymoon. We were welcomed with a much needed hot drink and hot towel whilst we checked in - the lobby smelled amazing! Our room was spacious and had all the amenities we required and we loved the Google Chrome and Dyson hair dryer. All the staff were wonderful and we will definitely look to stay in another Nobu location in the future."
      },
      {
        "reviewer": "Niru",
        "activeSince": "Active since 2022",
        "country": "United Kingdom",
        "room": "Deluxe King Room",
        "stay": "7 nights · April 2024",
        "guestType": "Couple",
        "reviewed": "April 27, 2024",
        "title": "Would definitely recommend this,",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Amazing room, very large and lovely. A splendid bathroom again generous in size. Staff fantastic, particularly Juan at the front desk. Decent gym. Didn't use pool but it looked mellow. The area has plenty of restaurants and bars, really well located.",
        "negative": "",
        "body": "Amazing room, very large and lovely. A splendid bathroom again generous in size. Staff fantastic, particularly Juan at the front desk. Decent gym. Didn't use pool but it looked mellow. The area has plenty of restaurants and bars, really well located."
      },
      {
        "reviewer": "Adam",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "2 nights · April 2024",
        "guestType": "Couple",
        "reviewed": "April 18, 2024",
        "title": "Cool upscale hotel in the center of the restaurant universe",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location close to some of the best restaurants in the US. Easy walk to Michigan Ave and the riverwalk. Awesome Dyson hairdryer provided. Fantastic rooftop bar with the most amazing view of downtown. The bellhop was amazing and friendly.",
        "negative": "Bathroom even with the lighting is a little dark.",
        "body": "Great location close to some of the best restaurants in the US. Easy walk to Michigan Ave and the riverwalk. Awesome Dyson hairdryer provided. Fantastic rooftop bar with the most amazing view of downtown. The bellhop was amazing and friendly.\nBathroom even with the lighting is a little dark."
      },
      {
        "reviewer": "Not helpfulHeleanna",
        "activeSince": "Active since 2014",
        "country": "Ethiopia",
        "room": "Deluxe King Room",
        "stay": "1 night · April 2024",
        "guestType": "Solo traveler",
        "reviewed": "April 15, 2024",
        "title": "Engulfed in simple luxury",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Proximity to a Buzzing area, large spaces and very clean, welcoming staff",
        "negative": "",
        "body": "Proximity to a Buzzing area, large spaces and very clean, welcoming staff"
      },
      {
        "reviewer": "Konstantinos",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · April 2024",
        "guestType": "Couple",
        "reviewed": "April 7, 2024",
        "title": "Weekend Trip to the City",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great aesthetic, spacious room, luxurious amenities!",
        "negative": "Everything was great!",
        "body": "Great aesthetic, spacious room, luxurious amenities!\nEverything was great!"
      },
      {
        "reviewer": "George",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · March 2024",
        "guestType": "Group",
        "reviewed": "April 1, 2024",
        "title": "Can't wait to go back!",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Tiffany at front desk and the bell staff were excellent and so personable. Room was lovely and the pool and steam room were an unexpected treat (next time I will bring a swimsuit). Breakfast was good, but not outstanding. And I loved the neighborhood (restaurants, bakery) even though it was outside of downtown.",
        "negative": "A bit noisy on my floor late at night, possibly due to service door. Floor lamp was not controlled with the other lights and had to be unplugged.",
        "body": "Tiffany at front desk and the bell staff were excellent and so personable. Room was lovely and the pool and steam room were an unexpected treat (next time I will bring a swimsuit). Breakfast was good, but not outstanding. And I loved the neighborhood (restaurants, bakery) even though it was outside of downtown.\nA bit noisy on my floor late at night, possibly due to service door. Floor lamp was not controlled with the other lights and had to be unplugged."
      },
      {
        "reviewer": "L",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · March 2024",
        "guestType": "Family",
        "reviewed": "March 30, 2024",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The beds, staff, fitness center, and location. Loved the Dyson hair dryer and flat iron in the room.",
        "negative": "Rooftop Nobu was just ok. The main restaurant and lounge on 1st floor is much better.",
        "body": "The beds, staff, fitness center, and location. Loved the Dyson hair dryer and flat iron in the room.\nRooftop Nobu was just ok. The main restaurant and lounge on 1st floor is much better."
      },
      {
        "reviewer": "Priti",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · March 2024",
        "guestType": "Solo traveler",
        "reviewed": "March 29, 2024",
        "title": "Luxury in the West Loop - A Cut Above",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "This hotel is in a wonderful location in the West Loop of Chicago. The property is relatively new and the interiors are decadent. While this hotel is a smaller boutique style version of most Nobu 's which are huge, it is sumptuous and cozy. You can tell the rooms were designed with a thought process for feng shui, etc. The hotel staff is lovely, namely Juan at the front desk!!!! I will totally be back to this hotel and would recommend to anyone visiting Chicago.",
        "negative": "Hotel is a bit small, amenities like fitness were basic. No spa at the property... steam room is available but also quite small. Room textiles could have been a bit more luxe for the price point.",
        "body": "This hotel is in a wonderful location in the West Loop of Chicago. The property is relatively new and the interiors are decadent. While this hotel is a smaller boutique style version of most Nobu 's which are huge, it is sumptuous and cozy. You can tell the rooms were designed with a thought process for feng shui, etc. The hotel staff is lovely, namely Juan at the front desk!!!! I will totally be back to this hotel and would recommend to anyone visiting Chicago.\nHotel is a bit small, amenities like fitness were basic. No spa at the property... steam room is available but also quite small. Room textiles could have been a bit more luxe for the price point."
      },
      {
        "reviewer": "Sunipa",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "4 nights · March 2024",
        "guestType": "Family",
        "reviewed": "March 28, 2024",
        "title": "Fabulous service, beautiful rooms & bathrooms, smells amazing!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Minimalist decor but every single thing was intentional and well placed. And it",
        "negative": "Wish there was a hot tub! And adjoining room types are only to suites :(. Parking rates were outrageous, had to park elsewhere using spothero.",
        "body": "Minimalist decor but every single thing was intentional and well placed. And it\nWish there was a hot tub! And adjoining room types are only to suites :(. Parking rates were outrageous, had to park elsewhere using spothero."
      },
      {
        "reviewer": "Margaret",
        "activeSince": "Active since 2010",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · February 2024",
        "guestType": "Couple",
        "reviewed": "March 16, 2024",
        "title": "A favorite place to stay when visiting Chicago",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Always best service provided.",
        "negative": "",
        "body": "Always best service provided."
      },
      {
        "reviewer": "Joachim",
        "activeSince": "Active since 2015",
        "country": "Belgium",
        "room": "Deluxe King Room",
        "stay": "1 night · March 2024",
        "guestType": "Solo traveler",
        "reviewed": "March 13, 2024",
        "title": "I will come back but the the cleaning issue was not so cool :)",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "In room dining was good. The room is very good size and silent. Nobu restaurant and location for other restaurants is amazing, staff was very friendly.\nIn room dining nobu and sliders Ii ordered where cold. For that price you expect them to arrive warm.\nThe room was not cleaned on day two, I decided to book an extra day and got no cleaning of the room.\nAsked to make up my bed and do the bathroom and this was not done. Also no cleaning brush next to toilet for the toilet. Now I asked two times to make up my room and all i got was three towels and some water. For this price and for the name NOBU I did expect the room to be cleaned. Also I looked for the sauna or steam rooms and could not find it near the pool, maybe should be better signaled.",
        "negative": "The staff was really friendly though.",
        "body": "In room dining was good. The room is very good size and silent. Nobu restaurant and location for other restaurants is amazing, staff was very friendly.\nIn room dining nobu and sliders Ii ordered where cold. For that price you expect them to arrive warm.\nThe room was not cleaned on day two, I decided to book an extra day and got no cleaning of the room.\nAsked to make up my bed and do the bathroom and this was not done. Also no cleaning brush next to toilet for the toilet. Now I asked two times to make up my room and all i got was three towels and some water. For this price and for the name NOBU I did expect the room to be cleaned. Also I looked for the sauna or steam rooms and could not find it near the pool, maybe should be better signaled.\nThe staff was really friendly though."
      },
      {
        "reviewer": "Jeffrey",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · March 2024",
        "guestType": "Couple",
        "reviewed": "March 11, 2024",
        "title": "We now have NOBU on our list of places to stay wherever they have a property!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "EVERYONE at the property was friendly and helpful, above and beyond!",
        "negative": "",
        "body": "EVERYONE at the property was friendly and helpful, above and beyond!"
      },
      {
        "reviewer": "Brystal",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "3 nights · February 2024",
        "guestType": "Solo traveler",
        "reviewed": "February 25, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Loved the design and aesthetic. Gorgeous room, great spa facilities, and amazing on site restaurant.",
        "negative": "Cancellation policy was a bit outrageous. Limited to no support from staff which was surprising.",
        "body": "Loved the design and aesthetic. Gorgeous room, great spa facilities, and amazing on site restaurant.\nCancellation policy was a bit outrageous. Limited to no support from staff which was surprising."
      },
      {
        "reviewer": "Not helpfulEllen",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Deluxe City View",
        "stay": "2 nights · January 2024",
        "guestType": "Couple",
        "reviewed": "February 18, 2024",
        "title": "Amazing hotel!! Best in west loop!! Will be back!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Love it",
        "negative": "",
        "body": "Love it"
      },
      {
        "reviewer": "Oleg",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · February 2024",
        "guestType": "Couple",
        "reviewed": "February 18, 2024",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "I love Nobu hotels primarily for their aesthetics. I love Japanese minimalism, nice materials and restraint in decoration. Comfortable, cozy, beautiful and friendly staff. The size of the rooms is optimal, the beds are comfortable. We left the hotel and thought it was so good. By the way, very tasty breakfasts and coffee in the restaurant on the ground floor.",
        "negative": "late check-in and early check-out.",
        "body": "I love Nobu hotels primarily for their aesthetics. I love Japanese minimalism, nice materials and restraint in decoration. Comfortable, cozy, beautiful and friendly staff. The size of the rooms is optimal, the beds are comfortable. We left the hotel and thought it was so good. By the way, very tasty breakfasts and coffee in the restaurant on the ground floor.\nlate check-in and early check-out."
      },
      {
        "reviewer": "Farrah",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · February 2024",
        "guestType": "Solo traveler",
        "reviewed": "February 15, 2024",
        "title": "Luxury",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything and everyone were amazing.",
        "negative": "Staff were sweet as pie and restaurant was delish. From the doorman to the valet. Perfect experience.",
        "body": "Everything and everyone were amazing.\nStaff were sweet as pie and restaurant was delish. From the doorman to the valet. Perfect experience."
      },
      {
        "reviewer": "Deepak",
        "activeSince": "",
        "country": "India",
        "room": "Deluxe City View",
        "stay": "1 night · January 2024",
        "guestType": "Group",
        "reviewed": "January 22, 2024",
        "title": "A comfortable and pleasant place to stay",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "A now dish i had tried continental breakfast where toast and yogurt combination by fabulous.",
        "negative": "",
        "body": "A now dish i had tried continental breakfast where toast and yogurt combination by fabulous."
      },
      {
        "reviewer": "Mike",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · January 2024",
        "guestType": "Group",
        "reviewed": "January 11, 2024",
        "title": "Simply amazing",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything",
        "negative": "N/A",
        "body": "Everything\nN/A"
      },
      {
        "reviewer": "Carmel",
        "activeSince": "Active since 2023",
        "country": "Australia",
        "room": "Deluxe City View",
        "stay": "3 nights · December 2023",
        "guestType": "Couple",
        "reviewed": "December 22, 2023",
        "title": "Fantastic- highly recommend.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Location is fantastic, staff were wonderful and room was very clean.",
        "negative": "They charge for bottles of water.",
        "body": "Location is fantastic, staff were wonderful and room was very clean.\nThey charge for bottles of water."
      },
      {
        "reviewer": "Martha",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Deluxe King Room",
        "stay": "1 night · December 2023",
        "guestType": "Family",
        "reviewed": "December 11, 2023",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location and restaurants, rooms comfortable",
        "negative": "",
        "body": "Location and restaurants, rooms comfortable"
      },
      {
        "reviewer": "Lisa",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Deluxe City View",
        "stay": "2 nights · November 2023",
        "guestType": "Couple",
        "reviewed": "November 24, 2023",
        "title": "Lovely",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Loved the staff here! So friendly and willing to go above and beyond. Location is perfect. Room is spacious and clean. Would definitely stay again.",
        "negative": "Traffic noise outside, but it’s Chicago. Nothing you can really do about that.",
        "body": "Loved the staff here! So friendly and willing to go above and beyond. Location is perfect. Room is spacious and clean. Would definitely stay again.\nTraffic noise outside, but it’s Chicago. Nothing you can really do about that."
      },
      {
        "reviewer": "Shauneen",
        "activeSince": "Active since 2017",
        "country": "United Kingdom",
        "room": "Deluxe City View",
        "stay": "2 nights · November 2023",
        "guestType": "Couple",
        "reviewed": "November 21, 2023",
        "title": "Lovely modern industrial style hotel I would recommend",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The design was beautiful",
        "negative": "Some areas not so clean",
        "body": "The design was beautiful\nSome areas not so clean"
      },
      {
        "reviewer": "Mazen",
        "activeSince": "Active since 2013",
        "country": "Saudi Arabia",
        "room": "Deluxe City View",
        "stay": "3 nights · November 2023",
        "guestType": "Solo traveler",
        "reviewed": "November 10, 2023",
        "title": "Hassan from the front desk and his staff were fast and of great help to sort out my booking issue",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Clean, quiet, super friendly staff, great location for my work.",
        "negative": "Concrete ceilings for the room was different, but I get it’s part of the design.",
        "body": "Clean, quiet, super friendly staff, great location for my work.\nConcrete ceilings for the room was different, but I get it’s part of the design."
      }
    ],
    "arlo-chicago": [
      {
        "reviewer": "Raine",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Millennium King",
        "stay": "3 nights · June 2026",
        "guestType": "Couple",
        "reviewed": "June 29, 2026",
        "title": "Would definitely stay at Arlo again if in Chicago.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Clean, comfortable and right next to Millenium park.",
        "negative": "No complaints",
        "body": "Clean, comfortable and right next to Millenium park.\nNo complaints"
      },
      {
        "reviewer": "John",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "Two Queen",
        "stay": "1 night · June 2026",
        "guestType": "Group",
        "reviewed": "June 28, 2026",
        "title": "Solid choice for a few nights in the city",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location and facilities.",
        "negative": "Key cards were very sensitive and would de-activate",
        "body": "Great location and facilities.\nKey cards were very sensitive and would de-activate"
      },
      {
        "reviewer": "Lucinda",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "City King",
        "stay": "2 nights · June 2026",
        "guestType": "Couple",
        "reviewed": "June 28, 2026",
        "title": "A convenient stay in Chicago",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Very good location. Clean. Lovely staff who kindly moved us when we asked to move rooms. Very comfy bed and good shower. Ask for a high up room and ideally a room not facing the main highway!",
        "negative": "We were originally put on the 2nd floor right above the main entrance facing the street and it was extremely loud, we hardly slept at all from the traffic noise. We asked the reception staff if we could move rooms and they kindly obliged and gave us a room on the 14th floor facing the back street - much quieter and blackout blinds!",
        "body": "Very good location. Clean. Lovely staff who kindly moved us when we asked to move rooms. Very comfy bed and good shower. Ask for a high up room and ideally a room not facing the main highway!\nWe were originally put on the 2nd floor right above the main entrance facing the street and it was extremely loud, we hardly slept at all from the traffic noise. We asked the reception staff if we could move rooms and they kindly obliged and gave us a room on the 14th floor facing the back street - much quieter and blackout blinds!"
      },
      {
        "reviewer": "Mustafa",
        "activeSince": "Active since 2021",
        "country": "Turkey",
        "room": "City King",
        "stay": "1 night · June 2026",
        "guestType": "Solo traveler",
        "reviewed": "June 24, 2026",
        "title": "A good choice at a perfect location",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "I was informed during check-in that my room type had be changed due to a prior damage. It was handled professionally.",
        "negative": "",
        "body": "I was informed during check-in that my room type had be changed due to a prior damage. It was handled professionally."
      },
      {
        "reviewer": "Maxine",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Two Queen",
        "stay": "3 nights · May 2026",
        "guestType": "Solo traveler",
        "reviewed": "June 22, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location. Clean. Updated. Great on site restaurant and bar with delish food.",
        "negative": "",
        "body": "Location. Clean. Updated. Great on site restaurant and bar with delish food."
      },
      {
        "reviewer": "Rachel",
        "activeSince": "",
        "country": "United States",
        "room": "Two Queen",
        "stay": "1 night · June 2026",
        "guestType": "Group",
        "reviewed": "June 21, 2026",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Beds, staff, location, food!",
        "negative": "Parking is confusing",
        "body": "Beds, staff, location, food!\nParking is confusing"
      },
      {
        "reviewer": "Liam",
        "activeSince": "Active since 2022",
        "country": "United Kingdom",
        "room": "City King",
        "stay": "2 nights · June 2026",
        "guestType": "Solo traveler",
        "reviewed": "June 18, 2026",
        "title": "Amazing hotel",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Amazing location by millennium park and close to train stations",
        "negative": "Lovely clean room. Very comfortable",
        "body": "Amazing location by millennium park and close to train stations\nLovely clean room. Very comfortable"
      },
      {
        "reviewer": "Louay",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "King",
        "stay": "1 night · April 2026",
        "guestType": "Solo traveler",
        "reviewed": "June 17, 2026",
        "title": "Great stay",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "I loved the place and the staff were amazing",
        "negative": "",
        "body": "I loved the place and the staff were amazing"
      },
      {
        "reviewer": "Wojciech",
        "activeSince": "Active since 2012",
        "country": "Poland",
        "room": "City King",
        "stay": "1 night · June 2026",
        "guestType": "Solo traveler",
        "reviewed": "June 17, 2026",
        "title": "Great stay, will come back",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Staff was very friendly and attentive, I had an issue during my stay (a pickpocket stole my phone) and they did all they could to help, including calling their personal connections at the police. Then during tornado when no Uber was available, they managed to find me a great taxi. Excellent service.",
        "negative": "",
        "body": "Staff was very friendly and attentive, I had an issue during my stay (a pickpocket stole my phone) and they did all they could to help, including calling their personal connections at the police. Then during tornado when no Uber was available, they managed to find me a great taxi. Excellent service."
      },
      {
        "reviewer": "Louise",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "City King",
        "stay": "2 nights · June 2026",
        "guestType": "Couple",
        "reviewed": "June 15, 2026",
        "title": "I would highly recommend this hotel, hopefully the cleaning issue was an oversight.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great location, nice sized rooms and very comfy beds. Staff was great and breakfast very good. Excellent espresso!",
        "negative": "Room was not very clean, needed a good vacuum. Black hairs on the floor and in shower and on the shower walls.",
        "body": "Great location, nice sized rooms and very comfy beds. Staff was great and breakfast very good. Excellent espresso!\nRoom was not very clean, needed a good vacuum. Black hairs on the floor and in shower and on the shower walls."
      },
      {
        "reviewer": "Thank you for your review. We appreciate your feedback!Waldo",
        "activeSince": "Active since 2020",
        "country": "Cuba",
        "room": "Two Queen",
        "stay": "1 night · June 2026",
        "guestType": "Family",
        "reviewed": "June 13, 2026",
        "title": "It was phenomenal!",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Excelent service and breakfast. Coffee was superb! Location was impossible to improve! Room was very comfortable and the staff really friendly and welcoming!",
        "negative": "Banthroom cleanliness could have been better. The showers look old and it was dirty around the edges!",
        "body": "Excelent service and breakfast. Coffee was superb! Location was impossible to improve! Room was very comfortable and the staff really friendly and welcoming!\nBanthroom cleanliness could have been better. The showers look old and it was dirty around the edges!"
      },
      {
        "reviewer": "Karen",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "City King",
        "stay": "3 nights · June 2026",
        "guestType": "Couple",
        "reviewed": "June 13, 2026",
        "title": "We had a great stay. Friendly staff and on premises restaurant go far!Great shower and comfy bed. And location, location",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The location was perfect.",
        "negative": "Could have used a regular coffee maker. Like a big cup in bed.the velvet settee looked a little dirty and there were a couple of drip spots on the floor but the bathroom was very clean so not a big worry.",
        "body": "The location was perfect.\nCould have used a regular coffee maker. Like a big cup in bed.the velvet settee looked a little dirty and there were a couple of drip spots on the floor but the bathroom was very clean so not a big worry."
      },
      {
        "reviewer": "Christine",
        "activeSince": "Active since 2019",
        "country": "Canada",
        "room": "City King",
        "stay": "2 nights · June 2026",
        "guestType": "Couple",
        "reviewed": "June 13, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything! Warm and friendly service. Very helpful.",
        "negative": "",
        "body": "Everything! Warm and friendly service. Very helpful."
      },
      {
        "reviewer": "Sharon",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "City King ADA",
        "stay": "2 nights · June 2026",
        "guestType": "Couple",
        "reviewed": "June 10, 2026",
        "title": "Overall, this was one of the best hotel experiences I've had. Clean, comfortable, great food, and a",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "⭐⭐⭐⭐⭐ Amazing Stay at Alro Chicago\nI had an excellent experience at Alro Chicago and would absolutely stay here again. The hotel was incredibly clean, modern, and well-maintained from the lobby to the rooms. The staff was friendly and helpful throughout my stay, and the location made it easy to explore the city.\nOne of my favorite parts was the food. The restaurants were fantastic, and it was so convenient to have great dining options right in the hotel. Everything I tried was delicious, and the overall atmosphere felt upscale without being pretentious.\nI honestly don't have any major complaints. The only thing future guests should know is that the bathroom setup may be a little different from a traditional hotel bathroom. It's modern and functional, but it might take some getting used to if you're expecting a more standard layout.",
        "negative": "None.",
        "body": "⭐⭐⭐⭐⭐ Amazing Stay at Alro Chicago\nI had an excellent experience at Alro Chicago and would absolutely stay here again. The hotel was incredibly clean, modern, and well-maintained from the lobby to the rooms. The staff was friendly and helpful throughout my stay, and the location made it easy to explore the city.\nOne of my favorite parts was the food. The restaurants were fantastic, and it was so convenient to have great dining options right in the hotel. Everything I tried was delicious, and the overall atmosphere felt upscale without being pretentious.\nI honestly don't have any major complaints. The only thing future guests should know is that the bathroom setup may be a little different from a traditional hotel bathroom. It's modern and functional, but it might take some getting used to if you're expecting a more standard layout.\nNone."
      },
      {
        "reviewer": "Hayes",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "City King",
        "stay": "2 nights · June 2026",
        "guestType": "Couple",
        "reviewed": "June 7, 2026",
        "title": "It was great.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location for attending the festival in Millennium park and shopping on the magnificent mile",
        "negative": "",
        "body": "Great location for attending the festival in Millennium park and shopping on the magnificent mile"
      },
      {
        "reviewer": "Daisy",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "King",
        "stay": "3 nights · May 2026",
        "guestType": "Couple",
        "reviewed": "May 28, 2026",
        "title": "Great location, view and staff",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location! Get a room with a view of the “Bean”. The staff was great from the front desk, to the bartender at the restaurant, to the cleaning staff, especially Betty who cleaned the gym and elevators who was delightful and the gym was sparkling!",
        "negative": "",
        "body": "Great location! Get a room with a view of the “Bean”. The staff was great from the front desk, to the bartender at the restaurant, to the cleaning staff, especially Betty who cleaned the gym and elevators who was delightful and the gym was sparkling!"
      },
      {
        "reviewer": "Janice",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "City King",
        "stay": "1 night · May 2026",
        "guestType": "Couple",
        "reviewed": "May 26, 2026",
        "title": "Great Stay!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "We loved the subtly cool environment!",
        "negative": "It was great!",
        "body": "We loved the subtly cool environment!\nIt was great!"
      },
      {
        "reviewer": "Janice",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "King",
        "stay": "2 nights · May 2026",
        "guestType": "Couple",
        "reviewed": "May 26, 2026",
        "title": "Very enjoyable!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "It was clean, everyone was very nice, room was very comfortable. Definitely will stay again!",
        "negative": "More selection for room service",
        "body": "It was clean, everyone was very nice, room was very comfortable. Definitely will stay again!\nMore selection for room service"
      },
      {
        "reviewer": "Sophia",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "King",
        "stay": "3 nights · May 2026",
        "guestType": "Couple",
        "reviewed": "May 26, 2026",
        "title": "They are sweet and very caring",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everyone is very friendly and welcoming !",
        "negative": "Nothing it was super good",
        "body": "Everyone is very friendly and welcoming !\nNothing it was super good"
      },
      {
        "reviewer": "Carroll",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Two Queen",
        "stay": "2 nights · May 2026",
        "guestType": "Family",
        "reviewed": "May 26, 2026",
        "title": "Alright",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location\nWhen three check into the room and towels for two people?",
        "negative": "Price",
        "body": "Location\nWhen three check into the room and towels for two people?\nPrice"
      },
      {
        "reviewer": "Thank you for your review. We appreciate your feedback!Cedric",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "City King",
        "stay": "2 nights · May 2026",
        "guestType": "Couple",
        "reviewed": "May 25, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Ideally located, great staff",
        "negative": "",
        "body": "Ideally located, great staff"
      },
      {
        "reviewer": "Ernesto",
        "activeSince": "",
        "country": "United States",
        "room": "King",
        "stay": "2 nights · May 2026",
        "guestType": "Couple",
        "reviewed": "May 25, 2026",
        "title": "Excellent professional people",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Clean. Elegant vibe.",
        "negative": "Leaving",
        "body": "Clean. Elegant vibe.\nLeaving"
      },
      {
        "reviewer": "Constanza",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Two Queen",
        "stay": "1 night · May 2026",
        "guestType": "Group",
        "reviewed": "May 23, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "It was perfectly well located, the staff was super nice, great vibe hotel!!!\nWe had a great time, and would recommend 100%.",
        "negative": "Breakfast was very good, too!",
        "body": "It was perfectly well located, the staff was super nice, great vibe hotel!!!\nWe had a great time, and would recommend 100%.\nBreakfast was very good, too!"
      },
      {
        "reviewer": "Pablo",
        "activeSince": "Active since 2021",
        "country": "Spain",
        "room": "Two Queen",
        "stay": "2 nights · May 2026",
        "guestType": "Group",
        "reviewed": "May 12, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Perfect location, everything clean, personal always there for you.",
        "negative": "",
        "body": "Perfect location, everything clean, personal always there for you."
      },
      {
        "reviewer": "Christopher",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "King",
        "stay": "3 nights · May 2026",
        "guestType": "Solo traveler",
        "reviewed": "May 11, 2026",
        "title": "Arlo Chicago is the best",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The location and cleanliness of the hotel was amazing. The staff was very accommodating. As soon as I walked in I was greeted by an employee name Nick. Nike was very pivotal and helping me with directions and helping me find restaurants. Overall I will stay at this hotel every time I come to Chicago.",
        "negative": "I enjoyed my experience",
        "body": "The location and cleanliness of the hotel was amazing. The staff was very accommodating. As soon as I walked in I was greeted by an employee name Nick. Nike was very pivotal and helping me with directions and helping me find restaurants. Overall I will stay at this hotel every time I come to Chicago.\nI enjoyed my experience"
      },
      {
        "reviewer": "Anastasija",
        "activeSince": "Active since 2018",
        "country": "Switzerland",
        "room": "King",
        "stay": "7 nights · May 2026",
        "guestType": "Couple",
        "reviewed": "May 8, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "We had a very nice stay at the Arlo Chicago. The hotel was very clean, modern, and comfortable. The staff was very friendly and helpful from the first moment. We felt very welcome when we arrived. A special thank you to Ali and Antoine from the front office team for their kindness and support during our visit. We are very happy with our experience and would definitely come back again. We highly recommend this hotel and really enjoyed our time here.",
        "negative": "",
        "body": "We had a very nice stay at the Arlo Chicago. The hotel was very clean, modern, and comfortable. The staff was very friendly and helpful from the first moment. We felt very welcome when we arrived. A special thank you to Ali and Antoine from the front office team for their kindness and support during our visit. We are very happy with our experience and would definitely come back again. We highly recommend this hotel and really enjoyed our time here."
      },
      {
        "reviewer": "Robert",
        "activeSince": "Active since 2022",
        "country": "United Kingdom",
        "room": "City King ADA",
        "stay": "4 nights · May 2026",
        "guestType": "Couple",
        "reviewed": "May 8, 2026",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Clean hotel, near to city centre. Staff were helpful and overall had a great time",
        "negative": "Nothing",
        "body": "Clean hotel, near to city centre. Staff were helpful and overall had a great time\nNothing"
      },
      {
        "reviewer": "Josh",
        "activeSince": "Active since 2021",
        "country": "United Kingdom",
        "room": "Millennium King",
        "stay": "2 nights · March 2026",
        "guestType": "Couple",
        "reviewed": "April 27, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Brilliant location. Easy to find. Fairly reasonable priced car park near by. Clean and tidy hotel. Staff were nice.",
        "negative": "Having to pay for all the extras. Looking at a mini fridge thats full but having to pay extra! When the hotel is pricey enough anyway.",
        "body": "Brilliant location. Easy to find. Fairly reasonable priced car park near by. Clean and tidy hotel. Staff were nice.\nHaving to pay for all the extras. Looking at a mini fridge thats full but having to pay extra! When the hotel is pricey enough anyway."
      },
      {
        "reviewer": "Freeman",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Two Queen",
        "stay": "4 nights · April 2026",
        "guestType": "Group",
        "reviewed": "April 26, 2026",
        "title": "Despite minor inconvenience, would stay again!",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "The location was perfect! It was close to everything on our itinerary and made walking/getting around easy. The room was spacious for 4 people and it was very secure at night. You needed a key card to enter the building which was nice.\nThe restaurant/ happy hour was 10/10. Great food and friendly staff!",
        "negative": "We didn’t get cleaning service until the day before we left and had to keep asking for fresh towels. Also, the WiFi didn’t work our entire stay.",
        "body": "The location was perfect! It was close to everything on our itinerary and made walking/getting around easy. The room was spacious for 4 people and it was very secure at night. You needed a key card to enter the building which was nice.\nThe restaurant/ happy hour was 10/10. Great food and friendly staff!\nWe didn’t get cleaning service until the day before we left and had to keep asking for fresh towels. Also, the WiFi didn’t work our entire stay."
      },
      {
        "reviewer": "Kelly",
        "activeSince": "Active since 2026",
        "country": "United States",
        "room": "City King",
        "stay": "2 nights · February 2026",
        "guestType": "Couple",
        "reviewed": "April 25, 2026",
        "title": "Great for Chicago newbies",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "A beautiful cute hotel! Staff made this such a great stay!",
        "negative": "I can’t think of a single thing I disliked.",
        "body": "A beautiful cute hotel! Staff made this such a great stay!\nI can’t think of a single thing I disliked."
      },
      {
        "reviewer": "Not helpfulGail",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "City King",
        "stay": "2 nights · February 2026",
        "guestType": "Couple",
        "reviewed": "February 16, 2026",
        "title": "On our repeat list for sure. Bryson who checked us in even remembered us the day after to ask how did we enjoy the event",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Personable staff at check-in and throughout our stay. Very convenient to the Chicago Theater and many great restaurants. Clean, nice rooms and comfortable bed!",
        "negative": "Not a fan of their coffee maker and selections, but not a big deal!",
        "body": "Personable staff at check-in and throughout our stay. Very convenient to the Chicago Theater and many great restaurants. Clean, nice rooms and comfortable bed!\nNot a fan of their coffee maker and selections, but not a big deal!"
      },
      {
        "reviewer": "Ryan",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Millennium King",
        "stay": "4 nights · February 2026",
        "guestType": "Couple",
        "reviewed": "February 16, 2026",
        "title": "Excellent Chicago stay, will definitely be back!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Amazing staff, great location, clean and comfortable rooms, great views of Millennium Park and the lake!",
        "negative": "Nothing to dislike!",
        "body": "Amazing staff, great location, clean and comfortable rooms, great views of Millennium Park and the lake!\nNothing to dislike!"
      },
      {
        "reviewer": "Steve",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "City King",
        "stay": "2 nights · February 2026",
        "guestType": "Couple",
        "reviewed": "February 11, 2026",
        "title": "All over great hospitality and clean property",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Customer service",
        "negative": "Pillows",
        "body": "Customer service\nPillows"
      },
      {
        "reviewer": "Paul",
        "activeSince": "Active since 2014",
        "country": "United Kingdom",
        "room": "City King",
        "stay": "5 nights · February 2026",
        "guestType": "Solo traveler",
        "reviewed": "February 10, 2026",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Restaurant food was great",
        "negative": "",
        "body": "Restaurant food was great"
      },
      {
        "reviewer": "Awad",
        "activeSince": "Active since 2015",
        "country": "Saudi Arabia",
        "room": "City King",
        "stay": "1 night · February 2026",
        "guestType": "Family",
        "reviewed": "February 9, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The staff were phenomenal. We received a text the day before arrival, our request for connecting rooms was honored (which made traveling with our kids so much easier), and the room was sparkling clean with everything in perfect working order. We were given an early check-in without even asking and also received a late check-out. Everyone was helpful, friendly, and smiling, and both check-in and check-out were incredibly fast. We’ll definitely be back!",
        "negative": "Nothing",
        "body": "The staff were phenomenal. We received a text the day before arrival, our request for connecting rooms was honored (which made traveling with our kids so much easier), and the room was sparkling clean with everything in perfect working order. We were given an early check-in without even asking and also received a late check-out. Everyone was helpful, friendly, and smiling, and both check-in and check-out were incredibly fast. We’ll definitely be back!\nNothing"
      },
      {
        "reviewer": "Ronda",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Millennium King",
        "stay": "2 nights · January 2026",
        "guestType": "Couple",
        "reviewed": "February 1, 2026",
        "title": "Staff were amazing. Clean and great location. Beer selection at restaurant and bar was lacking.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location",
        "negative": "Bar stool’s uncomfortable",
        "body": "Great location\nBar stool’s uncomfortable"
      },
      {
        "reviewer": "Kimberly",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Two Queen",
        "stay": "3 nights · January 2026",
        "guestType": "Couple",
        "reviewed": "January 31, 2026",
        "title": "Lovely stay in Chicago",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Clean and comfortable room. Amazing location right on Michigan Avenue.",
        "negative": "Nothing",
        "body": "Clean and comfortable room. Amazing location right on Michigan Avenue.\nNothing"
      },
      {
        "reviewer": "Letícia",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "City King",
        "stay": "1 night · January 2026",
        "guestType": "Couple",
        "reviewed": "January 30, 2026",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Clean, well-located, and with good staff, but unfortunately you can hear everything your neighbors do. I couldn’t sleep well because of it.",
        "negative": "Loud",
        "body": "Clean, well-located, and with good staff, but unfortunately you can hear everything your neighbors do. I couldn’t sleep well because of it.\nLoud"
      },
      {
        "reviewer": "Kenneth",
        "activeSince": "",
        "country": "United States",
        "room": "King",
        "stay": "1 night · January 2026",
        "guestType": "Couple",
        "reviewed": "January 28, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "What else can be said when everything was just right? They Goldiloxed me!",
        "negative": "Could they have done a little something about the minus 8 degree F temperature outside?",
        "body": "What else can be said when everything was just right? They Goldiloxed me!\nCould they have done a little something about the minus 8 degree F temperature outside?"
      },
      {
        "reviewer": "Bryce",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "Millennium Queen ADA",
        "stay": "1 night · December 2025",
        "guestType": "Couple",
        "reviewed": "January 18, 2026",
        "title": "Was only 2 days one night the stay was great",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Clean friendly staff great location",
        "negative": "Nothing about the property I disliked the guests next to us at the time were a bit loud in the morning but that’s to be expected I feel like",
        "body": "Clean friendly staff great location\nNothing about the property I disliked the guests next to us at the time were a bit loud in the morning but that’s to be expected I feel like"
      },
      {
        "reviewer": "Not helpfulEphantus",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "City King",
        "stay": "2 nights · January 2026",
        "guestType": "Family",
        "reviewed": "January 14, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Nice clean rooms with awesome views.",
        "negative": "",
        "body": "Nice clean rooms with awesome views."
      },
      {
        "reviewer": "Marily",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "Two Queen",
        "stay": "4 nights · January 2026",
        "guestType": "Family",
        "reviewed": "January 12, 2026",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Everything was close to every part I wanted to go around the city",
        "negative": "How expensive it was the little bar in our room and no free coffee?",
        "body": "Everything was close to every part I wanted to go around the city\nHow expensive it was the little bar in our room and no free coffee?"
      },
      {
        "reviewer": "Dalia",
        "activeSince": "Active since 2019",
        "country": "Puerto Rico",
        "room": "Two Queen",
        "stay": "4 nights · January 2026",
        "guestType": "Couple",
        "reviewed": "January 10, 2026",
        "title": "This is my second time in Arlo and I will repeat this wonderful experience every year.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location and customer service.",
        "negative": "Nothing. It was amazing.",
        "body": "Location and customer service.\nNothing. It was amazing."
      },
      {
        "reviewer": "Valerie",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "City Queen ADA",
        "stay": "1 night · December 2025",
        "guestType": "Couple",
        "reviewed": "January 8, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location close to the train station.",
        "negative": "",
        "body": "Great location close to the train station."
      },
      {
        "reviewer": "Jodie",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "Two Queen",
        "stay": "3 nights · January 2026",
        "guestType": "Group",
        "reviewed": "January 7, 2026",
        "title": "Awesome staff and ease of getting to everything on Michigan Ave",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Central to everything on Michigan Ave",
        "negative": "A little bit loud at night with the sirens but no biggy",
        "body": "Central to everything on Michigan Ave\nA little bit loud at night with the sirens but no biggy"
      },
      {
        "reviewer": "Daron",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "King",
        "stay": "3 nights · January 2026",
        "guestType": "Solo traveler",
        "reviewed": "January 6, 2026",
        "title": "I had a wonderful time.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Clean",
        "negative": "Noisy!! Look like someone was doing some construction work. Also, took housekeeping so long to bring one roll a tissue up to my room. Almost a hour to get tissue.",
        "body": "Clean\nNoisy!! Look like someone was doing some construction work. Also, took housekeeping so long to bring one roll a tissue up to my room. Almost a hour to get tissue."
      },
      {
        "reviewer": "Engstrand",
        "activeSince": "Active since 2021",
        "country": "Ireland",
        "room": "City King",
        "stay": "2 nights · December 2025",
        "guestType": "Couple",
        "reviewed": "January 5, 2026",
        "title": "Great location, welcoming staff, great food, a little noisy",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The staff was wonderful, very helpful and easy going. There is a lovely restaurant attached to the hotel that hotel guests receive a discount for. The food was great! The room itself was very clean, spacious for a big city room and you can't beat the location for downtown Chicago. The view wasn't bad either!",
        "negative": "The only thing we had an issue with was hearing other guests in rooms near us. A family was staying either next to or above us and we could hear the kids yelling and the parents yelling at the kids, running around etc. Normal family stuff but the walls seemed a bit thin.",
        "body": "The staff was wonderful, very helpful and easy going. There is a lovely restaurant attached to the hotel that hotel guests receive a discount for. The food was great! The room itself was very clean, spacious for a big city room and you can't beat the location for downtown Chicago. The view wasn't bad either!\nThe only thing we had an issue with was hearing other guests in rooms near us. A family was staying either next to or above us and we could hear the kids yelling and the parents yelling at the kids, running around etc. Normal family stuff but the walls seemed a bit thin."
      },
      {
        "reviewer": "Brookhart",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "Millennium King",
        "stay": "1 night · December 2025",
        "guestType": "Couple",
        "reviewed": "January 5, 2026",
        "title": "Celebrating my wife’s birthday and she LOVED it. We were very happy with our stay, will book again.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location and helpful staff",
        "negative": "Parking was expensive and a bit inconvenient.",
        "body": "Location and helpful staff\nParking was expensive and a bit inconvenient."
      },
      {
        "reviewer": "Bulelwa",
        "activeSince": "Active since 2012",
        "country": "South Korea",
        "room": "City King",
        "stay": "3 nights · December 2025",
        "guestType": "Solo traveler",
        "reviewed": "January 4, 2026",
        "title": "Home away from home",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Everything! The staff, the people and the city itself.",
        "negative": "Nothing",
        "body": "Everything! The staff, the people and the city itself.\nNothing"
      },
      {
        "reviewer": "Wendy",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Two Queen",
        "stay": "1 night · December 2025",
        "guestType": "Family",
        "reviewed": "January 4, 2026",
        "title": "Perfect location and clean",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Location",
        "negative": "Parking was bit far",
        "body": "Location\nParking was bit far"
      },
      {
        "reviewer": "Thank you for your review. We appreciate your feedback!Manuel",
        "activeSince": "Active since 2020",
        "country": "Mexico",
        "room": "Two Queen",
        "stay": "6 nights · December 2025",
        "guestType": "Group",
        "reviewed": "January 4, 2026",
        "title": "Excellent Location and Service.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Hotel location is excellent. Restaurant, staff and rooms are great.",
        "negative": "During cleaning room service we realized that floor is not properly cleaned. In general everything went good. I traveled with my family and some of them just speak Spanish. In my case, I have no issues but I think they would have been comfortable if they could have spoken on their native language with the staff.",
        "body": "Hotel location is excellent. Restaurant, staff and rooms are great.\nDuring cleaning room service we realized that floor is not properly cleaned. In general everything went good. I traveled with my family and some of them just speak Spanish. In my case, I have no issues but I think they would have been comfortable if they could have spoken on their native language with the staff."
      },
      {
        "reviewer": "Victor",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "King",
        "stay": "3 nights · January 2026",
        "guestType": "Couple",
        "reviewed": "January 2, 2026",
        "title": "The staff was amazing",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great atmosphere",
        "negative": "",
        "body": "Great atmosphere"
      },
      {
        "reviewer": "Saracat67",
        "activeSince": "Active since 2014",
        "country": "United Kingdom",
        "room": "City King",
        "stay": "1 night · December 2025",
        "guestType": "Family",
        "reviewed": "January 2, 2026",
        "title": "Fab One Night Stay",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Beautiful interior, bed was very comfortable, lovely toiletries\nFront desk staff were very helpful, friendly and gave great advice. Holden was super helpful.\nThe coffee creamers were off unfortunately, and not enough coffee pods or sugars left in room. Minor issue as front desk we're super helpful",
        "negative": "No mirror over desk - this is so common in hotels.",
        "body": "Beautiful interior, bed was very comfortable, lovely toiletries\nFront desk staff were very helpful, friendly and gave great advice. Holden was super helpful.\nThe coffee creamers were off unfortunately, and not enough coffee pods or sugars left in room. Minor issue as front desk we're super helpful\nNo mirror over desk - this is so common in hotels."
      },
      {
        "reviewer": "Jennifer",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Two Queen",
        "stay": "1 night · December 2025",
        "guestType": "Couple",
        "reviewed": "December 27, 2025",
        "title": "Wonderful Hotel in a Great Location!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location- close to a lot!; staff very friendly; very clean; comfortable beds; restaurant was great",
        "negative": "Nothing- it was a great stay",
        "body": "Great location- close to a lot!; staff very friendly; very clean; comfortable beds; restaurant was great\nNothing- it was a great stay"
      },
      {
        "reviewer": "Ann",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Two Queen",
        "stay": "1 night · December 2025",
        "guestType": "Family",
        "reviewed": "December 24, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location",
        "negative": "",
        "body": "Location"
      },
      {
        "reviewer": "Kelley",
        "activeSince": "Active since 2015",
        "country": "United States",
        "room": "Two Queen",
        "stay": "3 nights · December 2025",
        "guestType": "Solo traveler",
        "reviewed": "December 18, 2025",
        "title": "Great location, nice staff.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Weird coffee maker",
        "negative": "",
        "body": "Weird coffee maker"
      },
      {
        "reviewer": "Sklkime",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "King",
        "stay": "2 nights · December 2025",
        "guestType": "Solo traveler",
        "reviewed": "December 15, 2025",
        "title": "Great Location and Value but Housekeeping Could Do Better",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Great location. Comfortable, clean, and cozy room. Friendly staff.",
        "negative": "Housekeeping department needs work. Not attentive (they turned the bolt on my door and left it like that so that it didn’t close. My room was basically left open like that for hours 🤦🏻‍♀️ This is after I requested for someone to come take out the trash at 5pm bcz no one had shown up to clean all day).",
        "body": "Great location. Comfortable, clean, and cozy room. Friendly staff.\nHousekeeping department needs work. Not attentive (they turned the bolt on my door and left it like that so that it didn’t close. My room was basically left open like that for hours 🤦🏻‍♀️ This is after I requested for someone to come take out the trash at 5pm bcz no one had shown up to clean all day)."
      },
      {
        "reviewer": "Cheryl",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "Two Queen",
        "stay": "1 night · December 2025",
        "guestType": "Family",
        "reviewed": "December 15, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location was perfect!! The hotel was clean and very friendly staff!",
        "negative": "",
        "body": "Location was perfect!! The hotel was clean and very friendly staff!"
      },
      {
        "reviewer": "Deanna",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Two Queen",
        "stay": "1 night · December 2025",
        "guestType": "Family",
        "reviewed": "December 14, 2025",
        "title": "Wonderful stays to celebrate the Christmas season!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "All of The staff was exceptional! The hotel is clean and very nice. The rooms are newly remodeled and very spacious. The beds were very comfortable The bar was very nice and the staff there was awesome as well!",
        "negative": "",
        "body": "All of The staff was exceptional! The hotel is clean and very nice. The rooms are newly remodeled and very spacious. The beds were very comfortable The bar was very nice and the staff there was awesome as well!"
      },
      {
        "reviewer": "Nicole",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Two Queen",
        "stay": "2 nights · December 2025",
        "guestType": "Family",
        "reviewed": "December 14, 2025",
        "title": "Would stay there again. Great walking distance to many attractions drinks from mini bar we’re priced great",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location. Staff were friendly. Rooms were clean",
        "negative": "The queen rooms didn’t have any view",
        "body": "Great location. Staff were friendly. Rooms were clean\nThe queen rooms didn’t have any view"
      },
      {
        "reviewer": "Khadeeja",
        "activeSince": "Active since 2013",
        "country": "United States",
        "room": "City King",
        "stay": "3 nights · September 2025",
        "guestType": "Family",
        "reviewed": "November 12, 2025",
        "title": "Great stay in a great city.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location. Walkable area and across from a bus stop for further travel. The restaurant downstairs had amazing food and drinks.",
        "negative": "N/a",
        "body": "Great location. Walkable area and across from a bus stop for further travel. The restaurant downstairs had amazing food and drinks.\nN/a"
      },
      {
        "reviewer": "Xochitl",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "King",
        "stay": "3 nights · October 2025",
        "guestType": "Couple",
        "reviewed": "November 12, 2025",
        "title": "Location location location",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Location",
        "negative": "The scent they have in the lobby is overwhelming",
        "body": "Location\nThe scent they have in the lobby is overwhelming"
      },
      {
        "reviewer": "Charlotte",
        "activeSince": "Active since 2014",
        "country": "Canada",
        "room": "City King",
        "stay": "2 nights · November 2025",
        "guestType": "Solo traveler",
        "reviewed": "November 8, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Welcoming and responsive staff. Good location. Comfortable.",
        "negative": "The price was a little high.",
        "body": "Welcoming and responsive staff. Good location. Comfortable.\nThe price was a little high."
      },
      {
        "reviewer": "Declan",
        "activeSince": "Active since 2013",
        "country": "Ireland",
        "room": "Two Queen",
        "stay": "4 nights · November 2025",
        "guestType": "Family",
        "reviewed": "November 8, 2025",
        "title": "Great hotel in great location",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Breakfast was good,,, location was great",
        "negative": "The porter that arranged the taxi was very \"out of his head\" on weed , was really the only thing that didn't \"fit\"",
        "body": "Breakfast was good,,, location was great\nThe porter that arranged the taxi was very \"out of his head\" on weed , was really the only thing that didn't \"fit\""
      },
      {
        "reviewer": "Mia",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "City King",
        "stay": "2 nights · November 2025",
        "guestType": "Group",
        "reviewed": "November 4, 2025",
        "title": "My stay was simply perfect, I will return again.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Clean\nWelcoming\nGreat price",
        "negative": "N/a",
        "body": "Clean\nWelcoming\nGreat price\nN/a"
      },
      {
        "reviewer": "Vicki",
        "activeSince": "Active since 2018",
        "country": "Australia",
        "room": "City King",
        "stay": "3 nights · October 2025",
        "guestType": "Couple",
        "reviewed": "October 31, 2025",
        "title": "Great location and even better staff. There is a rear entrance we found was better acccess to the local streets and only",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location especially arriving from Midway Airport using the Orange line only $6 each. The staff are very helpful and no request was too much trouble. Very comfortable bed and the best shower pressure of any shower and the provided shower gels etc are good quality. If you require a safe it is the bed storage draw.",
        "negative": "Nothing to dislike",
        "body": "Great location especially arriving from Midway Airport using the Orange line only $6 each. The staff are very helpful and no request was too much trouble. Very comfortable bed and the best shower pressure of any shower and the provided shower gels etc are good quality. If you require a safe it is the bed storage draw.\nNothing to dislike"
      },
      {
        "reviewer": "Suzanne",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Two Queen",
        "stay": "2 nights · October 2025",
        "guestType": "Group",
        "reviewed": "October 26, 2025",
        "title": "I would stay again but only with a city view room.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Room was large, bed was very comfortable",
        "negative": "The window looks directly into a fluorescent lit empty office maybe 5' away from the window. It was like looking into the set of Severance. No daylight reaches the room. The description of the room should say no view...it is very claustrophobic.",
        "body": "Room was large, bed was very comfortable\nThe window looks directly into a fluorescent lit empty office maybe 5' away from the window. It was like looking into the set of Severance. No daylight reaches the room. The description of the room should say no view...it is very claustrophobic."
      },
      {
        "reviewer": "Antony",
        "activeSince": "Active since 2014",
        "country": "Australia",
        "room": "City King",
        "stay": "3 nights · October 2025",
        "guestType": "Couple",
        "reviewed": "October 25, 2025",
        "title": "Perfect location, very clean and comfortable",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Comfortable bed and pillows, spotlessly clean, nice modern decor, fantastic location,",
        "negative": "Nothing",
        "body": "Comfortable bed and pillows, spotlessly clean, nice modern decor, fantastic location,\nNothing"
      },
      {
        "reviewer": "Mehmet",
        "activeSince": "Active since 2011",
        "country": "Turkey",
        "room": "King",
        "stay": "2 nights · October 2025",
        "guestType": "Family",
        "reviewed": "October 24, 2025",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Check in time is too late",
        "negative": "",
        "body": "Check in time is too late"
      },
      {
        "reviewer": "Coralys",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "City King",
        "stay": "3 nights · August 2025",
        "guestType": "Solo traveler",
        "reviewed": "October 23, 2025",
        "title": "Great location.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Walking distance from downtown Chicago. Great location.",
        "negative": "You could hear the outside noise super loud and the people staying next to you.",
        "body": "Walking distance from downtown Chicago. Great location.\nYou could hear the outside noise super loud and the people staying next to you."
      },
      {
        "reviewer": "Katrina",
        "activeSince": "Active since 2024",
        "country": "Australia",
        "room": "City King",
        "stay": "3 nights · March 2026",
        "guestType": "Couple",
        "reviewed": "April 25, 2026",
        "title": "Really enjoyed this hotel and very glad we stayed there. Would recommend and stay there again.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Room was beautiful, modern, clean.\nBed was comfortable.\nShower was Amazing! Best shower I've ever had.\nLocation was good.\nRestaurant / bar was great.",
        "negative": "Only thing I could say is that the restaurant was a little expensive but so is everything these days.",
        "body": "Room was beautiful, modern, clean.\nBed was comfortable.\nShower was Amazing! Best shower I've ever had.\nLocation was good.\nRestaurant / bar was great.\nOnly thing I could say is that the restaurant was a little expensive but so is everything these days."
      },
      {
        "reviewer": "Delethia",
        "activeSince": "Active since 2018",
        "country": "United States",
        "room": "Millennium King",
        "stay": "3 nights · March 2026",
        "guestType": "Couple",
        "reviewed": "April 18, 2026",
        "title": "Solo traveling 2026",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "I saw the Arlo hotel on TikTok I solo travel at least four times a year. Chicago was my first trip of the year. My thought walking into the hotel. I saw the beautiful bookshelf and the Photo Booth, which everybody need to experience before you leave for memories ! walking to the front desk, the hotel staff that was very accommodating and very nice and I enjoyed the can water that they gave me. I know something small, but it was really nice been trying to find it since I get home lol\n. And I really appreciate the deposit because it was so cheap because some hotels in that location charged by the day and I love the day do not extort their customers or their travelers for deposits and all the different surcharges.\nAlso, I met the staff in the restaurant;Idk if he’s the manager of the supervisor. I do not remember his name he was black guy bald guy with square glasses (I’m\nWoman writing this fyi) , but he was so sweet to me and he gave me pointers on where to go .he was a 10 out of 10 experience even with some of the local residence being rude. he was one of the headlights on my trip.\nI stayed on the 16th floor had a view of the bean and also across from the Nutella store and Garrett popcorn. The view was literally beautiful and walking distance of everything and close to every restaurant and if you needed something in a hurry, there was a CVS literally across the street. I wasn’t far from all of the tour attractions that were there which was 10 out of 10 and literally 9 minute walking distance from the architectural boat tour and when I come back to Chicago, I will be staying at the Arlo. Until next time Chi City ♥️\nIt’s not a dislike, but it’s a FYI type of situation. The rooms are very small but it’s for solo travelers or it could be for a very intimate setting so just keep that in mind.",
        "negative": "A bird's-eye view of Arlo Chicago",
        "body": "I saw the Arlo hotel on TikTok I solo travel at least four times a year. Chicago was my first trip of the year. My thought walking into the hotel. I saw the beautiful bookshelf and the Photo Booth, which everybody need to experience before you leave for memories ! walking to the front desk, the hotel staff that was very accommodating and very nice and I enjoyed the can water that they gave me. I know something small, but it was really nice been trying to find it since I get home lol\n. And I really appreciate the deposit because it was so cheap because some hotels in that location charged by the day and I love the day do not extort their customers or their travelers for deposits and all the different surcharges.\nAlso, I met the staff in the restaurant;Idk if he’s the manager of the supervisor. I do not remember his name he was black guy bald guy with square glasses (I’m\nWoman writing this fyi) , but he was so sweet to me and he gave me pointers on where to go .he was a 10 out of 10 experience even with some of the local residence being rude. he was one of the headlights on my trip.\nI stayed on the 16th floor had a view of the bean and also across from the Nutella store and Garrett popcorn. The view was literally beautiful and walking distance of everything and close to every restaurant and if you needed something in a hurry, there was a CVS literally across the street. I wasn’t far from all of the tour attractions that were there which was 10 out of 10 and literally 9 minute walking distance from the architectural boat tour and when I come back to Chicago, I will be staying at the Arlo. Until next time Chi City ♥️\nIt’s not a dislike, but it’s a FYI type of situation. The rooms are very small but it’s for solo travelers or it could be for a very intimate setting so just keep that in mind.\nA bird's-eye view of Arlo Chicago"
      },
      {
        "reviewer": "Francisco",
        "activeSince": "Active since 2019",
        "country": "United States",
        "room": "City King",
        "stay": "1 night · April 2026",
        "guestType": "Group",
        "reviewed": "April 16, 2026",
        "title": "Great",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Friendly staff , big rooms and nice ambience",
        "negative": "The check out time is too soon and the check in too late",
        "body": "Friendly staff , big rooms and nice ambience\nThe check out time is too soon and the check in too late"
      },
      {
        "reviewer": "Gunnar",
        "activeSince": "Active since 2012",
        "country": "Sweden",
        "room": "City King",
        "stay": "2 nights · April 2026",
        "guestType": "Solo traveler",
        "reviewed": "April 16, 2026",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The staff and location.",
        "negative": "",
        "body": "The staff and location."
      },
      {
        "reviewer": "Paula",
        "activeSince": "Active since 2014",
        "country": "United States",
        "room": "City King",
        "stay": "2 nights · April 2026",
        "guestType": "Couple",
        "reviewed": "April 14, 2026",
        "title": "Fun hotel",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location. Friendly staff. Comfortable beds & pillows",
        "negative": "Windows on the 17th floor are lousy. We paid $19 extra per night to be on the top floor and the noise from the cars racing on Michigan Avenue at night was terrible. Very hard to sleep",
        "body": "Great location. Friendly staff. Comfortable beds & pillows\nWindows on the 17th floor are lousy. We paid $19 extra per night to be on the top floor and the noise from the cars racing on Michigan Avenue at night was terrible. Very hard to sleep"
      },
      {
        "reviewer": "Alan",
        "activeSince": "Active since 2019",
        "country": "Australia",
        "room": "Queen ADA",
        "stay": "2 nights · April 2026",
        "guestType": "Couple",
        "reviewed": "April 11, 2026",
        "title": "Thank you for a lovely stay.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Not a thing.",
        "negative": "",
        "body": "Not a thing."
      },
      {
        "reviewer": "Laura",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "City King",
        "stay": "4 nights · April 2026",
        "guestType": "Family",
        "reviewed": "April 10, 2026",
        "title": "Solid and Central Stay",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Check-In was very easy and staff was able to hold our bags before our room was ready. Beds were comfy and the partial view of the park was nice. The room was clean, everything worked, location was amazing, and robes were nice. Controlling the temp of the room was easy and the blackout and privacy shades were convenient.",
        "negative": "Honestly there wasn't anything that bothered me. The wi-fi got spotty, but I didn't need it for work.",
        "body": "Check-In was very easy and staff was able to hold our bags before our room was ready. Beds were comfy and the partial view of the park was nice. The room was clean, everything worked, location was amazing, and robes were nice. Controlling the temp of the room was easy and the blackout and privacy shades were convenient.\nHonestly there wasn't anything that bothered me. The wi-fi got spotty, but I didn't need it for work."
      },
      {
        "reviewer": "Haley",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "Millennium King",
        "stay": "2 nights · April 2026",
        "guestType": "Couple",
        "reviewed": "April 7, 2026",
        "title": "The staff was incredibly helpful and so kind. It felt so nice to walk in and be remembered and warmly greeted!",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "It was walking distance from everything",
        "negative": "Little expensive for the room size",
        "body": "It was walking distance from everything\nLittle expensive for the room size"
      },
      {
        "reviewer": "Jonathon",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "King",
        "stay": "1 night · March 2026",
        "guestType": "Family",
        "reviewed": "April 6, 2026",
        "title": "Arlo is great!",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Very clean and accommodating room, service was pleasant and quick!",
        "negative": "Dining experience was good but chairs were uncomfortable, other than that it was very good!",
        "body": "Very clean and accommodating room, service was pleasant and quick!\nDining experience was good but chairs were uncomfortable, other than that it was very good!"
      },
      {
        "reviewer": "Jane",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Two Queen",
        "stay": "1 night · March 2026",
        "guestType": "Family",
        "reviewed": "April 1, 2026",
        "title": "Nice hotel in great location.",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location is great. Very clean and modern. Great water pressure. Staff was very friendly.",
        "negative": "Asked for a city view and was given a room staring at brick wall.",
        "body": "Location is great. Very clean and modern. Great water pressure. Staff was very friendly.\nAsked for a city view and was given a room staring at brick wall."
      },
      {
        "reviewer": "Alicah",
        "activeSince": "Active since 2025",
        "country": "United States",
        "room": "Two Queen",
        "stay": "2 nights · March 2026",
        "guestType": "Group",
        "reviewed": "March 31, 2026",
        "title": "Clean and comfortable.",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Quite, comfortable, easy location to everything.",
        "negative": "Everything was great.",
        "body": "Quite, comfortable, easy location to everything.\nEverything was great."
      },
      {
        "reviewer": "Andrea",
        "activeSince": "Active since 2026",
        "country": "United States",
        "room": "King",
        "stay": "4 nights · March 2026",
        "guestType": "Couple",
        "reviewed": "March 25, 2026",
        "title": "We loved the location",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Great location",
        "negative": "I liked everything, no complaints",
        "body": "Great location\nI liked everything, no complaints"
      },
      {
        "reviewer": "Jacqueline",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Two Queen",
        "stay": "3 nights · March 2026",
        "guestType": "Group",
        "reviewed": "March 20, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location was fantastic! Close to everything and if you wanted to visit different neighborhoods the public transportation was easily accessible.",
        "negative": "",
        "body": "Location was fantastic! Close to everything and if you wanted to visit different neighborhoods the public transportation was easily accessible."
      },
      {
        "reviewer": "Leslie",
        "activeSince": "Active since 2017",
        "country": "United States",
        "room": "City King",
        "stay": "3 nights · March 2026",
        "guestType": "Solo traveler",
        "reviewed": "March 16, 2026",
        "title": "I would stay there again!",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Hotel was clean. Service was amazing.",
        "negative": "I had no complaints",
        "body": "Hotel was clean. Service was amazing.\nI had no complaints"
      },
      {
        "reviewer": "Stephanie",
        "activeSince": "Active since 2022",
        "country": "United States",
        "room": "Two Queen",
        "stay": "4 nights · February 2026",
        "guestType": "Couple",
        "reviewed": "March 3, 2026",
        "title": "Great spot",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Location clean and the bar restaurant downstairs",
        "negative": "",
        "body": "Location clean and the bar restaurant downstairs"
      },
      {
        "reviewer": "Walters",
        "activeSince": "Active since 2021",
        "country": "United States",
        "room": "Two Queen",
        "stay": "2 nights · February 2026",
        "guestType": "Group",
        "reviewed": "March 2, 2026",
        "title": "Will definitely stay again!!!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "It was super clean. Everyone was really friendly. We really enjoyed the stay. Great location!",
        "negative": "n/a",
        "body": "It was super clean. Everyone was really friendly. We really enjoyed the stay. Great location!\nn/a"
      },
      {
        "reviewer": "Megan",
        "activeSince": "Active since 2026",
        "country": "United States",
        "room": "Two Queen",
        "stay": "5 nights · February 2026",
        "guestType": "Group",
        "reviewed": "March 1, 2026",
        "title": "Clean and convenient.",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Super clean. Shower was extra hot with good water pressure. Close to everything I wanted to see. And great burgers at the restaurant!",
        "negative": "",
        "body": "Super clean. Shower was extra hot with good water pressure. Close to everything I wanted to see. And great burgers at the restaurant!"
      },
      {
        "reviewer": "Zoe",
        "activeSince": "Active since 2012",
        "country": "United Kingdom",
        "room": "City King",
        "stay": "4 nights · February 2026",
        "guestType": "Family",
        "reviewed": "March 1, 2026",
        "title": "Superb location, comfy rooms, friendly staff",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "The location is outstanding, right opposite the Bean, near the Art Institute of Chicago, and in the heart of everything. It’s close to all the shops and places to eat. Plus, there’s a Starbucks 10 seconds away that opens at 5am for those who are jet-lagged, although the coffee machine in the room is a great option too. The beds were very comfy, the room was a nice size, and the view was great. We ate/drank in the bar a few times and Erica was very friendly and helpful.",
        "negative": "You can hear guests in the corridors, and if they’re noisy, it may wake you up. You also can’t open the windows, so you’re reliant on air conditioning to heat or cool the room, which can make your throat dry. That said, I would definitely stay at the hotel again.",
        "body": "The location is outstanding, right opposite the Bean, near the Art Institute of Chicago, and in the heart of everything. It’s close to all the shops and places to eat. Plus, there’s a Starbucks 10 seconds away that opens at 5am for those who are jet-lagged, although the coffee machine in the room is a great option too. The beds were very comfy, the room was a nice size, and the view was great. We ate/drank in the bar a few times and Erica was very friendly and helpful.\nYou can hear guests in the corridors, and if they’re noisy, it may wake you up. You also can’t open the windows, so you’re reliant on air conditioning to heat or cool the room, which can make your throat dry. That said, I would definitely stay at the hotel again."
      },
      {
        "reviewer": "Decent",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "City King",
        "stay": "3 nights · February 2026",
        "guestType": "Solo traveler",
        "reviewed": "February 24, 2026",
        "title": "Great location, small, clean and well run hotel with wonderful bedding and a great staff",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "I've stayed here before a few times when it was differenlty named. It seems like the place has imporved. You know, I often wonder does a hotel have a person who is a detailer? Because before at the hotel there was always a few things with the rooms that was \"off\". Like, the wall sconce was crooked or there was a chip on the corner of the desk - stuff like that. I guess you could say a bit tired. But things have improved and the room was nicer and the halls were just in better shape... so that made a better experience for me. I want to feel a little special when I travel... and i did. I really loved the bedding and especially the pillows. Very comfy and nice.",
        "negative": "I already told the staff this - I was upcharged a small fee for a higher floor because the view was supposed to be better. I didnt think the improved view was worth the upcharge - you still just mostly saw the mammoth building across the street. I told the hotel this and they graciously refunded me my upcharge. Very classy. One other thing... I think there could be some improvement in the service in the ALK dining room. It was ok, but a bit scattered. The servers could check on me a bit more rather than just when they drop off the food (Once I had to get up and get flatware from another table bc after they dropped off the food I noticed I had no flatware and the server already disapeared. Not a big deal but this is would elevate the place more.) Ha ha once for breakfast I was served potatos with my eggs and I swear there were 9 little pieces of potatos spread way out over the plate... it was funny. Like, a nice spoonful of potatoes please, guys!",
        "body": "I've stayed here before a few times when it was differenlty named. It seems like the place has imporved. You know, I often wonder does a hotel have a person who is a detailer? Because before at the hotel there was always a few things with the rooms that was \"off\". Like, the wall sconce was crooked or there was a chip on the corner of the desk - stuff like that. I guess you could say a bit tired. But things have improved and the room was nicer and the halls were just in better shape... so that made a better experience for me. I want to feel a little special when I travel... and i did. I really loved the bedding and especially the pillows. Very comfy and nice.\nI already told the staff this - I was upcharged a small fee for a higher floor because the view was supposed to be better. I didnt think the improved view was worth the upcharge - you still just mostly saw the mammoth building across the street. I told the hotel this and they graciously refunded me my upcharge. Very classy. One other thing... I think there could be some improvement in the service in the ALK dining room. It was ok, but a bit scattered. The servers could check on me a bit more rather than just when they drop off the food (Once I had to get up and get flatware from another table bc after they dropped off the food I noticed I had no flatware and the server already disapeared. Not a big deal but this is would elevate the place more.) Ha ha once for breakfast I was served potatos with my eggs and I swear there were 9 little pieces of potatos spread way out over the plate... it was funny. Like, a nice spoonful of potatoes please, guys!"
      },
      {
        "reviewer": "Claire",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Two Queen",
        "stay": "1 night · February 2026",
        "guestType": "Family",
        "reviewed": "February 23, 2026",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "location and staff",
        "negative": "",
        "body": "location and staff"
      },
      {
        "reviewer": "Vangie",
        "activeSince": "Active since 2019",
        "country": "Puerto Rico",
        "room": "Two Queen",
        "stay": "4 nights · November 2025",
        "guestType": "Solo traveler",
        "reviewed": "December 10, 2025",
        "title": "Great!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Perfect location!",
        "negative": "",
        "body": "Perfect location!"
      },
      {
        "reviewer": "Jessica",
        "activeSince": "",
        "country": "United States",
        "room": "City King",
        "stay": "3 nights · December 2025",
        "guestType": "Couple",
        "reviewed": "December 7, 2025",
        "title": "Excellent hotel in a superb location!",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The location is unbeatable, the rooms are a good size with a great view. The restaurant has good food and drinks and the staff is friendly.",
        "negative": "The walls are thin so we could hear the person in the next room coughing all night and early in the morning.",
        "body": "The location is unbeatable, the rooms are a good size with a great view. The restaurant has good food and drinks and the staff is friendly.\nThe walls are thin so we could hear the person in the next room coughing all night and early in the morning."
      },
      {
        "reviewer": "Rosa",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Two Queen",
        "stay": "3 nights · November 2025",
        "guestType": "Couple",
        "reviewed": "December 5, 2025",
        "title": "Exceptional",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Perfect location.\nSuper nice staff.\nAmazing room with a view.",
        "negative": "A general sea view or a sea view taken from the hotel",
        "body": "Perfect location.\nSuper nice staff.\nAmazing room with a view.\nA general sea view or a sea view taken from the hotel"
      },
      {
        "reviewer": "Deanna",
        "activeSince": "Active since 2020",
        "country": "United States",
        "room": "Two Queen",
        "stay": "1 night · December 2025",
        "guestType": "Couple",
        "reviewed": "December 3, 2025",
        "title": "Everything was wonderful. The staff was absolutely exceptional and their communications before during an after were amaz",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The room was spacious and updated. The lobby was very nice with a nice back entrance for Easy drop off and pick up. It was very nice to have a very nice bar and restaurant right on site as well!",
        "negative": "",
        "body": "The room was spacious and updated. The lobby was very nice with a nice back entrance for Easy drop off and pick up. It was very nice to have a very nice bar and restaurant right on site as well!"
      },
      {
        "reviewer": "Strzelecki",
        "activeSince": "Active since 2024",
        "country": "United States",
        "room": "Two Queen ADA",
        "stay": "1 night · November 2025",
        "guestType": "Group",
        "reviewed": "December 3, 2025",
        "title": "We loved it and we’ll be back anytime we come downtown",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "Close to everything! The restaurant was exceptional.",
        "negative": "Nothing",
        "body": "Close to everything! The restaurant was exceptional.\nNothing"
      },
      {
        "reviewer": "Allen",
        "activeSince": "Active since 2023",
        "country": "United States",
        "room": "City King",
        "stay": "2 nights · November 2025",
        "guestType": "Couple",
        "reviewed": "November 26, 2025",
        "title": "Great stay excellent location wonderful and friendly staff. Will return",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location, friendly and professional staff, rooms were wonderful. Would return as we have in the past but would request a room closer to Michigan Ave as those farest away were a little noisy from the El tracks. Parking is great with the validation discount. Antoine was especially helpful with the luggage and suggestions",
        "negative": "Nothing",
        "body": "Great location, friendly and professional staff, rooms were wonderful. Would return as we have in the past but would request a room closer to Michigan Ave as those farest away were a little noisy from the El tracks. Parking is great with the validation discount. Antoine was especially helpful with the luggage and suggestions\nNothing"
      },
      {
        "reviewer": "Susan",
        "activeSince": "Active since 2012",
        "country": "Australia",
        "room": "City King",
        "stay": "3 nights · November 2025",
        "guestType": "Family",
        "reviewed": "November 25, 2025",
        "title": "Great location to access local eateries and walking distance to magnificent mile",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Great location, good size clean rooms comfortable beds, friendly staff and able to store luggage.",
        "negative": "Noises could hear road noise and neighbours",
        "body": "Great location, good size clean rooms comfortable beds, friendly staff and able to store luggage.\nNoises could hear road noise and neighbours"
      },
      {
        "reviewer": "Dewald",
        "activeSince": "Active since 2020",
        "country": "South Africa",
        "room": "City King",
        "stay": "1 night · November 2025",
        "guestType": "Family",
        "reviewed": "November 22, 2025",
        "title": "Very Good",
        "scoredLabel": "Scored 8.0",
        "scoreText": "8.0",
        "score10": 8,
        "positive": "Location",
        "negative": "Paper thin wallls, you hear more from the neighboring rooms than you'd care for. Why no toilet brush.",
        "body": "Location\nPaper thin wallls, you hear more from the neighboring rooms than you'd care for. Why no toilet brush."
      },
      {
        "reviewer": "Karen",
        "activeSince": "Active since 2022",
        "country": "Mexico",
        "room": "Two Queen",
        "stay": "1 night · August 2025",
        "guestType": "Group",
        "reviewed": "November 16, 2025",
        "title": "Wonderful",
        "scoredLabel": "Scored 9.0",
        "scoreText": "9.0",
        "score10": 9,
        "positive": "Staff",
        "negative": "",
        "body": "Staff"
      },
      {
        "reviewer": "Jacki",
        "activeSince": "Active since 2016",
        "country": "United States",
        "room": "Two Queen",
        "stay": "1 night · October 2025",
        "guestType": "Family",
        "reviewed": "November 15, 2025",
        "title": "Great place in the city",
        "scoredLabel": "Scored 10",
        "scoreText": "10",
        "score10": 10,
        "positive": "The location was great for seeing the city. The lobby restaurant was excellent at breakfast. Easy luggage service helped a lot on check out so we could still explore before leaving town.",
        "negative": "I thought the box of stuff available in the room to purchase was stocked with stuff that was a little pervy.",
        "body": "The location was great for seeing the city. The lobby restaurant was excellent at breakfast. Easy luggage service helped a lot on check out so we could still explore before leaving town.\nI thought the box of stuff available in the room to purchase was stocked with stuff that was a little pervy."
      }
    ]
  };
  window.EXACT_HOTEL_REVIEWS = EMBEDDED_EXACT_HOTEL_REVIEWS;

  function exactReviewsFor(hotelId) {
    const exact = window.EXACT_HOTEL_REVIEWS && window.EXACT_HOTEL_REVIEWS[hotelId];
    return Array.isArray(exact) ? exact : [];
  }

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

  function stripEmoji(s) {
    return String(s || "")
      .replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, "")
      .replace(/[\u{1F3FB}-\u{1F3FF}]/gu, "")
      .replace(/[\uFE0E\uFE0F]/g, "")
      .replace(/\p{Extended_Pictographic}/gu, "")
      .replace(/[:;=8xX][-']?[)(DPpOo]/g, "")
      .replace(/\s+([.,!?;:])/g, "$1")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
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
          "reviews": exactReviewsFor("pendry-chicago")
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
          "reviews": exactReviewsFor("viceroy-chicago")
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
          "reviews": exactReviewsFor("the-robey-chicago")
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
          "reviews": exactReviewsFor("the-emily-hotel")
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
          "reviews": exactReviewsFor("nobu-hotel-chicago")
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
          "reviews": exactReviewsFor("arlo-chicago")
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

  function surveyQueryString(nextStage) {
    const params = new URLSearchParams(location.search || "");
    if (nextStage) params.set("survey_stage", nextStage);
    const query = params.toString();
    return query ? `?${query}` : "";
  }

  function renderStudyFlowCta() {
    const head = document.querySelector(".content__head");
    if (!head || document.getElementById("studyFlowCta")) return;

    const state = pageState();
    const box = document.createElement("div");
    box.id = "studyFlowCta";
    box.className = "study-flow";

    if (state.showReviews) {
      box.innerHTML = `
        <div>
          <strong>Browsing stage 2:</strong>
          You are now viewing the same 6 hotel listings with guest reviews.
        </div>
      `;
    } else {
      const href = `index.html${surveyQueryString("hotel_questionnaire")}#hq1`;
      box.innerHTML = `
        <div>
          <strong>Browsing stage 1:</strong>
          View all 6 hotel listings without guest reviews. When you are finished, answer the hotel questions before continuing to full reviews.
        </div>
        <a class="btn study-flow__btn" href="${escapeXml(href)}">Continue to hotel questions</a>
      `;
    }

    head.insertAdjacentElement("afterend", box);
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

  function isStayChip(text) {
    return /^\d+ nights? · .+/.test(String(text || "").trim());
  }

  function isGuestTypeChip(text) {
    return /^(Couple|Family|Group|Solo traveler|Friends|Business traveler)$/i.test(String(text || "").trim());
  }

  function reviewFallbackParts(review) {
    const lines = String(review.text || "").split("\n").map(s => s.trim()).filter(Boolean);
    const title = review.title || lines[0] || "";
    const bodyLines = review.body ? String(review.body).split("\n").filter(Boolean) : lines.slice(1);
    let positive = review.positive || "";
    let negative = review.negative || "";
    if (!positive && !negative && bodyLines.length) {
      if (bodyLines.length === 1 || bodyLines.every(line => line === bodyLines[0])) positive = bodyLines.join("\n");
      else {
        positive = bodyLines.slice(0, -1).join("\n");
        negative = bodyLines[bodyLines.length - 1];
      }
    }
    return {
      title: stripEmoji(title),
      positive: stripEmoji(positive),
      negative: stripEmoji(negative)
    };
  }

  function reviewDisplay(review) {
    const chips = Array.isArray(review.chips) ? review.chips : [];
    const room = review.room || chips.find(c => !isGuestTypeChip(c) && !isStayChip(c)) || "";
    const stay = review.stay || chips.find(isStayChip) || "";
    const guestType = review.guestType || chips.find(isGuestTypeChip) || "";
    const reviewer = review.reviewer || review.who || "Guest reviewer";
    const scoreText = review.scoreText || (typeof review.score10 === "number"
      ? String(review.score10)
      : typeof review.score5 === "number"
        ? String(review.score5)
        : "");
    return {
      reviewer: reviewer === "Tripadvisor reviewer" ? "Guest reviewer" : reviewer,
      activeSince: review.activeSince || "",
      country: review.country || "",
      room,
      stay,
      guestType,
      reviewed: review.reviewed || review.when || "",
      scoredLabel: review.scoredLabel || (scoreText ? `Scored ${scoreText}` : ""),
      scoreText,
      ...reviewFallbackParts(review)
    };
  }

  function reviewDetailHtml(label, value) {
    if (!value) return "";
    return `
      <div class="review__detail" data-chip="${escapeXml(value)}">
        <span>${escapeXml(value)}</span>
      </div>
    `;
  }

  function reviewTextBlockHtml(kind, text) {
    if (!text) return "";
    return `
      <div class="review__textBlock review__textBlock--${kind}">
        <p>${escapeXml(text)}</p>
      </div>
    `;
  }

  function reviewCardHtml(review, index, initialVisible) {
    const r = reviewDisplay(review);
    const initial = (r.reviewer || "G").trim().charAt(0).toUpperCase();
    return `
      <article class="review" data-review="1" data-review-index="${index}"${index >= initialVisible ? " hidden" : ""}>
        <aside class="review__guest">
          <div class="review__guestTop">
            <div class="review__avatar" aria-hidden="true">${escapeXml(initial)}</div>
            <div>
              <div class="review__name">${escapeXml(r.reviewer)}</div>
              ${r.activeSince ? `<div class="review__since">${escapeXml(r.activeSince)}</div>` : ""}
              ${r.country ? `<div class="review__country"><span class="review__flag" aria-hidden="true"></span>${escapeXml(r.country)}</div>` : ""}
            </div>
          </div>
          <div class="review__guestDetails">
            ${reviewDetailHtml("Room", r.room)}
            ${reviewDetailHtml("Stay", r.stay)}
            ${reviewDetailHtml("Traveler", r.guestType)}
          </div>
        </aside>
        <div class="review__body">
          <div class="review__topline">
            <div class="review__date">${r.reviewed ? `Reviewed: ${escapeXml(r.reviewed)}` : ""}</div>
            ${r.scoreText ? `<div class="review__scoreBadge" aria-label="${escapeXml(r.scoredLabel)}">${escapeXml(r.scoreText)}</div>` : ""}
          </div>
          ${r.title ? `<h4 class="review__title">${escapeXml(r.title)}</h4>` : ""}
          <div class="review__copy">
            ${reviewTextBlockHtml("positive", r.positive)}
            ${reviewTextBlockHtml("negative", r.negative)}
          </div>
        </div>
      </article>
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
          <h3 style="margin:0">Guest reviews</h3>
          <div class="tag">Exact pasted reviews</div>
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
    renderStudyFlowCta();

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
