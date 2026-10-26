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
  "accounts",
  "access",
  "notices",
  "commissions",
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

export const DEFAULT_TEAM_FEATURES: AdminFeatureKey[] = ["dashboard"];

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
    description: "Create admin team logins and choose each person's screens. Super Admin only.",
  },
  accounts: {
    label: "Accounts",
    description: "Pause, reset, or delete any login, and review paused and deleted history.",
  },
  access: {
    label: "Team Access",
    description: "Unused. Feature access is set on each team member.",
  },
  notices: {
    label: "Notices",
    description: "Read and publish platform notices.",
  },
  commissions: {
    label: "Commissions",
    description: "Tuition booked, B2B commission, and agent commission. Shown with Applications or Analytics access.",
  },
};

const FEATURE_SET = new Set<string>(ADMIN_FEATURE_KEYS);

export function isSuperAdminTitle(title: string | null | undefined): boolean {
  return (title || "").trim() === "Super Admin";
}

export function parseTeamFeatures(raw: unknown): AdminFeatureKey[] {
  const source = Array.isArray(raw) ? raw : [];
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
  if (feature === "accounts") {
    return ["students", "partners", "agents"].some((item) => teamFeatures.includes(item));
  }
  if (feature === "commissions") {
    return ["applications", "analytics", "partners", "agents"].some((item) => teamFeatures.includes(item));
  }
  if (feature === "dashboard") return true;
  return teamFeatures.includes(feature);
}

export const MEMBER_FEATURES_SQL = `alter table public.profiles add column if not exists allowed_features jsonb;`;
export const TEAM_ACCESS_SQL = MEMBER_FEATURES_SQL;
