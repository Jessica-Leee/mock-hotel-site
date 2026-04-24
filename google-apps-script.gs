/**
 * Google Apps Script receiver for hotel experiment tracking.
 *
 * Sheets:
 * 1) "events" — one row per streamed event (full telemetry).
 * 2) "Completed_hotel_visits" — one row per hotel modal close, columns aligned with the researcher dashboard.
 *
 * Deploy as a Web App (Execute as: Me, Who has access: Anyone).
 * After editing, use Deploy → Manage deployments → Edit → New version → Deploy.
 *
 * Site meta (or ?stream=):
 *   <meta name="tracking-stream-url" content="https://script.google.com/macros/s/.../exec" />
 */

const EVENTS_SHEET = "events";
const VISITS_SHEET = "Completed_hotel_visits";

/**
 * Spreadsheet to write to.
 * - Best: create this script from the Sheet (Extensions → Apps Script) so getActiveSpreadsheet() works.
 * - Otherwise: Project Settings → Script properties → add SPREADSHEET_ID = id from the Sheet URL
 *   (.../spreadsheets/d/THIS_ID/edit...)
 */
function getSpreadsheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (id && String(id).trim()) return SpreadsheetApp.openById(String(id).trim());
  throw new Error(
    "No spreadsheet: open this project from the target Sheet (Extensions → Apps Script), " +
      "or set Script property SPREADSHEET_ID to the Sheet ID."
  );
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "";
    const payload = raw ? JSON.parse(raw) : {};
    const events = Array.isArray(payload.events) ? payload.events : [];
    const prolific = payload.prolific || {};

    const ss = getSpreadsheet_();

    const shEvents = ss.getSheetByName(EVENTS_SHEET) || ss.insertSheet(EVENTS_SHEET);
    ensureEventsHeader_(shEvents);

    const receivedAt = Date.now();
    const rows = [];
    for (let i = 0; i < events.length; i++) {
      const ev = events[i] || {};
      rows.push([
        receivedAt,
        prolific.prolific_pid || "",
        prolific.study_id || "",
        prolific.session_id || "",
        payload.page_url || "",
        payload.phase || "",
        payload.cond || "",
        ev.event_type || "",
        ev.element_id || "",
        ev.timestamp || "",
        JSON.stringify(ev.value === undefined ? null : ev.value),
        payload.reason || "",
        payload.seq_start != null ? payload.seq_start + i : ""
      ]);
    }

    if (rows.length) {
      shEvents.getRange(shEvents.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    }

    const shVisits = ss.getSheetByName(VISITS_SHEET) || ss.insertSheet(VISITS_SHEET);
    ensureVisitsHeader_(shVisits);
    const visitRows = buildVisitRows_(events);
    if (visitRows.length) {
      shVisits.getRange(shVisits.getLastRow() + 1, 1, visitRows.length, visitRows[0].length).setValues(visitRows);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, events_appended: rows.length, visits_appended: visitRows.length })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(
      ContentService.MimeType.JSON
    );
  }
}

function doGet() {
  return ContentService.createTextOutput("ok").setMimeType(ContentService.MimeType.TEXT);
}

function ensureEventsHeader_(sh) {
  if (sh.getLastRow() > 0) return;
  sh.appendRow([
    "received_at_ms",
    "prolific_pid",
    "study_id",
    "session_id",
    "page_url",
    "phase",
    "cond",
    "event_type",
    "element_id",
    "event_timestamp_ms",
    "value_json",
    "batch_reason",
    "batch_seq"
  ]);
}

function ensureVisitsHeader_(sh) {
  if (sh.getLastRow() > 0) return;
  sh.appendRow([
    "Hotel",
    "Time in modal",
    "Scroll depth (now)",
    "Scroll depth (max)",
    "Direction changes",
    "Scroll speed max (px/ms)",
    "Scroll speed mean (px/ms)",
    "Exit"
  ]);
}

function fmtDurationMs(ms) {
  if (ms == null || ms === "") return "";
  const n = Number(ms);
  if (isNaN(n)) return "";
  if (n < 1000) return String(Math.round(n)) + " ms";
  return (n / 1000).toFixed(1) + " s";
}

function pctStr(v) {
  if (v == null || v === "") return "";
  return String(v) + "%";
}

function numStr(v) {
  if (v == null || v === "") return "";
  return String(v);
}

/**
 * One row per completed hotel modal (page_timing with context hotel_modal).
 */
function buildVisitRows_(events) {
  const out = [];
  for (let i = 0; i < events.length; i++) {
    const ev = events[i] || {};
    if (ev.event_type !== "page_timing") continue;
    const v = ev.value && typeof ev.value === "object" ? ev.value : {};
    if (v.context !== "hotel_modal") continue;

    out.push([
      ev.element_id || "",
      fmtDurationMs(v.duration_ms),
      pctStr(v.scroll_depth_pct_at_exit),
      pctStr(v.scroll_max_pct),
      numStr(v.scroll_dir_changes),
      numStr(v.scroll_max_px_per_ms),
      numStr(v.scroll_mean_px_per_ms),
      v.exit_reason != null ? String(v.exit_reason) : ""
    ]);
  }
  return out;
}
