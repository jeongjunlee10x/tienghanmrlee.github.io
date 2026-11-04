-- TIENG HAN MR LEE: quan tri rieng, khong dung Firebase.
-- Chay trong Supabase Dashboard > SQL Editor.
-- KHONG dat service_role key trong website.

create extension if not exists pgcrypto;

create table if not exists public.mrlee_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.mrlee_students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 1 and 150),
  email text not null default '',
  phone text not null default '',
  level text not null default 'Sơ cấp 1' check (level in ('Sơ cấp 1','Sơ cấp 2','TOPIK I','TOPIK II','Khác')),
  status text not null default 'Đang học' check (status in ('Đang học','Tạm nghỉ','Hoàn thành')),
  notes text not null default '',
  joined_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mrlee_scores (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.mrlee_students(id) on delete cascade,
  exam_title text not null check (char_length(exam_title) between 1 and 200),
  score numeric(7,2) not null check (score >= 0),
  max_score numeric(7,2) not null default 100 check (max_score > 0),
  exam_date date not null default current_date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  constraint score_within_max check (score <= max_score)
);

create index if not exists mrlee_students_created_idx on public.mrlee_students (created_at desc);
create index if not exists mrlee_scores_date_idx on public.mrlee_scores (exam_date desc);
create index if not exists mrlee_scores_student_idx on public.mrlee_scores (student_id);

-- Quan trong: phan quyen o phia CSDL, khong phai chi an nut tren giao dien.
alter table public.mrlee_admins enable row level security;
alter table public.mrlee_students enable row level security;
alter table public.mrlee_scores enable row level security;

revoke all on table public.mrlee_admins from anon, authenticated;
revoke all on table public.mrlee_students from anon, authenticated;
revoke all on table public.mrlee_scores from anon, authenticated;
grant select on table public.mrlee_admins to authenticated;
grant select, insert, update, delete on table public.mrlee_students to authenticated;
grant select, insert, update, delete on table public.mrlee_scores to authenticated;

-- Chay duoc nhieu lan, giu nguyen du lieu cu.
drop policy if exists "mrlee_admin_read_own_role" on public.mrlee_admins;
create policy "mrlee_admin_read_own_role" on public.mrlee_admins
  for select to authenticated using (user_id = (select auth.uid()));

-- Tat ca truy van hoc vien va diem chi cho phep tai khoan CO TRONG bang admins.
-- Khong co API client nao duoc tu them minh vao bang admins.
drop policy if exists "mrlee_students_admin_read" on public.mrlee_students;
create policy "mrlee_students_admin_read" on public.mrlee_students
  for select to authenticated using (
    exists (select 1 from public.mrlee_admins a where a.user_id = (select auth.uid()))
  );
drop policy if exists "mrlee_students_admin_insert" on public.mrlee_students;
create policy "mrlee_students_admin_insert" on public.mrlee_students
  for insert to authenticated with check (
    exists (select 1 from public.mrlee_admins a where a.user_id = (select auth.uid()))
  );
drop policy if exists "mrlee_students_admin_update" on public.mrlee_students;
create policy "mrlee_students_admin_update" on public.mrlee_students
  for update to authenticated using (
    exists (select 1 from public.mrlee_admins a where a.user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.mrlee_admins a where a.user_id = (select auth.uid()))
  );
drop policy if exists "mrlee_students_admin_delete" on public.mrlee_students;
create policy "mrlee_students_admin_delete" on public.mrlee_students
  for delete to authenticated using (
    exists (select 1 from public.mrlee_admins a where a.user_id = (select auth.uid()))
  );

drop policy if exists "mrlee_scores_admin_read" on public.mrlee_scores;
create policy "mrlee_scores_admin_read" on public.mrlee_scores
  for select to authenticated using (
    exists (select 1 from public.mrlee_admins a where a.user_id = (select auth.uid()))
  );
drop policy if exists "mrlee_scores_admin_insert" on public.mrlee_scores;
create policy "mrlee_scores_admin_insert" on public.mrlee_scores
  for insert to authenticated with check (
    exists (select 1 from public.mrlee_admins a where a.user_id = (select auth.uid()))
  );
drop policy if exists "mrlee_scores_admin_update" on public.mrlee_scores;
create policy "mrlee_scores_admin_update" on public.mrlee_scores
  for update to authenticated using (
    exists (select 1 from public.mrlee_admins a where a.user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.mrlee_admins a where a.user_id = (select auth.uid()))
  );
drop policy if exists "mrlee_scores_admin_delete" on public.mrlee_scores;
create policy "mrlee_scores_admin_delete" on public.mrlee_scores
  for delete to authenticated using (
    exists (select 1 from public.mrlee_admins a where a.user_id = (select auth.uid()))
  );

-- SAU KHI tao tai khoan Admin qua Supabase > Authentication > Users,
-- lay User UID va CHAY LENH SAU TRONG SQL Editor (KHONG dien UID that vao file cong khai):
-- insert into public.mrlee_admins (user_id)
-- values ('DAN-UID-TAI-KHOAN-QUAN-TRI-VAO-DAY')
-- on conflict (user_id) do nothing;
