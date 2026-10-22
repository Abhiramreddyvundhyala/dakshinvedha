import type { SupabaseClient } from "@supabase/supabase-js";

export async function createConfirmedUser(
  admin: SupabaseClient,
  input: { email: string; password: string; fullName: string; phone: string }
) {
  return admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName, phone: input.phone },
  });
}

export async function nextTrackingCode(admin: SupabaseClient, kind: string): Promise<{ code: string } | { error: string }> {
  const { data, error } = await admin.rpc("next_tracking_id", { p_kind: kind });
  if (error || typeof data !== "string") {
    return { error: error?.message || "Could not issue a tracking id." };
  }
  return { code: data };
}
