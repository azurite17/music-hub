-- Run once in Supabase SQL Editor.
-- This RPC lets anyone upvote while keeping edit/delete ownership rules.

create or replace function public.increment_post_upvote(p_post_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  update public.posts
  set upvotes_count = coalesce(upvotes_count, 0) + 1
  where id = p_post_id
  returning upvotes_count into new_count;

  if new_count is null then
    raise exception 'Post not found';
  end if;

  return new_count;
end;
$$;

grant execute on function public.increment_post_upvote(uuid) to anon, authenticated;
