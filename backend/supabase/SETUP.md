# Supabase setup

## Resources

- Organization: Chicago Hotel Survey (Free).
- Supabase project reference: `dzmfesygnueqhauglsdu`.
- Existing Cloudflare Pages project: `chicago-hotel-survey`.
- Git repository: `Jessica-Leee/mock-hotel-site`.

These identifiers are public configuration, not credentials.

## Scope

Each student participates in exactly one condition: `full_reviews` or
`ai_summary`. Student ID is required and unique within this experiment.
`participant_id` is an internal UUID, not an authentication credential.

The initial schema creates exactly two business tables:

- `survey_responses`: one row per participant, including answers and auxiliary
  popup statistics.
- `browsing_records`: one row per participant, browsing stage, and hotel.

Fixed study materials remain in version-controlled application files. JSONB
stores structured answers and metrics, not repeated review text or screenshots.

## Database initialization

Run `001_initial_schema.sql` once in the SQL Editor of the new project. It uses
a transaction, contains no data deletion, and intentionally fails if these
tables already exist. Verify both tables have RLS enabled and zero rows. No
browser/public read or write policies should be added.

## Cloudflare connection

Configure only the intended Pages deployment environment:

- `SUPABASE_URL`: the Project URL verified in the Supabase dashboard.
- `SUPABASE_SECRET_KEY`: an existing server-side `sb_secret_...` key, stored as a
  Cloudflare Secret with the user's approval.

Never put the secret key in browser code, source control, screenshots, or chat.
Do not use a publishable key as the server credential. No database password is
needed for the planned server-side Supabase Data API connection.

## Application flow

`functions/api/survey.js` runs on Cloudflare Pages and uses the secret key only
on the server. A signed, HttpOnly cookie connects one browser to its internal
participant UUID. Student ID is required, trimmed and case-normalized, and
unique across both conditions;
each student completes one condition. A response from a different browser with
the same Student ID is rejected instead of overwriting the existing row.

On the Student ID page, `start` creates the participant row. Every subsequent
Next sends that page's answers and waits for a database receipt before moving
forward. Refreshing the survey fetches saved answers and resumes the saved page.
The last Next writes the answer and `complete` status together. On each hotel
browsing page, Continue sends that page's finalized hotel visits and popup
opens, and advances only after the server confirms both hotel records.

Browser memory holds answers while the current page is open. No questionnaire
answer or answer-upload queue is persisted to localStorage. Browsing telemetry
uses a small browser-local retry queue until the server confirms receipt.
Existing browser-local popup timers and the fixed hotel order remain part of
the interface.

The old Apps Script deployment and spreadsheet may remain available as
historical data, but the current pages do not stream to them. The legacy
receiver source is intentionally no longer part of this application.

## Verification before pilot use

Run the local tests:

```sh
node --test tests/supabase-handler.test.mjs tests/survey-storage-client.test.cjs
```

After deployment, use a fresh test Student ID and a separate private browser
session for each condition, then complete both flows. For each test, confirm
one `survey_responses` row with
`completion_status = complete`, the expected answer keys, and four
`browsing_records` rows (2 stages x 2 hotels). Refresh during a questionnaire
to confirm it resumes on the next unanswered page. Try duplicate Continue and
retry saves to confirm visit counts do not double. Check that the former Google
Sheet receives no new test row. Actual production writes cannot be proved by
mocked local tests alone.

The code is local until committed and deployed. Cloudflare bindings become
available to the Pages Function on a deployment after they were saved.
