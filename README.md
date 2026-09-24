# Hotel survey site

## Live site

**https://chicago-hotel-survey.pages.dev/**

The site is deployed from the `main` branch of
`Jessica-Leee/mock-hotel-site` through Cloudflare Pages. The production branch
uses a same-origin Pages Function and Supabase; it does not write to Google
Sheets.

## Study URLs

- Survey: https://chicago-hotel-survey.pages.dev/
- Survey Summaries: https://chicago-hotel-survey.pages.dev/survey-summaries.html

`index.html` starts the full-review condition. `survey-summaries.html` starts
the AI-summary condition with `study_version=3`; `survey-ai-summaries.html`
remains only as a compatibility redirect for previously shared links.

## Architecture

```text
.
├── index.html                         # Survey and questionnaires
├── survey-summaries.html              # AI-summary survey entry
├── search-no-reviews.html             # Listings without reviews
├── search-reviews.html                # Listings with full reviews
├── search-ai-summaries.html           # Listings with AI summaries
├── assets/
│   ├── css/site.css
│   └── js/
│       ├── hotel-listings.js           # Listing data and modal behavior
│       ├── survey-storage.js           # Confirmed questionnaire saves
│       └── survey-tracking.js          # In-memory behavioral tracking
├── functions/api/survey.js             # Cloudflare Pages API entry
└── backend/supabase/                   # Server handler, schema, and setup notes
```

The Pages Function stores data in two Supabase tables:

- `survey_responses`: one row per Student ID, including answers, assigned
  attributes, quality checks, and popup statistics.
- `browsing_records`: one row per participant, browsing stage, and hotel,
  with idempotent per-visit snapshots and aggregated metrics.

Student ID is required, normalized to uppercase, and unique across both study
conditions. Entering it creates a new response or restores the existing one.
The browser stores no survey data in cookies, localStorage, sessionStorage, or
IndexedDB. Details and database initialization are in
[`backend/supabase/SETUP.md`](backend/supabase/SETUP.md).

## Study behavior

The experiment contains Hotel A and Hotel B, each with 150 reviews in a fixed
order. Each hotel popup requires at least 10 cumulative seconds of active
viewing and has a cumulative 45-second budget per browsing stage. Time while the
document is hidden is excluded. Participants can continue only after both hotel
popups have been viewed and closed.

Every visit to an entry URL starts on the Student ID page. The server returns
the first unfinished page, or the completion screen for a finished response.
Questionnaire navigation waits for a confirmed server response. Browsing events
are retried only while the current page remains open and are also included in
the confirmed Continue request. Delayed visits are aggregated by their recorded
close time rather than network arrival order.

## Local tests

Install the pinned development dependencies and run the full suite:

```sh
npm install
npm test
```

All HTTP and database calls are mocked. The tests do not write to
Supabase or any historical spreadsheet. They cover the questionnaire flow,
Student ID resume behavior, Supabase handler, page navigation, popup timing,
stage attribution, in-page retries, partial acknowledgements, fallback event
IDs, payload splitting, hidden-tab timing, and out-of-order visits.

## Cloudflare Pages deployment

Cloudflare Pages project: `chicago-hotel-survey`

- Production branch: `main`
- Framework preset: `None`
- Build command: `exit 0`
- Build output directory: `.`
- Required binding: `SUPABASE_URL`
- Required encrypted binding: `SUPABASE_SECRET_KEY`

Pushing a tested commit to `main` starts the production deployment. Do not put
the Supabase secret key in browser code, source control, logs, screenshots, or
chat.

## Post-deployment verification

After deployment:

1. Confirm the entry page and all three browsing pages return HTTP 200.
2. Confirm their deployed HTML and tracking script contain the new commit.
3. Start each condition with a fresh test Student ID and complete the flow.
4. Verify one completed `survey_responses` row and four `browsing_records` rows
   per test participant.
5. Retry a save and a browsing Continue action to confirm counts remain
   idempotent.
