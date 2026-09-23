// All HTTP calls are mocked. No test data is sent to Google Sheets.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const vm = require('node:vm');
const receiver = vm.createContext({});
vm.runInContext(fs.readFileSync('backend/google-sheets-receiver.gs', 'utf8'), receiver);
const html = fs.readFileSync('index.html', 'utf8').replace(
  /<script src="\.\/([^"?]+)[^"]*"><\/script>/g,
  (_, file) => '<script>' + fs.readFileSync(file, 'utf8') + '</script>'
);
const tick = () => new Promise(resolve => setImmediate(resolve));
const receipt = () => ({ ok: true, json: async () => ({ ok: true, survey_row_updated: 1 }) });

function openSurvey(version, fetch, stored = {}, hash = '#q1', stage = '') {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(html, {
    url: `https://survey.test/index.html?STUDENT_ID=storage-test&study_version=${version}&submission_id=sub-test&browsing_run=run-test&survey_stage=${stage}${hash}`,
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.fetch = fetch;
      w.scrollTo = () => {};
      w.navigator.sendBeacon = () => { throw new Error('A beacon is not an acknowledgement'); };
      w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
      for (const [key, value] of Object.entries(stored)) w.localStorage.setItem(key, value);
    }
  });
  return { dom, w: dom.window, d: dom.window.document, errors };
}

async function questionnaireDelivery(version) {
  let result = { ok: false, status: 404 };
  const calls = [];
  const { dom, w, d, errors } = openSurvey(version, async (url, options) => {
    calls.push(options);
    if (result instanceof Error) throw result;
    return result;
  });
  try {
    await tick();
    d.getElementById('answerInput').value = 'storage-test';
    d.getElementById('surveySubmit').click();
    await tick();
    assert.equal(w.MOCK_HOTEL_SURVEY_STORAGE_STATUS().pending_delivery_count, 1);
    assert.match(w.MOCK_HOTEL_SURVEY_STORAGE_STATUS().delivery_error, /404/);
    for (const failed of [
      new Error('offline'),
      { ok: true, json: async () => ({ ok: false, error: 'Lock timed out' }) },
      { ok: true, json: async () => ({ ok: true, survey_row_updated: 0 }) },
      { ok: true, json: async () => { throw new Error('Invalid JSON'); } }
    ]) {
      result = failed;
      w.dispatchEvent(new w.Event('pagehide'));
      await tick();
      assert.equal(w.MOCK_HOTEL_SURVEY_STORAGE_STATUS().pending_delivery_count, 1);
    }
    result = receipt();
    w.dispatchEvent(new w.Event('online'));
    await tick();
    assert.equal(w.MOCK_HOTEL_SURVEY_STORAGE_STATUS().pending_delivery_count, 0);
    assert.equal(w.MOCK_HOTEL_SURVEY_STORAGE_STATUS().delivery_error, '');
    assert.ok(calls.every(options => options.mode === 'cors'));
    assert.deepEqual(errors, []);
  } finally { dom.window.close(); }
}

async function completionRecovery(version) {
  const condition = version === 3 ? 'ai_summary' : 'full_reviews';
  const stateKey = `mock_hotel_survey_v1:storage-test:${condition}`;
  const viewPrefix = version === 3 ? 'mock_hotel_ai_review_views_v1' : 'mock_hotel_review_views_v1';
  const state = {
    submission_id: 'sub-test', student_id: 'storage-test', completion_status: 'complete',
    completed_at: '2026-09-23T00:00:00Z',
    answers: { post_review_ai_use_frequency: { value: '7' }, post_review_satisfaction: { value: '4' } }
  };
  let accept = false;
  const payloads = [];
  const stored = {
    [stateKey]: JSON.stringify(state),
    [`${viewPrefix}:storage-test:${condition}:run-test`]: JSON.stringify({ viewedHotelIds: ['arlo-chicago', 'nobu-hotel-chicago'] })
  };
  const { dom, w, d, errors } = openSurvey(version, async (url, options) => {
    payloads.push(JSON.parse(options.body));
    return accept ? receipt() : { ok: false, status: 503 };
  }, stored, '#complete', 'post_review');
  try {
    await tick(); await tick();
    assert.ok(w.MOCK_HOTEL_SURVEY_STORAGE_STATUS().pending_delivery_count > 0);
    assert.equal(d.getElementById('surveyReturnInstruction').hidden, true);
    assert.match(d.getElementById('surveyStorageStatus').textContent, /not yet been confirmed/);
    accept = true;
    d.getElementById('surveyStorageRetry').click();
    await tick(); await tick();
    assert.equal(w.MOCK_HOTEL_SURVEY_STORAGE_STATUS().pending_delivery_count, 0);
    assert.ok(w.MOCK_HOTEL_SURVEY_STORAGE_STATUS().server_confirmed_at);
    assert.equal(d.getElementById('surveyReturnInstruction').hidden, false);
    assert.match(d.getElementById('surveyStorageStatus').textContent, /saved successfully/);
    const snapshot = payloads.flatMap(p => p.events).find(e => e.event_type === 'survey_completion_snapshot');
    assert.deepEqual(snapshot.value.answers, state.answers);
    assert.equal(snapshot.value.study_condition, condition);
    assert.deepEqual(errors, []);
  } finally { dom.window.close(); }
}

async function browsingDelivery(version) {
  const condition = version === 3 ? 'ai_summary' : 'full_reviews';
  const vc = new VirtualConsole();
  const dom = new JSDOM('<meta name="tracking-stream-url" content="https://receiver.test"><body data-review-version="without"></body>', {
    url: `https://survey.test/search-no-reviews.html?STUDENT_ID=storage-test&submission_id=sub-test&study_version=${version}&survey_stage=search_1`,
    runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc
  });
  try {
    const w = dom.window;
    let accept = false;
    const payloads = [];
    w.fetch = async (url, options) => {
      payloads.push(JSON.parse(options.body));
      return accept ? receipt() : { ok: true, json: async () => ({ ok: false, error: 'Quota exceeded' }) };
    };
    w.navigator.sendBeacon = () => { throw new Error('Not an acknowledgement'); };
    w.eval(fs.readFileSync('assets/js/survey-tracking.js', 'utf8'));
    await tick();
    w.HOTEL_EXPERIMENT_TRACK('popup_open', 'hotel:arlo-chicago', { popup_type: 'hotel', hotel_id: 'arlo-chicago' });
    w.HOTEL_EXPERIMENT_TRACK('page_timing', 'arlo-chicago', { context: 'hotel_modal', duration_ms: 12345 });
    w.HOTEL_EXPERIMENT_TRACK('popup_inventory', 'hotel_popups', { popup_type: 'hotel', hotel_ids: ['arlo-chicago', 'nobu-hotel-chicago'] });
    await w.HOTEL_EXPERIMENT_FLUSH();
    assert.equal(w.HOTEL_EXPERIMENT_STORAGE_STATUS().pending, 3);
    // A retry from the questionnaire must still count against the original browsing stage.
    w.history.replaceState(null, '', `/index.html?STUDENT_ID=storage-test&submission_id=sub-test&study_version=${version}&survey_stage=post_review#pr1`);
    delete w.document.body.dataset.reviewVersion;
    w.HOTEL_EXPERIMENT_TRACK('popup_open', 'shopper_profile', { popup_type: 'shopper_profile' });
    accept = true;
    await w.HOTEL_EXPERIMENT_FLUSH();
    assert.equal(w.HOTEL_EXPERIMENT_STORAGE_STATUS().pending, 1);
    await w.HOTEL_EXPERIMENT_FLUSH();
    assert.equal(w.HOTEL_EXPERIMENT_STORAGE_STATUS().pending, 0);
    assert.match(payloads[1].page_url, /survey_stage=search_1/);
    assert.match(payloads[2].page_url, /survey_stage=post_review/);
    assert.equal(payloads[1].prolific.study_condition, condition);
    assert.equal(payloads[2].events[0].value.usage_stage, 'questionnaire_2');
  } finally { dom.window.close(); }
}

async function allQuestionnaireAnswers(version) {
  const condition = version === 3 ? 'ai_summary' : 'full_reviews';
  const suffix = `storage-test:${condition}`;
  const stateKey = `mock_hotel_survey_v1:${suffix}`;
  const hotelIds = ['arlo-chicago', 'nobu-hotel-chicago'];
  const stored = {
    [stateKey]: JSON.stringify({ submission_id: 'sub-test', student_id: 'storage-test', answers: {
      student_id: { value: 'storage-test' }, scenario_attributes_prior: { value: 'Gym, location' },
      solo_city_exploration: { value: true }
    } }),
    [`mock_hotel_no_review_views_v1:${suffix}:run-test`]: JSON.stringify({ viewedHotelIds: hotelIds }),
    [`${version === 3 ? 'mock_hotel_ai_review_views_v1' : 'mock_hotel_review_views_v1'}:${suffix}:run-test`]: JSON.stringify({ viewedHotelIds: hotelIds })
  };
  const payloads = [];
  const fetch = async (url, options) => { payloads.push(JSON.parse(options.body)); return receipt(); };
  const first = openSurvey(version, fetch, stored, '#hq1', 'hotel_questionnaire');
  function answerPage(d) {
    const groups = new Map();
    for (const input of d.querySelectorAll('input[type="radio"]')) {
      if (!groups.has(input.name)) groups.set(input.name, input);
    }
    for (const input of groups.values()) input.checked = true;
    for (const input of d.querySelectorAll('input[type="checkbox"]')) input.checked = true;
    d.getElementById('surveySubmit').click();
  }
  try {
    await tick();
    answerPage(first.d);
    await tick(); await tick();
    const pre = JSON.parse(first.w.localStorage.getItem(stateKey));
    for (const id of hotelIds) assert.equal(Object.keys(pre.answers[`hotelq_${id}_likelihood`].values).length, 4);
    for (const key of Object.keys(first.w.localStorage)) stored[key] = first.w.localStorage.getItem(key);
  } finally { first.dom.window.close(); }
  const second = openSurvey(version, fetch, stored, '#pr1', 'post_review');
  try {
    await tick();
    for (let page = 0; page < 7; page++) { answerPage(second.d); await tick(); }
    await tick(); await tick();
    assert.equal(second.w.location.hash, '#complete');
    const complete = JSON.parse(second.w.localStorage.getItem(stateKey));
    assert.equal(Object.keys(complete.answers).length, 13);
    const snapshot = payloads.flatMap(p => p.events).find(e => e.event_type === 'survey_completion_snapshot');
    assert.ok(snapshot);
    const record = {};
    for (const [id, answer] of Object.entries(snapshot.value.answers)) receiver.applyAnswer_(record, id, answer, snapshot.value.assignment);
    for (const hotel of ['arlo_chicago', 'nobu_hotel_chicago']) {
      for (const stage of ['pre_review', 'post_review']) {
        for (let slot = 1; slot <= 4; slot++) assert.equal(record[`${stage}_${hotel}_attribute_${slot}_likelihood_1_to_5`], 1);
      }
    }
    for (const attr of snapshot.value.assignment.attribute_ids) assert.equal(record[`surprise_${attr}_1_to_5`], 1);
    assert.equal(record.scenario_attributes_prior, 'Gym, location');
    for (const field of ['chosen_hotel_id', 'satisfaction_1_to_7', 'would_switch_hotel', 'switch_likelihood_1_to_5', 'ai_use_frequency_1_to_7']) {
      assert.notEqual(record[field], undefined, field);
      assert.notEqual(record[field], '', field);
    }
    assert.ok(second.w.MOCK_HOTEL_SURVEY_STORAGE_STATUS().server_confirmed_at);
    assert.equal(second.d.getElementById('surveyReturnInstruction').hidden, false);
    assert.deepEqual(second.errors, []);
  } finally { second.dom.window.close(); }
}

(async () => {
  for (const version of [2, 3]) {
    await questionnaireDelivery(version);
    await completionRecovery(version);
    await browsingDelivery(version);
    await allQuestionnaireAnswers(version);
  }
  console.log('PASS: both conditions, HTTP/JSON/application/network failures retained, acknowledged retries, pagehide safety, old completion recovery, completion UI, browsing origin and popup stage preservation. No network writes.');
})().catch(error => { console.error(error); process.exitCode = 1; });
