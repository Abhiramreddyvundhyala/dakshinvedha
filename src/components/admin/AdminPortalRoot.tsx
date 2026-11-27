"use client";

import React, { useEffect, useState } from "react";
import { AdminSidebar, AdminTabKey } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { AdminDashboardView } from "./AdminDashboardView";
import { AdminStudentsView } from "./AdminStudentsView";
import { AdminStudentDetailsModal } from "./AdminStudentDetailsModal";
import { AdminApplicationsView } from "./AdminApplicationsView";
import { AdminCoursesView } from "./AdminCoursesView";
import { AdminDocumentsQueueView } from "./AdminDocumentsQueueView";
import { AdminNoticesView } from "./AdminNoticesView";
import { AdminPartnersView } from "./AdminPartnersView";
import { AdminUniversitiesView } from "./AdminUniversitiesView";
import { AdminTeamView } from "./AdminTeamView";
import { AdminAgentsView } from "./AdminAgentsView";
import { AdminAnalyticsView } from "./AdminAnalyticsView";
import { AdminAccountsView } from "./AdminAccountsView";
import { AdminCommissionsView } from "./AdminCommissionsView";
import { StudentApplicationWizardModal } from "@/components/student/StudentApplicationWizardModal";
import { ApplicationRecord, StudentProfile } from "@/types";
import { usePlatform } from "@/context/PlatformContext";
import { CheckCircle2 } from "lucide-react";

export const AdminPortalRoot: React.FC = () => {
  const { canAccessAdminFeature, recordApplication, staffName } = usePlatform();
  const [currentTab, setCurrentTab] = useState<AdminTabKey>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<StudentProfile | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyKey, setApplyKey] = useState(0);
  const [applyNotice, setApplyNotice] = useState<string | null>(null);

  const openApply = () => {
    setApplyKey((key) => key + 1);
    setApplyOpen(true);
  };

  const handleFiled = (app: ApplicationRecord) => {
    const counselor = staffName || "Dakshinvedha Admin";
    recordApplication({
      ...app,
      counselorName: counselor,
      partnerTrackingId: undefined,
      partnerRecordId: undefined,
      agentTrackingId: undefined,
      agentProfileId: undefined,
    });
    setCurrentTab("applications");
    setApplyNotice(`Application ${app.camsId} submitted for ${app.student.name}.`);
    window.setTimeout(() => setApplyNotice(null), 4500);
  };

  const canApply = canAccessAdminFeature("applications");

  const openTab = (tab: AdminTabKey) => {
    setCurrentTab(canAccessAdminFeature(tab) ? tab : "dashboard");
  };

  useEffect(() => {
    if (!canAccessAdminFeature(currentTab)) setCurrentTab("dashboard");
  }, [canAccessAdminFeature, currentTab]);

  return (
    <div className="min-h-screen flex font-sans" style={{ background: "#eef0f4" }}>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={openTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64"
        }`}
      >
        <AdminTopbar currentTab={currentTab} onOpenMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-3 sm:p-6 overflow-auto">
          {currentTab === "dashboard" && (
            <AdminDashboardView onNavigateTab={openTab} onAddApplication={canApply ? openApply : undefined} />
          )}
          {currentTab === "analytics" && <AdminAnalyticsView />}
          {currentTab === "students" && <AdminStudentsView onSelectStudent={(s) => setSelectedStudentForDetails(s)} />}
          {currentTab === "applications" && (
            <AdminApplicationsView onAddApplication={canApply ? openApply : undefined} />
          )}
          {currentTab === "universities" && <AdminUniversitiesView />}
          {currentTab === "courses" && <AdminCoursesView />}
          {currentTab === "documents" && <AdminDocumentsQueueView />}
          {currentTab === "partners" && <AdminPartnersView />}
          {currentTab === "agents" && <AdminAgentsView />}
          {currentTab === "team" && <AdminTeamView />}
          {currentTab === "accounts" && <AdminAccountsView />}
          {currentTab === "notices" && <AdminNoticesView />}
          {currentTab === "commissions" && <AdminCommissionsView />}
        </main>
      </div>

      <AdminStudentDetailsModal
        student={selectedStudentForDetails}
        onClose={() => setSelectedStudentForDetails(null)}
      />

      {applyNotice && (
        <div className="fixed top-20 right-6 z-50 bg-white px-4 py-3 rounded-xl shadow-lg border border-orange-200 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center shrink-0 text-orange-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-slate-700">{applyNotice}</p>
        </div>
      )}

      <StudentApplicationWizardModal
        key={applyKey}
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
        fileFromProfile={false}
        counselorName={staffName || "Dakshinvedha Admin"}
        onApplicationCompleted={handleFiled}
        onGoToDashboard={() => {
          setApplyOpen(false);
          setCurrentTab("dashboard");
        }}
      />
    </div>
  );
};
