-- History of paused and deleted logins. Safe to run more than once.
-- Run this in the Supabase SQL editor if Accounts history says the table is missing.

create table if not exists public.account_history (
  id uuid primary key default gen_random_uuid(),
  account_id uuid,
  email text not null default '',
  full_name text not null default '',
  role text not null default '',
  action text not null check (action in ('paused', 'resumed', 'deleted')),
  actor_id uuid,
  actor_name text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.account_history enable row level security;

drop policy if exists account_history_admin_read on public.account_history;
create policy account_history_admin_read on public.account_history
  for select to authenticated
  using (public.is_admin());

grant select on public.account_history to authenticated;
