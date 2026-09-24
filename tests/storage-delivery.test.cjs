// All HTTP calls are mocked. No test data is sent to Supabase or Google Sheets.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8').replace(
  /<script src="\.\/([^"?]+)[^"]*"><\/script>/g,
  (_, file) => '<script>' + fs.readFileSync(file, 'utf8') + '</script>'
);
const tick = () => new Promise(resolve => setImmediate(resolve));
const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body
});

function openSurvey(url, fetch) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(html, {
    url,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.fetch = fetch;
      window.scrollTo = () => {};
      window.navigator.sendBeacon = () => true;
      window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
    }
  });
  return { dom, window: dom.window, document: dom.window.document, errors };
}

test('questionnaire navigation waits for a confirmed server resume', async () => {
  let acceptStart = false;
  let survey = null;
  const starts = [];
  const page = openSurvey('https://survey.test/?study_version=2', async (url, options = {}) => {
    const payload = JSON.parse(options.body);
    if (payload.action !== 'resume') return response({ ok: false, error: 'Unexpected request.' }, 400);
    starts.push(payload);
    if (!acceptStart) return response({ ok: false, error: 'Temporary storage failure.' }, 503);
    survey = {
      participant_id: '00000000-0000-4000-8000-000000000001',
      student_id: payload.student_id,
      condition: payload.condition,
      survey_version: '2',
      assigned_attributes: ['location_convenience', 'fitness_facilities', 'cleanliness', 'wifi_reliability'],
      answers: { student_id: payload.answer },
      completed_pages: ['student_id'],
      current_page: 'scenario_attributes_prior',
      completion_status: 'in_progress'
    };
    return response({ ok: true, survey });
  });
  try {
    await tick(); await tick();
    const input = page.document.getElementById('answerInput');
    input.value = 'student-7';
    page.document.getElementById('surveySubmit').click();
    await tick(); await tick();
    assert.equal(page.window.location.hash, '#q1');
    assert.match(page.document.getElementById('surveySaveStatus').textContent, /Temporary storage failure/);

    acceptStart = true;
    page.document.getElementById('surveySubmit').click();
    await tick(); await tick();
    assert.equal(page.window.location.hash, '#q2');
    assert.equal(starts.length, 2);
    assert.equal(starts[0].student_id, starts[1].student_id);
    assert.equal(survey.student_id, 'STUDENT-7');
    assert.deepEqual(page.errors, []);
  } finally {
    page.dom.window.close();
  }
});

test('entering a completed Student ID renders the completion screen', async () => {
  const survey = {
    participant_id: '00000000-0000-4000-8000-000000000002',
    student_id: 'STUDENT-8',
    condition: 'full_reviews',
    survey_version: '2',
    assigned_attributes: ['location_convenience', 'fitness_facilities', 'cleanliness', 'wifi_reliability'],
    answers: {}, completed_pages: [], current_page: 'complete', completion_status: 'complete'
  };
  const page = openSurvey(
    'https://survey.test/?study_condition=full_reviews&study_version=2',
    async (url, options = {}) => {
      const payload = JSON.parse(options.body);
      return payload.action === 'resume'
        ? response({ ok: true, survey, browsing: [] })
        : response({ ok: false, error: 'Unexpected write.' }, 400);
    }
  );
  try {
    await tick(); await tick();
    page.document.getElementById('answerInput').value = 'student-8';
    page.document.getElementById('surveySubmit').click();
    await tick(); await tick();
    assert.equal(page.window.location.hash, '#complete');
    assert.match(page.document.getElementById('surveyStorageStatus').textContent, /saved successfully/i);
    assert.equal(page.document.getElementById('surveyReturnInstruction').hidden, false);
    assert.equal(page.document.getElementById('surveySubmit').hidden, true);
    assert.deepEqual(page.errors, []);
  } finally {
    page.dom.window.close();
  }
});

test('an entry load always starts at a blank Student ID page without reading storage', async () => {
  let requests = 0;
  const page = openSurvey(
    'https://survey.test/?STUDENT_ID=OLD-ID&survey_stage=post_review#complete',
    async () => { requests += 1; return response({ ok: false }, 500); }
  );
  try {
    await tick(); await tick();
    assert.equal(requests, 0);
    assert.equal(page.window.location.hash, '#q1');
    assert.equal(page.window.location.search, '');
    assert.equal(page.document.getElementById('answerInput').value, '');
    assert.match(page.document.querySelector('h1').textContent, /Student ID/);
  } finally {
    page.dom.window.close();
  }
});
