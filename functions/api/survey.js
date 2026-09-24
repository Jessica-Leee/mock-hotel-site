import { handleSurveyRequest } from "../../backend/supabase/handler.mjs";

export function onRequest(context) {
  return handleSurveyRequest(context);
}
