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
Student ID is the resume credential. `participant_id` is an opaque internal UUID
used only while moving between pages after a successful resume.

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
on the server. Student ID is required, trimmed, case-normalized, and unique
across both conditions. The `resume` action creates a row when the Student ID is
new and returns the existing row otherwise. An existing row always keeps its
original condition.

Every entry-page load starts at Student ID. After a successful resume, internal
navigation carries only the opaque participant UUID. Every subsequent Next
sends that page's answers and waits for a database receipt before moving
forward. Re-entering the Student ID restores the saved page and answers.
The last Next writes the answer and `complete` status together. On each hotel
browsing page, Continue sends that page's finalized hotel visits and popup
opens, and advances only after the server confirms both hotel records.

Browser memory holds only the current page state. The application does not use
cookies, localStorage, sessionStorage, or IndexedDB. Browsing telemetry has an
in-memory retry queue, so events not yet confirmed when a tab closes may be
lost. Confirmed questionnaire answers and browsing records remain in Supabase.

## Verification before pilot use

Run the local tests:

```sh
node --test tests/supabase-handler.test.mjs tests/survey-storage-client.test.cjs
```

After deployment, use a fresh test Student ID for each condition, then complete
both flows. For each test, confirm
one `survey_responses` row with
`completion_status = complete`, the expected answer keys, and four
`browsing_records` rows (2 stages x 2 hotels). Close the site, reopen the entry
URL, and re-enter the Student ID to confirm it resumes on the next unanswered
page. Try duplicate Continue and
retry saves to confirm visit counts do not double. Actual production writes
cannot be proved by mocked local tests alone.

The code is local until committed and deployed. Cloudflare bindings become
available to the Pages Function on a deployment after they were saved.
