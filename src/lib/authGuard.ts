import { createClient } from "@supabase/supabase-js";
import { canAccessAdminFeature, isSuperAdminTitle, parseTeamFeatures, type AdminFeatureKey } from "@/lib/adminAccess";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export type CallerProfile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  status: string;
  tracking_id: string | null;
  partner_id: string | null;
  member_kind: string | null;
  staff_title: string | null;
  department: string | null;
};

export async function requireCaller(request: Request): Promise<{ caller: CallerProfile } | { error: string; status: number }> {
  const admin = getSupabaseAdmin();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!admin || !url || !anon) {
    return {
      error: "Database is not configured. Add the Supabase URL, anon key, and service role key in .env.local, then restart the app.",
      status: 503,
    };
  }
  const header = request.headers.get("authorization") || "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) return { error: "Sign in again before changing accounts.", status: 401 };

  const userClient = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await userClient.auth.getUser(token);
  if (error || !data.user) return { error: "Sign in again before changing accounts.", status: 401 };

  const { data: caller, error: profileError } = await admin.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
  if (profileError || !caller) return { error: "Your profile was not found.", status: 403 };
  if (caller.status !== "Active") return { error: "This login is suspended.", status: 403 };
  return { caller: caller as CallerProfile };
}

export function isGuardError(result: { caller: CallerProfile } | { error: string; status: number }): result is { error: string; status: number } {
  return "error" in result;
}

export function callerIsSuperAdmin(caller: CallerProfile): boolean {
  return caller.role === "admin" && caller.status === "Active" && isSuperAdminTitle(caller.staff_title);
}

export async function loadCallerTeamFeatures(): Promise<AdminFeatureKey[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return parseTeamFeatures(null);
  const { data } = await admin.from("portal_settings").select("team_features").eq("id", "global").maybeSingle();
  return parseTeamFeatures(data?.team_features);
}

export async function callerCanUseFeature(caller: CallerProfile, feature: AdminFeatureKey): Promise<boolean> {
  if (caller.role !== "admin") return false;
  if (callerIsSuperAdmin(caller)) return true;
  const features = await loadCallerTeamFeatures();
  return canAccessAdminFeature(caller.staff_title, features, feature);
}
