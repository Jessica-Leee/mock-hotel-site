# Mock hotel site — deployment + tracking

## Deploy the site (so others can use it without code)

This project is a static website (HTML/CSS/JS). You can host it on any static host:

- **Netlify** (easiest): drag-and-drop the `mock_hotel_site/` folder in the Netlify UI.
- **Vercel**: import the folder as a static project.
- **GitHub Pages**: put these files in a repo and enable Pages.

After deploy you’ll get a public URL like `https://your-study-site.netlify.app`.

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

1. **`events` tab** — If this stays empty, the site is not reaching your Web App (wrong `/exec` URL in Netlify build, ad blocker, or Apps Script errors). In Apps Script, open **Executions** after you use the site; you should see `doPost` runs.
2. **`Completed_hotel_visits` tab** — Rows appear only when a participant **closes a hotel detail modal** (not from scrolling the main results list alone). Open a hotel → close it (✕ or backdrop); then check the tab within a few seconds.
3. **Script must write to the correct spreadsheet** — Prefer creating the script via **Extensions → Apps Script** inside your Sheet. If the project is standalone, set Script property **`SPREADSHEET_ID`** to the Sheet ID from the URL (`/d/<ID>/edit`).

### Notes

- Streaming uses a **2s batch flush** (plus a forced flush on pagehide/visibility hidden).
- If you need guaranteed delivery / retries across network outages, we can add an ack + retry queue.

