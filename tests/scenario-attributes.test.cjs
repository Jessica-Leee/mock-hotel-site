// Requires jsdom; run from the repository root. All delivery calls are mocked.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const receiver = vm.createContext({});
vm.runInContext(fs.readFileSync('backend/google-sheets-receiver.gs', 'utf8'), receiver);
const headers = vm.runInContext('SURVEY_HEADERS', receiver);
assert.equal(headers.length, 55);
assert.equal(headers.at(-1), 'scenario_attributes_prior');
assert.equal(vm.runInContext('BROWSING_HEADERS.length', receiver), 35);

async function check(version) {
  const errors = [];
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
      w.fetch = async () => ({ ok: true });
      w.navigator.sendBeacon = () => true;
      w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
    }
  });
  try {
    await new Promise(resolve => setImmediate(resolve));
    const w = dom.window, d = w.document;
    const next = () => d.getElementById('surveySubmit').click();
    assert.equal(d.getElementById('answerInput').required, false);
    next();
    assert.equal(w.location.hash, '#q2');
    assert.equal(d.querySelector('h1').textContent, 'Your Trip Scenario: Solo City Exploration');
    assert.match(d.querySelector('.survey-scenario-summary').textContent, /Duration: 3 nights. Budget: up to \$150\/night/);
    assert.equal(d.querySelector('.survey-profile'), null);
    assert.equal(d.querySelector('[data-view-shopper-profile]'), null);
    assert.equal(d.querySelector('textarea').required, true);
    next();
    assert.equal(w.location.hash, '#q2');
    const input = d.querySelector('textarea');
    input.value = '  ';
    next();
    assert.equal(w.location.hash, '#q2');
    const answer = 'Quiet room, walkable location, gym, breakfast';
    input.value = answer;
    input.dispatchEvent(new w.Event('input'));
    next();
    assert.equal(w.location.hash, '#q3');
    assert.ok(d.querySelector('.survey-profile'));
    const condition = version === 3 ? 'ai_summary' : 'full_reviews';
    const saved = JSON.parse(w.localStorage.getItem(`mock_hotel_survey_v1:anonymous:${condition}`));
    assert.equal(saved.answers.scenario_attributes_prior.value, answer);
    assert.ok(saved.survey_user_id);
    const record = {};
    receiver.applyAnswer_(record, 'scenario_attributes_prior', saved.answers.scenario_attributes_prior, saved.assignment);
    assert.equal(record.scenario_attributes_prior, answer);
    receiver.applyAnswer_(record, 'scenario_attributes_prior', { value: '=SUM(A1:A2)' }, {});
    assert.equal(record.scenario_attributes_prior, "'=SUM(A1:A2)");
    assert.deepEqual(errors, []);
  } finally {
    dom.window.close();
  }
}
(async () => {
  await check(2);
  await check(3);
  console.log('PASS: both conditions; optional ID -> scenario/open response -> profile; no early profile; required nonblank text; saved answer; receiver mapping; formula escaping. No network writes.');
})().catch(error => { console.error(error); process.exitCode = 1; });
