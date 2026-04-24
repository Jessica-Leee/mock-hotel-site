/**
 * Google Apps Script receiver for hotel experiment tracking.
 *
 * Creates (or uses) a sheet named "events" with columns:
 * received_at_ms, prolific_pid, study_id, session_id, page_url, phase, cond,
 * event_type, element_id, event_timestamp_ms, value_json, batch_reason, batch_seq
 *
 * Deploy as a Web App (Execute as: Me, Who has access: Anyone).
 * Then set that Web App URL in index.html:
 *   <meta name="tracking-stream-url" content="https://script.google.com/macros/s/.../exec" />
 */

const SHEET_NAME = "events";

function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : "";
    const payload = raw ? JSON.parse(raw) : {};
    const events = Array.isArray(payload.events) ? payload.events : [];
    const prolific = payload.prolific || {};

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    ensureHeader_(sh);

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
        (payload.seq_start != null ? (payload.seq_start + i) : "")
      ]);
    }

    if (rows.length) {
      sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true, appended: rows.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("ok").setMimeType(ContentService.MimeType.TEXT);
}

function ensureHeader_(sh) {
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

