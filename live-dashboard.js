(function () {
  "use strict";

  var CHANNEL = "hotel_experiment_live";
  var LIVE_KEY = "hotel_experiment_live_v1";

  var bc = null;
  var events = [];
  var liveState = null;
  var latestPayload = null;
  var paused = false;
  var buffer = [];
  var renderPending = false;
  var lastLiveAt = 0;
  var tickTimer = null;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtMs(ms) {
    if (ms == null || isNaN(ms)) return "—";
    if (ms < 1000) return Math.round(ms) + " ms";
    return (ms / 1000).toFixed(1) + " s";
  }

  function shortJson(v, max) {
    max = max || 100;
    try {
      var s = JSON.stringify(v);
      if (s.length <= max) return s;
      return s.slice(0, max) + "…";
    } catch (e) {
      return "";
    }
  }

  function setStatus(live, text) {
    var dot = document.getElementById("statusDot");
    var label = document.getElementById("statusText");
    if (dot) dot.className = "status-dot" + (live ? " live" : "");
    if (label) label.textContent = text;
  }

  function updateLastTick() {
    var el = document.getElementById("lastTick");
    if (!el) return;
    if (!lastLiveAt) {
      el.textContent = "No live modal stream yet";
      return;
    }
    var age = Date.now() - lastLiveAt;
    var stale = age > 3500;
    el.innerHTML =
      "Live snapshot: <time>" +
      new Date(lastLiveAt).toLocaleTimeString() +
      "</time>" +
      (stale ? ' <span class="stale">(stale — modal closed or idle)</span>' : "");
  }

  function renderSessionMeta() {
    var el = document.getElementById("sessionMeta");
    if (!el || !latestPayload) {
      if (el && !latestPayload) el.innerHTML = "";
      return;
    }
    var p = latestPayload.prolific || {};
    var pid = p.prolific_pid ? String(p.prolific_pid).slice(0, 8) + "…" : "—";
    el.innerHTML =
      '<span class="badge badge--phase">Phase ' +
      esc(latestPayload.phase || "?") +
      "</span>" +
      '<span class="badge">Cond: ' +
      esc(latestPayload.cond || "—") +
      "</span>" +
      '<span class="badge" title="Prolific participant id (truncated)">PID: ' +
      esc(pid) +
      "</span>";
  }

  function scheduleRender() {
    if (paused) return;
    if (renderPending) return;
    renderPending = true;
    requestAnimationFrame(function () {
      renderPending = false;
      renderAll();
    });
  }

  function flushBuffer() {
    var i;
    for (i = 0; i < buffer.length; i++) {
      var b = buffer[i];
      if (b.t === "full") applyFullPayload(b.payload, true);
      else if (b.t === "e") mergeEvent(b.ev, true);
      else if (b.t === "l") {
        liveState = b.s;
        lastLiveAt = b.s.at_ms || Date.now();
      }
    }
    buffer = [];
    renderSessionMeta();
    scheduleRender();
  }

  function applyFullPayload(payload, silent) {
    if (!payload || !Array.isArray(payload.events)) return;
    events = payload.events.slice();
    latestPayload = payload;
    if (!silent) renderSessionMeta();
    if (!silent) scheduleRender();
  }

  function mergeEvent(ev, silent) {
    events.push(ev);
    if (events.length > 8000) events = events.slice(-8000);
    if (!silent) scheduleRender();
  }

  function renderAll() {
    renderLivePanel();
    renderResultsTiming();
    renderClicks();
    renderHovers();
    renderMouse();
    renderRawCount();
    updateLastTick();
  }

  function renderLivePanel() {
    var root = document.getElementById("livePanel");
    if (!root) return;
    if (!liveState) {
      root.innerHTML =
        "<p class=\"hint\">Open the task page in another tab on the <strong>same origin</strong>. When a hotel modal is open, live scroll and section times stream here.</p>";
      return;
    }
    var s = liveState;
    var pct = s.scroll_depth_pct_now != null ? Math.min(100, Math.max(0, s.scroll_depth_pct_now)) : 0;
    var rows = [
      ["Hotel", esc(s.hotel_id)],
      ["Time in modal", fmtMs(s.modal_elapsed_ms)],
      ["Scroll depth (now)", (s.scroll_depth_pct_now != null ? s.scroll_depth_pct_now : "—") + "%"],
      ["Scroll depth (max)", (s.scroll_max_pct != null ? s.scroll_max_pct : "—") + "%"],
      ["Direction changes", s.scroll_dir_changes != null ? String(s.scroll_dir_changes) : "—"],
      ["Speed max / mean (px/ms)", (s.scroll_max_px_per_ms != null ? s.scroll_max_px_per_ms : "—") + " / " + (s.scroll_mean_px_per_ms != null ? s.scroll_mean_px_per_ms : "—")]
    ];
    var secRows = "";
    var sm = s.sections_ms || {};
    var keys = Object.keys(sm).sort();
    keys.forEach(function (k) {
      secRows += "<tr><th>" + esc(k) + "</th><td>" + fmtMs(sm[k]) + "</td></tr>";
    });
    root.innerHTML =
      '<div class="scroll-meter"><div class="scroll-meter__label"><span>Scroll position</span><span>' +
      pct +
      "%</span></div><div class=\"scroll-meter__track\"><div class=\"scroll-meter__fill\" style=\"width:" +
      pct +
      '%\"></div></div></div>' +
      "<dl class=\"grid2\">" +
      rows
        .map(function (r) {
          return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>";
        })
        .join("") +
      "</dl>" +
      (keys.length
        ? '<p class="subh">Sections in view (running)</p><table><thead><tr><th>Section</th><th>Time</th></tr></thead><tbody>' +
          secRows +
          "</tbody></table>"
        : "");
  }

  function renderResultsTiming() {
    var el = document.getElementById("resultsTiming");
    if (!el) return;
    var last = null;
    var i;
    for (i = events.length - 1; i >= 0; i--) {
      if (events[i].event_type === "page_timing" && events[i].element_id === "results_page") {
        last = events[i];
        break;
      }
    }
    if (!last) {
      el.innerHTML = "<p class=\"hint\">Shows after the participant leaves or hides the task tab.</p>";
      return;
    }
    var v = last.value || {};
    el.innerHTML =
      "<dl class=\"grid2\"><dt>Total on listing</dt><dd>" +
      fmtMs(v.duration_ms) +
      "</dd><dt>Max scroll</dt><dd>" +
      (v.max_scroll_pct != null ? v.max_scroll_pct + "%" : "—") +
      "</dd><dt>Exit reason</dt><dd>" +
      esc(v.exit_reason) +
      "</dd></dl>";
  }

  function lastHotelTimings() {
    var out = [];
    var i;
    for (i = events.length - 1; i >= 0; i--) {
      var e = events[i];
      if (e.event_type !== "page_timing" || e.element_id === "results_page") continue;
      if (e.value && e.value.context === "hotel_modal") {
        out.push(e);
        if (out.length >= 12) break;
      }
    }
    return out;
  }

  /** Merge scroll_* events after this page_timing (older logs) when summary fields missing. */
  function visitDisplayValues(pt) {
    var v = Object.assign({}, pt.value || {});
    var H = pt.element_id;
    var need =
      v.scroll_depth_pct_at_exit == null ||
      v.scroll_max_pct == null ||
      v.scroll_dir_changes == null ||
      v.scroll_max_px_per_ms == null ||
      v.scroll_mean_px_per_ms == null;
    if (need) {
      var idx = events.indexOf(pt);
      if (idx >= 0) {
        var k, e;
        for (k = idx + 1; k < Math.min(events.length, idx + 60); k++) {
          e = events[k];
          if (e.element_id !== H) continue;
          if (e.event_type === "scroll_depth_max" && e.value && v.scroll_max_pct == null)
            v.scroll_max_pct = e.value.max_pct;
          if (e.event_type === "scroll_direction_changes" && e.value && v.scroll_dir_changes == null)
            v.scroll_dir_changes = e.value.count;
          if (e.event_type === "scroll_speed" && e.value) {
            if (v.scroll_max_px_per_ms == null) v.scroll_max_px_per_ms = e.value.max_px_per_ms;
            if (v.scroll_mean_px_per_ms == null) v.scroll_mean_px_per_ms = e.value.mean_px_per_ms;
          }
        }
      }
    }
    return v;
  }

  function pctCell(n) {
    if (n == null || n === "") return "—";
    return esc(String(n)) + "%";
  }

  function numCell(n) {
    if (n == null || n === "") return "—";
    return esc(String(n));
  }

  function renderHotelHistory() {
    var el = document.getElementById("hotelHistory");
    if (!el) return;
    var rows = lastHotelTimings();
    if (!rows.length) {
      el.innerHTML = "<p class=\"hint\">Rows appear each time a hotel modal closes.</p>";
      return;
    }
    el.innerHTML =
      '<div class="table-scroll">' +
      "<table><thead><tr>" +
      "<th>Hotel</th>" +
      "<th>Time in modal</th>" +
      "<th>Scroll depth (now)</th>" +
      "<th>Scroll depth (max)</th>" +
      "<th>Direction changes</th>" +
      "<th>Scroll speed max (px/ms)</th>" +
      "<th>Scroll speed mean (px/ms)</th>" +
      "<th>Exit</th>" +
      "</tr></thead><tbody>" +
      rows
        .map(function (r) {
          var v = visitDisplayValues(r);
          return (
            "<tr><td class=\"mono\">" +
            esc(r.element_id) +
            "</td><td>" +
            fmtMs(v.duration_ms) +
            "</td><td>" +
            pctCell(v.scroll_depth_pct_at_exit) +
            "</td><td>" +
            pctCell(v.scroll_max_pct) +
            "</td><td>" +
            numCell(v.scroll_dir_changes) +
            "</td><td>" +
            numCell(v.scroll_max_px_per_ms) +
            "</td><td>" +
            numCell(v.scroll_mean_px_per_ms) +
            "</td><td>" +
            esc(v.exit_reason || "") +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table></div>" +
      '<p class="hint">“Scroll depth (now)” is depth at modal exit. Older sessions may omit it unless you re-run with the latest <code>tracking.js</code>.</p>';
  }

  function renderScrollFinalized() {
    var el = document.getElementById("scrollFinal");
    if (!el) return;
    var blocks = [];
    var byHotel = {};
    var i;
    for (i = 0; i < events.length; i++) {
      var e = events[i];
      var hid = e.element_id;
      if (!hid || hid === "results_page" || hid === "viewport") continue;
      if (
        e.event_type === "scroll_depth_max" ||
        e.event_type === "scroll_speed" ||
        e.event_type === "scroll_direction_changes"
      ) {
        if (!byHotel[hid]) byHotel[hid] = {};
        byHotel[hid][e.event_type] = e.value;
      }
    }
    Object.keys(byHotel).forEach(function (hid) {
      var b = byHotel[hid];
      blocks.push(
        "<div style=\"margin-bottom:14px\"><strong class=\"mono\">" +
          esc(hid) +
          "</strong><dl class=\"grid2\" style=\"margin-top:8px\">" +
          "<dt>Max depth</dt><dd>" +
          (b.scroll_depth_max && b.scroll_depth_max.max_pct != null ? b.scroll_depth_max.max_pct + "%" : "—") +
          "</dd><dt>Dir. changes</dt><dd>" +
          (b.scroll_direction_changes && b.scroll_direction_changes.count != null
            ? String(b.scroll_direction_changes.count)
            : "—") +
          "</dd><dt>Speed max / mean</dt><dd>" +
          (b.scroll_speed
            ? esc(String(b.scroll_speed.max_px_per_ms)) + " / " + esc(String(b.scroll_speed.mean_px_per_ms))
            : "—") +
          "</dd></dl></div>"
      );
    });
    el.innerHTML = blocks.length
      ? blocks.join("")
      : "<p class=\"hint\">Logged when each hotel modal closes.</p>";
  }

  function renderSectionFinalized() {
    var el = document.getElementById("sectionFinal");
    if (!el) return;
    var rows = [];
    var i;
    for (i = events.length - 1; i >= 0; i--) {
      if (events[i].event_type === "section_visibility") {
        var e = events[i];
        var sec = (e.value && e.value.sections_ms) || {};
        var parts = [];
        Object.keys(sec)
          .sort()
          .forEach(function (k) {
            parts.push(esc(k) + ": " + fmtMs(sec[k]));
          });
        rows.push(
          "<tr><td class=\"mono\">" + esc(e.element_id) + "</td><td>" + (parts.length ? parts.join("<br>") : "—") + "</td></tr>"
        );
        if (rows.length >= 8) break;
      }
    }
    el.innerHTML = rows.length
      ? "<table><thead><tr><th>Hotel</th><th>Sections</th></tr></thead><tbody>" + rows.join("") + "</tbody></table>"
      : "<p class=\"hint\">Logged when each hotel modal closes.</p>";
  }

  function renderClicks() {
    var el = document.getElementById("clicksFeed");
    if (!el) return;
    var clicks = events.filter(function (e) {
      return e.event_type === "click";
    });
    var tail = clicks.slice(-45).reverse();
    el.innerHTML = tail.length
      ? "<table><thead><tr><th>Time</th><th>Target</th><th class=\"cell-detail\">Detail</th></tr></thead><tbody>" +
          tail
            .map(function (e) {
              return (
                "<tr><td class=\"mono\">" +
                new Date(e.timestamp).toLocaleTimeString() +
                "</td><td class=\"mono\">" +
                esc(e.element_id) +
                '</td><td class="mono cell-detail" title="' +
                esc(JSON.stringify(e.value)) +
                '">' +
                esc(shortJson(e.value, 140)) +
                "</td></tr>"
              );
            })
            .join("") +
          "</tbody></table>"
      : "<p class=\"hint\">No clicks yet.</p>";
  }

  function renderHovers() {
    var el = document.getElementById("hoversFeed");
    if (!el) return;
    var h = events.filter(function (e) {
      return e.event_type === "hover_duration";
    });
    var tail = h.slice(-28).reverse();
    el.innerHTML = tail.length
      ? "<table><thead><tr><th>Target</th><th>Duration</th></tr></thead><tbody>" +
          tail
            .map(function (e) {
              var d = (e.value && e.value.duration_ms) || 0;
              return "<tr><td class=\"mono\">" + esc(e.element_id) + "</td><td>" + fmtMs(d) + "</td></tr>";
            })
            .join("") +
          "</tbody></table>"
      : "<p class=\"hint\">Hovers end after pointer leaves (≥30ms).</p>";
  }

  function renderMouse() {
    var el = document.getElementById("mouseFeed");
    if (!el) return;
    var m = events.filter(function (e) {
      return e.event_type === "mouse_position";
    });
    var last = m[m.length - 1];
    if (!last) {
      el.innerHTML = "<p class=\"hint\">Samples every 500ms.</p>";
      return;
    }
    var v = last.value || {};
    el.innerHTML =
      "<dl class=\"grid2\"><dt>Position</dt><dd>" +
      esc(String(v.x)) +
      ", " +
      esc(String(v.y)) +
      "</dd><dt>Viewport</dt><dd>" +
      esc(String(v.vw)) +
      "×" +
      esc(String(v.vh)) +
      "</dd><dt>Modal open</dt><dd>" +
      (v.hotel_modal_open ? "Yes" : "No") +
      "</dd><dt>Time</dt><dd>" +
      new Date(last.timestamp).toLocaleTimeString() +
      "</dd></dl>";
  }

  function renderRawCount() {
    var el = document.getElementById("eventCount");
    if (el) el.textContent = String(events.length);
    renderHotelHistory();
    renderScrollFinalized();
    renderSectionFinalized();
  }

  function readLocalMirror() {
    try {
      var raw = localStorage.getItem(LIVE_KEY);
      if (raw) applyFullPayload(JSON.parse(raw));
    } catch (e) {
      /* ignore */
    }
  }

  function requestFull() {
    if (bc) {
      try {
        bc.postMessage({ t: "request_full" });
      } catch (e) {
        /* ignore */
      }
    }
  }

  function exportJson() {
    var payload =
      latestPayload && latestPayload.events
        ? latestPayload
        : {
            v: 1,
            exported_from: "live-dashboard",
            exported_at_ms: Date.now(),
            events: events
          };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hotel_experiment_snapshot_" + Date.now() + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function onBcMessage(ev) {
    var d = ev && ev.data;
    if (!d) return;
    if (paused) {
      if (d.t === "full" && d.payload) buffer.push({ t: "full", payload: d.payload });
      else if (d.t === "event" && d.event) buffer.push({ t: "e", ev: d.event });
      else if (d.t === "live_state" && d.state) buffer.push({ t: "l", s: d.state });
      return;
    }
    if (d.t === "event" && d.event) {
      mergeEvent(d.event);
      setStatus(true, "Live");
    } else if (d.t === "live_state" && d.state) {
      liveState = d.state;
      lastLiveAt = d.state.at_ms || Date.now();
      setStatus(true, "Live");
      scheduleRender();
    } else if (d.t === "full" && d.payload) {
      applyFullPayload(d.payload);
      setStatus(true, "Synced");
    }
  }

  function onStorage(ev) {
    if (ev.key !== LIVE_KEY || !ev.newValue || paused) return;
    try {
      applyFullPayload(JSON.parse(ev.newValue));
      setStatus(true, "Storage sync");
    } catch (e) {
      /* ignore */
    }
  }

  function setPauseUi() {
    var btn = document.getElementById("btnPause");
    if (btn) {
      btn.setAttribute("aria-pressed", paused ? "true" : "false");
      btn.textContent = paused ? "Resume" : "Pause";
    }
  }

  function init() {
    try {
      bc = new BroadcastChannel(CHANNEL);
      bc.onmessage = onBcMessage;
    } catch (e) {
      bc = null;
      setStatus(false, "BroadcastChannel unavailable");
    }

    document.getElementById("btnSync").addEventListener("click", function () {
      readLocalMirror();
      requestFull();
      setStatus(true, "Sync requested");
    });
    document.getElementById("btnExport").addEventListener("click", exportJson);
    document.getElementById("btnPause").addEventListener("click", function () {
      paused = !paused;
      setPauseUi();
      if (!paused) {
        flushBuffer();
        scheduleRender();
        setStatus(true, "Resumed");
      } else {
        setStatus(false, "Paused — display frozen");
      }
    });
    readLocalMirror();
    requestFull();
    setInterval(requestFull, 2500);
    tickTimer = setInterval(updateLastTick, 1000);

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", function () {
      readLocalMirror();
      requestFull();
    });

    if (!events.length) setStatus(false, "Waiting for task tab…");
    else setStatus(true, "Loaded from storage");

    setPauseUi();
    renderAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
