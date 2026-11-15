-- Catalog MAX. Profiles live beside auth.users. Channels are the catalog cards.
-- Authorization uses profiles.role, never user-editable JWT metadata.

create schema if not exists private;

create extension if not exists pg_trgm with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  full_name text,
  username text,
  avatar_url text,
  max_contact text,
  company_or_agency text,
  bio text,
  account_type text check (account_type in ('owner', 'advertiser')),
  show_contacts_publicly boolean not null default false,
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  constraint profiles_username_shape check (username is null or username ~ '^[A-Za-z0-9_]{3,24}$'),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 300),
  constraint profiles_full_name_length check (full_name is null or char_length(full_name) <= 80)
);

create unique index profiles_username_lower_idx on public.profiles (lower(username));

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  icon text
);

create table public.channels (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  title text not null check (char_length(title) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  max_link text not null check (max_link ~ '^https://([a-z0-9-]+\.)*max\.ru(/.*)?$'),
  description text check (description is null or char_length(description) <= 4000),
  avatar_url text,
  subscribers_count integer not null default 0 check (subscribers_count >= 0),
  avg_post_reach integer not null default 0 check (avg_post_reach >= 0),
  err_percent numeric(5,2) check (err_percent is null or (err_percent >= 0 and err_percent <= 100)),
  ad_price numeric(12,2) check (ad_price is null or ad_price >= 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_verified boolean not null default false,
  rejection_reason text check (rejection_reason is null or char_length(rejection_reason) <= 500),
  manager_contact text check (manager_contact is null or char_length(manager_contact) <= 160),
  gallery text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.channel_verifications (
  channel_id uuid primary key references public.channels (id) on delete cascade,
  code text not null unique check (code ~ '^maxstat-verify-[0-9]{6}$'),
  created_at timestamptz not null default now()
);

create table public.channel_stats (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels (id) on delete cascade,
  stat_date date not null,
  subscribers_count integer not null check (subscribers_count >= 0),
  reach_count integer not null check (reach_count >= 0),
  unique (channel_id, stat_date)
);

create table public.platforms (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null check (char_length(description) between 1 and 500),
  url text not null check (url ~ '^https://'),
  logo_url text,
  tool_category text not null check (char_length(tool_category) between 1 and 40),
  pricing_type text not null check (pricing_type in ('free', 'freemium', 'paid')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  channel_id uuid not null references public.channels (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, channel_id)
);

create index channels_owner_id_idx on public.channels (owner_id);
create index channels_category_id_idx on public.channels (category_id);
create index channels_approved_created_idx on public.channels (created_at desc) where status = 'approved';
create index channels_approved_category_idx on public.channels (category_id, created_at desc) where status = 'approved';
create index channels_approved_subscribers_idx on public.channels (subscribers_count desc) where status = 'approved';
create index channels_approved_price_idx on public.channels (ad_price) where status = 'approved' and ad_price is not null;
create index channels_title_trgm_idx on public.channels using gin (title extensions.gin_trgm_ops);
create index channels_description_trgm_idx on public.channels using gin (description extensions.gin_trgm_ops);
create index channel_stats_channel_date_idx on public.channel_stats (channel_id, stat_date desc);
create index favorites_channel_id_idx on public.favorites (channel_id);
create index platforms_tool_category_idx on public.platforms (tool_category);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and is_banned = false
  );
$$;

create or replace function private.is_banned()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and is_banned = true
  );
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_name text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'username', '')), '');
  requested_full_name text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
begin
  if requested_name is null or requested_name !~ '^[A-Za-z0-9_]{3,24}$' then
    raise exception 'Никнейм: 3–24 символа, латиница, цифры и _';
  end if;
  insert into public.profiles (id, email, username, full_name, role)
  values (new.id, new.email, requested_name, requested_full_name, 'user');
  return new;
end;
$$;

create or replace function private.guard_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_admin() then
    return new;
  end if;
  new.role := old.role;
  new.is_banned := old.is_banned;
  new.id := old.id;
  new.email := old.email;
  new.created_at := old.created_at;
  return new;
end;
$$;

create or replace function private.guard_channel()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and not private.is_admin() then
    new.owner_id := (select auth.uid());
    new.status := 'pending';
    new.is_verified := false;
    new.subscribers_count := 0;
    new.avg_post_reach := 0;
    new.err_percent := null;
    new.rejection_reason := null;
  elsif tg_op = 'UPDATE' and not private.is_admin() then
    new.owner_id := old.owner_id;
    new.status := old.status;
    new.is_verified := old.is_verified;
    new.subscribers_count := old.subscribers_count;
    new.avg_post_reach := old.avg_post_reach;
    new.err_percent := old.err_percent;
    new.rejection_reason := old.rejection_reason;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  if new.status = 'rejected' and coalesce(trim(new.rejection_reason), '') = '' then
    raise exception 'Укажите причину отклонения';
  end if;
  if coalesce(array_length(new.gallery, 1), 0) > 6 then
    raise exception 'В галерее не больше 6 фото';
  end if;
  return new;
end;
$$;

create or replace function private.assign_verify_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate text;
begin
  loop
    candidate := 'maxstat-verify-' || lpad((floor(random() * 1000000))::int::text, 6, '0');
    exit when not exists (
      select 1 from public.channel_verifications where code = candidate
    );
  end loop;
  insert into public.channel_verifications (channel_id, code)
  values (new.id, candidate);
  return new;
end;
$$;

create trigger profiles_guard
  before update on public.profiles
  for each row execute function private.guard_profile();

create trigger channels_guard
  before insert or update on public.channels
  for each row execute function private.guard_channel();

create trigger channels_verify_code
  after insert on public.channels
  for each row execute function private.assign_verify_code();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

revoke all on function private.is_admin() from public, anon, authenticated;
revoke all on function private.is_banned() from public, anon, authenticated;
revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.guard_profile() from public, anon, authenticated;
revoke all on function private.guard_channel() from public, anon, authenticated;
revoke all on function private.assign_verify_code() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_banned() to authenticated;

create or replace function public.username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1
    from public.profiles
    where lower(username) = lower(trim(candidate))
  );
$$;

create or replace function public.category_counts()
returns table (id uuid, name text, slug text, icon text, channel_count bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select c.id, c.name, c.slug, c.icon, count(ch.id)
  from public.categories c
  left join public.channels ch
    on ch.category_id = c.id
   and ch.status = 'approved'
  group by c.id, c.name, c.slug, c.icon
  order by count(ch.id) desc, c.name;
$$;

create or replace function public.channel_owner_contact(target uuid)
returns table (
  full_name text,
  username text,
  max_contact text,
  company_or_agency text,
  avatar_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.full_name, p.username, p.max_contact, p.company_or_agency, p.avatar_url
  from public.channels c
  join public.profiles p on p.id = c.owner_id
  where c.id = target
    and c.status = 'approved'
    and p.show_contacts_publicly = true
    and p.is_banned = false;
$$;

revoke all on function public.username_available(text) from public;
revoke all on function public.category_counts() from public;
revoke all on function public.channel_owner_contact(uuid) from public;
grant execute on function public.username_available(text) to anon, authenticated;
grant execute on function public.category_counts() to anon, authenticated;
grant execute on function public.channel_owner_contact(uuid) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.channels enable row level security;
alter table public.channel_verifications enable row level security;
alter table public.channel_stats enable row level security;
alter table public.platforms enable row level security;
alter table public.favorites enable row level security;

create policy profiles_select on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()));

create policy profiles_update on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()))
  with check ((select auth.uid()) = id or (select private.is_admin()));

create policy categories_read on public.categories
  for select to anon, authenticated
  using (true);

create policy categories_admin on public.categories
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy channels_public_read on public.channels
  for select to anon, authenticated
  using (status = 'approved');

create policy channels_owner_read on public.channels
  for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy channels_admin_read on public.channels
  for select to authenticated
  using ((select private.is_admin()));

create policy channels_insert on public.channels
  for insert to authenticated
  with check (
    (select private.is_admin())
    or (
      (select auth.uid()) = owner_id
      and status = 'pending'
      and is_verified = false
      and not (select private.is_banned())
    )
  );

create policy channels_update on public.channels
  for update to authenticated
  using ((select auth.uid()) = owner_id or (select private.is_admin()))
  with check ((select auth.uid()) = owner_id or (select private.is_admin()));

create policy channels_delete on public.channels
  for delete to authenticated
  using ((select auth.uid()) = owner_id or (select private.is_admin()));

create policy verifications_read on public.channel_verifications
  for select to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1
      from public.channels c
      where c.id = channel_id
        and c.owner_id = (select auth.uid())
    )
  );

create policy stats_read on public.channel_stats
  for select to anon, authenticated
  using (
    exists (
      select 1
      from public.channels c
      where c.id = channel_id
        and (
          c.status = 'approved'
          or c.owner_id = (select auth.uid())
          or (select private.is_admin())
        )
    )
  );

create policy stats_admin on public.channel_stats
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy platforms_read on public.platforms
  for select to anon, authenticated
  using (true);

create policy platforms_admin on public.platforms
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy favorites_own on public.favorites
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.channels c
      where c.id = channel_id
        and c.status = 'approved'
    )
  );

grant select, update on public.profiles to authenticated;
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant select on public.channels to anon, authenticated;
grant insert, update, delete on public.channels to authenticated;
grant select on public.channel_verifications to authenticated;
grant select on public.channel_stats to anon, authenticated;
grant insert, update, delete on public.channel_stats to authenticated;
grant select on public.platforms to anon, authenticated;
grant insert, update, delete on public.platforms to authenticated;
grant select, insert, delete on public.favorites to authenticated;

insert into public.categories (name, slug, icon) values
  ('Нейросети', 'nejroseti', 'spark'),
  ('Боты', 'boty', 'bot'),
  ('Новости', 'novosti', 'news'),
  ('Обучение', 'obuchenie', 'book'),
  ('Творчество', 'tvorchestvo', 'brush'),
  ('Бизнес', 'biznes', 'case'),
  ('Инструменты', 'instrumenty', 'tool');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('channel-media', 'channel-media', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('platform-logos', 'platform-logos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy avatars_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatars');

create policy avatars_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy avatars_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy avatars_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy channel_media_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'channel-media');

create policy channel_media_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'channel-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy channel_media_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'channel-media'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select private.is_admin())
    )
  );

create policy platform_logos_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'platform-logos');

create policy platform_logos_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'platform-logos' and (select private.is_admin()));

create policy platform_logos_update on storage.objects
  for update to authenticated
  using (bucket_id = 'platform-logos' and (select private.is_admin()))
  with check (bucket_id = 'platform-logos' and (select private.is_admin()));

create policy platform_logos_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'platform-logos' and (select private.is_admin()));
