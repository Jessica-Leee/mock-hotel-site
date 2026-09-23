// Requires jsdom; run from the repository root. No network requests are made.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const receiver = vm.createContext({});
vm.runInContext(fs.readFileSync('backend/google-sheets-receiver.gs', 'utf8'), receiver);
const headers = vm.runInContext('SURVEY_HEADERS', receiver);
const stages = ['browsing_1', 'questionnaire_1', 'browsing_2', 'questionnaire_2'];
const types = ['shopper_profile', 'hotel_order', 'revealed_attributes'];
assert.equal(headers.length, 67);
assert.equal(new Set(headers).size, 67);
assert.equal(headers[54], 'scenario_attributes_prior');
assert.equal(vm.runInContext('BROWSING_HEADERS.length', receiver), 35);
const errors = [];
const captured = [];

async function capture(path, version, expectedStage) {
  const vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(`<body ${version ? `data-review-version="${version}"` : ''}></body>`, {
    url: 'https://survey.test/' + path, runScripts: 'outside-only',
    pretendToBeVisual: true, virtualConsole: vc
  });
  try {
    const w = dom.window;
    w.fetch = async () => ({ ok: true });
    w.navigator.sendBeacon = () => true;
    w.eval(fs.readFileSync('assets/js/survey-tracking.js', 'utf8'));
    await new Promise(resolve => setImmediate(resolve));
    for (const type of types) {
      w.HOTEL_EXPERIMENT_TRACK('popup_open', type, { popup_type: type });
    }
    const events = w.HOTEL_EXPERIMENT_GET_EVENTS().filter(event => event.event_type === 'popup_open');
    assert.equal(events.length, 3);
    events.forEach(event => assert.equal(event.value.usage_stage, expectedStage));
    // Retrying on a later page must not change an event's original stage.
    w.history.replaceState(null, '', '/index.html?survey_stage=post_review#pr6');
    events.forEach(event => assert.equal(event.value.usage_stage, expectedStage));
    captured.push(...JSON.parse(JSON.stringify(events)));
  } finally {
    dom.window.close();
  }
}

(async () => {
  await capture('search-no-reviews.html?study_version=2#hotel/arlo-chicago', 'without', 'browsing_1');
  await capture('search-no-reviews?study_version=3#hotel/nobu-hotel-chicago', 'without', 'browsing_1');
  await capture('index.html?survey_stage=hotel_questionnaire#hq1', '', 'questionnaire_1');
  await capture('index.html?study_version=3#hq1', '', 'questionnaire_1');
  await capture('search-reviews.html#hotel/arlo-chicago', 'with', 'browsing_2');
  await capture('search-ai-summaries#hotel/nobu-hotel-chicago', 'with-ai-summary', 'browsing_2');
  await capture('index.html?survey_stage=post_review#pr4', '', 'questionnaire_2');
  await capture('index.html?survey_stage=post_review_ai#pr4', '', 'questionnaire_2');
  const record = {};
  receiver.initializeSurveyPopupFields_(record, true);
  for (const stage of stages) for (const type of types) {
    assert.equal(record[`${stage}_${type}_popup_open_count`], 0);
  }
  captured.forEach(event => receiver.applySurveyPopupOpen_(record, event));
  captured.slice().reverse().forEach(event => receiver.applySurveyPopupOpen_(record, event));
  for (const type of types) {
    assert.equal(record[`${type}_popup_open_count`], 8);
    assert.equal(record[`${type}_popup_opened`], 1);
    for (const stage of stages) assert.equal(record[`${stage}_${type}_popup_open_count`], 2);
  }
  assert.equal(JSON.parse(record.processed_popup_event_ids_json).length, 24);
  const historical = { shopper_profile_popup_open_count: 7, processed_popup_event_ids_json: '["already-counted"]' };
  receiver.initializeSurveyPopupFields_(historical, false);
  assert.equal(historical.browsing_1_shopper_profile_popup_open_count, undefined);
  receiver.applySurveyPopupOpen_(historical, { event_id: 'already-counted', value: { popup_type: 'shopper_profile', usage_stage: 'browsing_1' } });
  assert.equal(historical.shopper_profile_popup_open_count, 7);
  receiver.applySurveyPopupOpen_(historical, { event_id: 'new-open', value: { popup_type: 'shopper_profile', usage_stage: 'browsing_2' } });
  assert.equal(historical.shopper_profile_popup_open_count, 8);
  assert.equal(historical.browsing_2_shopper_profile_popup_open_count, 1);
  assert.equal(historical.browsing_1_shopper_profile_popup_open_count, undefined);
  const legacy = {};
  receiver.initializeSurveyPopupFields_(legacy, true);
  for (const [stage, expected] of [['search_1', 'browsing_1'], ['search_2', 'browsing_2'], ['search_3', 'browsing_2'], ['hotel_questionnaire', 'questionnaire_1'], ['post_review', 'questionnaire_2'], ['post_review_ai', 'questionnaire_2']]) {
    assert.equal(receiver.surveyPopupStage_({ survey_stage: stage }), expected);
  }
  receiver.applySurveyPopupOpen_(legacy, { event_id: 'unknown-stage', value: { popup_type: 'shopper_profile', page_context: 'hotel_modal' } });
  assert.equal(legacy.shopper_profile_popup_open_count, 1);
  for (const stage of stages) assert.equal(legacy[`${stage}_shopper_profile_popup_open_count`], 0);
  assert.deepEqual(errors, []);
  console.log('PASS: all four stages, both conditions, direct/clean URLs, capture-time attribution, duplicate/reordered retries, legacy fallback, historical unknowns, 67/35-column schemas. No network writes.');
})().catch(error => { console.error(error); process.exitCode = 1; });
