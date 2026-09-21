/**
 * Google Apps Script receiver for the hotel survey.
 *
 * New submissions are written to exactly three analysis sheets:
 * 1) Without_AI_Survey - one row per participant for the full-review survey.
 * 2) AI_Summary_Survey - one row per participant for the AI-summary survey.
 * 3) Browsing_Information - one row per participant, condition, stage, and hotel.
 *
 * The sheets intentionally omit submission_id, session_id, and study_id.
 * Student ID is the participant-provided identifier; legacy Prolific parameters
 * remain accepted so older study links continue to work.
 * Deploy as a Web App (Execute as: Me, Who has access: Anyone).
 */

const SCHEMA_VERSION = "21";
const WITHOUT_AI_SHEET = "Without_AI_Survey";
const AI_SUMMARY_SHEET = "AI_Summary_Survey";
const BROWSING_SHEET = "Browsing_Information";

const HOTELS = [
  { id: "nobu-hotel-chicago", slug: "nobu_hotel_chicago" },
  { id: "arlo-chicago", slug: "arlo_chicago" }
];

const ATTRIBUTES = [
  { id: "cleanliness", likelihoodKey: "clean", label: "Cleanliness" },
  { id: "service_quality", likelihoodKey: "good_service_quality", label: "Service quality" },
  { id: "room_comfort", likelihoodKey: "comfortable_rooms", label: "Room comfort" },
  { id: "wifi_reliability", likelihoodKey: "reliable_wifi", label: "Wi-Fi reliability" },
  { id: "noise_level", likelihoodKey: "low_noise_level", label: "Noise level (quietness)" },
  { id: "location_convenience", likelihoodKey: "convenient_location", label: "Location convenience" },
  { id: "fitness_facilities", likelihoodKey: "fitness_facilities", label: "Fitness facilities" },
  { id: "breakfast_quality", likelihoodKey: "high_quality_breakfast", label: "Breakfast quality" }
];

const SURVEY_HEADERS = buildSurveyHeaders_();

const BROWSING_HEADERS = [
  "survey_user_id",
  "student_id",
  "condition",
  "browsing_stage",
  "hotel_id",
  "hotel_display_position",
  "first_opened_at",
  "last_opened_at",
  "last_closed_at",
  "record_updated_at",
  "open_count",
  "total_viewing_seconds",
  "maximum_single_view_seconds",
  "maximum_scroll_depth_pct",
  "total_scroll_direction_changes",
  "maximum_scroll_speed_px_ms",
  "mean_scroll_speed_px_ms",
  "last_exit_reason",
  "time_limit_reached",
  "processed_visit_ids_json",
  "summary_viewing_seconds",
  "individual_reviews_viewing_seconds",
  "reviews_seen_count",
  "reviews_read_count",
  "review_seen_positions_json",
  "review_read_positions_json",
  "review_read_ids_json",
  "review_stopping_position",
  "review_reading_pattern",
  "review_visibility_seconds_json",
  "review_reading_sessions_json",
  "review_furthest_position_seen",
  "popup_opened",
  "popup_click_count",
  "processed_popup_event_ids_json"
];

function buildSurveyHeaders_() {
  const headers = [
    "survey_user_id",
    "student_id",
    "first_recorded_at",
    "last_recorded_at",
    "completion_status",
    "completed_at",
    "assigned_attribute_1_id",
    "assigned_attribute_2_id",
    "assigned_attribute_3_id"
  ];

  const stages = ["pre_review", "post_review"];
  // Preserve existing sheet positions and historical answers when retiring a hotel.
  const columnHotels = [{ slug: "pendry_chicago" }].concat(HOTELS);
  for (let h = 0; h < columnHotels.length; h++) {
    for (let s = 0; s < stages.length; s++) {
      for (let slot = 1; slot <= 3; slot++) {
        headers.push(matrixColumn_(stages[s], columnHotels[h].slug, slot, "likelihood"));
      }
    }
  }

  headers.push(
    "chosen_hotel_id",
    "satisfaction_1_to_7",
    "would_switch_hotel",
    "switch_likelihood_1_to_5"
  );

  for (let i = 0; i < ATTRIBUTES.length; i++) {
    headers.push("surprise_" + ATTRIBUTES[i].id + "_1_to_5");
  }

  headers.push(
    "ai_use_frequency_1_to_7",
    "bot_detection_flag",
    "bot_detection_details",
    "shopper_profile_popup_opened",
    "shopper_profile_popup_open_count",
    "hotel_order_popup_opened",
    "hotel_order_popup_open_count",
    "revealed_attributes_popup_opened",
    "revealed_attributes_popup_open_count",
    "processed_popup_event_ids_json"
  );
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
    const browsingSheet = ensureBrowsingSheet_(ss);

    const surveyUpdated = updateSurveyRow_(surveySheet, events, payload, receivedAt);
    const browsingVisitsRecorded = updateBrowsingRow_(browsingSheet, events, payload, receivedAt);

    return jsonResponse_({
      ok: true,
      survey_sheet: surveySheetName,
      survey_row_updated: surveyUpdated ? 1 : 0,
      browsing_visits_recorded: browsingVisitsRecorded,
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

/**
 * Run this manually once when replacing the old analysis schema. It clears
 * only the three named study tabs and recreates their current headers.
 */
function resetHotelSurveySheets() {
  const ss = getSpreadsheet_();
  const definitions = [
    [WITHOUT_AI_SHEET, SURVEY_HEADERS],
    [AI_SUMMARY_SHEET, SURVEY_HEADERS],
    [BROWSING_SHEET, BROWSING_HEADERS]
  ];

  for (let i = 0; i < definitions.length; i++) {
    const name = definitions[i][0];
    const headers = definitions[i][1];
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    const filter = sheet.getFilter();
    if (filter) filter.remove();
    sheet.clear();
    if (sheet.getMaxColumns() > headers.length) {
      sheet.deleteColumns(headers.length + 1, sheet.getMaxColumns() - headers.length);
    }
    ensureColumnCapacity_(sheet, headers.length);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    applySheetLayout_(sheet, name, headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground("#174ea6")
      .setFontColor("#ffffff")
      .setFontWeight("bold")
      .setVerticalAlignment("middle");
  }
}

function jsonResponse_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function updateSurveyRow_(sheet, events, payload, receivedAt) {
  const surveyEvents = events.filter(event => {
    if (!event) return false;
    if (event.event_type === "survey_submit" || event.event_type === "survey_completion_snapshot") return true;
    if (event.event_type !== "popup_open") return false;
    const value = objectValue_(event.value);
    const popupType = String(value.popup_type || event.element_id || "");
    return ["shopper_profile", "hotel_order", "revealed_attributes"].indexOf(popupType) >= 0;
  });
  if (!surveyEvents.length) return false;

  const surveyUserId = surveyUserIdFrom_(payload, surveyEvents);
  if (!surveyUserId) return false;

  const studentId = studentIdFrom_(payload, surveyEvents);
  const rowNumbers = participantRows_(sheet, surveyUserId, studentId);
  const rowNumber = rowNumbers.length ? rowNumbers[0] : 0;
  const record = emptyRecord_(SURVEY_HEADERS);
  for (let i = 0; i < rowNumbers.length; i++) {
    const candidate = rowObject_(
      SURVEY_HEADERS,
      sheet.getRange(rowNumbers[i], 1, 1, SURVEY_HEADERS.length).getValues()[0]
    );
    mergeSurveyRecord_(record, candidate);
  }

  record.survey_user_id = textCell_(surveyUserId);
  record.student_id = textCell_(studentId || record.student_id || "");
  record.first_recorded_at = record.first_recorded_at || receivedAt;
  record.last_recorded_at = receivedAt;
  record.completion_status = record.completion_status || "in_progress";
  initializeSurveyPopupFields_(record);
  for (let i = 0; i < surveyEvents.length; i++) {
    const event = surveyEvents[i] || {};
    const value = objectValue_(event.value);

    if (event.event_type === "popup_open") {
      applySurveyPopupOpen_(record, event);
      continue;
    }

    if (event.event_type === "survey_completion_snapshot") {
      const snapshotAnswers = objectValue_(value.answers);
      applyAssignment_(record, objectValue_(value.assignment));
      const questionIds = Object.keys(snapshotAnswers);
      for (let q = 0; q < questionIds.length; q++) {
        const questionId = questionIds[q];
        const answer = objectValue_(snapshotAnswers[questionId]);
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
    applyAnswer_(record, event.element_id || "", answer, assignment);
  }

  const values = SURVEY_HEADERS.map(header => record[header] === undefined ? "" : record[header]);
  const targetRow = rowNumber || sheet.getLastRow() + 1;
  ensureRowCapacity_(sheet, targetRow);
  sheet.getRange(targetRow, 1, 1, values.length).setValues([values]);
  removeDuplicateRows_(sheet, rowNumbers.slice(1));
  formatSurveyRow_(sheet, targetRow);
  ensureFilter_(sheet);
  return true;
}

function initializeSurveyPopupFields_(record) {
  const prefixes = [
    "shopper_profile_popup",
    "hotel_order_popup",
    "revealed_attributes_popup"
  ];
  for (let i = 0; i < prefixes.length; i++) {
    const prefix = prefixes[i];
    record[prefix + "_opened"] = numericValue_(record[prefix + "_opened"]) > 0 ? 1 : 0;
    record[prefix + "_open_count"] = numericValue_(record[prefix + "_open_count"]);
  }
}

function applySurveyPopupOpen_(record, event) {
  const value = objectValue_(event.value);
  const popupType = String(value.popup_type || event.element_id || "");
  const prefixes = {
    shopper_profile: "shopper_profile_popup",
    hotel_order: "hotel_order_popup",
    revealed_attributes: "revealed_attributes_popup"
  };
  const prefix = prefixes[popupType];
  if (!prefix) return;

  const eventId = String(event.event_id || recordId_([
    popupType,
    event.timestamp || "",
    value.page_context || "",
    value.page_hash || "",
    value.hotel_id || ""
  ]));
  const processedIds = parseJsonArray_(record.processed_popup_event_ids_json).map(String);
  if (processedIds.indexOf(eventId) >= 0) return;

  record[prefix + "_opened"] = 1;
  record[prefix + "_open_count"] = numericValue_(record[prefix + "_open_count"]) + 1;
  processedIds.push(eventId);
  record.processed_popup_event_ids_json = jsonCell_(processedIds);
}

function mergeSurveyRecord_(target, source) {
  for (let i = 0; i < SURVEY_HEADERS.length; i++) {
    const header = SURVEY_HEADERS[i];
    if (header === "first_recorded_at" || header === "last_recorded_at" || header === "completed_at" ||
        header === "completion_status") continue;
    if (!isBlank_(source[header])) target[header] = source[header];
  }

  target.first_recorded_at = earliestDate_(target.first_recorded_at, source.first_recorded_at);
  target.last_recorded_at = latestDate_(target.last_recorded_at, source.last_recorded_at);
  target.completed_at = latestDate_(target.completed_at, source.completed_at);
  if (source.completion_status === "complete" || target.completion_status !== "complete") {
    target.completion_status = source.completion_status || target.completion_status;
  }
}

function applyAssignment_(record, assignment) {
  if (!assignment) return;
  const ids = Array.isArray(assignment.attribute_ids) ? assignment.attribute_ids : [];
  for (let i = 0; i < 3; i++) {
    record["assigned_attribute_" + (i + 1) + "_id"] = textCell_(ids[i] || "");
  }
}

function applyAnswer_(record, questionId, answer, assignment) {
  if (questionId === "student_id" || questionId === "prolific_id") {
    record.student_id = textCell_(answer.value || record.student_id || "");
  } else if (/^(hotelq|postreview)_/.test(questionId)) {
    applyMatrixAnswer_(record, questionId, answer, assignment);
  } else if (questionId === "post_review_choice") {
    record.chosen_hotel_id = textCell_(answer.hotel_id || "");
  } else if (questionId === "post_review_satisfaction") {
    record.satisfaction_1_to_7 = numberOrBlank_(answer.value);
  } else if (questionId === "post_review_switch") {
    record.would_switch_hotel = textCell_(answer.value || "");
  } else if (questionId === "post_review_likelihood_surprise") {
    record.switch_likelihood_1_to_5 = switchLikelihoodNumeric_(answer.switch_likelihood);
    const surprise = objectValue_(answer.surprise_values);
    for (let i = 0; i < ATTRIBUTES.length; i++) {
      const rawSurprise = surprise[ATTRIBUTES[i].id];
      record["surprise_" + ATTRIBUTES[i].id + "_1_to_5"] = surpriseNumeric_(rawSurprise);
    }
  } else if (questionId === "post_review_ai_use_frequency") {
    record.ai_use_frequency_1_to_7 = numberOrBlank_(answer.value);
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
  const match = questionId.match(/^(hotelq|postreview)_(.+)_likelihood$/);
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
    const raw = values[attribute.likelihoodKey];
    record[matrixColumn_(stage, hotel.slug, i + 1, "likelihood")] = likelihoodNumeric_(raw);
  }
}

function updateBrowsingRow_(sheet, events, payload, receivedAt) {
  const surveyUserId = surveyUserIdFrom_(payload, events);
  if (!surveyUserId) return 0;
  const condition = browsingCondition_(conditionFromPayload_(payload));
  const browsingStage = browsingStageFromPayload_(payload);
  if (!validBrowsingCombination_(condition, browsingStage)) return 0;
  const studentId = studentIdFrom_(payload, events);
  const eventsByHotel = {};
  const inventoryPositions = {};

  for (let i = 0; i < events.length; i++) {
    const event = events[i] || {};
    const value = objectValue_(event.value);
    if (event.event_type === "popup_inventory" && value.popup_type === "hotel") {
      const hotelIds = Array.isArray(value.hotel_ids) ? value.hotel_ids : [];
      for (let p = 0; p < hotelIds.length; p++) {
        const inventoryHotel = hotelForId_(hotelIds[p]);
        if (inventoryHotel) inventoryPositions[inventoryHotel.id] = p + 1;
      }
      continue;
    }

    const isTimingEvent = event.event_type === "page_timing" && value.context === "hotel_modal";
    const isPopupEvent = event.event_type === "popup_open" && value.popup_type === "hotel";
    if (!isTimingEvent && !isPopupEvent) continue;
    const hotelId = value.hotel_id || event.element_id || "";
    const hotel = hotelForId_(hotelId);
    if (!hotel) continue;
    if (!eventsByHotel[hotel.id]) eventsByHotel[hotel.id] = [];
    eventsByHotel[hotel.id].push(event);
  }

  let totalRecorded = 0;
  const hotelIds = uniqueStrings_(Object.keys(eventsByHotel).concat(Object.keys(inventoryPositions)));
  for (let i = 0; i < hotelIds.length; i++) {
    const hotel = hotelForId_(hotelIds[i]);
    totalRecorded += updateBrowsingCombination_(
      sheet,
      eventsByHotel[hotel.id] || [],
      surveyUserId,
      studentId,
      condition,
      browsingStage,
      hotel,
      receivedAt,
      inventoryPositions[hotel.id] || 0
    );
  }
  return totalRecorded;
}

function updateBrowsingCombination_(sheet, events, surveyUserId, studentId, condition, stage, hotel, receivedAt, inventoryPosition) {
  const rowNumbers = findBrowsingRows_(sheet, surveyUserId, studentId, condition, stage, hotel.id);
  const rowNumber = rowNumbers.length ? rowNumbers[0] : 0;
  const record = rowNumber
    ? rowObject_(BROWSING_HEADERS, sheet.getRange(rowNumber, 1, 1, BROWSING_HEADERS.length).getValues()[0])
    : emptyRecord_(BROWSING_HEADERS);
  const processedVisitIds = parseJsonArray_(record.processed_visit_ids_json);
  const processed = new Set(processedVisitIds.map(String));
  const processedPopupEventIds = parseJsonArray_(record.processed_popup_event_ids_json);
  const processedPopupEvents = new Set(processedPopupEventIds.map(String));
  let recorded = 0;

  record.survey_user_id = textCell_(surveyUserId);
  record.student_id = textCell_(studentId || record.student_id || "");
  record.condition = textCell_(condition);
  record.browsing_stage = textCell_(stage);
  record.hotel_id = textCell_(hotel.id);
  record.popup_opened = numericValue_(record.popup_opened) > 0 ? 1 : 0;
  record.popup_click_count = numericValue_(record.popup_click_count);
  if (inventoryPosition > 0) record.hotel_display_position = inventoryPosition;

  for (let i = 0; i < events.length; i++) {
    const event = events[i] || {};
    const value = objectValue_(event.value);
    if (event.event_type === "popup_open" && value.popup_type === "hotel") {
      const popupEventId = String(event.event_id || recordId_([
        surveyUserId,
        condition,
        stage,
        hotel.id,
        "popup_open",
        event.timestamp || ""
      ]));
      if (processedPopupEvents.has(popupEventId)) continue;
      const openedAt = dateValue_(event.timestamp) || receivedAt;
      record.popup_opened = 1;
      record.first_opened_at = earliestDate_(record.first_opened_at, openedAt);
      record.last_opened_at = latestDate_(record.last_opened_at, openedAt);
      processedPopupEvents.add(popupEventId);
      processedPopupEventIds.push(popupEventId);
      record.popup_click_count = Math.max(
        numericValue_(record.popup_click_count),
        processedPopupEventIds.length
      );
      recorded += 1;
      continue;
    }
    if (event.event_type !== "page_timing" || value.context !== "hotel_modal") continue;
    if (!record.popup_opened) {
      record.popup_opened = 1;
      if (!record.popup_click_count) record.popup_click_count = 1;
    }
    const visitId = event.event_id || recordId_([
      surveyUserId,
      condition,
      stage,
      hotel.id,
      event.timestamp || "",
      value.duration_ms || ""
    ]);
    if (processed.has(String(visitId))) continue;

    const previousCount = numericValue_(record.open_count);
    const durationSeconds = numericValue_(value.duration_ms) / 1000;
    const closedAt = dateValue_(event.timestamp) || receivedAt;
    const openedAt = new Date(closedAt.getTime() - (durationSeconds * 1000));
    const scrollDepth = Math.max(
      numericValue_(value.scroll_depth_pct_at_exit),
      numericValue_(value.scroll_max_pct)
    );
    const meanScrollSpeed = numberOrBlank_(value.scroll_mean_px_per_ms);

    record.first_opened_at = earliestDate_(record.first_opened_at, openedAt);
    record.last_opened_at = latestDate_(record.last_opened_at, openedAt);
    record.last_closed_at = latestDate_(record.last_closed_at, closedAt);
    record.open_count = previousCount + 1;
    record.total_viewing_seconds = roundNumber_(
      numericValue_(record.total_viewing_seconds) + durationSeconds,
      3
    );
    record.maximum_single_view_seconds = Math.max(
      numericValue_(record.maximum_single_view_seconds),
      durationSeconds
    );
    record.maximum_scroll_depth_pct = Math.max(
      numericValue_(record.maximum_scroll_depth_pct),
      scrollDepth
    );
    record.total_scroll_direction_changes =
      numericValue_(record.total_scroll_direction_changes) + numericValue_(value.scroll_dir_changes);
    record.maximum_scroll_speed_px_ms = Math.max(
      numericValue_(record.maximum_scroll_speed_px_ms),
      numericValue_(value.scroll_max_px_per_ms)
    );
    if (meanScrollSpeed !== "") {
      record.mean_scroll_speed_px_ms = roundNumber_(
        ((numericValue_(record.mean_scroll_speed_px_ms) * previousCount) + meanScrollSpeed) /
          (previousCount + 1),
        6
      );
    }
    record.summary_viewing_seconds = roundNumber_(
      numericValue_(record.summary_viewing_seconds) + numericValue_(value.summary_viewing_ms) / 1000,
      3
    );
    record.individual_reviews_viewing_seconds = roundNumber_(
      numericValue_(record.individual_reviews_viewing_seconds) + numericValue_(value.individual_reviews_viewing_ms) / 1000,
      3
    );
    const displayPosition = numericValue_(value.hotel_display_position);
    if (displayPosition > 0) record.hotel_display_position = displayPosition;

    const seenPositions = uniqueNumbers_(
      parseJsonArray_(record.review_seen_positions_json).concat(Array.isArray(value.review_seen_order) ? value.review_seen_order : [])
    );
    const readPositions = uniqueNumbers_(
      parseJsonArray_(record.review_read_positions_json).concat(Array.isArray(value.review_read_order) ? value.review_read_order : [])
    );
    const readIds = uniqueStrings_(
      parseJsonArray_(record.review_read_ids_json).concat(Array.isArray(value.review_read_ids) ? value.review_read_ids : [])
    );
    const visibilitySeconds = parseJsonObject_(record.review_visibility_seconds_json);
    const currentVisibility = Array.isArray(value.review_visibility) ? value.review_visibility : [];
    for (let v = 0; v < currentVisibility.length; v++) {
      const position = String(numberOrBlank_(currentVisibility[v].position));
      if (!position) continue;
      visibilitySeconds[position] = roundNumber_(
        numericValue_(visibilitySeconds[position]) + numericValue_(currentVisibility[v].visible_ms) / 1000,
        3
      );
    }
    const readingSessions = parseJsonArray_(record.review_reading_sessions_json);
    if (value.review_seen_count || value.review_read_count || currentVisibility.length) {
      readingSessions.push({
        visit_id: String(visitId),
        seen_order: Array.isArray(value.review_seen_order) ? value.review_seen_order : [],
        read_order: Array.isArray(value.review_read_order) ? value.review_read_order : [],
        read_ids: Array.isArray(value.review_read_ids) ? value.review_read_ids : [],
        stopping_position: numberOrBlank_(value.review_stopping_position),
        furthest_position_seen: numberOrBlank_(value.review_furthest_position_seen),
        reading_pattern: textCell_(value.review_reading_pattern || "none")
      });
    }
    record.reviews_seen_count = seenPositions.length;
    record.reviews_read_count = readPositions.length;
    record.review_seen_positions_json = jsonCell_(seenPositions);
    record.review_read_positions_json = jsonCell_(readPositions);
    record.review_read_ids_json = jsonCell_(readIds);
    if (value.review_stopping_position !== undefined && value.review_stopping_position !== null) {
      record.review_stopping_position = numberOrBlank_(value.review_stopping_position);
    }
    record.review_furthest_position_seen = Math.max(
      numericValue_(record.review_furthest_position_seen),
      numericValue_(value.review_furthest_position_seen)
    );
    if (value.review_reading_pattern) record.review_reading_pattern = textCell_(value.review_reading_pattern);
    record.review_visibility_seconds_json = jsonCell_(visibilitySeconds);
    record.review_reading_sessions_json = jsonCell_(readingSessions);
    record.last_exit_reason = textCell_(value.exit_reason || "");
    processed.add(String(visitId));
    processedVisitIds.push(String(visitId));
    recorded += 1;
  }

  if (!recorded && !rowNumber && inventoryPosition <= 0) return 0;
  record.record_updated_at = receivedAt;
  record.time_limit_reached = record.last_exit_reason === "popup_time_limit" || numericValue_(record.total_viewing_seconds) >= 45 ? 1 : 0;
  record.processed_visit_ids_json = jsonCell_(processedVisitIds);
  record.processed_popup_event_ids_json = jsonCell_(processedPopupEventIds);

  const values = BROWSING_HEADERS.map(header => record[header] === undefined ? "" : record[header]);
  const targetRow = rowNumber || sheet.getLastRow() + 1;
  ensureRowCapacity_(sheet, targetRow);
  sheet.getRange(targetRow, 1, 1, values.length).setValues([values]);
  removeDuplicateRows_(sheet, rowNumbers.slice(1));
  formatBrowsingRow_(sheet, targetRow);
  ensureFilter_(sheet);
  return recorded;
}

function browsingCondition_(condition) {
  return condition === "ai_summary" ? "ai_summary" : "without_ai";
}

function validBrowsingCombination_(condition, stage) {
  return Boolean(
    (condition === "without_ai" && (stage === "no_reviews" || stage === "full_reviews")) ||
    (condition === "ai_summary" && (stage === "no_reviews" || stage === "ai_summary_reviews"))
  );
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
  const studentId = studentIdFrom_(payload, events);
  if (studentId) {
    return "survey_user_" + recordId_([
      "hotel-survey-participant-v1",
      String(studentId).trim().toUpperCase()
    ]);
  }
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

function studentIdFrom_(payload, events) {
  const prolific = objectValue_(payload.prolific);
  if (prolific.student_id) return String(prolific.student_id);
  if (prolific.prolific_pid) return String(prolific.prolific_pid);
  for (let i = 0; i < events.length; i++) {
    const event = events[i] || {};
    const value = objectValue_(event.value);
    const answer = objectValue_(value.answer);
    if ((event.element_id === "student_id" || event.element_id === "prolific_id") && answer.value) return String(answer.value);
    const nestedProlific = objectValue_(value.prolific);
    if (nestedProlific.student_id) return String(nestedProlific.student_id);
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

function ensureBrowsingSheet_(ss) {
  return ensureSheet_(ss, BROWSING_SHEET, BROWSING_HEADERS);
}

function applySheetLayout_(sheet, name, headers) {
  for (let i = 1; i <= headers.length; i++) sheet.setColumnWidth(i, name === BROWSING_SHEET ? 145 : 125);
  sheet.setFrozenColumns(name === BROWSING_SHEET ? 5 : 2);
  setWidthByHeader_(sheet, headers, "survey_user_id", 330);
  setWidthByHeader_(sheet, headers, "student_id", 220);
  setWidthByHeader_(sheet, headers, "bot_detection_details", 320);
  setWidthByHeader_(sheet, headers, "processed_visit_ids_json", 420);
  setWidthByHeader_(sheet, headers, "processed_popup_event_ids_json", 420);
}

function formatSurveyRow_(sheet, row) {
  formatDateHeader_(sheet, SURVEY_HEADERS, row, 1, "first_recorded_at");
  formatDateHeader_(sheet, SURVEY_HEADERS, row, 1, "last_recorded_at");
  formatDateHeader_(sheet, SURVEY_HEADERS, row, 1, "completed_at");
  wrapHeader_(sheet, SURVEY_HEADERS, row, 1, "processed_popup_event_ids_json");
}

function formatBrowsingRow_(sheet, row) {
  formatDateHeader_(sheet, BROWSING_HEADERS, row, 1, "first_opened_at");
  formatDateHeader_(sheet, BROWSING_HEADERS, row, 1, "last_opened_at");
  formatDateHeader_(sheet, BROWSING_HEADERS, row, 1, "last_closed_at");
  formatDateHeader_(sheet, BROWSING_HEADERS, row, 1, "record_updated_at");
  wrapHeader_(sheet, BROWSING_HEADERS, row, 1, "processed_visit_ids_json");
  wrapHeader_(sheet, BROWSING_HEADERS, row, 1, "processed_popup_event_ids_json");
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

function findRowsByValue_(sheet, column, value) {
  if (sheet.getLastRow() < 2) return [];
  const values = sheet.getRange(2, column, sheet.getLastRow() - 1, 1).getDisplayValues();
  const rows = [];
  const expected = String(value);
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === expected) rows.push(i + 2);
  }
  return rows;
}

function participantRows_(sheet, surveyUserId, studentId) {
  const rows = findRowsByValue_(sheet, 1, surveyUserId);
  if (studentId) {
    const studentRows = findRowsByValue_(sheet, 2, studentId);
    for (let i = 0; i < studentRows.length; i++) {
      if (rows.indexOf(studentRows[i]) === -1) rows.push(studentRows[i]);
    }
  }
  return rows.sort((a, b) => a - b);
}

function findBrowsingRows_(sheet, surveyUserId, studentId, condition, stage, hotelId) {
  if (sheet.getLastRow() < 2) return [];
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getDisplayValues();
  const rows = [];
  for (let i = 0; i < values.length; i++) {
    const sameParticipant = String(values[i][0]) === String(surveyUserId) ||
      (studentId && String(values[i][1]) === String(studentId));
    if (sameParticipant && String(values[i][2]) === String(condition) &&
        String(values[i][3]) === String(stage) && String(values[i][4]) === String(hotelId)) {
      rows.push(i + 2);
    }
  }
  return rows;
}

function removeDuplicateRows_(sheet, rows) {
  for (let i = rows.length - 1; i >= 0; i--) sheet.deleteRow(rows[i]);
}

function assignedAttributeIdsFromRecord_(record) {
  return [record.assigned_attribute_1_id, record.assigned_attribute_2_id, record.assigned_attribute_3_id].filter(Boolean);
}

function hotelForId_(id) {
  for (let i = 0; i < HOTELS.length; i++) if (HOTELS[i].id === String(id || "")) return HOTELS[i];
  return null;
}

function attributeForId_(id) {
  for (let i = 0; i < ATTRIBUTES.length; i++) if (ATTRIBUTES[i].id === String(id || "")) return ATTRIBUTES[i];
  return null;
}

function likelihoodNumeric_(value) {
  const map = { extremely_unlikely: 1, somewhat_unlikely: 2, neither: 3, somewhat_likely: 4, extremely_likely: 5 };
  return map[String(value || "")] || "";
}

function switchLikelihoodNumeric_(value) {
  const map = {
    very_unlikely: 1,
    unlikely: 2,
    neither_likely_nor_unlikely: 3,
    likely: 4,
    very_likely: 5
  };
  return map[String(value || "")] || "";
}

function surpriseNumeric_(value) {
  const map = {
    not_at_all_surprised: 1,
    slightly_surprised: 2,
    moderately_surprised: 3,
    very_surprised: 4,
    extremely_surprised: 5
  };
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

function parseJsonArray_(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function uniqueNumbers_(values) {
  const seen = {};
  const result = [];
  for (let i = 0; i < values.length; i++) {
    const number = Number(values[i]);
    if (!Number.isFinite(number)) continue;
    const key = String(number);
    if (seen[key]) continue;
    seen[key] = true;
    result.push(number);
  }
  return result.sort((a, b) => a - b);
}

function uniqueStrings_(values) {
  const seen = {};
  const result = [];
  for (let i = 0; i < values.length; i++) {
    const value = String(values[i] == null ? "" : values[i]);
    if (!value || seen[value]) continue;
    seen[value] = true;
    result.push(value);
  }
  return result;
}

function isBlank_(value) {
  return value === "" || value == null;
}

function earliestDate_(first, second) {
  const a = dateValue_(first);
  const b = dateValue_(second);
  if (!a) return b;
  if (!b) return a;
  return a.getTime() <= b.getTime() ? a : b;
}

function latestDate_(first, second) {
  const a = dateValue_(first);
  const b = dateValue_(second);
  if (!a) return b;
  if (!b) return a;
  return a.getTime() >= b.getTime() ? a : b;
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

function numericValue_(value) {
  const number = Number(value);
  return value === "" || value == null || isNaN(number) ? 0 : number;
}

function roundNumber_(value, digits) {
  const factor = Math.pow(10, digits);
  return Math.round(Number(value) * factor) / factor;
}

function textCell_(value) {
  if (value === "" || value == null) return "";
  const text = String(value);
  return /^[=+@-]/.test(text) ? "'" + text : text;
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
