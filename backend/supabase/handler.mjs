const HOTELS = ["arlo-chicago", "nobu-hotel-chicago"];
const OPTIONAL_ATTRIBUTES = [
  "cleanliness", "service_quality", "room_comfort", "wifi_reliability",
  "noise_level", "breakfast_quality"
];
const LIKELIHOOD_FIELDS = {
  cleanliness: "clean",
  service_quality: "good_service_quality",
  room_comfort: "comfortable_rooms",
  wifi_reliability: "reliable_wifi",
  noise_level: "low_noise_level",
  location_convenience: "convenient_location",
  fitness_facilities: "fitness_facilities",
  breakfast_quality: "high_quality_breakfast"
};
const LIKELIHOOD_VALUES = [
  "extremely_unlikely", "somewhat_unlikely", "neither", "somewhat_likely", "extremely_likely"
];
const SURPRISE_VALUES = [
  "not_at_all_surprised", "slightly_surprised", "moderately_surprised",
  "very_surprised", "extremely_surprised"
];
const COOKIE_NAME = "hotel_survey_session";
const MAX_BODY_BYTES = 200000;

function reply(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  });
}

function failure(status, message) {
  return reply(status, { ok: false, error: message });
}

function base64Url(bytes) {
  let text = "";
  for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signature(value, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(`hotel-survey-session-v1:${secret}`),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  return base64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

async function sessionId(request, secret) {
  const cookie = (request.headers.get("Cookie") || "").split("; ")
    .find(part => part.startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return "";
  const value = cookie.slice(COOKIE_NAME.length + 1);
  const match = /^([0-9a-f-]{36})\.([A-Za-z0-9_-]+)$/.exec(value);
  if (!match) return "";
  const expected = await signature(match[1], secret);
  if (match[2].length !== expected.length) return "";
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) mismatch |= expected.charCodeAt(i) ^ match[2].charCodeAt(i);
  return mismatch ? "" : match[1];
}

function supabaseUrl(env, table, query = {}) {
  const url = new URL(`/rest/v1/${table}`, env.SUPABASE_URL);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  return url;
}

async function db(env, table, { method = "GET", query = {}, body } = {}) {
  const response = await fetch(supabaseUrl(env, table, query), {
    method,
    headers: {
      apikey: env.SUPABASE_SECRET_KEY,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Database request failed (${response.status}).`);
    error.status = response.status;
    error.code = result && result.code;
    throw error;
  }
  return result;
}

function byParticipant(id) {
  return { participant_id: `eq.${id}`, select: "*" };
}

async function getParticipant(env, id) {
  const rows = await db(env, "survey_responses", { query: byParticipant(id) });
  return rows[0] || null;
}

function validUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function validEventId(value) {
  return validUuid(value) || typeof value === "string" &&
    /^behavior_[0-9a-f-]{36}$/i.test(value);
}

function assignedAttributes(studentId) {
  let seed = 2166136261;
  const label = `hotel-attributes-v2:${studentId.trim().toUpperCase()}`;
  for (let i = 0; i < label.length; i += 1) {
    seed ^= label.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  const values = OPTIONAL_ATTRIBUTES.slice();
  for (let i = values.length - 1; i > 0; i -= 1) {
    seed += 0x6D2B79F5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    const index = Math.floor((((value ^ (value >>> 14)) >>> 0) / 4294967296) * (i + 1));
    [values[i], values[index]] = [values[index], values[i]];
  }
  return ["location_convenience", "fitness_facilities", ...values.slice(0, 2)];
}

function popupMap(old, entries) {
  const next = { ...(old || {}) };
  for (const item of entries || []) {
    if (!item || !validEventId(item.event_id) || typeof item.popup_type !== "string") continue;
    if (!["hotel", "shopper_profile", "hotel_order", "revealed_attributes"].includes(item.popup_type)) continue;
    if (!["browsing_1", "questionnaire_1", "browsing_2", "questionnaire_2"].includes(item.stage)) continue;
    next[item.event_id] = {
      popup_type: item.popup_type,
      stage: item.stage,
      hotel_id: HOTELS.includes(item.hotel_id) ? item.hotel_id : null,
      opened_at: Number(item.opened_at) || null
    };
  }
  return next;
}

function qualityChecks(old, answers) {
  const next = { ...(old || {}) };
  for (const [questionId, answer] of Object.entries(answers || {})) {
    if (answer && Object.hasOwn(answer, "bot_detection_response")) {
      next[questionId] = {
        response: String(answer.bot_detection_response || "").slice(0, 256),
        triggered: Boolean(answer.bot_detection_triggered)
      };
    }
  }
  return next;
}

async function updateResponse(env, participantId, saveId, transform, { preserveSaveId = false } = {}) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const current = await getParticipant(env, participantId);
    if (!current) return { error: failure(401, "Survey session not found.") };
    if (current.last_save_id === saveId) return { row: current };
    const patch = transform(current);
    if (patch.error) return { error: patch.error };
    const rows = await db(env, "survey_responses", {
      method: "PATCH",
      query: { ...byParticipant(participantId), revision: `eq.${current.revision}` },
      body: {
        ...patch, revision: current.revision + 1,
        last_save_id: preserveSaveId ? current.last_save_id : saveId,
        updated_at: new Date().toISOString()
      }
    });
    if (rows.length) return { row: rows[0] };
  }
  return { error: failure(409, "Another save is in progress. Please try again.") };
}

function completeAnswers(answers, participant) {
  const required = [
    "student_id", "scenario_attributes_prior",
    "post_review_choice", "post_review_reveal", "post_review_likelihood_surprise",
    "post_review_satisfaction", "post_review_switch", "post_review_ai_use_frequency",
    ...["hotelq", "postreview"].flatMap(prefix => HOTELS.map(id => `${prefix}_${id}_likelihood`))
  ];
  if (!required.every(id => answers[id] && typeof answers[id] === "object" && !Array.isArray(answers[id]))) return false;
  if (answers.student_id.value !== participant.student_id ||
      !String(answers.scenario_attributes_prior.value || "").trim()) return false;
  for (const prefix of ["hotelq", "postreview"]) {
    for (const hotelId of HOTELS) {
      const answer = answers[`${prefix}_${hotelId}_likelihood`];
      if (answer.hotel_id !== hotelId || !answer.values ||
          !participant.assigned_attributes.every(attribute =>
            LIKELIHOOD_VALUES.includes(answer.values[LIKELIHOOD_FIELDS[attribute]]))) return false;
    }
  }
  const chosenHotel = answers.post_review_choice.hotel_id;
  const surprise = answers.post_review_likelihood_surprise;
  return HOTELS.includes(chosenHotel) &&
    answers.post_review_reveal.value === true && answers.post_review_reveal.hotel_id === chosenHotel &&
    surprise.hotel_id === chosenHotel &&
    ["very_unlikely", "unlikely", "neither_likely_nor_unlikely", "likely", "very_likely"].includes(surprise.switch_likelihood) &&
    participant.assigned_attributes.every(attribute => SURPRISE_VALUES.includes(surprise.surprise_values?.[attribute])) &&
    /^[1-7]$/.test(String(answers.post_review_satisfaction.value)) &&
    ["yes", "no"].includes(answers.post_review_switch.value) &&
    /^[1-7]$/.test(String(answers.post_review_ai_use_frequency.value));
}

async function start(context, payload, secret) {
  const studentId = String(payload.student_id || "").trim().toUpperCase();
  const condition = payload.condition;
  if (!studentId || studentId.length > 128 || !validUuid(payload.start_id) ||
      !["full_reviews", "ai_summary"].includes(condition)) {
    return failure(400, "Enter a valid Student ID and survey condition.");
  }
  const existingSession = await sessionId(context.request, secret);
  if (existingSession) {
    const row = await getParticipant(context.env, existingSession);
    if (row && row.student_id === studentId && row.condition === condition) return reply(200, { ok: true, survey: row });
    if (row) return failure(409, "This browser already has a different survey session.");
  }
  const rows = await db(context.env, "survey_responses", {
    query: { student_id: `eq.${studentId}`, select: "*" }
  });
  if (rows.length) {
    if (rows[0].last_save_id !== payload.start_id || rows[0].condition !== condition) {
      return failure(409, "This Student ID already has a survey record. Please contact the study team.");
    }
    return reply(200, { ok: true, survey: rows[0] }, {
      "Set-Cookie": `${COOKIE_NAME}=${rows[0].participant_id}.${await signature(rows[0].participant_id, secret)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
    });
  }
  const participantId = crypto.randomUUID();
  let inserted;
  try {
    inserted = await db(context.env, "survey_responses", {
      method: "POST",
      body: {
        participant_id: participantId,
        student_id: studentId,
        condition,
        survey_version: condition === "ai_summary" ? "3" : "2",
        assigned_attributes: assignedAttributes(studentId),
        answers: { student_id: { ...(payload.answer || {}), value: studentId } },
        quality_checks: qualityChecks({}, { student_id: payload.answer }),
        last_save_id: payload.start_id,
        completed_pages: ["student_id"],
        current_page: "scenario_attributes_prior"
      }
    });
  } catch (error) {
    if (error.code === "23505") {
      const duplicate = await db(context.env, "survey_responses", {
        query: { student_id: `eq.${studentId}`, select: "*" }
      });
      if (duplicate[0]?.last_save_id === payload.start_id && duplicate[0].condition === condition) {
        return reply(200, { ok: true, survey: duplicate[0] }, {
          "Set-Cookie": `${COOKIE_NAME}=${duplicate[0].participant_id}.${await signature(duplicate[0].participant_id, secret)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
        });
      }
      return failure(409, "This Student ID already has a survey record. Please contact the study team.");
    }
    throw error;
  }
  const cookie = `${COOKIE_NAME}=${participantId}.${await signature(participantId, secret)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`;
  return reply(200, { ok: true, survey: inserted[0] }, { "Set-Cookie": cookie });
}

async function save(context, payload, participantId) {
  if (!validUuid(payload.save_id) || !/^[a-z0-9_-]{1,100}$/.test(payload.page_id || "") ||
      !payload.answers || typeof payload.answers !== "object" || Array.isArray(payload.answers) ||
      !/^[a-z0-9_-]{1,100}$/.test(payload.next_page || "")) {
    return failure(400, "Invalid survey page save.");
  }
  const { row, error } = await updateResponse(context.env, participantId, payload.save_id, current => {
    if (current.completion_status === "complete") return { error: failure(409, "This survey is already complete.") };
    const answers = { ...current.answers, ...payload.answers };
    if (payload.complete && (payload.page_id !== "post_review_ai_use_frequency" || !completeAnswers(answers, current))) {
      return { error: failure(400, "The survey is missing required answers.") };
    }
    return {
      answers,
      quality_checks: qualityChecks(current.quality_checks, payload.answers),
      popup_statistics: popupMap(current.popup_statistics, payload.popup_events),
      completed_pages: [...new Set([...current.completed_pages, payload.page_id])],
      current_page: payload.complete ? "complete" : payload.next_page,
      completion_status: payload.complete ? "complete" : "in_progress",
      completed_at: payload.complete ? new Date().toISOString() : null
    };
  });
  return error || reply(200, { ok: true, survey: row });
}

function aggregateVisits(visits) {
  const all = Object.values(visits).sort((left, right) => {
    const leftClosedAt = Number(left && left.closed_at) || 0;
    const rightClosedAt = Number(right && right.closed_at) || 0;
    if (leftClosedAt !== rightClosedAt) return leftClosedAt - rightClosedAt;
    return String(left && left.visit_id || "").localeCompare(String(right && right.visit_id || ""));
  });
  const sum = name => all.reduce((total, visit) => total + (Number(visit.metrics[name]) || 0), 0);
  return {
    popup_open_count: all.length,
    total_viewing_ms: sum("duration_ms"),
    max_scroll_depth_pct: Math.max(0, ...all.map(visit => Number(visit.metrics.scroll_max_pct) || 0)),
    summary_viewing_ms: sum("summary_viewing_ms"),
    individual_reviews_viewing_ms: sum("individual_reviews_viewing_ms"),
    review_seen_count: sum("review_seen_count"),
    review_read_count: sum("review_read_count"),
    unique_review_read_count: new Set(all.flatMap(visit => visit.metrics.review_read_ids || [])).size,
    review_reading_order: all.flatMap(visit => visit.metrics.review_read_order || []),
    review_stopping_position: all.length ? all[all.length - 1].metrics.review_stopping_position || 0 : 0
  };
}

async function updateBrowsing(env, participantId, stage, hotelId, visit) {
  const key = { participant_id: `eq.${participantId}`, browsing_stage: `eq.${stage}`, hotel_id: `eq.${hotelId}`, select: "*" };
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const rows = await db(env, "browsing_records", { query: key });
    const current = rows[0];
    const visits = { ...(current && current.visits || {}), [visit.visit_id]: visit };
    const record = {
      participant_id: participantId, browsing_stage: stage, hotel_id: hotelId,
      visits, metrics: aggregateVisits(visits), last_save_id: visit.visit_id.replace(/^behavior_/, ""),
      updated_at: new Date().toISOString()
    };
    if (!current) {
      try {
        await db(env, "browsing_records", { method: "POST", body: record });
        return;
      } catch (error) {
        if (error.code === "23505") continue;
        throw error;
      }
    }
    if (current.visits && current.visits[visit.visit_id]) return;
    const updated = await db(env, "browsing_records", {
      method: "PATCH", query: { ...key, revision: `eq.${current.revision}` },
      body: { ...record, revision: current.revision + 1 }
    });
    if (updated.length) return;
  }
  throw new Error("Browsing record is busy. Please retry.");
}

async function browse(context, payload, participantId) {
  if (!validUuid(payload.save_id) || !["information", "reviews"].includes(payload.stage) ||
      !Array.isArray(payload.visits) || payload.visits.length > 100) {
    return failure(400, "Invalid browsing save.");
  }
  const participant = await getParticipant(context.env, participantId);
  if (!participant || participant.completion_status === "complete") return failure(409, "Survey session is unavailable.");
  const popupEvents = payload.popup_events || [];
  for (const visit of payload.visits) {
    if (!visit || !validEventId(visit.visit_id) || !HOTELS.includes(visit.hotel_id) ||
        !visit.metrics || typeof visit.metrics !== "object" || Array.isArray(visit.metrics)) {
      return failure(400, "Invalid hotel visit.");
    }
  }
  await Promise.all(HOTELS.map(async hotelId => {
    for (const visit of payload.visits.filter(item => item.hotel_id === hotelId)) {
      await updateBrowsing(context.env, participantId, payload.stage, hotelId, visit);
    }
  }));
  const rows = await db(context.env, "browsing_records", {
    query: { participant_id: `eq.${participantId}`, browsing_stage: `eq.${payload.stage}`, select: "hotel_id" }
  });
  if (!HOTELS.every(hotelId => rows.some(row => row.hotel_id === hotelId))) {
    return failure(400, "Please view both hotels before continuing.");
  }
  const { error } = await updateResponse(context.env, participantId, payload.save_id, current => ({
    popup_statistics: {
      ...popupMap(current.popup_statistics, popupEvents),
      _stage_duration_ms: {
        ...(current.popup_statistics._stage_duration_ms || {}),
        [payload.stage]: Math.max(
          Number(current.popup_statistics._stage_duration_ms?.[payload.stage]) || 0,
          Math.min(Math.max(0, Number(payload.stage_duration_ms) || 0), 86400000)
        )
      }
    },
    current_page: payload.stage === "information" ? "pre_review_hotel_ratings" : "post_review_hotel_ratings"
  }));
  if (error) return error;
  return reply(200, { ok: true });
}

function browsingStageForPath(path) {
  const name = String(path || "").split("/").pop().toLowerCase().replace(/\.html$/, "");
  if (name === "search-no-reviews") return { stage: "information", popupStage: "browsing_1" };
  if (["search-reviews", "search-ai-summaries"].includes(name)) {
    return { stage: "reviews", popupStage: "browsing_2" };
  }
  return null;
}

async function eventBatch(context, payload, participantId) {
  if (!Array.isArray(payload.events) || payload.events.length > 400) {
    return failure(400, "Invalid browsing event batch.");
  }
  const popupEvents = [];
  const visits = [];
  for (const event of payload.events) {
    if (!event || !validEventId(event.event_id) || !Number.isFinite(Number(event.timestamp))) {
      return failure(400, "Invalid browsing event.");
    }
    const page = browsingStageForPath(event.delivery_context?.page_path || payload.page_path);
    const value = event.value || {};
    if (event.event_type === "popup_inventory") continue;
    if (event.event_type === "popup_open") {
      const popupType = value.popup_type;
      const stage = value.usage_stage || (page && page.popupStage);
      if (!["hotel", "shopper_profile", "hotel_order", "revealed_attributes"].includes(popupType) ||
          !["browsing_1", "questionnaire_1", "browsing_2", "questionnaire_2"].includes(stage) ||
          (popupType === "hotel" && !HOTELS.includes(value.hotel_id))) {
        return failure(400, "Invalid popup event.");
      }
      popupEvents.push({
        event_id: event.event_id, popup_type: popupType, stage,
        hotel_id: value.hotel_id || null, opened_at: event.timestamp
      });
      continue;
    }
    if (event.event_type === "page_timing" && value.context === "hotel_modal" && page &&
        HOTELS.includes(event.element_id)) {
      const metrics = Object.fromEntries(Object.entries(value).filter(([key]) =>
        key !== "survey_user_id" && key !== "hotel_display_position"));
      visits.push({
        visit_id: event.event_id, stage: page.stage, hotel_id: event.element_id,
        closed_at: event.timestamp, metrics
      });
      continue;
    }
    return failure(400, "Unsupported browsing event.");
  }
  for (const visit of visits) {
    await updateBrowsing(context.env, participantId, visit.stage, visit.hotel_id, visit);
  }
  if (popupEvents.length) {
    const { error } = await updateResponse(context.env, participantId, crypto.randomUUID(), current => ({
      popup_statistics: popupMap(current.popup_statistics, popupEvents)
    }), { preserveSaveId: true });
    if (error) return error;
  }
  return reply(200, { ok: true, tracking_event_ids: payload.events.map(event => event.event_id) });
}

export async function handleSurveyRequest({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) return failure(503, "Survey storage is not configured.");
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return failure(403, "Cross-site request denied.");
  try {
    const id = await sessionId(request, env.SUPABASE_SECRET_KEY);
    if (request.method === "GET") {
      if (!id) return reply(200, { ok: true, survey: null, browsing: [] });
      const row = await getParticipant(env, id);
      if (!row) return failure(401, "Survey session not found.");
      const browsing = await db(env, "browsing_records", {
        query: { participant_id: `eq.${id}`, select: "browsing_stage,hotel_id" }
      });
      return reply(200, { ok: true, survey: row, browsing });
    }
    if (request.method !== "POST") return failure(405, "Method not allowed.");
    if (Number(request.headers.get("Content-Length")) > MAX_BODY_BYTES) return failure(413, "Request is too large.");
    const payload = await request.json();
    if (!payload || typeof payload !== "object") return failure(400, "Invalid request.");
    if (payload.action === "start") return start({ request, env }, payload, env.SUPABASE_SECRET_KEY);
    if (!id) return failure(401, "Please start the survey again in this browser.");
    if (payload.kind === "event_batch") return eventBatch({ request, env }, payload, id);
    if (payload.action === "save") return save({ request, env }, payload, id);
    if (payload.action === "browse") return browse({ request, env }, payload, id);
    return failure(400, "Unknown survey action.");
  } catch (error) {
    if (error instanceof SyntaxError) return failure(400, "Invalid JSON request.");
    return failure(503, "Survey storage is temporarily unavailable. Please try again.");
  }
}
