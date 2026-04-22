-- Run once in Supabase SQL Editor (Stage 7: flags + repost thread)
-- Safe to re-run: uses IF NOT EXISTS patterns where applicable.

alter table public.posts
  add column if not exists flag text default 'general';

alter table public.posts
  add column if not exists repost_of_post_id uuid references public.posts (id) on delete set null;

create index if not exists posts_flag_idx on public.posts (flag);
create index if not exists posts_repost_of_post_id_idx on public.posts (repost_of_post_id);
