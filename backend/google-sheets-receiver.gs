/**
 * Google Apps Script receiver for the hotel survey.
 *
 * New submissions are written to exactly three analysis sheets:
 * 1) Without_AI_Survey - one row per participant for the full-review survey.
 * 2) AI_Summary_Survey - one row per participant for the AI-summary survey.
 * 3) Browsing_Information - one row per completed hotel-popup visit.
 *
 * The sheets intentionally omit submission_id, session_id, and study_id.
 * Deploy as a Web App (Execute as: Me, Who has access: Anyone).
 */

const SCHEMA_VERSION = "8";
const WITHOUT_AI_SHEET = "Without_AI_Survey";
const AI_SUMMARY_SHEET = "AI_Summary_Survey";
const BROWSING_SHEET = "Browsing_Information";

const HOTELS = [
  { id: "pendry-chicago", slug: "pendry_chicago", name: "Pendry Chicago" },
  { id: "nobu-hotel-chicago", slug: "nobu_hotel_chicago", name: "Nobu Hotel Chicago" },
  { id: "arlo-chicago", slug: "arlo_chicago", name: "Arlo Chicago" }
];

const ATTRIBUTES = [
  { id: "cleanliness", likelihoodKey: "clean", label: "Cleanliness" },
  { id: "service_quality", likelihoodKey: "good_service_quality", label: "Service quality" },
  { id: "room_comfort", likelihoodKey: "comfortable_rooms", label: "Room comfort" },
  { id: "wifi_reliability", likelihoodKey: "reliable_wifi", label: "Wi-Fi reliability" },
  { id: "noise_level", likelihoodKey: "low_noise_level", label: "Low Noise Level" },
  { id: "location_convenience", likelihoodKey: "convenient_location", label: "Location convenience" },
  { id: "value_for_money", likelihoodKey: "good_value_for_money", label: "Value for money" },
  { id: "breakfast_quality", likelihoodKey: "high_quality_breakfast", label: "Breakfast quality" }
];

const SURVEY_HEADERS = buildSurveyHeaders_();

const BROWSING_HEADERS = [
  "visit_id",
  "recorded_at",
  "event_time",
  "survey_user_id",
  "prolific_id",
  "survey_condition",
  "browsing_stage",
  "hotel_id",
  "hotel_name",
  "duration_seconds",
  "scroll_depth_at_exit_pct",
  "scroll_depth_max_pct",
  "scroll_direction_changes",
  "scroll_speed_max_px_ms",
  "scroll_speed_mean_px_ms",
  "exit_reason",
  "browsing_details_json"
];

function buildSurveyHeaders_() {
  const headers = [
    "survey_user_id",
    "prolific_id",
    "first_recorded_at",
    "last_recorded_at",
    "completion_status",
    "completed_at",
    "frequent_booking_scenario_ids",
    "frequent_booking_scenario_labels",
    "frequent_booking_scenario_other",
    "prior_hotel_attributes",
    "assigned_trip_scenario_id",
    "assigned_trip_scenario_title",
    "assigned_attribute_1_id",
    "assigned_attribute_1_label",
    "assigned_attribute_2_id",
    "assigned_attribute_2_label",
    "assigned_attribute_3_id",
    "assigned_attribute_3_label",
    "scenario_profile_acknowledged",
    "hotels_asked"
  ];

  const stages = ["pre_review", "post_review"];
  for (let h = 0; h < HOTELS.length; h++) {
    for (let s = 0; s < stages.length; s++) {
      for (let slot = 1; slot <= 3; slot++) {
        headers.push(matrixColumn_(stages[s], HOTELS[h].slug, slot, "likelihood"));
        headers.push(matrixColumn_(stages[s], HOTELS[h].slug, slot, "confidence"));
      }
    }
  }

  headers.push(
    "chosen_hotel_id",
    "chosen_hotel_name",
    "revealed_attributes_acknowledged",
    "revealed_attributes_json",
    "satisfaction_1_to_7",
    "would_switch_hotel",
    "switch_confidence_0_to_100"
  );

  for (let i = 0; i < ATTRIBUTES.length; i++) {
    headers.push("surprise_" + ATTRIBUTES[i].id + "_0_to_10");
  }

  headers.push("bot_detection_flag", "bot_detection_details", "all_answers_json");
  return headers;
}

function matrixColumn_(stage, hotelSlug, slot, measure) {
  const range = measure === "likelihood" ? "1_to_5" : "1_to_3";
  return stage + "_" + hotelSlug + "_attribute_" + slot + "_" + measure + "_" + range;
}

function getSpreadsheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (id && String(id).trim()) return SpreadsheetApp.openById(String(id).trim());
  throw new Error(
    "No spreadsheet: create this script from the target Sheet, or set the SPREADSHEET_ID script property."
  );
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "";
    const payload = raw ? JSON.parse(raw) : {};
    const events = Array.isArray(payload.events) ? payload.events : [];
    const receivedAt = new Date();
    const ss = getSpreadsheet_();
    const condition = conditionFromPayload_(payload);
    const surveySheetName = condition === "ai_summary" ? AI_SUMMARY_SHEET : WITHOUT_AI_SHEET;
    const withoutAiSheet = ensureSheet_(ss, WITHOUT_AI_SHEET, SURVEY_HEADERS);
    const aiSummarySheet = ensureSheet_(ss, AI_SUMMARY_SHEET, SURVEY_HEADERS);
    const surveySheet = condition === "ai_summary" ? aiSummarySheet : withoutAiSheet;
    const browsingSheet = ensureSheet_(ss, BROWSING_SHEET, BROWSING_HEADERS);

    const surveyUpdated = updateSurveyRow_(surveySheet, events, payload, receivedAt);
    const browsingRows = buildBrowsingRows_(events, payload, receivedAt);
    const browsingAppended = appendUniqueRows_(browsingSheet, browsingRows, 1);

    return jsonResponse_({
      ok: true,
      survey_sheet: surveySheetName,
      survey_row_updated: surveyUpdated ? 1 : 0,
      browsing_rows_appended: browsingAppended,
      schema_version: SCHEMA_VERSION
    });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err), schema_version: SCHEMA_VERSION });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("ok").setMimeType(ContentService.MimeType.TEXT);
}

function jsonResponse_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function updateSurveyRow_(sheet, events, payload, receivedAt) {
  const surveyEvents = events.filter(event => {
    return event && (event.event_type === "survey_submit" || event.event_type === "survey_completion_snapshot");
  });
  if (!surveyEvents.length) return false;

  const surveyUserId = surveyUserIdFrom_(payload, surveyEvents);
  if (!surveyUserId) return false;

  const rowNumber = findRowByValue_(sheet, 1, surveyUserId);
  const record = rowNumber
    ? rowObject_(SURVEY_HEADERS, sheet.getRange(rowNumber, 1, 1, SURVEY_HEADERS.length).getValues()[0])
    : emptyRecord_(SURVEY_HEADERS);

  record.survey_user_id = textCell_(surveyUserId);
  record.prolific_id = textCell_(prolificIdFrom_(payload, surveyEvents) || record.prolific_id || "");
  record.first_recorded_at = record.first_recorded_at || receivedAt;
  record.last_recorded_at = receivedAt;
  record.completion_status = record.completion_status || "in_progress";
  record.hotels_asked = HOTELS.map(hotel => hotel.name).join(" | ");

  const allAnswers = parseJsonObject_(record.all_answers_json);

  for (let i = 0; i < surveyEvents.length; i++) {
    const event = surveyEvents[i] || {};
    const value = objectValue_(event.value);

    if (event.event_type === "survey_completion_snapshot") {
      const snapshotAnswers = objectValue_(value.answers);
      applyAssignment_(record, objectValue_(value.assignment));
      const questionIds = Object.keys(snapshotAnswers);
      for (let q = 0; q < questionIds.length; q++) {
        const questionId = questionIds[q];
        const answer = objectValue_(snapshotAnswers[questionId]);
        allAnswers[questionId] = answer;
        applyAnswer_(record, questionId, answer, objectValue_(value.assignment));
      }
      record.completion_status = value.completion_status || "complete";
      record.completed_at = dateValue_(value.completed_at) || dateValue_(event.timestamp) || receivedAt;
      continue;
    }

    const answer = objectValue_(value.answer);
    const assignment = objectValue_(value.assignment);
    applyAssignment_(record, assignment);

    if (event.element_id === "post_review_complete") {
      record.completion_status = "complete";
      record.completed_at = dateValue_(event.timestamp) || receivedAt;
      continue;
    }

    if (value.survey_page === "transition") continue;
    allAnswers[event.element_id || "unknown_question"] = answer;
    applyAnswer_(record, event.element_id || "", answer, assignment);
  }

  record.all_answers_json = jsonCell_(allAnswers);
  const values = SURVEY_HEADERS.map(header => record[header] === undefined ? "" : record[header]);
  const targetRow = rowNumber || sheet.getLastRow() + 1;
  ensureRowCapacity_(sheet, targetRow);
  sheet.getRange(targetRow, 1, 1, values.length).setValues([values]);
  formatSurveyRow_(sheet, targetRow);
  ensureFilter_(sheet);
  return true;
}

function applyAssignment_(record, assignment) {
  if (!assignment || !assignment.scenario_id) return;
  record.assigned_trip_scenario_id = textCell_(assignment.scenario_id || "");
  record.assigned_trip_scenario_title = textCell_(assignment.scenario_title || "");
  const ids = Array.isArray(assignment.attribute_ids) ? assignment.attribute_ids : [];
  const labels = Array.isArray(assignment.attribute_labels) ? assignment.attribute_labels : [];
  for (let i = 0; i < 3; i++) {
    record["assigned_attribute_" + (i + 1) + "_id"] = textCell_(ids[i] || "");
    record["assigned_attribute_" + (i + 1) + "_label"] = textCell_(labels[i] || attributeLabel_(ids[i]));
  }
}

function applyAnswer_(record, questionId, answer, assignment) {
  if (questionId === "prolific_id") {
    record.prolific_id = textCell_(answer.value || record.prolific_id || "");
  } else if (questionId === "hotel_scenarios_prior") {
    record.frequent_booking_scenario_ids = joinCell_(answer.selected_ids || []);
    record.frequent_booking_scenario_labels = joinCell_(answer.selected_labels || []);
    record.frequent_booking_scenario_other = textCell_(answer.other_text || "");
  } else if (questionId === "hotel_attributes_prior") {
    record.prior_hotel_attributes = textCell_(answer.value || "");
  } else if (answer.scenario_id && answer.value === true) {
    record.scenario_profile_acknowledged = 1;
    record.assigned_trip_scenario_id = textCell_(answer.scenario_id);
    record.assigned_trip_scenario_title = textCell_(answer.scenario_title || "");
  } else if (/^(hotelq|postreview)_/.test(questionId)) {
    applyMatrixAnswer_(record, questionId, answer, assignment);
  } else if (questionId === "post_review_choice") {
    record.chosen_hotel_id = textCell_(answer.hotel_id || "");
    record.chosen_hotel_name = textCell_(answer.hotel_name || hotelName_(answer.hotel_id));
  } else if (questionId === "post_review_reveal") {
    record.revealed_attributes_acknowledged = answer.value === true ? 1 : 0;
    record.revealed_attributes_json = jsonCell_(answer.true_attributes || {});
  } else if (questionId === "post_review_satisfaction") {
    record.satisfaction_1_to_7 = numberOrBlank_(answer.value);
  } else if (questionId === "post_review_switch") {
    record.would_switch_hotel = textCell_(answer.value || "");
  } else if (questionId === "post_review_confidence_surprise") {
    record.switch_confidence_0_to_100 = numberOrBlank_(answer.switch_confidence);
    const surprise = objectValue_(answer.surprise_values);
    for (let i = 0; i < ATTRIBUTES.length; i++) {
      record["surprise_" + ATTRIBUTES[i].id + "_0_to_10"] = numberOrBlank_(surprise[ATTRIBUTES[i].id]);
    }
  }

  if (answer.bot_detection_triggered || answer.bot_detection_response) {
    record.bot_detection_flag = 1;
    const detail = questionId + ": " + (answer.bot_detection_response || "triggered");
    const existing = String(record.bot_detection_details || "");
    if (existing.indexOf(detail) === -1) {
      record.bot_detection_details = textCell_(existing ? existing + " | " + detail : detail);
    }
  }
}

function applyMatrixAnswer_(record, questionId, answer, assignment) {
  const match = questionId.match(/^(hotelq|postreview)_(.+)_(likelihood|confidence)$/);
  if (!match) return;
  const stage = match[1] === "hotelq" ? "pre_review" : "post_review";
  const hotel = hotelForId_(answer.hotel_id || match[2]);
  if (!hotel) return;

  const assignedIds = Array.isArray(answer.assigned_attribute_ids) && answer.assigned_attribute_ids.length
    ? answer.assigned_attribute_ids
    : Array.isArray(assignment.attribute_ids)
      ? assignment.attribute_ids
      : assignedAttributeIdsFromRecord_(record);
  const values = objectValue_(answer.values);

  for (let i = 0; i < Math.min(3, assignedIds.length); i++) {
    const attribute = attributeForId_(assignedIds[i]);
    if (!attribute) continue;
    const raw = match[3] === "likelihood" ? values[attribute.likelihoodKey] : values[attribute.id];
    record[matrixColumn_(stage, hotel.slug, i + 1, match[3])] = match[3] === "likelihood"
      ? likelihoodNumeric_(raw)
      : confidenceNumeric_(raw);
  }
}

function buildBrowsingRows_(events, payload, receivedAt) {
  const rows = [];
  const surveyUserId = surveyUserIdFrom_(payload, events);
  if (!surveyUserId) return rows;
  const condition = conditionFromPayload_(payload);
  const browsingStage = browsingStageFromPayload_(payload);
  const prolificId = prolificIdFrom_(payload, events);

  for (let i = 0; i < events.length; i++) {
    const event = events[i] || {};
    if (event.event_type !== "page_timing") continue;
    const value = objectValue_(event.value);
    if (value.context !== "hotel_modal") continue;
    const hotelId = event.element_id || value.hotel_id || "";
    const visitId = event.event_id || recordId_([
      surveyUserId,
      condition,
      browsingStage,
      hotelId,
      event.timestamp || "",
      value.duration_ms || ""
    ]);
    rows.push([
      textCell_(visitId),
      receivedAt,
      dateValue_(event.timestamp),
      textCell_(surveyUserId),
      textCell_(prolificId),
      textCell_(condition),
      textCell_(browsingStage),
      textCell_(hotelId),
      textCell_(hotelName_(hotelId)),
      value.duration_ms == null ? "" : Number(value.duration_ms) / 1000,
      numberOrBlank_(value.scroll_depth_pct_at_exit),
      numberOrBlank_(value.scroll_max_pct),
      numberOrBlank_(value.scroll_dir_changes),
      numberOrBlank_(value.scroll_max_px_per_ms),
      numberOrBlank_(value.scroll_mean_px_per_ms),
      textCell_(value.exit_reason || ""),
      jsonCell_(value)
    ]);
  }
  return rows;
}

function conditionFromPayload_(payload) {
  const prolific = objectValue_(payload.prolific);
  const explicit = String(prolific.study_condition || payload.cond || "").toLowerCase();
  if (explicit === "ai_summary") return "ai_summary";
  const text = String(payload.page_url || "").toLowerCase();
  if (/[?&]study_version=3(?:&|$)/.test(text) || text.indexOf("search-ai-summaries") >= 0 || text.indexOf("post_review_ai") >= 0) {
    return "ai_summary";
  }
  return "full_reviews";
}

function browsingStageFromPayload_(payload) {
  const text = String(payload.page_url || "");
  const match = text.match(/[?&]survey_stage=([^&#]+)/i);
  let stage = "";
  if (match) {
    try { stage = decodeURIComponent(match[1]); }
    catch (_) { stage = match[1]; }
  }
  if (stage === "search_1") return "no_reviews";
  if (stage === "search_3") return "ai_summary_reviews";
  if (stage === "search_2") return "full_reviews";
  return stage;
}

function surveyUserIdFrom_(payload, events) {
  const prolific = objectValue_(payload.prolific);
  if (prolific.survey_user_id) return String(prolific.survey_user_id);
  for (let i = 0; i < events.length; i++) {
    const value = objectValue_((events[i] || {}).value);
    if (value.survey_user_id) return String(value.survey_user_id);
    const nestedProlific = objectValue_(value.prolific);
    if (nestedProlific.survey_user_id) return String(nestedProlific.survey_user_id);
  }
  return "";
}

function prolificIdFrom_(payload, events) {
  const prolific = objectValue_(payload.prolific);
  if (prolific.prolific_pid) return String(prolific.prolific_pid);
  for (let i = 0; i < events.length; i++) {
    const event = events[i] || {};
    const value = objectValue_(event.value);
    const answer = objectValue_(value.answer);
    if (event.element_id === "prolific_id" && answer.value) return String(answer.value);
    const nestedProlific = objectValue_(value.prolific);
    if (nestedProlific.prolific_pid) return String(nestedProlific.prolific_pid);
  }
  return "";
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  const created = !sheet;
  if (!sheet) sheet = ss.insertSheet(name);
  ensureColumnCapacity_(sheet, headers.length);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const width = Math.min(sheet.getLastColumn(), headers.length);
    const existing = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
    for (let i = 0; i < existing.length; i++) {
      if (existing[i] && existing[i] !== headers[i]) {
        throw new Error("Sheet '" + name + "' has an incompatible header in column " + (i + 1) + ".");
      }
    }
    if (sheet.getLastColumn() < headers.length) {
      sheet.getRange(1, sheet.getLastColumn() + 1, 1, headers.length - sheet.getLastColumn())
        .setValues([headers.slice(sheet.getLastColumn())]);
    }
  }

  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground("#174ea6")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setVerticalAlignment("middle");
  if (created) applySheetLayout_(sheet, name, headers);
  return sheet;
}

function applySheetLayout_(sheet, name, headers) {
  for (let i = 1; i <= headers.length; i++) sheet.setColumnWidth(i, name === BROWSING_SHEET ? 145 : 125);
  sheet.setFrozenColumns(name === BROWSING_SHEET ? 5 : 2);
  setWidthByHeader_(sheet, headers, "survey_user_id", 330);
  setWidthByHeader_(sheet, headers, "prolific_id", 220);
  setWidthByHeader_(sheet, headers, "assigned_trip_scenario_title", 250);
  setWidthByHeader_(sheet, headers, "prior_hotel_attributes", 340);
  setWidthByHeader_(sheet, headers, "bot_detection_details", 320);
  setWidthByHeader_(sheet, headers, "all_answers_json", 500);
  setWidthByHeader_(sheet, headers, "browsing_details_json", 420);
}

function appendUniqueRows_(sheet, rows, idColumn) {
  if (!rows.length) return 0;
  const existing = new Set();
  if (sheet.getLastRow() > 1) {
    const values = sheet.getRange(2, idColumn, sheet.getLastRow() - 1, 1).getDisplayValues();
    for (let i = 0; i < values.length; i++) if (values[i][0]) existing.add(values[i][0]);
  }
  const unique = rows.filter(row => {
    const id = String(row[idColumn - 1] || "");
    if (!id || existing.has(id)) return false;
    existing.add(id);
    return true;
  });
  if (!unique.length) return 0;
  const startRow = sheet.getLastRow() + 1;
  ensureRowCapacity_(sheet, startRow + unique.length - 1);
  sheet.getRange(startRow, 1, unique.length, unique[0].length).setValues(unique);
  formatBrowsingRows_(sheet, startRow, unique.length);
  ensureFilter_(sheet);
  return unique.length;
}

function formatSurveyRow_(sheet, row) {
  formatDateHeader_(sheet, SURVEY_HEADERS, row, 1, "first_recorded_at");
  formatDateHeader_(sheet, SURVEY_HEADERS, row, 1, "last_recorded_at");
  formatDateHeader_(sheet, SURVEY_HEADERS, row, 1, "completed_at");
  wrapHeader_(sheet, SURVEY_HEADERS, row, 1, "prior_hotel_attributes");
  wrapHeader_(sheet, SURVEY_HEADERS, row, 1, "all_answers_json");
}

function formatBrowsingRows_(sheet, startRow, count) {
  formatDateHeader_(sheet, BROWSING_HEADERS, startRow, count, "recorded_at");
  formatDateHeader_(sheet, BROWSING_HEADERS, startRow, count, "event_time");
  wrapHeader_(sheet, BROWSING_HEADERS, startRow, count, "browsing_details_json");
}

function formatDateHeader_(sheet, headers, startRow, count, header) {
  const column = headers.indexOf(header) + 1;
  if (column > 0) sheet.getRange(startRow, column, count, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
}

function wrapHeader_(sheet, headers, startRow, count, header) {
  const column = headers.indexOf(header) + 1;
  if (column > 0) sheet.getRange(startRow, column, count, 1).setWrap(true).setVerticalAlignment("top");
}

function setWidthByHeader_(sheet, headers, header, width) {
  const column = headers.indexOf(header) + 1;
  if (column > 0) sheet.setColumnWidth(column, width);
}

function ensureFilter_(sheet) {
  if (sheet.getLastRow() < 2) return;
  const existing = sheet.getFilter();
  if (existing) {
    const range = existing.getRange();
    if (range.getNumRows() >= sheet.getMaxRows() && range.getNumColumns() >= sheet.getLastColumn()) return;
    existing.remove();
  }
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getLastColumn()).createFilter();
}

function ensureColumnCapacity_(sheet, required) {
  if (required > sheet.getMaxColumns()) sheet.insertColumnsAfter(sheet.getMaxColumns(), required - sheet.getMaxColumns());
}

function ensureRowCapacity_(sheet, required) {
  if (required > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), Math.max(1000, required - sheet.getMaxRows()));
}

function findRowByValue_(sheet, column, value) {
  if (sheet.getLastRow() < 2) return 0;
  const match = sheet.getRange(2, column, sheet.getLastRow() - 1, 1)
    .createTextFinder(String(value))
    .matchEntireCell(true)
    .findNext();
  return match ? match.getRow() : 0;
}

function assignedAttributeIdsFromRecord_(record) {
  return [record.assigned_attribute_1_id, record.assigned_attribute_2_id, record.assigned_attribute_3_id].filter(Boolean);
}

function hotelForId_(id) {
  for (let i = 0; i < HOTELS.length; i++) if (HOTELS[i].id === String(id || "")) return HOTELS[i];
  return null;
}

function hotelName_(id) {
  const hotel = hotelForId_(id);
  return hotel ? hotel.name : "";
}

function attributeForId_(id) {
  for (let i = 0; i < ATTRIBUTES.length; i++) if (ATTRIBUTES[i].id === String(id || "")) return ATTRIBUTES[i];
  return null;
}

function attributeLabel_(id) {
  const attribute = attributeForId_(id);
  return attribute ? attribute.label : "";
}

function likelihoodNumeric_(value) {
  const map = { extremely_unlikely: 1, somewhat_unlikely: 2, neither: 3, somewhat_likely: 4, extremely_likely: 5 };
  return map[String(value || "")] || "";
}

function confidenceNumeric_(value) {
  const map = { low: 1, medium: 2, high: 3 };
  return map[String(value || "")] || "";
}

function emptyRecord_(headers) {
  const record = {};
  for (let i = 0; i < headers.length; i++) record[headers[i]] = "";
  return record;
}

function rowObject_(headers, row) {
  const record = {};
  for (let i = 0; i < headers.length; i++) record[headers[i]] = row[i];
  return record;
}

function objectValue_(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function parseJsonObject_(value) {
  if (!value) return {};
  try { return objectValue_(JSON.parse(String(value))); }
  catch (_) { return {}; }
}

function dateValue_(value) {
  if (value === "" || value == null) return "";
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? "" : date;
}

function numberOrBlank_(value) {
  if (value === "" || value == null) return "";
  const number = Number(value);
  return isNaN(number) ? "" : number;
}

function textCell_(value) {
  if (value === "" || value == null) return "";
  const text = String(value);
  return /^[=+@-]/.test(text) ? "'" + text : text;
}

function joinCell_(values) {
  return Array.isArray(values) ? values.map(value => String(value)).join(" | ") : "";
}

function jsonCell_(value) {
  return JSON.stringify(value === undefined ? null : value);
}

function recordId_(parts) {
  const input = parts.map(part => String(part == null ? "" : part)).join("|");
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    input,
    Utilities.Charset.UTF_8
  );
  let hex = "";
  for (let i = 0; i < digest.length; i++) {
    const byte = digest[i] < 0 ? digest[i] + 256 : digest[i];
    hex += ("0" + byte.toString(16)).slice(-2);
  }
  return hex.slice(0, 24);
}
