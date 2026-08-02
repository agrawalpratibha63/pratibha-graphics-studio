-- StudioVault initial schema
-- Run in Supabase SQL editor or via CLI migrations

create extension if not exists "pgcrypto";

create type public.user_role as enum ('owner', 'visitor');
create type public.work_visibility as enum ('private', 'visitors', 'featured');
create type public.media_type as enum ('image', 'video', 'document');
create type public.visit_source as enum ('web', 'ios', 'android');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.user_role not null default 'visitor',
  avatar_url text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  visit_count integer not null default 0
);

create table public.owner_profile (
  id uuid primary key default gen_random_uuid(),
  display_name text not null default 'Designer',
  photo_url text,
  bio text not null default '',
  email text not null default '',
  whatsapp text not null default '',
  social_links jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0,
  visible_to_visitors boolean not null default true
);

create table public.works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category_id uuid not null references public.categories (id) on delete restrict,
  visibility public.work_visibility not null default 'visitors',
  featured_order integer,
  media_type public.media_type not null,
  storage_path text not null,
  thumb_path text,
  mime_type text not null default '',
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references public.profiles (id) on delete cascade,
  visited_at timestamptz not null default now(),
  source public.visit_source not null default 'web'
);

create index visits_visitor_id_idx on public.visits (visitor_id);
create index works_category_id_idx on public.works (category_id);
create index works_visibility_idx on public.works (visibility);

insert into public.categories (slug, name, sort_order) values
  ('logos', 'Logos', 1),
  ('youtube-thumbnails', 'YouTube Thumbnails', 2),
  ('instagram', 'Instagram Posts', 3),
  ('facebook', 'Facebook Posts', 4),
  ('linkedin', 'LinkedIn Posts', 5),
  ('social-other', 'Other Social', 6),
  ('videos', 'Videos', 7);

insert into public.owner_profile (display_name, bio, email, whatsapp, social_links)
values (
  'Pratibha',
  'Graphic designer crafting logos, thumbnails, social posts, and motion. This vault holds the full library — visitors see only what I choose to share.',
  'hello@studiovault.app',
  '+91 00000 00000',
  '{"instagram":"https://instagram.com","linkedin":"https://linkedin.com","behance":"https://behance.net"}'::jsonb
);

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'owner'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_email text := lower(coalesce(current_setting('app.owner_email', true), ''));
  assigned_role public.user_role := 'visitor';
begin
  if owner_email <> '' and lower(new.email) = owner_email then
    assigned_role := 'owner';
  elsif not exists (select 1 from public.profiles where role = 'owner') then
    -- First user becomes owner if OWNER email not configured yet
    assigned_role := 'owner';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'user'), '@', 1)),
    assigned_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.record_visit(p_visitor_id uuid, p_source public.visit_source default 'web')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_owner_email text;
begin
  if auth.uid() is distinct from p_visitor_id and not public.is_owner() then
    raise exception 'not allowed';
  end if;

  select * into v_profile from public.profiles where id = p_visitor_id;
  if not found then
    return '{}'::jsonb;
  end if;
  if v_profile.role = 'owner' then
    return '{}'::jsonb;
  end if;

  update public.profiles
  set visit_count = visit_count + 1,
      last_seen_at = now()
  where id = p_visitor_id
  returning * into v_profile;

  insert into public.visits (visitor_id, source)
  values (p_visitor_id, p_source);

  select email into v_owner_email from public.profiles where role = 'owner' limit 1;

  return jsonb_build_object(
    'visitor_name', v_profile.full_name,
    'visitor_email', v_profile.email,
    'visit_count', v_profile.visit_count,
    'owner_email', v_owner_email,
    'visited_at', now()
  );
end;
$$;

alter table public.profiles enable row level security;
alter table public.owner_profile enable row level security;
alter table public.categories enable row level security;
alter table public.works enable row level security;
alter table public.visits enable row level security;

create policy "profiles_select_own_or_owner"
  on public.profiles for select
  using (auth.uid() = id or public.is_owner());

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id or public.is_owner());

create policy "owner_profile_select_authenticated"
  on public.owner_profile for select
  to authenticated
  using (true);

create policy "owner_profile_update_owner"
  on public.owner_profile for update
  using (public.is_owner());

create policy "categories_select"
  on public.categories for select
  to authenticated
  using (public.is_owner() or visible_to_visitors = true);

create policy "categories_update_owner"
  on public.categories for all
  using (public.is_owner())
  with check (public.is_owner());

create policy "works_select"
  on public.works for select
  to authenticated
  using (
    public.is_owner()
    or (
      visibility in ('visitors', 'featured')
      and exists (
        select 1 from public.categories c
        where c.id = works.category_id and c.visible_to_visitors = true
      )
    )
  );

create policy "works_write_owner"
  on public.works for all
  using (public.is_owner())
  with check (public.is_owner());

create policy "visits_insert_self"
  on public.visits for insert
  to authenticated
  with check (auth.uid() = visitor_id);

create policy "visits_select_owner"
  on public.visits for select
  using (public.is_owner());

insert into storage.buckets (id, name, public)
values ('works', 'works', true)
on conflict (id) do nothing;

create policy "works_storage_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'works');

create policy "works_storage_write_owner"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'works' and public.is_owner());

create policy "works_storage_update_owner"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'works' and public.is_owner());

create policy "works_storage_delete_owner"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'works' and public.is_owner());
