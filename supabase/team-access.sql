-- Team feature access. Run once in the Supabase SQL editor.
-- Super Admin ticks which admin-console screens the rest of the admin team can open.

create table if not exists public.portal_settings (
  id text primary key,
  team_features jsonb not null default '["dashboard","students","applications","documents","notices"]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

alter table public.portal_settings enable row level security;

insert into public.portal_settings (id)
values ('global')
on conflict (id) do nothing;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'Active'
      and staff_title = 'Super Admin'
  );
$$;

revoke all on function public.is_super_admin() from public;
grant execute on function public.is_super_admin() to authenticated;

drop policy if exists portal_settings_read on public.portal_settings;
create policy portal_settings_read on public.portal_settings
  for select to authenticated
  using (public.is_admin());

drop policy if exists portal_settings_update on public.portal_settings;
create policy portal_settings_update on public.portal_settings
  for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());
