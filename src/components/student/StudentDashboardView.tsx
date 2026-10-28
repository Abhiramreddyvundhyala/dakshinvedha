"use client";

import React, { useMemo } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { CourseInfo, UniversityInfo } from "@/types";
import {
  FileText,
  Clock,
  Award,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { ApplicationTracker } from "@/components/shared/ApplicationTracker";
import { ImportantNotices } from "@/components/dashboard/ImportantNotices";
import { intakeBounds } from "@/lib/catalogOffers";

interface StudentDashboardViewProps {
  onNavigateToUniversities: () => void;
  onNavigateToApplications: () => void;
  onNavigateToProfile: () => void;
  onOpenCompleteProfile: () => void;
  onSelectCourseToApply?: (course: CourseInfo) => void;
  onSelectUniversity?: (univ: UniversityInfo) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  onNavigateToUniversities,
  onNavigateToApplications,
  onNavigateToProfile,
  onOpenCompleteProfile,
}) => {
  const {
    activeStudent,
    studentApplications,
    courses,
  } = usePlatform();

  // Compute greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Compute KPIs
  const totalAppsCount = studentApplications.length;
  const offersCount = studentApplications.filter(
    (a) => a.primaryStatus.includes("Offer") || a.secondaryStatus.includes("Offer")
  ).length;
  const rejectedCount = studentApplications.filter((a) => a.primaryStatus === "Closed").length;

  const pendingDocsCount = useMemo(() => {
    if (!activeStudent) return 0;
    return activeStudent.documents.filter(
      (d) => d.status === "Not Uploaded" || d.status === "Re-upload Required" || d.status === "Rejected"
    ).length;
  }, [activeStudent]);

  const urgentDeadlinesCount = useMemo(() => {
    return courses.filter((course) => {
      const time = Date.parse(course.applicationDeadline);
      if (Number.isNaN(time)) return false;
      const days = (time - Date.now()) / 86400000;
      return days >= 0 && days <= 45;
    }).length;
  }, [courses]);

  // Urgent rejected or action required documents alert
  const flaggedDocuments = useMemo(() => {
    if (!activeStudent) return [];
    return activeStudent.documents.filter(
      (d) => d.status === "Re-upload Required" || d.status === "Rejected"
    );
  }, [activeStudent]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. TOP GREETING & PROFILE COMPLETION BANNER (Light Executive, No Black, No Blue) */}
      <div className="bg-[#FAFAF8] border border-[#E7E5E0] p-6 sm:p-7 rounded-2xl shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fff7ed] text-[#ea580c] text-xs font-semibold border border-[#fed7aa]">
              <Sparkles className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>
                {intakeBounds(courses) === "Intake not set"
                  ? "Admissions open"
                  : `Intakes ${intakeBounds(courses)}`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
              {greeting}, {activeStudent?.firstName || "Student"}!
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Find the right university and track your applications from one place.
            </p>
          </div>

          {/* Profile Completion Box */}
          <div className="bg-white border border-[#E7E5E0] p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row items-center gap-4 shrink-0 shadow-xs">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Profile Completion
              </span>
              <div className="flex items-center gap-2.5 mt-1">
                <span className="text-2xl font-bold text-[#ea580c]">
                  {activeStudent?.profileCompletion || 0}%
                </span>
                <div className="w-24 h-2 bg-slate-100 border border-[#E7E5E0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ea580c] rounded-full"
                    style={{ width: `${activeStudent?.profileCompletion || 0}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={onOpenCompleteProfile}
              className="h-10 px-4 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold rounded-[10px] shadow-xs transition-colors cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              COMPLETE PROFILE
            </button>
          </div>
        </div>
      </div>

      {/* Flagged / Rejected Document Alert if any */}
      {flaggedDocuments.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-fade-in shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-extrabold text-rose-900">
              Action Required: {flaggedDocuments.length} Document(s) require re-upload
            </p>
            {flaggedDocuments.map((doc) => (
              <p key={doc.id} className="text-rose-700 mt-0.5">
                • <strong>{doc.title}</strong>: {doc.rejectionReason || "Please upload a clearer scanned copy."}
              </p>
            ))}
          </div>
          <button
            onClick={onNavigateToProfile}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Re-Upload Now
          </button>
        </div>
      )}

      <ImportantNotices />

      {/* 2. DASHBOARD KPI CARDS (High Visibility on White Background) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Applications */}
        <div
          onClick={onNavigateToApplications}
          className="bg-white p-5 rounded-xl border border-[#E7E5E0] shadow-xs hover:border-[#fed7aa] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">My Applications</span>
            <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center border border-[#E7E5E0] group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-heading">
            {totalAppsCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <span>Track status & progress</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </p>
        </div>

        {/* KPI 2: Offers */}
        <div
          onClick={onNavigateToApplications}
          className="bg-white p-5 rounded-xl border border-[#E7E5E0] shadow-xs hover:border-[#fed7aa] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Offers Received</span>
            <div className="w-9 h-9 rounded-lg bg-[#fff7ed] text-[#ea580c] flex items-center justify-center border border-[#fed7aa] group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#ea580c] mt-2 font-heading">
            {offersCount}
          </p>
          <p className="text-[11px] text-[#ea580c] font-medium mt-1 flex items-center gap-1">
            <span>Conditional & Full Grants</span>
            <ChevronRight className="w-3 h-3 text-[#ea580c]" />
          </p>
        </div>

        {/* KPI 3: Pending Documents */}
        <div
          onClick={onNavigateToProfile}
          className="bg-white p-5 rounded-xl border border-[#E7E5E0] shadow-xs hover:border-amber-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Documents</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-heading">
            {pendingDocsCount}
          </p>
          <p className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
            <span>Upload to speed admission</span>
            <ChevronRight className="w-3 h-3 text-amber-600" />
          </p>
        </div>

        <div
          onClick={onNavigateToApplications}
          className="bg-white p-5 rounded-xl border border-[#E7E5E0] shadow-xs hover:border-rose-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Rejected</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200 group-hover:scale-105 transition-transform">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-heading">
            {rejectedCount}
          </p>
          <p className="text-[11px] text-rose-700 font-medium mt-1 flex items-center gap-1">
            <span>Cancelled or closed</span>
            <ChevronRight className="w-3 h-3 text-rose-600" />
          </p>
        </div>

        {/* KPI 4: Deadlines */}
        <div
          onClick={onNavigateToUniversities}
          className="bg-white p-5 rounded-xl border border-[#E7E5E0] shadow-xs hover:border-[#fed7aa] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Upcoming Deadlines</span>
            <div className="w-9 h-9 rounded-lg bg-[#FAFAF8] text-slate-700 flex items-center justify-center border border-[#E7E5E0] group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4 text-[#ea580c]" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-heading">
            {urgentDeadlinesCount}
          </p>
          <p className="text-[11px] text-[#ea580c] font-medium mt-1 flex items-center gap-1">
            <span>Deadlines in the next 45 days</span>
            <ChevronRight className="w-3 h-3 text-[#ea580c]" />
          </p>
        </div>
      </div>

      {/* 3. APPLICATION PROGRESS PREVIEW IF APPLICATIONS EXIST */}
      {studentApplications.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-[#E7E5E0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Active Application Progress
              </h2>
              <p className="text-xs text-slate-500">
                Live timeline of your application.
              </p>
            </div>
            <button
              onClick={onNavigateToApplications}
              className="text-xs font-semibold text-[#ea580c] hover:text-[#c2410c] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All Applications ({studentApplications.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Top Application Card with 11-stage summary */}
          {(() => {
            const topApp = studentApplications[0];
            return (
              <div className="p-4 sm:p-5 rounded-xl bg-[#FAFAF8] border border-[#E7E5E0] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-[#ea580c] bg-[#fff7ed] px-2.5 py-0.5 rounded border border-[#fed7aa]">
                      ID: {topApp.camsId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                      {topApp.course.courseName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {topApp.university.name} • {topApp.course.country}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="inline-block px-3 py-1 bg-[#fff7ed] text-[#ea580c] text-xs font-semibold rounded-full border border-[#fed7aa]">
                      {topApp.primaryStatus}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Updated: {topApp.dateModified}
                    </p>
                  </div>
                </div>

                <ApplicationTracker application={topApp} compact />
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
