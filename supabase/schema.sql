-- Run this in Supabase → SQL Editor

-- Projects table
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  iso         char(3) not null,
  country     text not null,
  title       text not null,
  city        text,
  year        integer,
  client      text,
  blurb       text,
  quote       text,
  lat         double precision,
  lng         double precision,
  created_at  timestamptz default now()
);

-- Migration for existing tables:
alter table projects add column if not exists lat double precision;
alter table projects add column if not exists lng double precision;

-- Images linked to a project (ordered)
create table if not exists project_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  url         text not null,
  sort_order  integer default 0
);

-- Index for fast country lookups
create index if not exists projects_iso_idx on projects(iso);

-- Public read access (map is public)
alter table projects enable row level security;
alter table project_images enable row level security;

create policy "public read projects"
  on projects for select using (true);

create policy "public read images"
  on project_images for select using (true);

-- Service role (used server-side in admin) bypasses RLS automatically.
-- No extra policies needed for insert/update/delete.

-- Storage bucket for images
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict do nothing;

create policy "public read project images"
  on storage.objects for select
  using (bucket_id = 'project-images');

create policy "service role upload project images"
  on storage.objects for insert
  with check (bucket_id = 'project-images');

create policy "service role delete project images"
  on storage.objects for delete
  using (bucket_id = 'project-images');
