export const ADMIN_FEATURE_KEYS = [
  "dashboard",
  "analytics",
  "students",
  "applications",
  "universities",
  "courses",
  "documents",
  "partners",
  "agents",
  "team",
  "access",
  "notices",
] as const;

export type AdminFeatureKey = (typeof ADMIN_FEATURE_KEYS)[number];

export const GRANTABLE_ADMIN_FEATURES: AdminFeatureKey[] = [
  "analytics",
  "students",
  "applications",
  "universities",
  "courses",
  "documents",
  "partners",
  "agents",
  "notices",
];

export const DEFAULT_TEAM_FEATURES: AdminFeatureKey[] = [
  "dashboard",
  "students",
  "applications",
  "documents",
  "notices",
];

export const ADMIN_FEATURE_COPY: Record<
  AdminFeatureKey,
  { label: string; description: string }
> = {
  dashboard: {
    label: "Dashboard",
    description: "Home counts, recent applications, and document alerts. Always on so every admin login has a landing page.",
  },
  analytics: {
    label: "Analytics",
    description: "Platform-wide conversion, offer rate, and monthly trends.",
  },
  students: {
    label: "Students",
    description: "Student list and student detail records.",
  },
  applications: {
    label: "Applications",
    description: "Every application file and Change Status on the 11-stage tracker.",
  },
  universities: {
    label: "Universities",
    description: "Add, edit, and delete institutions in the catalogue.",
  },
  courses: {
    label: "Courses",
    description: "Add, edit, and delete programmes, including commission rate.",
  },
  documents: {
    label: "Documents Queue",
    description: "Review, verify, reject, or request a re-upload.",
  },
  partners: {
    label: "B2B Partners",
    description: "Access requests, owner logins, bank details, and verification.",
  },
  agents: {
    label: "Agents",
    description: "Create, suspend, and remove counselor logins.",
  },
  team: {
    label: "Team",
    description: "Create and remove admin staff logins. Super Admin only.",
  },
  access: {
    label: "Team Access",
    description: "This checkbox list. Super Admin only.",
  },
  notices: {
    label: "Notices",
    description: "Read and publish platform notices.",
  },
};

const FEATURE_SET = new Set<string>(ADMIN_FEATURE_KEYS);

export function isSuperAdminTitle(title: string | null | undefined): boolean {
  return (title || "").trim() === "Super Admin";
}

export function parseTeamFeatures(raw: unknown): AdminFeatureKey[] {
  const source = Array.isArray(raw) ? raw : DEFAULT_TEAM_FEATURES;
  const selected = source.filter((item): item is AdminFeatureKey => typeof item === "string" && FEATURE_SET.has(item));
  const grantable = selected.filter((item) => GRANTABLE_ADMIN_FEATURES.includes(item) || item === "dashboard");
  if (!grantable.includes("dashboard")) grantable.unshift("dashboard");
  return Array.from(new Set(grantable));
}

export function canAccessAdminFeature(
  staffTitle: string | null | undefined,
  teamFeatures: readonly string[],
  feature: AdminFeatureKey
): boolean {
  if (isSuperAdminTitle(staffTitle)) return true;
  if (feature === "team" || feature === "access") return false;
  if (feature === "dashboard") return true;
  return teamFeatures.includes(feature);
}

export const TEAM_ACCESS_SQL = `create table if not exists public.portal_settings (
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
  with check (public.is_super_admin());`;
