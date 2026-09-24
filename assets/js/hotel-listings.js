(() => {
  const STORAGE_KEY = "mock_hotel_logs_v2";
  const UI_STATE_KEY = "mock_hotel_ui_state_v1";
  const HOTEL_VIEW_STATE_KEY = "mock_hotel_no_review_views_v1";
  const HOTEL_REVIEW_VIEW_STATE_KEY = "mock_hotel_review_views_v1";
  const HOTEL_AI_REVIEW_VIEW_STATE_KEY = "mock_hotel_ai_review_views_v1";
  const HOTEL_ORDER_STATE_KEY = "mock_hotel_visible_order_v1";
  const POPUP_TIME_STATE_KEY = "hotel_popup_time_45_v1";
  const POPUP_TIME_LIMIT_MS = 45000;
  const POPUP_MINIMUM_MS = 10000;

  let activeHotelSession = null;
  let modalScrollCleanup = null;
  let visibleHotelIds = null;
  let balancedVisibleReviewCount = null;
  let popupCountdownTimer = null;
  const REVIEW_INITIAL_VISIBLE = 12;
  const REVIEW_BATCH_VISIBLE = 24;

  const EMBEDDED_EXACT_HOTEL_REVIEWS = {
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
        "title": "excellent, I give it a 20/10. if I travel to Chicago again, I’ll most definitely book Hotel B again",
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
        "positive": "This property is absolutely amazing from the staff, cleanliness, location, convenience, absolutely everything was amazing! The staff was so accommodating and made us feel so welcomed! I will always be staying with Hotel B going forward.",
        "negative": "",
        "body": "This property is absolutely amazing from the staff, cleanliness, location, convenience, absolutely everything was amazing! The staff was so accommodating and made us feel so welcomed! I will always be staying with Hotel B going forward."
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
        "title": "I will continue to seek out Hotel B hotels in my future travel. Five stars isn’t enough.",
        "positive": "The food and cocktails at the Hotel B restaurant and rooftop was exceptional.",
        "negative": "Everything smacked of perfection.",
        "body": "The food and cocktails at the Hotel B restaurant and rooftop was exceptional.\nEverything smacked of perfection."
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
        "title": "Would definitely stay at Hotel A again if in Chicago.",
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
    const stored = safeJsonParse(localStorage.getItem(hotelOrderStorageKey()), []);
    if (JSON.stringify(stored) !== JSON.stringify(required)) {
      localStorage.setItem(hotelOrderStorageKey(), JSON.stringify(required));
      logEvent("hotel_order_fixed", { hotelIds: required });
    }
    return required;
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
    return ["arlo-chicago", "nobu-hotel-chicago"].filter(id => VISIBLE_HOTEL_IDS.has(id));
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
          "id": "nobu-hotel-chicago",
          "name": "Hotel B",
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
          "about": "Hotel B offers luxurious rooms with private bathrooms, free WiFi and modern amenities in Chicago's West Loop. Guests can use the sauna, fitness center, indoor swimming pool and steam room, with Japanese and Asian dining on site.",
          "aboutSections": [
              {
                  "title": "Elegant accommodations",
                  "text": "Hotel B offers luxurious rooms with private bathrooms, free WiFi and modern amenities. Guests enjoy a sauna, fitness center, indoor swimming pool and steam room."
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
              "Comfortable room": 4.75,
              "Wi-Fi reliability": 4.0,
              "Low Noise level (quietness)": 4.5,
              "Convenient location": 3.25,
              "Fitness facilities": 3.0,
              "High-quality breakfast": 2.75
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
                      ["Restaurant - Hotel B", "150 ft"]
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
          "name": "Hotel A",
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
                  "text": "Located in Chicago, less than a 5-minute walk to Millennium Park and Cloud Gate - The Bean, Hotel A provides a fitness center and an on-site restaurant. The property is within walking distance to CIBC Theater, Bank of America Theater and Art Institute of Chicago."
              },
              {
                  "title": "Guest rooms",
                  "text": "All rooms are fitted with a desk, a flat-screen TV and a private bathroom. All rooms also provide guests with a fridge."
              },
              {
                  "title": "Breakfast and dining",
                  "text": "An American breakfast is available every morning at Hotel A. About Last Knife, the on-site steakhouse restaurant, offers American, seafood and local cuisine."
              },
              {
                  "title": "Front desk guidance",
                  "text": "When guests need guidance on where to visit, the reception will be happy to provide advice."
              },
              {
                  "title": "Nearby attractions",
                  "text": "Chicago Symphony Orchestra and Shops at Northbridge are less than a 10-minute walk away. DePaul University is less than 0.6 mi from Hotel A, while Chicago Board of Trade Building is a 12-minute walk from the property."
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
              "Comfortable room": 3.25,
              "Wi-Fi reliability": 4.75,
              "Low Noise level (quietness)": 3.5,
              "Convenient location": 4.25,
              "Fitness facilities": 4.5,
              "High-quality breakfast": 3.75
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
    "nobu-hotel-chicago",
    "arlo-chicago"
  ]);

  const AI_REVIEW_SUMMARIES = {
"nobu-hotel-chicago": {
      overview: "Across the current 150-review set, guests most consistently praise Hotel B's service, room comfort, quiet rooms, and Wi-Fi. Cleanliness, location convenience, fitness facilities, and breakfast are more mixed.",
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
      overview: "Across the current 150-review set, guests most consistently praise Hotel A's Wi-Fi, fitness facilities, location, and cleanliness. Service and room comfort receive the most uneven feedback.",
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
    if (!visibleHotelIds) {
      visibleHotelIds = persistedVisibleHotelIds();
    }
    const hotelById = new Map(HOTELS.map(hotel => [hotel.id, hotel]));
    return visibleHotelIds.map(id => hotelById.get(id)).filter(Boolean);
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
    // Shared, fixed ordering for every participant and both review conditions.
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

  function formatCountdown(milliseconds) {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function popupTimeStorageKey(hotelId) {
    return `${POPUP_TIME_STATE_KEY}:${studyRunStorageSuffix()}:${pageState().phase}:${hotelId}`;
  }

  function popupUsedMs(hotelId) {
    const saved = safeJsonParse(localStorage.getItem(popupTimeStorageKey(hotelId)), {}) || {};
    const elapsed = saved.startedAt ? Math.max(0, Date.now() - saved.startedAt) : 0;
    return Math.min(POPUP_TIME_LIMIT_MS, Math.max(0, Number(saved.usedMs) || 0) + elapsed);
  }

  function stopPopupCountdown() {
    clearInterval(popupCountdownTimer);
    popupCountdownTimer = null;
    if (!activeHotelSession) return;
    const hotelId = activeHotelSession.hotelId;
    localStorage.setItem(popupTimeStorageKey(hotelId), JSON.stringify({ usedMs: popupUsedMs(hotelId), startedAt: null }));
  }

  function startPopupCountdown(hotelId) {
    clearInterval(popupCountdownTimer);
    const usedMs = popupUsedMs(hotelId);
    localStorage.setItem(popupTimeStorageKey(hotelId), JSON.stringify({ usedMs, startedAt: document.hidden ? null : Date.now() }));
    const update = () => {
      if (!activeHotelSession || activeHotelSession.hotelId !== hotelId) return;
      const remaining = POPUP_TIME_LIMIT_MS - popupUsedMs(hotelId);
      const minimumRemaining = Math.max(0, POPUP_MINIMUM_MS - popupUsedMs(hotelId));
      const timer = document.querySelector("[data-popup-countdown]");
      if (timer) {
        timer.querySelector("[data-countdown-value]").textContent = formatCountdown(remaining);
        timer.classList.toggle("is-urgent", remaining <= 10000);
        timer.classList.toggle("is-locked", minimumRemaining > 0);
        timer.querySelector("[data-minimum-countdown]").textContent = minimumRemaining > 0
          ? `You can close this popup in ${Math.ceil(minimumRemaining / 1000)} seconds.`
          : "Minimum viewing time met. You can close this popup.";
      }
      document.querySelectorAll("#modalRoot button[data-close='1']").forEach(button => {
        button.disabled = minimumRemaining > 0;
        button.setAttribute("aria-label", minimumRemaining > 0 ? "Close (available after 10 seconds of viewing)" : "Close");
      });
      if (remaining <= 0) closeModal("popup_time_limit");
    };
    popupCountdownTimer = window.setInterval(update, 200);
    update();
  }

  function popupCountdownHtml() {
    return `<div class="browse-countdown popup-countdown" data-popup-countdown>
      <div class="popup-countdown__instructions">
        <span>View each hotel for at least 10 seconds. Maximum: 45 seconds total.</span>
        <span class="popup-countdown__minimum" data-minimum-countdown></span>
      </div>
      <div class="popup-countdown__remaining" role="timer" aria-label="Viewing time remaining">
        <span>Time remaining</span><strong data-countdown-value>0:45</strong>
      </div>
    </div>`;
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
    box.className = "study-flow study-flow--actions";

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
          You have opened ${popupLabel} for both hotels.
        </div>
        <button class="btn study-flow__btn" type="button" data-flow-continue="${escapeXml(href)}">Continue to post-review questions</button>
      ` : `
        <div>
          <strong>Post-review questions locked:</strong>
          Open the ${state.showAiSummary ? "reviews and AI summary" : "reviews"} for both hotels and view each for at least 10 seconds before continuing.
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
          You have opened both hotel detail popups.
        </div>
        <button class="btn study-flow__btn" type="button" data-flow-continue="${escapeXml(href)}">Continue to hotel questions</button>
      ` : `
        <div>
          <strong>Hotel questions locked:</strong>
          Open each hotel detail popup and view it for at least 10 seconds before continuing.
          <div class="study-flow__note">Completed ${formatCount(viewedCount)} of ${formatCount(required.length)} hotel popups.</div>
        </div>
        <button class="btn study-flow__btn" type="button" disabled>Continue to hotel questions</button>
      `;
    }
    let status = document.getElementById("studyFlowStatus");
    if (!status) {
      status = document.createElement("div");
      status.id = "studyFlowStatus";
      status.className = "study-flow study-flow--status";
      status.setAttribute("role", "status");
      results.insertAdjacentElement("beforebegin", status);
    }
    status.replaceChildren(box.firstElementChild);
    status.classList.toggle("is-locked", box.querySelector("button").disabled);
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
            <h3 class="hotel-title"><button class="hotel-title__link" type="button" data-open="${h.id}" ${popupUsedMs(h.id) >= POPUP_TIME_LIMIT_MS ? "disabled" : ""}>${escapeXml(h.name)}</button></h3>
          </div>

          <div class="priceBox priceBox--text">
            ${scoreBox}
            <div>
              <div class="price price--words">$${h.priceNightly}</div>
              <div class="per">per night, including taxes and fees</div>
              <div class="stay-total">$${h.priceNightly * 3} total for 3 nights</div>
            </div>
            <div class="cta">
              <button class="btn" type="button" data-open="${h.id}" ${popupUsedMs(h.id) >= POPUP_TIME_LIMIT_MS ? "disabled" : ""}>${popupUsedMs(h.id) >= POPUP_TIME_LIMIT_MS ? "Viewing time used" : state.showReviews ? "Read reviews" : (isCompletedNoReviewView ? "View again" : "View details")}</button>
            </div>
          </div>
        </div>
      `;

      results.appendChild(card);
    }
    renderStudyFlowCta();
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
          ${popupCountdownHtml()}
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

        ${popupCountdownHtml()}
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
              ${!state.showReviews && VISIBLE_HOTEL_IDS.has(hotel.id) ? categoryBarsHtml(hotel) : ""}
            </div>

          </div>
          ${amenityDetailsHtml(hotel)}
          ${state.showReviews ? reviewsHtml(hotel) : ""}
        </div>
      </div>
    `;
  }

  function openHotelModal(hotelId, source) {
    const hotel = HOTELS.find(h => h.id === hotelId);
    if (!hotel || !VISIBLE_HOTEL_IDS.has(hotelId) || popupUsedMs(hotelId) >= POPUP_TIME_LIMIT_MS) {
      if ((location.hash || "").startsWith("#hotel/")) location.hash = "#results";
      return;
    }

    const page = pageState();

    if (activeHotelSession && !closeModal("hotel_switch")) {
      location.hash = "#hotel/" + activeHotelSession.hotelId;
      return;
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

    startPopupCountdown(hotelId);

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
    if (!root.classList.contains("is-open")) return true;
    if (activeHotelSession && popupUsedMs(activeHotelSession.hotelId) < POPUP_MINIMUM_MS) return false;
    stopPopupCountdown();
    if (typeof window.HOTEL_EXPERIMENT_FINALIZE_MODAL === "function") window.HOTEL_EXPERIMENT_FINALIZE_MODAL(source);
    const profileClose = document.querySelector("#shopperProfileModalRoot.is-open [data-close-shopper-profile]");
    if (profileClose) profileClose.click();
    let shouldRenderAfterClose = source === "popup_time_limit";

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

    root.classList.remove("is-open");
    root.removeAttribute("data-active-hotel");
    root.removeAttribute("data-active-map");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = "";
    document.body.style.overflow = "";
    if ((location.hash || "").startsWith("#hotel/") || (location.hash || "").startsWith("#map/")) location.hash = "#results";
    logEvent("close_modal", { source });
    if (shouldRenderAfterClose) renderResults();
    return true;
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

    document.addEventListener("click", async (e) => {
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
        if (activeHotelSession) return;
        const href = flowContinue.getAttribute("data-flow-continue");
        let status = document.getElementById("browsingSaveStatus");
        if (!status) {
          status = document.createElement("p");
          status.id = "browsingSaveStatus";
          status.className = "survey-copy";
          status.setAttribute("role", "status");
          flowContinue.parentElement.appendChild(status);
        }
        flowContinue.disabled = true;
        flowContinue.textContent = "Saving...";
        status.textContent = "Saving your hotel browsing...";
        status.style.color = "";
        try {
          const stage = pageState().showReviews ? "reviews" : "information";
          await window.HotelSurveyStorage.browse(stage);
          logEvent("study_flow_continue", { href, phase: pageState().phase });
          location.replace(href);
        } catch (error) {
          status.textContent = error.message || "Browsing could not be saved. Please try again.";
          status.style.color = "#b42318";
          flowContinue.disabled = false;
          flowContinue.textContent = pageState().showReviews
            ? "Continue to post-review questions" : "Continue to hotel questions";
        }
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
    stopPopupCountdown();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopPopupCountdown();
    else if (activeHotelSession) startPopupCountdown(activeHotelSession.hotelId);
  });
  window.addEventListener("pageshow", event => {
    if (event.persisted && activeHotelSession) startPopupCountdown(activeHotelSession.hotelId);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
