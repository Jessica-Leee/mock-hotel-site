/**
 * Invisible behavioral tracking for hotel listing experiment.
 *
 * Each event: { event_type, element_id, timestamp, value }
 * All events are stored in a JSON array (in memory + sessionStorage payload.events).
 *
 * Prolific / survey handoff:
 *   1) URL query: ?PROLIFIC_PID=…&STUDY_ID=…&SESSION_ID=… (Prolific defaults; echoed in payload.prolific).
 *   2) Optional beacon: <meta name="tracking-beacon-url" content="https://…"> or ?beacon=https://…
 *      → full JSON POSTed via navigator.sendBeacon on pagehide / visibility hidden.
 *   3) Optional completion URL: <meta name="prolific-completion-url" content="https://app.prolific.com/submissions/complete?cc=CODE">
 *      → appends &study_summary_b64=… (truncated) so a same-tab redirect survey can read it.
 *      → Set <meta name="study-redirect-completion" content="true"> to auto-navigate on pagehide (optional).
 *
 * Same-tab follow-up survey (e.g. Qualtrics on your domain): read sessionStorage[HOTEL_EXPERIMENT_STORAGE_KEY]
 * for the full event array after participants return from the hotel task page.
 *
 * Live researcher dashboard: open live-dashboard.html in another tab (same origin, e.g. http://localhost:8080).
 * Uses BroadcastChannel("hotel_experiment_live") + localStorage hotel_experiment_live_v1 (throttled).
 */
(function () {
  "use strict";

  var LIVE_CHANNEL = "hotel_experiment_live";
  var LIVE_STORAGE_KEY = "hotel_experiment_live_v1";
  var STORAGE_KEY = "hotel_experiment_tracking_v1";
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

  function now() {
    return Date.now();
  }

  function getMeta(name) {
    var m = document.querySelector('meta[name="' + name + '"]');
    return m && m.getAttribute("content") ? String(m.getAttribute("content")).trim() : "";
  }

  function getStreamUrl() {
    var m = getMeta("tracking-stream-url");
    if (m) return m;
    try {
      var p = new URLSearchParams(location.search);
      return p.get("stream") || "";
    } catch (e) {
      return "";
    }
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
    streamQueue.push(entry);
    scheduleStreamFlush();
  }

  function scheduleStreamFlush() {
    if (!streamUrl) return;
    if (streamTimer) return;
    streamTimer = setTimeout(function () {
      streamTimer = null;
      flushStream("timer");
    }, 2000);
  }

  function flushStream(reason) {
    if (!streamUrl) return;
    if (!streamQueue.length) return;
    if (streamFlushInFlight) return;
    streamFlushInFlight = true;

    var batch = streamQueue.splice(0, Math.min(streamQueue.length, 400));
    var body = {
      v: 1,
      kind: "event_batch",
      reason: reason || "unknown",
      sent_at_ms: now(),
      seq_start: streamSeq,
      seq_end: streamSeq + batch.length - 1,
      page_url: location.href,
      page_path: location.pathname,
      phase: (function () {
        try {
          var x = new URLSearchParams(location.search).get("phase");
          return x === "2" ? "2" : "1";
        } catch (e2) {
          return "1";
        }
      })(),
      cond: (function () {
        try {
          var c = (new URLSearchParams(location.search).get("cond") || "none").toLowerCase();
          return c === "vanilla" || c === "newsworthy" ? c : "none";
        } catch (e3) {
          return "none";
        }
      })(),
      prolific: prolificMeta(),
      events: batch
    };
    streamSeq += batch.length;

    // Apps Script + cross-origin is often simplest with no-cors.
    // We don't need to read the response; we just want the sheet to append.
    try {
      fetch(streamUrl, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(body)
      }).finally(function () {
        streamFlushInFlight = false;
        if (streamQueue.length) scheduleStreamFlush();
      });
      return;
    } catch (e) {
      /* fall through */
    }

    // Fallback: sendBeacon (best-effort)
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([JSON.stringify(body)], { type: "text/plain" });
        navigator.sendBeacon(streamUrl, blob);
      }
    } catch (e2) {
      /* ignore */
    } finally {
      streamFlushInFlight = false;
      if (streamQueue.length) scheduleStreamFlush();
    }
  }

  function log(event_type, element_id, value) {
    var entry = {
      event_type: event_type,
      element_id: element_id != null ? String(element_id) : "",
      timestamp: now(),
      value: value === undefined ? null : value
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
    return {
      prolific_pid: p.get("PROLIFIC_PID") || p.get("prolific_pid") || null,
      study_id: p.get("STUDY_ID") || p.get("study_id") || null,
      session_id: p.get("SESSION_ID") || p.get("session_id") || null
    };
  }

  function buildPayload() {
    return {
      v: 1,
      page_url: location.href,
      page_path: location.pathname,
      phase: (function () {
        try {
          var x = new URLSearchParams(location.search).get("phase");
          return x === "2" ? "2" : "1";
        } catch (e2) {
          return "1";
        }
      })(),
      cond: (function () {
        try {
          var c = (new URLSearchParams(location.search).get("cond") || "none").toLowerCase();
          return c === "vanilla" || c === "newsworthy" ? c : "none";
        } catch (e3) {
          return "none";
        }
      })(),
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
          var vis = en.isIntersecting && en.intersectionRatio > 0.08;
          if (vis) {
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
        modal_elapsed_ms: ts - sessionStart,
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

        var visBySection = {};
        Object.keys(sectionAccumMs).forEach(function (k) {
          var part = k.split(":");
          var name = part.slice(1).join(":") || k;
          visBySection[name] = Math.round(sectionAccumMs[k]);
        });

        var duration = ts - sessionStart;
        var meanSpeed = speedSamples ? speedSum / speedSamples : 0;
        var maxPct = Math.round(maxDepth * 1000) / 10;
        var depthAtExitPct = Math.round(Math.min(1, Math.max(0, scrollEl.scrollTop / denom())) * 1000) / 10;
        var maxSp = Math.round(maxSpeed * 1000000) / 1000000;
        var meanSp = Math.round(meanSpeed * 1000000) / 1000000;

        log("page_timing", hotelId, {
          context: "hotel_modal",
          duration_ms: duration,
          exit_reason: reason || "unknown",
          scroll_depth_pct_at_exit: depthAtExitPct,
          scroll_max_pct: maxPct,
          scroll_dir_changes: dirChanges,
          scroll_max_px_per_ms: maxSp,
          scroll_mean_px_per_ms: meanSp
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
    flushStream("pagehide");
    flushBeacon();
    passPayloadToCompletionUrl();
  }

  function onVisibility() {
    if (document.visibilityState === "hidden") {
      persistSync();
      flushStream("hidden");
      flushBeacon();
      passPayloadToCompletionUrl();
    }
  }

  function init() {
    initLiveRelay();
    streamUrl = getStreamUrl();
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
    document.addEventListener("visibilitychange", onVisibility);

    window.HOTEL_EXPERIMENT_STORAGE_KEY = STORAGE_KEY;
    window.HOTEL_EXPERIMENT_GET_EVENTS = function () {
      return events.slice();
    };
    window.HOTEL_EXPERIMENT_GET_PAYLOAD = function () {
      return buildPayload();
    };
    window.HOTEL_EXPERIMENT_FLUSH = function () {
      persistSync();
      flushBeacon();
      passPayloadToCompletionUrl();
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
