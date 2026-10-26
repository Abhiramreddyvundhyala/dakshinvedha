-- Audience for platform notices. Safe to run more than once.
-- all = every portal, students = student logins, partners = B2B owner and team, agents = agent logins.
alter table public.notices add column if not exists audience text not null default 'all';
