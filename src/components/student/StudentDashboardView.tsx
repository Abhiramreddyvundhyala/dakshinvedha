"use client";

import React, { useMemo } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { CourseInfo, UniversityInfo } from "@/types";
import { evaluateFrontendEligibility } from "@/data/studentSeedData";
import {
  GraduationCap,
  Building2,
  FileText,
  Clock,
  Award,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Calendar,
  DollarSign,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Send,
} from "lucide-react";

interface StudentDashboardViewProps {
  onNavigateToUniversities: () => void;
  onNavigateToApplications: () => void;
  onNavigateToProfile: () => void;
  onOpenCompleteProfile: () => void;
  onSelectCourseToApply: (course: CourseInfo) => void;
  onSelectUniversity: (univ: UniversityInfo) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  onNavigateToUniversities,
  onNavigateToApplications,
  onNavigateToProfile,
  onOpenCompleteProfile,
  onSelectCourseToApply,
  onSelectUniversity,
}) => {
  const {
    activeStudent,
    studentApplications,
    courses,
    universities,
    notices,
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

  const pendingDocsCount = useMemo(() => {
    if (!activeStudent) return 0;
    return activeStudent.documents.filter(
      (d) => d.status === "Not Uploaded" || d.status === "Re-upload Required" || d.status === "Rejected"
    ).length;
  }, [activeStudent]);

  const urgentDeadlinesCount = 3;

  // Recommended Universities & Courses based on mock student preferences
  const recommendedCourses = useMemo(() => {
    if (!courses || courses.length === 0) return [];
    // Prioritize student's preferred study level and country
    const level = activeStudent?.studyPreferences.preferredStudyLevel || "Postgraduate";
    return courses
      .filter((c) => c.studyLevel === level || c.studyLevel === "Postgraduate")
      .slice(0, 4);
  }, [courses, activeStudent]);

  const recommendedUniversities = useMemo(() => {
    return universities.slice(0, 3);
  }, [universities]);

  // Urgent rejected or action required documents alert
  const flaggedDocuments = useMemo(() => {
    if (!activeStudent) return [];
    return activeStudent.documents.filter(
      (d) => d.status === "Re-upload Required" || d.status === "Rejected"
    );
  }, [activeStudent]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. TOP GREETING & PROFILE COMPLETION BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-700/60 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold border border-orange-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intake 2026/2027 Admissions Live</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {greeting}, {activeStudent?.firstName || "Student"}!
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Find the right university and track your applications from one place.
            </p>
          </div>

          {/* Profile Completion Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Profile Completion
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-white">
                  {activeStudent?.profileCompletion || 72}%
                </span>
                <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-amber-300 rounded-full"
                    style={{ width: `${activeStudent?.profileCompletion || 72}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={onOpenCompleteProfile}
              className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/30 transition-all cursor-pointer whitespace-nowrap active:scale-98"
            >
              [ COMPLETE PROFILE ]
            </button>
          </div>
        </div>
      </div>

      {/* Flagged / Rejected Document Alert if any */}
      {flaggedDocuments.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-fade-in">
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

      {/* 2. DASHBOARD KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Applications */}
        <div
          onClick={onNavigateToApplications}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">My Applications</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totalAppsCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Track status & progress</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        {/* KPI 2: Offers */}
        <div
          onClick={onNavigateToApplications}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Offers Received</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
            {offersCount}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <span>Conditional & Full Grants</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        {/* KPI 3: Pending Documents */}
        <div
          onClick={onNavigateToProfile}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Documents</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {pendingDocsCount}
          </p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
            <span>Upload to speed admission</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        {/* KPI 4: Deadlines */}
        <div
          onClick={onNavigateToUniversities}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Upcoming Deadlines</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {urgentDeadlinesCount}
          </p>
          <p className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
            <span>Sept 2026 intake cutoffs</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* 3. APPLICATION PROGRESS PREVIEW IF APPLICATIONS EXIST */}
      {studentApplications.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Active Application Progress
              </h2>
              <p className="text-xs text-slate-500">
                Live timeline of your primary application dossier.
              </p>
            </div>
            <button
              onClick={onNavigateToApplications}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Applications ({studentApplications.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Top Application Card with 11-stage summary */}
          {(() => {
            const topApp = studentApplications[0];
            return (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      ID: {topApp.camsId}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                      {topApp.course.courseName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {topApp.university.name} • {topApp.course.country}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full">
                      {topApp.primaryStatus}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Updated: {topApp.dateModified}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Application Flow Progress</span>
                    <span className="font-bold text-slate-800">
                      Stage {topApp.timeline.filter((t) => t.state === "completed").length} of 11
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                    {topApp.timeline.map((step, idx) => (
                      <div
                        key={idx}
                        className={`h-full flex-1 border-r border-white/40 ${
                          step.state === "completed"
                            ? "bg-emerald-500"
                            : step.state === "current"
                            ? "bg-orange-500 animate-pulse"
                            : step.state === "not_applicable"
                            ? "bg-slate-300"
                            : "bg-slate-200"
                        }`}
                        title={`${step.status} (${step.state})`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 4. RECOMMENDED FOR YOU (UNIVERSITY & COURSE CARDS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span>Recommended for You</span>
            </h2>
            <p className="text-xs text-slate-500">
              Curated institutions & courses matching your academic background and study preferences.
            </p>
          </div>
          <button
            onClick={onNavigateToUniversities}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All Universities</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recommended Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommendedCourses.map((course) => {
            const eligibility = evaluateFrontendEligibility(activeStudent, course);
            return (
              <div
                key={course.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {course.studyLevel}
                    </span>

                    {/* Frontend Mock Eligibility Badge */}
                    <div
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        eligibility.status === "Likely Eligible"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : eligibility.status === "Requirements Need Review"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-sky-50 text-sky-700 border border-sky-200"
                      }`}
                      title={eligibility.reasons.join(" • ")}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>{eligibility.status}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {course.courseName}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {course.universityName} • {course.campus}, {course.country}
                    </p>
                  </div>

                  {/* Course Details row */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Duration</span>
                      <strong className="text-slate-800">{course.duration}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tuition Fee</span>
                      <strong className="text-slate-800">{course.tuitionFee}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Intake</span>
                      <strong className="text-slate-800 truncate block">
                        {course.activeIntake.split("/")[0]}
                      </strong>
                    </div>
                  </div>

                  {/* Eligibility Reason Preview */}
                  <div className="text-[11px] text-slate-500 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                    <p className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider">
                      Academic Match Check:
                    </p>
                    <p className="truncate">• {eligibility.reasons[0] || "Eligibility calculated against profile."}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      const univ = universities.find((u) => u.id === course.universityId);
                      if (univ) onSelectUniversity(univ);
                    }}
                    className="flex-1 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    VIEW DETAILS
                  </button>
                  <button
                    onClick={() => onSelectCourseToApply(course)}
                    className="flex-1 py-2 text-xs font-black text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl shadow-xs transition-all cursor-pointer text-center flex items-center justify-center gap-1 active:scale-98"
                  >
                    <span>APPLY NOW</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RECOMMENDED UNIVERSITIES ROW */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900">
          Top Partner Institutions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {recommendedUniversities.map((univ) => (
            <div
              key={univ.id}
              onClick={() => onSelectUniversity(univ)}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all cursor-pointer space-y-3 group"
            >
              <div className="h-32 rounded-2xl bg-slate-100 overflow-hidden relative">
                <img
                  src={univ.image}
                  alt={univ.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 text-xl bg-white/90 p-1 rounded-lg backdrop-blur-xs">
                  {univ.logo}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {univ.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {univ.city}, {univ.country}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                <span className="text-slate-500">{univ.availableCoursesCount} Programs</span>
                <span className="text-orange-600 font-bold flex items-center gap-0.5">
                  <span>Explore</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
