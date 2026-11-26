-- Drop the 5-person cap on B2B team logins.
-- Run this once in the Supabase SQL editor on databases created before the cap was removed.
-- Safe to run more than once.

create or replace function public.enforce_profile_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text;
begin
  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    if auth.uid() is not null and auth.role() is distinct from 'service_role' then
      select role into actor_role from public.profiles where id = auth.uid();
      if actor_role is distinct from 'admin' then
        raise exception 'Only an admin can change a portal role';
      end if;
    end if;
  end if;

  if new.role = 'agent' and new.partner_id is not null then
    raise exception 'An agent is not a B2B team member';
  end if;

  if new.role = 'team' and new.partner_id is null then
    raise exception 'A team member must belong to a B2B organization';
  end if;

  if new.role = 'partner' then
    new.member_kind = 'owner';
  elsif new.role = 'team' then
    new.member_kind = 'team';
  else
    new.member_kind = null;
  end if;

  return new;
end;
$$;
