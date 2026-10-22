"use client";

import React, { useEffect, useState } from "react";
import { PlatformProvider, usePlatform } from "@/context/PlatformContext";
import { StudentPortalRoot } from "@/components/student/StudentPortalRoot";
import { PartnerPortalRoot } from "@/components/partner/PartnerPortalRoot";
import { AdminPortalRoot } from "@/components/admin/AdminPortalRoot";
import { AgentPortalRoot } from "@/components/agent/AgentPortalRoot";
import { Loader2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { fetchMyProfile } from "@/lib/portalDb";
import { sessionAccount } from "@/lib/records";
import { writeSession } from "@/utils/accounts";

function DashboardRouter() {
  const { portalRole, setPortalRole, syncError } = usePlatform();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabase();
      const session = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      if (!session.data.session) {
        window.location.href = "/?logout=true";
        return;
      }
      const profile = await fetchMyProfile();
      if (cancelled) return;
      if (!profile.ok || profile.data.status !== "Active") {
        await supabase?.auth.signOut();
        window.location.href = "/?logout=true";
        return;
      }
      writeSession(sessionAccount(profile.data), true);
      setPortalRole(profile.data.role);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [setPortalRole]);

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
      {syncError && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs font-semibold text-rose-800">{syncError}</div>
      )}
      {portalRole === "student" && <StudentPortalRoot />}
      {(portalRole === "partner" || portalRole === "team") && <PartnerPortalRoot />}
      {portalRole === "agent" && <AgentPortalRoot />}
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
