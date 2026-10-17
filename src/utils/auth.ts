/**
 * Unified logout utility
 * Completely clears all session and local storage authentication flags
 * and redirects safely to the login screen.
 */
export function performLogout() {
  try {
    if (typeof window !== "undefined") {
      // Clear session storage completely
      sessionStorage.clear();

      // Clear all authentication & user keys in localStorage
      const keysToRemove = [
        "dakshin_authenticated",
        "dakshin_portal_role",
        "dakshin_user_email",
        "dakshin_user_name",
        "dakshin_student_auth",
        "dakshin_student_new_registration",
        "dakshin_new_student_name",
        "dakshin_new_student_mobile",
        "dakshin_new_student_email",
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

      keysToRemove.forEach((k) => localStorage.removeItem(k));
    }
  } catch (err) {
    console.error("Failed to clear authentication storage", err);
  }

  if (typeof window !== "undefined") {
    window.location.href = "/?logout=true";
  }
}
