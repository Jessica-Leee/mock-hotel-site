// Requires jsdom; run from the repository root. All delivery calls are mocked.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');

async function check(version) {
  const errors = [];
  let serverSurvey = null;
  const vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const html = fs.readFileSync('index.html', 'utf8').replace(
    /<script src="\.\/([^"?]+)[^"]*"><\/script>/g,
    (_, file) => '<script>' + fs.readFileSync(file, 'utf8') + '</script>'
  );
  const dom = new JSDOM(html, {
    url: `https://survey.test/index.html?study_version=${version}`,
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.scrollTo = () => {};
      w.fetch = async (url, options = {}) => {
        const payload = JSON.parse(options.body);
        if (payload.action === 'resume') {
          serverSurvey = {
            participant_id: '00000000-0000-4000-8000-000000000001',
            student_id: payload.student_id,
            condition: payload.condition,
            survey_version: payload.condition === 'ai_summary' ? '3' : '2',
            assigned_attributes: ['location_convenience', 'fitness_facilities', 'cleanliness', 'wifi_reliability'],
            answers: { student_id: payload.answer }, current_page: 'scenario_attributes_prior',
            completion_status: 'in_progress', completed_pages: ['student_id']
          };
        } else if (payload.action === 'save') {
          serverSurvey = {
            ...serverSurvey,
            answers: { ...serverSurvey.answers, ...payload.answers },
            current_page: payload.next_page,
            completed_pages: [...new Set([...(serverSurvey.completed_pages || []), payload.page_id])]
          };
        }
        return { ok: true, status: 200, json: async () => ({ ok: true, survey: serverSurvey, browsing: [] }) };
      };
      w.navigator.sendBeacon = () => true;
      w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
    }
  });
  try {
    const tick = () => new Promise(resolve => setImmediate(resolve));
    await tick(); await tick();
    const w = dom.window, d = w.document;
    const next = async () => { d.getElementById('surveySubmit').click(); await tick(); await tick(); };
    assert.equal(d.getElementById('answerInput').required, true);
    await next();
    assert.equal(w.location.hash, '#q1');
    d.getElementById('answerInput').value = 'student-7';
    await next();
    assert.equal(w.location.hash, '#q2');
    assert.equal(d.querySelector('h1').textContent, 'Your Trip Scenario: Solo City Exploration');
    assert.match(d.querySelector('.survey-scenario-summary').textContent, /Duration: 3 nights. Budget: up to \$150\/night/);
    assert.equal(d.querySelector('.survey-profile'), null);
    assert.equal(d.querySelector('[data-view-shopper-profile]'), null);
    assert.equal(d.querySelector('textarea').required, true);
    await next();
    assert.equal(w.location.hash, '#q2');
    const input = d.querySelector('textarea');
    input.value = '  ';
    await next();
    assert.equal(w.location.hash, '#q2');
    const answer = 'Quiet room, walkable location, gym, breakfast';
    input.value = answer;
    input.dispatchEvent(new w.Event('input'));
    await next();
    assert.equal(w.location.hash, '#q3');
    assert.ok(d.querySelector('.survey-profile'));
    assert.equal(serverSurvey.answers.scenario_attributes_prior.value, answer);
    assert.equal(serverSurvey.student_id, 'STUDENT-7');
    assert.deepEqual(errors, []);
  } finally {
    await new Promise(resolve => setImmediate(resolve));
    dom.window.close();
  }
}
(async () => {
  await check(2);
  await check(3);
  console.log('PASS: both conditions; required ID -> scenario/open response -> profile; no early profile; required nonblank text; confirmed server answer. No network writes.');
})().catch(error => { console.error(error); process.exitCode = 1; });
