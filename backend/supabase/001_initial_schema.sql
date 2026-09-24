-- Initial, server-only storage for the between-subjects hotel survey.
-- Run once in the new Supabase project. This does not import or delete data.
begin;

create table public.survey_responses (
  participant_id uuid primary key default gen_random_uuid(),
  student_id text not null unique,
  condition text not null check (condition in ('full_reviews', 'ai_summary')),
  survey_version text not null,
  assigned_attributes text[] not null,
  answers jsonb not null default '{}'::jsonb,
  popup_statistics jsonb not null default '{}'::jsonb,
  quality_checks jsonb not null default '{}'::jsonb,
  completed_pages text[] not null default '{}'::text[],
  current_page text not null default 'student_id',
  completion_status text not null default 'in_progress'
    check (completion_status in ('in_progress', 'complete')),
  revision bigint not null default 0 check (revision >= 0),
  last_save_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint student_id_not_blank check (
    char_length(student_id) between 1 and 128 and student_id = btrim(student_id)
  ),
  constraint assigned_attributes_valid check (
    cardinality(assigned_attributes) = 4
    and array_ndims(assigned_attributes) = 1
    and array_lower(assigned_attributes, 1) = 1
    and array_position(assigned_attributes, null) is null
    and assigned_attributes[1] = 'location_convenience'
    and assigned_attributes[2] = 'fitness_facilities'
    and assigned_attributes[3] = any (array[
      'cleanliness', 'service_quality', 'room_comfort',
      'wifi_reliability', 'noise_level', 'breakfast_quality'
    ])
    and assigned_attributes[4] = any (array[
      'cleanliness', 'service_quality', 'room_comfort',
      'wifi_reliability', 'noise_level', 'breakfast_quality'
    ])
    and assigned_attributes[3] <> assigned_attributes[4]
  ),
  constraint response_objects_valid check (
    jsonb_typeof(answers) = 'object'
    and jsonb_typeof(popup_statistics) = 'object'
    and jsonb_typeof(quality_checks) = 'object'
  ),
  constraint completion_timestamp_matches_status check (
    (completion_status = 'complete') = (completed_at is not null)
  )
);

create table public.browsing_records (
  participant_id uuid not null references public.survey_responses(participant_id),
  browsing_stage text not null check (browsing_stage in ('information', 'reviews')),
  hotel_id text not null check (hotel_id in ('arlo-chicago', 'nobu-hotel-chicago')),
  metrics jsonb not null default '{}'::jsonb,
  visits jsonb not null default '{}'::jsonb,
  revision bigint not null default 0 check (revision >= 0),
  last_save_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (participant_id, browsing_stage, hotel_id),
  constraint browsing_objects_valid check (
    jsonb_typeof(metrics) = 'object' and jsonb_typeof(visits) = 'object'
  )
);

-- Only the trusted backend may access participant records. No public policies.
alter table public.survey_responses enable row level security;
alter table public.browsing_records enable row level security;
revoke all on public.survey_responses, public.browsing_records from public, anon, authenticated;

comment on table public.survey_responses is
  'One participant, one assigned condition. Student ID is required, not an authentication credential.';
comment on column public.survey_responses.answers is
  'Answers keyed by stable question ID. The backend validates values and merges page submissions atomically.';
comment on column public.survey_responses.popup_statistics is
  'Auxiliary popup statistics for browsing_1, questionnaire_1, browsing_2, and questionnaire_2.';
comment on column public.browsing_records.visits is
  'Cumulative per-visit snapshots keyed by visit ID, for retry-safe aggregation without double counting.';

commit;
