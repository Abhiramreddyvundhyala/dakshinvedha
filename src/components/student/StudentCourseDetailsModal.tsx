"use client";

import React from "react";
import { CourseInfo } from "@/types";
import { usePlatform } from "@/context/PlatformContext";
import { evaluateFrontendEligibility } from "@/data/studentSeedData";
import {
  X,
  GraduationCap,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Award,
  ArrowRight,
  Info,
  Sparkles,
} from "lucide-react";

interface StudentCourseDetailsModalProps {
  course: CourseInfo | null;
  onClose: () => void;
  onApplyNow: (course: CourseInfo) => void;
}

export const StudentCourseDetailsModal: React.FC<StudentCourseDetailsModalProps> = ({
  course,
  onClose,
  onApplyNow,
}) => {
  const { activeStudent } = usePlatform();

  if (!course) return null;

  const eligibility = evaluateFrontendEligibility(activeStudent, course);
  const req = course.requirementsConfig;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-[#2E1810] border-b border-[#452216] text-white flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#D56732] text-white">
                {course.studyLevel}
              </span>
              <span className="text-xs text-slate-300 font-bold">
                {course.universityName} • {course.campus}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {course.courseName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs">
          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Duration</span>
              <strong className="text-slate-900 text-xs">{course.duration}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Tuition Fee</span>
              <strong className="text-slate-900 text-xs">{course.tuitionFee}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Application Fee</span>
              <strong className="text-slate-900 text-xs">
                {course.badges.noAppFee ? "Free / Waived" : course.applicationFee}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Active Intake</span>
              <strong className="text-slate-900 text-xs">{course.activeIntake}</strong>
            </div>
          </div>

          {/* FRONTEND ELIGIBILITY INDICATOR (CRITICAL REQUIREMENT) */}
          <div
            className={`p-5 rounded-2xl border ${
              eligibility.status === "Likely Eligible"
                ? "bg-[#FDF5F0] border-[#F5D2C1] text-[#8C370F]"
                : eligibility.status === "Requirements Need Review"
                ? "bg-amber-50/90 border-amber-300 text-amber-900"
                : "bg-sky-50/90 border-sky-300 text-sky-900"
            } space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span className="font-black text-sm">
                  Course Eligibility Status: {eligibility.status}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded">
                Frontend Match
              </span>
            </div>

            {/* Why points */}
            <div className="space-y-1 pl-1">
              <p className="font-bold text-xs">Assessment details based on your profile inputs:</p>
              {eligibility.reasons.map((r, idx) => (
                <p key={idx} className="text-xs flex items-start gap-1.5">
                  <span>•</span>
                  <span>{r}</span>
                </p>
              ))}
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] opacity-80 pt-2 border-t border-current/20 italic">
              {eligibility.disclaimer}
            </p>
          </div>

          {/* Detailed Course Requirements (Configured by Super Admin) */}
          {req && (
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-orange-500" />
                <span>Standard Admission Requirements</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p>
                    <strong className="text-slate-700">Minimum Academic Qualification:</strong>{" "}
                    {req.minQualification}
                  </p>
                  <p>
                    <strong className="text-slate-700">Accepted Degrees:</strong>{" "}
                    {req.acceptedDegrees.join(", ")}
                  </p>
                  <p>
                    <strong className="text-slate-700">Minimum CGPA / Percentage:</strong>{" "}
                    {req.minCgpa}/10 CGPA or {req.minPercentage}%
                  </p>
                  <p>
                    <strong className="text-slate-700">Max Backlogs Permitted:</strong>{" "}
                    {req.maxBacklogs} active backlogs
                  </p>
                </div>

                <div className="space-y-2">
                  <p>
                    <strong className="text-slate-700">Accepted English Exams:</strong>{" "}
                    {req.acceptedEnglishTests.join(", ")}
                  </p>
                  <p>
                    <strong className="text-slate-700">Minimum Band Cutoffs:</strong> IELTS {req.minIelts} • TOEFL {req.minToefl} • PTE {req.minPte}
                  </p>
                  <p>
                    <strong className="text-slate-700">English Waiver Available:</strong>{" "}
                    {req.englishWaiverAvailable ? "YES (70%+ in 12th English)" : "NO"}
                  </p>
                  <p>
                    <strong className="text-slate-700">Passport Required at Application:</strong>{" "}
                    {req.passportRequiredAtApplication ? "YES" : "NO (Can submit prior to CAS)"}
                  </p>
                </div>
              </div>

              {/* Required Documents List */}
              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700 block mb-1">
                  Required Dossier Documents:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {req.requiredDocuments.map((doc, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Scholarships Info */}
          {course.scholarshipsInfo && (
            <div className="p-4 bg-[#FDF5F0] border border-[#F5D2C1] rounded-2xl space-y-1">
              <span className="font-bold text-[#8C370F] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#D56732]" />
                <span>Scholarship Details</span>
              </span>
              <p className="text-xs text-[#BA5322]">{course.scholarshipsInfo}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onApplyNow(course);
            }}
            className="px-6 py-2.5 bg-[#D56732] hover:bg-[#BA5322] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <span>APPLY NOW FOR THIS COURSE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
