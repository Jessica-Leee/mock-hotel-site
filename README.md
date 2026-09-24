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
- Search without reviews: https://chicago-hotel-survey.pages.dev/search-no-reviews.html?survey_stage=search_1
- Search with reviews: https://chicago-hotel-survey.pages.dev/search-reviews.html?survey_stage=search_2
- Search with AI summaries: https://chicago-hotel-survey.pages.dev/search-ai-summaries.html?survey_stage=search_3

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
│       └── survey-tracking.js          # Behavioral tracking and retry queue
├── functions/api/survey.js             # Cloudflare Pages API entry
└── backend/supabase/                   # Server handler, schema, and setup notes
```

The Pages Function stores data in two Supabase tables:

- `survey_responses`: one row per Student ID, including answers, assigned
  attributes, quality checks, and popup statistics.
- `browsing_records`: one row per participant, browsing stage, and hotel,
  with idempotent per-visit snapshots and aggregated metrics.

Student ID is required, normalized to uppercase, and unique across both study
conditions. A signed HttpOnly cookie links a browser to its internal participant
UUID. Details and database initialization are in
[`backend/supabase/SETUP.md`](backend/supabase/SETUP.md).

## Study behavior

The experiment contains Hotel A and Hotel B, each with 150 reviews in a fixed
order. Each hotel popup requires at least 10 cumulative seconds of active
viewing and has a cumulative 45-second budget per browsing stage. Time while the
document is hidden is excluded. Participants can continue only after both hotel
popups have been viewed and closed.

Questionnaire navigation waits for a confirmed server response. Browsing
telemetry uses a persistent, idempotent retry queue. Events preserve the page
and stage where they were created, are sent in keepalive-sized batches, and are
removed only after the API acknowledges their event IDs. Delayed visits are
aggregated by their recorded close time rather than network arrival order.

## Local tests

Install the pinned development dependencies and run the full suite:

```sh
npm install
npm test
```

All HTTP, storage, and database calls are mocked. The tests do not write to
Supabase or any historical spreadsheet. They cover the questionnaire flow,
Supabase handler, page navigation, popup timing, stage attribution, reload and
retry behavior, partial acknowledgements, storage fallbacks, fallback event
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
3. Start each condition with a fresh test Student ID in a private browser
   session and complete the flow.
4. Verify one completed `survey_responses` row and four `browsing_records` rows
   per test participant.
5. Retry a save and a browsing Continue action to confirm counts remain
   idempotent.

Historical Google Sheets and Apps Script deployments may be retained outside
this repository for archived data or participants still using an old site
version. The current application neither references nor deploys them.
