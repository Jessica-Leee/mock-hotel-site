(function () {
  "use strict";

  const endpoint = "./api/survey";
  const pageStartedAt = Date.now();
  const pendingIds = new Map();

  function requestId(key) {
    if (!pendingIds.has(key)) pendingIds.set(key, crypto.randomUUID());
    return pendingIds.get(key);
  }

  async function request(payload) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    let response;
    try {
      response = await fetch(endpoint, {
        method: payload ? "POST" : "GET",
        credentials: "same-origin",
        headers: payload ? { "Content-Type": "application/json" } : {},
        body: payload ? JSON.stringify(payload) : undefined,
        signal: controller.signal
      });
    } catch (error) {
      if (error.name === "AbortError") throw new Error("Saving took too long. Please try again.");
      throw new Error("Could not reach survey storage. Please check your connection and try again.");
    } finally {
      clearTimeout(timer);
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok !== true) {
      throw new Error(result.error || `Save failed (${response.status}). Please try again.`);
    }
    return result;
  }

  function events() {
    const payload = typeof window.HOTEL_EXPERIMENT_GET_PAYLOAD === "function"
      ? window.HOTEL_EXPERIMENT_GET_PAYLOAD() : null;
    return payload && Array.isArray(payload.events) ? payload.events : [];
  }

  function popupEvents() {
    return events().filter(event => event.event_type === "popup_open").map(event => ({
      event_id: event.event_id,
      popup_type: event.value && event.value.popup_type,
      stage: event.value && event.value.usage_stage || stage(),
      hotel_id: event.value && event.value.hotel_id || null,
      opened_at: event.timestamp
    }));
  }

  function stage() {
    const version = document.body && document.body.dataset.reviewVersion;
    if (version === "without") return "browsing_1";
    if (version === "with" || version === "with-ai-summary") return "browsing_2";
    const page = new URLSearchParams(location.search).get("survey_stage");
    return page === "hotel_questionnaire" ? "questionnaire_1" :
      page === "post_review" || page === "post_review_ai" ? "questionnaire_2" : "";
  }

  function visits() {
    return events().filter(event => event.event_type === "page_timing" &&
      event.value && event.value.context === "hotel_modal")
      .map(event => ({
        visit_id: event.event_id,
        hotel_id: event.element_id,
        closed_at: event.timestamp,
        metrics: Object.fromEntries(Object.entries(event.value).filter(([key]) =>
          key !== "survey_user_id" && key !== "hotel_display_position"))
      }));
  }

  function flushTracking() {
    if (typeof window.HOTEL_EXPERIMENT_FLUSH !== "function") return;
    try {
      Promise.resolve(window.HOTEL_EXPERIMENT_FLUSH()).catch(() => {});
    } catch (_) {
      // Tracking has its own durable retry queue; the page save confirms required data.
    }
  }

  window.HotelSurveyStorage = {
    session: () => request(),
    start: async (studentId, condition, answer) => {
      const key = `start:${studentId}:${condition}`;
      const result = await request({
        action: "start", start_id: requestId(key), student_id: studentId, condition, answer
      });
      pendingIds.delete(key);
      return result;
    },
    save: async (pageId, answers, nextPage, complete) => {
      flushTracking();
      const popups = popupEvents();
      const key = `save:${pageId}:${JSON.stringify(answers)}:${popups.map(item => item.event_id).join(",")}`;
      const result = await request({
      action: "save",
      save_id: requestId(key),
      page_id: pageId,
      answers,
      next_page: nextPage,
      complete: !!complete,
      popup_events: popups
      });
      pendingIds.delete(key);
      return result;
    },
    browse: async stageName => {
      flushTracking();
      const hotelVisits = visits();
      const popups = popupEvents();
      const key = `browse:${stageName}:${hotelVisits.map(item => item.visit_id).join(",")}:${popups.map(item => item.event_id).join(",")}`;
      const result = await request({
      action: "browse",
      save_id: requestId(key),
      stage: stageName,
      stage_duration_ms: Date.now() - pageStartedAt,
      visits: hotelVisits,
      popup_events: popups
      });
      pendingIds.delete(key);
      return result;
    }
  };
})();
