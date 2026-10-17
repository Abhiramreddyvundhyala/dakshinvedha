"use client";

import React, { useEffect, useState } from "react";
import { PlatformProvider, usePlatform } from "@/context/PlatformContext";
import { StudentPortalRoot } from "@/components/student/StudentPortalRoot";
import { PartnerPortalRoot } from "@/components/partner/PartnerPortalRoot";
import { AdminPortalRoot } from "@/components/admin/AdminPortalRoot";
import { Loader2 } from "lucide-react";

function DashboardRouter() {
  const { portalRole, setPortalRole, registerStudent } = usePlatform();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check authentication in SessionStorage or LocalStorage
    const isAuth =
      sessionStorage.getItem("dakshin_authenticated") === "true" ||
      localStorage.getItem("dakshin_authenticated") === "true" ||
      localStorage.getItem("devgrate_authenticated") === "true";

    if (!isAuth) {
      try {
        sessionStorage.clear();
        const keysToRemove = [
          "dakshin_authenticated",
          "dakshin_portal_role",
          "dakshin_user_email",
          "dakshin_user_name",
          "dakshin_student_auth",
          "devgrate_authenticated",
          "devgrate_portal_role",
          "devgrate_user_email",
          "devgrate_user_name",
          "devgrate_student_auth",
        ];
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {}
      window.location.href = "/?logout=true";
      return;
    }

    // Read the role set during login
    const savedRole =
      sessionStorage.getItem("dakshin_portal_role") ||
      localStorage.getItem("dakshin_portal_role") ||
      localStorage.getItem("devgrate_portal_role");
    if (savedRole === "student" || savedRole === "partner" || savedRole === "agent" || savedRole === "admin") {
      setPortalRole(savedRole);
    }

    // Handle new student registration from the login page
    const isNewReg =
      localStorage.getItem("dakshin_student_new_registration") ||
      localStorage.getItem("devgrate_student_new_registration");
    if (isNewReg === "true" && savedRole === "student") {
      const name =
        localStorage.getItem("dakshin_new_student_name") ||
        localStorage.getItem("devgrate_new_student_name") ||
        "New Student";
      const mobile =
        localStorage.getItem("dakshin_new_student_mobile") ||
        localStorage.getItem("devgrate_new_student_mobile") ||
        "+91 00000 00000";
      const email =
        localStorage.getItem("dakshin_new_student_email") ||
        localStorage.getItem("devgrate_new_student_email") ||
        "student@example.com";
      registerStudent({ name, mobile: mobile.startsWith("+") ? mobile : `+91 ${mobile}`, email });
      // Clean up
      localStorage.removeItem("dakshin_student_new_registration");
      localStorage.removeItem("dakshin_new_student_name");
      localStorage.removeItem("dakshin_new_student_mobile");
      localStorage.removeItem("dakshin_new_student_email");
      localStorage.removeItem("devgrate_student_new_registration");
      localStorage.removeItem("devgrate_new_student_name");
      localStorage.removeItem("devgrate_new_student_mobile");
      localStorage.removeItem("devgrate_new_student_email");
    }

    setReady(true);
    // Run once on mount to prevent infinite re-render loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans">
      {portalRole === "student" && <StudentPortalRoot />}
      {(portalRole === "partner" || portalRole === "agent") && <PartnerPortalRoot />}
      {portalRole === "admin" && <AdminPortalRoot />}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <PlatformProvider>
      <DashboardRouter />
    </PlatformProvider>
  );
}
