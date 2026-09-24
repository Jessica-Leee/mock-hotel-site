# Hotel survey site — deployment + tracking

## Live site

**https://chicago-hotel-survey.pages.dev/**

Hosted on Cloudflare Pages from the `main` branch of `Jessica-Leee/mock-hotel-site`. Automatic deployments are enabled. The previous GitHub Pages site at https://jessica-leee.github.io/mock-hotel-site/ remains available.

## Supabase migration

This repository includes a Cloudflare Pages Function and a two-table Supabase
storage path. The Cloudflare deployment and a completed test submission must
be verified before participants use it. See
[`backend/supabase/SETUP.md`](backend/supabase/SETUP.md) for the schema, server
bindings, save behavior, and pilot verification steps. The Google Sheets
instructions below describe the older deployment and its historical data.
The old GitHub Pages hostname cannot run the Pages Function and must not be used
for new survey submissions.

## Study URLs

- **Survey (entry):** https://chicago-hotel-survey.pages.dev/
- **Survey Summaries (summary condition):** https://chicago-hotel-survey.pages.dev/survey-summaries.html
- **Search without reviews:** https://chicago-hotel-survey.pages.dev/search-no-reviews.html?survey_stage=search_1
- **Search with reviews:** https://chicago-hotel-survey.pages.dev/search-reviews.html?survey_stage=search_2
- **Search with AI summaries:** https://chicago-hotel-survey.pages.dev/search-ai-summaries.html?survey_stage=search_3

`index.html` is the full-review survey entry page. `survey-summaries.html` starts the summary condition using `study_version=3`. The old `survey-ai-summaries.html` entry redirects to it. In the new database design, each Student ID completes one condition. Hotel details are text-only; hotel photos and galleries are not rendered.

## Cloudflare Pages deployment

The shared hostname is `chicago-hotel-survey.pages.dev`, deployed and checked on September 21, 2026. The standard survey uses `/`, and Survey Summaries uses `/survey-summaries.html` (Cloudflare canonicalizes this to `/survey-summaries` before the entry redirects into the shared questionnaire with `study_version=3`). Both entries rendered the Student ID question successfully, and all three search pages and shared CSS/JS returned HTTP 200 and matched the repository source. This deployment check did not submit questionnaire answers or verify a new row in Google Sheets.

The existing `Jessica-Leee/mock-hotel-site` GitHub repository is connected through Pages. Configuration: project name `chicago-hotel-survey`, production branch `main`, framework preset `None`, build command `exit 0`, and build output directory `.`. The Supabase Pages Function requires `SUPABASE_URL` and encrypted `SUPABASE_SECRET_KEY` bindings before deployment.

Keep both versions on this same origin. The September 21 deployment used browser-local retry queues and the existing Sheet receiver; participants who started that version should finish on its original domain. Before distributing the Supabase version, verify both entries, their browsing pages, and the database rows created by a complete test run.

The new Supabase tables use a required Student ID and an internal participant UUID. The same Student ID cannot start a second condition. Historical Google Sheets records remain separate from the new database.

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
├── functions/api/survey.js            # Cloudflare Pages storage API
├── backend/supabase/                  # Schema, server handler, setup notes
└── backend/google-sheets-receiver.gs  # Legacy Google Sheets receiver
```

The current experiment contains Hotel A (formerly Arlo) and Hotel B (formerly Nobu), each with 150 reviews in the same fixed order for every participant and both review conditions. Pendry and the unused hotel datasets have been removed from the website. Each hotel popup requires at least 10 cumulative seconds of viewing and has a cumulative 45-second budget per participant, condition, browsing run, and stage. Until the minimum is met, the close button, Escape, backdrop clicks, and switching hotels cannot close the popup. Both limits are displayed in the popup. Closing or hiding the browser tab pauses the budget; reopening or returning resumes it. Reopening after meeting the minimum does not impose another 10-second wait. Expiry closes and locks that popup. There is no listing-page countdown or automatic jump to the questionnaire. Participants can continue once both hotel popups have been viewed for at least 10 seconds and closed.

## Historical Google Sheets notes

The following sections document the earlier Apps Script deployment. They are
not instructions for the new Supabase flow.

Student ID was optional in that deployment: participants could leave it blank and select Next. Answers still carried a generated `survey_user_id`, which the existing receiver accepted without a Student ID. Anonymous pairing depended on retaining browser storage on the same origin.

The opening flow is Student ID (optional) -> trip scenario and a free-text attribute question -> Attribute Preference Profile -> browsing introduction. The new question asks, before showing the profile: "Before seeing your preference profile, please list all hotel attributes you would consider when choosing a hotel under the given scenario." Participants enter their attributes separated by commas; a nonblank response is required. No attribute examples or profile popup are shown on that page. The original response is stored as `scenario_attributes_prior` in both survey sheets.

Schema 23 added `scenario_attributes_prior` as column 55. Schema 24 appends 12 stage-specific auxiliary-popup count columns, leaving the original 55 columns and all historical answers in place. Replace `backend/google-sheets-receiver.gs` in Apps Script and deploy a new version of the existing Web App before collecting these new fields. Older receivers do not store the added fields. Keep the same Web App URL and do not reset or clear the sheets. `Browsing_Information` is unchanged.

### Auxiliary popups by stage

The new columns use `<stage>_<popup>_popup_open_count`, in both survey sheets:

| Stage prefix | Page |
| --- | --- |
| `browsing_1` | First hotel browsing page, before reviews |
| `questionnaire_1` | First hotel questionnaire |
| `browsing_2` | Second hotel browsing page, with reviews or summaries |
| `questionnaire_2` | Post-review questionnaire |

For each stage, the three popup identifiers are `shopper_profile`, `hotel_order`, and `revealed_attributes` (the hotel-experience reminder). For example, `browsing_1_shopper_profile_popup_open_count` and `questionnaire_2_revealed_attributes_popup_open_count`. A count greater than zero means the popup was opened; separate stage-specific boolean columns are unnecessary. The existing six whole-survey opened/count fields remain available for compatibility.

The stage is attached to each popup event when it opens, not when it is uploaded. Repeated deliveries of the same event ID do not increment either the total or stage count twice. A shopper-profile popup opened inside a hotel popup belongs to that hotel's browsing stage. No new popup buttons were added: the hotel-order popup is only available in the questionnaires, and the hotel-experience reminder only in the post-review questionnaire. Unavailable or unopened combinations have zero counts for new participants.

Historical totals cannot be reliably split into stages. Old rows retain blank stage counters until a new attributable event arrives; subsequent counts cover only events processed with the new stage logic, not a reconstructed full history. Legacy events with a recorded `survey_stage`, questionnaire context, or questionnaire hash can still be classified if they have not already been counted. Ambiguous legacy events update only the total, never a guessed stage.

### Regression tests

Run from the repository root with `jsdom` and `@sinonjs/fake-timers` available to Node (they may be installed in an external temporary directory and exposed using `NODE_PATH`):

```sh
node tests/popup-behavior.test.cjs
node tests/scenario-attributes.test.cjs
node tests/popup-stages.test.cjs
node tests/storage-delivery.test.cjs
node --test tests/tracking-reliability.test.cjs
```

The popup test uses simulated time and no network requests to cover all three browsing pages, minimum-time close guards, background pauses, cumulative reopening, the maximum limit, reload persistence, the continue gate, and fixed review ordering across participants and conditions. The scenario test mocks all delivery calls and checks both entry conditions, optional Student ID, the new question appearing before the profile, nonblank answer validation, and the receiver's new column mapping.

### Tracking reliability update (September 23, 2026)

The tracking retry queue now preserves events added by a later page while an earlier request is still in flight. Requests time out after 45 seconds instead of blocking the queue indefinitely, and failed requests retry with increasing delays and jitter. Large event batches are split to keep normal requests below the keepalive payload budget. A closed tab cannot keep scheduling retries; participants should wait for "Your responses have been saved successfully." before leaving.

The updated receiver returns `tracking_event_ids` only for recognized, persisted tracking events. The browser retains unconfirmed events, and repeated delivery of acknowledged event IDs does not add visits or popup opens again. Older receivers remain accepted for compatibility, but only the updated receiver provides event-level confirmation. Direct browsing URLs without `survey_stage` are recognized from their page paths. Unknown stages are not guessed. A delayed older visit no longer replaces the last visit's exit reason or review stopping position.

New hotel viewing and review/summary visibility durations exclude time while the document is hidden. The original opening timestamp is sent separately so `first_opened_at` and `last_opened_at` are not shifted by a background pause. Historical durations are not recalculated. Review "read" counts remain visibility-based estimates (at least 50% visible for 750 cumulative milliseconds), not proof that a person read or understood the text.

The receiver no longer repeats header formatting and existing-row formatting on every request. It flushes writes before confirming receipt and releasing the existing script lock. All column names, positions, participant matching, and the three existing sheet names remain unchanged (schema 24: 67 columns per survey sheet, 35 browsing columns).

Deploy the updated `backend/google-sheets-receiver.gs` first: save it in the existing Apps Script project, then choose **Deploy -> Manage deployments -> Edit -> New version -> Deploy**. Keep the same Web App URL and spreadsheet. Do **not** run `resetHotelSurveySheets`, clear rows, or create replacement tabs. Open the existing `/exec` URL with `?health=1`; the new read-only health check must return `tracking_receipts_version: 1` and `schema_version: "24"`. Then publish the website changes. Git commits and website deployments do not update Apps Script automatically.

The reliability tests use mocked HTTP and an in-memory spreadsheet, including both conditions, real listing markup, cross-page queue changes, partial acknowledgements, offline reloads, hanging requests, large batches, duplicate/reordered visits, hidden-tab pauses, and preservation of existing answers and header positions. They never send test records to the live spreadsheet. These tests do not prove why a particular historical event is absent or recover events whose original browser data no longer exists.

The earlier schema 22 migration appended five columns to each survey sheet: `assigned_attribute_4_id` and the fourth pre-review and post-review likelihood answer for Hotel A and Hotel B. Schema 23 retains those fields. Existing three-attribute responses remain unchanged, with the new columns blank. The six legacy Pendry answer columns remain for compatibility but receive no new answers. Internal hotel IDs remain `arlo-chicago` (Hotel A) and `nobu-hotel-chicago` (Hotel B), so historical data still joins correctly. Do not reset the sheets for this update. The Student ID page includes a visually hidden optional honeypot expecting `wrong id`; filling it or entering that phrase as the Student ID sets the existing bot-detection fields. This is a signal for review, not proof of automated participation.

## Ensure multiple participants are recorded

Every participant’s browser sends events to a server endpoint (Google Apps Script Web App).
Requests from multiple participants are serialized by the receiver's script lock. Heavy concurrent traffic can cause timeouts; browsers retain unconfirmed events and retry. Check delivery acknowledgements and load-test with separate test data before increasing the participant count.

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
- whether and how many times they opened the shopper-profile, hotel-order, and revealed-attributes popups in total, plus separate counts for each of the four browsing/questionnaire stages;
- their AI-summary use frequency and automated-response checks.

Each survey tab keeps 67 columns, including 12 stage-specific auxiliary-popup counts, the free-text `scenario_attributes_prior` answer, and six legacy Pendry columns retained only to preserve historical data. Deleted questions, the fixed Solo City Exploration scenario, fixed preference-profile values, fixed hotel names, revealed attribute constants, redundant text labels, legacy confidence scales, and recovery JSON are not written. Hotel-attribute likelihood answers, likelihood of changing the answer, and surprise answers are coded from 1 to 5. AI-summary use is coded from 1 to 7. The attribute IDs in `assigned_attribute_1_id` through `assigned_attribute_4_id` identify which question each numbered hotel answer column represents. Popup events are deduplicated by event ID before their counts are updated.

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
