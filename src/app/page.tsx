"use client";

import React from "react";
import { PlatformProvider, usePlatform } from "@/context/PlatformContext";
import { PortalSwitcherBar } from "@/components/layout/PortalSwitcherBar";
import { StudentPortalRoot } from "@/components/student/StudentPortalRoot";
import { PartnerPortalRoot } from "@/components/partner/PartnerPortalRoot";
import { AdminPortalRoot } from "@/components/admin/AdminPortalRoot";

function MainPortalRouter() {
  const { portalRole } = usePlatform();

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans">
      {/* 1. Global Portal Switcher Bar (Student • Partner/B2B • Super Admin) */}
      <PortalSwitcherBar />

      {/* 2. Dynamic Portal Root based on selected role */}
      {portalRole === "student" && <StudentPortalRoot />}
      {portalRole === "partner" && <PartnerPortalRoot />}
      {portalRole === "admin" && <AdminPortalRoot />}
    </div>
  );
}

export default function Home() {
  return (
    <PlatformProvider>
      <MainPortalRouter />
    </PlatformProvider>
  );
}
