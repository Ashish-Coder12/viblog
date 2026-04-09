-- =============================================
-- YouTube Blog Platform — Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Blogs table
create table if not exists blogs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text not null,                   -- Clerk user ID (e.g. "user_2abc...")
  youtube_url text not null,
  video_id    text not null,
  title       text not null,
  description text not null,
  hashtags    text[] not null default '{}',
  transcript  text,
  thumbnail   text,                             -- YouTube thumbnail URL
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast per-user queries
create index if not exists blogs_user_id_idx on blogs(user_id);
create index if not exists blogs_created_at_idx on blogs(created_at desc);

-- Row Level Security: users can only see/edit their own blogs
alter table blogs enable row level security;

create policy "Users can view own blogs"
  on blogs for select
  using (user_id = current_setting('app.current_user_id', true));

create policy "Users can insert own blogs"
  on blogs for insert
  with check (user_id = current_setting('app.current_user_id', true));

create policy "Users can update own blogs"
  on blogs for update
  using (user_id = current_setting('app.current_user_id', true));

create policy "Users can delete own blogs"
  on blogs for delete
  using (user_id = current_setting('app.current_user_id', true));

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger blogs_updated_at
  before update on blogs
  for each row execute function update_updated_at_column();
