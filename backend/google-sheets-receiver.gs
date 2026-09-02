/**
 * Google Apps Script receiver for hotel experiment tracking.
 *
 * Analysis-ready sheets:
 * 1) Participants - one up-to-date row per participant/session.
 * 2) Questionnaire_responses - one row per individual answer item.
 * 3) Hotel_visits - one row per completed hotel modal visit.
 * 4) events - one row per raw streamed event for auditing.
 * 5) Codebook - attribute definitions, stages, and scale coding.
 *
 * Deploy as a Web App (Execute as: Me, Who has access: Anyone).
 * After editing, use Deploy -> Manage deployments -> Edit -> New version -> Deploy.
 *
 * Site meta (or ?stream=):
 *   <meta name="tracking-stream-url" content="https://script.google.com/macros/s/.../exec" />
 */

const SCHEMA_VERSION = "6";
const PARTICIPANTS_SHEET = "Participants";
const QUESTIONNAIRE_SHEET = "Questionnaire_responses";
const VISITS_SHEET = "Hotel_visits";
const EVENTS_SHEET = "events";
const CODEBOOK_SHEET = "Codebook";

const HOTEL_NAMES = {
  "pendry-chicago": "Pendry Chicago",
  "nobu-hotel-chicago": "Nobu Hotel Chicago",
  "arlo-chicago": "Arlo Chicago"
};

const ATTRIBUTES = [
  {
    id: "cleanliness",
    label: "Cleanliness",
    likelihoodKey: "clean",
    definition: "How clean and well maintained the room, bathroom, bedding, and shared hotel spaces are."
  },
  {
    id: "service_quality",
    label: "Service quality",
    likelihoodKey: "good_service_quality",
    definition: "How friendly, helpful, attentive, professional, and responsive the hotel staff are."
  },
  {
    id: "room_comfort",
    label: "Room comfort",
    likelihoodKey: "comfortable_rooms",
    definition: "The comfort of the bed, room space, temperature, bathroom, furniture, and in-room amenities."
  },
  {
    id: "wifi_reliability",
    label: "Wi-Fi reliability",
    likelihoodKey: "reliable_wifi",
    definition: "Whether the internet connection is stable, fast, and dependable throughout the stay."
  },
  {
    id: "noise_level",
    label: "Low Noise Level",
    likelihoodKey: "low_noise_level",
    definition: "Whether the room is quiet, with little disruption from streets, hallways, neighboring rooms, or hotel facilities."
  },
  {
    id: "location_convenience",
    label: "Location convenience",
    likelihoodKey: "convenient_location",
    definition: "How easy it is to reach relevant destinations, attractions, restaurants, public transit, or a conference venue."
  },
  {
    id: "value_for_money",
    label: "Value for money",
    likelihoodKey: "good_value_for_money",
    definition: "Whether the hotel experience is worth its price given the room, amenities, location, and service."
  },
  {
    id: "breakfast_quality",
    label: "Breakfast quality",
    likelihoodKey: "high_quality_breakfast",
    definition: "The quality, variety, convenience, and perceived value of the breakfast offered."
  }
];

const BOOKING_SCENARIOS = [
  { id: "business", label: "Business trips or conferences" },
  { id: "family_with_children", label: "Family trips with children" },
  { id: "romantic_partner", label: "Romantic trips with a partner" },
  { id: "solo_leisure", label: "Solo leisure or city trips" },
  { id: "friends", label: "Trips with friends" },
  { id: "elderly_relatives", label: "Trips with elderly parents or relatives" },
  { id: "other", label: "Other" }
];

const PARTICIPANT_HEADERS = [
  "participant_key",
  "prolific_pid",
  "study_id",
  "session_id",
  "first_recorded_at",
  "last_recorded_at",
  "completion_status",
  "last_survey_stage",
  "last_question_id",
  "assigned_scenario_id",
  "assigned_scenario_title",
  "assigned_attribute_1_id",
  "assigned_attribute_1_label",
  "assigned_attribute_2_id",
  "assigned_attribute_2_label",
  "assigned_attribute_3_id",
  "assigned_attribute_3_label",
  "prior_hotel_attributes",
  "selected_hotel_id",
  "selected_hotel_name",
  "satisfaction_1_7",
  "would_switch",
  "switch_confidence_0_100",
  "surprise_cleanliness_0_10",
  "surprise_service_quality_0_10",
  "surprise_room_comfort_0_10",
  "surprise_wifi_reliability_0_10",
  "surprise_noise_level_0_10",
  "surprise_location_convenience_0_10",
  "surprise_value_for_money_0_10",
  "surprise_breakfast_quality_0_10",
  "completed_at",
  "frequent_booking_scenarios",
  "frequent_booking_scenario_other",
  "bot_detection_flag",
  "bot_detection_details",
  "survey_user_id"
];

const QUESTIONNAIRE_HEADERS = [
  "response_id",
  "recorded_at",
  "submitted_at",
  "prolific_pid",
  "study_id",
  "session_id",
  "participant_key",
  "question_id",
  "survey_page",
  "questionnaire_stage",
  "hotel_id",
  "hotel_name",
  "matrix",
  "response_type",
  "attribute_id",
  "attribute_label",
  "response_code",
  "response_numeric",
  "response_label",
  "response_text",
  "scale_min",
  "scale_max",
  "assigned_scenario_id",
  "assigned_scenario_title",
  "assigned_attribute_ids",
  "assigned_attribute_labels",
  "answer_json",
  "schema_version",
  "survey_user_id"
];

const VISIT_HEADERS = [
  "visit_id",
  "recorded_at",
  "event_time",
  "prolific_pid",
  "study_id",
  "session_id",
  "participant_key",
  "survey_stage",
  "hotel_id",
  "hotel_name",
  "duration_seconds",
  "scroll_depth_at_exit_pct",
  "scroll_depth_max_pct",
  "scroll_direction_changes",
  "scroll_speed_max_px_ms",
  "scroll_speed_mean_px_ms",
  "exit_reason",
  "schema_version",
  "survey_user_id"
];

const EVENT_HEADERS = [
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
  "batch_seq",
  "record_id",
  "schema_version",
  "survey_user_id"
];

const CODEBOOK_HEADERS = [
  "category",
  "field_or_code",
  "display_label",
  "coding_or_range",
  "definition"
];

/**
 * Spreadsheet to write to.
 * - Best: create this script from the Sheet (Extensions -> Apps Script) so getActiveSpreadsheet() works.
 * - Otherwise: Project Settings -> Script properties -> add SPREADSHEET_ID = id from the Sheet URL.
 */
function getSpreadsheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (id && String(id).trim()) return SpreadsheetApp.openById(String(id).trim());
  throw new Error(
    "No spreadsheet: open this project from the target Sheet (Extensions -> Apps Script), " +
      "or set Script property SPREADSHEET_ID to the Sheet ID."
  );
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "";
    const payload = raw ? JSON.parse(raw) : {};
    const events = Array.isArray(payload.events) ? payload.events : [];
    const receivedAtMs = Date.now();
    const receivedAt = new Date(receivedAtMs);
    const ss = getSpreadsheet_();

    const eventSheet = ensureSheet_(ss, EVENTS_SHEET, EVENT_HEADERS);
    const questionnaireSheet = ensureSheet_(ss, QUESTIONNAIRE_SHEET, QUESTIONNAIRE_HEADERS);
    const visitSheet = ensureSheet_(ss, VISITS_SHEET, VISIT_HEADERS);
    const participantSheet = ensureSheet_(ss, PARTICIPANTS_SHEET, PARTICIPANT_HEADERS);
    ensureCodebook_(ss);

    const eventRows = buildEventRows_(events, payload, receivedAtMs);
    const responseRows = buildQuestionnaireRows_(events, payload, receivedAt);
    const visitRows = buildVisitRows_(events, payload, receivedAt);

    const eventsAppended = appendUniqueRows_(eventSheet, eventRows, 14);
    const responsesAppended = appendUniqueRows_(questionnaireSheet, responseRows, 1);
    const visitsAppended = appendUniqueRows_(visitSheet, visitRows, 1);
    updateParticipant_(participantSheet, events, payload, receivedAt);

    return jsonResponse_({
      ok: true,
      events_appended: eventsAppended,
      questionnaire_responses_appended: responsesAppended,
      hotel_visits_appended: visitsAppended,
      participant_summary_updated: participantKey_(payload.prolific || {}) ? 1 : 0,
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

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  const created = !sh;
  if (!sh) sh = ss.insertSheet(name);

  ensureColumnCapacity_(sh, headers.length);
  ensureCompatibleHeader_(sh, headers);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, headers.length)
    .setBackground("#174ea6")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setVerticalAlignment("middle");

  if (created) applySheetLayout_(sh, name, headers);
  return sh;
}

function ensureCompatibleHeader_(sh, headers) {
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }

  const existingWidth = Math.min(sh.getLastColumn(), headers.length);
  const existing = sh.getRange(1, 1, 1, existingWidth).getDisplayValues()[0];
  for (let i = 0; i < existing.length; i++) {
    if (existing[i] && existing[i] !== headers[i]) {
      throw new Error(
        "Sheet '" + sh.getName() + "' has an incompatible header in column " + (i + 1) +
        ". Expected '" + headers[i] + "' but found '" + existing[i] + "'."
      );
    }
  }
  if (sh.getLastColumn() < headers.length) {
    sh.getRange(1, sh.getLastColumn() + 1, 1, headers.length - sh.getLastColumn())
      .setValues([headers.slice(sh.getLastColumn())]);
  }
}

function applySheetLayout_(sh, name, headers) {
  const defaultWidth = name === EVENTS_SHEET ? 130 : 150;
  for (let i = 1; i <= headers.length; i++) sh.setColumnWidth(i, defaultWidth);

  if (name === PARTICIPANTS_SHEET) {
    sh.setFrozenColumns(4);
    setWidthByHeader_(sh, headers, "participant_key", 210);
    setWidthByHeader_(sh, headers, "survey_user_id", 330);
    setWidthByHeader_(sh, headers, "assigned_scenario_title", 240);
    setWidthByHeader_(sh, headers, "prior_hotel_attributes", 320);
    setWidthByHeader_(sh, headers, "selected_hotel_name", 200);
    setWidthByHeader_(sh, headers, "bot_detection_details", 360);
  }

  if (name === QUESTIONNAIRE_SHEET) {
    sh.setFrozenColumns(7);
    setWidthByHeader_(sh, headers, "response_id", 190);
    setWidthByHeader_(sh, headers, "survey_user_id", 330);
    setWidthByHeader_(sh, headers, "question_id", 260);
    setWidthByHeader_(sh, headers, "attribute_label", 190);
    setWidthByHeader_(sh, headers, "response_label", 220);
    setWidthByHeader_(sh, headers, "response_text", 340);
    setWidthByHeader_(sh, headers, "answer_json", 420);
  }

  if (name === VISITS_SHEET) {
    sh.setFrozenColumns(7);
    setWidthByHeader_(sh, headers, "visit_id", 190);
    setWidthByHeader_(sh, headers, "survey_user_id", 330);
    setWidthByHeader_(sh, headers, "hotel_name", 210);
    setWidthByHeader_(sh, headers, "exit_reason", 200);
  }

  if (name === EVENTS_SHEET) {
    sh.setFrozenColumns(4);
    setWidthByHeader_(sh, headers, "page_url", 340);
    setWidthByHeader_(sh, headers, "value_json", 440);
    setWidthByHeader_(sh, headers, "record_id", 190);
    setWidthByHeader_(sh, headers, "survey_user_id", 330);
  }

  if (name === CODEBOOK_SHEET) {
    sh.setFrozenColumns(2);
    setWidthByHeader_(sh, headers, "category", 150);
    setWidthByHeader_(sh, headers, "field_or_code", 240);
    setWidthByHeader_(sh, headers, "display_label", 230);
    setWidthByHeader_(sh, headers, "coding_or_range", 250);
    setWidthByHeader_(sh, headers, "definition", 520);
  }
}

function setWidthByHeader_(sh, headers, header, width) {
  const index = headers.indexOf(header);
  if (index >= 0) sh.setColumnWidth(index + 1, width);
}

function appendRows_(sh, rows) {
  if (!rows.length) return 0;
  const startRow = sh.getLastRow() + 1;
  ensureRowCapacity_(sh, startRow + rows.length - 1);
  sh.getRange(startRow, 1, rows.length, rows[0].length).setValues(rows);
  formatAppendedRows_(sh, startRow, rows.length);
  ensureFilter_(sh);
  return rows.length;
}

function appendUniqueRows_(sh, rows, idColumn) {
  if (!rows.length) return 0;
  const existing = new Set();
  if (sh.getLastRow() > 1) {
    const values = sh.getRange(2, idColumn, sh.getLastRow() - 1, 1).getDisplayValues();
    for (let i = 0; i < values.length; i++) if (values[i][0]) existing.add(values[i][0]);
  }

  const uniqueRows = [];
  for (let i = 0; i < rows.length; i++) {
    const id = String(rows[i][idColumn - 1] || "");
    if (!id || existing.has(id)) continue;
    existing.add(id);
    uniqueRows.push(rows[i]);
  }
  return appendRows_(sh, uniqueRows);
}

function formatAppendedRows_(sh, startRow, rowCount) {
  const name = sh.getName();
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0];
  const dateHeaders = name === PARTICIPANTS_SHEET
    ? ["first_recorded_at", "last_recorded_at", "completed_at"]
    : name === QUESTIONNAIRE_SHEET
      ? ["recorded_at", "submitted_at"]
      : name === VISITS_SHEET
        ? ["recorded_at", "event_time"]
        : [];

  for (let i = 0; i < dateHeaders.length; i++) {
    const col = headers.indexOf(dateHeaders[i]) + 1;
    if (col > 0) sh.getRange(startRow, col, rowCount, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
  }

  if (name === QUESTIONNAIRE_SHEET) {
    setNumberFormatByHeader_(sh, headers, startRow, rowCount, "response_numeric", "0.###");
    setNumberFormatByHeader_(sh, headers, startRow, rowCount, "scale_min", "0.###");
    setNumberFormatByHeader_(sh, headers, startRow, rowCount, "scale_max", "0.###");
    wrapByHeader_(sh, headers, startRow, rowCount, "response_text");
    wrapByHeader_(sh, headers, startRow, rowCount, "answer_json");
  }

  if (name === VISITS_SHEET) {
    setNumberFormatByHeader_(sh, headers, startRow, rowCount, "duration_seconds", "0.000");
    setNumberFormatByHeader_(sh, headers, startRow, rowCount, "scroll_depth_at_exit_pct", "0.0");
    setNumberFormatByHeader_(sh, headers, startRow, rowCount, "scroll_depth_max_pct", "0.0");
    setNumberFormatByHeader_(sh, headers, startRow, rowCount, "scroll_speed_max_px_ms", "0.000000");
    setNumberFormatByHeader_(sh, headers, startRow, rowCount, "scroll_speed_mean_px_ms", "0.000000");
  }

  if (name === PARTICIPANTS_SHEET) {
    const numericHeaders = [
      "satisfaction_1_7",
      "switch_confidence_0_100",
      "surprise_cleanliness_0_10",
      "surprise_service_quality_0_10",
      "surprise_room_comfort_0_10",
      "surprise_wifi_reliability_0_10",
      "surprise_noise_level_0_10",
      "surprise_location_convenience_0_10",
      "surprise_value_for_money_0_10",
      "surprise_breakfast_quality_0_10"
    ];
    for (let i = 0; i < numericHeaders.length; i++) {
      setNumberFormatByHeader_(sh, headers, startRow, rowCount, numericHeaders[i], "0");
    }
  }
}

function setNumberFormatByHeader_(sh, headers, startRow, rowCount, header, format) {
  const col = headers.indexOf(header) + 1;
  if (col > 0) sh.getRange(startRow, col, rowCount, 1).setNumberFormat(format);
}

function wrapByHeader_(sh, headers, startRow, rowCount, header) {
  const col = headers.indexOf(header) + 1;
  if (col > 0) sh.getRange(startRow, col, rowCount, 1).setWrap(true).setVerticalAlignment("top");
}

function ensureFilter_(sh) {
  if (sh.getName() === CODEBOOK_SHEET || sh.getLastRow() < 2) return;
  const existing = sh.getFilter();
  if (existing) {
    const range = existing.getRange();
    if (range.getNumRows() >= sh.getMaxRows() && range.getNumColumns() >= sh.getLastColumn()) return;
    existing.remove();
  }
  sh.getRange(1, 1, sh.getMaxRows(), sh.getLastColumn()).createFilter();
}

function ensureColumnCapacity_(sh, requiredColumns) {
  if (requiredColumns <= sh.getMaxColumns()) return;
  sh.insertColumnsAfter(sh.getMaxColumns(), requiredColumns - sh.getMaxColumns());
}

function ensureRowCapacity_(sh, requiredRows) {
  if (requiredRows <= sh.getMaxRows()) return;
  const additional = Math.max(1000, requiredRows - sh.getMaxRows());
  sh.insertRowsAfter(sh.getMaxRows(), additional);
}

function buildEventRows_(events, payload, receivedAtMs) {
  const out = [];
  const prolific = payload.prolific || {};
  for (let i = 0; i < events.length; i++) {
    const ev = events[i] || {};
    const recordId = ev.event_id
      ? recordId_([participantKey_(prolific), ev.event_id])
      : recordId_([
          participantKey_(prolific),
          ev.timestamp || "",
          ev.event_type || "",
          ev.element_id || "",
          i
        ]);
    out.push([
      receivedAtMs,
      textCell_(prolific.prolific_pid || ""),
      textCell_(prolific.study_id || ""),
      textCell_(prolific.session_id || ""),
      textCell_(payload.page_url || ""),
      textCell_(payload.phase || ""),
      textCell_(payload.cond || ""),
      textCell_(ev.event_type || ""),
      textCell_(ev.element_id || ""),
      ev.timestamp || "",
      jsonCell_(ev.value),
      textCell_(payload.reason || ""),
      payload.seq_start != null ? payload.seq_start + i : "",
      recordId,
      SCHEMA_VERSION,
      textCell_(prolific.survey_user_id || ev.survey_user_id || "")
    ]);
  }
  return out;
}

/**
 * Expands every survey submission into one tidy row per answer item.
 */
function buildQuestionnaireRows_(events, payload, receivedAt) {
  const out = [];
  const prolific = payload.prolific || {};
  const participantKey = participantKey_(prolific);

  for (let i = 0; i < events.length; i++) {
    const ev = events[i] || {};
    if (ev.event_type !== "survey_submit") continue;

    const value = objectValue_(ev.value);
    if (value.survey_page === "transition") continue;
    const answer = objectValue_(value.answer);
    const assignment = objectValue_(value.assignment);
    const base = {
      recordedAt: receivedAt,
      submittedAt: dateValue_(answer.submitted_at),
      prolific: prolific,
      participantKey: participantKey,
      questionId: ev.element_id || "",
      surveyPage: value.survey_page || "",
      stage: answer.questionnaire_stage || inferQuestionnaireStage_(ev.element_id, payload.page_url),
      hotelId: answer.hotel_id || "",
      hotelName: answer.hotel_name || hotelName_(answer.hotel_id),
      matrix: answer.matrix || "",
      assignment: assignment,
      answer: answer,
      eventTimestamp: ev.timestamp || ""
    };

    if (answer.bot_detection_triggered || answer.bot_detection_response) {
      addQuestionnaireRow_(out, base, {
        matrix: "quality_control",
        responseType: "bot_detection",
        responseCode: "triggered",
        responseNumeric: 1,
        responseLabel: "Bot-detection instruction followed",
        responseText: answer.bot_detection_response || "",
        scaleMin: 0,
        scaleMax: 1
      });
    }

    if (answer.values && typeof answer.values === "object") {
      const keys = Object.keys(answer.values);
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        const attribute = attributeForKey_(key);
        const response = codedResponse_(answer.matrix, answer.values[key]);
        addQuestionnaireRow_(out, base, {
          responseType: answer.matrix || "matrix",
          attributeId: attribute ? attribute.id : key,
          attributeLabel: attribute ? attribute.label : key,
          responseCode: answer.values[key],
          responseNumeric: response.numeric,
          responseLabel: response.label,
          scaleMin: response.min,
          scaleMax: response.max
        });
      }
      continue;
    }

    if (answer.surprise_values && typeof answer.surprise_values === "object") {
      addQuestionnaireRow_(out, base, {
        responseType: "switch_confidence",
        attributeId: "switch_confidence",
        attributeLabel: "Confidence in switching decision",
        responseCode: answer.switch_confidence,
        responseNumeric: numberOrBlank_(answer.switch_confidence),
        responseLabel: answer.switch_confidence,
        scaleMin: 0,
        scaleMax: 100
      });
      const surpriseKeys = Object.keys(answer.surprise_values);
      for (let j = 0; j < surpriseKeys.length; j++) {
        const key = surpriseKeys[j];
        const attribute = attributeForKey_(key);
        addQuestionnaireRow_(out, base, {
          matrix: "surprise",
          responseType: "attribute_surprise",
          attributeId: attribute ? attribute.id : key,
          attributeLabel: attribute ? attribute.label : key,
          responseCode: answer.surprise_values[key],
          responseNumeric: numberOrBlank_(answer.surprise_values[key]),
          responseLabel: answer.surprise_values[key],
          scaleMin: 0,
          scaleMax: 10
        });
      }
      continue;
    }

    addSimpleAnswerRows_(out, base, answer);
  }
  return out;
}

function addSimpleAnswerRows_(out, base, answer) {
  const questionId = base.questionId;
  if (questionId === "prolific_id") {
    addQuestionnaireRow_(out, base, {
      responseType: "identifier",
      responseText: answer.value || "",
      responseLabel: answer.value || ""
    });
    return;
  }

  if (questionId === "hotel_scenarios_prior") {
    const selectedIds = Array.isArray(answer.selected_ids) ? answer.selected_ids : [];
    const selectedLabels = Array.isArray(answer.selected_labels) ? answer.selected_labels : [];
    for (let i = 0; i < selectedIds.length; i++) {
      addQuestionnaireRow_(out, base, {
        matrix: "booking_scenario",
        responseType: "booking_scenario",
        responseCode: selectedIds[i],
        responseLabel: selectedLabels[i] || bookingScenarioLabel_(selectedIds[i])
      });
    }
    if (answer.other_text) {
      addQuestionnaireRow_(out, base, {
        matrix: "booking_scenario",
        responseType: "booking_scenario_other",
        responseCode: "other_text",
        responseLabel: "Other booking scenario",
        responseText: answer.other_text
      });
    }
    return;
  }

  if (questionId === "hotel_attributes_prior") {
    addQuestionnaireRow_(out, base, {
      responseType: "open_text",
      responseText: answer.value || "",
      responseLabel: answer.value || ""
    });
    return;
  }

  if (questionId === "post_review_choice") {
    addQuestionnaireRow_(out, base, {
      responseType: "hotel_choice",
      responseCode: answer.hotel_id || "",
      responseLabel: answer.hotel_name || hotelName_(answer.hotel_id)
    });
    return;
  }

  if (questionId === "post_review_satisfaction") {
    addQuestionnaireRow_(out, base, {
      responseType: "satisfaction",
      responseCode: answer.value,
      responseNumeric: numberOrBlank_(answer.value),
      responseLabel: satisfactionLabel_(answer.value),
      scaleMin: 1,
      scaleMax: 7
    });
    return;
  }

  if (questionId === "post_review_switch") {
    addQuestionnaireRow_(out, base, {
      responseType: "switch_choice",
      responseCode: answer.value,
      responseNumeric: answer.value === "yes" ? 1 : answer.value === "no" ? 0 : "",
      responseLabel: answer.value === "yes" ? "Would switch" : answer.value === "no" ? "Would keep the same hotel" : "",
      scaleMin: 0,
      scaleMax: 1
    });
    return;
  }

  if (answer.true_attributes && typeof answer.true_attributes === "object") {
    addQuestionnaireRow_(out, base, {
      responseType: "actual_values_acknowledged",
      responseCode: "acknowledged",
      responseNumeric: 1,
      responseLabel: "Acknowledged",
      scaleMin: 0,
      scaleMax: 1
    });
    return;
  }

  if (answer.scenario_id || answer.value === true) {
    addQuestionnaireRow_(out, base, {
      responseType: "acknowledgement",
      responseCode: "acknowledged",
      responseNumeric: 1,
      responseLabel: "Acknowledged",
      scaleMin: 0,
      scaleMax: 1
    });
    return;
  }

  addQuestionnaireRow_(out, base, {
    responseType: "single_value",
    responseCode: answer.value,
    responseNumeric: numberOrBlank_(answer.value),
    responseLabel: answer.value,
    responseText: typeof answer.value === "string" ? answer.value : ""
  });
}

function addQuestionnaireRow_(out, base, item) {
  const matrix = item.matrix || base.matrix || "";
  const responseType = item.responseType || "";
  const attributeId = item.attributeId || "";
  const responseCode = item.responseCode == null ? "" : item.responseCode;
  const responseId = recordId_([
    base.participantKey,
    base.eventTimestamp,
    base.questionId,
    matrix,
    responseType,
    attributeId,
    responseCode
  ]);
  const assignment = base.assignment || {};

  out.push([
    responseId,
    base.recordedAt,
    base.submittedAt,
    textCell_(base.prolific.prolific_pid || ""),
    textCell_(base.prolific.study_id || ""),
    textCell_(base.prolific.session_id || ""),
    textCell_(base.participantKey),
    textCell_(base.questionId),
    textCell_(base.surveyPage),
    textCell_(base.stage),
    textCell_(base.hotelId),
    textCell_(base.hotelName),
    textCell_(matrix),
    textCell_(responseType),
    textCell_(attributeId),
    textCell_(item.attributeLabel || ""),
    textCell_(responseCode),
    item.responseNumeric === undefined ? "" : item.responseNumeric,
    textCell_(item.responseLabel == null ? "" : item.responseLabel),
    textCell_(item.responseText || ""),
    item.scaleMin === undefined ? "" : item.scaleMin,
    item.scaleMax === undefined ? "" : item.scaleMax,
    textCell_(assignment.scenario_id || ""),
    textCell_(assignment.scenario_title || ""),
    joinCell_(assignment.attribute_ids || []),
    joinCell_(assignment.attribute_labels || []),
    jsonCell_(base.answer),
    SCHEMA_VERSION,
    textCell_(base.prolific.survey_user_id || "")
  ]);
}

function buildVisitRows_(events, payload, receivedAt) {
  const out = [];
  const prolific = payload.prolific || {};
  const participantKey = participantKey_(prolific);
  const stage = inferSurveyStageFromUrl_(payload.page_url);

  for (let i = 0; i < events.length; i++) {
    const ev = events[i] || {};
    if (ev.event_type !== "page_timing") continue;
    const value = objectValue_(ev.value);
    if (value.context !== "hotel_modal") continue;

    const hotelId = ev.element_id || value.hotel_id || "";
    const visitId = recordId_([participantKey, stage, hotelId, ev.timestamp || "", "hotel_modal"]);
    out.push([
      visitId,
      receivedAt,
      dateValue_(ev.timestamp),
      textCell_(prolific.prolific_pid || ""),
      textCell_(prolific.study_id || ""),
      textCell_(prolific.session_id || ""),
      textCell_(participantKey),
      textCell_(stage),
      textCell_(hotelId),
      textCell_(hotelName_(hotelId)),
      numberOrBlank_(value.duration_ms) === "" ? "" : Number(value.duration_ms) / 1000,
      numberOrBlank_(value.scroll_depth_pct_at_exit),
      numberOrBlank_(value.scroll_max_pct),
      numberOrBlank_(value.scroll_dir_changes),
      numberOrBlank_(value.scroll_max_px_per_ms),
      numberOrBlank_(value.scroll_mean_px_per_ms),
      textCell_(value.exit_reason || ""),
      SCHEMA_VERSION,
      textCell_(prolific.survey_user_id || ev.survey_user_id || "")
    ]);
  }
  return out;
}

function updateParticipant_(sh, events, payload, receivedAt) {
  const prolific = payload.prolific || {};
  const participantKey = participantKey_(prolific);
  if (!participantKey) return;

  const existingRow = findParticipantRow_(sh, participantKey);
  const current = existingRow
    ? rowObject_(PARTICIPANT_HEADERS, sh.getRange(existingRow, 1, 1, PARTICIPANT_HEADERS.length).getValues()[0])
    : {};

  const summary = {};
  for (let i = 0; i < PARTICIPANT_HEADERS.length; i++) {
    const header = PARTICIPANT_HEADERS[i];
    summary[header] = current[header] === undefined ? "" : current[header];
  }

  summary.participant_key = textCell_(participantKey);
  summary.prolific_pid = textCell_(prolific.prolific_pid || summary.prolific_pid || "");
  summary.study_id = textCell_(prolific.study_id || summary.study_id || "");
  summary.session_id = textCell_(prolific.session_id || summary.session_id || "");
  summary.survey_user_id = textCell_(prolific.survey_user_id || summary.survey_user_id || "");
  summary.first_recorded_at = summary.first_recorded_at || receivedAt;
  summary.last_recorded_at = receivedAt;
  summary.completion_status = summary.completion_status || "in_progress";
  summary.last_survey_stage = inferSurveyStageFromUrl_(payload.page_url) || summary.last_survey_stage;

  for (let i = 0; i < events.length; i++) {
    const ev = events[i] || {};
    if (ev.event_type !== "survey_submit") continue;
    const value = objectValue_(ev.value);
    const answer = objectValue_(value.answer);
    const assignment = objectValue_(value.assignment);

    summary.last_question_id = textCell_(ev.element_id || summary.last_question_id);
    summary.last_survey_stage = answer.questionnaire_stage || inferQuestionnaireStage_(ev.element_id, payload.page_url);
    applyAssignmentToSummary_(summary, assignment);

    if (answer.bot_detection_triggered || answer.bot_detection_response) {
      summary.bot_detection_flag = 1;
      const detail = textCell_((ev.element_id || "unknown_question") + ": " + (answer.bot_detection_response || "triggered"));
      const currentDetails = String(summary.bot_detection_details || "");
      if (currentDetails.indexOf(detail) === -1) {
        summary.bot_detection_details = currentDetails ? currentDetails + " | " + detail : detail;
      }
    }

    if (ev.element_id === "hotel_attributes_prior") {
      summary.prior_hotel_attributes = textCell_(answer.value || "");
    }
    if (ev.element_id === "hotel_scenarios_prior") {
      const ids = Array.isArray(answer.selected_ids) ? answer.selected_ids : [];
      const labels = Array.isArray(answer.selected_labels) ? answer.selected_labels : [];
      summary.frequent_booking_scenarios = textCell_(ids.map((id, index) => labels[index] || bookingScenarioLabel_(id)).join(" | "));
      summary.frequent_booking_scenario_other = textCell_(answer.other_text || "");
    }
    if (ev.element_id === "post_review_choice") {
      summary.selected_hotel_id = textCell_(answer.hotel_id || "");
      summary.selected_hotel_name = textCell_(answer.hotel_name || hotelName_(answer.hotel_id));
    }
    if (ev.element_id === "post_review_satisfaction") {
      summary.satisfaction_1_7 = numberOrBlank_(answer.value);
    }
    if (ev.element_id === "post_review_switch") {
      summary.would_switch = textCell_(answer.value || "");
    }
    if (ev.element_id === "post_review_confidence_surprise") {
      summary.switch_confidence_0_100 = numberOrBlank_(answer.switch_confidence);
      const surprise = objectValue_(answer.surprise_values);
      for (let j = 0; j < ATTRIBUTES.length; j++) {
        const attribute = ATTRIBUTES[j];
        summary["surprise_" + attribute.id + "_0_10"] = numberOrBlank_(surprise[attribute.id]);
      }
    }
    if (ev.element_id === "post_review_complete") {
      summary.completion_status = "complete";
      summary.completed_at = dateValue_(ev.timestamp) || receivedAt;
    }
  }

  const row = PARTICIPANT_HEADERS.map(header => summary[header]);
  const targetRow = existingRow || sh.getLastRow() + 1;
  ensureRowCapacity_(sh, targetRow);
  sh.getRange(targetRow, 1, 1, row.length).setValues([row]);
  formatAppendedRows_(sh, targetRow, 1);
  ensureFilter_(sh);
}

function applyAssignmentToSummary_(summary, assignment) {
  if (!assignment || !assignment.scenario_id) return;
  summary.assigned_scenario_id = textCell_(assignment.scenario_id || "");
  summary.assigned_scenario_title = textCell_(assignment.scenario_title || "");
  const ids = Array.isArray(assignment.attribute_ids) ? assignment.attribute_ids : [];
  const labels = Array.isArray(assignment.attribute_labels) ? assignment.attribute_labels : [];
  for (let i = 0; i < 3; i++) {
    summary["assigned_attribute_" + (i + 1) + "_id"] = textCell_(ids[i] || "");
    summary["assigned_attribute_" + (i + 1) + "_label"] = textCell_(labels[i] || "");
  }
}

function findParticipantRow_(sh, participantKey) {
  if (sh.getLastRow() < 2) return 0;
  const match = sh.getRange(2, 1, sh.getLastRow() - 1, 1)
    .createTextFinder(participantKey)
    .matchEntireCell(true)
    .findNext();
  return match ? match.getRow() : 0;
}

function ensureCodebook_(ss) {
  const sh = ensureSheet_(ss, CODEBOOK_SHEET, CODEBOOK_HEADERS);

  const rows = [];
  for (let i = 0; i < ATTRIBUTES.length; i++) {
    const attribute = ATTRIBUTES[i];
    rows.push([
      "hotel_attribute",
      attribute.id,
      attribute.label,
      "Higher/positive means the hotel performs better on this attribute",
      attribute.definition
    ]);
  }

  const scaleRows = [
    ["response_scale", "likelihood", "Hotel attribute likelihood", "1 = Extremely unlikely; 2 = Somewhat unlikely; 3 = Neither; 4 = Somewhat likely; 5 = Extremely likely", "Participant's belief that a hotel has the named positive attribute."],
    ["response_scale", "confidence", "Confidence", "1 = Low; 2 = Medium; 3 = High", "Participant's confidence in the likelihood rating immediately above."],
    ["response_scale", "satisfaction", "Choice satisfaction", "1 = Very dissatisfied to 7 = Very satisfied", "Satisfaction after the actual attribute values are revealed."],
    ["response_scale", "switch_choice", "Would switch hotel", "1 = Yes; 0 = No", "Whether the participant would choose a different hotel after seeing the revealed values."],
    ["response_scale", "switch_confidence", "Switching confidence", "0 = Not at all confident to 100 = Completely confident", "Confidence in the switching answer."],
    ["response_scale", "attribute_surprise", "Attribute surprise", "0 = Not surprised at all to 10 = Completely surprised", "Surprise about the revealed value for each hotel attribute."]
  ];
  for (let i = 0; i < scaleRows.length; i++) rows.push(scaleRows[i]);

  for (let i = 0; i < BOOKING_SCENARIOS.length; i++) {
    const scenario = BOOKING_SCENARIOS[i];
    rows.push([
      "booking_scenario",
      scenario.id,
      scenario.label,
      "Selected = 1; not selected = 0",
      "Participant-selected context in which they most often need to book a hotel. Multiple selections are allowed."
    ]);
  }

  rows.push([
    "identifier",
    "survey_user_id",
    "Anonymous survey user ID",
    "Automatically generated random ID",
    "Hidden from participants and used to link questionnaire answers, hotel visits, raw events, and the participant summary across the full website flow."
  ]);

  rows.push([
    "quality_flag",
    "bot_detection_flag",
    "Automated-response detection",
    "1 = hidden instruction was followed; blank = not triggered",
    "Flags a response when a visually hidden quality-control field contains a value. Review flagged cases before deciding whether to exclude or compensate a participant."
  ]);

  const stageRows = [
    ["survey_stage", "intake", "Initial survey", "Before hotel browsing", "Prolific ID, frequent hotel-booking scenarios, prior hotel attributes, assigned scenario, and preference profile acknowledgement."],
    ["survey_stage", "no_reviews", "After listing search 1", "Hotel information without review text", "Hotel likelihood and confidence questions after the first listing stage."],
    ["survey_stage", "with_reviews", "After listing search 2", "Hotel information with review text", "Repeated likelihood/confidence questions plus hotel choice and post-review outcomes."],
    ["survey_stage", "with_ai_summary", "After listing search 3", "Hotel information with review text and an AI-generated summary", "Repeated likelihood/confidence questions plus hotel choice and post-review outcomes for the AI-summary condition."],
    ["survey_stage", "search_1", "Listing search 1", "Hotel browsing stage", "Hotel modal visits during the first hotel listing task."],
    ["survey_stage", "search_2", "Listing search 2", "Hotel browsing stage", "Hotel modal visits during the second hotel listing task."],
    ["survey_stage", "search_3", "Listing search 3", "Hotel browsing stage", "Hotel modal visits during the AI-summary hotel listing task."],
    ["survey_stage", "post_review_ai", "AI-summary post-review questionnaire", "After listing search 3", "Post-review responses after participants view reviews with AI-generated summaries."]
  ];
  for (let i = 0; i < stageRows.length; i++) rows.push(stageRows[i]);

  const existingKeys = new Set();
  if (sh.getLastRow() > 1) {
    const existingRows = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getDisplayValues();
    for (let i = 0; i < existingRows.length; i++) {
      existingKeys.add(existingRows[i][0] + "::" + existingRows[i][1]);
    }
  }
  const missingRows = rows.filter(row => !existingKeys.has(row[0] + "::" + row[1]));
  if (!missingRows.length) return;
  const startRow = sh.getLastRow() + 1;
  sh.getRange(startRow, 1, missingRows.length, CODEBOOK_HEADERS.length).setValues(missingRows);
  sh.getRange(startRow, 1, missingRows.length, CODEBOOK_HEADERS.length).setWrap(true).setVerticalAlignment("top");
}

function codedResponse_(matrix, code) {
  const value = String(code == null ? "" : code);
  if (matrix === "likelihood") {
    const map = {
      extremely_unlikely: [1, "Extremely unlikely"],
      somewhat_unlikely: [2, "Somewhat unlikely"],
      neither: [3, "Neither likely nor unlikely"],
      somewhat_likely: [4, "Somewhat likely"],
      extremely_likely: [5, "Extremely likely"]
    };
    const item = map[value] || ["", value];
    return { numeric: item[0], label: item[1], min: 1, max: 5 };
  }
  if (matrix === "confidence") {
    const map = { low: [1, "Low"], medium: [2, "Medium"], high: [3, "High"] };
    const item = map[value] || ["", value];
    return { numeric: item[0], label: item[1], min: 1, max: 3 };
  }
  return { numeric: numberOrBlank_(code), label: value, min: "", max: "" };
}

function satisfactionLabel_(value) {
  const numeric = Number(value);
  if (numeric === 1) return "Very dissatisfied";
  if (numeric === 7) return "Very satisfied";
  return isNaN(numeric) ? "" : String(numeric);
}

function attributeForKey_(key) {
  const value = String(key || "");
  for (let i = 0; i < ATTRIBUTES.length; i++) {
    if (ATTRIBUTES[i].id === value || ATTRIBUTES[i].likelihoodKey === value) return ATTRIBUTES[i];
  }
  return null;
}

function inferQuestionnaireStage_(questionId, pageUrl) {
  const id = String(questionId || "");
  if (id.indexOf("hotelq_") === 0) return "no_reviews";
  const stage = inferSurveyStageFromUrl_(pageUrl);
  if (stage === "search_3" || stage === "post_review_ai") return "with_ai_summary";
  if (id.indexOf("postreview_") === 0 || id.indexOf("post_review_") === 0) return "with_reviews";
  return stage === "search_1" ? "no_reviews" : stage === "search_2" || stage === "post_review" ? "with_reviews" : "intake";
}

function inferSurveyStageFromUrl_(pageUrl) {
  const text = String(pageUrl || "");
  const match = text.match(/[?&]survey_stage=([^&#]+)/i);
  if (!match) return "";
  try {
    return decodeURIComponent(match[1]);
  } catch (_) {
    return match[1];
  }
}

function participantKey_(prolific) {
  const meta = prolific || {};
  if (meta.survey_user_id) return "survey_user:" + String(meta.survey_user_id);
  if (meta.session_id) return "session:" + String(meta.session_id);
  if (meta.prolific_pid) return "prolific:" + String(meta.prolific_pid);
  return "";
}

function hotelName_(hotelId) {
  return HOTEL_NAMES[String(hotelId || "")] || "";
}

function bookingScenarioLabel_(scenarioId) {
  const id = String(scenarioId || "");
  for (let i = 0; i < BOOKING_SCENARIOS.length; i++) {
    if (BOOKING_SCENARIOS[i].id === id) return BOOKING_SCENARIOS[i].label;
  }
  return id;
}

function rowObject_(headers, row) {
  const out = {};
  for (let i = 0; i < headers.length; i++) out[headers[i]] = row[i];
  return out;
}

function objectValue_(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
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
