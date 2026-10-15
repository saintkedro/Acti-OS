-- Public confirmation of an issued short-course certificate.
-- Returns only the name, course, date, and code. Sample codes are never valid.

create or replace function public.verify_course_certificate(p_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_code text := upper(btrim(coalesce(p_code, '')));
  v_row public.course_certificates%rowtype;
begin
  if v_code = '' or v_code = 'SAMPLE' then
    return null;
  end if;

  if v_code !~ '^ACTI-[A-Z0-9]+(?:-[A-Z0-9]+)*$' then
    return null;
  end if;

  select * into v_row
  from public.course_certificates
  where code = v_code;

  if v_row.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'code', v_row.code,
    'learner_name', v_row.learner_name,
    'course_title', v_row.course_title,
    'issued_at', v_row.issued_at
  );
end;
$$;

revoke all on function public.verify_course_certificate(text) from public;
grant execute on function public.verify_course_certificate(text) to anon, authenticated;
