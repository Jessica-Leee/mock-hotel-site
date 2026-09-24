/**
 * Invisible behavioral tracking for hotel listing experiment.
 *
 * Each event: { event_id, event_type, element_id, timestamp, value }.
 * Events live only in memory. Relevant browsing events are sent directly to the
 * same-origin API; the server remains the only persistent state store.
 */
(function () {
  "use strict";

  var events = [];
  var pageLoadTs = Date.now();
  var mouseInterval = null;
  var modalBindings = null;
  var hoverEl = null;
  var hoverStart = 0;
  var listingMaxScrollDepth = 0;
  var streamUrl = "";
  var streamQueue = [];
  var streamTimer = null;
  var streamFlushInFlight = false;
  var streamFlushPromise = null;
  var streamDeliveryError = "";
  var streamRetryCount = 0;
  var eventSeq = 0;
  var REVIEW_READ_MIN_MS = 750;

  function now() {
    return Date.now();
  }

  function currentSurveyStage() {
    try {
      return new URLSearchParams(location.search).get("survey_stage") || "";
    } catch (e) {
      return "";
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

  function removeStreamBatch(batch) {
    var acknowledged = new Set(batch.map(function (entry) { return entry.event_id; }));
    streamQueue = streamQueue.filter(function (entry) { return !acknowledged.has(entry.event_id); });
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
      page_url: pageUrl.href, page_path: location.pathname
    };
    if (!streamQueue.some(function (queued) { return queued.event_id === entry.event_id; })) {
      streamQueue.push(entry);
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

  function flushStream(reason) {
    if (!streamUrl) return;
    if (streamFlushInFlight) return streamFlushPromise;
    if (!streamQueue.length) return;
    streamFlushInFlight = true;

    var context = streamQueue[0].delivery_context || {
      page_url: location.href, page_path: location.pathname
    };
    var contextKey = JSON.stringify(context);
    var batch = streamQueue.filter(function (entry) {
      return JSON.stringify(entry.delivery_context || context) === contextKey;
    }).slice(0, 400);
    var body = {
      kind: "event_batch",
      reason: reason || "unknown",
      page_url: context.page_url,
      page_path: context.page_path,
      participant_id: new URLSearchParams(location.search).get("participant_id") || "",
      events: batch
    };
    var serialized = JSON.stringify(body);
    // Keep batches small enough to survive navigation with fetch keepalive.
    while (batch.length > 1 && new Blob([serialized]).size >= 48000) {
      batch = batch.slice(0, Math.ceil(batch.length / 2));
      body.events = batch;
      serialized = JSON.stringify(body);
    }
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timeout;
    var timedOut = new Promise(function (_, reject) {
      timeout = setTimeout(function () {
        reject(new Error("Tracking upload timed out. It will be retried."));
        if (controller) controller.abort();
      }, 20000);
    });
    // Navigation may interrupt this best-effort request; no browser-persistent queue is used.
    var request = Promise.resolve().then(function () {
      return fetch(streamUrl, {
        method: "POST",
        cache: "no-store",
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
      var confirmed = new Set(Array.isArray(receipt.tracking_event_ids) ? receipt.tracking_event_ids : []);
      var acknowledged = batch.filter(function (entry) { return confirmed.has(entry.event_id); });
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
      ? Object.assign({}, value)
      : { event_value: value === undefined ? null : value };
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
    enqueueStream(entry);
  }

  function buildPayload() {
    return { events: events };
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
    flushStream("pagehide");
  }

  function init() {
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
    window.addEventListener("online", function () { flushStream("online"); });

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
      return flushStream("manual");
    };
    window.HOTEL_EXPERIMENT_DELIVERY_STATUS = function () {
      return { pending: streamQueue.length, error: streamDeliveryError };
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
