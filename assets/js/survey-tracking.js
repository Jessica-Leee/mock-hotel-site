/**
 * Invisible behavioral tracking for hotel listing experiment.
 *
 * Each event: { event_type, element_id, timestamp, value }
 * Browsing events are mirrored locally until the same-origin API confirms receipt.
 *
 * Student / survey handoff:
 *   1) URL query: ?STUDENT_ID=… (legacy Prolific parameters remain accepted).
 *   2) Optional beacon: <meta name="tracking-beacon-url" content="https://…"> or ?beacon=https://…
 *      → full JSON POSTed via navigator.sendBeacon on pagehide / visibility hidden.
 *   3) Optional completion URL: <meta name="prolific-completion-url" content="https://app.prolific.com/submissions/complete?cc=CODE">
 *      → appends &study_summary_b64=… (truncated) so a same-tab redirect survey can read it.
 *      → Set <meta name="study-redirect-completion" content="true"> to auto-navigate on pagehide (optional).
 *
 * Same-tab follow-up survey (e.g. Qualtrics on your domain): read sessionStorage[HOTEL_EXPERIMENT_STORAGE_KEY]
 * for the full event array after participants return from the hotel task page.
 *
 * Browser events are mirrored through BroadcastChannel("hotel_experiment_live") and
 * localStorage hotel_experiment_live_v1 for optional same-origin research tooling.
 */
(function () {
  "use strict";

  var LIVE_CHANNEL = "hotel_experiment_live";
  var LIVE_STORAGE_KEY = "hotel_experiment_live_v1";
  var STORAGE_KEY = "hotel_experiment_tracking_v1";
  var STREAM_OUTBOX_STORAGE_PREFIX = "hotel_experiment_stream_outbox_v1";
  var SURVEY_USER_ID_STORAGE_PREFIX = "mock_hotel_survey_user_id_v1";
  var SURVEY_USER_ID_CURRENT_KEY = SURVEY_USER_ID_STORAGE_PREFIX + ":current";
  var surveyUserId = "";
  var events = [];
  var pageLoadTs = Date.now();
  var persistTimer = null;
  var mouseInterval = null;
  var modalBindings = null;
  var hoverEl = null;
  var hoverStart = 0;
  var listingMaxScrollDepth = 0;
  var liveBc = null;
  var liveMirrorTimer = null;
  var streamUrl = "";
  var streamQueue = [];
  var streamTimer = null;
  var streamSeq = 0;
  var streamFlushInFlight = false;
  var streamFlushPromise = null;
  var streamDeliveryError = "";
  var streamRetryCount = 0;
  var eventSeq = 0;
  var REVIEW_READ_MIN_MS = 750;

  function now() {
    return Date.now();
  }

  function getMeta(name) {
    var m = document.querySelector('meta[name="' + name + '"]');
    return m && m.getAttribute("content") ? String(m.getAttribute("content")).trim() : "";
  }

  function pagePhase() {
    try {
      var p = new URLSearchParams(location.search);
      var explicitPhase = p.get("phase");
      var stage = (p.get("survey_stage") || "").toLowerCase();
      var bodyVersion = (document.body && document.body.dataset.reviewVersion || "").toLowerCase();
      var path = (location.pathname || "").toLowerCase();
      if (explicitPhase === "3" || stage === "search_3" || stage === "post_review_ai" || bodyVersion === "with-ai-summary" || path.indexOf("search-ai-summaries") >= 0 || path.indexOf("hotel_3") >= 0) return "3";
      if (explicitPhase === "2" || stage === "search_2" || stage === "post_review" || bodyVersion === "with" || path.indexOf("search-reviews") >= 0 || path.indexOf("hotel_2") >= 0) return "2";
      return "1";
    } catch (e) {
      return "1";
    }
  }

  function currentSurveyStage() {
    try {
      return new URLSearchParams(location.search).get("survey_stage") || "";
    } catch (e) {
      return "";
    }
  }

  function pageCondition() {
    try {
      var p = new URLSearchParams(location.search);
      var condition = (p.get("cond") || "none").toLowerCase();
      if (condition === "vanilla" || condition === "newsworthy") return condition;
      return studyRunCondition();
    } catch (e) {
      return "full_reviews";
    }
  }

  function auxiliaryPopupStage() {
    var version = document.body && document.body.dataset.reviewVersion;
    if (version === "without") return "browsing_1";
    if (version === "with" || version === "with-ai-summary") return "browsing_2";
    var stage = currentSurveyStage();
    var hash = location.hash || "";
    if (/^#pr\d+$/.test(hash) || stage === "post_review" || stage === "post_review_ai") return "questionnaire_2";
    if (/^#hq\d+$/.test(hash) || stage === "hotel_questionnaire") return "questionnaire_1";
    if (stage === "search_1") return "browsing_1";
    if (stage === "search_2" || stage === "search_3") return "browsing_2";
    return "";
  }

  function studyRunCondition() {
    try {
      var p = new URLSearchParams(location.search);
      var explicit = (p.get("study_condition") || "").toLowerCase();
      var stage = (p.get("survey_stage") || "").toLowerCase();
      var bodyVersion = (document.body && document.body.dataset.reviewVersion || "").toLowerCase();
      var path = (location.pathname || "").toLowerCase();
      if (
        explicit === "ai_summary" ||
        p.get("study_version") === "3" ||
        stage === "search_3" ||
        stage === "post_review_ai" ||
        bodyVersion === "with-ai-summary" ||
        path.indexOf("search-ai-summaries") >= 0
      ) return "ai_summary";
      return "full_reviews";
    } catch (e) {
      return "full_reviews";
    }
  }

  function studyRunVersion() {
    return studyRunCondition() === "ai_summary" ? "3" : "2";
  }

  function getStreamUrl() {
    return "./api/survey";
  }

  function createEventId() {
    eventSeq += 1;
    try {
      if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return "behavior_" + window.crypto.randomUUID();
      }
    } catch (e) {
      /* fall through */
    }
    // Keep the fallback compatible with the API's UUID-backed visit IDs.
    var bytes = new Uint8Array(16);
    try {
      if (window.crypto && typeof window.crypto.getRandomValues === "function") {
        window.crypto.getRandomValues(bytes);
      } else {
        for (var i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
      }
    } catch (e2) {
      for (var j = 0; j < bytes.length; j++) bytes[j] = Math.floor(Math.random() * 256);
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    var hex = Array.prototype.map.call(bytes, function (value) {
      return value.toString(16).padStart(2, "0");
    }).join("");
    return "behavior_" + hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" +
      hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
  }

  function createSurveyUserId() {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return "survey_user_" + window.crypto.randomUUID();
      }
    } catch (e) {
      /* fall through */
    }
    return "survey_user_" + Date.now() + "_" + Math.random().toString(36).slice(2, 14);
  }

  function participantIdentity() {
    try {
      var p = new URLSearchParams(location.search);
      return p.get("STUDENT_ID") || p.get("student_id") || p.get("PROLIFIC_PID") || p.get("prolific_pid") || p.get("participant_id") ||
        p.get("SESSION_ID") || p.get("session_id") || "";
    } catch (e) {
      return "";
    }
  }

  function getOrCreateSurveyUserId() {
    var identity = participantIdentity();
    var key = SURVEY_USER_ID_STORAGE_PREFIX + ":" + encodeURIComponent(identity || "anonymous");
    var id = "";
    try { id = sessionStorage.getItem(key) || ""; }
    catch (e) { /* continue */ }
    if (!id && identity) {
      try { id = localStorage.getItem(key) || ""; }
      catch (e2) { /* continue */ }
    }
    if (!id && !identity) {
      try { id = sessionStorage.getItem(SURVEY_USER_ID_CURRENT_KEY) || ""; }
      catch (e3) { /* continue */ }
    }
    if (!id) id = createSurveyUserId();
    try {
      sessionStorage.setItem(key, id);
      sessionStorage.setItem(SURVEY_USER_ID_CURRENT_KEY, id);
    } catch (e4) {
      /* storage can be unavailable in strict privacy modes */
    }
    if (identity) {
      try { localStorage.setItem(key, id); }
      catch (e5) { /* sessionStorage remains as a fallback */ }
    }
    return id;
  }

  function streamOutboxStorageKey() {
    var prolific = prolificMeta();
    var participant = prolific.survey_user_id || prolific.student_id || prolific.prolific_pid || prolific.session_id || "anonymous";
    var submission = prolific.submission_id || "pending";
    return STREAM_OUTBOX_STORAGE_PREFIX + ":" + encodeURIComponent(participant) + ":" +
      studyRunCondition() + ":" + encodeURIComponent(submission);
  }

  function loadStreamOutbox() {
    var key = streamOutboxStorageKey();
    var stored = null;
    try { stored = localStorage.getItem(key); }
    catch (e) { /* sessionStorage remains available in some privacy modes */ }
    if (stored === null) {
      try { stored = sessionStorage.getItem(key); }
      catch (e2) { /* fall back to the in-memory queue */ }
    }
    if (!stored) return streamQueue.slice();
    try {
      var parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e3) {
      return streamQueue.slice();
    }
  }

  function persistStreamOutbox(addedEntries, acknowledgedIds) {
    // Another page may have queued events while this page was waiting for a receipt.
    var acknowledged = new Set(acknowledgedIds || []);
    var seen = new Set();
    streamQueue = loadStreamOutbox().concat(addedEntries || []).filter(function (entry) {
      if (acknowledged.has(entry.event_id) || seen.has(entry.event_id)) return false;
      seen.add(entry.event_id);
      return true;
    });
    var serialized = JSON.stringify(streamQueue);
    var key = streamOutboxStorageKey();
    try {
      localStorage.setItem(key, serialized);
    } catch (e) {
      /* sessionStorage remains as a fallback */
    }
    try {
      sessionStorage.setItem(key, serialized);
    } catch (e2) {
      /* storage can be unavailable in strict privacy modes */
    }
  }

  function removeStreamBatch(batch) {
    persistStreamOutbox([], batch.map(function (entry) { return entry.event_id; }));
  }

  function initLiveRelay() {
    try {
      liveBc = new BroadcastChannel(LIVE_CHANNEL);
    } catch (e) {
      liveBc = null;
    }
    if (liveBc) {
      liveBc.onmessage = function (ev) {
        var d = ev && ev.data;
        if (d && d.t === "request_full" && liveBc) {
          try {
            liveBc.postMessage({ t: "full", payload: buildPayload() });
          } catch (e2) {
            /* ignore */
          }
        }
      };
    }
  }

  function relayLiveEvent(entry) {
    if (liveBc) {
      try {
        liveBc.postMessage({ t: "event", event: entry });
      } catch (e) {
        /* ignore */
      }
    }
    scheduleLiveMirror();
  }

  function scheduleLiveMirror() {
    if (liveMirrorTimer) return;
    liveMirrorTimer = setTimeout(function () {
      liveMirrorTimer = null;
      try {
        localStorage.setItem(LIVE_STORAGE_KEY, JSON.stringify(buildPayload()));
      } catch (e) {
        /* ignore */
      }
    }, 500);
  }

  function relayLiveState(state) {
    var payloadState = Object.assign({ at_ms: now() }, state);
    if (liveBc) {
      try {
        liveBc.postMessage({ t: "live_state", state: payloadState });
      } catch (e) {
        /* ignore */
      }
    }
    scheduleLiveMirror();
  }

  function enqueueStream(entry) {
    if (!streamUrl) return;
    // Only these events are sent to the survey database. Other UI telemetry remains local.
    if (["popup_open", "popup_inventory"].indexOf(entry.event_type) < 0 &&
        !(entry.event_type === "page_timing" && entry.value.context === "hotel_modal")) return;
    var pageUrl = new URL(location.href);
    var path = location.pathname.toLowerCase().replace(/\.html$/, "");
    var browsingStage = /\/search-no-reviews$/.test(path) ? "search_1"
      : /\/search-ai-summaries$/.test(path) ? "search_3"
        : /\/search-reviews$/.test(path) ? "search_2" : "";
    if (browsingStage) pageUrl.searchParams.set("survey_stage", browsingStage);
    entry.delivery_context = {
      page_url: pageUrl.href, page_path: location.pathname,
      phase: pagePhase(), cond: pageCondition(), prolific: prolificMeta()
    };
    if (!streamQueue.some(function (queued) { return queued.event_id === entry.event_id; })) {
      persistStreamOutbox([entry]);
    }
    scheduleStreamFlush();
  }

  function scheduleStreamFlush() {
    if (!streamUrl) return;
    if (streamTimer) return;
    var delay = streamRetryCount ? Math.min(30000, 2000 * Math.pow(2, streamRetryCount)) + Math.floor(Math.random() * 1000) : 2000;
    streamTimer = setTimeout(function () {
      streamTimer = null;
      flushStream("timer");
    }, delay);
  }

  function flushStream(reason, preferBeacon) {
    if (!streamUrl) return;
    if (streamFlushInFlight) return streamFlushPromise;
    persistStreamOutbox();
    if (!streamQueue.length) return;
    streamFlushInFlight = true;

    var context = streamQueue[0].delivery_context || {
      page_url: location.href, page_path: location.pathname,
      phase: pagePhase(), cond: pageCondition(), prolific: prolificMeta()
    };
    var contextKey = JSON.stringify(context);
    var batch = streamQueue.filter(function (entry) {
      return JSON.stringify(entry.delivery_context || context) === contextKey;
    }).slice(0, 400);
    var body = {
      v: 1,
      kind: "event_batch",
      reason: reason || "unknown",
      sent_at_ms: now(),
      seq_start: streamSeq,
      seq_end: streamSeq + batch.length - 1,
      page_url: context.page_url,
      page_path: context.page_path,
      phase: context.phase,
      cond: context.cond,
      prolific: context.prolific,
      events: batch
    };
    var serialized = JSON.stringify(body);
    // Keep batches small enough to survive navigation with fetch keepalive.
    while (batch.length > 1 && new Blob([serialized]).size >= 48000) {
      batch = batch.slice(0, Math.ceil(batch.length / 2));
      body.events = batch;
      body.seq_end = streamSeq + batch.length - 1;
      serialized = JSON.stringify(body);
    }
    streamSeq += batch.length;
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timeout;
    var timedOut = new Promise(function (_, reject) {
      timeout = setTimeout(function () {
        reject(new Error("Tracking upload timed out. It will be retried."));
        if (controller) controller.abort();
      }, 20000);
    });
    // Navigation may interrupt the response; unacknowledged events stay queued for the next page.
    var request = Promise.resolve().then(function () {
      return fetch(streamUrl, {
        method: "POST",
        mode: "cors",
        keepalive: new Blob([serialized]).size < 48000,
        signal: controller ? controller.signal : undefined,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: serialized
      });
    }).then(function (response) {
      if (!response.ok) throw new Error("Storage HTTP " + response.status);
      return response.json();
    });
    streamFlushPromise = Promise.race([request, timedOut]).then(function (receipt) {
      if (receipt.ok !== true) throw new Error(receipt.error || "Storage was not confirmed.");
      // Older receivers return ok only; newer receivers confirm individual event IDs.
      var confirmed = Array.isArray(receipt.tracking_event_ids) ? new Set(receipt.tracking_event_ids) : null;
      var acknowledged = confirmed ? batch.filter(function (entry) { return confirmed.has(entry.event_id); }) : batch;
      removeStreamBatch(acknowledged);
      if (acknowledged.length !== batch.length) throw new Error("The receiver did not confirm every tracking event.");
      streamDeliveryError = "";
      streamRetryCount = 0;
    }).catch(function (error) {
      streamDeliveryError = String(error.message || error);
      streamRetryCount += 1;
    }).finally(function () {
      clearTimeout(timeout);
      streamFlushInFlight = false;
      streamFlushPromise = null;
      if (streamQueue.length) scheduleStreamFlush();
      window.dispatchEvent(new Event("hotel-storage-status"));
    });
    return streamFlushPromise;
  }

  function log(event_type, element_id, value) {
    var eventValue = value && typeof value === "object" && !Array.isArray(value)
      ? Object.assign({}, value, { survey_user_id: surveyUserId || getOrCreateSurveyUserId() })
      : { event_value: value === undefined ? null : value, survey_user_id: surveyUserId || getOrCreateSurveyUserId() };
    if (event_type === "popup_open" && ["shopper_profile", "hotel_order", "revealed_attributes"].indexOf(eventValue.popup_type || element_id) >= 0) {
      // Capture at opening time; a queued event may be delivered on a later page.
      eventValue.usage_stage = auxiliaryPopupStage();
    }
    var entry = {
      event_id: createEventId(),
      event_type: event_type,
      element_id: element_id != null ? String(element_id) : "",
      timestamp: now(),
      value: eventValue
    };
    events.push(entry);
    schedulePersist();
    relayLiveEvent(entry);
    enqueueStream(entry);
  }

  function getQueryBeacon() {
    try {
      var p = new URLSearchParams(location.search);
      return p.get("beacon") || p.get("tracking_beacon") || "";
    } catch (e) {
      return "";
    }
  }

  function getMetaBeacon() {
    var m = getMeta("tracking-beacon-url");
    return m || "";
  }

  function getProlificCompletionUrl() {
    var m = getMeta("prolific-completion-url");
    if (m) return m;
    try {
      var p = new URLSearchParams(location.search);
      return p.get("prolific_complete") || p.get("completion_url") || "";
    } catch (e) {
      return "";
    }
  }

  function shouldRedirectCompletion() {
    var m = getMeta("study-redirect-completion");
    return m && String(m).toLowerCase() === "true";
  }

  function b64Truncate(obj, maxLen) {
    try {
      var s = btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
      if (s.length > maxLen) s = s.slice(0, maxLen);
      return s;
    } catch (e) {
      return "";
    }
  }

  function passPayloadToCompletionUrl() {
    var base = getProlificCompletionUrl();
    if (!base) return;
    var summary = {
      prolific: prolificMeta(),
      event_count: events.length,
      ended_at_ms: now(),
      last_payload_version: buildPayload().v
    };
    var url;
    try {
      url = new URL(base, location.href);
    } catch (e2) {
      return;
    }
    url.searchParams.set("study_summary_b64", b64Truncate(summary, 1500));
    url.searchParams.set("study_storage_key", STORAGE_KEY);
    if (shouldRedirectCompletion()) {
      try {
        location.replace(url.toString());
      } catch (e3) {
        location.href = url.toString();
      }
    }
  }

  function prolificMeta() {
    var p = new URLSearchParams(location.search);
    var studentId = p.get("STUDENT_ID") || p.get("student_id") || null;
    return {
      survey_user_id: surveyUserId || getOrCreateSurveyUserId(),
      student_id: studentId,
      prolific_pid: p.get("PROLIFIC_PID") || p.get("prolific_pid") || studentId,
      study_id: p.get("STUDY_ID") || p.get("study_id") || null,
      session_id: p.get("SESSION_ID") || p.get("session_id") || null,
      submission_id: p.get("submission_id") || null,
      study_condition: studyRunCondition(),
      study_version: studyRunVersion()
    };
  }

  function buildPayload() {
    return {
      v: 1,
      page_url: location.href,
      page_path: location.pathname,
      phase: pagePhase(),
      cond: pageCondition(),
      started_at_ms: pageLoadTs,
      ended_at_ms: now(),
      prolific: prolificMeta(),
      events: events
    };
  }

  function persistSync() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(buildPayload()));
    } catch (e) {
      /* quota or private mode */
    }
  }

  function schedulePersist() {
    if (persistTimer) return;
    persistTimer = setTimeout(function () {
      persistTimer = null;
      persistSync();
    }, 400);
  }

  function flushBeacon() {
    var url = getMetaBeacon() || getQueryBeacon();
    if (!url || !navigator.sendBeacon) return;
    try {
      var body = JSON.stringify(buildPayload());
      var blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } catch (e) {
      /* ignore */
    }
  }

  function activeHotelId() {
    var mr = document.getElementById("modalRoot");
    if (mr && mr.getAttribute("data-active-hotel")) return mr.getAttribute("data-active-hotel");
    var h = location.hash || "";
    if (h.startsWith("#hotel/")) return h.split("/")[1] || "modal";
    return "modal";
  }

  function elementIdFromTarget(el) {
    if (!el || el.nodeType !== 1) return "unknown";
    if (el.closest && el.closest(".modal-root")) {
      var hid = activeHotelId();
      if (el.getAttribute("data-amenity")) return hid + ":amenity:" + el.getAttribute("data-amenity");
      if (el.getAttribute("data-map") === "1" || (el.closest && el.closest("[data-map='1']"))) return hid + ":map";
      if (el.getAttribute("data-photo")) return hid + ":gallery:" + el.getAttribute("data-photo");
      if (el.getAttribute("data-open")) return "results:open:" + el.getAttribute("data-open");
      if (el.getAttribute("data-book")) return hid + ":book";
      if (el.getAttribute("data-fave")) return hid + ":save";
      if (el.getAttribute("data-close") === "1") return hid + ":close";
      if (el.getAttribute("data-chip")) return hid + ":review_chip:" + el.getAttribute("data-chip");
      if (el.tagName === "SUMMARY" && el.closest && el.closest("[data-track-section='room_types']"))
        return hid + ":room_types_summary";
      if (el.closest && el.closest("[data-track-section='room_types']")) return hid + ":room_types";
      if (el.id === "sortSelect") return "results:sort";
      return hid + ":" + (el.tagName || "el").toLowerCase();
    }
    if (el.getAttribute("data-open")) return "results:open:" + el.getAttribute("data-open");
    var card = el.closest && el.closest("[data-hotel-id]");
    var cid = card ? card.getAttribute("data-hotel-id") : "results";
    var amenityNode = el.closest && el.closest("[data-amenity]");
    if (amenityNode) return cid + ":amenity:" + (amenityNode.getAttribute("data-amenity") || "");
    if (el.id) return cid + ":" + el.id;
    return cid + ":" + (el.tagName || "el").toLowerCase();
  }

  function onDocumentClick(ev) {
    var t = ev.target;
    var interactive = t && t.closest && t.closest(
      "button,a,[data-open],[data-close],[data-amenity],[data-map],[data-book],[data-fave],[data-photo],summary,.gimg,.chip,input,select,textarea"
    );
    if (!interactive) return;
    var id = elementIdFromTarget(interactive);
    var value = {
      tag: interactive.tagName,
      role: interactive.getAttribute && interactive.getAttribute("role"),
      phase_hash: location.hash || ""
    };
    log("click", id, value);
  }

  function pickHoverTarget(t) {
    if (!t || !t.closest) return null;
    return (
      t.closest(".amenity") ||
      t.closest("[data-amenity]") ||
      t.closest("[data-map='1']") ||
      t.closest(".gimg") ||
      null
    );
  }

  function hoverKey(el) {
    return elementIdFromTarget(el);
  }

  function finishHover() {
    if (!hoverEl) return;
    var dur = now() - hoverStart;
    if (dur >= 30) log("hover_duration", hoverKey(hoverEl), { duration_ms: dur });
    hoverEl = null;
  }

  function teardownModalBindings() {
    if (!modalBindings) return;
    var b = modalBindings;
    if (b.liveStateIv) clearInterval(b.liveStateIv);
    if (b.scrollEl && b.scrollHandler) b.scrollEl.removeEventListener("scroll", b.scrollHandler);
    if (b.io) b.io.disconnect();
    if (b.reviewIo) b.reviewIo.disconnect();
    if (b.onVisibilityChange) document.removeEventListener("visibilitychange", b.onVisibilityChange);
    if (b.detailsEl && b.onDetailsToggle) b.detailsEl.removeEventListener("toggle", b.onDetailsToggle);
    modalBindings = null;
  }

  function setupModalBindings(root) {
    teardownModalBindings();
    if (!root || !root.classList.contains("is-open")) return;

    var scrollEl = root.querySelector("#hotelModalScroll");
    if (!scrollEl) return;

    var hotelId =
      (root.getAttribute && root.getAttribute("data-active-hotel")) ||
      (function () {
        var h = location.hash || "";
        if (!h.startsWith("#hotel/")) return "unknown";
        return h.split("/")[1] || "unknown";
      })();
    var sessionStart = now();
    var activeSince = document.hidden ? null : sessionStart;
    var activeMs = 0;
    var lastY = scrollEl.scrollTop;
    var lastT = 0;
    var lastDir = 0;
    var dirChanges = 0;
    var maxDepth = 0;
    var maxSpeed = 0;
    var speedSamples = 0;
    var speedSum = 0;

    var sectionVisibleSince = {};
    var sectionAccumMs = {};
    var reviewVisibleSince = {};
    var reviewAccumMs = {};
    var reviewSeenOrder = [];
    var reviewReadOrder = [];
    var reviewSeen = {};
    var reviewRead = {};
    var sectionsInViewport = {};
    var reviewsInViewport = {};

    function reviewPosition(node) {
      return Number(node.getAttribute("data-review-position") || Number(node.getAttribute("data-review-index") || 0) + 1);
    }

    function reviewId(node) {
      return node.getAttribute("data-review-id") || "review_position_" + reviewPosition(node);
    }

    function reviewKey(node) {
      return String(reviewPosition(node));
    }

    function markReviewSeen(node) {
      var key = reviewKey(node);
      if (reviewSeen[key]) return;
      reviewSeen[key] = true;
      reviewSeenOrder.push(reviewPosition(node));
    }

    function markReviewRead(node) {
      var key = reviewKey(node);
      if (reviewRead[key] || numericValue(reviewAccumMs[key]) < REVIEW_READ_MIN_MS) return;
      reviewRead[key] = true;
      reviewReadOrder.push(reviewPosition(node));
    }

    function numericValue(value) {
      var number = Number(value);
      return Number.isFinite(number) ? number : 0;
    }

    function finishReviewVisibility(node, ts) {
      var key = reviewKey(node);
      if (reviewVisibleSince[key]) {
        reviewAccumMs[key] = numericValue(reviewAccumMs[key]) + (ts - reviewVisibleSince[key]);
        delete reviewVisibleSince[key];
      }
      markReviewRead(node);
    }

    function denom() {
      return Math.max(1, scrollEl.scrollHeight - scrollEl.clientHeight);
    }

    function onScroll() {
      var t = now();
      var y = scrollEl.scrollTop;
      if (lastT === 0) {
        lastY = y;
        lastT = t;
        maxDepth = Math.min(1, Math.max(0, y / denom()));
        return;
      }
      var dy = y - lastY;
      var dt = Math.max(1, t - lastT);
      if (Math.abs(dy) > 0.5) {
        var inst = Math.abs(dy) / dt;
        if (inst > maxSpeed) maxSpeed = inst;
        speedSum += inst;
        speedSamples++;
      }
      var dir = dy === 0 ? lastDir : (dy > 0 ? 1 : -1);
      if (lastDir !== 0 && dir !== 0 && dir !== lastDir) dirChanges++;
      if (dir !== 0) lastDir = dir;
      lastY = y;
      lastT = t;
      var d = Math.min(1, Math.max(0, y / denom()));
      if (d > maxDepth) maxDepth = d;
    }

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var sections = root.querySelectorAll("[data-track-section]");
    var io = new IntersectionObserver(
      function (entries) {
        var ts = now();
        entries.forEach(function (en) {
          var sid = en.target.getAttribute("data-track-section") || "section";
          var key = hotelId + ":" + sid;
          var vis = en.isIntersecting && (sid === "reviews" ? en.intersectionRect.height > 0 : en.intersectionRatio > 0.08);
          sectionsInViewport[key] = vis;
          if (vis && !document.hidden) {
            if (!sectionVisibleSince[key]) sectionVisibleSince[key] = ts;
          } else {
            if (sectionVisibleSince[key]) {
              sectionAccumMs[key] = (sectionAccumMs[key] || 0) + (ts - sectionVisibleSince[key]);
              delete sectionVisibleSince[key];
            }
          }
        });
      },
      { root: scrollEl, threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach(function (s) {
      io.observe(s);
    });

    var reviewNodes = root.querySelectorAll("[data-review-index]");
    var reviewNodeByPosition = {};
    reviewNodes.forEach(function (node) {
      reviewNodeByPosition[reviewKey(node)] = node;
    });
    var reviewIo = null;
    if (reviewNodes.length) {
      reviewIo = new IntersectionObserver(
        function (entries) {
          var ts = now();
          entries.forEach(function (entry) {
            var node = entry.target;
            var key = reviewKey(node);
            var visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
            reviewsInViewport[key] = visible;
            if (visible && !document.hidden) {
              markReviewSeen(node);
              if (!reviewVisibleSince[key]) reviewVisibleSince[key] = ts;
            } else {
              finishReviewVisibility(node, ts);
            }
          });
        },
        { root: scrollEl, threshold: [0, 0.5, 1] }
      );
      reviewNodes.forEach(function (node) {
        reviewIo.observe(node);
      });
    }

    function activeDuration(ts) {
      return activeMs + (activeSince === null ? 0 : ts - activeSince);
    }

    function onModalVisibilityChange() {
      var ts = now();
      if (document.hidden) {
        if (activeSince !== null) activeMs += ts - activeSince;
        activeSince = null;
        Object.keys(sectionVisibleSince).forEach(function (key) {
          sectionAccumMs[key] = (sectionAccumMs[key] || 0) + (ts - sectionVisibleSince[key]);
        });
        sectionVisibleSince = {};
        Object.keys(reviewVisibleSince).forEach(function (key) {
          finishReviewVisibility(reviewNodeByPosition[key], ts);
        });
      } else {
        if (activeSince === null) activeSince = ts;
        Object.keys(sectionsInViewport).forEach(function (key) {
          if (sectionsInViewport[key] && !sectionVisibleSince[key]) sectionVisibleSince[key] = ts;
        });
        Object.keys(reviewsInViewport).forEach(function (key) {
          if (!reviewsInViewport[key]) return;
          markReviewSeen(reviewNodeByPosition[key]);
          if (!reviewVisibleSince[key]) reviewVisibleSince[key] = ts;
        });
      }
    }
    document.addEventListener("visibilitychange", onModalVisibilityChange);

    var detailsEl = root.querySelector("[data-track-section='room_types']");
    var onDetailsToggle = null;
    if (detailsEl) {
      onDetailsToggle = function () {
        log("room_types_toggle", hotelId, { open: !!detailsEl.open });
      };
      detailsEl.addEventListener("toggle", onDetailsToggle);
    }

    var finalized = false;
    function buildLiveSnapshot() {
      var ts = now();
      var sections = {};
      Object.keys(sectionAccumMs).forEach(function (k) {
        var part = k.split(":");
        var name = part.slice(1).join(":") || k;
        sections[name] = sectionAccumMs[k];
      });
      Object.keys(sectionVisibleSince).forEach(function (k) {
        var part = k.split(":");
        var name = part.slice(1).join(":") || k;
        var extra = ts - sectionVisibleSince[k];
        sections[name] = (sections[name] || 0) + extra;
      });
      var meanSpeed = speedSamples ? speedSum / speedSamples : 0;
      return {
        hotel_id: hotelId,
        modal_elapsed_ms: activeDuration(ts),
        scroll_depth_pct_now: Math.round(Math.min(1, Math.max(0, scrollEl.scrollTop / denom())) * 1000) / 10,
        scroll_max_pct: Math.round(maxDepth * 1000) / 10,
        scroll_dir_changes: dirChanges,
        scroll_max_px_per_ms: Math.round(maxSpeed * 1000000) / 1000000,
        scroll_mean_px_per_ms: Math.round(meanSpeed * 1000000) / 1000000,
        sections_ms: sections
      };
    }

    var liveStateIv = setInterval(function () {
      if (finalized) return;
      relayLiveState(buildLiveSnapshot());
    }, 400);

    modalBindings = {
      scrollEl: scrollEl,
      scrollHandler: onScroll,
      io: io,
      reviewIo: reviewIo,
      onVisibilityChange: onModalVisibilityChange,
      hotelId: hotelId,
      sessionStart: sessionStart,
      detailsEl: detailsEl,
      onDetailsToggle: onDetailsToggle,
      liveStateIv: liveStateIv,
      finalize: function (reason) {
        if (finalized) return;
        finalized = true;
        var ts = now();
        Object.keys(sectionVisibleSince).forEach(function (key) {
          sectionAccumMs[key] = (sectionAccumMs[key] || 0) + (ts - sectionVisibleSince[key]);
        });
        sectionVisibleSince = {};

        Object.keys(reviewVisibleSince).forEach(function (key) {
          var node = reviewNodeByPosition[key];
          if (node) finishReviewVisibility(node, ts);
        });
        reviewVisibleSince = {};

        var visBySection = {};
        Object.keys(sectionAccumMs).forEach(function (k) {
          var part = k.split(":");
          var name = part.slice(1).join(":") || k;
          visBySection[name] = Math.round(sectionAccumMs[k]);
        });

        var duration = activeDuration(ts);
        var meanSpeed = speedSamples ? speedSum / speedSamples : 0;
        var maxPct = Math.round(maxDepth * 1000) / 10;
        var depthAtExitPct = Math.round(Math.min(1, Math.max(0, scrollEl.scrollTop / denom())) * 1000) / 10;
        var maxSp = Math.round(maxSpeed * 1000000) / 1000000;
        var meanSp = Math.round(meanSpeed * 1000000) / 1000000;
        var maxReviewPositionSeen = reviewSeenOrder.length ? Math.max.apply(null, reviewSeenOrder) : 0;
        var lastReviewPositionSeen = reviewSeenOrder.length ? reviewSeenOrder[reviewSeenOrder.length - 1] : 0;
        var hotelOrderIds = Array.prototype.map.call(
          document.querySelectorAll("#results [data-hotel-id]"),
          function (card) { return card.getAttribute("data-hotel-id") || ""; }
        ).filter(Boolean);
        var hotelDisplayPosition = hotelOrderIds.indexOf(hotelId) + 1;
        var reviewVisibility = Object.keys(reviewAccumMs).map(function (key) {
          var node = reviewNodeByPosition[key];
          return {
            position: Number(key),
            review_id: node ? reviewId(node) : "",
            visible_ms: Math.round(numericValue(reviewAccumMs[key]))
          };
        }).sort(function (a, b) { return a.position - b.position; });
        var readingPattern = "none";
        if (reviewReadOrder.length) {
          var monotonic = true;
          var contiguousFromStart = reviewReadOrder[0] === 1;
          for (var r = 1; r < reviewReadOrder.length; r++) {
            if (reviewReadOrder[r] <= reviewReadOrder[r - 1]) monotonic = false;
            if (reviewReadOrder[r] !== reviewReadOrder[r - 1] + 1) contiguousFromStart = false;
          }
          readingPattern = contiguousFromStart ? "sequential" : (monotonic ? "skipping" : "nonsequential");
        }
        var readIds = reviewReadOrder.map(function (position) {
          var node = reviewNodeByPosition[String(position)];
          return node ? reviewId(node) : "";
        }).filter(Boolean);

        log("page_timing", hotelId, {
          context: "hotel_modal",
          opened_at_ms: sessionStart,
          duration_ms: duration,
          exit_reason: reason || "unknown",
          scroll_depth_pct_at_exit: depthAtExitPct,
          scroll_max_pct: maxPct,
          scroll_dir_changes: dirChanges,
          scroll_max_px_per_ms: maxSp,
          scroll_mean_px_per_ms: meanSp,
          summary_viewing_ms: Math.round(numericValue(visBySection.ai_review_summary)),
          individual_reviews_viewing_ms: Math.round(numericValue(visBySection.reviews)),
          review_seen_count: reviewSeenOrder.length,
          review_read_count: reviewReadOrder.length,
          review_seen_order: reviewSeenOrder.slice(),
          review_read_order: reviewReadOrder.slice(),
          review_read_ids: readIds,
          review_stopping_position: lastReviewPositionSeen,
          review_furthest_position_seen: maxReviewPositionSeen,
          review_reading_pattern: readingPattern,
          review_visibility: reviewVisibility,
          hotel_display_position: hotelDisplayPosition > 0 ? hotelDisplayPosition : null
        });
        log("scroll_depth_max", hotelId, { max_pct: maxPct });
        log("scroll_speed", hotelId, {
          max_px_per_ms: maxSp,
          mean_px_per_ms: meanSp
        });
        log("scroll_direction_changes", hotelId, { count: dirChanges });
        log("section_visibility", hotelId, { sections_ms: visBySection });
      }
    };

    log("hotel_modal_open", hotelId, { hash: location.hash || "" });
    log("popup_open", "hotel:" + hotelId, {
      popup_type: "hotel",
      hotel_id: hotelId,
      page_context: "hotel_browsing",
      survey_stage: currentSurveyStage(),
      page_hash: location.hash || ""
    });
  }

  var lastModalOpen = false;

  function hotelIdFromUi(root) {
    if (root && root.getAttribute) {
      var a = root.getAttribute("data-active-hotel");
      if (a) return a;
    }
    var h = location.hash || "";
    if (h.startsWith("#hotel/")) return h.split("/")[1] || null;
    return null;
  }

  function syncModal() {
    var root = document.getElementById("modalRoot");
    if (!root) return;
    var open = root.classList.contains("is-open");
    var hid = hotelIdFromUi(root);

    if (open && hid) {
      if (modalBindings && modalBindings.hotelId !== hid) {
        modalBindings.finalize("hotel_switch");
        teardownModalBindings();
      }
      if (!modalBindings) setupModalBindings(root);
      lastModalOpen = true;
      return;
    }

    if (!open && lastModalOpen) {
      if (modalBindings && modalBindings.finalize) modalBindings.finalize("modal_closed");
      teardownModalBindings();
      lastModalOpen = false;
      return;
    }

    lastModalOpen = open;
  }

  var moTimer = null;
  function scheduleSyncModal() {
    if (moTimer) return;
    moTimer = setTimeout(function () {
      moTimer = null;
      syncModal();
    }, 0);
  }

  function startMouseSampler() {
    if (mouseInterval) return;
    mouseInterval = setInterval(function () {
      var mr = document.getElementById("modalRoot");
      var modalOpen = !!(mr && mr.classList.contains("is-open"));
      log("mouse_position", "viewport", {
        x: window.__lastMouseX != null ? window.__lastMouseX : null,
        y: window.__lastMouseY != null ? window.__lastMouseY : null,
        vw: document.documentElement.clientWidth,
        vh: document.documentElement.clientHeight,
        hotel_modal_open: modalOpen
      });
    }, 500);
  }

  function onMouseMove(ev) {
    window.__lastMouseX = ev.clientX;
    window.__lastMouseY = ev.clientY;
  }

  function onPageHide() {
    finishHover();
    if (modalBindings && modalBindings.finalize) modalBindings.finalize("page_exit");
    teardownModalBindings();
    log("page_timing", "results_page", {
      context: "listing_shell",
      duration_ms: now() - pageLoadTs,
      exit_reason: "pagehide",
      max_scroll_pct: Math.round(listingMaxScrollDepth * 1000) / 10
    });
    persistSync();
    if (liveBc) {
      try {
        liveBc.postMessage({ t: "full", payload: buildPayload() });
      } catch (e) {
        /* ignore */
      }
    }
    try {
      localStorage.setItem(LIVE_STORAGE_KEY, JSON.stringify(buildPayload()));
    } catch (e2) {
      /* ignore */
    }
    flushStream("pagehide", true);
    flushBeacon();
    passPayloadToCompletionUrl();
  }

  function onVisibility() {
    if (document.visibilityState === "hidden") {
      persistSync();
      flushStream("hidden", true);
      flushBeacon();
      passPayloadToCompletionUrl();
    }
  }

  function init() {
    surveyUserId = getOrCreateSurveyUserId();
    initLiveRelay();
    streamUrl = getStreamUrl();
    streamQueue = loadStreamOutbox();
    streamQueue.forEach(function (entry) {
      if (!entry.event_id) entry.event_id = createEventId();
    });
    persistStreamOutbox(streamQueue);
    if (streamQueue.length) scheduleStreamFlush();
    log("session_start", location.pathname, { href: location.href });

    window.addEventListener(
      "scroll",
      function () {
        var mr = document.getElementById("modalRoot");
        if (mr && mr.classList.contains("is-open")) return;
        var d = document.documentElement;
        var st = d.scrollTop || document.body.scrollTop || 0;
        var denom = Math.max(1, (d.scrollHeight || 1) - (d.clientHeight || 1));
        var depth = Math.min(1, Math.max(0, st / denom));
        if (depth > listingMaxScrollDepth) listingMaxScrollDepth = depth;
      },
      { passive: true }
    );

    document.addEventListener("click", onDocumentClick, true);
    document.addEventListener("mousemove", onMouseMove, { passive: true });

    document.addEventListener(
      "mouseover",
      function (e) {
        var el = pickHoverTarget(e.target);
        if (!el || el === hoverEl) return;
        if (hoverEl) finishHover();
        hoverEl = el;
        hoverStart = now();
      },
      true
    );
    document.addEventListener(
      "mouseout",
      function (e) {
        if (!hoverEl) return;
        var rel = e.relatedTarget;
        if (rel && hoverEl.contains(rel)) return;
        finishHover();
      },
      true
    );

    var modalRoot = document.getElementById("modalRoot");
    if (modalRoot) {
      var mo = new MutationObserver(scheduleSyncModal);
      mo.observe(modalRoot, { attributes: true, attributeFilter: ["class"], childList: true, subtree: false });
    }
    window.addEventListener("hashchange", scheduleSyncModal);
    scheduleSyncModal();

    startMouseSampler();
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("online", function () { flushStream("online"); });
    window.addEventListener("storage", function (event) {
      if (event.key !== streamOutboxStorageKey()) return;
      streamQueue = loadStreamOutbox();
      if (streamQueue.length) scheduleStreamFlush();
      window.dispatchEvent(new Event("hotel-storage-status"));
    });
    document.addEventListener("visibilitychange", onVisibility);

    window.HOTEL_EXPERIMENT_STORAGE_KEY = STORAGE_KEY;
    window.HOTEL_EXPERIMENT_GET_EVENTS = function () {
      return events.slice();
    };
    window.HOTEL_EXPERIMENT_FINALIZE_MODAL = function (reason) {
      if (modalBindings) modalBindings.finalize(reason || "modal_closed");
      teardownModalBindings();
      lastModalOpen = false;
    };
    window.HOTEL_EXPERIMENT_GET_PAYLOAD = function () {
      return buildPayload();
    };
    window.HOTEL_EXPERIMENT_TRACK = function (eventType, elementId, value) {
      log(eventType, elementId, value);
    };
    window.HOTEL_EXPERIMENT_FLUSH = function () {
      persistSync();
      flushBeacon();
      passPayloadToCompletionUrl();
      return flushStream("manual");
    };
    window.HOTEL_EXPERIMENT_STORAGE_STATUS = function () {
      return { pending: streamQueue.length, error: streamDeliveryError };
    };
    window.HOTEL_EXPERIMENT_LIVE_CHANNEL = LIVE_CHANNEL;
    window.HOTEL_EXPERIMENT_LIVE_STORAGE_KEY = LIVE_STORAGE_KEY;
    window.HOTEL_EXPERIMENT_STREAM_URL = streamUrl;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
