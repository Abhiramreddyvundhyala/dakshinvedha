"use client";

import React, { useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { StudentHeader, StudentNavTab } from "./StudentHeader";
import { StudentAuthView } from "./StudentAuthView";
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
  const { isStudentAuthenticated, activeStudent } = usePlatform();

  // Navigation tab inside student portal
  const [currentTab, setCurrentTab] = useState<StudentNavTab>("dashboard");

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

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-800 flex flex-col font-sans">
      {/* Student Top Header */}
      <StudentHeader
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === "universities") {
            // keep or reset selected university
          }
          setCurrentTab(tab);
        }}
        onOpenCompleteProfile={() => setIsOnboardingOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-7 space-y-6">
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
