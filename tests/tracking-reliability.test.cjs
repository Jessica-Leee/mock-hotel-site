// All storage and HTTP calls are local mocks. Never writes to production storage.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { JSDOM, VirtualConsole } = require('jsdom');
const FakeTimers = require('@sinonjs/fake-timers');
const source = fs.readFileSync('assets/js/survey-tracking.js', 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));
const receipt = data => ({ ok: true, json: async () => ({ ok: true, ...data }) });

async function tracker({ version = 2, path = 'search-reviews.html', stage = 'search_2', stored = {}, sessionStored = {}, setup, fetch } = {}) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM('<meta name="tracking-stream-url" content="https://receiver.test"><body></body>', {
    url: `https://survey.test/${path}?STUDENT_ID=tracking-test&submission_id=run-test&study_version=${version}${stage ? '&survey_stage=' + stage : ''}`,
    runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc
  });
  const w = dom.window;
  w.fetch = fetch || (async () => receipt());
  Object.entries(stored).forEach(([key, value]) => w.localStorage.setItem(key, value));
  Object.entries(sessionStored).forEach(([key, value]) => w.sessionStorage.setItem(key, value));
  if (setup) setup(w);
  w.eval(source);
  await tick();
  return {
    w, errors,
    track(id = 'arlo-chicago') { w.HOTEL_EXPERIMENT_TRACK('popup_open', 'hotel:' + id, { popup_type: 'hotel', hotel_id: id }); },
    outboxKey() { return Object.keys(w.localStorage).find(key => key.startsWith('hotel_experiment_stream_outbox_v1:')); },
    close() { w.close(); }
  };
}

test('an older page acknowledgement cannot erase a newer page event in persistent storage', async () => {
  let respond;
  const p = await tracker({ fetch: () => new Promise(resolve => { respond = resolve; }) });
  try {
    p.track();
    const sending = p.w.HOTEL_EXPERIMENT_FLUSH();
    await tick();
    const key = p.outboxKey();
    const queued = JSON.parse(p.w.localStorage.getItem(key));
    const nextPageEvent = { ...queued[0], event_id: 'newer-page-event', element_id: 'hotel:nobu-hotel-chicago', value: { ...queued[0].value, hotel_id: 'nobu-hotel-chicago' } };
    p.w.localStorage.setItem(key, JSON.stringify([...queued, nextPageEvent]));
    respond(receipt());
    await sending;
    assert.deepEqual(JSON.parse(p.w.localStorage.getItem(key)).map(e => e.event_id), ['newer-page-event']);
    assert.equal(p.w.HOTEL_EXPERIMENT_STORAGE_STATUS().pending, 1);
  } finally { p.close(); }
});

test('new events cannot resurrect events already acknowledged in another page', async () => {
  const p = await tracker();
  try {
    p.track();
    const oldId = JSON.parse(p.w.localStorage.getItem(p.outboxKey()))[0].event_id;
    p.w.localStorage.setItem(p.outboxKey(), '[]');
    p.track('nobu-hotel-chicago');
    const queued = JSON.parse(p.w.localStorage.getItem(p.outboxKey()));
    assert.equal(queued.length, 1);
    assert.notEqual(queued[0].event_id, oldId);
    p.w.localStorage.setItem(p.outboxKey(), '[]');
    p.w.dispatchEvent(new p.w.StorageEvent('storage', { key: p.outboxKey(), newValue: '[]' }));
    assert.equal(p.w.HOTEL_EXPERIMENT_STORAGE_STATUS().pending, 0);
  } finally { p.close(); }
});

test('a hanging upload times out, stays queued, and can be retried', async () => {
  const p = await tracker({ fetch: (url, options) => new Promise((resolve, reject) => {
    if (options.signal) options.signal.addEventListener('abort', () => reject(new Error('Upload timed out')));
  }) });
  const clock = FakeTimers.withGlobal(p.w).install({ toFake: ['setTimeout', 'clearTimeout'] });
  try {
    p.track();
    const sending = p.w.HOTEL_EXPERIMENT_FLUSH();
    await tick();
    await clock.tickAsync(45001);
    assert.match(p.w.HOTEL_EXPERIMENT_STORAGE_STATUS().error, /timed out/i);
    await sending;
    assert.equal(p.w.HOTEL_EXPERIMENT_STORAGE_STATUS().pending, 1);
    p.w.fetch = async () => receipt();
    await p.w.HOTEL_EXPERIMENT_FLUSH();
    assert.equal(p.w.HOTEL_EXPERIMENT_STORAGE_STATUS().pending, 0);
  } finally { clock.uninstall(); p.close(); }
});

test('only explicitly acknowledged tracking events are removed', async () => {
  const p = await tracker({ fetch: async (url, options) => {
    const events = JSON.parse(options.body).events;
    return receipt({ tracking_event_ids: [events[0].event_id] });
  } });
  try {
    p.track('arlo-chicago'); p.track('nobu-hotel-chicago');
    await p.w.HOTEL_EXPERIMENT_FLUSH();
    assert.equal(p.w.HOTEL_EXPERIMENT_STORAGE_STATUS().pending, 1);
    assert.match(p.w.HOTEL_EXPERIMENT_STORAGE_STATUS().error, /confirm/i);
    p.w.fetch = async (url, options) => receipt({ tracking_event_ids: JSON.parse(options.body).events.map(e => e.event_id) });
    await p.w.HOTEL_EXPERIMENT_FLUSH();
    assert.equal(p.w.HOTEL_EXPERIMENT_STORAGE_STATUS().pending, 0);
  } finally { p.close(); }
});

test('fallback event IDs remain compatible with the UUID-backed API', async () => {
  const delivered = [];
  const p = await tracker({
    setup(w) { Object.defineProperty(w.crypto, 'randomUUID', { configurable: true, value: undefined }); },
    fetch: async (url, options) => {
      const ids = JSON.parse(options.body).events.map(event => event.event_id);
      delivered.push(...ids);
      return receipt({ tracking_event_ids: ids });
    }
  });
  try {
    p.track();
    const id = JSON.parse(p.w.localStorage.getItem(p.outboxKey()))[0].event_id;
    assert.match(id, /^behavior_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    await p.w.HOTEL_EXPERIMENT_FLUSH();
    assert.deepEqual(delivered, [id]);
    assert.equal(p.w.HOTEL_EXPERIMENT_STORAGE_STATUS().pending, 0);
  } finally { p.close(); }
});

test('session storage restores the outbox when local storage is unavailable', async () => {
  const participant = 'survey-user-session-fallback';
  const outboxKey = `hotel_experiment_stream_outbox_v1:${participant}:full_reviews:run-test`;
  const event = {
    event_id: 'behavior_00000000-0000-4000-8000-000000000099',
    event_type: 'popup_open', element_id: 'hotel:arlo-chicago', timestamp: 1800000000000,
    value: { popup_type: 'hotel', hotel_id: 'arlo-chicago', survey_user_id: participant }
  };
  const delivered = [];
  const p = await tracker({
    sessionStored: {
      'mock_hotel_survey_user_id_v1:tracking-test': participant,
      [outboxKey]: JSON.stringify([event])
    },
    setup(w) {
      Object.defineProperty(w, 'localStorage', {
        configurable: true,
        get() { throw new Error('localStorage blocked'); }
      });
    },
    fetch: async (url, options) => {
      const ids = JSON.parse(options.body).events.map(item => item.event_id);
      delivered.push(...ids);
      return receipt({ tracking_event_ids: ids });
    }
  });
  try {
    assert.equal(p.w.HOTEL_EXPERIMENT_STORAGE_STATUS().pending, 1);
    await p.w.HOTEL_EXPERIMENT_FLUSH();
    assert.deepEqual(delivered, [event.event_id]);
    assert.equal(p.w.HOTEL_EXPERIMENT_STORAGE_STATUS().pending, 0);
  } finally { p.close(); }
});

test('direct browsing links get a stable browsing stage before retrying on a questionnaire', async () => {
  for (const [path, version, expected] of [['search-no-reviews', 2, 'search_1'], ['search-reviews.html', 2, 'search_2'], ['search-ai-summaries', 3, 'search_3']]) {
    const bodies = [];
    const p = await tracker({ path, version, stage: '', fetch: async (url, options) => { bodies.push(JSON.parse(options.body)); return receipt(); } });
    try {
      p.track();
      p.w.history.replaceState(null, '', '/index.html?survey_stage=post_review#pr1');
      await p.w.HOTEL_EXPERIMENT_FLUSH();
      assert.equal(new URL(bodies[0].page_url).searchParams.get('survey_stage'), expected);
      assert.equal(bodies[0].prolific.study_version, String(version));
    } finally { p.close(); }
  }
});

test('failed tracking survives a real page reload with its original stage and event ID', async () => {
  for (const version of [2, 3]) {
    const p = await tracker({ version, path: 'search-no-reviews.html', stage: 'search_1', fetch: async () => { throw new Error('offline'); } });
    p.track();
    await p.w.HOTEL_EXPERIMENT_FLUSH();
    const stored = { ...p.w.localStorage };
    const expected = JSON.parse(stored[p.outboxKey()])[0].event_id;
    p.close();
    const bodies = [];
    const q = await tracker({ version, path: 'index.html', stage: 'post_review', stored, fetch: async (url, options) => { bodies.push(JSON.parse(options.body)); return receipt(); } });
    try {
      await q.w.HOTEL_EXPERIMENT_FLUSH();
      assert.equal(q.w.HOTEL_EXPERIMENT_STORAGE_STATUS().pending, 0);
      assert.equal(bodies[0].events[0].event_id, expected);
      assert.match(bodies[0].page_url, /survey_stage=search_1/);
      assert.deepEqual(q.errors, []);
    } finally { q.close(); }
  }
});

test('large review-tracking batches are split without dropping any events', async () => {
  const delivered = [];
  const p = await tracker({ fetch: async (url, options) => {
    assert.ok(Buffer.byteLength(options.body) < 48000);
    assert.equal(options.keepalive, true);
    const ids = JSON.parse(options.body).events.map(e => e.event_id);
    delivered.push(...ids);
    return receipt({ tracking_event_ids: ids });
  } });
  try {
    for (let i = 0; i < 10; i++) p.w.HOTEL_EXPERIMENT_TRACK('page_timing', 'arlo-chicago', {
      context: 'hotel_modal', duration_ms: 10000,
      review_visibility: Array.from({ length: 150 }, (_, n) => ({ position: n + 1, review_id: 'review-' + n, visible_ms: 1000 }))
    });
    const expected = JSON.parse(p.w.localStorage.getItem(p.outboxKey())).map(e => e.event_id);
    while (p.w.HOTEL_EXPERIMENT_STORAGE_STATUS().pending) await p.w.HOTEL_EXPERIMENT_FLUSH();
    assert.deepEqual(delivered, expected);
  } finally { p.close(); }
});

test('both hotel popup open/close events are captured on all three real browsing pages', async () => {
  for (const [file, version] of [['search-no-reviews.html', 2], ['search-no-reviews.html', 3], ['search-reviews.html', 2], ['search-ai-summaries.html', 3]]) {
    const errors = [];
    const vc = new VirtualConsole();
    vc.on('jsdomError', error => errors.push(error.message));
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
      url: `https://survey.test/${file}?STUDENT_ID=popup-test&submission_id=run-test&study_version=${version}`,
      runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc
    });
    const w = dom.window;
    const clock = FakeTimers.withGlobal(w).install({ now: 1800000000000, toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'] });
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
      const key = Object.keys(w.localStorage).find(key => key.startsWith('hotel_experiment_stream_outbox_v1:'));
      const queued = JSON.parse(w.localStorage.getItem(key));
      for (const id of ['arlo-chicago', 'nobu-hotel-chicago']) {
        assert.equal(queued.filter(e => e.event_type === 'popup_open' && e.value.hotel_id === id).length, 1);
        const timings = queued.filter(e => e.event_type === 'page_timing' && e.element_id === id);
        assert.equal(timings.length, 1);
        assert.ok(timings[0].value.duration_ms >= 10000);
      }
      assert.equal(w.document.querySelector('#studyFlowCta button').disabled, false);
      const ids = queued.map(e => e.event_id);
      const delivered = [];
      w.fetch = async (url, options) => {
        const body = JSON.parse(options.body);
        const batch = body.events.map(e => e.event_id);
        delivered.push(...batch);
        assert.equal(body.prolific.study_version, String(version));
        return receipt({ tracking_event_ids: batch });
      };
      while (w.HOTEL_EXPERIMENT_STORAGE_STATUS().pending) await w.HOTEL_EXPERIMENT_FLUSH();
      assert.deepEqual(new Set(delivered), new Set(ids));
      assert.deepEqual(errors, []);
    } finally { clock.uninstall(); w.close(); }
  }
});

test('hidden tabs do not accumulate viewing or review-reading time', async () => {
  const dom = new JSDOM('<body><div id="modalRoot" class="is-open" data-active-hotel="arlo-chicago"><div id="hotelModalScroll"><section data-track-section="reviews"><article data-review-index="0" data-review-position="1" data-review-id="review-1">Review</article></section><section data-track-section="ai_review_summary">Summary</section></div></div></body>', {
    url: 'https://survey.test/search-ai-summaries?survey_stage=search_3', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window, observers = [];
  const start = 1800000000000;
  const clock = FakeTimers.withGlobal(w).install({ now: start, toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'] });
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
    for (const observer of observers) observer.callback(observer.nodes.map(target => ({ target, isIntersecting: true, intersectionRatio: 1, intersectionRect: { height: 100 } })));
    await clock.tickAsync(1000);
    hidden(true);
    await clock.tickAsync(20000);
    hidden(false);
    await clock.tickAsync(2000);
    w.HOTEL_EXPERIMENT_FINALIZE_MODAL('click');
    const event = w.HOTEL_EXPERIMENT_GET_EVENTS().find(e => e.event_type === 'page_timing');
    assert.ok(event.value.duration_ms >= 3000 && event.value.duration_ms <= 3001);
    assert.equal(event.value.summary_viewing_ms, 3000);
    assert.equal(event.value.individual_reviews_viewing_ms, 3000);
    assert.equal(event.value.review_visibility[0].visible_ms, 3000);
    assert.equal(event.value.review_read_count, 1);
    assert.ok(event.value.opened_at_ms >= start && event.value.opened_at_ms <= start + 1);
  } finally { clock.uninstall(); w.close(); }
});
