// Requires jsdom; run from the repository root. No network requests are made.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const types = ['shopper_profile', 'hotel_order', 'revealed_attributes'];
const errors = [];

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
  assert.deepEqual(errors, []);
  console.log('PASS: all four popup stages, both conditions, direct/clean URLs, and capture-time attribution. No network writes.');
})().catch(error => { console.error(error); process.exitCode = 1; });
