-- Certificate of completion for a short course.
-- Issued once, by the server, only after the current requirements are met.
-- The record is an ACTI certificate of completion, not a diploma.

create table public.course_certificates (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null unique references public.course_enrolments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.short_courses (id) on delete cascade,
  code text not null unique,
  learner_name text not null,
  course_title text not null,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint course_certificates_code_format check (code ~ '^ACTI-[A-Z0-9]+(?:-[A-Z0-9]+)*$'),
  constraint course_certificates_name_len check (char_length(learner_name) between 1 and 200),
  constraint course_certificates_title_len check (char_length(course_title) between 1 and 160)
);

create index course_certificates_user_idx on public.course_certificates (user_id);

create or replace function public.course_requirements_met(p_enrolment_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_required_lessons integer;
  v_done_lessons integer;
  v_required_assessments integer;
  v_passed_assessments integer;
begin
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

  return (v_required_lessons + v_required_assessments) > 0
    and v_done_lessons = v_required_lessons
    and v_passed_assessments = v_required_assessments;
end;
$$;

create or replace function public.issue_course_certificate(p_enrolment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_enrolment public.course_enrolments%rowtype;
  v_course public.short_courses%rowtype;
  v_name text;
  v_existing public.course_certificates%rowtype;
  v_code text;
  v_attempt integer := 0;
begin
  if v_uid is null then
    raise exception 'Not signed in';
  end if;

  select * into v_enrolment
  from public.course_enrolments
  where id = p_enrolment_id;

  if v_enrolment.id is null then
    raise exception 'Enrolment not found';
  end if;

  if v_enrolment.user_id is distinct from v_uid and not public.is_admin() then
    raise exception 'Not allowed';
  end if;

  if v_enrolment.status = 'withdrawn' then
    raise exception 'Enrolment is not active';
  end if;

  select * into v_course
  from public.short_courses
  where id = v_enrolment.course_id;

  if v_course.id is null then
    raise exception 'Course not found';
  end if;

  if not v_course.certificate_enabled then
    return null;
  end if;

  if not public.course_requirements_met(p_enrolment_id) then
    raise exception 'Completion requirements are not met';
  end if;

  select * into v_existing
  from public.course_certificates
  where enrolment_id = p_enrolment_id;

  if v_existing.id is not null then
    return jsonb_build_object(
      'id', v_existing.id,
      'code', v_existing.code,
      'learner_name', v_existing.learner_name,
      'course_title', v_existing.course_title,
      'issued_at', v_existing.issued_at
    );
  end if;

  select coalesce(nullif(btrim(full_name), ''), nullif(btrim(email), ''), 'ACTI learner')
  into v_name
  from public.profiles
  where id = v_enrolment.user_id;

  if v_name is null or char_length(v_name) > 200 then
    v_name := left(coalesce(v_name, 'ACTI learner'), 200);
  end if;

  loop
    v_attempt := v_attempt + 1;
    v_code := 'ACTI-' || v_course.code || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

    begin
      insert into public.course_certificates (
        enrolment_id, user_id, course_id, code, learner_name, course_title, issued_at
      ) values (
        v_enrolment.id,
        v_enrolment.user_id,
        v_course.id,
        v_code,
        v_name,
        v_course.title,
        coalesce(v_enrolment.completed_at, now())
      )
      returning * into v_existing;
      exit;
    exception
      when unique_violation then
        select * into v_existing
        from public.course_certificates
        where enrolment_id = p_enrolment_id;

        if v_existing.id is not null then
          exit;
        end if;

        if v_attempt >= 5 then
          raise exception 'Certificate could not be issued';
        end if;
    end;
  end loop;

  return jsonb_build_object(
    'id', v_existing.id,
    'code', v_existing.code,
    'learner_name', v_existing.learner_name,
    'course_title', v_existing.course_title,
    'issued_at', v_existing.issued_at
  );
end;
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

  v_done := public.course_requirements_met(p_enrolment_id);

  if v_done then
    update public.course_enrolments
    set status = 'completed',
        completed_at = coalesce(completed_at, now())
    where id = p_enrolment_id
      and status in ('active', 'completed');

    perform public.issue_course_certificate(p_enrolment_id);
  else
    update public.course_enrolments
    set status = 'active',
        completed_at = null
    where id = p_enrolment_id
      and status = 'completed';
  end if;
end;
$$;

alter table public.course_certificates enable row level security;

create policy "Learners read own certificates"
  on public.course_certificates for select
  using (public.is_admin() or user_id = auth.uid());

revoke all on function public.course_requirements_met(uuid) from public;
revoke all on function public.issue_course_certificate(uuid) from public;

grant execute on function public.issue_course_certificate(uuid) to authenticated;

grant select on public.course_certificates to authenticated;
grant all on public.course_certificates to service_role;
