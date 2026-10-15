-- Short courses, slice 1.
-- Free enrolment is allowed for published free courses.
-- Paid courses cannot be enrolled through these policies.
-- Answer keys are not readable by learners; grading runs in security-definer functions.

create type public.short_course_status as enum (
  'draft',
  'in_review',
  'published',
  'archived'
);

create type public.course_delivery as enum ('online', 'physical', 'hybrid');

create type public.lesson_type as enum (
  'text',
  'video',
  'text_video',
  'presentation',
  'practical',
  'external_resource'
);

create type public.course_enrolment_status as enum (
  'active',
  'completed',
  'withdrawn'
);

create type public.assessment_question_type as enum (
  'multiple_choice',
  'true_false',
  'multiple_select',
  'short_answer'
);

create type public.course_staff_role as enum ('instructor', 'marker');

create table public.short_courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  slug text not null unique,
  title text not null,
  pillar public.programme_pillar not null,
  summary text not null default '',
  description text not null default '',
  outcomes text[] not null default '{}',
  audience text not null default '',
  prerequisites text not null default '',
  duration_label text not null default '',
  estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  price_kobo integer not null default 0 check (price_kobo >= 0),
  currency text not null default 'NGN',
  is_free boolean not null default false,
  delivery_format public.course_delivery not null default 'online',
  cover_image_url text,
  intro_video_url text,
  instructor_name text not null default 'ACTI short-course team',
  instructor_bio text not null default '',
  keywords text not null default '',
  publication_status public.short_course_status not null default 'draft',
  coming_soon boolean not null default false,
  certificate_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint short_courses_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint short_courses_code_format check (code ~ '^[A-Z0-9]+(?:-[A-Z0-9]+)*$'),
  constraint short_courses_free_price check (not is_free or price_kobo = 0),
  constraint short_courses_title_len check (char_length(title) between 3 and 160)
);

create index short_courses_publication_idx on public.short_courses (publication_status);
create index short_courses_pillar_idx on public.short_courses (pillar);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.short_courses (id) on delete cascade,
  title text not null,
  summary text not null default '',
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_modules_title_len check (char_length(title) between 2 and 160)
);

create index course_modules_course_idx on public.course_modules (course_id, sort_order);

create table public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.short_courses (id) on delete cascade,
  module_id uuid not null references public.course_modules (id) on delete cascade,
  slug text not null,
  title text not null,
  summary text not null default '',
  lesson_type public.lesson_type not null default 'text',
  body text not null default '',
  video_url text,
  video_duration_seconds integer check (video_duration_seconds is null or video_duration_seconds >= 0),
  poster_url text,
  caption_url text,
  transcript text,
  estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  is_required boolean not null default true,
  sort_order integer not null default 1,
  publication_status public.short_course_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug),
  constraint course_lessons_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint course_lessons_title_len check (char_length(title) between 2 and 160),
  constraint course_lessons_body_len check (char_length(body) <= 50000)
);

create index course_lessons_module_idx on public.course_lessons (module_id, sort_order);

create or replace function public.course_lessons_sync_course()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course uuid;
begin
  select m.course_id into v_course
  from public.course_modules m
  where m.id = new.module_id;

  if v_course is null then
    raise exception 'Module not found';
  end if;

  new.course_id := v_course;
  return new;
end;
$$;

create trigger course_lessons_sync_course
  before insert or update of module_id on public.course_lessons
  for each row execute function public.course_lessons_sync_course();

create trigger short_courses_updated_at
  before update on public.short_courses
  for each row execute function public.set_updated_at();

create trigger course_modules_updated_at
  before update on public.course_modules
  for each row execute function public.set_updated_at();

create trigger course_lessons_updated_at
  before update on public.course_lessons
  for each row execute function public.set_updated_at();

create table public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.course_lessons (id) on delete cascade,
  title text not null,
  external_url text,
  storage_path text,
  mime_type text,
  file_size integer check (file_size is null or file_size >= 0),
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  constraint lesson_resources_target check (external_url is not null or storage_path is not null),
  constraint lesson_resources_https check (external_url is null or external_url ~ '^https://')
);

create index lesson_resources_lesson_idx on public.lesson_resources (lesson_id, sort_order);

create table public.course_staff (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.short_courses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  staff_role public.course_staff_role not null default 'instructor',
  created_at timestamptz not null default now(),
  unique (course_id, user_id)
);

create index course_staff_user_idx on public.course_staff (user_id);

create table public.course_enrolments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.short_courses (id) on delete cascade,
  status public.course_enrolment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  last_lesson_id uuid references public.course_lessons (id) on delete set null,
  last_accessed_at timestamptz,
  unique (user_id, course_id)
);

create index course_enrolments_user_idx on public.course_enrolments (user_id);
create index course_enrolments_course_idx on public.course_enrolments (course_id);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null references public.course_enrolments (id) on delete cascade,
  lesson_id uuid not null references public.course_lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (enrolment_id, lesson_id)
);

create index lesson_progress_enrolment_idx on public.lesson_progress (enrolment_id);

create table public.course_assessments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.short_courses (id) on delete cascade,
  module_id uuid references public.course_modules (id) on delete set null,
  title text not null,
  instructions text not null default '',
  pass_mark_percent integer not null default 70 check (pass_mark_percent between 1 and 100),
  attempt_limit integer not null default 3 check (attempt_limit between 1 and 20),
  is_required boolean not null default true,
  sort_order integer not null default 1,
  publication_status public.short_course_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_assessments_title_len check (char_length(title) between 2 and 160)
);

create index course_assessments_course_idx on public.course_assessments (course_id, sort_order);

create trigger course_assessments_updated_at
  before update on public.course_assessments
  for each row execute function public.set_updated_at();

create table public.assessment_questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.course_assessments (id) on delete cascade,
  prompt text not null,
  question_type public.assessment_question_type not null,
  explanation text,
  points integer not null default 1 check (points > 0),
  sort_order integer not null default 1,
  constraint assessment_questions_prompt_len check (char_length(prompt) between 3 and 2000)
);

create index assessment_questions_assessment_idx
  on public.assessment_questions (assessment_id, sort_order);

create table public.assessment_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.assessment_questions (id) on delete cascade,
  label text not null,
  is_correct boolean not null default false,
  sort_order integer not null default 1,
  constraint assessment_options_label_len check (char_length(label) between 1 and 500)
);

create index assessment_options_question_idx
  on public.assessment_options (question_id, sort_order);

create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null references public.course_enrolments (id) on delete cascade,
  assessment_id uuid not null references public.course_assessments (id) on delete cascade,
  score_percent integer not null check (score_percent between 0 and 100),
  passed boolean not null,
  attempt_number integer not null check (attempt_number > 0),
  submitted_at timestamptz not null default now(),
  unique (enrolment_id, assessment_id, attempt_number)
);

create index assessment_attempts_enrolment_idx
  on public.assessment_attempts (enrolment_id, assessment_id);

create table public.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.assessment_attempts (id) on delete cascade,
  question_id uuid not null references public.assessment_questions (id) on delete cascade,
  selected_option_id uuid references public.assessment_options (id) on delete set null,
  selected_option_ids uuid[] not null default '{}',
  is_correct boolean not null,
  feedback text,
  unique (attempt_id, question_id)
);

create index assessment_responses_attempt_idx on public.assessment_responses (attempt_id);

-- Public curriculum previews. Owner rights are required so anonymous visitors
-- can read titles without receiving lesson bodies or answer keys.
create view public.published_lesson_outlines
with (security_barrier = true, security_invoker = false) as
select
  l.id,
  l.course_id,
  l.module_id,
  m.title as module_title,
  m.sort_order as module_sort,
  l.title,
  l.slug,
  l.summary,
  l.lesson_type,
  l.estimated_minutes,
  l.is_required,
  l.sort_order
from public.course_lessons l
join public.course_modules m on m.id = l.module_id
join public.short_courses c on c.id = l.course_id
where c.publication_status = 'published'
  and l.publication_status = 'published';

create view public.published_assessment_outlines
with (security_barrier = true, security_invoker = false) as
select
  a.id,
  a.course_id,
  a.title,
  a.is_required,
  a.pass_mark_percent,
  a.attempt_limit,
  a.sort_order
from public.course_assessments a
join public.short_courses c on c.id = a.course_id
where c.publication_status = 'published'
  and a.publication_status = 'published';

create or replace function public.is_course_staff(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.course_staff s
    where s.course_id = p_course_id
      and s.user_id = auth.uid()
  );
$$;

create or replace function public.can_read_course_content(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.is_course_staff(p_course_id)
    or exists (
      select 1
      from public.course_enrolments e
      where e.course_id = p_course_id
        and e.user_id = auth.uid()
        and e.status in ('active', 'completed')
    );
$$;

create or replace function public.refresh_course_completion(p_enrolment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_status public.course_enrolment_status;
  v_required_lessons integer;
  v_done_lessons integer;
  v_required_assessments integer;
  v_passed_assessments integer;
  v_done boolean;
begin
  select e.user_id, e.status
  into v_owner, v_status
  from public.course_enrolments e
  where e.id = p_enrolment_id;

  if v_owner is null then
    raise exception 'Enrolment not found';
  end if;

  if v_owner is distinct from auth.uid() and not public.is_admin() then
    raise exception 'Not allowed';
  end if;

  if v_status = 'withdrawn' then
    return;
  end if;

  select count(*) into v_required_lessons
  from public.course_lessons l
  join public.course_enrolments e on e.course_id = l.course_id
  where e.id = p_enrolment_id
    and l.publication_status = 'published'
    and l.is_required;

  select count(*) into v_done_lessons
  from public.course_lessons l
  join public.lesson_progress p
    on p.lesson_id = l.id
   and p.enrolment_id = p_enrolment_id
  where l.publication_status = 'published'
    and l.is_required
    and l.course_id = (
      select course_id from public.course_enrolments where id = p_enrolment_id
    );

  select count(*) into v_required_assessments
  from public.course_assessments a
  join public.course_enrolments e on e.course_id = a.course_id
  where e.id = p_enrolment_id
    and a.publication_status = 'published'
    and a.is_required;

  select count(*) into v_passed_assessments
  from public.course_assessments a
  join public.course_enrolments e on e.course_id = a.course_id
  where e.id = p_enrolment_id
    and a.publication_status = 'published'
    and a.is_required
    and exists (
      select 1
      from public.assessment_attempts at
      where at.assessment_id = a.id
        and at.enrolment_id = p_enrolment_id
        and at.passed
    );

  v_done :=
    (v_required_lessons + v_required_assessments) > 0
    and v_done_lessons = v_required_lessons
    and v_passed_assessments = v_required_assessments;

  if v_done then
    update public.course_enrolments
    set status = 'completed',
        completed_at = coalesce(completed_at, now())
    where id = p_enrolment_id
      and status in ('active', 'completed');
  else
    update public.course_enrolments
    set status = 'active',
        completed_at = null
    where id = p_enrolment_id
      and status = 'completed';
  end if;
end;
$$;

create or replace function public.record_lesson_visit(p_lesson_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_course_id uuid;
  v_enrolment_id uuid;
begin
  if v_uid is null then
    raise exception 'Not signed in';
  end if;

  select l.course_id into v_course_id
  from public.course_lessons l
  where l.id = p_lesson_id
    and l.publication_status = 'published';

  if v_course_id is null then
    raise exception 'Lesson not found';
  end if;

  select e.id into v_enrolment_id
  from public.course_enrolments e
  where e.user_id = v_uid
    and e.course_id = v_course_id
    and e.status in ('active', 'completed')
  for update;

  if v_enrolment_id is null then
    raise exception 'No active enrolment';
  end if;

  update public.course_enrolments
  set last_lesson_id = p_lesson_id,
      last_accessed_at = now()
  where id = v_enrolment_id;

  perform public.refresh_course_completion(v_enrolment_id);
end;
$$;

create or replace function public.complete_lesson(p_lesson_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_course_id uuid;
  v_enrolment_id uuid;
begin
  if v_uid is null then
    raise exception 'Not signed in';
  end if;

  select l.course_id into v_course_id
  from public.course_lessons l
  where l.id = p_lesson_id
    and l.publication_status = 'published';

  if v_course_id is null then
    raise exception 'Lesson not found';
  end if;

  select e.id into v_enrolment_id
  from public.course_enrolments e
  where e.user_id = v_uid
    and e.course_id = v_course_id
    and e.status in ('active', 'completed')
  for update;

  if v_enrolment_id is null then
    raise exception 'No active enrolment';
  end if;

  insert into public.lesson_progress (enrolment_id, lesson_id)
  values (v_enrolment_id, p_lesson_id)
  on conflict (enrolment_id, lesson_id) do nothing;

  update public.course_enrolments
  set last_lesson_id = p_lesson_id,
      last_accessed_at = now()
  where id = v_enrolment_id;

  perform public.refresh_course_completion(v_enrolment_id);
end;
$$;

create or replace function public.get_learner_assessment(p_assessment_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_course_id uuid;
  v_status public.short_course_status;
  v_course_status public.short_course_status;
  v_attempts integer;
  v_questions jsonb;
  v_row public.course_assessments%rowtype;
begin
  if v_uid is null then
    raise exception 'Not signed in';
  end if;

  select a.*
  into v_row
  from public.course_assessments a
  where a.id = p_assessment_id;

  if not found then
    raise exception 'Assessment not found';
  end if;

  select c.publication_status
  into v_course_status
  from public.short_courses c
  where c.id = v_row.course_id;

  v_course_id := v_row.course_id;
  v_status := v_row.publication_status;

  if not public.is_admin() then
    if v_status <> 'published' or v_course_status <> 'published' then
      if not public.is_course_staff(v_course_id) then
        raise exception 'Assessment not available';
      end if;
    end if;

    if not public.can_read_course_content(v_course_id) then
      raise exception 'Enrolment required';
    end if;
  end if;

  select count(*)::integer into v_attempts
  from public.assessment_attempts at
  join public.course_enrolments e on e.id = at.enrolment_id
  where at.assessment_id = p_assessment_id
    and e.user_id = v_uid;

  select coalesce(jsonb_agg(payload order by sort_key), '[]'::jsonb)
  into v_questions
  from (
    select
      random() as sort_key,
      jsonb_build_object(
        'id', qu.id,
        'prompt', qu.prompt,
        'question_type', qu.question_type,
        'options', coalesce((
          select jsonb_agg(opt order by opt_sort)
          from (
            select
              random() as opt_sort,
              jsonb_build_object('id', o.id, 'label', o.label) as opt
            from public.assessment_options o
            where o.question_id = qu.id
          ) opts
        ), '[]'::jsonb)
      ) as payload
    from public.assessment_questions qu
    where qu.assessment_id = p_assessment_id
  ) shuffled;

  return jsonb_build_object(
    'id', v_row.id,
    'course_id', v_row.course_id,
    'title', v_row.title,
    'instructions', v_row.instructions,
    'pass_mark_percent', v_row.pass_mark_percent,
    'attempt_limit', v_row.attempt_limit,
    'attempts_used', v_attempts,
    'questions', v_questions
  );
end;
$$;

create or replace function public.submit_assessment_attempt(
  p_assessment_id uuid,
  p_answers jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_assessment public.course_assessments%rowtype;
  v_course_status public.short_course_status;
  v_enrolment_id uuid;
  v_attempt_count integer;
  v_attempt_number integer;
  v_attempt_id uuid;
  v_rows jsonb := '[]'::jsonb;
  v_question public.assessment_questions%rowtype;
  v_selected uuid;
  v_selected_ids uuid[];
  v_correct_ids uuid[];
  v_ok boolean;
  v_earned integer := 0;
  v_total integer := 0;
  v_score integer;
  v_passed boolean;
begin
  if v_uid is null then
    raise exception 'Not signed in';
  end if;

  if jsonb_typeof(p_answers) is distinct from 'object' then
    raise exception 'Invalid answers';
  end if;

  select a.*
  into v_assessment
  from public.course_assessments a
  where a.id = p_assessment_id;

  if not found then
    raise exception 'Assessment not available';
  end if;

  select c.publication_status
  into v_course_status
  from public.short_courses c
  where c.id = v_assessment.course_id;

  if v_assessment.publication_status <> 'published'
     or v_course_status <> 'published' then
    raise exception 'Assessment not available';
  end if;

  select e.id into v_enrolment_id
  from public.course_enrolments e
  where e.user_id = v_uid
    and e.course_id = v_assessment.course_id
    and e.status in ('active', 'completed')
  for update;

  if v_enrolment_id is null then
    raise exception 'Enrolment required';
  end if;

  select count(*)::integer into v_attempt_count
  from public.assessment_attempts
  where enrolment_id = v_enrolment_id
    and assessment_id = p_assessment_id;

  if v_attempt_count >= v_assessment.attempt_limit then
    raise exception 'Attempt limit reached';
  end if;

  if not exists (
    select 1 from public.assessment_questions q where q.assessment_id = p_assessment_id
  ) then
    raise exception 'This assessment has no questions';
  end if;

  for v_question in
    select *
    from public.assessment_questions q
    where q.assessment_id = p_assessment_id
    order by q.sort_order
  loop
    v_selected := null;
    v_selected_ids := '{}';
    v_ok := false;

    select coalesce(array_agg(o.id order by o.id), '{}')
    into v_correct_ids
    from public.assessment_options o
    where o.question_id = v_question.id
      and o.is_correct;

    if v_question.question_type = 'short_answer' then
      v_ok := false;
    elsif v_question.question_type = 'multiple_select' then
      begin
        select coalesce(array_agg(distinct val order by val), '{}')
        into v_selected_ids
        from (
          select (jsonb_array_elements_text(
            case
              when jsonb_typeof(p_answers -> v_question.id::text) = 'array'
                then p_answers -> v_question.id::text
              else '[]'::jsonb
            end
          ))::uuid as val
        ) picked;
      exception
        when invalid_text_representation then
          v_selected_ids := '{}';
      end;
      v_ok := v_selected_ids = v_correct_ids and cardinality(v_correct_ids) > 0;
    else
      begin
        if jsonb_typeof(p_answers -> v_question.id::text) = 'string' then
          v_selected := (p_answers ->> v_question.id::text)::uuid;
        end if;
      exception
        when invalid_text_representation then
          v_selected := null;
      end;

      if v_selected is not null then
        v_selected_ids := array[v_selected];
      end if;

      v_ok := exists (
        select 1
        from public.assessment_options o
        where o.id = v_selected
          and o.question_id = v_question.id
          and o.is_correct
      );
    end if;

    v_total := v_total + v_question.points;
    if v_ok then
      v_earned := v_earned + v_question.points;
    end if;

    v_rows := v_rows || jsonb_build_array(
      jsonb_build_object(
        'question_id', v_question.id,
        'selected_option_id', v_selected,
        'selected_option_ids', to_jsonb(v_selected_ids),
        'is_correct', v_ok,
        'feedback', coalesce(v_question.explanation, ''),
        'points', v_question.points
      )
    );
  end loop;

  if v_total = 0 then
    raise exception 'This assessment has no points';
  end if;

  v_score := round((v_earned::numeric / v_total::numeric) * 100)::integer;
  v_passed := v_score >= v_assessment.pass_mark_percent;
  v_attempt_number := v_attempt_count + 1;

  insert into public.assessment_attempts (
    enrolment_id,
    assessment_id,
    score_percent,
    passed,
    attempt_number
  )
  values (
    v_enrolment_id,
    p_assessment_id,
    v_score,
    v_passed,
    v_attempt_number
  )
  returning id into v_attempt_id;

  insert into public.assessment_responses (
    attempt_id,
    question_id,
    selected_option_id,
    selected_option_ids,
    is_correct,
    feedback
  )
  select
    v_attempt_id,
    (elem ->> 'question_id')::uuid,
    nullif(elem ->> 'selected_option_id', '')::uuid,
    coalesce(
      (
        select array_agg(value::uuid)
        from jsonb_array_elements_text(elem -> 'selected_option_ids') as value
      ),
      '{}'
    ),
    (elem ->> 'is_correct')::boolean,
    elem ->> 'feedback'
  from jsonb_array_elements(v_rows) elem;

  perform public.refresh_course_completion(v_enrolment_id);

  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'score_percent', v_score,
    'passed', v_passed,
    'attempt_number', v_attempt_number,
    'attempts_remaining', greatest(v_assessment.attempt_limit - v_attempt_number, 0)
  );
end;
$$;

create or replace function public.get_attempt_feedback(p_attempt_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_allowed boolean;
  v_feedback jsonb;
begin
  if v_uid is null then
    raise exception 'Not signed in';
  end if;

  select
    public.is_admin()
    or e.user_id = v_uid
  into v_allowed
  from public.assessment_attempts at
  join public.course_enrolments e on e.id = at.enrolment_id
  where at.id = p_attempt_id;

  if v_allowed is not true then
    raise exception 'Attempt not available';
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'question_id', r.question_id,
      'prompt', q.prompt,
      'selected_label', coalesce(o.label, ''),
      'correct', r.is_correct,
      'feedback', coalesce(r.feedback, '')
    )
    order by q.sort_order
  ), '[]'::jsonb)
  into v_feedback
  from public.assessment_responses r
  join public.assessment_questions q on q.id = r.question_id
  left join public.assessment_options o on o.id = r.selected_option_id
  where r.attempt_id = p_attempt_id;

  return v_feedback;
end;
$$;

alter table public.short_courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.course_lessons enable row level security;
alter table public.lesson_resources enable row level security;
alter table public.course_staff enable row level security;
alter table public.course_enrolments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.course_assessments enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.assessment_options enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.assessment_responses enable row level security;

create policy "Public read published short courses"
  on public.short_courses for select
  using (
    publication_status = 'published'
    or public.is_admin()
    or public.is_course_staff(id)
  );

create policy "Admins manage short courses"
  on public.short_courses for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Readers see modules for visible courses"
  on public.course_modules for select
  using (
    public.is_admin()
    or public.can_read_course_content(course_id)
    or exists (
      select 1
      from public.short_courses c
      where c.id = course_id
        and c.publication_status = 'published'
    )
  );

create policy "Admins manage modules"
  on public.course_modules for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Enrolled readers see published lessons"
  on public.course_lessons for select
  using (
    public.is_admin()
    or (
      publication_status = 'published'
      and public.can_read_course_content(course_id)
    )
  );

create policy "Admins manage lessons"
  on public.course_lessons for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Readers see resources for readable lessons"
  on public.lesson_resources for select
  using (
    exists (
      select 1
      from public.course_lessons l
      where l.id = lesson_id
        and (
          public.is_admin()
          or (
            l.publication_status = 'published'
            and public.can_read_course_content(l.course_id)
          )
        )
    )
  );

create policy "Admins manage lesson resources"
  on public.lesson_resources for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Staff read own assignments"
  on public.course_staff for select
  using (user_id = auth.uid() or public.is_admin());

create policy "Admins manage course staff"
  on public.course_staff for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Learners read own enrolments"
  on public.course_enrolments for select
  using (
    user_id = auth.uid()
    or public.is_admin()
    or public.is_course_staff(course_id)
  );

create policy "Learners enrol in free published courses"
  on public.course_enrolments for insert
  with check (
    user_id = auth.uid()
    and status = 'active'
    and completed_at is null
    and last_lesson_id is null
    and exists (
      select 1
      from public.short_courses c
      where c.id = course_id
        and c.publication_status = 'published'
        and c.is_free = true
        and c.price_kobo = 0
        and c.coming_soon = false
    )
  );

create policy "Admins manage enrolments"
  on public.course_enrolments for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Learners read own lesson progress"
  on public.lesson_progress for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.course_enrolments e
      where e.id = enrolment_id
        and e.user_id = auth.uid()
    )
  );

create policy "Admins manage lesson progress"
  on public.lesson_progress for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins read assessments"
  on public.course_assessments for select
  using (public.is_admin() or public.is_course_staff(course_id));

create policy "Admins manage assessments"
  on public.course_assessments for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins read questions"
  on public.assessment_questions for select
  using (public.is_admin());

create policy "Admins manage questions"
  on public.assessment_questions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins read answer options"
  on public.assessment_options for select
  using (public.is_admin());

create policy "Admins manage answer options"
  on public.assessment_options for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Learners read own attempts"
  on public.assessment_attempts for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.course_enrolments e
      where e.id = enrolment_id
        and e.user_id = auth.uid()
    )
  );

create policy "Admins manage attempts"
  on public.assessment_attempts for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Learners read own responses"
  on public.assessment_responses for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.assessment_attempts at
      join public.course_enrolments e on e.id = at.enrolment_id
      where at.id = attempt_id
        and e.user_id = auth.uid()
    )
  );

create policy "Admins manage responses"
  on public.assessment_responses for all
  using (public.is_admin())
  with check (public.is_admin());

revoke all on function public.course_lessons_sync_course() from public;
revoke all on function public.is_course_staff(uuid) from public;
revoke all on function public.can_read_course_content(uuid) from public;
revoke all on function public.refresh_course_completion(uuid) from public;
revoke all on function public.record_lesson_visit(uuid) from public;
revoke all on function public.complete_lesson(uuid) from public;
revoke all on function public.get_learner_assessment(uuid) from public;
revoke all on function public.submit_assessment_attempt(uuid, jsonb) from public;
revoke all on function public.get_attempt_feedback(uuid) from public;

grant execute on function public.course_lessons_sync_course() to authenticated;
grant execute on function public.is_course_staff(uuid) to anon, authenticated;
grant execute on function public.can_read_course_content(uuid) to anon, authenticated;
grant execute on function public.refresh_course_completion(uuid) to authenticated;
grant execute on function public.record_lesson_visit(uuid) to authenticated;
grant execute on function public.complete_lesson(uuid) to authenticated;
grant execute on function public.get_learner_assessment(uuid) to authenticated;
grant execute on function public.submit_assessment_attempt(uuid, jsonb) to authenticated;
grant execute on function public.get_attempt_feedback(uuid) to authenticated;

grant select on public.short_courses to anon, authenticated;
grant insert, update, delete on public.short_courses to authenticated;

grant select, insert, update, delete on public.course_modules to authenticated;
grant select, insert, update, delete on public.course_lessons to authenticated;
grant select, insert, update, delete on public.lesson_resources to authenticated;
grant select, insert, update, delete on public.course_staff to authenticated;
grant select, insert, update, delete on public.course_enrolments to authenticated;
grant select, insert, update, delete on public.lesson_progress to authenticated;
grant select, insert, update, delete on public.course_assessments to authenticated;
grant select, insert, update, delete on public.assessment_questions to authenticated;
grant select, insert, update, delete on public.assessment_options to authenticated;
grant select, insert, update, delete on public.assessment_attempts to authenticated;
grant select, insert, update, delete on public.assessment_responses to authenticated;

revoke all on public.published_lesson_outlines from public, anon, authenticated;
revoke all on public.published_assessment_outlines from public, anon, authenticated;
grant select on public.published_lesson_outlines to anon, authenticated;
grant select on public.published_assessment_outlines to anon, authenticated;

grant all on public.short_courses to service_role;
grant all on public.course_modules to service_role;
grant all on public.course_lessons to service_role;
grant all on public.lesson_resources to service_role;
grant all on public.course_staff to service_role;
grant all on public.course_enrolments to service_role;
grant all on public.lesson_progress to service_role;
grant all on public.course_assessments to service_role;
grant all on public.assessment_questions to service_role;
grant all on public.assessment_options to service_role;
grant all on public.assessment_attempts to service_role;
grant all on public.assessment_responses to service_role;

-- Starter catalogue. AI Essentials is a free published pathway with written
-- lessons and no hosted video yet. The paid AI course stays in draft.
insert into public.short_courses (
  id, code, slug, title, pillar, summary, description, outcomes, audience,
  prerequisites, duration_label, estimated_minutes, price_kobo, is_free,
  delivery_format, instructor_name, instructor_bio, keywords,
  publication_status, coming_soon, certificate_enabled
) values (
  'a1e55000-0000-4000-8000-000000000001',
  'AI-ESS',
  'ai-essentials',
  'AI Essentials',
  'technology',
  'A free introduction to using AI tools carefully at work and in study.',
  'This short pathway explains what AI tools are good for, how to ask for a useful draft, and what you should check before you rely on an answer. It is the free introduction to ACTI''s AI courses. Further lessons can be added by staff. The walkthrough recording has not been linked yet; the written lesson stands on its own.',
  array[
    'Explain what an AI tool can and cannot do in everyday work.',
    'Write an instruction that names the task, the audience, and what done looks like.',
    'Check a draft before treating it as a decision.'
  ],
  'Students, job seekers, and small-business staff who want a plain-language start with AI tools.',
  'None. This is an introduction.',
  'About 30 minutes',
  30,
  0,
  true,
  'online',
  'ACTI short-course team',
  'ACTI tutors prepare these lessons. A named instructor profile can be added when the course team assigns one.',
  'artificial intelligence, AI, workplace, introduction, free',
  'published',
  false,
  true
);

insert into public.short_courses (
  id, code, slug, title, pillar, summary, description, outcomes, audience,
  prerequisites, duration_label, estimated_minutes, price_kobo, is_free,
  delivery_format, instructor_name, keywords, publication_status
) values (
  'a1e55000-0000-4000-8000-000000000002',
  'AI-WORK',
  'ai-for-work-and-business',
  'AI for Work and Business',
  'technology',
  'A paid flagship course on using AI in daily operations, customer communication, and small-business decisions.',
  'Draft catalogue record only. The fee, lessons, and assessments are not ready, and paid enrolment is not open.',
  array['Apply AI tools to routine business tasks with a human check on every result.'],
  'Staff and founders who already understand the ideas in AI Essentials.',
  'AI Essentials, or equivalent experience.',
  'To be confirmed',
  0,
  0,
  false,
  'online',
  'ACTI short-course team',
  'artificial intelligence, business, paid',
  'draft'
);

insert into public.course_modules (id, course_id, title, summary, sort_order) values
  (
    'a1e55000-0000-4000-8000-000000000011',
    'a1e55000-0000-4000-8000-000000000001',
    'Understanding AI at work',
    'What these tools do, and the checks that stay with you.',
    1
  );

insert into public.course_lessons (
  id, course_id, module_id, slug, title, summary, lesson_type, body,
  estimated_minutes, is_required, sort_order, publication_status, transcript
) values (
  'a1e55000-0000-4000-8000-000000000021',
  'a1e55000-0000-4000-8000-000000000001',
  'a1e55000-0000-4000-8000-000000000011',
  'what-ai-means-for-work',
  'What AI means for everyday work',
  'A plain-language definition and three checks before you use an AI draft.',
  'text',
  $lesson$
AI tools produce text, images, and suggestions by following patterns in data. They do not understand a workplace the way a person does, and they can sound sure of an answer that is wrong.

At work or in class, a useful tool can help you draft a message, summarise notes, or list options. You still decide what is accurate, fair, and safe to send.

Before you rely on a result:

• Check names, numbers, and dates against a source you trust.
• Leave private customer or student information out of the prompt unless your organisation has approved that tool.
• Treat the output as a draft, not a finished decision.

This lesson is text only. You do not need a video to complete it.
  $lesson$,
  10,
  true,
  1,
  'published',
  null
);

insert into public.course_lessons (
  id, course_id, module_id, slug, title, summary, lesson_type, body,
  estimated_minutes, is_required, sort_order, publication_status, transcript
) values (
  'a1e55000-0000-4000-8000-000000000022',
  'a1e55000-0000-4000-8000-000000000001',
  'a1e55000-0000-4000-8000-000000000011',
  'how-to-ask-for-a-useful-answer',
  'How to ask for a useful answer',
  'A short walkthrough of a clear instruction. The recording is not linked yet.',
  'text_video',
  $lesson$
A useful instruction tells the tool what to produce, who it is for, and what a finished answer includes.

Try this shape:

1. Task — "Draft a reply to a customer who asked when their order will arrive."
2. Audience — "Write it for a customer who is already unhappy."
3. Done — "Use five short sentences, apologise once, and do not invent a delivery date."

Then read the draft and replace anything you cannot stand behind. If you do not know the delivery date, say you will confirm it. Do not let the tool invent one.

The screen recording for this lesson has not been added. The steps above are the whole lesson, so you can finish it without waiting for a video.
  $lesson$,
  12,
  true,
  2,
  'published',
  'Transcript: name the task, the audience, and what a finished answer includes. Read the draft and remove any fact you cannot verify. The recording is not available yet.'
);

insert into public.course_assessments (
  id, course_id, module_id, title, instructions, pass_mark_percent,
  attempt_limit, is_required, sort_order, publication_status
) values (
  'a1e55000-0000-4000-8000-000000000031',
  'a1e55000-0000-4000-8000-000000000001',
  'a1e55000-0000-4000-8000-000000000011',
  'AI Essentials check',
  'Answer all three questions. You need 60% to pass, and you can try up to 3 times. The written lessons are enough; you do not need a video.',
  60,
  3,
  true,
  1,
  'published'
);

insert into public.assessment_questions (
  id, assessment_id, prompt, question_type, explanation, points, sort_order
) values
  (
    'a1e55000-0000-4000-8000-000000000041',
    'a1e55000-0000-4000-8000-000000000031',
    'When an AI tool drafts a message for you, what should you do before sending it?',
    'multiple_choice',
    'An AI draft can sound confident and still be wrong. Check names, numbers, and dates, and keep unapproved private information out of the prompt.',
    1,
    1
  ),
  (
    'a1e55000-0000-4000-8000-000000000042',
    'a1e55000-0000-4000-8000-000000000031',
    'It is safe to paste private customer or student records into any public AI tool.',
    'true_false',
    'Private records stay out of a public tool unless your organisation has approved that specific tool.',
    1,
    2
  ),
  (
    'a1e55000-0000-4000-8000-000000000043',
    'a1e55000-0000-4000-8000-000000000031',
    'Which instruction is most likely to produce a useful work answer?',
    'multiple_choice',
    'Name the task, who it is for, and what a finished answer includes. The tool drafts; you decide.',
    1,
    3
  );

insert into public.assessment_options (id, question_id, label, is_correct, sort_order) values
  ('a1e55000-0000-4000-8000-000000000101', 'a1e55000-0000-4000-8000-000000000041', 'Send it immediately so the work is faster.', false, 1),
  ('a1e55000-0000-4000-8000-000000000102', 'a1e55000-0000-4000-8000-000000000041', 'Check the facts and treat the draft as unfinished.', true, 2),
  ('a1e55000-0000-4000-8000-000000000103', 'a1e55000-0000-4000-8000-000000000041', 'Trust it because the wording sounds confident.', false, 3),
  ('a1e55000-0000-4000-8000-000000000104', 'a1e55000-0000-4000-8000-000000000041', 'Paste in private records so the draft has more detail.', false, 4),
  ('a1e55000-0000-4000-8000-000000000111', 'a1e55000-0000-4000-8000-000000000042', 'True', false, 1),
  ('a1e55000-0000-4000-8000-000000000112', 'a1e55000-0000-4000-8000-000000000042', 'False', true, 2),
  ('a1e55000-0000-4000-8000-000000000121', 'a1e55000-0000-4000-8000-000000000043', 'Write something.', false, 1),
  ('a1e55000-0000-4000-8000-000000000122', 'a1e55000-0000-4000-8000-000000000043', 'Name the task, who it is for, and what a finished answer includes.', true, 2),
  ('a1e55000-0000-4000-8000-000000000123', 'a1e55000-0000-4000-8000-000000000043', 'Ask it to make the final decision for you.', false, 3),
  ('a1e55000-0000-4000-8000-000000000124', 'a1e55000-0000-4000-8000-000000000043', 'Leave out the goal so the tool can be creative.', false, 4);
