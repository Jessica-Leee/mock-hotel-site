# Hotel survey site — deployment + tracking

## Live site

**https://chicago-hotel-survey.pages.dev/**

Hosted on Cloudflare Pages from the `main` branch of `Jessica-Leee/mock-hotel-site`. Automatic deployments are enabled. The previous GitHub Pages site at https://jessica-leee.github.io/mock-hotel-site/ remains available.

## Study URLs

- **Survey (entry):** https://chicago-hotel-survey.pages.dev/
- **Survey Summaries (summary condition):** https://chicago-hotel-survey.pages.dev/survey-summaries.html
- **Search without reviews:** https://chicago-hotel-survey.pages.dev/search-no-reviews.html?survey_stage=search_1
- **Search with reviews:** https://chicago-hotel-survey.pages.dev/search-reviews.html?survey_stage=search_2
- **Search with AI summaries:** https://chicago-hotel-survey.pages.dev/search-ai-summaries.html?survey_stage=search_3

`index.html` is the full-review survey entry page. `survey-summaries.html` starts the parallel summary survey using the existing numeric `study_version=3` parameter. The old `survey-ai-summaries.html` entry redirects to it, preserving incoming parameters. Internal condition identifiers and Google Sheets destinations remain unchanged. Participants can complete both versions in sequence. Hotel details are text-only; hotel photos and galleries are not rendered.

## Cloudflare Pages deployment

The shared hostname is `chicago-hotel-survey.pages.dev`, deployed and checked on September 21, 2026. The standard survey uses `/`, and Survey Summaries uses `/survey-summaries.html` (Cloudflare canonicalizes this to `/survey-summaries` before the entry redirects into the shared questionnaire with `study_version=3`). Both entries rendered the Student ID question successfully, and all three search pages and shared CSS/JS returned HTTP 200 and matched the repository source. This deployment check did not submit questionnaire answers or verify a new row in Google Sheets.

The existing `Jessica-Leee/mock-hotel-site` GitHub repository is connected through Pages. Configuration: project name `chicago-hotel-survey`, production branch `main`, framework preset `None`, build command `exit 0`, and build output directory `.`. The root directory is the repository root. No environment variables or new Apps Script deployment are needed for this entry-point change.

Keep both versions on this same origin. Browser-local survey progress and retry queues from GitHub Pages do not transfer to a new domain, so participants should finish an in-progress survey on its original domain. Matching Student IDs continue to provide paired backend identities; the Sheet schema and receiver URL have not changed. Before distributing the new URLs, verify both entries, their browsing pages, and delivery to the existing Sheet on the deployed hostname.

For paired data, open both versions with the same `STUDENT_ID` value. The two pages share one Cloudflare Pages origin, so the hidden random `survey_user_id` is reused for the same participant. Legacy `PROLIFIC_PID` links remain accepted, while `STUDY_ID`, `SESSION_ID`, and `submission_id` are not written to the analysis sheets.

## Project structure

```text
.
├── index.html                         # Main survey and questionnaires
├── survey-summaries.html              # Survey entry for the summary condition
├── survey-ai-summaries.html           # Compatibility redirect for previously shared links
├── search-no-reviews.html             # Hotel listings without reviews
├── search-reviews.html                # Hotel listings with reviews
├── search-ai-summaries.html           # Hotel listings with reviews and AI summaries
├── assets/
│   ├── css/site.css                   # Shared interface styles
│   └── js/
│       ├── hotel-listings.js          # Hotel data, exact reviews, summaries, and modal behavior
│       └── survey-tracking.js         # Behavioral event capture and delivery
└── backend/google-sheets-receiver.gs # Google Apps Script receiver and Sheet schema
```

The current experiment contains Hotel A (formerly Arlo) and Hotel B (formerly Nobu), each with 150 reviews. Pendry and the unused hotel datasets have been removed from the website. Each hotel popup has a cumulative 45-second budget per participant, condition, browsing run, and stage. Closing pauses the budget; reopening resumes it. Expiry closes and locks that popup. There is no listing-page countdown or automatic jump to the questionnaire. Participants can continue once both hotel popups have been opened and closed.

Schema 22 preserves the existing Sheet headers and historical rows, appending five columns to each survey sheet: `assigned_attribute_4_id` and the fourth pre-review and post-review likelihood answer for Hotel A and Hotel B. Existing three-attribute responses remain unchanged, with the new columns blank. The six legacy Pendry answer columns remain for compatibility but receive no new answers. Internal hotel IDs remain `arlo-chicago` (Hotel A) and `nobu-hotel-chicago` (Hotel B), so historical data still joins correctly. Do not reset the sheets for this update. Replace the Apps Script code and deploy a new version of the existing Web App before collecting four-attribute responses; the older receiver does not store the fourth attribute response for either hotel. The Student ID page includes a visually hidden optional honeypot expecting `wrong id`; filling it or entering that phrase as the Student ID sets the existing bot-detection fields. This is a signal for review, not proof of automated participation.

## Ensure multiple participants are recorded

Every participant’s browser sends events to a server endpoint (Google Apps Script Web App).
Because each participant makes their own HTTP requests, **multiple simultaneous users are fine**.

## Stream events to Google Sheets (real-time)

### 1) Create a Google Sheet

- Create a Google Sheet named anything you want.
- In the Sheet: **Extensions → Apps Script**
- Paste in `backend/google-sheets-receiver.gs` (from this repo)
- Save

### 2) Deploy Apps Script as a Web App

- **Deploy → New deployment**
- Select **Web app**
- **Execute as**: Me
- **Who has access**: Anyone
- Deploy and copy the **Web app URL** (ends in `/exec`)

### 3) Add the stream URL to the site

In `index.html`, set:

```html
<meta name="tracking-stream-url" content="YOUR_WEB_APP_URL" />
```

or add `?stream=YOUR_WEB_APP_URL` to the study URL.

### 4) What gets written to the sheet

The receiver writes new data to three tabs:

- **`Without_AI_Survey`** - one row per participant who completes the survey with full reviews and no AI summary.
- **`AI_Summary_Survey`** - one row per participant who completes the survey with AI review summaries.
- **`Browsing_Information`** - one row per participant × condition × browsing stage × hotel.

The two survey sheets have identical columns. Each participant's row contains:

- the shared random `survey_user_id` and their Student ID answer;
- the four assigned hotel attribute IDs: location convenience, fitness facilities, and two distinct randomly selected remaining attributes;
- their pre-review and post-review likelihood answers for Hotel A and Hotel B;
- their chosen hotel, satisfaction, switching answer, likelihood of changing their hotel selection, and surprise ratings for their four assigned attributes;
- whether and how many times they opened the shopper-profile, hotel-order, and revealed-attributes popups;
- their AI-summary use frequency and automated-response checks.

Each survey tab keeps 54 columns, including six legacy Pendry columns retained only to preserve historical data. Deleted questions, the fixed Solo City Exploration scenario, fixed preference-profile values, fixed hotel names, revealed attribute constants, redundant text labels, legacy confidence scales, and recovery JSON are not written. Hotel-attribute likelihood answers, likelihood of changing the answer, and surprise answers are coded from 1 to 5. AI-summary use is coded from 1 to 7. The attribute IDs in `assigned_attribute_1_id` through `assigned_attribute_4_id` identify which question each numbered hotel answer column represents. Popup events are deduplicated by event ID before their counts are updated.

`Browsing_Information` has 35 columns and uses a long format. Its unique combination is `survey_user_id + condition + browsing_stage + hotel_id`. `hotel_display_position` records the displayed hotel position (now fixed: Hotel A = 1, Hotel B = 2). `popup_opened` explicitly records whether that hotel popup was clicked, and `popup_click_count` records repeated openings. Reopening the same hotel in the same stage updates that row's counts, cumulative viewing time, longest single visit, scrolling measures, and latest exit reason instead of adding another row. Moving to another condition, stage, or hotel creates a separate observation row. `processed_visit_ids_json` and `processed_popup_event_ids_json` prevent network retries from being counted twice. Fixed or redundant values such as the hotel-name copy, the universal 750 ms read threshold, and the obsolete five-minute warning are not written. Comment-source metadata is not written to the Sheet. The sheet does not include `submission_id`, `SESSION_ID`, or `STUDY_ID`.

Review reading is measured through viewport exposure inside the hotel popup. A review is recorded as `seen` when at least 50% of its card enters the visible popup area. It is recorded as `read` after accumulating at least 750 milliseconds at that visibility level. The raw per-review visibility duration, seen order, read order, review IDs, last visible stopping position, furthest position reached, and sequential/skipping classification are retained so the threshold can be audited or reanalyzed. `summary_viewing_seconds` and `individual_reviews_viewing_seconds` come from section-level visibility, while `total_viewing_seconds` and `maximum_scroll_depth_pct` capture total information-page exposure and scrolling. Multiple popup visits are retained in `review_reading_sessions_json` and merged into the same participant-condition-stage-hotel row.

`condition` is `without_ai` or `ai_summary`. `browsing_stage` is `no_reviews`, `full_reviews`, or `ai_summary_reviews`, depending on which page the participant viewed.

The same `survey_user_id` appears once in each survey sheet and on every browsing observation belonging to that participant, making the tables directly pairable. A participant completing both versions and viewing all hotels can have up to 8 current browsing rows: 2 conditions × 2 stages × 2 hotels. When a Student ID is available, the receiver derives the same pseudonymous `survey_user_id` from it, even if the participant reopens the survey or uses another browser. Location convenience and fitness facilities are always assigned first and second. Two more distinct attributes are selected from the other six using stable participant-specific randomization, so the same Student ID receives the same four attributes in both conditions and in the pre-review, post-review, and surprise questions. All listings and hotel-order previews use the fixed order Hotel A then Hotel B, replacing any older cached random order. Survey answers and popup state remain separate between versions.

The actual-attributes reveal and its reminder popup show only the eight preference-profile attributes. Actual values use the study's binary table (1 = Good, 0 = Bad), not the numeric browsing-category scores. Hotel A uses the Arlo column; Hotel B uses the Nobu column.

The script uses a write lock so simultaneous requests cannot create duplicate rows. `survey_user_id` is the unique key in each survey sheet. The four-field combination above is the unique key in `Browsing_Information`. Repeated deliveries update the matching row, duplicate rows for the same key are collapsed, and hotel visits are deduplicated by visit ID before any totals are changed.

When upgrading from schema 19, the receiver appends the new popup-tracking columns to the existing three tabs automatically, so existing rows can remain in place. Earlier rows will have blank popup fields because those interactions were not captured before this update. For a completely clean pilot dataset, you can instead select `resetHotelSurveySheets` in the Apps Script function menu and click **Run** once; this clears and rebuilds only `Without_AI_Survey`, `AI_Summary_Survey`, and `Browsing_Information`. Do this only after exporting any old data you want to retain.

After you change `backend/google-sheets-receiver.gs`, use **Deploy → Manage deployments → Edit → New version → Deploy** so the live Web App picks up changes.

### Troubleshooting (empty sheet)

1. **No new tabs** - Confirm the site is using the correct `/exec` URL. In Apps Script, open **Executions** and check that `doPost` runs are successful.
2. **Survey sheet is empty** - A survey row is created or updated whenever a participant clicks **Next** on a question. Check the corresponding condition tab.
3. **`Browsing_Information` is empty** - Entering a browsing stage initializes a row for each of its two hotel popups, with zero open counts. Opening updates the count, and closing adds viewing time.
4. **Wrong spreadsheet** - Prefer creating the script through **Extensions -> Apps Script** inside the target Sheet. For a standalone script, set the `SPREADSHEET_ID` script property to the ID from the Sheet URL.

### Completion audit

For a participant who completes both surveys, verify:

1. The same `survey_user_id` appears in `Without_AI_Survey` and `AI_Summary_Survey`.
2. Both rows show `completion_status = complete`.
3. Both rows contain the same four assigned attribute IDs and no fixed scenario/profile columns.
4. `Browsing_Information` contains the expected condition × stage × hotel rows for that `survey_user_id`, with `hotel_display_position` populated and no repeated four-field key.

Streaming uses persistent retry queues and forced dispatch when a page is hidden or closed.
