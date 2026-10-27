import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function authClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function checkPortalPassword(email: string, password: string) {
  const supabase = authClient();
  if (!supabase) return { ok: false as const, error: "Database is not configured.", status: 503 };
  const signed = await supabase.auth.signInWithPassword({ email, password });
  if (signed.error || !signed.data.user) {
    return {
      ok: false as const,
      error: "Those credentials were not accepted. Use the email and password issued for this portal.",
      status: 401,
    };
  }
  const admin = getSupabaseAdmin();
  const { data: profile } = admin
    ? await admin.from("profiles").select("status, full_name").eq("id", signed.data.user.id).maybeSingle()
    : { data: null };
  await supabase.auth.signOut();
  if (!profile || profile.status !== "Active") {
    return { ok: false as const, error: "This login is suspended.", status: 403 };
  }
  return { ok: true as const, fullName: profile.full_name || "" };
}

export async function openPortalSession(email: string, password: string) {
  const supabase = authClient();
  if (!supabase) return { ok: false as const, error: "Database is not configured.", status: 503 };
  const signed = await supabase.auth.signInWithPassword({ email, password });
  const session = signed.data.session;
  if (signed.error || !session) {
    return {
      ok: false as const,
      error: "Those credentials were not accepted. Use the email and password issued for this portal.",
      status: 401,
    };
  }
  return { ok: true as const, accessToken: session.access_token, refreshToken: session.refresh_token };
}
