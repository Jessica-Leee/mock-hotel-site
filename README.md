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
- **`Browsing_Information`** - one row per completed hotel-popup visit across both survey versions.

The two survey sheets have identical columns. Each participant's row contains:

- the shared random `survey_user_id` and their Prolific ID answer;
- their frequent hotel-booking scenarios and open-text hotel attributes;
- the assigned Trip Scenario;
- the three randomly assigned hotel attributes;
- their pre-review and post-review likelihood and confidence answers for Pendry, Nobu, and Arlo;
- their chosen hotel, revealed-value acknowledgement, satisfaction, switching answer, switching confidence, and surprise ratings;
- automated-response checks and `all_answers_json` as a complete recovery copy.

Likelihood answers are saved numerically from 1 to 5, and confidence answers from 1 to 3. The attribute IDs in `assigned_attribute_1_id` through `assigned_attribute_3_id` identify which randomized question each numbered answer column represents.

`Browsing_Information` stores the shared `survey_user_id`, Prolific ID, survey condition, browsing stage, hotel, popup duration, scroll depth, direction changes, scrolling speed, and exit reason. It does not include `submission_id`, `SESSION_ID`, or `STUDY_ID`.

The same `survey_user_id` appears once in each survey sheet, making the two answers directly pairable. Survey answers and popup state remain separate between versions, while the assigned Trip Scenario, three attributes, and hotel order remain the same.

The script uses a write lock so simultaneous participants cannot overwrite each other. Repeated delivery updates the same participant row in the appropriate survey sheet, and hotel visits are deduplicated by visit ID.

If the Sheet was connected to an older receiver, its old tabs are left untouched as legacy data. Only the three tabs above receive new data after the updated Apps Script is redeployed.

After you change `backend/google-sheets-receiver.gs`, use **Deploy → Manage deployments → Edit → New version → Deploy** so the live Web App picks up changes.

### Troubleshooting (empty sheet)

1. **No new tabs** - Confirm the site is using the correct `/exec` URL. In Apps Script, open **Executions** and check that `doPost` runs are successful.
2. **Survey sheet is empty** - A survey row is created or updated whenever a participant clicks **Next** on a question. Check the corresponding condition tab.
3. **`Browsing_Information` is empty** - A browsing row is written only after a participant closes a hotel detail popup.
4. **Wrong spreadsheet** - Prefer creating the script through **Extensions -> Apps Script** inside the target Sheet. For a standalone script, set the `SPREADSHEET_ID` script property to the ID from the Sheet URL.

### Completion audit

For a participant who completes both surveys, verify:

1. The same `survey_user_id` appears in `Without_AI_Survey` and `AI_Summary_Survey`.
2. Both rows show `completion_status = complete`.
3. Both rows contain the same assigned Trip Scenario and three assigned attribute IDs.
4. `Browsing_Information` contains visits for that `survey_user_id` from both `full_reviews` and `ai_summary` conditions.

Streaming uses persistent retry queues and forced dispatch when a page is hidden or closed. `all_answers_json` in each survey row preserves the full exact answer object as a recovery copy.
