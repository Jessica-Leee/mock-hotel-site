# Mock hotel site — deployment + tracking

## Live site

**https://jessica-leee.github.io/mock-hotel-site**

Hosted on [GitHub Pages](https://pages.github.com/) from the `main` branch. Pushes to `main` update the live site automatically.

## Study URLs

- **Survey (entry):** https://jessica-leee.github.io/mock-hotel-site/
- **No reviews:** https://jessica-leee.github.io/mock-hotel-site/hotels-no-reviews.html
- **With reviews:** https://jessica-leee.github.io/mock-hotel-site/hotels-with-reviews.html

`index.html` is the survey entry page. After the survey, participants are routed to one of the Chicago hotel pages. Hotel details are text-only; hotel photos and galleries are not rendered.

The no-review page is labeled as Phase 1 browsing and uses the relisted-hotel cover story from the experiment design. The review page is labeled as the Phase 2 Full Reviews Control condition and does not show an AI summary.

## Ensure multiple participants are recorded

Every participant’s browser sends events to a server endpoint (Google Apps Script Web App).
Because each participant makes their own HTTP requests, **multiple simultaneous users are fine**.

## Stream events to Google Sheets (real-time)

### 1) Create a Google Sheet

- Create a Google Sheet named anything you want.
- In the Sheet: **Extensions → Apps Script**
- Paste in `google-apps-script.gs` (from this repo)
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

The script maintains two tabs:

- **`events`** — one row per streamed event (full JSON in `value_json`), including clicks, hovers, mouse samples, etc.
- **`Completed_hotel_visits`** — one row each time a participant **closes** a hotel modal, with columns:
  **Hotel**, **Time in modal**, **Scroll depth (now)**, **Scroll depth (max)**, **Direction changes**, **Scroll speed max (px/ms)**, **Scroll speed mean (px/ms)**, **Exit**

After you change `google-apps-script.gs`, use **Deploy → Manage deployments → Edit → New version → Deploy** so the live Web App picks up changes.

### Troubleshooting (empty sheet)

1. **`events` tab** — If this stays empty, the site is not reaching your Web App (wrong `/exec` URL in `index.html`, ad blocker, or Apps Script errors). In Apps Script, open **Executions** after you use the site; you should see `doPost` runs.
2. **`Completed_hotel_visits` tab** — Rows appear only when a participant **closes a hotel detail modal** (not from scrolling the main results list alone). Open a hotel → close it (✕ or backdrop); then check the tab within a few seconds.
3. **Script must write to the correct spreadsheet** — Prefer creating the script via **Extensions → Apps Script** inside your Sheet. If the project is standalone, set Script property **`SPREADSHEET_ID`** to the Sheet ID from the URL (`/d/<ID>/edit`).

### Notes

- Streaming uses a **2s batch flush** (plus a forced flush on pagehide/visibility hidden).
- If you need guaranteed delivery / retries across network outages, we can add an ack + retry queue.
