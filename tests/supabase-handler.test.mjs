import test from "node:test";
import assert from "node:assert/strict";
import { handleSurveyRequest } from "../backend/supabase/handler.mjs";

const url = "https://survey.test/api/survey";
const env = { SUPABASE_URL: "https://supabase.test", SUPABASE_SECRET_KEY: "sb_secret_test_only" };
const hotelIds = ["arlo-chicago", "nobu-hotel-chicago"];
const likelihoodFields = {
  location_convenience: "convenient_location", fitness_facilities: "fitness_facilities",
  cleanliness: "clean", service_quality: "good_service_quality",
  room_comfort: "comfortable_rooms", wifi_reliability: "reliable_wifi",
  noise_level: "low_noise_level", breakfast_quality: "high_quality_breakfast"
};

function fakeDatabase() {
  const tables = { survey_responses: [], browsing_records: [] };
  const calls = [];
  async function fetchDb(input, options) {
    const target = new URL(input);
    const table = target.pathname.split("/").pop();
    assert.ok(tables[table]);
    assert.equal(options.headers.apikey, env.SUPABASE_SECRET_KEY);
    assert.equal(options.headers.Authorization, undefined);
    calls.push({ table, method: options.method });
    const matching = tables[table].filter(row => [...target.searchParams].every(([key, value]) =>
      key === "select" || String(row[key]) === value.replace(/^eq\./, "")));
    let rows;
    if (options.method === "GET") rows = matching;
    else if (options.method === "POST") {
      const body = JSON.parse(options.body);
      if (table === "survey_responses" && tables[table].some(row => row.student_id === body.student_id)) {
        return new Response(JSON.stringify({ code: "23505" }), { status: 409 });
      }
      const row = table === "survey_responses"
        ? {
            answers: {}, popup_statistics: {}, quality_checks: {}, completed_pages: [],
            completion_status: "in_progress", completed_at: null, revision: 0,
            ...body
          }
        : { visits: {}, metrics: {}, revision: 0, ...body };
      tables[table].push(row);
      rows = [row];
    } else if (options.method === "PATCH") {
      const patch = JSON.parse(options.body);
      matching.forEach(row => Object.assign(row, patch));
      rows = matching;
    }
    return new Response(JSON.stringify(rows), { status: 200 });
  }
  return { tables, calls, fetchDb };
}

async function call(action, cookie = "") {
  const request = new Request(url, action ? {
    method: "POST",
    headers: { Origin: "https://survey.test", Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify(action)
  } : { headers: { Cookie: cookie } });
  const response = await handleSurveyRequest({ request, env });
  return { response, data: await response.json() };
}

test("one student, one condition, confirmed page saves and idempotent browsing", async () => {
  const originalFetch = globalThis.fetch;
  const db = fakeDatabase();
  globalThis.fetch = db.fetchDb;
  try {
    assert.equal((await call()).data.survey, null);
    const startId = crypto.randomUUID();
    const started = await call({ action: "start", start_id: startId, student_id: "student-7", condition: "ai_summary",
      answer: { value: "student-7" } });
    assert.equal(started.response.status, 200);
    const cookie = started.response.headers.get("Set-Cookie").split(";")[0];
    const assigned = started.data.survey.assigned_attributes;
    assert.equal(assigned.length, 4);
    assert.deepEqual(assigned.slice(0, 2), ["location_convenience", "fitness_facilities"]);
    const retriedStart = await call({ action: "start", start_id: startId, student_id: "student-7", condition: "ai_summary" });
    assert.equal(retriedStart.response.status, 200);
    assert.equal(retriedStart.response.headers.get("Set-Cookie").split(";")[0], cookie);
    const duplicate = await call({ action: "start", start_id: crypto.randomUUID(), student_id: "student-7", condition: "full_reviews" });
    assert.equal(duplicate.response.status, 409);
    const wrongCondition = await call({ action: "start", start_id: crypto.randomUUID(), student_id: "student-7", condition: "full_reviews" }, cookie);
    assert.equal(wrongCondition.response.status, 409);

    const saveId = crypto.randomUUID();
    const page = {
      action: "save", save_id: saveId, page_id: "scenario_attributes_prior",
      next_page: "solo_city_exploration",
      answers: { scenario_attributes_prior: { value: "location, fitness" } }
    };
    assert.equal((await call(page, cookie)).data.survey.revision, 1);
    assert.equal((await call(page, cookie)).data.survey.revision, 1);

    const visits = hotelIds.map(hotelId => ({
      visit_id: `behavior_${crypto.randomUUID()}`, hotel_id: hotelId,
      metrics: { duration_ms: 12000, scroll_max_pct: 60, review_read_count: 3 }
    }));
    const browse = { action: "browse", save_id: crypto.randomUUID(), stage: "information",
      visits, popup_events: [{ event_id: visits[0].visit_id, popup_type: "hotel",
        stage: "browsing_1", hotel_id: hotelIds[0], opened_at: Date.now() }] };
    assert.equal((await call(browse, cookie)).response.status, 200);
    assert.equal((await call(browse, cookie)).response.status, 200);
    assert.equal(db.tables.browsing_records.length, 2);
    assert.ok(db.tables.browsing_records.every(row => row.metrics.popup_open_count === 1));
    assert.ok(db.tables.browsing_records.every(row => row.metrics.total_viewing_ms === 12000));
    const reviewVisits = hotelIds.map(hotelId => ({
      visit_id: `behavior_${crypto.randomUUID()}`, hotel_id: hotelId,
      metrics: {
        duration_ms: 14000, summary_viewing_ms: 4000,
        individual_reviews_viewing_ms: 7000, review_read_count: 2,
        review_read_ids: ['review-1', 'review-2'], review_read_order: [1, 2]
      }
    }));
    const reviews = await call({ action: "browse", save_id: crypto.randomUUID(),
      stage: "reviews", visits: reviewVisits }, cookie);
    assert.equal(reviews.response.status, 200);
    assert.equal(db.tables.browsing_records.length, 4);
    assert.equal(db.tables.browsing_records.find(row => row.browsing_stage === 'reviews').metrics.summary_viewing_ms, 4000);

    const likelihood = Object.fromEntries(assigned.map(id => [likelihoodFields[id], "somewhat_likely"]));
    const allAnswers = {
      post_review_choice: { hotel_id: hotelIds[0] },
      post_review_reveal: { value: true, hotel_id: hotelIds[0] },
      post_review_likelihood_surprise: {
        hotel_id: hotelIds[0], switch_likelihood: "unlikely",
        surprise_values: Object.fromEntries(assigned.map(id => [id, "slightly_surprised"]))
      },
      post_review_satisfaction: { value: "6" },
      post_review_switch: { value: "no" },
      post_review_ai_use_frequency: { value: "4" }
    };
    for (const prefix of ["hotelq", "postreview"]) {
      for (const hotelId of hotelIds) allAnswers[`${prefix}_${hotelId}_likelihood`] = { hotel_id: hotelId, values: likelihood };
    }
    const complete = await call({ action: "save", save_id: crypto.randomUUID(),
      page_id: "post_review_ai_use_frequency", next_page: "complete", complete: true,
      answers: allAnswers }, cookie);
    assert.equal(complete.response.status, 200);
    assert.equal(complete.data.survey.completion_status, "complete");
    assert.ok(complete.data.survey.completed_at);
    const session = await call(null, cookie);
    assert.equal(session.data.survey.answers.post_review_satisfaction.value, "6");
    assert.equal(session.data.browsing.length, 4);
    assert.equal((await call(page, cookie)).response.status, 409);
    const control = await call({ action: "start", start_id: crypto.randomUUID(),
      student_id: "student-8", condition: "full_reviews" });
    assert.equal(control.data.survey.survey_version, "2");
    const controlCookie = control.response.headers.get("Set-Cookie").split(";")[0];
    const incomplete = await call({ action: "save", save_id: crypto.randomUUID(),
      page_id: "post_review_ai_use_frequency", next_page: "complete", complete: true,
      answers: { post_review_ai_use_frequency: { value: "4" } } }, controlCookie);
    assert.equal(incomplete.response.status, 400);
    assert.equal((await call(null, controlCookie)).data.survey.completion_status, "in_progress");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("browsing events survive a refresh and repeated delivery does not double count", async () => {
  const originalFetch = globalThis.fetch;
  const database = fakeDatabase();
  globalThis.fetch = database.fetchDb;
  try {
    const started = await call({
      action: "start", start_id: crypto.randomUUID(), student_id: "refresh-student",
      condition: "full_reviews", answer: { value: "refresh-student" }
    });
    const cookie = started.response.headers.get("Set-Cookie").split(";")[0];
    const openedAt = Date.now();
    const events = hotelIds.flatMap((hotelId, index) => [
      {
        event_id: `behavior_${crypto.randomUUID()}`, event_type: "popup_open",
        element_id: `hotel:${hotelId}`, timestamp: openedAt + index,
        value: { popup_type: "hotel", hotel_id: hotelId }
      },
      {
        event_id: `behavior_${crypto.randomUUID()}`, event_type: "page_timing",
        element_id: hotelId, timestamp: openedAt + 12000 + index,
        value: { context: "hotel_modal", duration_ms: 12000, scroll_max_pct: 70 }
      }
    ]);
    const batch = { kind: "event_batch", page_path: "/search-no-reviews", events };
    const first = await call(batch, cookie);
    assert.equal(first.response.status, 200);
    assert.deepEqual(first.data.tracking_event_ids, events.map(event => event.event_id));
    assert.equal((await call(batch, cookie)).response.status, 200);
    assert.equal(database.tables.browsing_records.length, 2);
    assert.ok(database.tables.browsing_records.every(row => row.metrics.popup_open_count === 1));
    assert.equal(Object.keys(database.tables.survey_responses[0].popup_statistics).length, 2);
    assert.equal(database.tables.survey_responses[0].last_save_id, started.data.survey.last_save_id);
    const continued = await call({
      action: "browse", save_id: crypto.randomUUID(), stage: "information",
      visits: [], popup_events: []
    }, cookie);
    assert.equal(continued.response.status, 200);
    assert.equal(database.tables.survey_responses[0].current_page, "pre_review_hotel_ratings");
    const reviewEvent = {
      event_id: `behavior_${crypto.randomUUID()}`, event_type: "page_timing",
      element_id: hotelIds[0], timestamp: openedAt + 30000,
      value: { context: "hotel_modal", duration_ms: 10000, review_read_count: 2 }
    };
    const reviewBatch = await call({ kind: "event_batch", page_path: "/search-reviews",
      events: [reviewEvent] }, cookie);
    assert.equal(reviewBatch.response.status, 200);
    assert.equal(database.tables.browsing_records.find(row =>
      row.browsing_stage === "reviews" && row.hotel_id === hotelIds[0]).metrics.review_read_count, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
