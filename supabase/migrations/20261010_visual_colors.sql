-- Phase 1 visualizer studio: run in Supabase SQL Editor if your SONAR songs table already exists.
-- Adds per-visualizer palettes without modifying existing songs or Minimal colors.
alter table public.songs add column if not exists visual_colors jsonb not null default '{}'::jsonb;
grant insert (visual_colors), update (visual_colors) on public.songs to authenticated;
