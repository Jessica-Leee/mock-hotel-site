(() => {
  const STORAGE_KEY = "mock_hotel_logs_v2";
  const UI_STATE_KEY = "mock_hotel_ui_state_v1";
  const HOTEL_VIEW_STATE_KEY = "mock_hotel_no_review_views_v1";
  const HOTEL_REVIEW_VIEW_STATE_KEY = "mock_hotel_review_views_v1";
  const HOTEL_AI_REVIEW_VIEW_STATE_KEY = "mock_hotel_ai_review_views_v1";
  const HOTEL_ORDER_STATE_KEY = "mock_hotel_visible_order_v1";
  const BROWSE_COUNTDOWN_STATE_KEY = "mock_hotel_browse_countdown_v1";
  const REVIEW_WARNING_SECONDS = 5 * 60;
  const BROWSE_COUNTDOWN_SECONDS = 90;

  let activeHotelSession = null;
  let modalScrollCleanup = null;
  let randomizedVisibleHotelIds = null;
  let balancedVisibleReviewCount = null;
  let reviewWarningTimer = null;
  let browseCountdownTimer = null;
  const REVIEW_INITIAL_VISIBLE = 12;
  const REVIEW_BATCH_VISIBLE = 24;

  const EMBEDDED_EXACT_HOTEL_REVIEWS = {
    "pendry-chicago": [
      {
        "reviewer": "Callaghan",
        "title": "Very good",
        "positive": "Location",
        "negative": "Parking",
        "body": "Location\nParking"
      },
      {
        "reviewer": "Bernadette",
        "title": "Lost my booking halfway through",
        "positive": "",
        "negative": "Halfway through making an online reservation, the internet dropped and I lost my progress. It happened again later while I was checking email.",
        "body": "Halfway through making an online reservation, the internet dropped and I lost my progress. It happened again later while I was checking email."
      },
      {
        "reviewer": "Lisa",
        "title": "Not much variety for a full workout",
        "positive": "",
        "negative": "The fitness room had too few types of equipment for the routine I wanted to do. I ended up cutting the session short rather than repeating the same exercises.",
        "body": "The fitness room had too few types of equipment for the routine I wanted to do. I ended up cutting the session short rather than repeating the same exercises."
      },
      {
        "reviewer": "Kirrily",
        "title": "Dry bread and lukewarm eggs",
        "positive": "",
        "negative": "Dry bread and lukewarm eggs made breakfast something to get through rather than enjoy.",
        "body": "Dry bread and lukewarm eggs made breakfast something to get through rather than enjoy."
      },
      {
        "reviewer": "Jasmin",
        "title": "Wonderful",
        "positive": "Everything... the hotel is beautiful and the staff is exceptional",
        "negative": "",
        "body": "Everything... the hotel is beautiful and the staff is exceptional"
      },
      {
        "reviewer": "Todd",
        "title": "Something different each morning",
        "positive": "Plenty of choice at breakfast without feeling like a lot of the same thing. I ate something different each morning and enjoyed all of it.",
        "negative": "",
        "body": "Plenty of choice at breakfast without feeling like a lot of the same thing. I ate something different each morning and enjoyed all of it."
      },
      {
        "reviewer": "Abigail",
        "title": "Just enough cushioning",
        "positive": "Just the right bit of spring in the mattress for me, with enough cushioning to get comfortable straight away.",
        "negative": "",
        "body": "Just the right bit of spring in the mattress for me, with enough cushioning to get comfortable straight away."
      },
      {
        "reviewer": "Andrea",
        "title": "Too much chatter in the corridor",
        "positive": "",
        "negative": "Guests chatting outside their doors might as well have been standing inside mine. The corridor noise was particularly irritating when I wanted an early night.",
        "body": "Guests chatting outside their doors might as well have been standing inside mine. The corridor noise was particularly irritating when I wanted an early night."
      },
      {
        "reviewer": "Zabin",
        "title": "An exceptional location with large clean rooms and friendly staff.",
        "positive": "Clean rooms. Good wifi. Felt very safe. Friendly staff.",
        "negative": "Gym was being renovated. Didn’t want to go to a gym down the road, although it was offered.",
        "body": "Clean rooms. Good wifi. Felt very safe. Friendly staff.\nGym was being renovated. Didn’t want to go to a gym down the road, although it was offered."
      },
      {
        "reviewer": "Moises",
        "title": "Convenient for part of my plans",
        "positive": "Easy walks to a few of my planned stops.",
        "negative": "Longer journeys to the rest, so the location worked better on some days than others.",
        "body": "Easy walks to a few of my planned stops.\nLonger journeys to the rest, so the location worked better on some days than others."
      },
      {
        "reviewer": "Kortni",
        "title": "No noisy interruptions overnight",
        "positive": "Three nights here without being woken by doors banging or people shouting, which was a relief.",
        "negative": "",
        "body": "Three nights here without being woken by doors banging or people shouting, which was a relief."
      },
      {
        "reviewer": "Spriha",
        "title": "Cleaner than I expected under the bed!",
        "positive": "Dropped an earring beside the bed and was pleasantly surprised to find even the floor underneath was clean.",
        "negative": "",
        "body": "Dropped an earring beside the bed and was pleasantly surprised to find even the floor underneath was clean."
      },
      {
        "reviewer": "Magalie",
        "title": "Exceptional",
        "positive": "A beautiful historic hotel in a great location . Friendly staff. Great restaurant and bar.",
        "negative": "That the rooftop bar was closed for an event. I wished I could’ve experienced that.",
        "body": "A beautiful historic hotel in a great location . Friendly staff. Great restaurant and bar.\nThat the rooftop bar was closed for an event. I wished I could’ve experienced that."
      },
      {
        "reviewer": "Cathy",
        "title": "My back appreciated this mattress",
        "positive": "No dipping toward the middle of the bed or feeling the mattress underneath me. It supported my back properly, which I really appreciated.",
        "negative": "",
        "body": "No dipping toward the middle of the bed or feeling the mattress underneath me. It supported my back properly, which I really appreciated."
      },
      {
        "reviewer": "Nassyre",
        "title": "No trouble calling home",
        "positive": "A long video call home went smoothly over the Wi-Fi, with no frozen pictures or dropped sound.",
        "negative": "",
        "body": "A long video call home went smoothly over the Wi-Fi, with no frozen pictures or dropped sound."
      },
      {
        "reviewer": "Dalila",
        "title": "Fantastic, great location and even better staff",
        "positive": "It’s in a fantastic location and easy to get to loads of other places within a short amount of time. The staff were very helpful and they have a fantastic concierge that knew everything and I’m very sure if he didn’t know it, it wasn’t worth knowing.",
        "negative": "",
        "body": "It’s in a fantastic location and easy to get to loads of other places within a short amount of time. The staff were very helpful and they have a fantastic concierge that knew everything and I’m very sure if he didn’t know it, it wasn’t worth knowing."
      },
      {
        "reviewer": "Don",
        "title": "Comfortable for a side sleeper",
        "positive": "My shoulders sometimes ache on hotel beds, so I was pleasantly surprised by this one. Sleeping on my side felt comfortable all three nights.",
        "negative": "",
        "body": "My shoulders sometimes ache on hotel beds, so I was pleasantly surprised by this one. Sleeping on my side felt comfortable all three nights."
      },
      {
        "reviewer": "Mikew49",
        "title": "A break from other people’s TVs",
        "positive": "I’m easily distracted by other people’s TVs, and thankfully I heard none here. The quiet evenings were much appreciated.",
        "negative": "",
        "body": "I’m easily distracted by other people’s TVs, and thankfully I heard none here. The quiet evenings were much appreciated."
      },
      {
        "reviewer": "Casey",
        "title": "Treadmill worked just as it should",
        "positive": "Got a decent run in before heading out. The treadmill belt moved smoothly, and changing the incline didn’t interrupt my stride.",
        "negative": "",
        "body": "Got a decent run in before heading out. The treadmill belt moved smoothly, and changing the incline didn’t interrupt my stride."
      },
      {
        "reviewer": "Jennifer",
        "title": "Passed my bathroom check",
        "positive": "I’m quite fussy about bathrooms, so I checked the shower corners when I arrived. No grime or stray hairs anywhere, which was a reassuring start.",
        "negative": "",
        "body": "I’m quite fussy about bathrooms, so I checked the shower corners when I arrived. No grime or stray hairs anywhere, which was a reassuring start."
      },
      {
        "reviewer": "Silvi",
        "title": "Exceptional",
        "positive": "Aside from the fact that the room and bed were extremely comfortable, the assistance from the concierge team was A+. It began well before our arrival to help us plan our stay..",
        "negative": "",
        "body": "Aside from the fact that the room and bed were extremely comfortable, the assistance from the concierge team was A+. It began well before our arrival to help us plan our stay.."
      },
      {
        "reviewer": "Jill",
        "title": "Stayed connected on my phone",
        "positive": "My phone stayed on the Wi-Fi whenever I used it. No random disconnects.",
        "negative": "",
        "body": "My phone stayed on the Wi-Fi whenever I used it. No random disconnects."
      },
      {
        "reviewer": "Alan",
        "title": "Kept clean throughout",
        "positive": "The room was cleaned properly each day, especially the bathroom. No complaints there.",
        "negative": "",
        "body": "The room was cleaned properly each day, especially the bathroom. No complaints there."
      },
      {
        "reviewer": "Nomita",
        "title": "Would order those eggs and toast again",
        "positive": "Only had eggs and toast for breakfast, but both were done so well that I’d happily order them again.",
        "negative": "",
        "body": "Only had eggs and toast for breakfast, but both were done so well that I’d happily order them again."
      },
      {
        "reviewer": "Lopadchak",
        "title": "The treadmill kept stopping",
        "positive": "",
        "negative": "Twice during a run, the treadmill stopped unexpectedly. I couldn’t get into a rhythm and gave up on using it.",
        "body": "Twice during a run, the treadmill stopped unexpectedly. I couldn’t get into a rhythm and gave up on using it."
      },
      {
        "reviewer": "Diego",
        "title": "Finished every bite of breakfast",
        "positive": "The first mouthful of breakfast was enough to convince me to finish the plate. Proper flavor in the eggs and fresh bread made all the difference.",
        "negative": "",
        "body": "The first mouthful of breakfast was enough to convince me to finish the plate. Proper flavor in the eggs and fresh bread made all the difference."
      },
      {
        "reviewer": "Andrew",
        "title": "Relaxing and luxurious",
        "positive": "Beautiful building, very distinctive. Rooms were spotless.",
        "negative": "Style, character. Probably the prettiest building in Chicago.",
        "body": "Beautiful building, very distinctive. Rooms were spotless.\nStyle, character. Probably the prettiest building in Chicago."
      },
      {
        "reviewer": "Julia",
        "title": "Traffic was just a faint murmur",
        "positive": "Traffic was barely a murmur in my room, even during the busier part of the evening.",
        "negative": "",
        "body": "Traffic was barely a murmur in my room, even during the busier part of the evening."
      },
      {
        "reviewer": "Kenny",
        "title": "Photo uploads were easy",
        "positive": "Uploading the day’s photos was straightforward each evening. The room Wi-Fi got through them without stopping halfway or making me start again.",
        "negative": "",
        "body": "Uploading the day’s photos was straightforward each evening. The room Wi-Fi got through them without stopping halfway or making me start again."
      },
      {
        "reviewer": "Vida",
        "title": "Wonderful and Loved",
        "positive": "The Location was perfect for Us!",
        "negative": "",
        "body": "The Location was perfect for Us!"
      },
      {
        "reviewer": "Turkhia",
        "title": "Several weights I needed were missing",
        "positive": "",
        "negative": "Gaps in the dumbbell rack made it awkward to progress between sets. The available weights just didn’t cover the range I needed.",
        "body": "Gaps in the dumbbell rack made it awkward to progress between sets. The available weights just didn’t cover the range I needed."
      },
      {
        "reviewer": "Justin",
        "title": "Enjoyed the sweet and savory choices",
        "positive": "Tried a few different breakfast items over my stay and didn’t come across anything stale or bland. There was a nice balance of sweet and savory choices.",
        "negative": "",
        "body": "Tried a few different breakfast items over my stay and didn’t come across anything stale or bland. There was a nice balance of sweet and savory choices."
      },
      {
        "reviewer": "Mariella",
        "title": "Didn’t miss my pillow from home",
        "positive": "For once, I didn’t miss my own pillow: this one was soft enough to settle into and still supported my head properly.",
        "negative": "",
        "body": "For once, I didn’t miss my own pillow: this one was soft enough to settle into and still supported my head properly."
      },
      {
        "reviewer": "John",
        "title": "Exceptional",
        "positive": "Location",
        "negative": "",
        "body": "Location"
      },
      {
        "reviewer": "Kirill",
        "title": "Dependable internet morning and night",
        "positive": "Checking messages in the morning and catching up online at night were equally straightforward. Whenever I used the Wi-Fi, the connection held up.",
        "negative": "",
        "body": "Checking messages in the morning and catching up online at night were equally straightforward. Whenever I used the Wi-Fi, the connection held up."
      },
      {
        "reviewer": "Darlyn",
        "title": "celebrated my bachelorette here and it was great",
        "positive": "fabulous location!",
        "negative": "",
        "body": "fabulous location!"
      },
      {
        "reviewer": "Melissa",
        "title": "The window kept street noise out",
        "positive": "Once the window was shut, street noise faded into the background. I was surprised by how little of it reached the room.",
        "negative": "",
        "body": "Once the window was shut, street noise faded into the background. I was surprised by how little of it reached the room."
      },
      {
        "reviewer": "Rachel",
        "title": "Mattress yes, pillows no",
        "positive": "Loved the mattress.",
        "negative": "The pillows went flat as soon as I put my head down. A bit of a mismatch in how comfortable the bed felt overall.",
        "body": "Loved the mattress.\nThe pillows went flat as soon as I put my head down. A bit of a mismatch in how comfortable the bed felt overall."
      },
      {
        "reviewer": "Nikki",
        "title": "Wi-Fi handled everyday browsing well",
        "positive": "Restaurant menus and directions opened quickly over Wi-Fi, even when I had several tabs going. It was dependable for all my everyday browsing.",
        "negative": "",
        "body": "Restaurant menus and directions opened quickly over Wi-Fi, even when I had several tabs going. It was dependable for all my everyday browsing."
      },
      {
        "reviewer": "Leonard",
        "title": "Depends who’s at reception",
        "positive": "One person at reception patiently helped with my questions.",
        "negative": "The next person barely looked up. Whether I felt welcome really depended on who was there.",
        "body": "One person at reception patiently helped with my questions.\nThe next person barely looked up. Whether I felt welcome really depended on who was there."
      },
      {
        "reviewer": "Jamie",
        "title": "A peaceful evening with a book",
        "positive": "Spent an evening reading with the TV off and wasn’t distracted by sounds from outside or the corridor. The room was peaceful enough to really switch off.",
        "negative": "",
        "body": "Spent an evening reading with the TV off and wasn’t distracted by sounds from outside or the corridor. The room was peaceful enough to really switch off."
      },
      {
        "reviewer": "Peter",
        "title": "Easy to put a session together",
        "positive": "Didn’t need anything elaborate, just a treadmill and a decent selection of weights. The gym covered both nicely.",
        "negative": "",
        "body": "Didn’t need anything elaborate, just a treadmill and a decent selection of weights. The gym covered both nicely."
      },
      {
        "reviewer": "Guido",
        "title": "Really liked the bedding",
        "positive": "The duvet felt light while still keeping me warm, and the sheets were soft against my skin. A really comfortable bed to come back to.",
        "negative": "",
        "body": "The duvet felt light while still keeping me warm, and the sheets were soft against my skin. A really comfortable bed to come back to."
      },
      {
        "reviewer": "Stephanie",
        "title": "Better pastries than hot food",
        "positive": "Enjoyed the pastries at breakfast.",
        "negative": "The hot food was rather bland. I had some things I’d go back for and others I’d leave next time.",
        "body": "Enjoyed the pastries at breakfast.\nThe hot food was rather bland. I had some things I’d go back for and others I’d leave next time."
      },
      {
        "reviewer": "Black",
        "title": "Wonderful experience at the Pendry",
        "positive": "Customer service",
        "negative": "",
        "body": "Customer service"
      },
      {
        "reviewer": "Ruth",
        "title": "Went back for another pastry",
        "positive": "The pastries at breakfast had crisp edges and soft middles, just how I like them. I went back for another one before heading out.",
        "negative": "",
        "body": "The pastries at breakfast had crisp edges and soft middles, just how I like them. I went back for another one before heading out."
      },
      {
        "reviewer": "Jessica",
        "title": "Steady connection with occasional drops",
        "positive": "For long stretches the internet was perfectly steady.",
        "negative": "Then it would drop for a few minutes. Some annoying interruptions between the trouble-free sessions.",
        "body": "For long stretches the internet was perfectly steady.\nThen it would drop for a few minutes. Some annoying interruptions between the trouble-free sessions."
      },
      {
        "reviewer": "Tracy",
        "title": "No sticky surfaces",
        "positive": "No sticky tables or fingerprints on the mirror; everything felt properly cleaned.",
        "negative": "",
        "body": "No sticky tables or fingerprints on the mirror; everything felt properly cleaned."
      },
      {
        "reviewer": "Elena",
        "title": "Too much equipment out of use",
        "positive": "",
        "negative": "A couple of machines had out-of-order signs, leaving very little to choose from. I couldn’t put together the workout I’d planned.",
        "body": "A couple of machines had out-of-order signs, leaving very little to choose from. I couldn’t put together the workout I’d planned."
      },
      {
        "reviewer": "Leonid",
        "title": "Exceptional",
        "positive": "Great hotel",
        "negative": "",
        "body": "Great hotel"
      },
      {
        "reviewer": "Jani",
        "title": "Could keep up my usual workout",
        "positive": "The gym had the weights I normally use and enough different equipment to put together a proper session. I didn’t have to abandon half my routine.",
        "negative": "",
        "body": "The gym had the weights I normally use and enough different equipment to put together a proper session. I didn’t have to abandon half my routine."
      },
      {
        "reviewer": "Charlie",
        "title": "Very Good",
        "positive": "The people who worked there were great! Quick",
        "negative": "Quick service.",
        "body": "The people who worked there were great! Quick\nQuick service."
      },
      {
        "reviewer": "Susan",
        "title": "Fine for email, less good for calls",
        "positive": "Email and web pages worked fine over Wi-Fi.",
        "negative": "My video call cut out twice. The connection was useful for some things and frustrating for others.",
        "body": "Email and web pages worked fine over Wi-Fi.\nMy video call cut out twice. The connection was useful for some things and frustrating for others."
      },
      {
        "reviewer": "David",
        "title": "Beautiful hotel",
        "positive": "The hotel is in a great location and the rooms were exceptionally comfortable.",
        "negative": "Nothing from my perspective.",
        "body": "The hotel is in a great location and the rooms were exceptionally comfortable.\nNothing from my perspective."
      },
      {
        "reviewer": "Paola",
        "title": "Coffee and pastries hit the spot",
        "positive": "Good coffee and wonderfully fresh pastries at breakfast. I could get used to mornings like that!",
        "negative": "",
        "body": "Good coffee and wonderfully fresh pastries at breakfast. I could get used to mornings like that!"
      },
      {
        "reviewer": "Cacey",
        "title": "Easy to find a comfortable position",
        "positive": "I tend to turn over a lot, and every position felt comfortable on this bed. The mattress never seemed to push against my hips.",
        "negative": "",
        "body": "I tend to turn over a lot, and every position felt comfortable on this bed. The mattress never seemed to push against my hips."
      },
      {
        "reviewer": "Sanford",
        "title": "Ended up on mobile data",
        "positive": "",
        "negative": "Spent the first evening trying to get the Wi-Fi to stay connected for more than a few minutes. Eventually I gave up and used my phone’s data.",
        "body": "Spent the first evening trying to get the Wi-Fi to stay connected for more than a few minutes. Eventually I gave up and used my phone’s data."
      },
      {
        "reviewer": "James",
        "title": "Had an above and beyond experience. The service and cleanliness of the hotel made this hotel a new favorite.",
        "positive": "The staff was extremely accommodating. The room was cleaned to perfection every day we were there. Above and beyond.",
        "negative": "",
        "body": "The staff was extremely accommodating. The room was cleaned to perfection every day we were there. Above and beyond."
      },
      {
        "reviewer": "Francine",
        "title": "Someone else’s TV kept me company",
        "positive": "",
        "negative": "Next door’s television came through the wall loud and clear until late.",
        "body": "Next door’s television came through the wall loud and clear until late."
      },
      {
        "reviewer": "Simon",
        "title": "Enjoyed every minute",
        "positive": "Central Chicago, very walkable to all our destinations",
        "negative": "In-room information",
        "body": "Central Chicago, very walkable to all our destinations\nIn-room information"
      },
      {
        "reviewer": "Karie",
        "title": "Good connection on both devices",
        "positive": "Both devices worked well on the wireless network, whether I was browsing on my phone or using my tablet.",
        "negative": "",
        "body": "Both devices worked well on the wireless network, whether I was browsing on my phone or using my tablet."
      },
      {
        "reviewer": "Marc",
        "title": "A good breakfast selection",
        "positive": "Really enjoyed the hot breakfast options and fresh fruit, especially having so much to choose from in the morning.",
        "negative": "",
        "body": "Really enjoyed the hot breakfast options and fresh fruit, especially having so much to choose from in the morning."
      },
      {
        "reviewer": "Jorge",
        "title": "Handy at first, more travel later",
        "positive": "It was handy for the places I visited first.",
        "negative": "Less convenient for the other side of my itinerary. I had a mix of easy outings and awkward trips back.",
        "body": "It was handy for the places I visited first.\nLess convenient for the other side of my itinerary. I had a mix of easy outings and awkward trips back."
      },
      {
        "reviewer": "Megan",
        "title": "A lovely dreamy getaway with turndown service.",
        "positive": "Clean. Quiet. Nobody in the halls. Bar was amazing.",
        "negative": "",
        "body": "Clean. Quiet. Nobody in the halls. Bar was amazing."
      },
      {
        "reviewer": "Jeffery",
        "title": "Glad I brought my gym kit",
        "positive": "The fitness room had enough working equipment for both cardio and a few strength exercises. My trainers got more use than I’d expected.",
        "negative": "",
        "body": "The fitness room had enough working equipment for both cardio and a few strength exercises. My trainers got more use than I’d expected."
      },
      {
        "reviewer": "Upton",
        "title": "The pillows went completely flat",
        "positive": "",
        "negative": "Pillows that flattened into almost nothing, no matter how much I bunched them up to get some support.",
        "body": "Pillows that flattened into almost nothing, no matter how much I bunched them up to get some support."
      },
      {
        "reviewer": "Della",
        "title": "Internet worked when I needed it",
        "positive": "Used the internet for maps and a few bookings, and everything loaded when I needed it. No frustrating pauses between pages.",
        "negative": "",
        "body": "Used the internet for maps and a few bookings, and everything loaded when I needed it. No frustrating pauses between pages."
      },
      {
        "reviewer": "Colum",
        "title": "A dusty shelf in an otherwise clean room",
        "positive": "The bathroom was sparkling.",
        "negative": "A dusty shelf by the bed let the cleaning down a little.",
        "body": "The bathroom was sparkling.\nA dusty shelf by the bed let the cleaning down a little."
      },
      {
        "reviewer": "Tatiana",
        "title": "Wonderful",
        "positive": "Location, staff",
        "negative": "",
        "body": "Location, staff"
      },
      {
        "reviewer": "Mark",
        "title": "A breakfast I was glad not to skip",
        "positive": "I usually skip hotel breakfasts, but this one won me over with how fresh everything tasted.",
        "negative": "",
        "body": "I usually skip hotel breakfasts, but this one won me over with how fresh everything tasted."
      },
      {
        "reviewer": "Raimey",
        "title": "The bench and weights suited me",
        "positive": "The bench stayed steady while I exercised, and there were enough weight options to increase the load between sets. Quite happy with the gym.",
        "negative": "",
        "body": "The bench stayed steady while I exercised, and there were enough weight options to increase the load between sets. Quite happy with the gym."
      },
      {
        "reviewer": "Kathleen",
        "title": "Door slams sent me reaching for earplugs",
        "positive": "",
        "negative": "A door nearby slammed repeatedly during the evening, and the sound really travelled. I ended up using earplugs to take the edge off it.",
        "body": "A door nearby slammed repeatedly during the evening, and the sound really travelled. I ended up using earplugs to take the edge off it."
      },
      {
        "reviewer": "Brian",
        "title": "Excellent location, near all the major attractions. Super clean and excellent amenities.",
        "positive": "Location, amenities, cleanliness.",
        "negative": "Long wait to check in.",
        "body": "Location, amenities, cleanliness.\nLong wait to check in."
      },
      {
        "reviewer": "Randi",
        "title": "Tickets downloaded in seconds",
        "positive": "Downloaded my tickets using the room connection and had them ready in seconds. The internet worked just as smoothly the next morning.",
        "negative": "",
        "body": "Downloaded my tickets using the room connection and had them ready in seconds. The internet worked just as smoothly the next morning."
      },
      {
        "reviewer": "Lucy",
        "title": "Excellent",
        "positive": "Excellent Excellent",
        "negative": "",
        "body": "Excellent Excellent"
      },
      {
        "reviewer": "Chris",
        "title": "No buffering on my tablet",
        "positive": "Watched an episode on my tablet before bed and it played through without buffering. That was my main use of the Wi-Fi, and it handled it well.",
        "negative": "",
        "body": "Watched an episode on my tablet before bed and it played through without buffering. That was my main use of the Wi-Fi, and it handled it well."
      },
      {
        "reviewer": "Elizabeth",
        "title": "5 star joy",
        "positive": "Fantastic hotel with great service and vibe.",
        "negative": "Nothing to not like about The Pendry it’s fab!",
        "body": "Fantastic hotel with great service and vibe.\nNothing to not like about The Pendry it’s fab!"
      },
      {
        "reviewer": "Samantha",
        "title": "That mattress was a treat",
        "positive": "After a full day out, stretching out on this mattress felt wonderful. It had enough give without that sinking-in feeling.",
        "negative": "",
        "body": "After a full day out, stretching out on this mattress felt wonderful. It had enough give without that sinking-in feeling."
      },
      {
        "reviewer": "Julius",
        "title": "The sheet needed changing",
        "positive": "",
        "negative": "A visible mark on the sheet should have been spotted before I arrived.",
        "body": "A visible mark on the sheet should have been spotted before I arrived."
      },
      {
        "reviewer": "Kathy",
        "title": "Breakfast held up across all three days",
        "positive": "Breakfast was fresh and enjoyable on all three mornings, whatever I decided to try.",
        "negative": "",
        "body": "Breakfast was fresh and enjoyable on all three mornings, whatever I decided to try."
      },
      {
        "reviewer": "Syrpina",
        "title": "Shouting outside reached the room",
        "positive": "",
        "negative": "Outside shouting kept disturbing me well after I’d gone to bed, despite having the window firmly closed.",
        "body": "Outside shouting kept disturbing me well after I’d gone to bed, despite having the window firmly closed."
      },
      {
        "reviewer": "Marita",
        "title": "Lovely fresh linen",
        "positive": "Opened the bedding expecting the odd stray hair, as I’ve found elsewhere, but there wasn’t one. All the linen looked freshly washed.",
        "negative": "",
        "body": "Opened the bedding expecting the odd stray hair, as I’ve found elsewhere, but there wasn’t one. All the linen looked freshly washed."
      },
      {
        "reviewer": "Joshua",
        "title": "Excellent 10th anniversary trip!",
        "positive": "Excellent location, very nice accommodations and friendly staff.",
        "negative": "The bar staff were a bit cold.",
        "body": "Excellent location, very nice accommodations and friendly staff.\nThe bar staff were a bit cold."
      },
      {
        "reviewer": "Kathryn",
        "title": "More than a token set of dumbbells",
        "positive": "There was a useful range of dumbbells, rather than a few very light pairs. I could work through the strength exercises I’d planned.",
        "negative": "",
        "body": "There was a useful range of dumbbells, rather than a few very light pairs. I could work through the strength exercises I’d planned."
      },
      {
        "reviewer": "Cherie",
        "title": "Pillows with some support at last",
        "positive": "Good pillows! They held their shape instead of flattening under my head.",
        "negative": "",
        "body": "Good pillows! They held their shape instead of flattening under my head."
      },
      {
        "reviewer": "Harriet",
        "title": "Spotless from the moment I walked in",
        "positive": "You know that dusty feeling some hotel rooms have when you first walk in? None of that here; the furniture and window ledges were spotless.",
        "negative": "",
        "body": "You know that dusty feeling some hotel rooms have when you first walk in? None of that here; the furniture and window ledges were spotless."
      },
      {
        "reviewer": "Julie",
        "title": "Made myself very comfortable in bed",
        "positive": "Stayed up reading in bed longer than I meant to because it was so comfortable, especially with those pillows behind me.",
        "negative": "",
        "body": "Stayed up reading in bed longer than I meant to because it was so comfortable, especially with those pillows behind me."
      },
      {
        "reviewer": "Gail",
        "title": "Some nights quieter than others",
        "positive": "The first night was wonderfully quiet.",
        "negative": "Street noise carried into the room the following evening. My experience varied quite a bit from night to night.",
        "body": "The first night was wonderfully quiet.\nStreet noise carried into the room the following evening. My experience varied quite a bit from night to night."
      },
      {
        "reviewer": "Weam",
        "title": "Very Good",
        "positive": "Location",
        "negative": "Bill surcharges",
        "body": "Location\nBill surcharges"
      },
      {
        "reviewer": "Ruedi",
        "title": "Even checking directions was frustrating",
        "positive": "",
        "negative": "Looking up directions shouldn’t be difficult, but the room internet kept timing out. Basic browsing was unreliable throughout my visit.",
        "body": "Looking up directions shouldn’t be difficult, but the room internet kept timing out. Basic browsing was unreliable throughout my visit."
      },
      {
        "reviewer": "Iliana",
        "title": "A properly scrubbed bathroom",
        "positive": "Spotless shower glass and a freshly scrubbed sink, with none of the soap residue I so often find in hotel bathrooms.",
        "negative": "",
        "body": "Spotless shower glass and a freshly scrubbed sink, with none of the soap residue I so often find in hotel bathrooms."
      },
      {
        "reviewer": "Matthew",
        "title": "Wonderful",
        "positive": "Location",
        "negative": "",
        "body": "Location"
      },
      {
        "reviewer": "Donna",
        "title": "The equipment felt well maintained",
        "positive": "Nothing I tried in the fitness room was loose or sticking. Even the adjustments on the bench worked properly.",
        "negative": "",
        "body": "Nothing I tried in the fitness room was loose or sticking. Even the adjustments on the bench worked properly."
      },
      {
        "reviewer": "Vanderléia",
        "title": "Hot and full of flavor",
        "positive": "Hot, freshly cooked breakfast with plenty of flavor. I enjoyed every bite.",
        "negative": "",
        "body": "Hot, freshly cooked breakfast with plenty of flavor. I enjoyed every bite."
      },
      {
        "reviewer": "Luiz",
        "title": "Too hard a bed for me",
        "positive": "",
        "negative": "Woke up with a stiff back each morning after struggling to get comfortable on the bed. The mattress was much too hard for my liking.",
        "body": "Woke up with a stiff back each morning after struggling to get comfortable on the bed. The mattress was much too hard for my liking."
      },
      {
        "reviewer": "Vyacheslav",
        "title": "Mostly muffled, apart from louder voices",
        "positive": "Ordinary corridor activity was well muffled.",
        "negative": "A few loud voices came through clearly. It wasn’t consistently noisy, but it wasn’t completely peaceful either.",
        "body": "Ordinary corridor activity was well muffled.\nA few loud voices came through clearly. It wasn’t consistently noisy, but it wasn’t completely peaceful either."
      },
      {
        "reviewer": "Susana",
        "title": "Cleaning slipped a little later on",
        "positive": "Cleaning was thorough on the first day, especially around the sink and shower.",
        "negative": "Later in the stay, I noticed the bathroom floor hadn’t been done as carefully.",
        "body": "Cleaning was thorough on the first day, especially around the sink and shower.\nLater in the stay, I noticed the bathroom floor hadn’t been done as carefully."
      },
      {
        "reviewer": "Sharon",
        "title": "The Pendry is awesome",
        "positive": "Great location. Muriel at the front desk was great.",
        "negative": "",
        "body": "Great location. Muriel at the front desk was great."
      },
      {
        "reviewer": "Wojciech",
        "title": "Firm without being too hard",
        "positive": "A firm mattress suits me, and this one got the balance right. Supportive, but with enough cushioning that I wasn’t waking up stiff.",
        "negative": "",
        "body": "A firm mattress suits me, and this one got the balance right. Supportive, but with enough cushioning that I wasn’t waking up stiff."
      },
      {
        "reviewer": "Philippe",
        "title": "An evening online without reconnecting",
        "positive": "My laptop stayed online through an entire evening without the usual fiddling with the Wi-Fi to get it going again.",
        "negative": "",
        "body": "My laptop stayed online through an entire evening without the usual fiddling with the Wi-Fi to get it going again."
      },
      {
        "reviewer": "Lars",
        "title": "Exceptional",
        "positive": "Everything. I’ve never enjoyed a hotel stay as much as I did at Pendry. The location, the so attentive and kind staff, the interiors, the luxury feel, their complementary refresher by the front desk.",
        "negative": "The room was a little tight, but very comfortable.",
        "body": "Everything. I’ve never enjoyed a hotel stay as much as I did at Pendry. The location, the so attentive and kind staff, the interiors, the luxury feel, their complementary refresher by the front desk.\nThe room was a little tight, but very comfortable."
      },
      {
        "reviewer": "Judy",
        "title": "So much waiting for pages to load",
        "positive": "",
        "negative": "Even opening a basic web page involved waiting, refreshing and waiting again. The Wi-Fi showed a connection but rarely seemed to get anywhere.",
        "body": "Even opening a basic web page involved waiting, refreshing and waiting again. The Wi-Fi showed a connection but rarely seemed to get anywhere."
      },
      {
        "reviewer": "Margarida",
        "title": "Quiet even when I turned in early",
        "positive": "Turned in fairly early and expected to hear other guests returning later. If they did, I certainly didn’t hear them.",
        "negative": "",
        "body": "Turned in fairly early and expected to hear other guests returning later. If they did, I certainly didn’t hear them."
      },
      {
        "reviewer": "Kate",
        "title": "Weights were useful, bike needed attention",
        "positive": "The dumbbells and bench let me get through most of my workout.",
        "negative": "The exercise bike’s resistance kept slipping, which made that part of the session frustrating.",
        "body": "The dumbbells and bench let me get through most of my workout.\nThe exercise bike’s resistance kept slipping, which made that part of the session frustrating."
      },
      {
        "reviewer": "Anthony",
        "title": "Plenty I wanted to eat",
        "positive": "Tasty breakfast and plenty I wanted to eat. I looked forward to it.",
        "negative": "",
        "body": "Tasty breakfast and plenty I wanted to eat. I looked forward to it."
      },
      {
        "reviewer": "Wendy",
        "title": "Very Good",
        "positive": "Best hotel gym I’ve ever seen and such friendly welcoming staff",
        "negative": "",
        "body": "Best hotel gym I’ve ever seen and such friendly welcoming staff"
      },
      {
        "reviewer": "Oyassia",
        "title": "Woken by closing doors",
        "positive": "",
        "negative": "Every closing door along the corridor seemed to land with a thud in my room. I was woken more than once by it.",
        "body": "Every closing door along the corridor seemed to land with a thud in my room. I was woken more than once by it."
      },
      {
        "reviewer": "Robert",
        "title": "A lovely bed to come back to",
        "positive": "Getting into that cushioned bed with its smooth sheets was exactly what I needed at the end of each day.",
        "negative": "",
        "body": "Getting into that cushioned bed with its smooth sheets was exactly what I needed at the end of each day."
      },
      {
        "reviewer": "Michal",
        "title": "Even my socks stayed clean",
        "positive": "Walked around in white socks after unpacking and they stayed white, so the floors had clearly had a proper clean.",
        "negative": "",
        "body": "Walked around in white socks after unpacking and they stayed white, so the floors had clearly had a proper clean."
      },
      {
        "reviewer": "Talia",
        "title": "Good options for different appetites",
        "positive": "There was enough variety for me to have a lighter breakfast one day and something more filling the next. Both were tasty and freshly prepared.",
        "negative": "",
        "body": "There was enough variety for me to have a lighter breakfast one day and something more filling the next. Both were tasty and freshly prepared."
      },
      {
        "reviewer": "Alyssa",
        "title": "Exceptional",
        "positive": "We were speechless walking into our room. Staff and room exceeded our expectations and we cannot wait to book again.",
        "negative": "",
        "body": "We were speechless walking into our room. Staff and room exceeded our expectations and we cannot wait to book again."
      },
      {
        "reviewer": "Raul",
        "title": "Hardly heard the room next door",
        "positive": "Barely heard a thing through the wall, even though I knew the room next door was occupied.",
        "negative": "",
        "body": "Barely heard a thing through the wall, even though I knew the room next door was occupied."
      },
      {
        "reviewer": "Adriana",
        "title": "Our stay at Pendry was perfect.",
        "positive": "We loved everything!",
        "negative": "N/A",
        "body": "We loved everything!\nN/A"
      },
      {
        "reviewer": "Brad",
        "title": "Wi-Fi kept dropping in the same spot",
        "positive": "",
        "negative": "The Wi-Fi signal kept dropping while I sat in the same spot. Very frustrating.",
        "body": "The Wi-Fi signal kept dropping while I sat in the same spot. Very frustrating."
      },
      {
        "reviewer": "Fischer",
        "title": "Enough room to stretch properly",
        "positive": "I could roll out a mat and do my floor exercises without getting in the way of the machines. The fitness area worked well for that.",
        "negative": "",
        "body": "I could roll out a mat and do my floor exercises without getting in the way of the machines. The fitness area worked well for that."
      },
      {
        "reviewer": "Cristian",
        "title": "Fruit was fresher on the first morning",
        "positive": "Lovely breakfast fruit on day one.",
        "negative": "Disappointing fruit on day two; freshness was a bit hit and miss.",
        "body": "Lovely breakfast fruit on day one.\nDisappointing fruit on day two; freshness was a bit hit and miss."
      },
      {
        "reviewer": "Ellen",
        "title": "Tired of reconnecting",
        "positive": "",
        "negative": "Had to keep reconnecting the Wi-Fi, sometimes before I’d even finished opening the page I wanted.",
        "body": "Had to keep reconnecting the Wi-Fi, sometimes before I’d even finished opening the page I wanted."
      },
      {
        "reviewer": "Samuel",
        "title": "A beautiful hotel",
        "positive": "A very beautiful hotel, a large light filled room with tasteful styling",
        "negative": "",
        "body": "A very beautiful hotel, a large light filled room with tasteful styling"
      },
      {
        "reviewer": "Elba",
        "title": "Good cardio, fewer choices for strength",
        "positive": "I enjoyed using the treadmills; they were in good working order.",
        "negative": "The weights selection was limited, so I couldn’t do quite the strength session I’d planned.",
        "body": "I enjoyed using the treadmills; they were in good working order.\nThe weights selection was limited, so I couldn’t do quite the strength session I’d planned."
      },
      {
        "reviewer": "Mary",
        "title": "Hallway activity barely reached me",
        "positive": "People were coming and going along the corridor, but I only noticed when I opened my door. Inside the room, things were nicely hushed.",
        "negative": "",
        "body": "People were coming and going along the corridor, but I only noticed when I opened my door. Inside the room, things were nicely hushed."
      },
      {
        "reviewer": "Rajat",
        "title": "Never got that promised follow-up",
        "positive": "",
        "negative": "Still waiting for the follow-up I was promised after raising a request at reception; nobody ever got back to me.",
        "body": "Still waiting for the follow-up I was promised after raising a request at reception; nobody ever got back to me."
      },
      {
        "reviewer": "Jonathan",
        "title": "Next door’s conversation carried through",
        "positive": "",
        "negative": "Could follow bits of the conversation in the next room without trying. The sound carried through the wall enough to be distracting late in the evening.",
        "body": "Could follow bits of the conversation in the next room without trying. The sound carried through the wall enough to be distracting late in the evening."
      },
      {
        "reviewer": "Michelina",
        "title": "Exceptional",
        "positive": "Really clean room!",
        "negative": "",
        "body": "Really clean room!"
      },
      {
        "reviewer": "Eduardo",
        "title": "Pillows that suited my neck",
        "positive": "Usually I spend the first night folding hotel pillows into shape, but these supported my neck just right. I settled straight in.",
        "negative": "",
        "body": "Usually I spend the first night folding hotel pillows into shape, but these supported my neck just right. I settled straight in."
      },
      {
        "reviewer": "Oleksandr",
        "title": "Two visits to the fitness room",
        "positive": "Used the gym twice during my stay. I don’t use gyms often enough to say much about how the facilities compare.",
        "negative": "",
        "body": "Used the gym twice during my stay. I don’t use gyms often enough to say much about how the facilities compare."
      },
      {
        "reviewer": "Michael",
        "title": "We love the Pendry- we stay in the Pendry every time we visit.",
        "positive": "Great vibe",
        "negative": "Everything was excellent",
        "body": "Great vibe\nEverything was excellent"
      },
      {
        "reviewer": "Sergio",
        "title": "The little corners were clean too",
        "positive": "Even the shelf behind the bathroom mirror was free of dust. Little things like that made the room feel properly looked after.",
        "negative": "",
        "body": "Even the shelf behind the bathroom mirror was free of dust. Little things like that made the room feel properly looked after."
      },
      {
        "reviewer": "Sarah",
        "title": "Never needed my earplugs",
        "positive": "The earplugs I packed stayed in my bag. Outside activity was muted enough that I didn’t feel I needed them.",
        "negative": "",
        "body": "The earplugs I packed stayed in my bag. Outside activity was muted enough that I didn’t feel I needed them."
      },
      {
        "reviewer": "Abdullah",
        "title": "Really enjoyed the fruit and bread",
        "positive": "Ripe fruit that actually tasted sweet and some lovely fresh bread made breakfast very enjoyable.",
        "negative": "",
        "body": "Ripe fruit that actually tasted sweet and some lovely fresh bread made breakfast very enjoyable."
      },
      {
        "reviewer": "Derek",
        "title": "Nice hotel. Beautiful reception and bar areas. Extremely slow service in the bar.",
        "positive": "The public areas on the ground floor were gorgeous.",
        "negative": "Very little attention or money had been spent on the other floors above ground level. The decor of the rooms has definitely been upsold in the photos, in reality they are rather drab.",
        "body": "The public areas on the ground floor were gorgeous.\nVery little attention or money had been spent on the other floors above ground level. The decor of the rooms has definitely been upsold in the photos, in reality they are rather drab."
      },
      {
        "reviewer": "Jon",
        "title": "Wonderful",
        "positive": "Staff was the best!! The VALET ROCKS!!!!",
        "negative": "",
        "body": "Staff was the best!! The VALET ROCKS!!!!"
      },
      {
        "reviewer": "Michel",
        "title": "Night traffic was hard to ignore",
        "positive": "",
        "negative": "Engines and horns were surprisingly loud from the room at night. I found myself waiting for gaps in the traffic noise before I could drift off.",
        "body": "Engines and horns were surprisingly loud from the room at night. I found myself waiting for gaps in the traffic noise before I could drift off."
      },
      {
        "reviewer": "Bookstaver",
        "title": "Good mattress, stiff bedding",
        "positive": "My back was happy with the mattress.",
        "negative": "The stiff bedding wasn’t nearly as comfortable against my skin.",
        "body": "My back was happy with the mattress.\nThe stiff bedding wasn’t nearly as comfortable against my skin."
      },
      {
        "reviewer": "Alison",
        "title": "The breakfast fruit was a highlight",
        "positive": "The fruit selection was a pleasant surprise: sweet, ripe and worth finishing. Breakfast ended up being one of the meals I enjoyed most on the trip.",
        "negative": "",
        "body": "The fruit selection was a pleasant surprise: sweet, ripe and worth finishing. Breakfast ended up being one of the meals I enjoyed most on the trip."
      },
      {
        "reviewer": "John-paul",
        "title": "Useful setup for a short weights session",
        "positive": "Found the dumbbells and an adjustable bench I needed without having to improvise. That was enough for a satisfying workout.",
        "negative": "",
        "body": "Found the dumbbells and an adjustable bench I needed without having to improvise. That was enough for a satisfying workout."
      },
      {
        "reviewer": "Isagarciaa",
        "title": "The place I love the stay when in Chicago.",
        "positive": "Great property in a great location.",
        "negative": "Nothing",
        "body": "Great property in a great location.\nNothing"
      },
      {
        "reviewer": "Blair",
        "title": "Fresh towels every day",
        "positive": "Fresh towels and a spotless bathroom every day. Very happy with the cleaning.",
        "negative": "",
        "body": "Fresh towels and a spotless bathroom every day. Very happy with the cleaning."
      },
      {
        "reviewer": "Dellann",
        "title": "They got the scrambled eggs right",
        "positive": "Scrambled eggs can be disappointing in hotels, but these were soft and properly seasoned. A much better breakfast than I’d expected.",
        "negative": "",
        "body": "Scrambled eggs can be disappointing in hotels, but these were soft and properly seasoned. A much better breakfast than I’d expected."
      },
      {
        "reviewer": "Kayla",
        "title": "Plenty to work with in the gym",
        "positive": "A bike, treadmills and weights gave me enough choice to vary things over my stay. I was pleased with what was available.",
        "negative": "",
        "body": "A bike, treadmills and weights gave me enough choice to vary things over my stay. I was pleased with what was available."
      },
      {
        "reviewer": "Cécile",
        "title": "Wonderful",
        "positive": "needs elevators that work quicker",
        "negative": "",
        "body": "needs elevators that work quicker"
      },
      {
        "reviewer": "Claudia",
        "title": "Couldn’t finish uploading my photos",
        "positive": "",
        "negative": "Couldn’t get a photo upload to finish on the hotel network. After several failed attempts, I switched to mobile data and left the Wi-Fi alone.",
        "body": "Couldn’t get a photo upload to finish on the hotel network. After several failed attempts, I switched to mobile data and left the Wi-Fi alone."
      },
      {
        "reviewer": "Geoffery",
        "title": "A bike I actually wanted to use",
        "positive": "The exercise bike’s resistance changed smoothly and the pedals felt steady. Managed the whole session I’d planned on it.",
        "negative": "",
        "body": "The exercise bike’s resistance changed smoothly and the pedals felt steady. Managed the whole session I’d planned on it."
      },
      {
        "reviewer": "Amanda",
        "title": "Couldn’t get comfortable in that dip",
        "positive": "",
        "negative": "There was a noticeable dip on one side of the mattress that kept pulling me into it. I never found a comfortable spot.",
        "body": "There was a noticeable dip on one side of the mattress that kept pulling me into it. I never found a comfortable spot."
      },
      {
        "reviewer": "Pranav",
        "title": "Stunning stay in a Chicago icon",
        "positive": "Gorgeously appointed hotel in a fantastic location. The building is iconic and the staff were so helpful and delightful. They could not have done enough to assist.",
        "negative": "Nothing. It was perfect!",
        "body": "Gorgeously appointed hotel in a fantastic location. The building is iconic and the staff were so helpful and delightful. They could not have done enough to assist.\nNothing. It was perfect!"
      },
      {
        "reviewer": "Jomarra",
        "title": "Fresh bread made the morning",
        "positive": "Really enjoyed the bread in the morning, especially toasted with a little butter. It tasted fresh each day, which made a simple breakfast very satisfying.",
        "negative": "",
        "body": "Really enjoyed the bread in the morning, especially toasted with a little butter. It tasted fresh each day, which made a simple breakfast very satisfying."
      },
      {
        "reviewer": "Emel",
        "title": "Couldn’t fault the housekeeping",
        "positive": "Fresh sheets, spotless towels and no dusty surfaces when I put my things down. Couldn’t fault the cleaning during my three nights.",
        "negative": "",
        "body": "Fresh sheets, spotless towels and no dusty surfaces when I put my things down. Couldn’t fault the cleaning during my three nights."
      },
      {
        "reviewer": "Hanan",
        "title": "Limited options for cardio",
        "positive": "",
        "negative": "I’d hoped to switch between a bike and a treadmill, but the gym didn’t offer both. The lack of choice made it hard to follow my usual cardio routine.",
        "body": "I’d hoped to switch between a bike and a treadmill, but the gym didn’t offer both. The lack of choice made it hard to follow my usual cardio routine."
      },
      {
        "reviewer": "Brittany",
        "title": "Exceptional",
        "positive": "Wonderful building, great location",
        "negative": "No attention to sustainability, towels are changed daily even when barely used",
        "body": "Wonderful building, great location\nNo attention to sustainability, towels are changed daily even when barely used"
      },
      {
        "reviewer": "Victoria",
        "title": "Looked forward to breakfast",
        "positive": "Breakfast was something I looked forward to each morning. The eggs were nicely cooked and the toast arrived with a proper crunch.",
        "negative": "",
        "body": "Breakfast was something I looked forward to each morning. The eggs were nicely cooked and the toast arrived with a proper crunch."
      },
      {
        "reviewer": "Joseph",
        "title": "Could hear everyone passing my door",
        "positive": "",
        "negative": "Footsteps and conversations in the corridor sounded much closer than they should have. Each time someone passed, it pulled my attention away from what I was doing.",
        "body": "Footsteps and conversations in the corridor sounded much closer than they should have. Each time someone passed, it pulled my attention away from what I was doing."
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
        "reviewer": "Anne",
        "title": "Eggs and toast just how I like them",
        "positive": "Eggs were cooked just as I like them, with toast that wasn’t leathery or cold. Breakfast made a very good start to the day.",
        "negative": "",
        "body": "Eggs were cooked just as I like them, with toast that wasn’t leathery or cold. Breakfast made a very good start to the day."
      },
      {
        "reviewer": "Daniel",
        "title": "Housekeeping made a good impression",
        "positive": "Crisp, freshly washed linen and a properly scrubbed bathroom made a good first impression. That level of cleanliness continued during the visit.",
        "negative": "",
        "body": "Crisp, freshly washed linen and a properly scrubbed bathroom made a good first impression. That level of cleanliness continued during the visit."
      },
      {
        "reviewer": "Cristie",
        "title": "The connection wouldn’t hold",
        "positive": "",
        "negative": "The internet dropped whenever I tried to do more than open a page or two. Rejoining the network only bought me another few minutes.",
        "body": "The internet dropped whenever I tried to do more than open a page or two. Rejoining the network only bought me another few minutes."
      },
      {
        "reviewer": "Lauren",
        "title": "Even support across the bed",
        "positive": "No lumps, dips or hard edges in the mattress, just even support wherever I settled.",
        "negative": "",
        "body": "No lumps, dips or hard edges in the mattress, just even support wherever I settled."
      },
      {
        "reviewer": "Bashaer",
        "title": "Relaxing stay in a busy part of town. Tranquil vibes and delicious food.",
        "positive": "Walking distance to restaurants and shops.",
        "negative": "View of the room is of a pickle ball court",
        "body": "Walking distance to restaurants and shops.\nView of the room is of a pickle ball court"
      },
      {
        "reviewer": "Rjtonya",
        "title": "Toothpaste from the previous guest",
        "positive": "",
        "negative": "The bathroom counter had dried toothpaste on it from before I arrived. It made me question how thoroughly the room had been cleaned.",
        "body": "The bathroom counter had dried toothpaste on it from before I arrived. It made me question how thoroughly the room had been cleaned."
      },
      {
        "reviewer": "Неофидов",
        "title": "Great for relax and vacation.",
        "positive": "High level of comfort and incredibly responsive staff.",
        "negative": "I cannot live there permanently.",
        "body": "High level of comfort and incredibly responsive staff.\nI cannot live there permanently."
      },
      {
        "reviewer": "Debra",
        "title": "So little sound from the corridor",
        "positive": "Closed the door and could barely tell there were other guests on the floor. The lack of corridor noise was a real plus.",
        "negative": "",
        "body": "Closed the door and could barely tell there were other guests on the floor. The lack of corridor noise was a real plus."
      },
      {
        "reviewer": "Angela",
        "title": "More than sweet things for breakfast",
        "positive": "Breakfast had enough savory options to suit me, and the ones I tried tasted good. It was nice having more to choose from than sweet pastries.",
        "negative": "",
        "body": "Breakfast had enough savory options to suit me, and the ones I tried tasted good. It was nice having more to choose from than sweet pastries."
      },
      {
        "reviewer": "Francis",
        "title": "More travelling than sightseeing",
        "positive": "",
        "negative": "Ended up spending a lot of the day getting to and from the places I wanted to see. The location wasn’t convenient for my sightseeing plans.",
        "body": "Ended up spending a lot of the day getting to and from the places I wanted to see. The location wasn’t convenient for my sightseeing plans."
      },
      {
        "reviewer": "Aileen",
        "title": "Struggled to find an appealing breakfast",
        "positive": "",
        "negative": "Limited choices and unappealing food made breakfast a disappointment, particularly by the third morning.",
        "body": "Limited choices and unappealing food made breakfast a disappointment, particularly by the third morning."
      },
      {
        "reviewer": "Eran",
        "title": "Not a speck on the desk",
        "positive": "Ran my hand over the desk before unpacking and didn’t pick up any dust; the rest of the room looked equally clean.",
        "negative": "",
        "body": "Ran my hand over the desk before unpacking and didn’t pick up any dust; the rest of the room looked equally clean."
      },
      {
        "reviewer": "Abhishek",
        "title": "Perfect location, excellent staff and a beautiful view from the room.",
        "positive": "Best possible location, amazing staff, superb room & view",
        "negative": "",
        "body": "Best possible location, amazing staff, superb room & view"
      },
      {
        "reviewer": "Paul",
        "title": "The door blocked out passing guests",
        "positive": "The door seemed to block most of the noise from people passing outside. I only realized how busy the corridor was when I stepped out.",
        "negative": "",
        "body": "The door seemed to block most of the noise from people passing outside. I only realized how busy the corridor was when I stepped out."
      },
      {
        "reviewer": "William",
        "title": "Tickets booked without a connection problem",
        "positive": "Booked my next day’s tickets from the room without a single connection hiccup. The Wi-Fi worked just as reliably for messages and browsing afterwards.",
        "negative": "",
        "body": "Booked my next day’s tickets from the room without a single connection hiccup. The Wi-Fi worked just as reliably for messages and browsing afterwards."
      },
      {
        "reviewer": "Monique",
        "title": "Equipment was ready to use",
        "positive": "All the machines I tried were functioning properly, with no broken controls to work around. I was happy with the fitness facilities.",
        "negative": "",
        "body": "All the machines I tried were functioning properly, with no broken controls to work around. I was happy with the fitness facilities."
      },
      {
        "reviewer": "Christen",
        "title": "Bathroom was clean right to the edges",
        "positive": "Noticed how clean the bathroom tiles were while unpacking my toiletries. No soap residue around the basin or grubby edges in the shower either.",
        "negative": "",
        "body": "Noticed how clean the bathroom tiles were while unpacking my toiletries. No soap residue around the basin or grubby edges in the shower either."
      },
      {
        "reviewer": "Rita",
        "title": "Exceptional",
        "positive": "Nice facilities, cool roof top bar, very friendly and attentive staff.",
        "negative": "",
        "body": "Nice facilities, cool roof top bar, very friendly and attentive staff."
      },
      {
        "reviewer": "Daiva",
        "title": "Luxury comfort and design",
        "positive": "Everything! Beautiful design and very comfortable stay.",
        "negative": "",
        "body": "Everything! Beautiful design and very comfortable stay."
      },
      {
        "reviewer": "Takeena",
        "title": "Easy to plan the day online",
        "positive": "I used a tablet to plan most of my trip, so reliable internet mattered. Pages opened promptly and the Wi-Fi never lost the connection mid-search.",
        "negative": "",
        "body": "I used a tablet to plan most of my trip, so reliable internet mattered. Pages opened promptly and the Wi-Fi never lost the connection mid-search."
      },
      {
        "reviewer": "Javier",
        "title": "Enjoyed a peaceful evening in",
        "positive": "Stayed in one evening with nothing playing and found it very peaceful. No street sounds or neighboring conversations competing for attention.",
        "negative": "",
        "body": "Stayed in one evening with nothing playing and found it very peaceful. No street sounds or neighboring conversations competing for attention."
      },
      {
        "reviewer": "Ann",
        "title": "Cardio options were disappointing",
        "positive": "",
        "negative": "One treadmill wouldn’t start and the other kept pausing during use. I left the gym without getting the run I’d hoped for.",
        "body": "One treadmill wouldn’t start and the other kept pausing during use. I left the gym without getting the run I’d hoped for."
      },
      {
        "reviewer": "Deanna",
        "title": "My phone connected without any fuss",
        "positive": "My phone picked up the Wi-Fi automatically each evening and stayed connected as long as I needed it.",
        "negative": "",
        "body": "My phone picked up the Wi-Fi automatically each evening and stayed connected as long as I needed it."
      },
      {
        "reviewer": "Alicia",
        "title": "A mattress my hips could get on with",
        "positive": "I slept on my side without my hip feeling pressed into the mattress. That’s a small thing, but it made the bed especially comfortable for me.",
        "negative": "",
        "body": "I slept on my side without my hip feeling pressed into the mattress. That’s a small thing, but it made the bed especially comfortable for me."
      },
      {
        "reviewer": "Michelle",
        "title": "Dust hiding behind the bedside table",
        "positive": "",
        "negative": "Dust had built up behind the bedside table, and it was obvious once I plugged in my charger. That area looked as though it hadn’t been cleaned for a while.",
        "body": "Dust had built up behind the bedside table, and it was obvious once I plugged in my charger. That area looked as though it hadn’t been cleaned for a while."
      },
      {
        "reviewer": "Mokhtar",
        "title": "Had to work around broken equipment",
        "positive": "",
        "negative": "More than one machine in the fitness room was out of use. With so few alternatives, there wasn’t much of a workout left for me to do.",
        "body": "More than one machine in the fitness room was out of use. With so few alternatives, there wasn’t much of a workout left for me to do."
      },
      {
        "reviewer": "Dmitry",
        "title": "Quieter once the evening settled down",
        "positive": "Once the evening settled down, it was very quiet.",
        "negative": "Earlier I could hear guests talking in the hallway. The noise level wasn’t the same throughout the night.",
        "body": "Once the evening settled down, it was very quiet.\nEarlier I could hear guests talking in the hallway. The noise level wasn’t the same throughout the night."
      },
      {
        "reviewer": "Faith",
        "title": "excellent, I give it a 20/10. if I travel to Chicago again, I’ll most definitely book Nobu again",
        "positive": "staff super friendly, kind and always willing to help. property is modern and classy.",
        "negative": "",
        "body": "staff super friendly, kind and always willing to help. property is modern and classy."
      },
      {
        "reviewer": "Jason",
        "title": "Location worked for some outings",
        "positive": "The location suited a couple of my outings perfectly.",
        "negative": "Getting to the other places on my list was a trek. It really depended on the day’s plans.",
        "body": "The location suited a couple of my outings perfectly.\nGetting to the other places on my list was a trek. It really depended on the day’s plans."
      },
      {
        "reviewer": "Amy",
        "title": "Didn’t feel like moving off that bed",
        "positive": "Stretched out for a short rest after unpacking and didn’t feel like moving. The bed was that comfortable.",
        "negative": "",
        "body": "Stretched out for a short rest after unpacking and didn’t feel like moving. The bed was that comfortable."
      },
      {
        "reviewer": "Camila",
        "title": "Nothing awkward about the machines",
        "positive": "The gym equipment adjusted easily, and everything I used felt secure. I could concentrate on exercising instead of fiddling with it.",
        "negative": "",
        "body": "The gym equipment adjusted easily, and everything I used felt secure. I could concentrate on exercising instead of fiddling with it."
      },
      {
        "reviewer": "Amanda",
        "title": "Lovely",
        "positive": "Great ambience",
        "negative": "Nothing",
        "body": "Great ambience\nNothing"
      },
      {
        "reviewer": "Richard",
        "title": "Two quiet nights out of three",
        "positive": "Two peaceful nights, with long quiet stretches.",
        "negative": "One night was interrupted by outside noise. Those distracting moments left me with a mixed impression overall.",
        "body": "Two peaceful nights, with long quiet stretches.\nOne night was interrupted by outside noise. Those distracting moments left me with a mixed impression overall."
      },
      {
        "reviewer": "Jade",
        "title": "Fresh linen, sticky desk",
        "positive": "Sheets and towels were spotless.",
        "negative": "The desk had a sticky patch I had to wipe. The cleaning was good in some places and careless in others.",
        "body": "Sheets and towels were spotless.\nThe desk had a sticky patch I had to wipe. The cleaning was good in some places and careless in others."
      },
      {
        "reviewer": "Ron",
        "title": "Simple breakfast, fresh ingredients",
        "positive": "A simple breakfast done well: ripe fruit, fresh bread and good coffee. Everything tasted as though it belonged on the plate that morning.",
        "negative": "",
        "body": "A simple breakfast done well: ripe fruit, fresh bread and good coffee. Everything tasted as though it belonged on the plate that morning."
      },
      {
        "reviewer": "Pavielle",
        "title": "Barely noticed late arrivals",
        "positive": "Expected to hear other guests coming back late, but almost no hallway noise reached me inside.",
        "negative": "",
        "body": "Expected to hear other guests coming back late, but almost no hallway noise reached me inside."
      },
      {
        "reviewer": "Bridgette",
        "title": "Exceptional",
        "positive": "This property is absolutely amazing from the staff, cleanliness, location, convenience, absolutely everything was amazing! The staff was so accommodating and made us feel so welcomed! I will always be staying with Nobu going forward.",
        "negative": "",
        "body": "This property is absolutely amazing from the staff, cleanliness, location, convenience, absolutely everything was amazing! The staff was so accommodating and made us feel so welcomed! I will always be staying with Nobu going forward."
      },
      {
        "reviewer": "Jacquelyn",
        "title": "Maps and bookings all went smoothly",
        "positive": "Scrolled through maps, checked train times and made a reservation on the same Wi-Fi session. Nothing stalled or asked me to reconnect.",
        "negative": "",
        "body": "Scrolled through maps, checked train times and made a reservation on the same Wi-Fi session. Nothing stalled or asked me to reconnect."
      },
      {
        "reviewer": "Gordon",
        "title": "Dried-out eggs and limp toast",
        "positive": "",
        "negative": "The eggs at breakfast had dried out around the edges. Alongside some limp toast, they made for a pretty unappealing start to the day.",
        "body": "The eggs at breakfast had dried out around the edges. Alongside some limp toast, they made for a pretty unappealing start to the day."
      },
      {
        "reviewer": "Randall",
        "title": "Soft bedding without the weight",
        "positive": "Soft bedding that didn’t weigh me down or make turning over feel like a struggle.",
        "negative": "",
        "body": "Soft bedding that didn’t weigh me down or make turning over feel like a struggle."
      },
      {
        "reviewer": "Stuart",
        "title": "Radio played without cutting out",
        "positive": "Online radio kept playing over Wi-Fi while I got ready, with no sound cutting out mid-song.",
        "negative": "",
        "body": "Online radio kept playing over Wi-Fi while I got ready, with no sound cutting out mid-song."
      },
      {
        "reviewer": "Karen",
        "title": "Quiet enough for an afternoon of reading",
        "positive": "Spent an afternoon reading in the room and wasn’t distracted by noise from neighboring guests. The quiet carried on into the evening too.",
        "negative": "",
        "body": "Spent an afternoon reading in the room and wasn’t distracted by noise from neighboring guests. The quiet carried on into the evening too."
      },
      {
        "reviewer": "Dennis",
        "title": "Nice pillows, overly firm mattress",
        "positive": "I liked the pillows and soft sheets.",
        "negative": "The mattress was firmer than I could really settle into. Not a bad bed, but not entirely right for me either.",
        "body": "I liked the pillows and soft sheets.\nThe mattress was firmer than I could really settle into. Not a bad bed, but not entirely right for me either."
      },
      {
        "reviewer": "Ayanna",
        "title": "Superb. Would love to return or stay at another location.",
        "positive": "Everything: location, decor, scent, staff, amenities.",
        "negative": "Found a hair in bathroom sink",
        "body": "Everything: location, decor, scent, staff, amenities.\nFound a hair in bathroom sink"
      },
      {
        "reviewer": "Bilal",
        "title": "Too little equipment for my plans",
        "positive": "",
        "negative": "I expected to be able to do a fairly ordinary strength routine, but several exercises weren’t possible with the equipment there. The gym felt very limited.",
        "body": "I expected to be able to do a fairly ordinary strength routine, but several exercises weren’t possible with the equipment there. The gym felt very limited."
      },
      {
        "reviewer": "Aasiyah",
        "title": "No hallway noise waking me early",
        "positive": "No clattering or loud conversations from the corridor to wake me earlier than I wanted.",
        "negative": "",
        "body": "No clattering or loud conversations from the corridor to wake me earlier than I wanted."
      },
      {
        "reviewer": "Melony",
        "title": "Breakfast didn’t taste fresh",
        "positive": "",
        "negative": "Took a bite of the morning pastry and found it disappointingly stale. The rest of breakfast wasn’t much better, with very little that tasted fresh.",
        "body": "Took a bite of the morning pastry and found it disappointingly stale. The rest of breakfast wasn’t much better, with very little that tasted fresh."
      },
      {
        "reviewer": "Murray",
        "title": "Excellent location, amenities, and service",
        "positive": "Great location in the West Loop, you’re in the middle of everything.",
        "negative": "None",
        "body": "Great location in the West Loop, you’re in the middle of everything.\nNone"
      },
      {
        "reviewer": "Arif",
        "title": "As comfortable as my bed at home",
        "positive": "My usual test is whether I miss my bed at home, and here I didn’t. The mattress and pillows suited me straight away.",
        "negative": "",
        "body": "My usual test is whether I miss my bed at home, and here I didn’t. The mattress and pillows suited me straight away."
      },
      {
        "reviewer": "Thilo",
        "title": "Kept my exercise plans on track",
        "positive": "Packed workout clothes hoping I’d find a usable gym. The equipment here covered my routine, and I was glad to get a session in.",
        "negative": "",
        "body": "Packed workout clothes hoping I’d find a usable gym. The equipment here covered my routine, and I was glad to get a session in."
      },
      {
        "reviewer": "Christopher",
        "title": "All my photos backed up first time",
        "positive": "Left my photos backing up on the hotel Wi-Fi and found the whole batch uploaded without a single failed attempt.",
        "negative": "",
        "body": "Left my photos backing up on the hotel Wi-Fi and found the whole batch uploaded without a single failed attempt."
      },
      {
        "reviewer": "Gibson",
        "title": "Even the lamps were dust-free",
        "positive": "Clean right down to the bedside lamps, where I usually find dust, and the bathroom floor was spotless too.",
        "negative": "",
        "body": "Clean right down to the bedside lamps, where I usually find dust, and the bathroom floor was spotless too."
      },
      {
        "reviewer": "Deepak",
        "title": "A comfortable and pleasant place to stay",
        "positive": "A now dish i had tried continental breakfast where toast and yogurt combination by fabulous.",
        "negative": "",
        "body": "A now dish i had tried continental breakfast where toast and yogurt combination by fabulous."
      },
      {
        "reviewer": "Welsh",
        "title": "Couldn’t get the bike resistance to work",
        "positive": "",
        "negative": "Turning up the resistance made almost no difference on the exercise bike. It wasn’t much use for the workout I’d intended.",
        "body": "Turning up the resistance made almost no difference on the exercise bike. It wasn’t much use for the workout I’d intended."
      },
      {
        "reviewer": "Stefano",
        "title": "The duvet was heavier than I’d like",
        "positive": "Loved the cushioned mattress.",
        "negative": "Found the duvet uncomfortably heavy, so the bed setup wasn’t entirely for me.",
        "body": "Loved the cushioned mattress.\nFound the duvet uncomfortably heavy, so the bed setup wasn’t entirely for me."
      },
      {
        "reviewer": "Dngerousbeauty",
        "title": "Tough bread and tired pastries",
        "positive": "",
        "negative": "Nothing I sampled at breakfast tasted particularly fresh. The bread was tough, and the pastries had that day-old texture.",
        "body": "Nothing I sampled at breakfast tasted particularly fresh. The bread was tough, and the pastries had that day-old texture."
      },
      {
        "reviewer": "Naishad",
        "title": "Clean drawers ready for unpacking",
        "positive": "Unpacking felt easy because the drawers and shelves were already clean. No crumbs, hair or dust left over from whoever had the room before me.",
        "negative": "",
        "body": "Unpacking felt easy because the drawers and shelves were already clean. No crumbs, hair or dust left over from whoever had the room before me."
      },
      {
        "reviewer": "Kendrick",
        "title": "Too far to come back between outings",
        "positive": "",
        "negative": "Most places I’d planned to visit were farther away than I’d realized. Getting back between outings took enough time that I usually stayed out instead.",
        "body": "Most places I’d planned to visit were farther away than I’d realized. Getting back between outings took enough time that I usually stayed out instead."
      },
      {
        "reviewer": "Daisy",
        "title": "More choice than I expected in the gym",
        "positive": "I could switch between a couple of cardio machines and then do some strength work. It was a useful selection for a hotel workout.",
        "negative": "",
        "body": "I could switch between a couple of cardio machines and then do some strength work. It was a useful selection for a hotel workout."
      },
      {
        "reviewer": "Margaret",
        "title": "A favorite place to stay when visiting Chicago",
        "positive": "Always best service provided.",
        "negative": "",
        "body": "Always best service provided."
      },
      {
        "reviewer": "Sav",
        "title": "The bike held up for a longer session",
        "positive": "Spent a while on the exercise bike and found it worked well throughout. The resistance settings gave me a useful range to work through.",
        "negative": "",
        "body": "Spent a while on the exercise bike and found it worked well throughout. The resistance settings gave me a useful range to work through."
      },
      {
        "reviewer": "Tori",
        "title": "Fresh fruit and a lovely crusty loaf",
        "positive": "The breakfast fruit tasted freshly cut and the bread had a nice crust. I enjoyed what I ate enough to come back the next morning.",
        "negative": "",
        "body": "The breakfast fruit tasted freshly cut and the bread had a nice crust. I enjoyed what I ate enough to come back the next morning."
      },
      {
        "reviewer": "Quiyanna",
        "title": "Very Good",
        "positive": "The staff was amazing..",
        "negative": "",
        "body": "The staff was amazing.."
      },
      {
        "reviewer": "Jada",
        "title": "Nothing missed in the bathroom",
        "positive": "Gleaming taps, a spotless mirror and no overlooked grime in the bathroom, even after a closer look.",
        "negative": "",
        "body": "Gleaming taps, a spotless mirror and no overlooked grime in the bathroom, even after a closer look."
      },
      {
        "reviewer": "Chadwick",
        "title": "Wi-Fi call was clear throughout",
        "positive": "Had a clear voice call using Wi-Fi, with none of the awkward silences when the connection drops. It worked well for the whole conversation.",
        "negative": "",
        "body": "Had a clear voice call using Wi-Fi, with none of the awkward silences when the connection drops. It worked well for the whole conversation."
      },
      {
        "reviewer": "Cifuentes",
        "title": "Liked the range of free weights",
        "positive": "There were enough different dumbbells to make a strength workout worthwhile. I could move up gradually instead of making a big jump between weights.",
        "negative": "",
        "body": "There were enough different dumbbells to make a strength workout worthwhile. I could move up gradually instead of making a big jump between weights."
      },
      {
        "reviewer": "Francisca",
        "title": "Hallway chatter wasn’t a problem",
        "positive": "Hallway chatter barely reached me at bedtime, even though I’m usually very aware of it.",
        "negative": "",
        "body": "Hallway chatter barely reached me at bedtime, even though I’m usually very aware of it."
      },
      {
        "reviewer": "Glenn",
        "title": "The perfect base when you visit Chicago.",
        "positive": "It’s an experience. A sophisticated hotel for sophisticated people. Location is perfect, surrounding neighbourhood has a great range of food, shops and access to the entire city.",
        "negative": "",
        "body": "It’s an experience. A sophisticated hotel for sophisticated people. Location is perfect, surrounding neighbourhood has a great range of food, shops and access to the entire city."
      },
      {
        "reviewer": "Julianeal21",
        "title": "A pillow that didn’t collapse",
        "positive": "The pillow didn’t collapse when I rolled onto my side, which I loved. I could settle into a comfortable position without constantly adjusting it.",
        "negative": "",
        "body": "The pillow didn’t collapse when I rolled onto my side, which I loved. I could settle into a comfortable position without constantly adjusting it."
      },
      {
        "reviewer": "Bryan",
        "title": "Hotel Wi-Fi handled the lot",
        "positive": "No need for a hotspot here; the hotel network handled everything I tried. Even sending a batch of large photos was straightforward.",
        "negative": "",
        "body": "No need for a hotspot here; the hotel network handled everything I tried. Even sending a batch of large photos was straightforward."
      },
      {
        "reviewer": "Diane",
        "title": "The shower needed a closer clean",
        "positive": "Sink and toilet were very clean.",
        "negative": "The shower edges needed attention, so the bathroom cleaning was a little uneven.",
        "body": "Sink and toilet were very clean.\nThe shower edges needed attention, so the bathroom cleaning was a little uneven."
      },
      {
        "reviewer": "Henry",
        "title": "Lovely and quiet with the TV off",
        "positive": "With the television off, the room was still remarkably quiet. I didn’t need background sound to cover up anything from outside.",
        "negative": "",
        "body": "With the television off, the room was still remarkably quiet. I didn’t need background sound to cover up anything from outside."
      },
      {
        "reviewer": "Holly",
        "title": "Exceptional",
        "positive": "The staff were great, friendly and helpful. We had a lovely welcome letter and champagne in the room As we had just been married",
        "negative": "Nothing everything was great!",
        "body": "The staff were great, friendly and helpful. We had a lovely welcome letter and champagne in the room As we had just been married\nNothing everything was great!"
      },
      {
        "reviewer": "Mohammad",
        "title": "Not enough space for floor work",
        "positive": "",
        "negative": "Once I put a mat down, there was barely room to move between it and the machines. The gym layout made stretching and bodyweight exercises awkward.",
        "body": "Once I put a mat down, there was barely room to move between it and the machines. The gym layout made stretching and bodyweight exercises awkward."
      },
      {
        "reviewer": "Konstantinos",
        "title": "Weekend Trip to the City",
        "positive": "Great aesthetic, spacious room, luxurious amenities!",
        "negative": "Everything was great!",
        "body": "Great aesthetic, spacious room, luxurious amenities!\nEverything was great!"
      },
      {
        "reviewer": "Stephen",
        "title": "More buffering than watching",
        "positive": "",
        "negative": "Tried to stream something before bed and spent more time watching it buffer than play. The Wi-Fi connection kept failing, so I stopped trying.",
        "body": "Tried to stream something before bed and spent more time watching it buffer than play. The Wi-Fi connection kept failing, so I stopped trying."
      },
      {
        "reviewer": "Marco",
        "title": "Exceptional",
        "positive": "I love this luxury hotel. The style, the people, it just felt all great!",
        "negative": "",
        "body": "I love this luxury hotel. The style, the people, it just felt all great!"
      },
      {
        "reviewer": "Caitlin",
        "title": "Coming back for a break meant a detour",
        "positive": "",
        "negative": "Popping back for a break would have meant a long detour from the places I wanted to see.",
        "body": "Popping back for a break would have meant a long detour from the places I wanted to see."
      },
      {
        "reviewer": "Misty",
        "title": "Could fit in cardio and some lifting",
        "positive": "The gym setup let me do a bit of both without leaving out exercises for lack of equipment. That was all I needed during the trip.",
        "negative": "",
        "body": "The gym setup let me do a bit of both without leaving out exercises for lack of equipment. That was all I needed during the trip."
      },
      {
        "reviewer": "Kristi",
        "title": "Sheets and towels passed inspection",
        "positive": "I always check the sheets before getting into a hotel bed, and these were spotless. The towels were equally fresh, with no marks or odd smells.",
        "negative": "",
        "body": "I always check the sheets before getting into a hotel bed, and these were spotless. The towels were equally fresh, with no marks or odd smells."
      },
      {
        "reviewer": "Brodey",
        "title": "Most stylish hotel I’ve ever stayed with a wonderful and professional service staff. Bravo all around.",
        "positive": "Design elements were incredible!",
        "negative": "I have no complaints about it.",
        "body": "Design elements were incredible!\nI have no complaints about it."
      },
      {
        "reviewer": "Sara",
        "title": "Had to send photos over mobile data",
        "positive": "",
        "negative": "Couldn’t send a few photos without the hotel network disconnecting, so I gave up and used mobile data.",
        "body": "Couldn’t send a few photos without the hotel network disconnecting, so I gave up and used mobile data."
      },
      {
        "reviewer": "Kimberly",
        "title": "Hot breakfast varied from day to day",
        "positive": "The hot breakfast was tasty one morning.",
        "negative": "Only lukewarm the next. Some good food, but the quality varied during my stay.",
        "body": "The hot breakfast was tasty one morning.\nOnly lukewarm the next. Some good food, but the quality varied during my stay."
      },
      {
        "reviewer": "Martha",
        "title": "Exceptional",
        "positive": "Location and restaurants, rooms comfortable",
        "negative": "",
        "body": "Location and restaurants, rooms comfortable"
      },
      {
        "reviewer": "Continue readingMegan",
        "title": "A workable space for floor exercises",
        "positive": "There was enough usable space beside the equipment for a mat and a few stretches. I could finish my routine there without squeezing into a corner.",
        "negative": "",
        "body": "There was enough usable space beside the equipment for a mat and a few stretches. I could finish my routine there without squeezing into a corner."
      },
      {
        "reviewer": "Tiia",
        "title": "Street activity stayed outside",
        "positive": "The street was active outside, but very little sound made it through the closed window. Inside, I could relax without traffic intruding.",
        "negative": "",
        "body": "The street was active outside, but very little sound made it through the closed window. Inside, I could relax without traffic intruding."
      },
      {
        "reviewer": "Mike",
        "title": "Simply amazing",
        "positive": "Everything",
        "negative": "N/A",
        "body": "Everything\nN/A"
      },
      {
        "reviewer": "Steven",
        "title": "Messages went through straight away",
        "positive": "Messages sent straight away on the room internet instead of sitting there waiting for a connection.",
        "negative": "",
        "body": "Messages sent straight away on the room internet instead of sitting there waiting for a connection."
      },
      {
        "reviewer": "Vivian",
        "title": "Comfortable from the first night",
        "positive": "The mattress had a gentle give that felt comfortable immediately and stayed that way every night.",
        "negative": "",
        "body": "The mattress had a gentle give that felt comfortable immediately and stayed that way every night."
      },
      {
        "reviewer": "Donald",
        "title": "Nice facility,\"\"\"",
        "positive": "Great location, clean, nice staff.",
        "negative": "",
        "body": "Great location, clean, nice staff."
      },
      {
        "reviewer": "Lena",
        "title": "Clear picture on a long family call",
        "positive": "A video chat with family went on much longer than intended, and the picture stayed clear throughout. The internet didn’t let me down.",
        "negative": "",
        "body": "A video chat with family went on much longer than intended, and the picture stayed clear throughout. The internet didn’t let me down."
      },
      {
        "reviewer": "Ambar",
        "title": "Good choices for a light or hot breakfast",
        "positive": "Really liked being able to choose between a light breakfast and a proper hot meal, with enough variety to keep both interesting.",
        "negative": "",
        "body": "Really liked being able to choose between a light breakfast and a proper hot meal, with enough variety to keep both interesting."
      },
      {
        "reviewer": "Nikhil",
        "title": "Love the space, bathrooms are great, and location is perfect",
        "positive": "Very clean and design forward rooms.",
        "negative": "Rooms could have a little more lighting options to help in evenings if working! But it’s ok",
        "body": "Very clean and design forward rooms.\nRooms could have a little more lighting options to help in evenings if working! But it’s ok"
      },
      {
        "reviewer": "Patricia",
        "title": "We will be back",
        "positive": "Food was delicious",
        "negative": "",
        "body": "Food was delicious"
      },
      {
        "reviewer": "B",
        "title": "A relief for someone who wakes easily",
        "positive": "As someone who usually wakes at every door closing, I was grateful for how little corridor noise reached my room.",
        "negative": "",
        "body": "As someone who usually wakes at every door closing, I was grateful for how little corridor noise reached my room."
      },
      {
        "reviewer": "Trussoni",
        "title": "Very easy to settle into bed",
        "positive": "Plump pillows and a well-cushioned mattress made reading in bed wonderfully comfortable.",
        "negative": "",
        "body": "Plump pillows and a well-cushioned mattress made reading in bed wonderfully comfortable."
      },
      {
        "reviewer": "Lee",
        "title": "Warm welcome, disappointing follow-through",
        "positive": "Reception was warm and attentive at arrival.",
        "negative": "Later I struggled to get anyone to follow up on a request. The service depended on the moment.",
        "body": "Reception was warm and attentive at arrival.\nLater I struggled to get anyone to follow up on a request. The service depended on the moment."
      },
      {
        "reviewer": "Jonathan",
        "title": "Proper foot massage with a view n dat",
        "positive": "One of the best breakfast I have ever had.",
        "negative": "Have more wine and food in the room",
        "body": "One of the best breakfast I have ever had.\nHave more wine and food in the room"
      },
      {
        "reviewer": "Madison",
        "title": "Fewer easy walks than I’d expected",
        "positive": "",
        "negative": "I underestimated how much travelling I’d be doing from here each morning. Very few of my planned stops were an easy walk away.",
        "body": "I underestimated how much travelling I’d be doing from here each morning. Very few of my planned stops were an easy walk away."
      },
      {
        "reviewer": "Vigil",
        "title": "Calm evenings without sudden bangs",
        "positive": "My evenings here were calm, with no sudden bangs interrupting them. Whatever noise there was elsewhere in the building didn’t carry into the room.",
        "negative": "",
        "body": "My evenings here were calm, with no sudden bangs interrupting them. Whatever noise there was elsewhere in the building didn’t carry into the room."
      },
      {
        "reviewer": "Nicole",
        "title": "Barely warm and short on flavor",
        "positive": "",
        "negative": "I was hungry enough to finish breakfast, but I can’t say I enjoyed it. The hot food was barely warm and lacked much flavor.",
        "body": "I was hungry enough to finish breakfast, but I can’t say I enjoyed it. The hot food was barely warm and lacked much flavor."
      },
      {
        "reviewer": "Janet",
        "title": "Enough equipment for my routine",
        "positive": "I found the weights and cardio machines I needed and got through my usual workout. The gym did the job well for me.",
        "negative": "",
        "body": "I found the weights and cardio machines I needed and got through my usual workout. The gym did the job well for me."
      },
      {
        "reviewer": "Thomas",
        "title": "Couldn’t hear the neighboring rooms",
        "positive": "Even late in the evening, I couldn’t hear televisions or conversations from the rooms beside mine. It felt pleasantly calm once I settled in.",
        "negative": "",
        "body": "Even late in the evening, I couldn’t hear televisions or conversations from the rooms beside mine. It felt pleasantly calm once I settled in."
      },
      {
        "reviewer": "Lorrie",
        "title": "An awkward base for my route",
        "positive": "",
        "negative": "For the route I’d put together, this turned out to be an awkward base. Even short visits elsewhere needed more travel time than I had allowed.",
        "body": "For the route I’d put together, this turned out to be an awkward base. Even short visits elsewhere needed more travel time than I had allowed."
      },
      {
        "reviewer": "Heather",
        "title": "Exceptional",
        "positive": "Great view of the Chicago skyline. Comfortable bed and amazing bathroom.",
        "negative": "",
        "body": "Great view of the Chicago skyline. Comfortable bed and amazing bathroom."
      },
      {
        "reviewer": "Becky",
        "title": "A steady treadmill for my morning run",
        "positive": "The treadmill ran evenly, and the speed controls responded properly throughout. I had no trouble doing the session I wanted.",
        "negative": "",
        "body": "The treadmill ran evenly, and the speed controls responded properly throughout. I had no trouble doing the session I wanted."
      },
      {
        "reviewer": "Noah",
        "title": "Exceptional",
        "positive": "The location was perfect in the west loop of Chicago, surrounded by endless restaurants and bars.",
        "negative": "",
        "body": "The location was perfect in the west loop of Chicago, surrounded by endless restaurants and bars."
      },
      {
        "reviewer": "Christine",
        "title": "Hair left in the shower",
        "positive": "",
        "negative": "A few hairs left in the shower before I’d even used it really put me off.",
        "body": "A few hairs left in the shower before I’d even used it really put me off."
      },
      {
        "reviewer": "Alexander",
        "title": "Finally, a pillow I didn’t have to fold",
        "positive": "Finally found a hotel pillow that didn’t need folding in half. It held my neck at a comfortable angle right through the night.",
        "negative": "",
        "body": "Finally found a hotel pillow that didn’t need folding in half. It held my neck at a comfortable angle right through the night."
      },
      {
        "reviewer": "Willliam",
        "title": "Left most of the underripe fruit",
        "positive": "",
        "negative": "The breakfast fruit looked promising but tasted watery and underripe, so I left most of it.",
        "body": "The breakfast fruit looked promising but tasted watery and underripe, so I left most of it."
      },
      {
        "reviewer": "Erin",
        "title": "Not every call went as smoothly",
        "positive": "One video call was flawless, and basic browsing generally worked.",
        "negative": "Another call kept freezing on the same device. The Wi-Fi had its off moments.",
        "body": "One video call was flawless, and basic browsing generally worked.\nAnother call kept freezing on the same device. The Wi-Fi had its off moments."
      },
      {
        "reviewer": "Yong",
        "title": "Didn’t even open the earplug packet",
        "positive": "Brought earplugs as usual and didn’t even open the packet; the room was that quiet.",
        "negative": "",
        "body": "Brought earplugs as usual and didn’t even open the packet; the room was that quiet."
      },
      {
        "reviewer": "Apollonia",
        "title": "We loved our stay!",
        "positive": "Its stunning inside rooms very spacious staff lovely.",
        "negative": "Nothing",
        "body": "Its stunning inside rooms very spacious staff lovely.\nNothing"
      },
      {
        "reviewer": "Evan",
        "title": "Treadmill was good, weights less useful",
        "positive": "Had a good run on a treadmill that worked smoothly.",
        "negative": "There weren’t enough heavier dumbbells for the lifting I wanted to do afterwards.",
        "body": "Had a good run on a treadmill that worked smoothly.\nThere weren’t enough heavier dumbbells for the lifting I wanted to do afterwards."
      },
      {
        "reviewer": "Mohamed",
        "title": "Enjoyed the scrambled eggs especially",
        "positive": "The morning meal was more enjoyable than I’d expected, particularly the soft scrambled eggs. I finished the plate instead of picking around the edges.",
        "negative": "",
        "body": "The morning meal was more enjoyable than I’d expected, particularly the soft scrambled eggs. I finished the plate instead of picking around the edges."
      },
      {
        "reviewer": "Sandra",
        "title": "Not well placed for my plans",
        "positive": "",
        "negative": "The places I wanted to explore were spread a long way from the hotel. For this trip, the location made getting around more of an effort than I’d hoped.",
        "body": "The places I wanted to explore were spread a long way from the hotel. For this trip, the location made getting around more of an effort than I’d hoped."
      },
      {
        "reviewer": "Ashley",
        "title": "A nice way to bring in the new year!",
        "positive": "The manager was kind and accommodating",
        "negative": "Tv was broke in my first room. In the second room the bench was dirty. Just doesn’t seem like they are keeping up the property for the cost per night.",
        "body": "The manager was kind and accommodating\nTv was broke in my first room. In the second room the bench was dirty. Just doesn’t seem like they are keeping up the property for the cost per night."
      },
      {
        "reviewer": "Marcus",
        "title": "Better Wi-Fi during the day",
        "positive": "Browsing was quick during the day.",
        "negative": "The connection became patchy in the evening. I wouldn’t describe it as either consistently good or consistently bad.",
        "body": "Browsing was quick during the day.\nThe connection became patchy in the evening. I wouldn’t describe it as either consistently good or consistently bad."
      },
      {
        "reviewer": "Aimee",
        "title": "Not a peep through the wall",
        "positive": "Didn’t hear a peep from next door. Lovely to have quiet evenings without someone else’s television in the background.",
        "negative": "",
        "body": "Didn’t hear a peep from next door. Lovely to have quiet evenings without someone else’s television in the background."
      },
      {
        "reviewer": "Heath",
        "title": "Already planning the next morning’s breakfast",
        "positive": "Enjoyed the hot breakfast so much on the first day that I was already thinking about what to try the next morning.",
        "negative": "",
        "body": "Enjoyed the hot breakfast so much on the first day that I was already thinking about what to try the next morning."
      },
      {
        "reviewer": "Pamela",
        "title": "No adjustment needed for this mattress",
        "positive": "Normally I need a night to adjust to hotel beds, but this one felt comfortable straight away.",
        "negative": "",
        "body": "Normally I need a night to adjust to hotel beds, but this one felt comfortable straight away."
      },
      {
        "reviewer": "Lisa",
        "title": "Lovely",
        "positive": "Loved the staff here! So friendly and willing to go above and beyond. Location is perfect. Room is spacious and clean. Would definitely stay again.",
        "negative": "Traffic noise outside, but it’s Chicago. Nothing you can really do about that.",
        "body": "Loved the staff here! So friendly and willing to go above and beyond. Location is perfect. Room is spacious and clean. Would definitely stay again.\nTraffic noise outside, but it’s Chicago. Nothing you can really do about that."
      },
      {
        "reviewer": "Kevin",
        "title": "Fruit was good, bread was dry",
        "positive": "Fresh, tasty fruit at breakfast.",
        "negative": "Rather dry bread; some parts of the meal were much better than others.",
        "body": "Fresh, tasty fruit at breakfast.\nRather dry bread; some parts of the meal were much better than others."
      },
      {
        "reviewer": "Emma",
        "title": "Browsing and uploads both worked well",
        "positive": "Whether I was browsing or uploading pictures, everything went smoothly over the room Wi-Fi.",
        "negative": "",
        "body": "Whether I was browsing or uploading pictures, everything went smoothly over the room Wi-Fi."
      },
      {
        "reviewer": "Karin",
        "title": "I will continue to seek out Nobu hotels in my future travel. Five stars isn’t enough.",
        "positive": "The food and cocktails at the Nobu restaurant and rooftop was exceptional.",
        "negative": "Everything smacked of perfection.",
        "body": "The food and cocktails at the Nobu restaurant and rooftop was exceptional.\nEverything smacked of perfection."
      },
      {
        "reviewer": "Katrina",
        "title": "Weight selection needed filling out",
        "positive": "",
        "negative": "There were big gaps between the available dumbbell sizes. I couldn’t find a sensible weight for several of my usual exercises.",
        "body": "There were big gaps between the available dumbbell sizes. I couldn’t find a sensible weight for several of my usual exercises."
      },
      {
        "reviewer": "Terrence",
        "title": "Wonderful",
        "positive": "Great location",
        "negative": "",
        "body": "Great location"
      },
      {
        "reviewer": "Luann",
        "title": "A long download with no interruptions",
        "positive": "My tablet finished a long download without the Wi-Fi cutting out once.",
        "negative": "",
        "body": "My tablet finished a long download without the Wi-Fi cutting out once."
      },
      {
        "reviewer": "Kristina",
        "title": "Rubbery eggs put me off",
        "positive": "",
        "negative": "Rubbery eggs and dry toast put me right off breakfast.",
        "body": "Rubbery eggs and dry toast put me right off breakfast."
      },
      {
        "reviewer": "Brystal",
        "title": "Exceptional",
        "positive": "Loved the design and aesthetic. Gorgeous room, great spa facilities, and amazing on site restaurant.",
        "negative": "Cancellation policy was a bit outrageous. Limited to no support from staff which was surprising.",
        "body": "Loved the design and aesthetic. Gorgeous room, great spa facilities, and amazing on site restaurant.\nCancellation policy was a bit outrageous. Limited to no support from staff which was surprising."
      },
      {
        "reviewer": "Darnell",
        "title": "This network got along with my phone",
        "positive": "My phone has been awkward with hotel networks before, but this one worked first time. The connection remained reliable whenever I picked it up again.",
        "negative": "",
        "body": "My phone has been awkward with hotel networks before, but this one worked first time. The connection remained reliable whenever I picked it up again."
      },
      {
        "reviewer": "Shauneen",
        "title": "Lovely modern industrial style hotel I would recommend",
        "positive": "The design was beautiful",
        "negative": "Some areas not so clean",
        "body": "The design was beautiful\nSome areas not so clean"
      },
      {
        "reviewer": "Van",
        "title": "Helpful one moment, abrupt the next",
        "positive": "Had a lovely interaction with one staff member who took time to help.",
        "negative": "Another was quite abrupt with a simple question, so my overall impression was mixed.",
        "body": "Had a lovely interaction with one staff member who took time to help.\nAnother was quite abrupt with a simple question, so my overall impression was mixed."
      },
      {
        "reviewer": "Willow",
        "title": "Three quiet nights",
        "positive": "All three nights were quiet, without the doors slamming and voices through walls I’ve had elsewhere.",
        "negative": "",
        "body": "All three nights were quiet, without the doors slamming and voices through walls I’ve had elsewhere."
      },
      {
        "reviewer": "Braun",
        "title": "The right sort of firmness",
        "positive": "Firm enough to support my back without feeling hard, which is exactly how I like a mattress.",
        "negative": "",
        "body": "Firm enough to support my back without feeling hard, which is exactly how I like a mattress."
      },
      {
        "reviewer": "Sheila",
        "title": "Walkable for some stops, a trek for others",
        "positive": "Some stops were easy to walk to.",
        "negative": "Others took ages to reach, so the location was a mixed blessing for my itinerary.",
        "body": "Some stops were easy to walk to.\nOthers took ages to reach, so the location was a mixed blessing for my itinerary."
      },
      {
        "reviewer": "Laura",
        "title": "The weights area worked for me",
        "positive": "Used the bench and dumbbells on two visits. Both times I had what I needed for a proper set of exercises.",
        "negative": "",
        "body": "Used the bench and dumbbells on two visits. Both times I had what I needed for a proper set of exercises."
      },
      {
        "reviewer": "Noura",
        "title": "A great experience and will come here again soon",
        "positive": "Everything specially the staff",
        "negative": "Nothing.",
        "body": "Everything specially the staff\nNothing."
      },
      {
        "reviewer": "Dawn",
        "title": "That pastry was worth another visit",
        "positive": "That flaky breakfast pastry was worth going back for: lots of flavor and none of the usual dryness.",
        "negative": "",
        "body": "That flaky breakfast pastry was worth going back for: lots of flavor and none of the usual dryness."
      },
      {
        "reviewer": "Maria",
        "title": "Loved the feel of the sheets",
        "positive": "The sheets felt lovely against my skin, with none of that scratchy stiffness. Combined with the mattress, they made the bed really comfortable.",
        "negative": "",
        "body": "The sheets felt lovely against my skin, with none of that scratchy stiffness. Combined with the mattress, they made the bed really comfortable."
      },
      {
        "reviewer": "Caouette",
        "title": "Decent selection, one machine unusable",
        "positive": "The fitness room offered a reasonable mix of cardio equipment and weights.",
        "negative": "The bike I wanted to use wasn’t working, so part of that choice was only on paper.",
        "body": "The fitness room offered a reasonable mix of cardio equipment and weights.\nThe bike I wanted to use wasn’t working, so part of that choice was only on paper."
      },
      {
        "reviewer": "Kelly",
        "title": "A whole film without the loading circle",
        "positive": "Streamed a full film in the room without seeing the loading circle once!",
        "negative": "",
        "body": "Streamed a full film in the room without seeing the loading circle once!"
      },
      {
        "reviewer": "Ellen",
        "title": "Amazing hotel!! Best in west loop!! Will be back!",
        "positive": "Love it",
        "negative": "",
        "body": "Love it"
      },
      {
        "reviewer": "Vick",
        "title": "Hard to leave that duvet behind",
        "positive": "Could easily have spent another hour under that soft duvet each morning; the whole bed felt wonderfully comfortable.",
        "negative": "",
        "body": "Could easily have spent another hour under that soft duvet each morning; the whole bed felt wonderfully comfortable."
      },
      {
        "reviewer": "Mazen",
        "title": "Hassan from the front desk and his staff were fast and of great help to sort out my booking issue",
        "positive": "Clean, quiet, super friendly staff, great location for my work.",
        "negative": "Concrete ceilings for the room was different, but I get it’s part of the design.",
        "body": "Clean, quiet, super friendly staff, great location for my work.\nConcrete ceilings for the room was different, but I get it’s part of the design."
      },
      {
        "reviewer": "Helen",
        "title": "The bench wouldn’t stay adjusted",
        "positive": "",
        "negative": "The adjustable bench kept slipping back from the position I set. I stopped using it because I couldn’t rely on it staying in place.",
        "body": "The adjustable bench kept slipping back from the position I set. I stopped using it because I couldn’t rely on it staying in place."
      },
      {
        "reviewer": "Suzanne",
        "title": "Surprisingly little traffic noise",
        "positive": "A city hotel can be loud, so I was pleased by how subdued everything sounded from my room. Traffic never rose above a faint background murmur.",
        "negative": "",
        "body": "A city hotel can be loud, so I was pleased by how subdued everything sounded from my room. Traffic never rose above a faint background murmur."
      },
      {
        "reviewer": "Brooke",
        "title": "Clean, comfortable, chic & great staff!",
        "positive": "Staff was so great & friendly! Luxe and comfortable hotel. Would definitely come back :)",
        "negative": "N/A",
        "body": "Staff was so great & friendly! Luxe and comfortable hotel. Would definitely come back :)\nN/A"
      },
      {
        "reviewer": "Kristin",
        "title": "Steady internet whenever I tried it",
        "positive": "Used the Wi-Fi at different times of day and got the same steady connection. I could browse without wondering whether the next page would load.",
        "negative": "",
        "body": "Used the Wi-Fi at different times of day and got the same steady connection. I could browse without wondering whether the next page would load."
      },
      {
        "reviewer": "Rafe",
        "title": "Breakfast choices soon became repetitive",
        "positive": "",
        "negative": "Breakfast choices felt repetitive by the second morning. I struggled to put together a plate I really wanted, and what I did try was bland.",
        "body": "Breakfast choices felt repetitive by the second morning. I struggled to put together a plate I really wanted, and what I did try was bland."
      }
    ],
    "arlo-chicago": [
      {
        "reviewer": "Mathew",
        "title": "Stayed on that bed longer than planned",
        "positive": "I planned on resting for a few minutes and ended up staying on the bed much longer. It was comfortably cushioned without swallowing me up.",
        "negative": "",
        "body": "I planned on resting for a few minutes and ended up staying on the bed much longer. It was comfortably cushioned without swallowing me up."
      },
      {
        "reviewer": "Nita",
        "title": "Reliable on the laptop as well as the phone",
        "positive": "Even when I switched from my phone to my laptop, the network worked without a fuss. Both devices had a dependable connection.",
        "negative": "",
        "body": "Even when I switched from my phone to my laptop, the network worked without a fuss. Both devices had a dependable connection."
      },
      {
        "reviewer": "Kelly",
        "title": "Great for Chicago newbies",
        "positive": "A beautiful cute hotel! Staff made this such a great stay!",
        "negative": "I can’t think of a single thing I disliked.",
        "body": "A beautiful cute hotel! Staff made this such a great stay!\nI can’t think of a single thing I disliked."
      },
      {
        "reviewer": "Sandrine",
        "title": "Could make the bike session as hard as I wanted",
        "positive": "The resistance settings gave me a proper range, and the bike kept working smoothly as I changed them. Enjoyed using it.",
        "negative": "",
        "body": "The resistance settings gave me a proper range, and the bike kept working smoothly as I changed them. Enjoyed using it."
      },
      {
        "reviewer": "Dvorak",
        "title": "Street sounds were barely audible",
        "positive": "I usually notice traffic as soon as I switch off the television. Here, the sound from the street was barely audible even then.",
        "negative": "",
        "body": "I usually notice traffic as soon as I switch off the television. Here, the sound from the street was barely audible even then."
      },
      {
        "reviewer": "Bindi",
        "title": "A gym I could do a full session in",
        "positive": "Cardio machines, a useful spread of weights and a bench covered the routine I’d brought with me. I didn’t have to skip anything for lack of equipment.",
        "negative": "",
        "body": "Cardio machines, a useful spread of weights and a bench covered the routine I’d brought with me. I didn’t have to skip anything for lack of equipment."
      },
      {
        "reviewer": "Francisco",
        "title": "Great",
        "positive": "Friendly staff , big rooms and nice ambience",
        "negative": "The check out time is too soon and the check in too late",
        "body": "Friendly staff , big rooms and nice ambience\nThe check out time is too soon and the check in too late"
      },
      {
        "reviewer": "Robin",
        "title": "Conversations outside came straight through",
        "positive": "",
        "negative": "Voices carried straight in from the corridor, even with the door firmly closed. It was especially annoying when a group stopped outside to chat.",
        "body": "Voices carried straight in from the corridor, even with the door firmly closed. It was especially annoying when a group stopped outside to chat."
      },
      {
        "reviewer": "Denise",
        "title": "My hotspot got a rest",
        "positive": "Never reached for my mobile hotspot during this stay. The Wi-Fi was reliable enough for every call, message and bit of browsing I did.",
        "negative": "",
        "body": "Never reached for my mobile hotspot during this stay. The Wi-Fi was reliable enough for every call, message and bit of browsing I did."
      },
      {
        "reviewer": "Pat",
        "title": "Fresh bread made a simple meal better",
        "positive": "Fresh bread made my simple breakfast much better than expected. Toasted or as it came, it tasted good on each morning I tried it.",
        "negative": "",
        "body": "Fresh bread made my simple breakfast much better than expected. Toasted or as it came, it tasted good on each morning I tried it."
      },
      {
        "reviewer": "Mustafa",
        "title": "A good choice at a perfect location",
        "positive": "I was informed during check-in that my room type had be changed due to a prior damage. It was handled professionally.",
        "negative": "",
        "body": "I was informed during check-in that my room type had be changed due to a prior damage. It was handled professionally."
      },
      {
        "reviewer": "Mcbarry",
        "title": "Wouldn’t look forward to that breakfast again",
        "positive": "",
        "negative": "Disappointing fruit and stale-tasting pastries put me off the morning meal. Breakfast was the part of the visit I wouldn’t look forward to repeating.",
        "body": "Disappointing fruit and stale-tasting pastries put me off the morning meal. Breakfast was the part of the visit I wouldn’t look forward to repeating."
      },
      {
        "reviewer": "Jaime",
        "title": "Spotless counter for my toiletries",
        "positive": "No need to wipe the bathroom counter before setting out my toiletries; it was already spotless, along with the sink and shower.",
        "negative": "",
        "body": "No need to wipe the bathroom counter before setting out my toiletries; it was already spotless, along with the sink and shower."
      },
      {
        "reviewer": "Zulema",
        "title": "Got my run in without any trouble",
        "positive": "The treadmill kept a steady pace, and the incline settings worked well. I was able to do my usual running session in the fitness room.",
        "negative": "",
        "body": "The treadmill kept a steady pace, and the incline settings worked well. I was able to do my usual running session in the fitness room."
      },
      {
        "reviewer": "Charlotte",
        "title": "Could tell what next door was watching",
        "positive": "",
        "negative": "Could hear the television next door clearly enough to recognize when the program changed. That was distracting when I was trying to wind down.",
        "body": "Could hear the television next door clearly enough to recognize when the program changed. That was distracting when I was trying to wind down."
      },
      {
        "reviewer": "Ingrid",
        "title": "Light duvet and soft sheets",
        "positive": "Soft sheets and a duvet that didn’t weigh me down made it easy to get comfortable.",
        "negative": "",
        "body": "Soft sheets and a duvet that didn’t weigh me down made it easy to get comfortable."
      },
      {
        "reviewer": "Emily",
        "title": "Quiet enough to hear the pages turn",
        "positive": "Quiet enough to hear myself turning the pages of my book, with barely any sound from neighboring rooms.",
        "negative": "",
        "body": "Quiet enough to hear myself turning the pages of my book, with barely any sound from neighboring rooms."
      },
      {
        "reviewer": "Mia",
        "title": "My stay was simply perfect, I will return again.",
        "positive": "Clean Welcoming Great price",
        "negative": "N/a",
        "body": "Clean Welcoming Great price\nN/a"
      },
      {
        "reviewer": "Janice",
        "title": "Wi-Fi I didn’t have to keep checking",
        "positive": "Refreshing to use hotel Wi-Fi without constantly having to check whether the connection has disappeared.",
        "negative": "",
        "body": "Refreshing to use hotel Wi-Fi without constantly having to check whether the connection has disappeared."
      },
      {
        "reviewer": "Bard",
        "title": "Just as good the second morning",
        "positive": "Went back for breakfast after a good first morning and found it just as fresh and flavorful.",
        "negative": "",
        "body": "Went back for breakfast after a good first morning and found it just as fresh and flavorful."
      },
      {
        "reviewer": "Antony",
        "title": "Perfect location, very clean and comfortable",
        "positive": "Comfortable bed and pillows, spotlessly clean, nice modern decor, fantastic location,",
        "negative": "Nothing",
        "body": "Comfortable bed and pillows, spotlessly clean, nice modern decor, fantastic location,\nNothing"
      },
      {
        "reviewer": "Victor",
        "title": "The staff was amazing",
        "positive": "Great atmosphere",
        "negative": "",
        "body": "Great atmosphere"
      },
      {
        "reviewer": "Shani",
        "title": "Good bread let down by rubbery eggs",
        "positive": "Fresh, tasty bread at breakfast.",
        "negative": "Rather rubbery eggs left me with mixed feelings about the meal.",
        "body": "Fresh, tasty bread at breakfast.\nRather rubbery eggs left me with mixed feelings about the meal."
      },
      {
        "reviewer": "Kylie",
        "title": "Had to ask all over again",
        "positive": "",
        "negative": "Nobody followed up after assuring me they would look into my question. I had to explain the whole thing again when I checked back.",
        "body": "Nobody followed up after assuring me they would look into my question. I had to explain the whole thing again when I checked back."
      },
      {
        "reviewer": "Sylvia",
        "title": "Street noise didn’t intrude on the evening",
        "positive": "Once inside for the evening, I could relax without the street sounds intruding.",
        "negative": "",
        "body": "Once inside for the evening, I could relax without the street sounds intruding."
      },
      {
        "reviewer": "Dr",
        "title": "No trouble switching between travel pages",
        "positive": "Planning each day online was painless, with the Wi-Fi staying connected as I switched between maps and booking pages.",
        "negative": "",
        "body": "Planning each day online was painless, with the Wi-Fi staying connected as I switched between maps and booking pages."
      },
      {
        "reviewer": "Leslie",
        "title": "I would stay there again!",
        "positive": "Hotel was clean. Service was amazing.",
        "negative": "I had no complaints",
        "body": "Hotel was clean. Service was amazing.\nI had no complaints"
      },
      {
        "reviewer": "Tajc",
        "title": "Soft pillows with proper support",
        "positive": "Soft pillows that still kept some shape made a big difference for me. My neck felt supported rather than propped up at an odd angle.",
        "negative": "",
        "body": "Soft pillows that still kept some shape made a big difference for me. My neck felt supported rather than propped up at an odd angle."
      },
      {
        "reviewer": "Djunnaymed",
        "title": "Didn’t hear anyone getting back late",
        "positive": "Went to bed before most people seemed to be back, but never heard them arrive. The room kept the hallway noise out well.",
        "negative": "",
        "body": "Went to bed before most people seemed to be back, but never heard them arrive. The room kept the hallway noise out well."
      },
      {
        "reviewer": "Babak",
        "title": "A practical layout for exercising",
        "positive": "I could move between the weights, machines and mat area without constantly shifting things out of the way. The fitness space was easy to use.",
        "negative": "",
        "body": "I could move between the weights, machines and mat area without constantly shifting things out of the way. The fitness space was easy to use."
      },
      {
        "reviewer": "Ann",
        "title": "Exceptional",
        "positive": "Location",
        "negative": "",
        "body": "Location"
      },
      {
        "reviewer": "Kelley",
        "title": "Great location, nice staff.",
        "positive": "Weird coffee maker",
        "negative": "",
        "body": "Weird coffee maker"
      },
      {
        "reviewer": "Friederike",
        "title": "Gym equipment was in good shape",
        "positive": "Everything I used moved smoothly and felt secure, including the bench adjustments. No frustrating maintenance problems during my workouts.",
        "negative": "",
        "body": "Everything I used moved smoothly and felt secure, including the bench adjustments. No frustrating maintenance problems during my workouts."
      },
      {
        "reviewer": "Jeanne",
        "title": "Comfortable mattress let down by rough sheets",
        "positive": "I could relax on the mattress quite happily.",
        "negative": "The sheets felt rougher than I’d like. The bed setup had good and bad points for comfort.",
        "body": "I could relax on the mattress quite happily.\nThe sheets felt rougher than I’d like. The bed setup had good and bad points for comfort."
      },
      {
        "reviewer": "Taylor",
        "title": "Exactly how a room should look on arrival",
        "positive": "Clean floors, no bits in the corners and nothing left behind by the previous guest. Exactly how a room should be on arrival.",
        "negative": "",
        "body": "Clean floors, no bits in the corners and nothing left behind by the previous guest. Exactly how a room should be on arrival."
      },
      {
        "reviewer": "Xochitl",
        "title": "Location location location",
        "positive": "Location",
        "negative": "The scent they have in the lobby is overwhelming",
        "body": "Location\nThe scent they have in the lobby is overwhelming"
      },
      {
        "reviewer": "Ugo",
        "title": "Online reservations went through first time",
        "positive": "Reservations went through online first time, and confirmation pages loaded straight away. I never worried that the connection had dropped in the middle of a booking.",
        "negative": "",
        "body": "Reservations went through online first time, and confirmation pages loaded straight away. I never worried that the connection had dropped in the middle of a booking."
      },
      {
        "reviewer": "Nikhil",
        "title": "My shoulder didn’t like this mattress",
        "positive": "",
        "negative": "Much too firm a mattress for a side sleeper like me; my shoulder was sore in the morning.",
        "body": "Much too firm a mattress for a side sleeper like me; my shoulder was sore in the morning."
      },
      {
        "reviewer": "Leandro",
        "title": "Late-night horns were hard to tune out",
        "positive": "",
        "negative": "Traffic noise kept cutting through late at night, with horns much louder than I’d expected. I had trouble tuning it out.",
        "body": "Traffic noise kept cutting through late at night, with horns much louder than I’d expected. I had trouble tuning it out."
      },
      {
        "reviewer": "Aubrey",
        "title": "Easy to vary workouts over the stay",
        "positive": "Used the bike one day and a treadmill the next, then added some lifting. The available equipment made both visits worthwhile.",
        "negative": "",
        "body": "Used the bike one day and a treadmill the next, then added some lifting. The available equipment made both visits worthwhile."
      },
      {
        "reviewer": "Ela",
        "title": "Reliable one evening, patchy the next",
        "positive": "The Wi-Fi was dependable on my first evening.",
        "negative": "It dropped several times the next night. There were useful stretches, but I couldn’t always count on it.",
        "body": "The Wi-Fi was dependable on my first evening.\nIt dropped several times the next night. There were useful stretches, but I couldn’t always count on it."
      },
      {
        "reviewer": "John",
        "title": "Solid choice for a few nights in the city",
        "positive": "Great location and facilities.",
        "negative": "Key cards were very sensitive and would de-activate",
        "body": "Great location and facilities.\nKey cards were very sensitive and would de-activate"
      },
      {
        "reviewer": "Vernon",
        "title": "More than one good breakfast option",
        "positive": "Enough breakfast variety to avoid having the same plate every morning. I found several things I enjoyed rather than one safe option.",
        "negative": "",
        "body": "Enough breakfast variety to avoid having the same plate every morning. I found several things I enjoyed rather than one safe option."
      },
      {
        "reviewer": "Ian",
        "title": "Would have appreciated a little courtesy",
        "positive": "",
        "negative": "A couple of curt responses from staff left a poor impression; I was only looking for ordinary, polite assistance.",
        "body": "A couple of curt responses from staff left a poor impression; I was only looking for ordinary, polite assistance."
      },
      {
        "reviewer": "Heather",
        "title": "Didn’t have to improvise my strength session",
        "positive": "The gym had the different weights I needed and a bench that adjusted properly. I could follow my usual set of exercises.",
        "negative": "",
        "body": "The gym had the different weights I needed and a bench that adjusted properly. I could follow my usual set of exercises."
      },
      {
        "reviewer": "Неофидов",
        "title": "Heard every word on my Wi-Fi call",
        "positive": "Called a friend over Wi-Fi and could hear every word clearly. The connection held for the full call without either of us having to repeat ourselves.",
        "negative": "",
        "body": "Called a friend over Wi-Fi and could hear every word clearly. The connection held for the full call without either of us having to repeat ourselves."
      },
      {
        "reviewer": "Tulba",
        "title": "The welcome was better than the later help",
        "positive": "Friendly welcome when I arrived.",
        "negative": "A rather dismissive response when I needed help later. The service didn’t feel consistent across the visit.",
        "body": "Friendly welcome when I arrived.\nA rather dismissive response when I needed help later. The service didn’t feel consistent across the visit."
      },
      {
        "reviewer": "Raine",
        "title": "Would definitely stay at Arlo again if in Chicago.",
        "positive": "Clean, comfortable and right next to Millenium park.",
        "negative": "No complaints",
        "body": "Clean, comfortable and right next to Millenium park.\nNo complaints"
      },
      {
        "reviewer": "Brooke",
        "title": "Breakfast tasted freshly cooked",
        "positive": "Enjoyed a breakfast that tasted freshly made instead of just warmed through. The eggs were a particular highlight.",
        "negative": "",
        "body": "Enjoyed a breakfast that tasted freshly made instead of just warmed through. The eggs were a particular highlight."
      },
      {
        "reviewer": "Marco",
        "title": "Earplugs stayed unused for three nights",
        "positive": "Packed earplugs expecting the usual city noise, but the room was quiet enough to manage without them. They stayed unused all three nights.",
        "negative": "",
        "body": "Packed earplugs expecting the usual city noise, but the room was quiet enough to manage without them. They stayed unused all three nights."
      },
      {
        "reviewer": "Jomela",
        "title": "Good for browsing, shaky for a longer call",
        "positive": "Simple web browsing worked smoothly.",
        "negative": "A longer call over the same connection kept breaking up. A mixture of reliable basics and frustrating interruptions.",
        "body": "Simple web browsing worked smoothly.\nA longer call over the same connection kept breaking up. A mixture of reliable basics and frustrating interruptions."
      },
      {
        "reviewer": "Xongitiko",
        "title": "Most of breakfast stayed on the plate",
        "positive": "",
        "negative": "Lukewarm food and dry eggs meant I left most of my breakfast on the plate.",
        "body": "Lukewarm food and dry eggs meant I left most of my breakfast on the plate."
      },
      {
        "reviewer": "Ephantus",
        "title": "Exceptional",
        "positive": "Nice clean rooms with awesome views.",
        "negative": "",
        "body": "Nice clean rooms with awesome views."
      },
      {
        "reviewer": "Noura",
        "title": "The bedding felt scratchy and stiff",
        "positive": "",
        "negative": "Scratchy sheets and a stiff duvet made the bedding unpleasant to settle into. I found it hard to feel comfortable even after rearranging everything.",
        "body": "Scratchy sheets and a stiff duvet made the bedding unpleasant to settle into. I found it hard to feel comfortable even after rearranging everything."
      },
      {
        "reviewer": "Craig",
        "title": "More than enough for a holiday workout",
        "positive": "Found a good balance of cardio equipment and free weights. I had plenty to use without having to invent a completely different routine.",
        "negative": "",
        "body": "Found a good balance of cardio equipment and free weights. I had plenty to use without having to invent a completely different routine."
      },
      {
        "reviewer": "Creighton",
        "title": "Clear sound and picture while catching up",
        "positive": "Spent a while sharing pictures over a video call, and the connection kept up nicely. Both the picture and sound stayed clear.",
        "negative": "",
        "body": "Spent a while sharing pictures over a video call, and the connection kept up nicely. Both the picture and sound stayed clear."
      },
      {
        "reviewer": "Sophia",
        "title": "They are sweet and very caring",
        "positive": "Everyone is very friendly and welcoming !",
        "negative": "Nothing it was super good",
        "body": "Everyone is very friendly and welcoming !\nNothing it was super good"
      },
      {
        "reviewer": "Bashaer",
        "title": "My glasses case picked up the dust",
        "positive": "",
        "negative": "Dust on the bedside shelf came away on my glasses case, so that surface clearly hadn’t been wiped.",
        "body": "Dust on the bedside shelf came away on my glasses case, so that surface clearly hadn’t been wiped."
      },
      {
        "reviewer": "Donald",
        "title": "Handier for daytime than evening plans",
        "positive": "Getting to my daytime stops was straightforward.",
        "negative": "The evening plans involved more travelling back and forth. The convenience really depended on where I was going.",
        "body": "Getting to my daytime stops was straightforward.\nThe evening plans involved more travelling back and forth. The convenience really depended on where I was going."
      },
      {
        "reviewer": "Karin",
        "title": "A useful mix of exercise equipment",
        "positive": "I could alternate cardio with weights without running out of things to use. The gym had enough variety to keep me interested.",
        "negative": "",
        "body": "I could alternate cardio with weights without running out of things to use. The gym had enough variety to keep me interested."
      },
      {
        "reviewer": "Noah",
        "title": "Fruit and pastries to look forward to",
        "positive": "Found myself looking forward to the morning meal by the second day. The fresh fruit and pastries were especially good together.",
        "negative": "",
        "body": "Found myself looking forward to the morning meal by the second day. The fresh fruit and pastries were especially good together."
      },
      {
        "reviewer": "Anastasiia",
        "title": "Pages loaded properly on my tablet",
        "positive": "My tablet stayed online while I looked through quite a few travel pages. Nothing hung halfway through loading or needed a second attempt.",
        "negative": "",
        "body": "My tablet stayed online while I looked through quite a few travel pages. Nothing hung halfway through loading or needed a second attempt."
      },
      {
        "reviewer": "Ernesto",
        "title": "Excellent professional people",
        "positive": "Clean. Elegant vibe.",
        "negative": "Leaving",
        "body": "Clean. Elegant vibe.\nLeaving"
      },
      {
        "reviewer": "Mamduh",
        "title": "A comfortable bed after all that walking",
        "positive": "Coming back after a day of walking, I really appreciated how well the bed cushioned me without any uncomfortable pressure points.",
        "negative": "",
        "body": "Coming back after a day of walking, I really appreciated how well the bed cushioned me without any uncomfortable pressure points."
      },
      {
        "reviewer": "Jacqueline",
        "title": "Exceptional",
        "positive": "Location was fantastic! Close to everything and if you wanted to visit different neighborhoods the public transportation was easily accessible.",
        "negative": "",
        "body": "Location was fantastic! Close to everything and if you wanted to visit different neighborhoods the public transportation was easily accessible."
      },
      {
        "reviewer": "Plamedie",
        "title": "Watched a film with no pauses",
        "positive": "Watched a film all the way through online with no pauses for buffering or lost connections.",
        "negative": "",
        "body": "Watched a film all the way through online with no pauses for buffering or lost connections."
      },
      {
        "reviewer": "Faith",
        "title": "Much quieter with the door shut",
        "positive": "The corridor sounded lively when I stepped into it, so I was surprised how little I could hear with my door closed. Inside was pleasantly quiet.",
        "negative": "",
        "body": "The corridor sounded lively when I stepped into it, so I was surprised how little I could hear with my door closed. Inside was pleasantly quiet."
      },
      {
        "reviewer": "nothing at allLanise",
        "title": "Everything I tried worked properly",
        "positive": "Put a few different machines through their paces over the stay. All of them responded as expected, with nothing broken or sticking.",
        "negative": "",
        "body": "Put a few different machines through their paces over the stay. All of them responded as expected, with nothing broken or sticking."
      },
      {
        "reviewer": "Apollonia",
        "title": "The mattress felt better than it looked",
        "positive": "The mattress was more comfortable than it first looked. Once I lay down, it gave enough at the shoulders and stayed supportive underneath.",
        "negative": "",
        "body": "The mattress was more comfortable than it first looked. Once I lay down, it gave enough at the shoulders and stayed supportive underneath."
      },
      {
        "reviewer": "Bulelwa",
        "title": "Home away from home",
        "positive": "Everything! The staff, the people and the city itself.",
        "negative": "Nothing",
        "body": "Everything! The staff, the people and the city itself.\nNothing"
      },
      {
        "reviewer": "Francesco",
        "title": "Peaceful without any humming or rattling",
        "positive": "With everything switched off, there was no hum or rattling to spoil the quiet of the room.",
        "negative": "",
        "body": "With everything switched off, there was no hum or rattling to spoil the quiet of the room."
      },
      {
        "reviewer": "Jadechi",
        "title": "Enjoyed both light and cooked breakfasts",
        "positive": "I tried both the lighter and the cooked breakfast options during my stay. Everything I chose tasted fresh, so I’d be happy having either again.",
        "negative": "",
        "body": "I tried both the lighter and the cooked breakfast options during my stay. Everything I chose tasted fresh, so I’d be happy having either again."
      },
      {
        "reviewer": "Christine",
        "title": "Exceptional",
        "positive": "Everything! Warm and friendly service. Very helpful.",
        "negative": "",
        "body": "Everything! Warm and friendly service. Very helpful."
      },
      {
        "reviewer": "Ashley",
        "title": "The bathroom needed another clean",
        "positive": "",
        "negative": "The sink still had residue around the tap, and the bathroom floor hadn’t been cleaned thoroughly. It didn’t give me much confidence in the housekeeping.",
        "body": "The sink still had residue around the tap, and the bathroom floor hadn’t been cleaned thoroughly. It didn’t give me much confidence in the housekeeping."
      },
      {
        "reviewer": "Deanna",
        "title": "Everything was wonderful. The staff was absolutely exceptional and their communications before during an after were amaz",
        "positive": "The room was spacious and updated. The lobby was very nice with a nice back entrance for Easy drop off and pick up. It was very nice to have a very nice bar and restaurant right on site as well!",
        "negative": "",
        "body": "The room was spacious and updated. The lobby was very nice with a nice back entrance for Easy drop off and pick up. It was very nice to have a very nice bar and restaurant right on site as well!"
      },
      {
        "reviewer": "Holly",
        "title": "Appreciated the savory breakfast choices",
        "positive": "A few savory choices made breakfast easy for me, since I don’t want something sweet first thing. What I tried was well cooked and tasty.",
        "negative": "",
        "body": "A few savory choices made breakfast easy for me, since I don’t want something sweet first thing. What I tried was well cooked and tasty."
      },
      {
        "reviewer": "Karen",
        "title": "We had a great stay. Friendly staff and on premises restaurant go far!Great shower and comfy bed. And location, location",
        "positive": "The location was perfect.",
        "negative": "Could have used a regular coffee maker. Like a big cup in bed.the velvet settee looked a little dirty and there were a couple of drip spots on the floor but the bathroom was very clean so not a big worry.",
        "body": "The location was perfect.\nCould have used a regular coffee maker. Like a big cup in bed.the velvet settee looked a little dirty and there were a couple of drip spots on the floor but the bathroom was very clean so not a big worry."
      },
      {
        "reviewer": "Perdomo",
        "title": "Good options for lighter exercises too",
        "positive": "There were smaller weights as well as heavier ones, which suited the way I train. I could build up gradually rather than starting with too much.",
        "negative": "",
        "body": "There were smaller weights as well as heavier ones, which suited the way I train. I could build up gradually rather than starting with too much."
      },
      {
        "reviewer": "Rodney",
        "title": "Didn’t need to drown out other noise",
        "positive": "Peaceful enough that I never needed the television on to cover up noise from elsewhere.",
        "negative": "",
        "body": "Peaceful enough that I never needed the television on to cover up noise from elsewhere."
      },
      {
        "reviewer": "Glenn",
        "title": "Large downloads finished reliably",
        "positive": "I left some files downloading and found them all finished when I checked. Nice to have room Wi-Fi that could get through a larger download reliably.",
        "negative": "",
        "body": "I left some files downloading and found them all finished when I checked. Nice to have room Wi-Fi that could get through a larger download reliably."
      },
      {
        "reviewer": "Mara",
        "title": "Wonderful stays to celebrate the Christmas season!",
        "positive": "All of The staff was exceptional! The hotel is clean and very nice. The rooms are newly remodeled and very spacious. The beds were very comfortable The bar was very nice and the staff there was awesome as well!",
        "negative": "",
        "body": "All of The staff was exceptional! The hotel is clean and very nice. The rooms are newly remodeled and very spacious. The beds were very comfortable The bar was very nice and the staff there was awesome as well!"
      },
      {
        "reviewer": "Kristine",
        "title": "Could get through the whole workout",
        "positive": "There was enough working equipment to do both the cardio and strength exercises I’d planned. I left the fitness room feeling I’d made good use of it.",
        "negative": "",
        "body": "There was enough working equipment to do both the cardio and strength exercises I’d planned. I left the fitness room feeling I’d made good use of it."
      },
      {
        "reviewer": "July",
        "title": "A flavorful plate to start the day",
        "positive": "I liked that the hot breakfast items still tasted good when eaten together, rather than everything being bland. A satisfying plate before heading out.",
        "negative": "",
        "body": "I liked that the hot breakfast items still tasted good when eaten together, rather than everything being bland. A satisfying plate before heading out."
      },
      {
        "reviewer": "Brodey",
        "title": "No alarms or TVs through the wall",
        "positive": "No neighboring alarms or muffled TVs reaching me in the morning. A wonderfully quiet room.",
        "negative": "",
        "body": "No neighboring alarms or muffled TVs reaching me in the morning. A wonderfully quiet room."
      },
      {
        "reviewer": "Wendy",
        "title": "Perfect location and clean",
        "positive": "Location",
        "negative": "Parking was bit far",
        "body": "Location\nParking was bit far"
      },
      {
        "reviewer": "Kim",
        "title": "Enough breakfast variety for three mornings",
        "positive": "Enough variety at breakfast to keep three mornings interesting, with plenty of flavor in everything I tried.",
        "negative": "",
        "body": "Enough variety at breakfast to keep three mornings interesting, with plenty of flavor in everything I tried."
      },
      {
        "reviewer": "Bretag",
        "title": "Quick access to email and attachments",
        "positive": "Email and attachments opened quickly, and I never had the Wi-Fi drop while I was using them.",
        "negative": "",
        "body": "Email and attachments opened quickly, and I never had the Wi-Fi drop while I was using them."
      },
      {
        "reviewer": "Murray",
        "title": "Fresh linen was the first thing I noticed",
        "positive": "First thing I noticed was how fresh the linen smelled when I pulled back the duvet. No stains or stray hairs, and the bathroom was equally clean.",
        "negative": "",
        "body": "First thing I noticed was how fresh the linen smelled when I pulled back the duvet. No stains or stray hairs, and the bathroom was equally clean."
      },
      {
        "reviewer": "Elyssia",
        "title": "Not enough heavier weights for me",
        "positive": "",
        "negative": "The available dumbbells stopped short of the weights I normally train with. I couldn’t get the strength session I wanted out of the gym.",
        "body": "The available dumbbells stopped short of the weights I normally train with. I couldn’t get the strength session I wanted out of the gym."
      },
      {
        "reviewer": "Ayanna",
        "title": "Peaceful apart from a few door slams",
        "positive": "Mostly peaceful evenings.",
        "negative": "A few sudden door slams broke up the quiet rather sharply.",
        "body": "Mostly peaceful evenings.\nA few sudden door slams broke up the quiet rather sharply."
      },
      {
        "reviewer": "Rita",
        "title": "The fitness room earned a second visit",
        "positive": "My first workout went well, so I went back another morning. The equipment I needed was working on both visits.",
        "negative": "",
        "body": "My first workout went well, so I went back another morning. The equipment I needed was working on both visits."
      },
      {
        "reviewer": "Patricia",
        "title": "Couldn’t find a position that worked",
        "positive": "",
        "negative": "Spent most of the night shifting around because I couldn’t find a position that felt comfortable against my back.",
        "body": "Spent most of the night shifting around because I couldn’t find a position that felt comfortable against my back."
      },
      {
        "reviewer": "Vangie",
        "title": "Great!",
        "positive": "Perfect location!",
        "negative": "",
        "body": "Perfect location!"
      },
      {
        "reviewer": "Terrence",
        "title": "Almost no sound from next door",
        "positive": "I saw guests entering the adjoining room and still heard virtually nothing afterwards. Sound from next door wasn’t a problem for me.",
        "negative": "",
        "body": "I saw guests entering the adjoining room and still heard virtually nothing afterwards. Sound from next door wasn’t a problem for me."
      },
      {
        "reviewer": "Xavier",
        "title": "A big photo upload went through first try",
        "positive": "Sent a big batch of photos home from my phone and they all went through first try. The wireless connection handled the upload without stopping.",
        "negative": "",
        "body": "Sent a big batch of photos home from my phone and they all went through first try. The wireless connection handled the upload without stopping."
      },
      {
        "reviewer": "Sepi",
        "title": "Smooth bedding made settling in easy",
        "positive": "Smooth sheets, soft pillowcases, and no problem getting comfortable when I finally climbed into bed.",
        "negative": "",
        "body": "Smooth sheets, soft pillowcases, and no problem getting comfortable when I finally climbed into bed."
      },
      {
        "reviewer": "Alan",
        "title": "Thank you for a lovely stay.",
        "positive": "Not a thing.",
        "negative": "",
        "body": "Not a thing."
      },
      {
        "reviewer": "Declan",
        "title": "Great hotel in great location",
        "positive": "Breakfast was good„, location was great",
        "negative": "The porter that arranged the taxi was very \"out of his head\" on weed , was really the only thing that didn’t \"fit\"",
        "body": "Breakfast was good„, location was great\nThe porter that arranged the taxi was very \"out of his head\" on weed , was really the only thing that didn’t \"fit\""
      },
      {
        "reviewer": "Aysegul",
        "title": "Someone else’s drink rings on the desk",
        "positive": "",
        "negative": "There were sticky rings on the desk from someone else’s drinks. That should have been cleaned before the room was given to the next guest.",
        "body": "There were sticky rings on the desk from someone else’s drinks. That should have been cleaned before the room was given to the next guest."
      },
      {
        "reviewer": "Anna",
        "title": "An undisturbed early night",
        "positive": "An early night passed undisturbed, with no voices through the wall or traffic loud enough to wake me.",
        "negative": "",
        "body": "An early night passed undisturbed, with no voices through the wall or traffic loud enough to wake me."
      },
      {
        "reviewer": "Kenneth",
        "title": "Exceptional",
        "positive": "What else can be said when everything was just right? They Goldiloxed me!",
        "negative": "Could they have done a little something about the minus 8 degree F temperature outside?",
        "body": "What else can be said when everything was just right? They Goldiloxed me!\nCould they have done a little something about the minus 8 degree F temperature outside?"
      },
      {
        "reviewer": "Abhishek",
        "title": "Streaming worked all evening",
        "positive": "A whole evening of streaming, with no buffering or sudden dropouts. The hotel internet did exactly what I needed.",
        "negative": "",
        "body": "A whole evening of streaming, with no buffering or sudden dropouts. The hotel internet did exactly what I needed."
      },
      {
        "reviewer": "Alastair",
        "title": "The linen gave me confidence in the cleaning",
        "positive": "Fresh towels without a mark on them and equally spotless sheets gave me confidence in the cleaning.",
        "negative": "",
        "body": "Fresh towels without a mark on them and equally spotless sheets gave me confidence in the cleaning."
      },
      {
        "reviewer": "Romero",
        "title": "An unnecessarily abrupt response",
        "positive": "",
        "negative": "Asked a simple question at reception and got such an abrupt response that I didn’t feel like asking anything further.",
        "body": "Asked a simple question at reception and got such an abrupt response that I didn’t feel like asking anything further."
      },
      {
        "reviewer": "Tanesha",
        "title": "Kept rolling into the hollow",
        "positive": "",
        "negative": "Kept rolling into a hollow in the bed instead of staying where I’d settled. That uneven support made it difficult to get comfortable.",
        "body": "Kept rolling into a hollow in the bed instead of staying where I’d settled. That uneven support made it difficult to get comfortable."
      },
      {
        "reviewer": "Jane",
        "title": "Space to do the floor part of my routine",
        "positive": "There was a sensible area for mat exercises alongside the machines. I could stretch out fully without blocking the route through the gym.",
        "negative": "",
        "body": "There was a sensible area for mat exercises alongside the machines. I could stretch out fully without blocking the route through the gym."
      },
      {
        "reviewer": "Niru",
        "title": "Passed from person to person",
        "positive": "",
        "negative": "Getting an answer involved repeating my request to several people. Each one seemed ready to pass it on, but nobody actually took care of it.",
        "body": "Getting an answer involved repeating my request to several people. Each one seemed ready to pass it on, but nobody actually took care of it."
      },
      {
        "reviewer": "Jodie",
        "title": "Awesome staff and ease of getting to everything on Michigan Ave",
        "positive": "Central to everything on Michigan Ave",
        "negative": "A little bit loud at night with the sirens but no biggy",
        "body": "Central to everything on Michigan Ave\nA little bit loud at night with the sirens but no biggy"
      },
      {
        "reviewer": "Adam",
        "title": "Two flat pillows weren’t much better than one",
        "positive": "",
        "negative": "The pillows looked full but flattened the moment I lay on them. Doubling them up didn’t help much with the lack of support.",
        "body": "The pillows looked full but flattened the moment I lay on them. Doubling them up didn’t help much with the lack of support."
      },
      {
        "reviewer": "Heleanna",
        "title": "Nothing left around the shower drain",
        "positive": "The shower tray was spotless, with no hair around the drain or residue on the sides. That mattered more to me than the room looking tidy at a glance.",
        "negative": "",
        "body": "The shower tray was spotless, with no hair around the drain or residue on the sides. That mattered more to me than the room looking tidy at a glance."
      },
      {
        "reviewer": "Konstantinos",
        "title": "Ripe fruit for a lovely light breakfast",
        "positive": "Sweet, ripe fruit made my lighter breakfast feel like something to look forward to.",
        "negative": "",
        "body": "Sweet, ripe fruit made my lighter breakfast feel like something to look forward to."
      },
      {
        "reviewer": "George",
        "title": "Helpfulness varied between staff",
        "positive": "One staff member went out of their way to help.",
        "negative": "A later request was brushed aside by someone else.",
        "body": "One staff member went out of their way to help.\nA later request was brushed aside by someone else."
      },
      {
        "reviewer": "L",
        "title": "Podcasts downloaded without a hitch",
        "positive": "Downloaded a few podcasts without a hitch, and the Wi-Fi was just as dependable for everyday browsing.",
        "negative": "",
        "body": "Downloaded a few podcasts without a hitch, and the Wi-Fi was just as dependable for everyday browsing."
      },
      {
        "reviewer": "Priti",
        "title": "The dumbbell range was a pleasant surprise",
        "positive": "Found both lighter pairs for smaller exercises and heavier ones for the rest. Much more useful than the tiny selection I sometimes see in hotels.",
        "negative": "",
        "body": "Found both lighter pairs for smaller exercises and heavier ones for the rest. Much more useful than the tiny selection I sometimes see in hotels."
      },
      {
        "reviewer": "Ronda",
        "title": "Staff were amazing. Clean and great location. Beer selection at restaurant and bar was lacking.",
        "positive": "Great location",
        "negative": "Bar stool’s uncomfortable",
        "body": "Great location\nBar stool’s uncomfortable"
      },
      {
        "reviewer": "Sunipa",
        "title": "Eggs, toast and coffee done well",
        "positive": "The eggs were soft, the toast had a little crunch, and the coffee rounded it off nicely. That was a breakfast I enjoyed finishing.",
        "negative": "",
        "body": "The eggs were soft, the toast had a little crunch, and the coffee rounded it off nicely. That was a breakfast I enjoyed finishing."
      },
      {
        "reviewer": "Mehmet",
        "title": "Very Good",
        "positive": "Check in time is too late",
        "negative": "",
        "body": "Check in time is too late"
      },
      {
        "reviewer": "Andrea",
        "title": "We loved the location",
        "positive": "Great location",
        "negative": "I liked everything, no complaints",
        "body": "Great location\nI liked everything, no complaints"
      },
      {
        "reviewer": "Margaret",
        "title": "Clean beyond the obvious surfaces",
        "positive": "I checked a couple of the less obvious places, including the shelf inside the wardrobe. Everything was dust-free, not just the surfaces you see first.",
        "negative": "",
        "body": "I checked a couple of the less obvious places, including the shelf inside the wardrobe. Everything was dust-free, not just the surfaces you see first."
      },
      {
        "reviewer": "Joachim",
        "title": "Browsing felt as easy as at home",
        "positive": "Could open directions and update my plans as quickly as I could at home. The connection stayed steady whenever I needed another page.",
        "negative": "",
        "body": "Could open directions and update my plans as quickly as I could at home. The connection stayed steady whenever I needed another page."
      },
      {
        "reviewer": "Jeffrey",
        "title": "Not enough appealing breakfast options",
        "positive": "",
        "negative": "I wanted a breakfast with a bit of variety, but the options soon felt limited. What I did pick wasn’t especially appetizing either.",
        "body": "I wanted a breakfast with a bit of variety, but the options soon felt limited. What I did pick wasn’t especially appetizing either."
      },
      {
        "reviewer": "Brystal",
        "title": "An inconvenient base for my outings",
        "positive": "",
        "negative": "It wasn’t easy to pop back during the day from the areas I was exploring. The extra journey each way made the hotel an inconvenient base for me.",
        "body": "It wasn’t easy to pop back during the day from the areas I was exploring. The extra journey each way made the hotel an inconvenient base for me."
      },
      {
        "reviewer": "Oleg",
        "title": "A few crumbs spoilt the clean impression",
        "positive": "Most surfaces were properly wiped. A clean room in many respects.",
        "negative": "There were crumbs near the bedside table, one of a couple of obvious misses.",
        "body": "Most surfaces were properly wiped. A clean room in many respects.\nThere were crumbs near the bedside table, one of a couple of obvious misses."
      },
      {
        "reviewer": "Farrah",
        "title": "The weights setup met my needs",
        "positive": "A stable bench and enough dumbbells to choose from made strength work straightforward. I was pleased with the fitness room.",
        "negative": "",
        "body": "A stable bench and enough dumbbells to choose from made strength work straightforward. I was pleased with the fitness room."
      },
      {
        "reviewer": "Deepak",
        "title": "Wonderful",
        "positive": "Staff",
        "negative": "",
        "body": "Staff"
      },
      {
        "reviewer": "Mike",
        "title": "Gave up on the tough toast",
        "positive": "",
        "negative": "Morning toast was tough enough that I gave up halfway through. The rest of breakfast tasted flat too, so it wasn’t a great start.",
        "body": "Morning toast was tough enough that I gave up halfway through. The rest of breakfast tasted flat too, so it wasn’t a great start."
      },
      {
        "reviewer": "Carmel",
        "title": "Machines felt solid and usable",
        "positive": "No wobbling bench or awkward controls to distract me during the workout. The equipment seemed to be kept in good working condition.",
        "negative": "",
        "body": "No wobbling bench or awkward controls to distract me during the workout. The equipment seemed to be kept in good working condition."
      },
      {
        "reviewer": "Daron",
        "title": "I had a wonderful time.",
        "positive": "Clean",
        "negative": "Noisy!! Look like someone was doing some construction work. Also, took housekeeping so long to bring one roll a tissue up to my room. Almost a hour to get tissue.",
        "body": "Clean\nNoisy!! Look like someone was doing some construction work. Also, took housekeeping so long to bring one roll a tissue up to my room. Almost a hour to get tissue."
      },
      {
        "reviewer": "Martha",
        "title": "An easy walk to only some of my stops",
        "positive": "Some of the sights on my list were an easy walk.",
        "negative": "Others took longer to reach than I’d allowed. The location was useful for only part of my itinerary.",
        "body": "Some of the sights on my list were an easy walk.\nOthers took longer to reach than I’d allowed. The location was useful for only part of my itinerary."
      },
      {
        "reviewer": "Shauneen",
        "title": "Just the firmness my back needed",
        "positive": "For someone who usually prefers their own bed, I got on very well with this one. The firmness was just right for my back.",
        "negative": "",
        "body": "For someone who usually prefers their own bed, I got on very well with this one. The firmness was just right for my back."
      },
      {
        "reviewer": "Valerie",
        "title": "Exceptional",
        "positive": "Great location close to the train station.",
        "negative": "",
        "body": "Great location close to the train station."
      },
      {
        "reviewer": "Mazen",
        "title": "Connected quickly and stayed online",
        "positive": "Joined the network quickly on arrival and had a steady connection every time I used it afterwards.",
        "negative": "",
        "body": "Joined the network quickly on arrival and had a steady connection every time I used it afterwards."
      },
      {
        "reviewer": "Lucinda",
        "title": "Cardio equipment better than the floor space",
        "positive": "The treadmills worked well, and I enjoyed that part of my session.",
        "negative": "The area left for stretching was rather cramped once I put a mat down.",
        "body": "The treadmills worked well, and I enjoyed that part of my session.\nThe area left for stretching was rather cramped once I put a mat down."
      },
      {
        "reviewer": "Maxine",
        "title": "Great pillows, mattress too soft",
        "positive": "The pillows felt great.",
        "negative": "The mattress was too soft under my lower back for the bed to be fully comfortable.",
        "body": "The pillows felt great.\nThe mattress was too soft under my lower back for the bed to be fully comfortable."
      },
      {
        "reviewer": "Liam",
        "title": "Hallway noise stayed in the hallway",
        "positive": "Even the busier part of the evening passed without much sound reaching my room. I appreciated how well the corridor noise was kept outside.",
        "negative": "",
        "body": "Even the busier part of the evening passed without much sound reaching my room. I appreciated how well the corridor noise was kept outside."
      },
      {
        "reviewer": "Louay",
        "title": "Care had gone into the cooking",
        "positive": "Simple food, but it tasted as though someone had paid attention to the cooking. I particularly enjoyed the hot breakfast rather than just filling up on bread.",
        "negative": "",
        "body": "Simple food, but it tasted as though someone had paid attention to the cooking. I particularly enjoyed the hot breakfast rather than just filling up on bread."
      },
      {
        "reviewer": "Louise",
        "title": "The pillow kept its shape",
        "positive": "Loved having a pillow that actually kept its shape when I turned onto my side.",
        "negative": "",
        "body": "Loved having a pillow that actually kept its shape when I turned onto my side."
      },
      {
        "reviewer": "Waldo",
        "title": "Street noise muffled, hallway voices audible",
        "positive": "Street sounds were well muted.",
        "negative": "I could hear people talking outside my door. The room handled one kind of noise better than the other.",
        "body": "Street sounds were well muted.\nI could hear people talking outside my door. The room handled one kind of noise better than the other."
      },
      {
        "reviewer": "Haley",
        "title": "The staff was incredibly helpful and so kind. It felt so nice to walk in and be remembered and warmly greeted!",
        "positive": "It was walking distance from everything",
        "negative": "Little expensive for the room size",
        "body": "It was walking distance from everything\nLittle expensive for the room size"
      },
      {
        "reviewer": "Hayes",
        "title": "Didn’t feel acknowledged at reception",
        "positive": "",
        "negative": "The person at reception barely acknowledged me while I was asking for assistance. I left the conversation feeling ignored rather than helped.",
        "body": "The person at reception barely acknowledged me while I was asking for assistance. I left the conversation feeling ignored rather than helped."
      },
      {
        "reviewer": "Carroll",
        "title": "Too much time spent getting back and forth",
        "positive": "",
        "negative": "For my itinerary, getting to and from the hotel took far too much of the day.",
        "body": "For my itinerary, getting to and from the hotel took far too much of the day."
      },
      {
        "reviewer": "Steve",
        "title": "All over great hospitality and clean property",
        "positive": "Customer service",
        "negative": "Pillows",
        "body": "Customer service\nPillows"
      },
      {
        "reviewer": "Cedric",
        "title": "Easy to stay in touch over Wi-Fi",
        "positive": "Messages and photos went straight through on the hotel Wi-Fi, making it easy to keep in touch.",
        "negative": "",
        "body": "Messages and photos went straight through on the hotel Wi-Fi, making it easy to keep in touch."
      },
      {
        "reviewer": "Constanza",
        "title": "Plenty of choice, uneven freshness",
        "positive": "Plenty of appealing breakfast choices, and I loved the fruit.",
        "negative": "Found the pastries rather dry. The quality didn’t quite match across the different choices.",
        "body": "Plenty of appealing breakfast choices, and I loved the fruit.\nFound the pastries rather dry. The quality didn’t quite match across the different choices."
      },
      {
        "reviewer": "Pablo",
        "title": "No sudden noises for this light sleeper",
        "positive": "A light sleeper here, and I wasn’t jolted awake by doors or voices during my stay. That made a welcome change from some recent hotel visits.",
        "negative": "",
        "body": "A light sleeper here, and I wasn’t jolted awake by doors or voices during my stay. That made a welcome change from some recent hotel visits."
      },
      {
        "reviewer": "Anastasija",
        "title": "Those flaky pastries were tempting",
        "positive": "Light, flaky pastries made breakfast a treat. I was very tempted to have another!",
        "negative": "",
        "body": "Light, flaky pastries made breakfast a treat. I was very tempted to have another!"
      },
      {
        "reviewer": "Josh",
        "title": "No hunting around the room for a signal",
        "positive": "The room network worked from whichever spot I happened to be sitting in. I didn’t have to move around looking for a signal that would hold.",
        "negative": "",
        "body": "The room network worked from whichever spot I happened to be sitting in. I didn’t have to move around looking for a signal that would hold."
      },
      {
        "reviewer": "Freeman",
        "title": "Good weights, one cardio machine let it down",
        "positive": "The free weights gave me plenty of options for strength exercises.",
        "negative": "The bike display kept cutting out, which made that part of my workout harder to follow.",
        "body": "The free weights gave me plenty of options for strength exercises.\nThe bike display kept cutting out, which made that part of my workout harder to follow."
      },
      {
        "reviewer": "Megan",
        "title": "Clean and convenient.",
        "positive": "Super clean. Shower was extra hot with good water pressure. Close to everything I wanted to see. And great burgers at the restaurant!",
        "negative": "",
        "body": "Super clean. Shower was extra hot with good water pressure. Close to everything I wanted to see. And great burgers at the restaurant!"
      },
      {
        "reviewer": "Ryan",
        "title": "No dips or awkward hard patches",
        "positive": "Good support across the mattress, including the side I tend to sleep on. I wasn’t rolling toward a dip or trying to avoid a hard patch.",
        "negative": "",
        "body": "Good support across the mattress, including the side I tend to sleep on. I wasn’t rolling toward a dip or trying to avoid a hard patch."
      }
    ]
  };
  Object.entries(EMBEDDED_EXACT_HOTEL_REVIEWS).forEach(([hotelId, reviews]) => {
    reviews.forEach((review, index) => {
      const neutralHotelId = hotelId.replace(/[^a-z0-9]+/gi, "_");
      review.stimulusId = neutralHotelId + "_review_" + String(index + 1).padStart(3, "0");
    });
  });
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

  function randomInteger(max) {
    if (max <= 0) return 0;
    try {
      if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] % max;
      }
    } catch (_) {
      /* fall through to Math.random */
    }
    return Math.floor(Math.random() * max);
  }

  function shuffled(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = randomInteger(i + 1);
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function stableShuffled(items, seedText) {
    let seed = 2166136261;
    const normalized = String(seedText || "");
    for (let i = 0; i < normalized.length; i += 1) {
      seed ^= normalized.charCodeAt(i);
      seed = Math.imul(seed, 16777619);
    }
    const random = () => {
      seed += 0x6D2B79F5;
      let value = seed;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function participantStorageSuffix() {
    const params = new URLSearchParams(location.search || "");
    const identity = params.get("STUDENT_ID") || params.get("student_id") || params.get("PROLIFIC_PID") || params.get("prolific_pid") || params.get("participant_id") ||
      params.get("SESSION_ID") || params.get("session_id") || "anonymous";
    return encodeURIComponent(identity);
  }

  function studyCondition() {
    const params = new URLSearchParams(location.search || "");
    const explicit = (params.get("study_condition") || "").toLowerCase();
    if (explicit === "ai_summary" || params.get("study_version") === "3" || aiSummaryRequested()) {
      return "ai_summary";
    }
    return "full_reviews";
  }

  function studyRunStorageSuffix() {
    const params = new URLSearchParams(location.search || "");
    const browsingRunId = params.get("browsing_run") || params.get("submission_id") || "legacy";
    return `${participantStorageSuffix()}:${studyCondition()}:${encodeURIComponent(browsingRunId)}`;
  }

  function hotelViewStorageKey() {
    return `${HOTEL_VIEW_STATE_KEY}:${studyRunStorageSuffix()}`;
  }

  function hotelReviewViewStorageKey() {
    const prefix = aiSummaryRequested()
      ? HOTEL_AI_REVIEW_VIEW_STATE_KEY
      : HOTEL_REVIEW_VIEW_STATE_KEY;
    return `${prefix}:${studyRunStorageSuffix()}`;
  }

  function hotelOrderStorageKey() {
    return `${HOTEL_ORDER_STATE_KEY}:${participantStorageSuffix()}`;
  }

  function persistedVisibleHotelIds() {
    const required = requiredHotelIds();
    const requiredSet = new Set(required);
    const stored = safeJsonParse(localStorage.getItem(hotelOrderStorageKey()), []);
    const validStored = Array.isArray(stored)
      ? stored.filter(id => requiredSet.has(id))
      : [];

    if (validStored.length === required.length && new Set(validStored).size === required.length) {
      return validStored;
    }

    const participant = participantStorageSuffix();
    const nextOrder = participant === "anonymous"
      ? shuffled(required)
      : stableShuffled(required, `hotel-order-v1:${participant.toUpperCase()}`);
    localStorage.setItem(hotelOrderStorageKey(), JSON.stringify(nextOrder));
    logEvent("hotel_order_randomized", { hotelIds: nextOrder });
    return nextOrder;
  }

  function getHotelViewState() {
    const state = safeJsonParse(localStorage.getItem(hotelViewStorageKey()), {}) || {};
    return {
      viewedHotelIds: Array.isArray(state.viewedHotelIds) ? state.viewedHotelIds.filter(Boolean) : [],
      updatedAt: state.updatedAt || ""
    };
  }

  function setHotelViewState(state) {
    localStorage.setItem(hotelViewStorageKey(), JSON.stringify(state || {}));
  }

  function getHotelReviewViewState() {
    const state = safeJsonParse(localStorage.getItem(hotelReviewViewStorageKey()), {}) || {};
    return {
      viewedHotelIds: Array.isArray(state.viewedHotelIds) ? state.viewedHotelIds.filter(Boolean) : [],
      updatedAt: state.updatedAt || ""
    };
  }

  function setHotelReviewViewState(state) {
    localStorage.setItem(hotelReviewViewStorageKey(), JSON.stringify(state || {}));
  }

  function viewedHotelSet() {
    return new Set(getHotelViewState().viewedHotelIds);
  }

  function viewedReviewHotelSet() {
    return new Set(getHotelReviewViewState().viewedHotelIds);
  }

  function requiredHotelIds() {
    return Array.from(VISIBLE_HOTEL_IDS);
  }

  function markNoReviewHotelViewed(hotelId, reason = "view_complete") {
    const state = getHotelViewState();
    const viewed = new Set(state.viewedHotelIds);
    if (viewed.has(hotelId)) return;
    viewed.add(hotelId);
    state.viewedHotelIds = Array.from(viewed);
    state.updatedAt = new Date().toISOString();
    setHotelViewState(state);
    logEvent("no_review_hotel_view_complete", {
      hotelId,
      reason,
      viewedCount: state.viewedHotelIds.length,
      requiredCount: requiredHotelIds().length
    });
  }

  function markReviewHotelViewed(hotelId, reason = "review_modal_closed") {
    const state = getHotelReviewViewState();
    const viewed = new Set(state.viewedHotelIds);
    if (viewed.has(hotelId)) return;
    viewed.add(hotelId);
    state.viewedHotelIds = Array.from(viewed);
    state.updatedAt = new Date().toISOString();
    setHotelReviewViewState(state);
    logEvent("review_hotel_view_complete", {
      hotelId,
      reason,
      condition: pageState().showAiSummary ? "with_ai_summary" : "with_reviews",
      viewedCount: state.viewedHotelIds.length,
      requiredCount: requiredHotelIds().length
    });
  }

  function getLogs() {
    try {
      return safeJsonParse(localStorage.getItem(STORAGE_KEY), []) || [];
    } catch (_) {
      return [];
    }
  }

  function setLogs(logs) {
    const limits = [600, 300, 100, 25];
    for (let i = 0; i < limits.length; i += 1) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(-limits[i])));
        return;
      } catch (_) {
        /* Retry with a smaller local audit buffer. */
      }
    }
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

  function aiSummaryRequested() {
    const p = new URLSearchParams(location.search);
    const path = location.pathname.toLowerCase();
    const summaryParam = (p.get("ai_summary") || p.get("summary") || "").toLowerCase();
    const surveyStage = (p.get("survey_stage") || "").toLowerCase();
    const bodyVersion = (document.body.dataset.reviewVersion || "auto").toLowerCase();
    const legacyPhase = p.get("phase");

    return ["1", "true", "yes", "with"].includes(summaryParam)
      || surveyStage === "search_3"
      || bodyVersion === "with-ai-summary"
      || bodyVersion === "ai-summary"
      || path.includes("search-ai-summaries")
      || path.includes("hotel_3")
      || legacyPhase === "3";
  }

  function pageState() {
    const p = new URLSearchParams(location.search);
    const path = location.pathname.toLowerCase();
    const reviewParam = (p.get("reviews") || "").toLowerCase();
    const surveyStage = (p.get("survey_stage") || "").toLowerCase();
    const bodyVersion = (document.body.dataset.reviewVersion || "auto").toLowerCase();
    const legacyPhase = p.get("phase");
    const showAiSummary = aiSummaryRequested();

    let showReviews = showAiSummary;
    if (showAiSummary) showReviews = true;
    else if (["1", "true", "yes", "with"].includes(reviewParam)) showReviews = true;
    else if (["0", "false", "no", "without"].includes(reviewParam)) showReviews = false;
    else if (surveyStage === "search_2") showReviews = true;
    else if (surveyStage === "search_1") showReviews = false;
    else if (bodyVersion === "with") showReviews = true;
    else if (bodyVersion === "without") showReviews = false;
    else if (path.includes("search-reviews") || path.includes("hotel_2") || legacyPhase === "2") showReviews = true;
    else if (path.includes("search-no-reviews") || path.includes("hotel_1") || legacyPhase === "1") showReviews = false;

    return {
      showReviews,
      showAiSummary,
      versionLabel: showAiSummary
        ? "Phase 3 reviews with AI summary"
        : showReviews
          ? "Phase 2 full reviews"
          : "Phase 1 browsing",
      phase: showAiSummary ? "3" : showReviews ? "2" : "1"
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
      .replace(/(^|\s)[:;=8xX][-']?[)(DPpOo](?=\s|$)/g, "$1")
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
          "name": "Pendry Hotel",
          "brand": "Lifestyle hotel",
          "hotelClass": "4-star hotel",
          "stars": 4,
          "priceNightly": 147,
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
              "Facilities for disabled guests",
              "Room service",
              "Fitness center",
              "4 restaurants",
              "Free Wifi",
              "Private Parking",
              "24-hour front desk",
              "Tea/Coffee Maker in All Rooms",
              "Good Breakfast"
          ],
          "about": "Pendry Hotel is located in Chicago city center on North Michigan Avenue, with easy access to key attractions, restaurants, transit and the lakefront. Rooms include private bathrooms, air-conditioning, city or river views, mini-bars and flat-screen TVs.",
          "aboutSections": [
              {
                  "title": "Exceptional facilities",
                  "text": "Guests enjoy a fitness center, free bicycles, terrace, restaurant, bar, and complimentary WiFi. Additional amenities include a lounge, games room, and electric vehicle charging station."
              },
              {
                  "title": "Comfortable accommodations",
                  "text": "Rooms feature private bathrooms, air-conditioning, city or river views, and modern amenities such as mini-bars and flat-screen TVs."
              },
              {
                  "title": "Dining experience",
                  "text": "The modern, romantic restaurant serves French and American cuisines for lunch, dinner, high tea, and cocktails. Breakfast is available as an American à la carte."
              },
              {
                  "title": "Nearby activities",
                  "text": "Guests can participate in bike tours, visit an ice-skating rink, or engage in kayaking or canoeing. Midway International Airport is 11 mi away."
              }
          ],
          "detailNotes": [],
          "facts": [
              "Room option: King Guestroom, 295 sq ft, 1 king bed.",
              "Subway/metro and train access is 1,100 ft walking from State/Lake station."
          ],
          "locationNotes": [
              "Millennium Park",
              "Cloud Gate",
              "Chicago Riverwalk",
              "Art Institute of Chicago"
          ],
          "locationScoreText": "",
          "areaMapText": "Excellent location",
          "guestLovedNote": "Guests loved walking around the neighborhood.",
          "guestRating": null,
          "guestReviewCount": 150,
          "ratingBreakdown": {
              "Cleanliness": 4.5,
              "Service quality": 4.25,
              "Room comfort": 4.0,
              "Wi-Fi reliability": 3.0,
              "Noise level (quietness)": 2.75,
              "Location convenience": 4.75,
              "Fitness facilities": 3.25,
              "Breakfast quality": 4.5
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
          "priceNightly": 300,
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
              "Modern guest rooms include flat-screen cable TV, plush lounge seating, complimentary WiFi, minibar and coffee machine.",
              "Subway access is 1,250 ft walking from Clark/Division station."
          ],
          "locationNotes": [
              "Oak Street Beach",
              "Magnificent Mile",
              "Navy Pier",
              "Millennium Park"
          ],
          "locationScoreText": "",
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
          "priceNightly": 301,
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
              "Room option: King Room, 330 sq ft, 1 king bed.",
              "Subway access is 300 ft walking from Damen station."
          ],
          "locationNotes": [
              "Damen station",
              "Wicker Park",
              "United Center",
              "Lincoln Park Zoo"
          ],
          "locationScoreText": "",
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
          "priceNightly": 302,
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
              "Room option: Standard King Room, 290 sq ft, 1 king bed.",
              "Subway access is 600 ft walking from Morgan station."
          ],
          "locationNotes": [
              "Morgan station",
              "United Center",
              "Restaurant Row",
              "Millennium Park"
          ],
          "locationScoreText": "",
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
          "name": "Nobu Hotel",
          "brand": "Lifestyle hotel",
          "hotelClass": "5-star hotel",
          "stars": 5,
          "priceNightly": 145,
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
              "Room service",
              "Fitness center",
              "2 restaurants",
              "Free Wifi",
              "Tea/Coffee Maker in All Rooms",
              "Bar",
              "Good Breakfast"
          ],
          "about": "Nobu Hotel offers luxurious rooms with private bathrooms, free WiFi and modern amenities in Chicago's West Loop. Guests can use the sauna, fitness center, indoor swimming pool and steam room, with Japanese and Asian dining on site.",
          "aboutSections": [
              {
                  "title": "Elegant accommodations",
                  "text": "Nobu Hotel offers luxurious rooms with private bathrooms, free WiFi and modern amenities. Guests enjoy a sauna, fitness center, indoor swimming pool and steam room."
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
          "detailNotes": [],
          "facts": [
              "Room option: Yubune King, 439 sq ft, 1 king bed.",
              "Nearby transit includes Ogilvie Transportation Center and Union Station."
          ],
          "locationNotes": [
              "Ogilvie Transportation Center",
              "Union Station",
              "Willis Tower",
              "Art Institute of Chicago"
          ],
          "locationScoreText": "",
          "guestLovedNote": "Guests loved walking around the neighborhood.",
          "guestRating": null,
          "guestReviewCount": 150,
          "ratingBreakdown": {
              "Cleanliness": 3.25,
              "Service quality": 4.5,
              "Room comfort": 4.75,
              "Wi-Fi reliability": 4.0,
              "Noise level (quietness)": 4.5,
              "Location convenience": 3.25,
              "Fitness facilities": 3.0,
              "Breakfast quality": 2.75
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
          "name": "Arlo Hotel",
          "brand": "Independent-style hotel",
          "hotelClass": "4-star hotel",
          "stars": 4,
          "priceNightly": 143,
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
              "Facilities for disabled guests",
              "Room service",
              "Fitness center",
              "Restaurant",
              "Free Wifi",
              "Parking",
              "24-hour front desk",
              "Bar",
              "Very Good Breakfast"
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
                  "text": "An American breakfast is available every morning at Arlo Hotel. About Last Knife, the on-site steakhouse restaurant, offers American, seafood and local cuisine."
              },
              {
                  "title": "Front desk guidance",
                  "text": "When guests need guidance on where to visit, the reception will be happy to provide advice."
              },
              {
                  "title": "Nearby attractions",
                  "text": "Chicago Symphony Orchestra and Shops at Northbridge are less than a 10-minute walk away. DePaul University is less than 0.6 mi from Arlo Hotel, while Chicago Board of Trade Building is a 12-minute walk from the property."
              }
          ],
          "detailNotes": [],
          "facts": [
              "Room option: Standard King Room, 220 sq ft, 1 king bed.",
              "Subway/metro and train access is 550 ft walking from Millennium Station station.",
              "The nearest airport is Midway International Airport, 9.3 mi from the property."
          ],
          "locationNotes": [
              "Millennium Station",
              "Millennium Park",
              "Cloud Gate",
              "Art Institute of Chicago"
          ],
          "locationScoreText": "",
          "areaMapText": "Excellent location",
          "guestLovedNote": "Guests loved walking around the neighborhood.",
          "guestRating": null,
          "guestReviewCount": 150,
          "ratingBreakdown": {
              "Cleanliness": 4.0,
              "Service quality": 3.0,
              "Room comfort": 3.25,
              "Wi-Fi reliability": 4.75,
              "Noise level (quietness)": 3.5,
              "Location convenience": 4.25,
              "Fitness facilities": 4.5,
              "Breakfast quality": 3.75
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
  const VISIBLE_HOTEL_IDS = new Set([
    "pendry-chicago",
    "nobu-hotel-chicago",
    "arlo-chicago"
  ]);

  const AI_REVIEW_SUMMARIES = {
    "pendry-chicago": {
      overview: "Across the current 150-review set, guests most consistently praise Pendry Hotel's location, cleanliness, breakfast, service, and room comfort. Noise and Wi-Fi reliability are the clearest recurring concerns.",
      strengths: [
        "The central location is repeatedly described as convenient for reaching attractions, restaurants, and transportation.",
        "Guests frequently report clean rooms and bathrooms, helpful service, and comfortable beds or room layouts.",
        "Breakfast receives strong comments for freshness, variety, and overall quality."
      ],
      considerations: [
        "Corridor, street, and neighboring-room noise disrupt some stays and can make sleep difficult.",
        "Several guests report Wi-Fi drops, buffering, or unstable connections during ordinary use.",
        "Fitness facilities receive mixed feedback, especially about equipment variety, availability, and maintenance."
      ]
    },
    "nobu-hotel-chicago": {
      overview: "Across the current 150-review set, guests most consistently praise Nobu Hotel's service, room comfort, quiet rooms, and Wi-Fi. Cleanliness, location convenience, fitness facilities, and breakfast are more mixed.",
      strengths: [
        "Staff are often described as responsive, attentive, and helpful with requests.",
        "Beds, room layouts, and bathrooms receive frequent praise for comfort.",
        "Many guests report quiet rooms and reliable Wi-Fi for browsing, streaming, or work."
      ],
      considerations: [
        "Some reviews mention missed cleaning details, including hair, dust, residue, or incomplete housekeeping.",
        "The location works well for some dining plans but feels less convenient for several sightseeing itineraries.",
        "Fitness equipment and breakfast freshness or variety receive recurring criticism."
      ]
    },
    "arlo-chicago": {
      overview: "Across the current 150-review set, guests most consistently praise Arlo Hotel's Wi-Fi, fitness facilities, location, and cleanliness. Service and room comfort receive the most uneven feedback.",
      strengths: [
        "Wi-Fi is frequently described as stable and dependable throughout the room.",
        "Guests often value the fitness equipment and the hotel's convenient location for exploring the city.",
        "Rooms and bathrooms are generally described as clean, while breakfast receives several positive comments."
      ],
      considerations: [
        "Service responsiveness varies, with some guests reporting delays or unresolved requests.",
        "Mattress, pillow, and room-comfort experiences are mixed rather than consistently positive.",
        "Some guests mention corridor or street noise, and breakfast quality is not equally strong across all stays."
      ]
    }
  };

  // Keep the review copy verbatim, but lead with a balanced set of positive and
  // critical experiences so the corpus evidence is visible without deep scrolling.
  const REVIEW_PRIORITY_BY_HOTEL = {
    "pendry-chicago": [
      ["Bernadette", "June 11, 2026"],
      ["Todd", "May 25, 2026"],
      ["Abigail", "March 16, 2026"],
      ["Spriha", "January 18, 2026"],
      ["Mikew49", "October 13, 2025"],
      ["Diego", "August 31, 2025"],
      ["Justin", "July 17, 2025"],
      ["Mariella", "July 10, 2025"],
      ["Julie", "May 29, 2024"],
      ["Zabin", "April 30, 2024"],
      ["Ruedi", "May 13, 2024"],
      ["Stephanie", "March 14, 2025"]
    ],
    "nobu-hotel-chicago": [
      ["Nikhil", "June 20, 2026"],
      ["Leandro", "June 14, 2026"],
      ["Ela", "May 19, 2026"],
      ["Vernon", "May 9, 2026"],
      ["Ian", "May 5, 2026"],
      ["Kathryn", "April 28, 2026"],
      ["Steven", "January 5, 2026"],
      ["Creighton", "July 2, 2025"],
      ["Brittany", "June 24, 2025"],
      ["Francesco", "January 4, 2025"],
      ["Ashley", "January 1, 2025"],
      ["Perdomo", "November 18, 2024"]
    ],
    "arlo-chicago": [
      ["Raine", "June 29, 2026"],
      ["Lucinda", "June 28, 2026"],
      ["Maxine", "June 22, 2026"],
      ["Liam", "June 18, 2026"],
      ["Louise", "June 15, 2026"],
      ["Josh", "April 27, 2026"],
      ["Freeman", "April 26, 2026"],
      ["Letícia", "January 30, 2026"],
      ["Engstrand", "January 5, 2026"],
      ["Brookhart", "January 5, 2026"],
      ["Charlotte", "November 8, 2025"],
      ["Jacki", "November 15, 2025"]
    ]
  };

  const REVIEWER_NAME_FIXES = {
    "Not helpfulTulba": "Tulba",
    "A general view of Chicago or a view of the city taken from the hotelMark": "Mark",
    "Little Japanese influence, over-priced.Hughes": "Hughes",
    "Not helpfulGlenn": "Glenn",
    "Not helpfulHeleanna": "Heleanna",
    "Not helpfulEllen": "Ellen",
    "Thank you for your review. We appreciate your feedback!Waldo": "Waldo",
    "Thank you for your review. We appreciate your feedback!Cedric": "Cedric",
    "Not helpfulGail": "Gail",
    "Not helpfulEphantus": "Ephantus",
    "Thank you for your review. We appreciate your feedback!Manuel": "Manuel"
  };

  const REVIEW_MEDIA_CAPTIONS = [
    /^user uploaded image of /i,
    /^a (bed|bathroom|seating area|restaurant|television|building|general view|natural landscape|fitness center|swimming pool)\b/i,
    /^a (bird's-eye|general sea) view\b/i,
    /^guests staying at /i,
    /^food at or somewhere near /i,
    /^drinks at /i
  ];

  function formatCount(n) {
    return Number(n || 0).toLocaleString();
  }

  function reviewCountLabel(count, usePlus) {
    const countText = `${formatCount(count)}${usePlus && Number(count || 0) >= 100 ? "+" : ""}`;
    return `${countText} reviews`;
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

  const LOCATION_INFO_RE = /\b(location|nearby|attractions?|airport|beach|station|subway|metro|train|transit|walking|walkable|walk|mile|mi\b|ft\b|address|michigan avenue|loop|west loop|wicker park|gold coast|river north|streeterville|magnificent mile|fulton market|millennium|cloud gate|navy pier|willis tower|united center|art institute|state\/lake|ogilvie|clark\/division|morgan|damen)\b/i;

  function isLocationInfoText(value) {
    return LOCATION_INFO_RE.test(String(value || ""));
  }

  function visibleFacts(hotel) {
    return (hotel.facts || []).filter(fact => {
      const text = String(fact || "");
      return !isLocationInfoText(text) && !/^Overall guest score\b/i.test(text) && !/^Guest rating\b/i.test(text);
    });
  }

  function visibleAboutSections(hotel) {
    if (hotel.id === "pendry-chicago") return hotel.aboutSections || [];
    return (hotel.aboutSections || []).filter(section => !isLocationInfoText(`${section.title || ""} ${section.text || ""}`));
  }

  function displayFact(item) {
    const text = String(item || "");
    const ratingMatch = text.match(/^Tripadvisor lists a ([\d.]+)\/5 traveler rating from ([\d,]+) reviews\.$/);
    if (ratingMatch) return `Guest rating: ${bookingScore(ratingMatch[1])}/10 from ${ratingMatch[2]} reviews.`;
    return text
      .replace(/^Tripadvisor classifies the property as /, "")
      .replace(/^Tripadvisor lists the address as /, "")
      .replace(/^Tripadvisor lists the style as /, "Style: ")
      .replace(/^Tripadvisor lists /, "Property details: ")
      .replace(/^Tripadvisor notes /, "Property details: ");
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

  function visibleHotels() {
    if (!randomizedVisibleHotelIds) {
      randomizedVisibleHotelIds = persistedVisibleHotelIds();
    }
    const hotelById = new Map(HOTELS.map(hotel => [hotel.id, hotel]));
    return randomizedVisibleHotelIds.map(id => hotelById.get(id)).filter(Boolean);
  }

  function balancedReviewCount() {
    if (balancedVisibleReviewCount !== null) return balancedVisibleReviewCount;
    const counts = requiredHotelIds()
      .map(id => exactReviewsFor(id).length)
      .filter(count => count > 0);
    balancedVisibleReviewCount = counts.length ? Math.min(...counts) : 0;
    return balancedVisibleReviewCount;
  }

  function balancedReviews(hotel) {
    const reviews = Array.isArray(hotel.reviews) ? hotel.reviews : [];
    const limit = balancedReviewCount();
    if (limit <= 0) return reviews;

    const priorities = REVIEW_PRIORITY_BY_HOTEL[hotel.id] || [];
    const priorityKeys = new Set(priorities.map(([reviewer, reviewed]) => `${reviewer}|${reviewed}`));
    const byKey = new Map(reviews.map(review => [`${normalizedReviewerName(review.reviewer)}|${review.reviewed || ""}`, review]));
    const prioritized = priorities.map(([reviewer, reviewed]) => byKey.get(`${reviewer}|${reviewed}`)).filter(Boolean);
    const remainder = reviews.filter(review => {
      const key = `${normalizedReviewerName(review.reviewer)}|${review.reviewed || ""}`;
      return !priorityKeys.has(key);
    });
    return prioritized.concat(remainder).slice(0, limit);
  }

  function renderVersionLinks() {
    const { showReviews } = pageState();
    document.querySelectorAll("[data-version-link]").forEach(link => {
      const target = link.getAttribute("data-version-link");
      link.classList.toggle("is-active", (target === "with") === showReviews);
    });
  }

  function trackHotelPopupInventory() {
    if (typeof window.HOTEL_EXPERIMENT_TRACK !== "function") return;
    const hotelIds = visibleHotels().map(hotel => hotel.id);
    window.HOTEL_EXPERIMENT_TRACK("popup_inventory", "hotel_popups", {
      popup_type: "hotel",
      hotel_ids: hotelIds
    });
  }

  function surveyQueryString(nextStage) {
    const params = new URLSearchParams(location.search || "");
    if (nextStage) params.set("survey_stage", nextStage);
    const query = params.toString();
    return query ? `?${query}` : "";
  }

  function browseCountdownStorageKey() {
    return `${BROWSE_COUNTDOWN_STATE_KEY}:${studyRunStorageSuffix()}:${pageState().phase}`;
  }

  function nextSurveyHref() {
    const state = pageState();
    if (!state.showReviews) return `index.html${surveyQueryString("hotel_questionnaire")}#hq1`;
    return `index.html${surveyQueryString(state.showAiSummary ? "post_review_ai" : "post_review")}#pr1`;
  }

  function formatCountdown(milliseconds) {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function markStageCompleteForCountdown() {
    const viewedState = {
      viewedHotelIds: requiredHotelIds(),
      updatedAt: new Date().toISOString(),
      completedByTimeLimit: true
    };
    if (pageState().showReviews) setHotelReviewViewState(viewedState);
    else setHotelViewState(viewedState);
  }

  function expireBrowseCountdown() {
    if (browseCountdownTimer) {
      clearInterval(browseCountdownTimer);
      browseCountdownTimer = null;
    }
    const timer = document.getElementById("browseCountdown");
    if (timer) {
      timer.classList.add("is-expired");
      const value = timer.querySelector("[data-countdown-value]");
      if (value) value.textContent = "0:00";
    }
    markStageCompleteForCountdown();
    logEvent("browse_countdown_expired", {
      phase: pageState().phase,
      seconds: BROWSE_COUNTDOWN_SECONDS,
      next: nextSurveyHref()
    });
    location.replace(nextSurveyHref());
  }

  function startBrowseCountdown() {
    const timer = document.getElementById("browseCountdown");
    if (!timer) return;
    const key = browseCountdownStorageKey();
    let deadline = Number(localStorage.getItem(key) || 0);
    if (!Number.isFinite(deadline) || deadline <= 0) {
      deadline = Date.now() + BROWSE_COUNTDOWN_SECONDS * 1000;
      localStorage.setItem(key, String(deadline));
      logEvent("browse_countdown_started", {
        phase: pageState().phase,
        seconds: BROWSE_COUNTDOWN_SECONDS
      });
    }

    const renderCountdown = () => {
      const remaining = deadline - Date.now();
      const value = timer.querySelector("[data-countdown-value]");
      if (value) value.textContent = formatCountdown(remaining);
      timer.classList.toggle("is-urgent", remaining > 0 && remaining <= 30000);
      if (remaining <= 0) expireBrowseCountdown();
    };

    renderCountdown();
    if (Date.now() < deadline) browseCountdownTimer = window.setInterval(renderCountdown, 1000);
  }

  function renderStudyFlowCta() {
    const results = document.getElementById("results");
    if (!results) return;

    const state = pageState();
    let box = document.getElementById("studyFlowCta");
    if (!box) {
      box = document.createElement("div");
      box.id = "studyFlowCta";
      results.insertAdjacentElement("afterend", box);
    }
    box.id = "studyFlowCta";
    box.className = "study-flow";

    if (state.showReviews) {
      const postReviewStage = state.showAiSummary ? "post_review_ai" : "post_review";
      const href = `index.html${surveyQueryString(postReviewStage)}#pr1`;
      const viewed = viewedReviewHotelSet();
      const required = requiredHotelIds();
      const viewedCount = required.filter(id => viewed.has(id)).length;
      const unlocked = viewedCount >= required.length;
      const popupLabel = state.showAiSummary ? "review and AI-summary popups" : "review popups";
      box.innerHTML = unlocked ? `
        <div>
          <strong>Post-review questions unlocked:</strong>
          You have opened ${popupLabel} for all 3 hotels.
        </div>
        <button class="btn study-flow__btn" type="button" data-flow-continue="${escapeXml(href)}">Continue to post-review questions</button>
      ` : `
        <div>
          <strong>Post-review questions locked:</strong>
          Open the ${state.showAiSummary ? "reviews and AI summary" : "reviews"} for each of the 3 hotels before continuing.
          <div class="study-flow__note">Completed ${formatCount(viewedCount)} of ${formatCount(required.length)} ${popupLabel}.</div>
        </div>
        <button class="btn study-flow__btn" type="button" disabled>Continue to post-review questions</button>
      `;
    } else {
      const href = `index.html${surveyQueryString("hotel_questionnaire")}#hq1`;
      const viewed = viewedHotelSet();
      const required = requiredHotelIds();
      const viewedCount = required.filter(id => viewed.has(id)).length;
      const unlocked = viewedCount >= required.length;
      box.innerHTML = unlocked ? `
        <div>
          <strong>Hotel questions unlocked:</strong>
          You have opened all 3 hotel detail popups.
        </div>
        <button class="btn study-flow__btn" type="button" data-flow-continue="${escapeXml(href)}">Continue to hotel questions</button>
      ` : `
        <div>
          <strong>Hotel questions locked:</strong>
          Open each hotel detail popup before continuing.
          <div class="study-flow__note">Completed ${formatCount(viewedCount)} of ${formatCount(required.length)} hotel popups.</div>
        </div>
        <button class="btn study-flow__btn" type="button" disabled>Continue to hotel questions</button>
      `;
    }
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
        coverText.textContent = state.showAiSummary
          ? "Participants see an AI-generated summary followed by the complete set of individual guest reviews."
          : state.showReviews
            ? "Full Reviews Control: participants read guest ratings and individual review excerpts. No AI summary is shown in this version."
          : "Guest ratings and reviews are not displayed in this version.";
      }
      const coverTitle = coverStory.querySelector(".callout__title");
      if (coverTitle) coverTitle.textContent = state.showReviews ? "Information treatment:" : "Hotel information:";
    }

    const hotels = visibleHotels();
    const completedNoReviewViews = state.showReviews ? new Set() : viewedHotelSet();
    const results = document.getElementById("results");
    results.innerHTML = "";

    for (const h of hotels) {
      const card = document.createElement("article");
      card.className = "card card--text";
      card.setAttribute("data-hotel-id", h.id);

      const displayedReviewCount = state.showReviews ? balancedReviews(h).length : h.guestReviewCount;
      const displayedReviewCountLabel = reviewCountLabel(displayedReviewCount, false);
      const scoreBox = state.showReviews ? `
        <div class="booking-reviewcount booking-reviewcount--standalone">${escapeXml(displayedReviewCountLabel)}</div>
      ` : "";

      const isCompletedNoReviewView = !state.showReviews && completedNoReviewViews.has(h.id);

      card.innerHTML = `
        <div class="card__body">
          <div>
            <h3 class="hotel-title">${escapeXml(h.name)}</h3>
            ${state.showReviews ? "" : hotelListingPreviewHtml()}
          </div>

          <div class="priceBox priceBox--text">
            ${scoreBox}
            <div>
              <div class="price price--words">$${h.priceNightly}</div>
              <div class="per">per night, including taxes and fees</div>
              <div class="stay-total">$${h.priceNightly * 3} total for 3 nights</div>
            </div>
            <div class="cta">
              <button class="btn" type="button" data-open="${h.id}">${state.showReviews ? "Read reviews" : (isCompletedNoReviewView ? "View again" : "View details")}</button>
            </div>
          </div>
        </div>
      `;

      results.appendChild(card);
    }
    renderStudyFlowCta();
  }

  function hotelListingPreviewHtml() {
    return `
      <div class="booking-roomline">One selected room option available for this listing</div>
    `;
  }

  function ratingBreakdownRows(hotel) {
    const b = hotel.ratingBreakdown;
    if (!b) return "";
    return Object.keys(b).filter(k => !isLocationInfoText(k)).map(k => `
      <div class="breakdown__row">
        <span class="breakdown__k">${escapeXml(k)}</span>
        <span class="breakdown__v">${escapeXml(bookingScore(b[k]))}</span>
      </div>
    `).join("");
  }

  function detailNotesHtml(hotel) {
    const notes = Array.isArray(hotel.detailNotes)
      ? hotel.detailNotes.filter(note => {
        const normalized = String(note || "").toLowerCase();
        const distancePrefix = ["distance", "in", "property", "description"].join(" ");
        const mapProvider = ["open", "street", "map"].join("");
        return !(normalized.startsWith(distancePrefix) && normalized.includes(mapProvider));
      })
      : [];
    if (!notes.length) return "";
    return `
      <div class="property-detail-notes">
        ${notes.map((note, index) => `
          <p class="${index === notes.length - 1 ? "is-muted" : ""}">${escapeXml(note)}</p>
        `).join("")}
      </div>
    `;
  }

  function categoryBarsHtml(hotel) {
    const b = hotel.ratingBreakdown;
    if (!b) return "";
    const entries = Object.keys(b).map(key => {
      const score = Number(bookingScore(b[key]));
      const width = Math.max(0, Math.min(100, score * 10));
      return { key, score: score.toFixed(1), width };
    });
    if (!entries.length) return "";
    return `
      <div class="section property-category-section" data-track-section="guest_rating_categories">
        <h3>Categories:</h3>
        <div class="category-bars">
          ${entries.map(item => `
            <div class="category-bar">
              <div class="category-bar__head">
                <span>${escapeXml(item.key)}</span>
                <strong>${escapeXml(item.score)}</strong>
              </div>
              <div class="category-bar__track" aria-hidden="true">
                <span style="width:${item.width}%"></span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function reviewStatusText(visible, total) {
    return "";
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
      positive: cleanReviewComment(positive),
      negative: cleanReviewComment(negative)
    };
  }

  function normalizedReviewerName(value) {
    const name = String(value || "").trim();
    return REVIEWER_NAME_FIXES[name] || name;
  }

  function cleanReviewComment(value) {
    const text = stripEmoji(value).trim();
    return REVIEW_MEDIA_CAPTIONS.some(pattern => pattern.test(text)) ? "" : text;
  }

  function reviewDisplay(review) {
    const chips = Array.isArray(review.chips) ? review.chips : [];
    const room = review.room || chips.find(c => !isGuestTypeChip(c) && !isStayChip(c)) || "";
    const stay = review.stay || chips.find(isStayChip) || "";
    const guestType = review.guestType || chips.find(isGuestTypeChip) || "";
    const reviewer = normalizedReviewerName(review.reviewer || review.who || "Guest reviewer");
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
    return `
      <article
        class="review"
        data-review="1"
        data-review-index="${index}"
        data-review-position="${index + 1}"
        data-review-id="${escapeXml(review.stimulusId || "")}"
        ${index >= initialVisible ? "hidden" : ""}>
        <aside class="review__guest">
          <div class="review__name">${escapeXml(r.reviewer)}</div>
        </aside>
        <div class="review__body">
          ${r.reviewed ? `
            <div class="review__topline">
              <div class="review__date">Reviewed: ${escapeXml(r.reviewed)}</div>
            </div>
          ` : ""}
          ${r.title ? `<h3 class="review__title">${escapeXml(r.title)}</h3>` : ""}
          <div class="review__copy">
            ${reviewTextBlockHtml("positive", r.positive)}
            ${reviewTextBlockHtml("negative", r.negative)}
          </div>
        </div>
      </article>
    `;
  }

  function aiReviewSummaryHtml(hotel) {
    const summary = AI_REVIEW_SUMMARIES[hotel.id];
    if (!summary) return "";
    const currentReviews = balancedReviews(hotel);
    const reviewCount = currentReviews.length;
    const latestReview = currentReviews
      .map(review => ({ label: review.reviewed || review.when || "", time: Date.parse(review.reviewed || review.when || "") }))
      .filter(review => review.label && Number.isFinite(review.time))
      .sort((a, b) => b.time - a.time)[0];
    const corpusLabel = latestReview
      ? `${formatCount(reviewCount)} reviews summarized · Current through ${latestReview.label}`
      : `${formatCount(reviewCount)} reviews summarized`;
    const listHtml = items => items.map(item => `<li>${escapeXml(item)}</li>`).join("");

    return `
      <section class="ai-review-summary" data-track-section="ai_review_summary" aria-labelledby="aiSummaryTitle-${escapeXml(hotel.id)}">
        <div class="ai-review-summary__head">
          <div>
            <div class="ai-review-summary__label">AI-generated review summary</div>
            <h3 id="aiSummaryTitle-${escapeXml(hotel.id)}">What guests consistently mention</h3>
          </div>
          <div class="ai-review-summary__count">${escapeXml(corpusLabel)}</div>
        </div>
        <p class="ai-review-summary__overview">${escapeXml(summary.overview)}</p>
        <div class="ai-review-summary__grid">
          <div class="ai-review-summary__section">
            <h4>Common strengths</h4>
            <ul>${listHtml(summary.strengths)}</ul>
          </div>
          <div class="ai-review-summary__section">
            <h4>Things to consider</h4>
            <ul>${listHtml(summary.considerations)}</ul>
          </div>
        </div>
        <p class="ai-review-summary__note">This AI-generated summary covers the current review corpus shown below and may miss nuance. Read the individual reviews for details.</p>
      </section>
    `;
  }

  function reviewsHtml(hotel) {
    const reviews = balancedReviews(hotel);
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
        <div class="reviews__list" data-review-list>
          ${reviews.map((review, index) => reviewCardHtml(review, index, initialVisible)).join("")}
        </div>
      </div>
    `;
  }

  function factList(items) {
    if (!items.length) return "";
    return `
      <ul class="fact-list">
        ${items.map(item => `<li>${escapeXml(displayFact(item))}</li>`).join("")}
      </ul>
    `;
  }

  function aboutSectionsHtml(hotel) {
    const sections = visibleAboutSections(hotel);
    if (!sections.length) {
      return `
        <div class="property-summary">
        </div>
      `;
    }

    return `
      <div class="property-summary">
        <div class="about-card-grid">
          ${sections.map(section => `
            <div class="about-card">
              <h4>${escapeXml(section.title)}</h4>
              <p>${escapeXml(section.text)}</p>
            </div>
          `).join("")}
        </div>
        ${detailNotesHtml(hotel)}
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
    if (state.showReviews) {
      return `
        <div class="modal-backdrop" data-close="1"></div>
        <div class="modal modal--reviews-only" role="dialog" aria-modal="true" aria-label="${escapeXml(hotel.name)} reviews">
          <div class="modal__top">
            <h2 class="modal__title">${escapeXml(hotel.name)}</h2>
            <div class="modal__top-actions">
              <button class="btn2 shopper-profile-button" type="button" data-view-shopper-profile>View your shopper profile</button>
              <button class="xbtn" type="button" data-close="1" aria-label="Close">x</button>
            </div>
          </div>
          <div class="modal-warning" data-review-warning role="alert" hidden>
            You have been viewing this review popup for more than 5 minutes. Please continue when you are ready.
          </div>
          <div class="modal__scroll" id="hotelModalScroll" data-hotel-scroll="1">
            ${state.showAiSummary ? aiReviewSummaryHtml(hotel) : ""}
            ${reviewsHtml(hotel)}
          </div>
        </div>
      `;
    }

    const facts = visibleFacts(hotel);
    return `
      <div class="modal-backdrop" data-close="1"></div>
      <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeXml(hotel.name)} details">
        <div class="modal__top">
          <div>
            <h2 class="modal__title">${escapeXml(hotel.name)}</h2>
            <div class="brand-pill">${escapeXml(hotel.brand)}</div>
          </div>
          <div class="modal__top-actions">
            <button class="btn2 shopper-profile-button" type="button" data-view-shopper-profile>View your shopper profile</button>
            <button class="xbtn" type="button" data-close="1" aria-label="Close">x</button>
          </div>
        </div>

        <div class="modal__scroll" id="hotelModalScroll" data-hotel-scroll="1">
          <div class="modal__grid${state.showReviews ? "" : " modal__grid--single"}">
            <div class="modal__left">
              <div class="section">
                <h3>About this property</h3>
                <div data-track-section="description" class="track-slice">
                  ${aboutSectionsHtml(hotel)}
                </div>
              </div>

              ${facts.length ? `<div class="section" data-track-section="facts">
                ${factList(facts)}
              </div>` : ""}

              <div class="section" data-track-section="amenities">
                <h3>Most popular amenities</h3>
                <div class="amenities">
                  ${hotel.amenities.map(a => amenityChipHtml(a)).join("")}
                </div>
              </div>
              ${!state.showReviews && ["pendry-chicago", "nobu-hotel-chicago", "arlo-chicago"].includes(hotel.id) ? categoryBarsHtml(hotel) : ""}
            </div>

          </div>
          ${amenityDetailsHtml(hotel)}
          ${state.showReviews ? reviewsHtml(hotel) : ""}
        </div>
      </div>
    `;
  }

  function clearReviewWarningTimer() {
    if (reviewWarningTimer) {
      clearTimeout(reviewWarningTimer);
      reviewWarningTimer = null;
    }
  }

  function startReviewWarningTimer(hotelId) {
    clearReviewWarningTimer();
    reviewWarningTimer = window.setTimeout(() => {
      if (!activeHotelSession || activeHotelSession.hotelId !== hotelId) return;
      if (!pageState().showReviews) return;
      const root = document.getElementById("modalRoot");
      const warning = root && root.querySelector("[data-review-warning]");
      if (warning) warning.hidden = false;
      logEvent("review_popup_time_warning", { hotelId, seconds: REVIEW_WARNING_SECONDS });
    }, REVIEW_WARNING_SECONDS * 1000);
  }

  function openHotelModal(hotelId, source) {
    const hotel = HOTELS.find(h => h.id === hotelId);
    if (!hotel) {
      if ((location.hash || "").startsWith("#hotel/")) location.hash = "#results";
      return;
    }

    const page = pageState();

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
    clearReviewWarningTimer();

    root.setAttribute("data-active-hotel", hotelId);
    root.removeAttribute("data-active-map");
    root.innerHTML = modalTemplate(hotel);
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const targetHash = "#hotel/" + hotelId;
    if (location.hash !== targetHash) location.hash = targetHash;

    logEvent("open_hotel", {
      hotelId,
      source,
      reviews: page.showReviews,
      aiSummary: page.showAiSummary
    });
    if (page.showAiSummary) {
      logEvent("ai_review_summary_shown", {
        hotelId,
        reviewCount: balancedReviews(hotel).length
      });
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

    root.querySelectorAll("[data-amenity]").forEach(a => {
      a.addEventListener("mouseenter", () => logEvent("amenity_hover", { hotelId, amenity: a.getAttribute("data-amenity") }));
      a.addEventListener("click", () => logEvent("amenity_click", { hotelId, amenity: a.getAttribute("data-amenity") }));
    });

    if (page.showReviews) startReviewWarningTimer(hotelId);

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

  }

  function closeModal(source) {
    const root = document.getElementById("modalRoot");
    if (!root.classList.contains("is-open")) return;
    let shouldRenderAfterClose = false;

    if (activeHotelSession) {
      const page = pageState();
      if (!page.showReviews && !viewedHotelSet().has(activeHotelSession.hotelId)) {
        markNoReviewHotelViewed(activeHotelSession.hotelId, "detail_modal_closed");
        shouldRenderAfterClose = true;
      }
      if (page.showReviews && !viewedReviewHotelSet().has(activeHotelSession.hotelId)) {
        markReviewHotelViewed(activeHotelSession.hotelId, "review_modal_closed");
        shouldRenderAfterClose = true;
      }

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
    clearReviewWarningTimer();

    root.classList.remove("is-open");
    root.removeAttribute("data-active-hotel");
    root.removeAttribute("data-active-map");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = "";
    document.body.style.overflow = "";
    if ((location.hash || "").startsWith("#hotel/") || (location.hash || "").startsWith("#map/")) location.hash = "#results";
    logEvent("close_modal", { source });
    if (shouldRenderAfterClose) renderResults();
  }

  function wireGlobalHandlers() {
    const state = pageState();
    const phaseLabel = document.getElementById("phaseLabel");
    const condLabel = document.getElementById("condLabel");
    if (phaseLabel) phaseLabel.textContent = state.versionLabel;
    if (condLabel) condLabel.textContent = "Chicago";
    renderVersionLinks();
    renderStudyFlowCta();

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

      const close = e.target && e.target.closest && e.target.closest("[data-close='1']");
      if (close) {
        closeModal("click");
        return;
      }

      const flowContinue = e.target && e.target.closest && e.target.closest("[data-flow-continue]");
      if (flowContinue) {
        const href = flowContinue.getAttribute("data-flow-continue");
        logEvent("study_flow_continue", { href, phase: pageState().phase });
        location.replace(href);
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
        const modalRoot = document.getElementById("modalRoot");
        if (modalRoot && modalRoot.classList.contains("is-open") && modalRoot.getAttribute("data-active-hotel") === id) return;
        openHotelModal(id, "deeplink");
      }
      if (h.startsWith("#map/")) {
        location.hash = "#results";
      }
    });
  }

  function init() {
    renderResults();
    trackHotelPopupInventory();
    wireGlobalHandlers();
    startBrowseCountdown();

    logEvent("page_load", {
      phase: pageState().phase,
      reviews: pageState().showReviews,
      aiSummary: pageState().showAiSummary,
      city: "Chicago"
    });

    const h = location.hash || "";
    if (h.startsWith("#hotel/")) {
      const id = h.split("/")[1];
      openHotelModal(id, "deeplink");
    }
    if (h.startsWith("#map/")) {
      location.hash = "#results";
    }
  }

  window.addEventListener("pagehide", () => {
    if (browseCountdownTimer) clearInterval(browseCountdownTimer);
  });

  init();
})();
