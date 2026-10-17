"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar, NavItemKey } from "@/components/layout/Sidebar";
import { KPICards } from "@/components/dashboard/KPICards";
import { ImportantNotices } from "@/components/dashboard/ImportantNotices";
import { UniversityDeadlines } from "@/components/dashboard/UniversityDeadlines";
import { LatestApplications } from "@/components/dashboard/LatestApplications";
import { ApplicationDetailsModal } from "@/components/modals/ApplicationDetailsModal";
import { ApplyNewCourseModal } from "@/components/modals/ApplyNewCourseModal";
import { ApplicationWizardModal } from "@/components/modals/ApplicationWizardModal";
import { ApplicationHistoryView } from "@/components/views/ApplicationHistoryView";
import { SearchProgramView } from "@/components/views/SearchProgramView";
import { URMContactView } from "@/components/views/URMContactView";
import { FinanceView } from "@/components/views/FinanceView";
import { VoucherView } from "@/components/views/VoucherView";
import { MailView } from "@/components/views/MailView";
import { ApplyEnquiryView } from "@/components/views/ApplyEnquiryView";
import { ChatView } from "@/components/views/ChatView";
import { ValueAddedServicesView } from "@/components/views/ValueAddedServicesView";
import { OtherView } from "@/components/views/OtherView";
import { B2BProfileWizard } from "./B2BProfileWizard";
import { B2BDashboardView } from "./B2BDashboardView";
import { usePlatform } from "@/context/PlatformContext";
import { ApplicationRecord, CourseInfo } from "@/types";
import { CheckCircle2 } from "lucide-react";
import { TeamManagementView } from "@/components/views/TeamManagementView";

export const PartnerPortalRoot: React.FC = () => {
  const { applications, updateApplicationStatus, universities, activeB2BPartner, portalRole } = usePlatform();

  // Profile completion state (once wizard is submitted in session, show dashboard)
  const [profileJustCompleted, setProfileJustCompleted] = useState(false);

  // Navigation & Layout States
  const [currentTab, setCurrentTab] = useState<NavItemKey>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null);

  // Two-Stage Application Creation Workflow Modals
  const [isApplyNewCourseOpen, setIsApplyNewCourseOpen] = useState(false);
  const [isApplicationWizardOpen, setIsApplicationWizardOpen] = useState(false);
  const [wizardCourseSelection, setWizardCourseSelection] = useState<{
    countryToApply: string;
    studentPassportCountry: string;
    intake: string;
    courseType: string;
    university: string;
    course: CourseInfo;
  } | null>(null);

  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Stage 1 -> Stage 2: Moving from "Apply For New Course" modal to the 7-step Application Wizard
  const handleProceedToWizard = (selection: {
    countryToApply: string;
    studentPassportCountry: string;
    intake: string;
    courseType: string;
    university: string;
    course: CourseInfo;
  }) => {
    setWizardCourseSelection(selection);
    setIsApplyNewCourseOpen(false);
    setIsApplicationWizardOpen(true);
  };

  // Handler: When a course is applied directly from SearchProgramView
  const handleApplyFromSearch = (course: CourseInfo) => {
    const universityObj = universities.find((u) => u.id === course.universityId);
    setWizardCourseSelection({
      countryToApply: course.country,
      studentPassportCountry: "India",
      intake: course.activeIntake,
      courseType: course.studyLevel,
      university: universityObj ? universityObj.name : course.campus,
      course: course,
    });
    setIsApplicationWizardOpen(true);
  };

  // Handler: When the wizard submits the application
  const handleApplicationSubmitted = (newApp: ApplicationRecord) => {
    setSuccessToast(`Application ${newApp.camsId} submitted successfully for ${newApp.student.name}!`);
    setTimeout(() => setSuccessToast(null), 4500);
  };

  // Handler: Save draft from wizard
  const handleSaveDraft = (draft: Partial<ApplicationRecord>) => {
    try {
      localStorage.setItem("devgrate_portal_application_draft", JSON.stringify(draft));
    } catch {
      // Ignore
    }
    setSuccessToast("Application draft saved locally.");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Handler: Cancel application from ApplicationHistoryView
  const handleCancelApplication = (camsId: string) => {
    updateApplicationStatus(camsId, "Closed", "Documents Pending");
    setSuccessToast(`Application ${camsId} marked as Cancelled.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // ============================================================
  // B2B PROFILE INCOMPLETE → Show Wizard
  // ============================================================
  if (activeB2BPartner && !activeB2BPartner.profileCompleted && !profileJustCompleted) {
    return (
      <B2BProfileWizard
        partner={activeB2BPartner}
        onComplete={() => setProfileJustCompleted(true)}
      />
    );
  }

  // ============================================================
  // B2B DASHBOARD TAB (special — uses B2BDashboardView for 'dashboard' tab)
  // ============================================================
  const isB2BMode = !!(activeB2BPartner);

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 flex flex-col font-sans selection:bg-[#D56732] selection:text-white">
      {/* 1. Fixed Top Header */}
      <Header
        onToggleSidebarMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onSelectApplication={(app) => setSelectedApplication(app)}
        onOpenURMModal={() => setCurrentTab("urm-contact")}
        onOpenFinanceQuick={() => setCurrentTab("finance-commission")}
        onOpenSupportModal={() => setCurrentTab("chat")}
      />

      {/* Global Success Notification Toast */}
      {successToast && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in">
          <div className="w-7 h-7 rounded-full bg-[#D56732]/20 text-[#E58D5F] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold">{successToast}</p>
        </div>
      )}

      {/* 2. Collapsible Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenAddNewModal={() => setIsApplyNewCourseOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 3. Scrollable Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out pt-16 ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-7 space-y-6">
          {/* TAB: DASHBOARD — Show B2B Dashboard for b2b/agent, standard for classic agents */}
          {currentTab === "dashboard" && (
            <>
              {isB2BMode ? (
                <B2BDashboardView
                  partner={activeB2BPartner!}
                  onSelectApplication={(app) => setSelectedApplication(app)}
                  onViewAllApplications={() => setCurrentTab("application-history")}
                  onAddNewApplication={() => setIsApplyNewCourseOpen(true)}
                />
              ) : (
                <div className="space-y-6 animate-fade-in">
                  {/* Agent Welcome Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <div>
                      <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>Welcome back!</span>
                        <span className="text-sm font-normal text-slate-400">|</span>
                        <span className="text-xs font-semibold text-[#D56732] bg-[#FDF5F0] px-2.5 py-0.5 rounded-full border border-[#F5D2C1]">
                          Partner ID: AGT-9041
                        </span>
                      </h1>
                      <p className="text-xs text-slate-500 mt-1">
                        Central Admissions Intake 2026/2027 Dashboard • Partner B2B Operations
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => setIsApplyNewCourseOpen(true)}
                        className="px-4 py-2 bg-[#D56732] hover:bg-[#BA5322] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#D56732]/10 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>+ Add New Application</span>
                      </button>
                    </div>
                  </div>

                  {/* TOP SECTION: KPI CARDS */}
                  <KPICards
                    onCardClick={(type) => {
                      if (type === "total" || type === "processed" || type === "cas") {
                        setCurrentTab("application-history");
                      }
                    }}
                  />

                  {/* MIDDLE SECTION: IMPORTANT NOTICES & UNIVERSITY DEADLINES */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
                    <ImportantNotices />
                    <UniversityDeadlines />
                  </div>

                  {/* BOTTOM SECTION: LATEST APPLICATIONS TABLE */}
                  <LatestApplications
                    applications={applications}
                    onSelectApplication={(app) => setSelectedApplication(app)}
                    onViewAllClick={() => setCurrentTab("application-history")}
                  />
                </div>
              )}
            </>
          )}

          {/* TAB: APPLICATION HISTORY */}
          {currentTab === "application-history" && (
            <ApplicationHistoryView
              applications={applications}
              onSelectApplication={(app) => setSelectedApplication(app)}
              onOpenAddNewModal={() => setIsApplyNewCourseOpen(true)}
              onCancelApplication={handleCancelApplication}
            />
          )}

          {/* TAB: SEARCH PROGRAM */}
          {currentTab === "search-program" && (
            <SearchProgramView onApplyCourse={handleApplyFromSearch} />
          )}

          {/* TAB: URM CONTACT NUMBER */}
          {currentTab === "urm-contact" && <URMContactView />}

          {/* TAB: VALUE ADDED SERVICES */}
          {currentTab === "vas" && <ValueAddedServicesView />}

          {/* TAB: VOUCHER (BUY / MANAGE) */}
          {(currentTab === "voucher-buy" || currentTab === "voucher-manage") && (
            <VoucherView subTab={currentTab === "voucher-buy" ? "buy" : "manage"} />
          )}

          {/* TAB: FINANCE & COMMISSIONS */}
          {currentTab.startsWith("finance") && (
            <FinanceView
              subTab={
                currentTab.replace("finance-", "") as
                  | "account"
                  | "commission"
                  | "promotional-commission"
                  | "accommodation-commission"
                  | "loan-commission"
                  | "promotional-deals"
              }
            />
          )}

          {/* TAB: MAIL */}
          {currentTab === "mail" && <MailView />}

          {/* TAB: APPLY ENQUIRY */}
          {currentTab === "apply-enquiry" && <ApplyEnquiryView />}

          {/* TAB: CHAT */}
          {currentTab === "chat" && <ChatView />}

          {/* TAB: TEAM MANAGEMENT */}
          {currentTab === "team" && <TeamManagementView />}

          {/* TAB: OTHER */}
          {currentTab === "other" && <OtherView />}
        </div>
      </main>

      {/* Modals */}
      <ApplicationDetailsModal
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
      />

      <ApplyNewCourseModal
        isOpen={isApplyNewCourseOpen}
        onClose={() => setIsApplyNewCourseOpen(false)}
        onProceedToWizard={handleProceedToWizard}
      />

      <ApplicationWizardModal
        isOpen={isApplicationWizardOpen}
        onClose={() => {
          setIsApplicationWizardOpen(false);
          setWizardCourseSelection(null);
        }}
        initialCourseSelection={wizardCourseSelection}
        onApplicationSubmitted={handleApplicationSubmitted}
        onSaveDraft={handleSaveDraft}
      />
    </div>
  );
};
