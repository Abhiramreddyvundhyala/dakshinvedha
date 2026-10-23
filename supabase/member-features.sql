-- Per-person admin team screens. Run once in the Supabase SQL editor.
alter table public.profiles add column if not exists allowed_features jsonb;
