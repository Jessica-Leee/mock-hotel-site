# Hotel survey site — deployment + tracking

## Live site

**https://jessica-leee.github.io/mock-hotel-site**

Hosted on [GitHub Pages](https://pages.github.com/) from the `main` branch. Pushes to `main` update the live site automatically.

## Study URLs

- **Survey (entry):** https://jessica-leee.github.io/mock-hotel-site/
- **Survey (AI-summary condition):** https://jessica-leee.github.io/mock-hotel-site/survey-ai-summaries.html
- **Search without reviews:** https://jessica-leee.github.io/mock-hotel-site/search-no-reviews.html?survey_stage=search_1
- **Search with reviews:** https://jessica-leee.github.io/mock-hotel-site/search-reviews.html?survey_stage=search_2
- **Search with AI summaries:** https://jessica-leee.github.io/mock-hotel-site/search-ai-summaries.html?survey_stage=search_3

`index.html` is the full-review survey entry page. `survey-ai-summaries.html` starts the parallel AI-summary survey. Participants can complete both versions in sequence. Hotel details are text-only; hotel photos and galleries are not rendered.

For paired data, open both versions with the same `PROLIFIC_PID` value. The two pages share one GitHub Pages origin, so the hidden random `survey_user_id` is reused for the same participant. `STUDY_ID`, `SESSION_ID`, and `submission_id` are not written to the analysis sheets.

## Project structure

```text
.
├── index.html                         # Main survey and questionnaires
├── survey-ai-summaries.html           # Survey entry for the AI-summary condition
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

The complete six-hotel corpus remains embedded in `assets/js/hotel-listings.js`. Only the three experiment hotels are rendered, but the other hotel records have not been deleted.

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

- the shared random `survey_user_id` and their Prolific ID answer;
- the assigned Solo City Exploration scenario and acknowledgement of its preference profile;
- the three randomly assigned hotel attributes;
- their pre-review and post-review likelihood answers for Pendry, Nobu, and Arlo;
- their chosen hotel, revealed-value acknowledgement, satisfaction, switching answer, likelihood of changing that answer, and surprise ratings;
- automated-response checks and `all_answers_json` as a complete recovery copy.

Hotel-attribute likelihood answers are saved numerically from 1 to 5. The attribute IDs in `assigned_attribute_1_id` through `assigned_attribute_3_id` identify which randomized question each numbered answer column represents. The final likelihood-of-changing answer and every surprise answer are also stored in new five-point columns: one numeric `1_to_5` column and one exact-text `label` column per answer. Legacy confidence, `0_to_100`, and `0_to_10` columns remain in existing Sheets for schema compatibility but are no longer populated.

`Browsing_Information` uses a long format. Its unique combination is `survey_user_id + condition + browsing_stage + hotel_id`. Reopening the same hotel in the same stage updates that row's open count, cumulative viewing time, longest single visit, scrolling measures, and latest exit reason instead of adding another row. Moving to another condition, stage, or hotel creates a separate observation row. `processed_visit_ids_json` is the deduplication audit: if the browser retries an event, that visit ID is recognized and is not counted twice. The sheet does not include `submission_id`, `SESSION_ID`, or `STUDY_ID`.

`condition` is `without_ai` or `ai_summary`. `browsing_stage` is `no_reviews`, `full_reviews`, or `ai_summary_reviews`, depending on which page the participant viewed.

The same `survey_user_id` appears once in each survey sheet and on every browsing observation belonging to that participant, making the tables directly pairable. A participant completing both versions and viewing all hotels can have up to 12 browsing rows: 2 conditions × 2 stages × 3 hotels. When a Prolific ID is available, the receiver derives the same pseudonymous `survey_user_id` from it, even if the participant reopens the survey or uses another browser. Survey answers and popup state remain separate between versions, while the assigned Trip Scenario, three attributes, and hotel order remain the same.

The script uses a write lock so simultaneous requests cannot create duplicate rows. `survey_user_id` is the unique key in each survey sheet. The four-field combination above is the unique key in `Browsing_Information`. Repeated deliveries update the matching row, duplicate rows for the same key are collapsed, and hotel visits are deduplicated by visit ID before any totals are changed.

If a previous `Browsing_Information` tab uses an older schema, the receiver preserves it by renaming it to `Browsing_Information_Legacy` and creates the new long-format tab automatically.

If the Sheet was connected to an older receiver, its old tabs are left untouched as legacy data. Only the three tabs above receive new data after the updated Apps Script is redeployed.

After you change `backend/google-sheets-receiver.gs`, use **Deploy → Manage deployments → Edit → New version → Deploy** so the live Web App picks up changes.

### Troubleshooting (empty sheet)

1. **No new tabs** - Confirm the site is using the correct `/exec` URL. In Apps Script, open **Executions** and check that `doPost` runs are successful.
2. **Survey sheet is empty** - A survey row is created or updated whenever a participant clicks **Next** on a question. Check the corresponding condition tab.
3. **`Browsing_Information` is empty** - A browsing observation is created or updated only after the participant closes a hotel detail popup.
4. **Wrong spreadsheet** - Prefer creating the script through **Extensions -> Apps Script** inside the target Sheet. For a standalone script, set the `SPREADSHEET_ID` script property to the ID from the Sheet URL.

### Completion audit

For a participant who completes both surveys, verify:

1. The same `survey_user_id` appears in `Without_AI_Survey` and `AI_Summary_Survey`.
2. Both rows show `completion_status = complete`.
3. Both rows contain the Solo City Exploration scenario and the same three assigned attribute IDs.
4. `Browsing_Information` contains the expected condition × stage × hotel rows for that `survey_user_id`, with no repeated four-field key.

Streaming uses persistent retry queues and forced dispatch when a page is hidden or closed. `all_answers_json` in each survey row preserves the full exact answer object as a recovery copy.
