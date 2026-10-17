"use client";

import React, { useState } from "react";
import { AdminHeader, AdminTabKey } from "./AdminHeader";
import { AdminOverviewView } from "./AdminOverviewView";
import { AdminStudentsView } from "./AdminStudentsView";
import { AdminStudentDetailsModal } from "./AdminStudentDetailsModal";
import { AdminApplicationsView } from "./AdminApplicationsView";
import { AdminCoursesView } from "./AdminCoursesView";
import { AdminDocumentsQueueView } from "./AdminDocumentsQueueView";
import { AdminNoticesView } from "./AdminNoticesView";
import { AdminPartnersView } from "./AdminPartnersView";
import { StudentProfile } from "@/types";

export const AdminPortalRoot: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AdminTabKey>("overview");
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<StudentProfile | null>(
    null
  );

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 flex flex-col font-sans">
      {/* Super Admin Top Header */}
      <AdminHeader currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />

      {/* Main Admin Content */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-7 space-y-6">
        {currentTab === "overview" && (
          <AdminOverviewView onNavigateTab={(tab) => setCurrentTab(tab)} />
        )}

        {currentTab === "students" && (
          <AdminStudentsView onSelectStudent={(s) => setSelectedStudentForDetails(s)} />
        )}

        {currentTab === "applications" && <AdminApplicationsView />}

        {currentTab === "courses" && <AdminCoursesView />}

        {currentTab === "documents" && <AdminDocumentsQueueView />}

        {currentTab === "partners" && <AdminPartnersView />}

        {currentTab === "notices" && <AdminNoticesView />}
      </main>

      {/* Student Details Review Modal */}
      <AdminStudentDetailsModal
        student={selectedStudentForDetails}
        onClose={() => setSelectedStudentForDetails(null)}
      />
    </div>
  );
};
