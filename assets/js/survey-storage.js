(function () {
  "use strict";

  const endpoint = "./api/survey";
  const pageStartedAt = Date.now();
  const pendingIds = new Map();
  let participantId = new URLSearchParams(location.search).get("participant_id") || "";

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
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  function stage() {
    const version = document.body && document.body.dataset.reviewVersion;
    if (version === "without") return "browsing_1";
    if (version === "with" || version === "with-ai-summary") return "browsing_2";
    const page = new URLSearchParams(location.search).get("survey_stage");
    return page === "hotel_questionnaire" ? "questionnaire_1" :
      page === "post_review" || page === "post_review_ai" ? "questionnaire_2" : "";
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

  function visits() {
    return events().filter(event => event.event_type === "page_timing" &&
      event.value && event.value.context === "hotel_modal")
      .map(event => ({
        visit_id: event.event_id,
        hotel_id: event.element_id,
        closed_at: event.timestamp,
        metrics: Object.fromEntries(Object.entries(event.value).filter(([key]) =>
          key !== "participant_id" && key !== "hotel_display_position"))
      }));
  }

  function requireParticipant() {
    if (!participantId) throw new Error("Please enter your Student ID to resume the survey.");
    return participantId;
  }

  window.HotelSurveyStorage = {
    load: () => request({ action: "load", participant_id: requireParticipant() }),
    resume: async (studentId, condition, answer) => {
      const result = await request({
        action: "resume", student_id: studentId, condition, answer
      });
      participantId = result.survey.participant_id;
      return result;
    },
    save: async (pageId, answers, nextPage, complete) => {
      const popups = popupEvents();
      const key = `save:${pageId}:${JSON.stringify(answers)}:${popups.map(item => item.event_id).join(",")}`;
      const result = await request({
        action: "save",
        participant_id: requireParticipant(),
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
      const hotelVisits = visits();
      const popups = popupEvents();
      const key = `browse:${stageName}:${hotelVisits.map(item => item.visit_id).join(",")}:${popups.map(item => item.event_id).join(",")}`;
      const result = await request({
        action: "browse",
        participant_id: requireParticipant(),
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
