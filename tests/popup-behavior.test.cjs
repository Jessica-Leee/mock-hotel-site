// Requires jsdom and @sinonjs/fake-timers; run from the repository root.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const FakeTimers = require('@sinonjs/fake-timers');
const errors = [];
const sequences = new Map();
function page(file, participant, now = 1800000000000, hash = '') {
  const vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    url: `https://chicago-hotel-survey.pages.dev/${file}?participant_id=${participant}${hash}`,
    runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc
  });
  const w = dom.window;
  const clock = FakeTimers.withGlobal(w).install({ now, toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'] });
  w.eval(fs.readFileSync('assets/js/hotel-listings.js', 'utf8'));
  return { w, d: w.document, clock, close() { clock.uninstall(); w.close(); } };
}
function click(p, selector) {
  const element = p.d.querySelector(selector);
  assert.ok(element, selector);
  element.click();
}
const modal = p => p.d.querySelector('#modalRoot.is-open');
const closeButton = p => p.d.querySelector('#modalRoot button[data-close]');
const reviewsIn = p => Array.from(p.d.querySelectorAll('[data-review-index]'), element => element.textContent);
function hidden(p, value) {
  Object.defineProperty(p.d, 'hidden', { configurable: true, value });
  p.d.dispatchEvent(new p.w.Event('visibilitychange'));
}
(async () => {
  for (const file of ['search-no-reviews.html', 'search-reviews.html', 'search-ai-summaries.html']) {
    for (const participant of ['CHECK-ONE', 'CHECK-TWO']) {
      let p = page(file, participant);
      await p.clock.tickAsync(1);
      for (const id of ['arlo-chicago', 'nobu-hotel-chicago']) {
        click(p, `.hotel-title__link[data-open="${id}"]`);
        assert.ok(closeButton(p).disabled);
        assert.match(p.d.querySelector('[data-minimum-countdown]').textContent, /10 seconds/);
        const reviews = reviewsIn(p);
        if (file !== 'search-no-reviews.html') {
          assert.equal(reviews.length, 150);
          if (sequences.has(id)) assert.deepEqual(reviews, sequences.get(id));
          else sequences.set(id, reviews);
        }
        click(p, '#modalRoot button[data-close]');
        p.d.dispatchEvent(new p.w.KeyboardEvent('keydown', { key: 'Escape' }));
        click(p, '.modal-backdrop');
        assert.ok(modal(p));
        assert.ok(p.d.querySelector('#studyFlowCta button').disabled);
        const other = id === 'arlo-chicago' ? 'nobu-hotel-chicago' : 'arlo-chicago';
        click(p, `.hotel-title__link[data-open="${other}"]`);
        assert.equal(modal(p).dataset.activeHotel, id);
        await p.clock.tickAsync(4000);
        hidden(p, true);
        await p.clock.tickAsync(20000);
        assert.ok(modal(p));
        assert.ok(closeButton(p).disabled);
        assert.equal(p.d.querySelector('[data-countdown-value]').textContent, '0:41');
        hidden(p, false);
        await p.clock.tickAsync(5999);
        click(p, '.modal-backdrop');
        assert.ok(modal(p), 'cannot close at 9.999 seconds');
        await p.clock.tickAsync(1);
        assert.equal(closeButton(p).disabled, false);
        click(p, '#modalRoot button[data-close]');
        assert.equal(modal(p), null);
        await p.clock.tickAsync(20000);
        click(p, `.cta [data-open="${id}"]`);
        assert.equal(closeButton(p).disabled, false);
        assert.equal(p.d.querySelector('[data-countdown-value]').textContent, '0:35');
        assert.deepEqual(reviewsIn(p), reviews);
        await p.clock.tickAsync(35000);
        assert.equal(modal(p), null);
        assert.ok(p.d.querySelector(`[data-open="${id}"]`).disabled);
      }
      assert.equal(p.d.querySelector('#studyFlowCta button').disabled, false);
      p.close();
    }
  }
  assert.deepEqual(errors, []);
  console.log('PASS: 3 browsing pages x 2 participants; close/Escape/backdrop/switch guards; 10-second boundary; background pause; reopening; 45-second expiry; both-hotels gate; fixed 150-review sequences. No network writes.');
})().catch(error => { console.error(error); process.exitCode = 1; });
