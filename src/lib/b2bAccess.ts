import { B2BTeamMember } from "@/types";

export const B2B_FEATURE_KEYS = ["dashboard", "applications", "search", "urm", "vas", "finance"] as const;

export type B2BFeatureKey = (typeof B2B_FEATURE_KEYS)[number];

export const B2B_GRANTABLE_FEATURES: B2BFeatureKey[] = ["applications", "search", "urm", "vas", "finance"];

export const B2B_FEATURE_COPY: Record<B2BFeatureKey, { label: string; description: string }> = {
  dashboard: {
    label: "Dashboard",
    description: "Home counts and notices. Always on so every team login has a landing page.",
  },
  applications: {
    label: "Applications",
    description: "Add an application and open application history.",
  },
  search: {
    label: "Search Program",
    description: "Search universities and courses, and apply from a course.",
  },
  urm: {
    label: "URM Contact",
    description: "University representative contact numbers.",
  },
  vas: {
    label: "Value Added Services",
    description: "Visa, accommodation, and the other services still on the menu.",
  },
  finance: {
    label: "Finance",
    description: "Bank account and commission.",
  },
};

const FEATURE_SET = new Set<string>(B2B_FEATURE_KEYS);

const TAB_FEATURE: Partial<Record<string, B2BFeatureKey>> = {
  dashboard: "dashboard",
  "application-history": "applications",
  "search-program": "search",
  "urm-contact": "urm",
  vas: "vas",
  "finance-account": "finance",
  "finance-commission": "finance",
};

export function normalizeB2BFeatures(raw: readonly string[] | undefined, fallbackAll: boolean): B2BFeatureKey[] {
  if (!raw) return fallbackAll ? [...B2B_FEATURE_KEYS] : ["dashboard"];
  const selected = raw.filter((item): item is B2BFeatureKey => FEATURE_SET.has(item) && item !== "dashboard");
  return ["dashboard", ...selected];
}

/** Owners see every screen. A team member with no saved feature list keeps the older full menu, except Team. */
export function canAccessB2BTab(isOwner: boolean, member: Pick<B2BTeamMember, "features"> | null, tab: string): boolean {
  if (tab === "team") return isOwner;
  if (tab === "apply-enquiry" || tab === "chat" || tab === "other" || tab.startsWith("voucher")) return false;
  if (isOwner) return true;
  const feature = TAB_FEATURE[tab];
  if (!feature) return false;
  if (!member || !Array.isArray(member.features)) return true;
  return normalizeB2BFeatures(member.features, false).includes(feature);
}
