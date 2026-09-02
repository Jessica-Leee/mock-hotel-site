# Hotel survey site — deployment + tracking

## Live site

**https://jessica-leee.github.io/mock-hotel-site**

Hosted on [GitHub Pages](https://pages.github.com/) from the `main` branch. Pushes to `main` update the live site automatically.

## Study URLs

- **Survey (entry):** https://jessica-leee.github.io/mock-hotel-site/
- **Survey copy (AI-summary condition):** https://jessica-leee.github.io/mock-hotel-site/survey-ai-summaries.html
- **Search page 1:** https://jessica-leee.github.io/mock-hotel-site/hotel_1.html?survey_stage=search_1
- **Search page 2:** https://jessica-leee.github.io/mock-hotel-site/hotel_2.html?survey_stage=search_2
- **Search page 3 (reviews with AI summaries):** https://jessica-leee.github.io/mock-hotel-site/hotel_3.html?survey_stage=search_3

`index.html` is the survey entry page. After the survey, participants are routed to one of the Chicago hotel pages. Hotel details are text-only; hotel photos and galleries are not rendered.

The participant-facing flow uses neutral page names and query strings so the condition is not disclosed in the URL.

## Project structure

```text
.
├── index.html                         # Main survey and questionnaires
├── survey-ai-summaries.html           # Main entry for the AI-summary condition
├── study_3.html                       # Backward-compatible AI-summary entry
├── hotel_1.html                       # Hotel information stage
├── hotel_2.html                       # Reviews stage
├── hotel_3.html                       # Reviews plus AI-summary stage
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

The refined storage design maintains five tabs:

- **`Participants`** - one up-to-date row per participant/session. It contains their frequent hotel-booking scenarios, the assigned study scenario and three randomized attributes, prior hotel attributes, final hotel choice, satisfaction, switching answer, switching confidence, attribute-surprise ratings, completion status, and automated-response quality-control flags.
- **`Questionnaire_responses`** - one row per individual response item. A three-attribute matrix therefore creates three rows, one for each attribute. Each row includes the original response code, an analysis-ready numeric value, a readable label, the scale range, hotel and stage metadata, and the original `answer_json` for auditing.
- **`Hotel_visits`** - one row per completed hotel popup visit. Rows include participant identifiers, stage, hotel ID/name, numeric viewing duration, scroll depth, direction changes, scroll speed, and exit reason.
- **`events`** - one row per raw streamed event, including clicks, hovers, mouse samples, and full JSON in `value_json`. Use this tab as the untouched audit trail rather than the main analysis table.
- **`Codebook`** - definitions for the hotel attributes, booking-scenario choices, response scales, coding directions, and survey-stage labels.

The main analysis grain is:

- one participant = one row in `Participants`
- one questionnaire item = one row in `Questionnaire_responses`
- one opened-and-closed hotel popup = one row in `Hotel_visits`
- one browser interaction = one row in `events`

The script uses a write lock so simultaneous participants cannot overwrite each other. Questionnaire, hotel-visit, and raw event rows receive deterministic IDs so repeated network delivery does not create duplicate analysis rows.

At the end of a completed survey, the browser also sends a `survey_completion_snapshot` event. Its `value_json` contains the participant's full answer object, assignment, completion time, and the no-review, review, and AI-summary hotel-view states. This is the recovery record: even if an earlier page-level request was interrupted, the completed response can be reconstructed from this one row by matching `submission_id`.

Survey events and hotel interaction events use separate persistent browser outboxes. The stored survey state and hotel-event outbox are scoped to the participant's Prolific or session ID, preventing data from different participants on a shared browser from being mixed. Failed network dispatches remain in local storage and are retried on the next page load, when the connection comes back online, and when the page is hidden or closed. Stable `event_id` values make those retries safe to deduplicate with the current receiver.

If the Sheet was previously connected to the older script, the existing `Completed_hotel_visits` and `Questionnaire_answers` tabs are left untouched as legacy data. New submissions use `Hotel_visits` and `Questionnaire_responses` after the updated Apps Script is redeployed.

After you change `backend/google-sheets-receiver.gs`, use **Deploy → Manage deployments → Edit → New version → Deploy** so the live Web App picks up changes.

### Troubleshooting (empty sheet)

1. **`events` tab** - If this stays empty, the site is not reaching your Web App (wrong `/exec` URL in `index.html`, ad blocker, or Apps Script errors). In Apps Script, open **Executions** after you use the site; you should see `doPost` runs.
2. **`Hotel_visits` tab** - Rows appear only when a participant **closes a hotel detail popup**. Open a hotel, close it, and then check the tab within a few seconds.
3. **`Questionnaire_responses` tab** - Rows appear after participants click **Next** on survey/questionnaire pages. Transition pages are skipped so this tab stays focused on actual answers.
4. **`Participants` tab** - A participant row is updated throughout the study. `completion_status` changes to `complete` only after the final survey completion event is received.
5. **Script must write to the correct spreadsheet** - Prefer creating the script via **Extensions -> Apps Script** inside your Sheet. If the project is standalone, set Script property **`SPREADSHEET_ID`** to the Sheet ID from the URL (`/d/<ID>/edit`).

### Completion audit

For each completed participant, verify all three of the following:

1. `Participants.completion_status` is `complete`.
2. The `events` tab contains `event_type = survey_completion_snapshot` with the same Prolific ID and a non-empty `submission_id` inside `value_json`.
3. `Questionnaire_responses` contains the expected response rows for that participant. If any page-level row is missing, recover it from the snapshot's `answers` object.

Streaming uses a **2s batch flush** plus persistent retry queues and forced dispatch on page hide. Because the live site sends cross-origin requests to Google Apps Script in `no-cors` mode, the browser can confirm dispatch but cannot read a row-level acknowledgement from Google Sheets. The completion snapshot, retries, and stable IDs provide at-least-once delivery and recovery; a separate same-origin backend would be required for a strict end-to-end acknowledgement before showing the Thank You page.
