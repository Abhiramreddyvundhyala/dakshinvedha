import { getSupabase } from "@/lib/supabase";

/**
 * Clears the Supabase session and the portal session keys, then returns to the login screen.
 */
export function performLogout() {
  const finish = () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        const keysToRemove = [
          "dakshin_authenticated",
          "dakshin_portal_role",
          "dakshin_user_email",
          "dakshin_user_name",
          "dakshin_account_id",
          "dakshin_partner_id",
          "dakshin_member_kind",
          "dakshin_tracking_id",
          "dakshin_student_auth",
          "dakshin_student_new_registration",
          "dakshin_new_student_name",
          "dakshin_new_student_mobile",
          "dakshin_new_student_email",
          "dakshin_new_student_password",
          "devgrate_authenticated",
          "devgrate_portal_role",
          "devgrate_user_email",
          "devgrate_user_name",
          "devgrate_student_auth",
          "devgrate_student_new_registration",
          "devgrate_new_student_name",
          "devgrate_new_student_mobile",
          "devgrate_new_student_email",
        ];
        keysToRemove.forEach((key) => localStorage.removeItem(key));
      }
    } catch (err) {
      console.error("Failed to clear authentication storage", err);
    }
    if (typeof window !== "undefined") {
      window.location.href = "/?logout=true";
    }
  };

  const supabase = getSupabase();
  if (!supabase) {
    finish();
    return;
  }
  void supabase.auth.signOut().finally(finish);
}
