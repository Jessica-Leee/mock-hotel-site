const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

const participantId = '00000000-0000-4000-8000-000000000099';
const hotels = ['arlo-chicago', 'nobu-hotel-chicago'];
const tick = () => new Promise(resolve => setImmediate(resolve));

for (const [file, stage] of [
  ['search-no-reviews.html', 'information'],
  ['search-reviews.html', 'reviews'],
  ['search-ai-summaries.html', 'reviews']
]) {
  test(`${file} restores confirmed browsing progress from the server`, async () => {
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
      url: `https://survey.test/${file}?participant_id=${participantId}`,
      runScripts: 'outside-only', pretendToBeVisual: true
    });
    const { window } = dom;
    window.HotelSurveyStorage = {
      load: async () => ({
        browsing: hotels.map(hotel_id => ({ browsing_stage: stage, hotel_id }))
      })
    };
    try {
      window.eval(fs.readFileSync('assets/js/hotel-listings.js', 'utf8'));
      await tick(); await tick();
      const button = window.document.querySelector('#studyFlowCta button');
      assert.equal(button.disabled, false);
      assert.match(window.document.getElementById('studyFlowStatus').textContent, /Completed|unlocked/i);
    } finally {
      window.close();
    }
  });
}
