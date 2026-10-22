"use client";

import React, { useState } from "react";
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
import { StudentProfile } from "@/types";

export const AdminPortalRoot: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AdminTabKey>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<StudentProfile | null>(null);

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
        onSelectTab={(tab) => setCurrentTab(tab)}
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
          {currentTab === "dashboard" && <AdminDashboardView onNavigateTab={(tab) => setCurrentTab(tab)} />}
          {currentTab === "analytics" && <AdminAnalyticsView />}
          {currentTab === "students" && <AdminStudentsView onSelectStudent={(s) => setSelectedStudentForDetails(s)} />}
          {currentTab === "applications" && <AdminApplicationsView />}
          {currentTab === "universities" && <AdminUniversitiesView />}
          {currentTab === "courses" && <AdminCoursesView />}
          {currentTab === "documents" && <AdminDocumentsQueueView />}
          {currentTab === "partners" && <AdminPartnersView />}
          {currentTab === "agents" && <AdminAgentsView />}
          {currentTab === "team" && <AdminTeamView />}
          {currentTab === "notices" && <AdminNoticesView />}
        </main>
      </div>

      <AdminStudentDetailsModal
        student={selectedStudentForDetails}
        onClose={() => setSelectedStudentForDetails(null)}
      />
    </div>
  );
};
