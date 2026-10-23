-- Dakshinvedha Abroad Solutions — full portal schema
-- Run once in Supabase: SQL Editor → New query → paste this file → Run.
-- Safe to run again. It does not insert sample students, applications, or universities.
--
-- Signup is students only. The trigger below ignores any role sent from the browser
-- and always creates a student. Admin, B2B owner, B2B team member, and agent
-- accounts are created by an admin (see the bootstrap note at the bottom).
--
-- Passwords live in auth.users. Do not add a password column to these tables.
-- The browser uses the anon key. Server routes under src/app/api/auth read
-- SUPABASE_SERVICE_ROLE_KEY. Never expose that key with a NEXT_PUBLIC_ name.
--
-- The institutions and courses tables match the catalog client already in the app.
-- Students, applications, partners, notices, mail, chat, and the other portal
-- records are stored in the tables below. Nested screen data is also kept in
-- a payload column so the portal can round-trip a full record.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.tracking_counters (
  kind text not null,
  year int not null,
  last_value int not null default 10000,
  primary key (kind, year)
);

create or replace function public.next_tracking_id(p_kind text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  y int := extract(year from now())::int;
  n int;
begin
  if p_kind not in ('APP', 'STU', 'B2B', 'AGN', 'TEM', 'ADM', 'DOC', 'PAY', 'NTC', 'ENQ') then
    raise exception 'Unknown tracking kind %', p_kind;
  end if;
  insert into public.tracking_counters as c (kind, year, last_value)
  values (p_kind, y, 10001)
  on conflict (kind, year) do update
    set last_value = c.last_value + 1
  returning last_value into n;
  return format('DV-%s-%s-%s', p_kind, y, lpad(n::text, 5, '0'));
end;
$$;

revoke all on function public.next_tracking_id(text) from public;
grant execute on function public.next_tracking_id(text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Login profile. One row per auth user. Role is never chosen at public signup.
-- partner  = B2B owner
-- team     = B2B staff of that owner (not an agent)
-- agent    = Dakshinvedha counselor
-- admin    = portal staff
-- student  = the only role public signup can create
-- ---------------------------------------------------------------------------

-- Dual OTP at student signup. Service role only. Browser never reads this table.
create table if not exists public.otp_challenges (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  phone text not null,
  email_otp_hash text not null,
  sms_session_id text not null default '',
  attempts int not null default 0,
  verified boolean not null default false,
  consumed boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.otp_challenges enable row level security;
revoke all on table public.otp_challenges from anon, authenticated;
grant all on table public.otp_challenges to service_role;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  phone text not null default '',
  role text not null default 'student'
    check (role in ('student', 'partner', 'team', 'agent', 'admin')),
  status text not null default 'Active'
    check (status in ('Active', 'Suspended')),
  tracking_id text unique,
  partner_id uuid,
  member_kind text check (member_kind in ('owner', 'team')),
  staff_title text,
  department text,
  allowed_features jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- B2B organization. The owner is a profile with role = partner.
-- ---------------------------------------------------------------------------

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  tracking_id text not null unique,
  owner_profile_id uuid not null unique references public.profiles (id) on delete cascade,
  contact_name text not null default '',
  phone text not null default '',
  email text not null default '',
  account_status text not null default 'Pending Profile'
    check (account_status in ('Active', 'Pending Profile', 'Under Verification', 'Suspended')),
  profile_completed boolean not null default false,
  verification_status text not null default 'Pending'
    check (verification_status in ('Pending', 'Under Review', 'Verified', 'Rejected')),
  created_by uuid references public.profiles (id),
  organization_name text not null default '',
  organization_email text not null default '',
  organization_phone text not null default '',
  incorporation_number text not null default '',
  registration_number text not null default '',
  aadhaar_number text not null default '',
  aadhaar_file text not null default '',
  aadhaar_status text not null default 'Pending'
    check (aadhaar_status in ('Pending', 'Under Review', 'Verified', 'Rejected')),
  pan_number text not null default '',
  pan_file text not null default '',
  pan_status text not null default 'Pending'
    check (pan_status in ('Pending', 'Under Review', 'Verified', 'Rejected')),
  org_pan_number text not null default '',
  org_pan_file text not null default '',
  org_pan_status text not null default 'Pending'
    check (org_pan_status in ('Pending', 'Under Review', 'Verified', 'Rejected')),
  org_certificate_file text not null default '',
  org_certificate_status text not null default 'Pending'
    check (org_certificate_status in ('Pending', 'Under Review', 'Verified', 'Rejected')),
  gst_number text not null default '',
  gst_certificate_file text not null default '',
  gst_certificate_status text not null default 'Pending'
    check (gst_certificate_status in ('Pending', 'Under Review', 'Verified', 'Rejected')),
  bank_ifsc text not null default '',
  bank_name text not null default '',
  bank_account_number text not null default '',
  bank_swift text not null default '',
  bank_account_holder text not null default '',
  bank_status text not null default 'Pending'
    check (bank_status in ('Pending', 'Verified', 'Action Required')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  drop constraint if exists profiles_partner_id_fkey;
alter table public.profiles
  add constraint profiles_partner_id_fkey
  foreign key (partner_id) references public.partners (id) on delete set null;

-- A B2B owner contacts admin. This is not a signup.
create table if not exists public.b2b_access_requests (
  id uuid primary key default gen_random_uuid(),
  tracking_id text not null unique default public.next_tracking_id('ENQ'),
  organization_name text not null,
  contact_name text not null,
  phone text not null default '',
  email text not null,
  message text not null default '',
  status text not null default 'Pending'
    check (status in ('Pending', 'Approved', 'Rejected')),
  partner_id uuid references public.partners (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Student profile. Created only from the student signup trigger.
-- ---------------------------------------------------------------------------

create table if not exists public.students (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  tracking_id text not null unique,
  first_name text not null default '',
  middle_name text not null default '',
  last_name text not null default '',
  alternate_mobile text not null default '',
  account_status text not null default 'Active'
    check (account_status in ('Active', 'Pending Verification', 'Suspended')),
  onboarding_completed boolean not null default false,
  profile_completion int not null default 25,
  dob date,
  gender text not null default '',
  nationality text not null default '',
  country_of_residence text not null default '',
  address_street text not null default '',
  address_city text not null default '',
  address_state text not null default '',
  address_postal_code text not null default '',
  profile_photo_path text not null default '',
  has_passport text not null default 'NO' check (has_passport in ('YES', 'NO')),
  passport_number text not null default '',
  passport_country text not null default '',
  passport_date_of_issue date,
  passport_expiry date,
  passport_place_of_issue text not null default '',
  passport_file text not null default '',
  passport_status text not null default 'Passport Pending'
    check (passport_status in ('Verified', 'Under Review', 'Passport Pending', 'Not Uploaded')),
  tests_status text not null default 'PLANNING TO TAKE'
    check (tests_status in ('YES', 'NO', 'PLANNING TO TAKE')),
  preferred_study_level text not null default 'Postgraduate'
    check (preferred_study_level in ('Undergraduate', 'Postgraduate', 'Doctorate', 'Other')),
  preferred_countries text[] not null default '{}',
  preferred_intake text not null default '',
  preferred_course_subject text not null default '',
  preferred_university text not null default '',
  budget_range text not null default '',
  scholarship_required text not null default 'NO' check (scholarship_required in ('YES', 'NO')),
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_education (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (profile_id) on delete cascade,
  level text not null check (level in ('10th', '12th', 'Diploma', 'Bachelor', 'Master', 'Other')),
  institution_name text not null default '',
  board_or_university text not null default '',
  country text not null default '',
  stream text not null default '',
  degree text not null default '',
  course text not null default '',
  specialization text not null default '',
  start_year text not null default '',
  pass_out_year text not null default '',
  percentage_or_cgpa text not null default '',
  cgpa_scale text not null default '',
  english_marks text not null default '',
  max_english_marks text not null default '',
  has_backlogs boolean not null default false,
  number_of_backlogs int not null default 0,
  active_backlogs int not null default 0,
  verification_status text not null default 'Pending'
    check (verification_status in ('Pending', 'Verified', 'Flagged')),
  admin_feedback text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.student_tests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (profile_id) on delete cascade,
  test_type text not null check (test_type in ('IELTS', 'TOEFL', 'PTE', 'Duolingo', 'GRE', 'GMAT', 'Other')),
  test_date date,
  overall_score text not null default '',
  sub_scores jsonb not null default '{}'::jsonb,
  report_path text not null default '',
  status text not null default 'Pending'
    check (status in ('Uploaded', 'Verified', 'Pending')),
  created_at timestamptz not null default now()
);

create table if not exists public.student_documents (
  id uuid primary key default gen_random_uuid(),
  tracking_id text not null unique default public.next_tracking_id('DOC'),
  student_id uuid not null references public.students (profile_id) on delete cascade,
  category text not null,
  title text not null default '',
  file_name text not null default '',
  file_size text not null default '',
  storage_path text not null default '',
  status text not null default 'Not Uploaded'
    check (status in ('Not Uploaded', 'Uploaded', 'Under Review', 'Verified', 'Rejected', 'Re-upload Required')),
  rejection_reason text not null default '',
  action_required text not null default '',
  uploaded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (profile_id) on delete cascade,
  author_id uuid references public.profiles (id),
  author_name text not null default '',
  note text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Institutions and courses. Column names match src/lib/catalog.ts.
-- ---------------------------------------------------------------------------

create table if not exists public.institutions (
  id text primary key,
  name text not null,
  country text not null,
  city text not null,
  logo text not null default '',
  image text not null default '',
  website text not null default '',
  about text not null default '',
  intakes text[] not null default '{}',
  representative jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id text primary key,
  university_id text not null references public.institutions (id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Applications. cams_id is the DV-APP tracking id shown in the portal.
-- Timeline rows are the 11 tracker stages, separate from primary_status.
-- ---------------------------------------------------------------------------

create table if not exists public.applications (
  cams_id text primary key,
  student_id uuid not null references public.students (profile_id) on delete cascade,
  institution_id text references public.institutions (id) on delete set null,
  course_id text references public.courses (id) on delete set null,
  primary_status text not null default 'Application Submitted'
    check (primary_status in (
      'Draft', 'Application Submitted', 'Under Review', 'Submitted to University',
      'Offer Issued', 'Payment Pending', 'Payment Done', 'CAS Processing',
      'CAS Issued', 'Visa Processing', 'Completed', 'Closed'
    )),
  secondary_status text not null default 'Documents Pending'
    check (secondary_status in (
      'Documents Pending', 'Documents Verified', 'Conditional Offer', 'Unconditional Offer',
      'Deposit Pending', 'Deposit Paid', 'Commission Pending', 'Commission Processing', 'Commission Paid'
    )),
  counselor_name text not null default '',
  agent_profile_id uuid references public.profiles (id) on delete set null,
  partner_id uuid references public.partners (id) on delete set null,
  intake text not null default '',
  gross_tuition text not null default '',
  scholarship text not null default '',
  deposit_paid text not null default '',
  net_balance_due text not null default '',
  payment_status text not null default 'Pending',
  commission_amount text not null default '',
  commission_eligible_amount text not null default '',
  commission_expected text not null default '',
  commission_status text not null default 'Pending'
    check (commission_status in ('Pending', 'Claimed', 'Approved', 'Paid')),
  commission_invoice_number text not null default '',
  commission_paid_date date,
  commission_reference text not null default '',
  english_test_type text not null default 'Other'
    check (english_test_type in ('IELTS', 'TOEFL', 'PTE', 'Duolingo', 'English waiver', 'Other')),
  english_overall text not null default '',
  english_reading text not null default '',
  english_writing text not null default '',
  english_listening text not null default '',
  english_speaking text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.application_qualifications (
  id uuid primary key default gen_random_uuid(),
  cams_id text not null references public.applications (cams_id) on delete cascade,
  highest_qualification text not null default '',
  institution text not null default '',
  course text not null default '',
  year_completed text not null default '',
  grade_percentage text not null default ''
);

create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  tracking_id text not null unique default public.next_tracking_id('DOC'),
  cams_id text not null references public.applications (cams_id) on delete cascade,
  category text not null,
  file_name text not null default '',
  file_size text not null default '',
  storage_path text not null default '',
  progress int not null default 0,
  status text not null default 'Uploaded'
    check (status in ('Uploading', 'Uploaded', 'Verified', 'Action Required')),
  created_at timestamptz not null default now()
);

create table if not exists public.application_timeline (
  id uuid primary key default gen_random_uuid(),
  cams_id text not null references public.applications (cams_id) on delete cascade,
  stage_order int not null check (stage_order between 1 and 11),
  status text not null,
  event_date date,
  description text not null default '',
  state text not null default 'pending'
    check (state in ('completed', 'current', 'pending', 'not_applicable')),
  unique (cams_id, stage_order)
);

create table if not exists public.application_notes (
  id uuid primary key default gen_random_uuid(),
  cams_id text not null references public.applications (cams_id) on delete cascade,
  author_id uuid references public.profiles (id),
  author_name text not null default '',
  note text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Notices, mail, chat, notifications, finance, vouchers, enquiries, VAS
-- Chat speaker role (agent / university / support) is not the portal login role.
-- ---------------------------------------------------------------------------

create table if not exists public.notices (
  id text primary key,
  title text not null,
  institution_id text references public.institutions (id) on delete set null,
  university_name text not null default '',
  country text not null default '',
  category text not null
    check (category in ('Admissions', 'Scholarship', 'Deadline', 'Requirements', 'Campus Update')),
  description text not null default '',
  full_content text not null default '',
  attachment_name text not null default '',
  attachment_size text not null default '',
  attachment_path text not null default '',
  is_urgent boolean not null default false,
  published_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references public.profiles (id) on delete cascade,
  title text not null,
  message text not null default '',
  kind text not null default 'system'
    check (kind in ('urgent', 'offer', 'cas', 'finance', 'deadline', 'document', 'system')),
  is_read boolean not null default false,
  cams_id text references public.applications (cams_id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.mails (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  sender_name text not null default '',
  sender_email text not null default '',
  subject text not null default '',
  snippet text not null default '',
  body text not null default '',
  folder text not null default 'inbox'
    check (folder in ('inbox', 'sent', 'draft', 'important', 'archived')),
  is_read boolean not null default false,
  is_starred boolean not null default false,
  attachment_name text not null default '',
  attachment_size text not null default '',
  attachment_path text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles (id) on delete set null,
  participant_name text not null default '',
  participant_role text not null default '',
  organization text not null default '',
  avatar text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_participants (
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  unread_count int not null default 0,
  primary key (conversation_id, profile_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  sender_name text not null default '',
  speaker_role text not null default 'support'
    check (speaker_role in ('agent', 'university', 'support')),
  body text not null default '',
  attachment_path text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete set null,
  code text not null unique,
  voucher_type text not null,
  amount text not null default '',
  status text not null default 'Available'
    check (status in ('Available', 'Redeemed', 'Expired')),
  used_by text not null default '',
  purchased_at timestamptz not null default now()
);

create table if not exists public.commission_ledger (
  id uuid primary key default gen_random_uuid(),
  tracking_id text not null unique default public.next_tracking_id('PAY'),
  partner_id uuid references public.partners (id) on delete cascade,
  cams_id text references public.applications (cams_id) on delete set null,
  description text not null default '',
  credit numeric(14, 2) not null default 0,
  debit numeric(14, 2) not null default 0,
  balance numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  tracking_id text not null unique default public.next_tracking_id('ENQ'),
  submitted_by uuid references public.profiles (id) on delete set null,
  country text not null,
  course_type text not null default '',
  intake text not null default '',
  status text not null default 'Open' check (status in ('Open', 'In Review', 'Closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.vas_services (
  id text primary key,
  name text not null unique,
  description text not null default '',
  commission_note text not null default ''
);

create table if not exists public.vas_requests (
  id uuid primary key default gen_random_uuid(),
  service_id text not null references public.vas_services (id),
  requested_by uuid not null references public.profiles (id) on delete cascade,
  student_id uuid references public.students (profile_id) on delete set null,
  cams_id text references public.applications (cams_id) on delete set null,
  notes text not null default '',
  status text not null default 'Submitted'
    check (status in ('Submitted', 'In Progress', 'Completed', 'Cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.vas_services (id, name, description, commission_note) values
  ('vas-acc', 'Accommodation', 'Student rooms and studios near partner campuses.', 'Per booking'),
  ('vas-loan', 'Education Loan', 'Collateral and non-collateral study loans.', 'Percent of sanctioned loan'),
  ('vas-forex', 'Forex', 'Tuition remittance and student travel cards.', 'Per transaction'),
  ('vas-sim', 'SIM Card', 'Arrival SIM for the study country.', 'Per activation'),
  ('vas-travel', 'Travel Assistance', 'Flights and arrival travel.', 'Per booking'),
  ('vas-insurance', 'Insurance', 'Student medical and travel insurance.', 'Per policy'),
  ('vas-visa', 'Visa Support', 'Visa file preparation alongside the application.', 'Per file'),
  ('vas-pickup', 'Airport Pickup', 'Arrival pickup from the airport.', 'Per pickup')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Role rules. Public signup cannot become staff. Agents are not B2B team.
-- A B2B owner can have at most 5 team members.
-- ---------------------------------------------------------------------------

create or replace function public.enforce_profile_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text;
  team_count int;
begin
  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    -- SQL Editor has no portal user. That is how the first admin is promoted.
    -- A signed-in student, partner, team member, or agent cannot change a role.
    if auth.uid() is not null and auth.role() is distinct from 'service_role' then
      select role into actor_role from public.profiles where id = auth.uid();
      if actor_role is distinct from 'admin' then
        raise exception 'Only an admin can change a portal role';
      end if;
    end if;
  end if;

  if new.role = 'agent' and new.partner_id is not null then
    raise exception 'An agent is not a B2B team member';
  end if;

  if new.role = 'team' and new.partner_id is null then
    raise exception 'A team member must belong to a B2B organization';
  end if;

  if new.role = 'partner' then
    new.member_kind = 'owner';
  elsif new.role = 'team' then
    new.member_kind = 'team';
  else
    new.member_kind = null;
  end if;

  if new.role = 'team' then
    select count(*) into team_count
    from public.profiles
    where partner_id = new.partner_id
      and role = 'team'
      and id <> new.id;
    if team_count >= 5 then
      raise exception 'A B2B owner can have at most 5 team members';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_enforce_rules on public.profiles;
create trigger profiles_enforce_rules
  before insert or update on public.profiles
  for each row execute function public.enforce_profile_rules();

-- New auth user → student profile + student row. Metadata role is ignored.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
  stu_code text;
begin
  display_name := coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1));
  stu_code := public.next_tracking_id('STU');

  insert into public.profiles (id, email, full_name, phone, role, status, tracking_id)
  values (
    new.id,
    coalesce(new.email, ''),
    display_name,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'student',
    'Active',
    stu_code
  );

  insert into public.students (profile_id, tracking_id, first_name, last_name)
  values (
    new.id,
    stu_code,
    split_part(display_name, ' ', 1),
    coalesce(nullif(regexp_replace(display_name, '^\S+\s*', ''), ''), '')
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin-only role change after the person already has an auth user.
create or replace function public.set_portal_role(
  target_user uuid,
  new_role text,
  new_partner uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text;
  new_code text;
begin
  select role into actor_role from public.profiles where id = auth.uid();
  if actor_role is distinct from 'admin' then
    raise exception 'Only an admin can assign portal roles';
  end if;
  if new_role not in ('student', 'partner', 'team', 'agent', 'admin') then
    raise exception 'Unknown role %', new_role;
  end if;

  new_code := case new_role
    when 'partner' then public.next_tracking_id('B2B')
    when 'team' then public.next_tracking_id('TEM')
    when 'agent' then public.next_tracking_id('AGN')
    when 'admin' then public.next_tracking_id('ADM')
    else null
  end;

  update public.profiles
  set
    role = new_role,
    partner_id = case when new_role in ('partner', 'team') then new_partner else null end,
    tracking_id = coalesce(new_code, tracking_id)
  where id = target_user;
end;
$$;

revoke all on function public.set_portal_role(uuid, text, uuid) from public;
grant execute on function public.set_portal_role(uuid, text, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

drop trigger if exists institutions_updated_at on public.institutions;
create trigger institutions_updated_at before update on public.institutions
  for each row execute function public.set_updated_at();
drop trigger if exists courses_updated_at on public.courses;
create trigger courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
drop trigger if exists partners_updated_at on public.partners;
create trigger partners_updated_at before update on public.partners
  for each row execute function public.set_updated_at();
drop trigger if exists students_updated_at on public.students;
create trigger students_updated_at before update on public.students
  for each row execute function public.set_updated_at();
drop trigger if exists applications_updated_at on public.applications;
create trigger applications_updated_at before update on public.applications
  for each row execute function public.set_updated_at();
drop trigger if exists requests_updated_at on public.b2b_access_requests;
create trigger requests_updated_at before update on public.b2b_access_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Access helpers. security definer avoids row-level-security recursion.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'Active'
  );
$$;

create or replace function public.my_partner_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select partner_id from public.profiles
  where id = auth.uid() and role in ('partner', 'team') and status = 'Active';
$$;

create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and status = 'Active';
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'Active'
      and staff_title = 'Super Admin'
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_super_admin() from public;
revoke all on function public.my_partner_id() from public;
revoke all on function public.my_role() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.my_partner_id() to authenticated;
grant execute on function public.my_role() to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.partners enable row level security;
alter table public.b2b_access_requests enable row level security;
alter table public.students enable row level security;
alter table public.student_education enable row level security;
alter table public.student_tests enable row level security;
alter table public.student_documents enable row level security;
alter table public.student_notes enable row level security;
alter table public.institutions enable row level security;
alter table public.courses enable row level security;
alter table public.applications enable row level security;
alter table public.application_qualifications enable row level security;
alter table public.application_documents enable row level security;
alter table public.application_timeline enable row level security;
alter table public.application_notes enable row level security;
alter table public.notices enable row level security;
alter table public.notifications enable row level security;
alter table public.mails enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_participants enable row level security;
alter table public.chat_messages enable row level security;
alter table public.vouchers enable row level security;
alter table public.commission_ledger enable row level security;
alter table public.enquiries enable row level security;
alter table public.vas_services enable row level security;
alter table public.vas_requests enable row level security;
alter table public.tracking_counters enable row level security;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or (partner_id is not null and partner_id = public.my_partner_id())
  );
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- partners
drop policy if exists partners_select on public.partners;
create policy partners_select on public.partners for select to authenticated
  using (public.is_admin() or id = public.my_partner_id() or owner_profile_id = auth.uid());
drop policy if exists partners_write_admin on public.partners;
create policy partners_write_admin on public.partners for insert to authenticated
  with check (public.is_admin());
drop policy if exists partners_update on public.partners;
create policy partners_update on public.partners for update to authenticated
  using (public.is_admin() or owner_profile_id = auth.uid())
  with check (public.is_admin() or owner_profile_id = auth.uid());

-- B2B contact form: anyone may submit. Only admin reads and decides.
drop policy if exists b2b_request_insert on public.b2b_access_requests;
create policy b2b_request_insert on public.b2b_access_requests for insert to anon, authenticated
  with check (status = 'Pending');
drop policy if exists b2b_request_admin on public.b2b_access_requests;
create policy b2b_request_admin on public.b2b_access_requests for select to authenticated
  using (public.is_admin());
drop policy if exists b2b_request_admin_update on public.b2b_access_requests;
create policy b2b_request_admin_update on public.b2b_access_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- students and their records
drop policy if exists students_select on public.students;
create policy students_select on public.students for select to authenticated
  using (
    profile_id = auth.uid()
    or public.is_admin()
    or public.my_role() = 'agent'
    or exists (
      select 1 from public.applications a
      where a.student_id = students.profile_id
        and a.partner_id = public.my_partner_id()
    )
  );
drop policy if exists students_update on public.students;
create policy students_update on public.students for update to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

drop policy if exists education_all on public.student_education;
create policy education_all on public.student_education for all to authenticated
  using (student_id = auth.uid() or public.is_admin())
  with check (student_id = auth.uid() or public.is_admin());
drop policy if exists education_read_staff on public.student_education;
create policy education_read_staff on public.student_education for select to authenticated
  using (public.my_role() in ('agent', 'partner', 'team') or public.is_admin() or student_id = auth.uid());

drop policy if exists tests_all on public.student_tests;
create policy tests_all on public.student_tests for all to authenticated
  using (student_id = auth.uid() or public.is_admin())
  with check (student_id = auth.uid() or public.is_admin());
drop policy if exists tests_read_staff on public.student_tests;
create policy tests_read_staff on public.student_tests for select to authenticated
  using (public.my_role() in ('agent', 'partner', 'team') or public.is_admin() or student_id = auth.uid());

drop policy if exists docs_all on public.student_documents;
create policy docs_all on public.student_documents for all to authenticated
  using (student_id = auth.uid() or public.is_admin())
  with check (student_id = auth.uid() or public.is_admin());
drop policy if exists docs_read_staff on public.student_documents;
create policy docs_read_staff on public.student_documents for select to authenticated
  using (public.my_role() in ('agent', 'partner', 'team') or public.is_admin() or student_id = auth.uid());

drop policy if exists student_notes_read on public.student_notes;
create policy student_notes_read on public.student_notes for select to authenticated
  using (student_id = auth.uid() or public.is_admin() or public.my_role() = 'agent');
drop policy if exists student_notes_write on public.student_notes;
create policy student_notes_write on public.student_notes for insert to authenticated
  with check (public.is_admin() or public.my_role() = 'agent' or student_id = auth.uid());

-- catalog: anyone can browse. Admin writes in production.
drop policy if exists catalog_read_institutions on public.institutions;
drop policy if exists catalog_write_institutions on public.institutions;
drop policy if exists catalog_read_courses on public.courses;
drop policy if exists catalog_write_courses on public.courses;
create policy catalog_read_institutions on public.institutions for select to anon, authenticated using (true);
create policy catalog_read_courses on public.courses for select to anon, authenticated using (true);
create policy catalog_admin_write_institutions on public.institutions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy catalog_admin_write_courses on public.courses for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- applications
drop policy if exists applications_select on public.applications;
create policy applications_select on public.applications for select to authenticated
  using (
    student_id = auth.uid()
    or public.is_admin()
    or agent_profile_id = auth.uid()
    or (partner_id is not null and partner_id = public.my_partner_id())
  );
drop policy if exists applications_insert on public.applications;
create policy applications_insert on public.applications for insert to authenticated
  with check (
    public.is_admin()
    or student_id = auth.uid()
    or (partner_id is not null and partner_id = public.my_partner_id())
  );
drop policy if exists applications_update on public.applications;
create policy applications_update on public.applications for update to authenticated
  using (
    public.is_admin()
    or agent_profile_id = auth.uid()
    or (partner_id is not null and partner_id = public.my_partner_id())
  )
  with check (
    public.is_admin()
    or agent_profile_id = auth.uid()
    or (partner_id is not null and partner_id = public.my_partner_id())
  );

drop policy if exists app_child_select on public.application_qualifications;
create policy app_child_select on public.application_qualifications for select to authenticated
  using (exists (
    select 1 from public.applications a
    where a.cams_id = application_qualifications.cams_id
      and (
        a.student_id = auth.uid() or public.is_admin() or a.agent_profile_id = auth.uid()
        or a.partner_id = public.my_partner_id()
      )
  ));
drop policy if exists app_child_write on public.application_qualifications;
create policy app_child_write on public.application_qualifications for all to authenticated
  using (public.is_admin() or exists (
    select 1 from public.applications a
    where a.cams_id = application_qualifications.cams_id and a.student_id = auth.uid()
  ))
  with check (public.is_admin() or exists (
    select 1 from public.applications a
    where a.cams_id = application_qualifications.cams_id and a.student_id = auth.uid()
  ));

drop policy if exists app_docs_all on public.application_documents;
create policy app_docs_all on public.application_documents for all to authenticated
  using (exists (
    select 1 from public.applications a
    where a.cams_id = application_documents.cams_id
      and (a.student_id = auth.uid() or public.is_admin() or a.agent_profile_id = auth.uid() or a.partner_id = public.my_partner_id())
  ))
  with check (exists (
    select 1 from public.applications a
    where a.cams_id = application_documents.cams_id
      and (a.student_id = auth.uid() or public.is_admin() or a.agent_profile_id = auth.uid() or a.partner_id = public.my_partner_id())
  ));

drop policy if exists app_timeline_select on public.application_timeline;
create policy app_timeline_select on public.application_timeline for select to authenticated
  using (exists (
    select 1 from public.applications a
    where a.cams_id = application_timeline.cams_id
      and (a.student_id = auth.uid() or public.is_admin() or a.agent_profile_id = auth.uid() or a.partner_id = public.my_partner_id())
  ));
drop policy if exists app_timeline_write on public.application_timeline;
create policy app_timeline_write on public.application_timeline for all to authenticated
  using (public.is_admin() or exists (
    select 1 from public.applications a
    where a.cams_id = application_timeline.cams_id and a.agent_profile_id = auth.uid()
  ))
  with check (public.is_admin() or exists (
    select 1 from public.applications a
    where a.cams_id = application_timeline.cams_id and a.agent_profile_id = auth.uid()
  ));

drop policy if exists app_notes_all on public.application_notes;
create policy app_notes_all on public.application_notes for all to authenticated
  using (exists (
    select 1 from public.applications a
    where a.cams_id = application_notes.cams_id
      and (a.student_id = auth.uid() or public.is_admin() or a.agent_profile_id = auth.uid() or a.partner_id = public.my_partner_id())
  ))
  with check (exists (
    select 1 from public.applications a
    where a.cams_id = application_notes.cams_id
      and (a.student_id = auth.uid() or public.is_admin() or a.agent_profile_id = auth.uid() or a.partner_id = public.my_partner_id())
  ));

-- notices: everyone signed in can read. Admin publishes.
drop policy if exists notices_read on public.notices;
create policy notices_read on public.notices for select to authenticated using (true);
drop policy if exists notices_write on public.notices;
create policy notices_write on public.notices for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications for select to authenticated
  using (recipient_id = auth.uid() or public.is_admin());
drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications for update to authenticated
  using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications for insert to authenticated
  with check (public.is_admin() or public.my_role() in ('agent', 'partner', 'team'));

drop policy if exists mails_own on public.mails;
create policy mails_own on public.mails for all to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists chat_member_select on public.chat_conversations;
create policy chat_member_select on public.chat_conversations for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.chat_participants p
      where p.conversation_id = chat_conversations.id and p.profile_id = auth.uid()
    )
  );
drop policy if exists chat_insert on public.chat_conversations;
create policy chat_insert on public.chat_conversations for insert to authenticated
  with check (created_by = auth.uid());
drop policy if exists chat_participants_all on public.chat_participants;
create policy chat_participants_all on public.chat_participants for all to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());
drop policy if exists chat_messages_select on public.chat_messages;
create policy chat_messages_select on public.chat_messages for select to authenticated
  using (exists (
    select 1 from public.chat_participants p
    where p.conversation_id = chat_messages.conversation_id and p.profile_id = auth.uid()
  ) or public.is_admin());
drop policy if exists chat_messages_insert on public.chat_messages;
create policy chat_messages_insert on public.chat_messages for insert to authenticated
  with check (sender_id = auth.uid());

drop policy if exists vouchers_own on public.vouchers;
create policy vouchers_own on public.vouchers for select to authenticated
  using (owner_id = auth.uid() or public.is_admin());
drop policy if exists vouchers_insert on public.vouchers;
create policy vouchers_insert on public.vouchers for insert to authenticated
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists ledger_read on public.commission_ledger;
create policy ledger_read on public.commission_ledger for select to authenticated
  using (public.is_admin() or partner_id = public.my_partner_id());
drop policy if exists ledger_write on public.commission_ledger;
create policy ledger_write on public.commission_ledger for insert to authenticated
  with check (public.is_admin());

drop policy if exists enquiries_insert on public.enquiries;
create policy enquiries_insert on public.enquiries for insert to authenticated
  with check (submitted_by = auth.uid());
drop policy if exists enquiries_read on public.enquiries;
create policy enquiries_read on public.enquiries for select to authenticated
  using (submitted_by = auth.uid() or public.is_admin() or public.my_role() in ('agent', 'partner', 'team'));

drop policy if exists vas_read on public.vas_services;
create policy vas_read on public.vas_services for select to anon, authenticated using (true);
drop policy if exists vas_requests_all on public.vas_requests;
create policy vas_requests_all on public.vas_requests for all to authenticated
  using (requested_by = auth.uid() or public.is_admin() or public.my_role() in ('partner', 'team', 'agent'))
  with check (requested_by = auth.uid() or public.is_admin());

-- No direct client access to the tracking counter.
drop policy if exists tracking_none on public.tracking_counters;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select on public.institutions, public.courses, public.vas_services to anon, authenticated;
grant insert on public.b2b_access_requests to anon, authenticated;
grant select, insert, update, delete on
  public.profiles, public.partners, public.students, public.student_education,
  public.student_tests, public.student_documents, public.student_notes,
  public.applications, public.application_qualifications, public.application_documents,
  public.application_timeline, public.application_notes, public.notices, public.notifications,
  public.mails, public.chat_conversations, public.chat_participants, public.chat_messages,
  public.vouchers, public.commission_ledger, public.enquiries, public.vas_requests,
  public.b2b_access_requests, public.institutions, public.courses
  to authenticated;

-- ---------------------------------------------------------------------------
-- File buckets. Private student and partner files. Public institution images.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('student-documents', 'student-documents', false),
  ('partner-documents', 'partner-documents', false),
  ('institution-media', 'institution-media', true)
on conflict (id) do nothing;

drop policy if exists student_files_own on storage.objects;
create policy student_files_own on storage.objects for all to authenticated
  using (
    bucket_id = 'student-documents'
    and (split_part(name, '/', 1) = auth.uid()::text or public.is_admin())
  )
  with check (
    bucket_id = 'student-documents'
    and (split_part(name, '/', 1) = auth.uid()::text or public.is_admin())
  );

drop policy if exists partner_files on storage.objects;
create policy partner_files on storage.objects for all to authenticated
  using (
    bucket_id = 'partner-documents'
    and (public.is_admin() or public.my_role() in ('partner', 'team'))
  )
  with check (
    bucket_id = 'partner-documents'
    and (public.is_admin() or public.my_role() in ('partner', 'team'))
  );

drop policy if exists institution_media_read on storage.objects;
create policy institution_media_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'institution-media');
drop policy if exists institution_media_write on storage.objects;
create policy institution_media_write on storage.objects for all to authenticated
  using (bucket_id = 'institution-media' and public.is_admin())
  with check (bucket_id = 'institution-media' and public.is_admin());

-- Catalog writes require a signed-in admin. Remove any earlier open anon policies.
drop policy if exists catalog_dev_anon_write_institutions on public.institutions;
drop policy if exists catalog_dev_anon_write_courses on public.courses;

-- ---------------------------------------------------------------------------
-- Portal documents. These alters are safe to run again.
-- applications.student_id is nullable because a B2B owner can file an
-- application for a person who does not have a student login yet.
-- payload holds the screen record (profile, application, or organization).
-- ---------------------------------------------------------------------------

alter table public.students add column if not exists payload jsonb;
alter table public.applications add column if not exists payload jsonb;
alter table public.partners add column if not exists payload jsonb;
alter table public.applications alter column student_id drop not null;

create table if not exists public.application_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.application_drafts enable row level security;
drop policy if exists drafts_own on public.application_drafts;
create policy drafts_own on public.application_drafts for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
grant select, insert, update, delete on public.application_drafts to authenticated;

-- The public B2B contact form inserts as anon. The request id default calls this function.
grant execute on function public.next_tracking_id(text) to anon;

-- The student who owns an application can update it (cancel, documents).
drop policy if exists applications_update on public.applications;
create policy applications_update on public.applications for update to authenticated
  using (
    public.is_admin()
    or student_id = auth.uid()
    or agent_profile_id = auth.uid()
    or (partner_id is not null and partner_id = public.my_partner_id())
  )
  with check (
    public.is_admin()
    or student_id = auth.uid()
    or agent_profile_id = auth.uid()
    or (partner_id is not null and partner_id = public.my_partner_id())
  );

-- ---------------------------------------------------------------------------
-- Super Admin ticks which admin-console screens the rest of the admin team can open.
-- ---------------------------------------------------------------------------
create table if not exists public.portal_settings (
  id text primary key,
  team_features jsonb not null default '["dashboard","students","applications","documents","notices"]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

alter table public.portal_settings enable row level security;

insert into public.portal_settings (id)
values ('global')
on conflict (id) do nothing;

drop policy if exists portal_settings_read on public.portal_settings;
create policy portal_settings_read on public.portal_settings
  for select to authenticated
  using (public.is_admin());

drop policy if exists portal_settings_update on public.portal_settings;
create policy portal_settings_update on public.portal_settings
  for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- First admin (run by hand after you create the auth user)
--
-- 1. Supabase → Authentication → Users → Add user
--    email: the real admin address. Turn on "Auto Confirm User".
--    The trigger creates that person as a student. That is expected.
-- 2. Then run:
--
--    update public.profiles
--    set role = 'admin',
--        tracking_id = 'DV-ADM-2026-10001',
--        staff_title = 'Super Admin',
--        department = 'Management'
--    where email = 'your-admin@dakshinvedha.com';
--
-- 3. Delete the student row that the trigger created for that admin:
--
--    delete from public.students
--    where profile_id = (select id from public.profiles where email = 'your-admin@dakshinvedha.com');
--
-- B2B owners, team members, agents, and later admins are not created from the
-- public signup form. After this first admin can sign in, the portal creates
-- those logins from the admin and B2B team screens.
-- ---------------------------------------------------------------------------
