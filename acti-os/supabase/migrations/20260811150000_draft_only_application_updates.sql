-- Applicants may only update their own applications while status is draft.
-- Admins retain full update access. Settlement uses the service role.

drop policy if exists "Users update own draft applications" on public.applications;

create policy "Users update own draft applications"
  on public.applications for update
  using (
    public.is_admin()
    or (auth.uid() = user_id and status = 'draft')
  )
  with check (
    public.is_admin()
    or (auth.uid() = user_id and status = 'draft')
  );

-- Applicants may only insert/delete documents while the application is draft.
drop policy if exists "Users insert own documents" on public.application_documents;
drop policy if exists "Users delete own documents" on public.application_documents;

create policy "Users insert own documents"
  on public.application_documents for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.applications a
      where a.id = application_id
        and a.user_id = auth.uid()
        and a.status = 'draft'
    )
  );

create policy "Users delete own documents"
  on public.application_documents for delete
  using (
    public.is_admin()
    or (
      auth.uid() = user_id
      and exists (
        select 1
        from public.applications a
        where a.id = application_id
          and a.user_id = auth.uid()
          and a.status = 'draft'
      )
    )
  );
