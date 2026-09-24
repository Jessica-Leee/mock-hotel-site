// All storage and HTTP calls are local mocks. Never writes to production storage.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { JSDOM, VirtualConsole } = require('jsdom');
const FakeTimers = require('@sinonjs/fake-timers');

const source = fs.readFileSync('assets/js/survey-tracking.js', 'utf8');
const participantId = '00000000-0000-4000-8000-000000000099';
const tick = () => new Promise(resolve => setImmediate(resolve));
const receipt = data => ({ ok: true, json: async () => ({ ok: true, ...data }) });

async function tracker({ version = 2, path = 'search-reviews.html', stage = 'search_2', setup, fetch } = {}) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const query = new URLSearchParams({ participant_id: participantId, study_version: String(version) });
  if (stage) query.set('survey_stage', stage);
  const dom = new JSDOM('<body></body>', {
    url: `https://survey.test/${path}?${query}`,
    runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc
  });
  const w = dom.window;
  w.fetch = fetch || (async (_url, options) => {
    const events = JSON.parse(options.body).events;
    return receipt({ tracking_event_ids: events.map(event => event.event_id) });
  });
  if (setup) setup(w);
  w.eval(source);
  await tick();
  return {
    w,
    errors,
    track(id = 'arlo-chicago') {
      w.HOTEL_EXPERIMENT_TRACK('popup_open', `hotel:${id}`, {
        popup_type: 'hotel', hotel_id: id
      });
    },
    close() { w.close(); }
  };
}

test('tracking is memory-only and retries while the page remains open', async () => {
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB/);
  let fail = true;
  const delivered = [];
  const page = await tracker({ fetch: async (_url, options) => {
    if (fail) throw new Error('offline');
    const ids = JSON.parse(options.body).events.map(event => event.event_id);
    delivered.push(...ids);
    return receipt({ tracking_event_ids: ids });
  } });
  try {
    page.track();
    await page.w.HOTEL_EXPERIMENT_FLUSH();
    assert.equal(page.w.HOTEL_EXPERIMENT_DELIVERY_STATUS().pending, 1);
    fail = false;
    await page.w.HOTEL_EXPERIMENT_FLUSH();
    assert.equal(page.w.HOTEL_EXPERIMENT_DELIVERY_STATUS().pending, 0);
    assert.equal(delivered.length, 1);
  } finally { page.close(); }
});

test('only explicitly acknowledged events leave the in-memory queue', async () => {
  const page = await tracker({ fetch: async (_url, options) => {
    const events = JSON.parse(options.body).events;
    return receipt({ tracking_event_ids: [events[0].event_id] });
  } });
  try {
    page.track('arlo-chicago');
    page.track('nobu-hotel-chicago');
    await page.w.HOTEL_EXPERIMENT_FLUSH();
    assert.equal(page.w.HOTEL_EXPERIMENT_DELIVERY_STATUS().pending, 1);
    assert.match(page.w.HOTEL_EXPERIMENT_DELIVERY_STATUS().error, /confirm/i);
  } finally { page.close(); }
});

test('fallback event IDs remain compatible with the UUID-backed API', async () => {
  const ids = [];
  const page = await tracker({
    setup(w) { Object.defineProperty(w.crypto, 'randomUUID', { configurable: true, value: undefined }); },
    fetch: async (_url, options) => {
      const batch = JSON.parse(options.body).events.map(event => event.event_id);
      ids.push(...batch);
      return receipt({ tracking_event_ids: batch });
    }
  });
  try {
    page.track();
    await page.w.HOTEL_EXPERIMENT_FLUSH();
    assert.match(ids[0], /^behavior_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  } finally { page.close(); }
});

test('direct browsing links retain their original browsing stage', async () => {
  for (const [path, version, expected] of [
    ['search-no-reviews', 2, 'search_1'],
    ['search-reviews.html', 2, 'search_2'],
    ['search-ai-summaries', 3, 'search_3']
  ]) {
    const bodies = [];
    const page = await tracker({ path, version, stage: '', fetch: async (_url, options) => {
      const body = JSON.parse(options.body);
      bodies.push(body);
      return receipt({ tracking_event_ids: body.events.map(event => event.event_id) });
    } });
    try {
      page.track();
      page.w.history.replaceState(null, '', `/index.html?participant_id=${participantId}&survey_stage=post_review#pr1`);
      await page.w.HOTEL_EXPERIMENT_FLUSH();
      assert.equal(new URL(bodies[0].page_url).searchParams.get('survey_stage'), expected);
      assert.equal(bodies[0].participant_id, participantId);
    } finally { page.close(); }
  }
});

test('large review-tracking batches are split without dropping events', async () => {
  const delivered = [];
  const page = await tracker({ fetch: async (_url, options) => {
    assert.ok(Buffer.byteLength(options.body) < 48000);
    const ids = JSON.parse(options.body).events.map(event => event.event_id);
    delivered.push(...ids);
    return receipt({ tracking_event_ids: ids });
  } });
  try {
    for (let i = 0; i < 10; i++) page.w.HOTEL_EXPERIMENT_TRACK('page_timing', 'arlo-chicago', {
      context: 'hotel_modal', duration_ms: 10000,
      review_visibility: Array.from({ length: 150 }, (_, n) => ({
        position: n + 1, review_id: `review-${n}`, visible_ms: 1000
      }))
    });
    const expected = Array.from(page.w.HOTEL_EXPERIMENT_GET_EVENTS())
      .filter(event => event.event_type === 'page_timing').map(event => event.event_id);
    while (page.w.HOTEL_EXPERIMENT_DELIVERY_STATUS().pending) {
      await page.w.HOTEL_EXPERIMENT_FLUSH();
    }
    assert.deepEqual(delivered, expected);
  } finally { page.close(); }
});

test('both hotel popup visits are captured on all browsing pages', async () => {
  for (const [file, version] of [
    ['search-no-reviews.html', 2],
    ['search-reviews.html', 2],
    ['search-ai-summaries.html', 3]
  ]) {
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
      url: `https://survey.test/${file}?participant_id=${participantId}&study_version=${version}`,
      runScripts: 'outside-only', pretendToBeVisual: true
    });
    const w = dom.window;
    const clock = FakeTimers.withGlobal(w).install({
      now: 1800000000000,
      toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout']
    });
    w.IntersectionObserver = class { observe() {} disconnect() {} };
    w.fetch = async () => { throw new Error('offline'); };
    try {
      w.eval(source);
      w.eval(fs.readFileSync('assets/js/hotel-listings.js', 'utf8'));
      await clock.tickAsync(1);
      for (const id of ['arlo-chicago', 'nobu-hotel-chicago']) {
        w.document.querySelector(`.hotel-title__link[data-open="${id}"]`).click();
        await clock.tickAsync(10010);
        w.document.querySelector('#modalRoot button[data-close]').click();
        await clock.tickAsync(1);
      }
      const events = w.HOTEL_EXPERIMENT_GET_EVENTS();
      for (const id of ['arlo-chicago', 'nobu-hotel-chicago']) {
        assert.equal(events.filter(event => event.event_type === 'popup_open' && event.value.hotel_id === id).length, 1);
        const timings = events.filter(event => event.event_type === 'page_timing' && event.element_id === id);
        assert.equal(timings.length, 1);
        assert.ok(timings[0].value.duration_ms >= 10000);
      }
      assert.equal(w.document.querySelector('#studyFlowCta button').disabled, false);
    } finally { clock.uninstall(); w.close(); }
  }
});

test('hidden tabs do not accumulate viewing or review-reading time', async () => {
  const dom = new JSDOM('<body><div id="modalRoot" class="is-open" data-active-hotel="arlo-chicago"><div id="hotelModalScroll"><section data-track-section="reviews"><article data-review-index="0" data-review-position="1" data-review-id="review-1">Review</article></section><section data-track-section="ai_review_summary">Summary</section></div></div></body>', {
    url: `https://survey.test/search-ai-summaries?participant_id=${participantId}&survey_stage=search_3`,
    runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  const observers = [];
  const start = 1800000000000;
  const clock = FakeTimers.withGlobal(w).install({
    now: start, toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout']
  });
  w.fetch = async () => receipt({ tracking_event_ids: [] });
  w.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; this.nodes = []; observers.push(this); }
    observe(node) { this.nodes.push(node); }
    disconnect() {}
  };
  function hidden(value) {
    Object.defineProperty(w.document, 'hidden', { configurable: true, value });
    Object.defineProperty(w.document, 'visibilityState', { configurable: true, value: value ? 'hidden' : 'visible' });
    w.document.dispatchEvent(new w.Event('visibilitychange'));
  }
  try {
    w.eval(source);
    await clock.tickAsync(1);
    for (const observer of observers) observer.callback(observer.nodes.map(target => ({
      target, isIntersecting: true, intersectionRatio: 1, intersectionRect: { height: 100 }
    })));
    await clock.tickAsync(1000);
    hidden(true);
    await clock.tickAsync(20000);
    hidden(false);
    await clock.tickAsync(2000);
    w.HOTEL_EXPERIMENT_FINALIZE_MODAL('click');
    const event = w.HOTEL_EXPERIMENT_GET_EVENTS().find(item => item.event_type === 'page_timing');
    assert.ok(event.value.duration_ms >= 3000 && event.value.duration_ms <= 3001);
    assert.equal(event.value.summary_viewing_ms, 3000);
    assert.equal(event.value.individual_reviews_viewing_ms, 3000);
    assert.equal(event.value.review_visibility[0].visible_ms, 3000);
    assert.equal(event.value.review_read_count, 1);
  } finally { clock.uninstall(); w.close(); }
});
