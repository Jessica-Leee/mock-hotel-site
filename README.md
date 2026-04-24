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

Each row is one event with:

- participant identifiers (`PROLIFIC_PID`, `STUDY_ID`, `SESSION_ID` if present in the URL)
- page context (phase/cond/url)
- event fields (`event_type`, `element_id`, `timestamp`, `value_json`)

### Notes

- Streaming uses a **2s batch flush** (plus a forced flush on pagehide/visibility hidden).
- If you need guaranteed delivery / retries across network outages, we can add an ack + retry queue.

