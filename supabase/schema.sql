-- ==========================================
-- DashSheet — Supabase Schema
-- Run this once in the Supabase SQL editor
-- (Project -> SQL Editor -> New query -> paste -> Run)
-- ==========================================

-- pgcrypto is pre-installed on Supabase in the `extensions` schema
-- (crypt / gen_salt are referenced below as extensions.crypt / extensions.gen_salt)

-- ==========================================
-- Tables
-- ==========================================

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text not null,
  batch text not null,
  email text not null,
  role text not null check (role in ('Trainer', 'Admin', 'OfficeAdmin', 'Placement')),
  username text not null unique,
  password text not null,
  created_at timestamptz not null default now()
);

create table if not exists training_reports (
  id uuid primary key default gen_random_uuid(),
  "timestamp" timestamptz not null default now(),
  trainer_name text not null,
  date text not null,
  college text not null,
  course text not null,
  specialization text not null default '',
  topic_covered text not null,
  learning_objectives text not null default '',
  duration text not null,
  methods jsonb not null default '{}'::jsonb,
  students_present integer not null default 0,
  total_enrolled integer not null default 0,
  participation_level text not null,
  engagement_observations text not null default '',
  challenges_trainer text not null default '',
  challenges_student text not null default '',
  action_plan text not null default '',
  feedback text not null default '',
  reviewed_by text not null default ''
);

create table if not exists work_reports (
  id uuid primary key default gen_random_uuid(),
  "timestamp" timestamptz not null default now(),
  trainer_name text not null,
  date text not null,
  department text not null,
  batch text not null,
  time_slots jsonb not null default '[]'::jsonb,
  key_accomplishments text not null default '',
  challenges_solutions text not null default '',
  pending_work text not null default '',
  additional_notes text not null default '',
  reviewed_by text not null default ''
);

create table if not exists office_admin_reports (
  id uuid primary key default gen_random_uuid(),
  "timestamp" timestamptz not null default now(),
  staff_name text not null,
  date text not null,
  item_name text not null,
  item_category text not null,
  quantity integer not null default 0,
  condition text not null,
  action_taken text not null,
  location text not null,
  notes text not null default ''
);

create table if not exists placement_reports (
  id uuid primary key default gen_random_uuid(),
  "timestamp" timestamptz not null default now(),
  staff_name text not null,
  company_name text not null,
  industry_sector text not null,
  company_type text not null,
  hq_location text not null default '',
  contact_person text not null default '',
  designation text not null default '',
  email_id text not null default '',
  phone_number text not null default '',
  source_channel text not null,
  date_of_first_contact text not null,
  mode_of_contact text not null,
  current_status text not null,
  roles_offered text not null default '',
  number_of_openings integer not null default 0,
  ctc_lpa numeric not null default 0,
  drive_date text not null default 'TBD',
  students_selected integer not null default 0,
  remarks text not null default '',
  priority text not null,
  next_follow_up_date text not null default '',
  action_required text not null default '',
  assigned_to text not null default '',
  follow_up_done boolean not null default false
);

-- ==========================================
-- Row Level Security
-- ==========================================

alter table members enable row level security;
alter table training_reports enable row level security;
alter table work_reports enable row level security;
alter table office_admin_reports enable row level security;
alter table placement_reports enable row level security;

-- No policies on `members` for anon/authenticated: the only way to authenticate
-- is via the login_member() RPC below (SECURITY DEFINER bypasses RLS).

-- The dashboard needs the roster (name/department/batch/role) without exposing
-- password hashes to the anon key, so expose a view that omits `password`.
create or replace view members_public as
  select id, name, department, batch, email, role, username, created_at from members;

grant select on members_public to anon;

-- Report tables: internal-use dashboard, anon key can read/write everything
-- (matches the previous "Anyone with the link" Apps Script posture).
create policy "anon read training_reports" on training_reports for select to anon using (true);
create policy "anon insert training_reports" on training_reports for insert to anon with check (true);

create policy "anon read work_reports" on work_reports for select to anon using (true);
create policy "anon insert work_reports" on work_reports for insert to anon with check (true);

create policy "anon read office_admin_reports" on office_admin_reports for select to anon using (true);
create policy "anon insert office_admin_reports" on office_admin_reports for insert to anon with check (true);

create policy "anon read placement_reports" on placement_reports for select to anon using (true);
create policy "anon insert placement_reports" on placement_reports for insert to anon with check (true);

-- ==========================================
-- Login RPC
-- ==========================================

create or replace function login_member(p_username text, p_password text)
returns table (
  id uuid,
  name text,
  department text,
  batch text,
  email text,
  role text,
  username text
)
language sql
security definer
set search_path = public, extensions
as $$
  select m.id, m.name, m.department, m.batch, m.email, m.role, m.username
  from members m
  where m.username = lower(trim(p_username))
    and m.password = extensions.crypt(p_password, m.password);
$$;

grant execute on function login_member(text, text) to anon;

-- ==========================================
-- Seed data — roster from google-apps-script/DashSheet_Setup.gs
-- Default password for everyone: Cdc@2026  (share individually, can be
-- changed later by updating the `password` column with a new extensions.crypt() value)
-- ==========================================

insert into members (name, department, batch, email, role, username, password) values
  ('Deepti Verma',        'Soft Skills',                  'Batch A', 'deepti.verma@org.com',        'Admin',       'deepti.verma',        extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Amit Mishra',         'Technical Skills',             'Batch B', 'amit.mishra@org.com',         'Admin',       'amit.mishra',         extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Anshul Oza',          'Technical Skills',             'Batch C', 'anshul.oza@org.com',          'Trainer',     'anshul.oza',          extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Khyati Koranne',      'Technical Skills',             'Batch D', 'khyati.koranne@org.com',      'Trainer',     'khyati.koranne',      extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Ritu Shrivastava',    'Communication Skills',         'Batch E', 'ritu.shrivastava@org.com',    'Trainer',     'ritu.shrivastava',    extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Lajwanti Kishnani',   'Communication Skills',         'Batch A', 'lajwanti.kishnani@org.com',   'Trainer',     'lajwanti.kishnani',   extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Aarti Rao',           'Communication Skills',         'Batch B', 'aarti.rao@org.com',           'Trainer',     'aarti.rao',           extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Vineeta Shirdhonkar', 'Communication Skills',         'Batch C', 'vineeta.shirdhonkar@org.com', 'Trainer',     'vineeta.shirdhonkar', extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Anuj Sengar',         'Communication Skills',         'Batch D', 'anuj.sengar@org.com',         'Trainer',     'anuj.sengar',         extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Sapna Choubey',       'Communication Skills',         'Batch E', 'sapna.choubey@org.com',       'Trainer',     'sapna.choubey',       extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Prathamesh Tikhe',    'Soft Skills',                   'Batch A', 'prathamesh.tikhe@org.com',    'Trainer',     'prathamesh.tikhe',    extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Anuja Sharma',        'Soft Skills',                   'Batch B', 'anuja.sharma@org.com',        'Trainer',     'anuja.sharma',        extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Deepal Chhatwani',    'Cognitive Skills',              'Batch C', 'deepal.chhatwani@org.com',    'Trainer',     'deepal.chhatwani',    extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Sarthak Jain',        'Innovation & Outreach Skills',  'Batch D', 'sarthak.jain@org.com',        'Trainer',     'sarthak.jain',        extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Honey Meena',         'Administration',               '-',       'honey.meena@org.com',         'OfficeAdmin', 'honey.meena',         extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Khushi Verma',        'Administration',               '-',       'khushi.verma@org.com',        'OfficeAdmin', 'khushi.verma',        extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Rajesh Tyagi',        'Placement Cell',                '-',       'rajesh.tyagi@org.com',        'Placement',   'rajesh.tyagi',        extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Sarvesh Dubey',       'Placement Cell',                '-',       'sarvesh.dubey@org.com',       'Placement',   'sarvesh.dubey',       extensions.crypt('Cdc@2026', extensions.gen_salt('bf'))),
  ('Ankit Shrivastava',   'Placement Cell',                '-',       'ankit.shrivastava@org.com',   'Placement',   'ankit.shrivastava',   extensions.crypt('Cdc@2026', extensions.gen_salt('bf')))
on conflict (username) do nothing;
