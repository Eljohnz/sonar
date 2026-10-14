create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (length(username) between 3 and 40),
  display_name text,
  avatar_url text,
  bio text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  spotify_id text not null check (spotify_id ~ '^[a-zA-Z0-9]{22}$'),
  spotify_url text not null check (spotify_url ~ '^https://open\.spotify\.com/track/[a-zA-Z0-9]{22}$'),
  title text not null check (length(trim(title)) between 1 and 160),
  artist text not null check (length(trim(artist)) between 1 and 160),
  album text,
  cover_url text,
  visual_style text not null default 'album' check (visual_style in ('album', 'equalizer', 'vinyl', 'minimal')),
  minimal_colors jsonb,
  visual_colors jsonb not null default '{}'::jsonb check (jsonb_typeof(visual_colors) = 'object'),
  caption text check (length(caption) <= 280),
  status text not null default 'published' check (status in ('published', 'hidden')),
  likes_count integer not null default 0 check (likes_count >= 0),
  created_at timestamptz not null default now()
);

alter table public.songs add column if not exists minimal_colors jsonb;
alter table public.songs add column if not exists visual_colors jsonb not null default '{}'::jsonb;

create table if not exists public.song_likes (
  song_id uuid not null references public.songs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (song_id, user_id)
);

create index if not exists songs_status_created_idx on public.songs(status, created_at desc);
create index if not exists songs_user_idx on public.songs(user_id);
create index if not exists song_likes_user_idx on public.song_likes(user_id);

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, username)
  values (
    new.id,
    left(coalesce(nullif(regexp_replace(new.raw_user_meta_data->>'username', '[^a-zA-Z0-9_]', '', 'g'), ''), 'listener_' || left(new.id::text, 8)), 40)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.sync_song_like_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.songs set likes_count = likes_count + 1 where id = new.song_id;
    return new;
  end if;
  update public.songs set likes_count = greatest(0, likes_count - 1) where id = old.song_id;
  return old;
end;
$$;

drop trigger if exists on_song_like_change on public.song_likes;
create trigger on_song_like_change after insert or delete on public.song_likes
for each row execute function public.sync_song_like_count();

alter table public.profiles enable row level security;
alter table public.songs enable row level security;
alter table public.song_likes enable row level security;

drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable" on public.profiles for select using (true);
drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile" on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "read public or own songs" on public.songs;
create policy "read public or own songs" on public.songs for select
using (status = 'published' or user_id = (select auth.uid()) or public.current_user_is_admin());
drop policy if exists "users submit own songs" on public.songs;
create policy "users submit own songs" on public.songs for insert to authenticated
with check (user_id = (select auth.uid()) and status = 'published' and likes_count = 0);
drop policy if exists "owners and admins edit songs" on public.songs;
create policy "owners and admins edit songs" on public.songs for update to authenticated
using (user_id = (select auth.uid()) or public.current_user_is_admin())
with check (user_id = (select auth.uid()) or public.current_user_is_admin());
drop policy if exists "owners and admins delete songs" on public.songs;
create policy "owners and admins delete songs" on public.songs for delete to authenticated
using (user_id = (select auth.uid()) or public.current_user_is_admin());

drop policy if exists "users read own likes" on public.song_likes;
create policy "users read own likes" on public.song_likes for select to authenticated
using (user_id = (select auth.uid()));
drop policy if exists "users like as themselves" on public.song_likes;
create policy "users like as themselves" on public.song_likes for insert to authenticated
with check (user_id = (select auth.uid()) and exists(select 1 from public.songs where id = song_id and status = 'published'));
drop policy if exists "users remove own likes" on public.song_likes;
create policy "users remove own likes" on public.song_likes for delete to authenticated
using (user_id = (select auth.uid()));

grant select on public.profiles, public.songs to anon, authenticated;
grant select, insert, delete on public.song_likes to authenticated;
grant delete on public.songs to authenticated;

revoke update on public.profiles from anon, authenticated;
grant update (username, display_name, avatar_url, bio) on public.profiles to authenticated;
revoke update on public.songs from anon, authenticated;
grant update (spotify_id, spotify_url, title, artist, album, cover_url, visual_style, minimal_colors, visual_colors, caption, status) on public.songs to authenticated;
revoke insert on public.songs from anon, authenticated;
grant insert (user_id, spotify_id, spotify_url, title, artist, album, cover_url, visual_style, minimal_colors, visual_colors, caption, status) on public.songs to authenticated;

-- After registering your own account, run this in the Supabase SQL editor using a trusted administrator role:
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');
