-- Run this once if you already created the songs table with an older SONAR starter.
-- New projects running the latest supabase/schema.sql do not need this migration.
alter table public.songs add column if not exists minimal_colors jsonb;
grant insert (minimal_colors), update (minimal_colors) on public.songs to authenticated;
