"use client";

import React, { useState } from "react";
import { StudentHeader, StudentNavTab } from "./StudentHeader";
import { StudentSidebar } from "./StudentSidebar";
import { StudentDashboardView } from "./StudentDashboardView";
import { StudentUniversitiesView } from "./StudentUniversitiesView";
import { StudentUniversityDetailsView } from "./StudentUniversityDetailsView";
import { StudentCourseDetailsModal } from "./StudentCourseDetailsModal";
import { StudentApplicationWizardModal } from "./StudentApplicationWizardModal";
import { StudentMyApplicationsView } from "./StudentMyApplicationsView";
import { StudentApplicationTrackingModal } from "./StudentApplicationTrackingModal";
import { StudentProfileView } from "./StudentProfileView";
import { StudentOnboardingWizard } from "./StudentOnboardingWizard";
import { CourseInfo, UniversityInfo, ApplicationRecord } from "@/types";

export const StudentPortalRoot: React.FC = () => {
  // Navigation tab inside student portal
  const [currentTab, setCurrentTab] = useState<StudentNavTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Selected University & target subtab ("details" | "courses")
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityInfo | null>(null);
  const [universityInitialTab, setUniversityInitialTab] = useState<"details" | "courses">("details");

  // Modals state
  const [viewingCourseDetails, setViewingCourseDetails] = useState<CourseInfo | null>(null);
  const [isApplyWizardOpen, setIsApplyWizardOpen] = useState(false);
  const [wizardTargetCourse, setWizardTargetCourse] = useState<CourseInfo | null>(null);
  const [selectedApplicationForTracking, setSelectedApplicationForTracking] =
    useState<ApplicationRecord | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);


  // Handler: When student selects university from discovery or dashboard
  const handleSelectUniversity = (univ: UniversityInfo, targetSection: "details" | "courses" = "details") => {
    setSelectedUniversity(univ);
    setUniversityInitialTab(targetSection);
    setCurrentTab("universities");
  };

  // Handler: When student clicks Apply Now from course card or modal
  const handleStartApply = (course: CourseInfo) => {
    setWizardTargetCourse(course);
    setViewingCourseDetails(null);
    setIsApplyWizardOpen(true);
  };

  const handleSelectTab = (tab: StudentNavTab) => {
    setCurrentTab(tab);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-800" style={{ background: "#FAFAF8" }}>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <StudentSidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
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
        <StudentHeader
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          onOpenCompleteProfile={() => setIsOnboardingOpen(true)}
          onOpenMenu={() => setMobileOpen(true)}
        />

        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-7 space-y-6 overflow-auto">
        {/* TAB 1: DASHBOARD */}
        {currentTab === "dashboard" && (
          <StudentDashboardView
            onNavigateToUniversities={() => {
              setSelectedUniversity(null);
              setCurrentTab("universities");
            }}
            onNavigateToApplications={() => setCurrentTab("applications")}
            onNavigateToProfile={() => setCurrentTab("profile")}
            onOpenCompleteProfile={() => setIsOnboardingOpen(true)}
            onSelectCourseToApply={handleStartApply}
            onSelectUniversity={(univ) => handleSelectUniversity(univ, "details")}
          />
        )}

        {/* TAB 2: UNIVERSITIES & COURSES */}
        {currentTab === "universities" && (
          <>
            {selectedUniversity ? (
              <StudentUniversityDetailsView
                university={selectedUniversity}
                initialTab={universityInitialTab}
                onBack={() => setSelectedUniversity(null)}
                onApplyCourse={handleStartApply}
                onOpenCourseDetails={(c) => setViewingCourseDetails(c)}
              />
            ) : (
              <StudentUniversitiesView
                onSelectUniversity={(univ, targetSection) =>
                  handleSelectUniversity(univ, targetSection)
                }
              />
            )}
          </>
        )}

        {/* TAB 3: MY APPLICATIONS */}
        {currentTab === "applications" && (
          <StudentMyApplicationsView
            onSelectApplication={(app) => setSelectedApplicationForTracking(app)}
            onOpenApplyWizard={() => {
              setWizardTargetCourse(null);
              setIsApplyWizardOpen(true);
            }}
            onOpenDocumentsProfile={() => setCurrentTab("profile")}
          />
        )}

        {/* TAB 4: PROFILE & DOCUMENTS */}
        {currentTab === "profile" && <StudentProfileView />}
        </main>
      </div>

      {/* MODALS */}
      {/* 1. Onboarding / Complete Profile Wizard */}
      {isOnboardingOpen && (
        <StudentOnboardingWizard
          onFinish={() => setIsOnboardingOpen(false)}
          onSaveForLater={() => setIsOnboardingOpen(false)}
        />
      )}

      {/* 2. Course Details Modal */}
      <StudentCourseDetailsModal
        course={viewingCourseDetails}
        onClose={() => setViewingCourseDetails(null)}
        onApplyNow={handleStartApply}
      />

      {/* 3. 8-Step Student Application Flow Wizard Modal */}
      <StudentApplicationWizardModal
        isOpen={isApplyWizardOpen}
        onClose={() => {
          setIsApplyWizardOpen(false);
          setWizardTargetCourse(null);
        }}
        initialCourse={wizardTargetCourse}
        onApplicationCompleted={(app) => {
          setSelectedApplicationForTracking(app);
          setCurrentTab("applications");
        }}
        onGoToDashboard={() => setCurrentTab("dashboard")}
      />

      {/* 4. 11-Stage Application Tracking Modal */}
      <StudentApplicationTrackingModal
        application={selectedApplicationForTracking}
        onClose={() => setSelectedApplicationForTracking(null)}
        onUploadAdditionalDoc={() => {
          setSelectedApplicationForTracking(null);
          setCurrentTab("profile");
        }}
      />
    </div>
  );
};
