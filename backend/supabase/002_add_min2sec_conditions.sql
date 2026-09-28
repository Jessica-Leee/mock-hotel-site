-- Add the two 2-second browsing variants without changing existing rows.
begin;

alter table public.survey_responses
  drop constraint if exists survey_responses_condition_check;

alter table public.survey_responses
  add constraint survey_responses_condition_check check (condition in (
    'full_reviews',
    'ai_summary',
    'full_reviews_min2sec',
    'ai_summary_min2sec'
  ));

commit;
