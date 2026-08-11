-- ACTI OS Phase 1 schema

create extension if not exists "pgcrypto";

-- Enums
create type public.user_role as enum ('applicant', 'student', 'admin');
create type public.application_status as enum (
  'draft',
  'submitted',
  'under_review',
  'offered',
  'rejected',
  'waitlisted',
  'accepted',
  'enrolled'
);
create type public.admission_decision_type as enum ('offered', 'rejected', 'waitlisted');
create type public.document_type as enum (
  'passport_photo',
  'national_id',
  'certificate',
  'transcript',
  'other'
);
create type public.fee_type as enum ('application_fee', 'acceptance_fee', 'tuition');
create type public.payment_status as enum ('pending', 'success', 'failed', 'abandoned');
create type public.programme_pillar as enum (
  'technology',
  'technical_vocational',
  'innovation_entrepreneurship'
);

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text,
  role public.user_role not null default 'applicant',
  student_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

-- Programmes
create table public.programmes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  pillar public.programme_pillar not null,
  description text not null default '',
  duration text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Fee schedules
create table public.fee_schedules (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid references public.programmes (id) on delete cascade,
  fee_type public.fee_type not null,
  amount_kobo integer not null check (amount_kobo > 0),
  currency text not null default 'NGN',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Allow global fees (programme_id null) alongside programme-specific fees
create unique index fee_schedules_programme_fee_unique
  on public.fee_schedules (coalesce(programme_id, '00000000-0000-0000-0000-000000000000'::uuid), fee_type);

-- Applications
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  programme_id uuid references public.programmes (id),
  status public.application_status not null default 'draft',
  -- Personal
  date_of_birth date,
  gender text,
  nationality text default 'Nigerian',
  state_of_origin text,
  lga text,
  address text,
  -- Academic
  highest_qualification text,
  previous_institution text,
  graduation_year integer,
  -- Meta
  personal_statement text,
  submitted_at timestamptz,
  enrolled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_user_id_idx on public.applications (user_id);
create index applications_status_idx on public.applications (status);

-- Application documents
create table public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  doc_type public.document_type not null,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

create index application_documents_application_id_idx on public.application_documents (application_id);

-- Admission decisions
create table public.admission_decisions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  decision public.admission_decision_type not null,
  notes text,
  decided_by uuid not null references public.profiles (id),
  decided_at timestamptz not null default now()
);

create index admission_decisions_application_id_idx on public.admission_decisions (application_id);

-- Payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  application_id uuid references public.applications (id) on delete set null,
  fee_type public.fee_type not null,
  amount_kobo integer not null check (amount_kobo > 0),
  currency text not null default 'NGN',
  status public.payment_status not null default 'pending',
  paystack_reference text not null unique,
  paystack_access_code text,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index payments_user_id_idx on public.payments (user_id);
create index payments_status_idx on public.payments (status);

-- Notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id);

-- Student ID sequence helper
create table public.student_id_counters (
  year integer primary key,
  last_value integer not null default 0
);

create or replace function public.generate_student_id()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  y integer := extract(year from now())::integer;
  next_val integer;
begin
  insert into public.student_id_counters (year, last_value)
  values (y, 1)
  on conflict (year) do update
    set last_value = public.student_id_counters.last_value + 1
  returning last_value into next_val;

  return format('ACTI/%s/%s', y, lpad(next_val::text, 5, '0'));
end;
$$;

-- Profile bootstrap on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'applicant')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger applications_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- Role helpers for RLS
create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.programmes enable row level security;
alter table public.fee_schedules enable row level security;
alter table public.applications enable row level security;
alter table public.application_documents enable row level security;
alter table public.admission_decisions enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.student_id_counters enable row level security;

-- Profiles policies
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "Admins update any profile"
  on public.profiles for update
  using (public.is_admin());

-- Programmes: public read active; admin write
create policy "Anyone can read active programmes"
  on public.programmes for select
  using (is_active = true or public.is_admin());

create policy "Admins manage programmes"
  on public.programmes for all
  using (public.is_admin())
  with check (public.is_admin());

-- Fee schedules
create policy "Authenticated read fee schedules"
  on public.fee_schedules for select
  to authenticated
  using (is_active = true or public.is_admin());

create policy "Admins manage fee schedules"
  on public.fee_schedules for all
  using (public.is_admin())
  with check (public.is_admin());

-- Applications
create policy "Users manage own applications"
  on public.applications for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users insert own applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

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

-- Documents
create policy "Users manage own documents"
  on public.application_documents for select
  using (auth.uid() = user_id or public.is_admin());

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

-- Decisions: applicants read own; admins write
create policy "Users read decisions on own applications"
  on public.admission_decisions for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );

create policy "Admins insert decisions"
  on public.admission_decisions for insert
  with check (public.is_admin());

-- Payments
create policy "Users read own payments"
  on public.payments for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users insert own pending payments"
  on public.payments for insert
  with check (auth.uid() = user_id and status = 'pending');

create policy "Admins update payments"
  on public.payments for update
  using (public.is_admin());

-- Notifications
create policy "Users read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Admins insert notifications"
  on public.notifications for insert
  with check (public.is_admin() or auth.uid() = user_id);

-- Storage bucket for application documents
insert into storage.buckets (id, name, public)
values ('application-docs', 'application-docs', false)
on conflict (id) do nothing;

create policy "Users upload own application docs"
  on storage.objects for insert
  with check (
    bucket_id = 'application-docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users read own application docs"
  on storage.objects for select
  using (
    bucket_id = 'application-docs'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_admin()
    )
  );

create policy "Users delete own application docs"
  on storage.objects for delete
  using (
    bucket_id = 'application-docs'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_admin()
    )
  );

-- Seed programmes from institutional profile
insert into public.programmes (code, name, pillar, description, duration) values
  ('SDV', 'Software Development', 'technology', 'Build modern software applications with industry-relevant tools and practices.', '1–2 years'),
  ('AIE', 'Artificial Intelligence and Emerging Technologies', 'technology', 'Explore AI, machine learning, and emerging digital technologies.', '1–2 years'),
  ('CYB', 'Cybersecurity', 'technology', 'Protect systems, networks, and data against modern threats.', '1–2 years'),
  ('DDS', 'Data and Digital Systems', 'technology', 'Work with data pipelines, analytics, and digital systems.', '1–2 years'),
  ('ICT', 'ICT and Digital Skills', 'technology', 'Foundational ICT competence for the digital workplace.', '6–12 months'),
  ('CRM', 'Computer Repairs and Maintenance', 'technical_vocational', 'Diagnose, repair, and maintain computer hardware and systems.', '6–12 months'),
  ('EIM', 'Electrical Installation and Maintenance', 'technical_vocational', 'Hands-on electrical installation and maintenance skills.', '6–12 months'),
  ('HEA', 'Home Electrical Appliances Repairs and Maintenance', 'technical_vocational', 'Service and repair household electrical appliances.', '6–12 months'),
  ('RET', 'Renewable Energy Technologies', 'technical_vocational', 'Solar and renewable energy installation and maintenance.', '6–12 months'),
  ('NSQ', 'National Skills Qualification (NSQ) Programmes', 'technical_vocational', 'NBTE-aligned national skills qualification pathways.', 'Variable'),
  ('BED', 'Business and Enterprise Development', 'innovation_entrepreneurship', 'Build and grow sustainable enterprises.', '6–12 months'),
  ('IPD', 'Innovation and Product Design', 'innovation_entrepreneurship', 'Design products and prototypes that solve real problems.', '6–12 months'),
  ('DEN', 'Digital Entrepreneurship', 'innovation_entrepreneurship', 'Launch and scale digital ventures.', '6–12 months'),
  ('SBD', 'Small Business and Startup Development', 'innovation_entrepreneurship', 'Practical startup building for local and national markets.', '6–12 months');

-- Default global fees (amounts in kobo: ₦5,000 / ₦25,000 / ₦50,000)
insert into public.fee_schedules (programme_id, fee_type, amount_kobo) values
  (null, 'application_fee', 500000),
  (null, 'acceptance_fee', 2500000),
  (null, 'tuition', 5000000);
