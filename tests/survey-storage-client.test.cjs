const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('page saves retain one request ID across a failed response and retry', async () => {
  const requests = [];
  let fail = true;
  const context = vm.createContext({
    window: {},
    document: { body: { dataset: {} } },
    location: { search: '?participant_id=00000000-0000-4000-8000-000000000099&survey_stage=hotel_questionnaire' },
    URLSearchParams, Date, AbortController, setTimeout, clearTimeout,
    crypto: { randomUUID: () => `00000000-0000-4000-8000-${String(requests.length + 1).padStart(12, '0')}` },
    fetch: async (_url, options) => {
      requests.push(JSON.parse(options.body));
      return fail
        ? { ok: false, status: 503, json: async () => ({ error: 'Temporary error' }) }
        : { ok: true, json: async () => ({ ok: true, survey: {} }) };
    }
  });
  vm.runInContext(fs.readFileSync('assets/js/survey-storage.js', 'utf8'), context);
  await assert.rejects(context.window.HotelSurveyStorage.save('scenario_attributes_prior', {
    scenario_attributes_prior: { value: 'Fitness' }
  }, 'solo_city_exploration', false), /Temporary error/);
  fail = false;
  await context.window.HotelSurveyStorage.save('scenario_attributes_prior', {
    scenario_attributes_prior: { value: 'Fitness' }
  }, 'solo_city_exploration', false);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].save_id, requests[1].save_id);
  assert.equal(requests[0].participant_id, '00000000-0000-4000-8000-000000000099');
});

test('browsing sends each finalized hotel visit and popup stage', async () => {
  const hotelId = 'arlo-chicago';
  let sent;
  const context = vm.createContext({
    window: {
      HOTEL_EXPERIMENT_FLUSH: () => new Promise(() => {}),
      HOTEL_EXPERIMENT_STORAGE_STATUS: () => ({ pending: 3 }),
      HOTEL_EXPERIMENT_GET_PAYLOAD: () => ({ events: [
        { event_id: 'behavior_00000000-0000-4000-8000-000000000001',
          event_type: 'popup_open', timestamp: 1000, element_id: `hotel:${hotelId}`,
          value: { popup_type: 'hotel', hotel_id: hotelId } },
        { event_id: 'behavior_00000000-0000-4000-8000-000000000002',
          event_type: 'page_timing', timestamp: 13000, element_id: hotelId,
          value: { context: 'hotel_modal', duration_ms: 12000 } }
      ] })
    },
    document: { body: { dataset: { reviewVersion: 'without' } } },
    location: { search: '?participant_id=00000000-0000-4000-8000-000000000099&survey_stage=search_1' },
    URLSearchParams, Date, AbortController, setTimeout, clearTimeout,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000003' },
    fetch: async (_url, options) => {
      sent = JSON.parse(options.body);
      return { ok: true, json: async () => ({ ok: true }) };
    }
  });
  vm.runInContext(fs.readFileSync('assets/js/survey-storage.js', 'utf8'), context);
  await context.window.HotelSurveyStorage.browse('information');
  assert.equal(sent.visits.length, 1);
  assert.equal(sent.visits[0].hotel_id, hotelId);
  assert.equal(sent.visits[0].metrics.duration_ms, 12000);
  assert.equal(sent.popup_events[0].stage, 'browsing_1');
});
