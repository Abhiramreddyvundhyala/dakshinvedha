"use client";

import React from "react";
import {
  X,
  Building,
  GraduationCap,
  Calendar,
  DollarSign,
  FileCheck2,
  CheckCircle2,
  Award,
  Clock,
  ArrowRight,
  Globe,
  Briefcase,
} from "lucide-react";
import { CourseInfo } from "@/types";

interface ProgramDetailsModalProps {
  course: CourseInfo | null;
  onClose: () => void;
  onApplyNow: (course: CourseInfo) => void;
}

export const ProgramDetailsModal: React.FC<ProgramDetailsModalProps> = ({
  course,
  onClose,
  onApplyNow,
}) => {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-start justify-between border-b border-slate-700">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#0B5D3B] text-white">
                {course.studyLevel}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-700 text-slate-300">
                {course.courseType}
              </span>
              {course.badges.scholarship && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-amber-950 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Scholarship Available
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-1">
              {course.courseName}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              <span>{course.universityName}</span>
              <span>•</span>
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.campus}, {course.city}, {course.country}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-slate-400 text-[11px] font-medium">Tuition Fee</span>
              <p className="font-mono text-base font-bold text-slate-900 mt-0.5">
                {course.tuitionFee} / yr
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-medium">Application Fee</span>
              <p className="font-semibold text-slate-800 text-sm mt-0.5">
                {course.applicationFee}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-medium">Duration</span>
              <p className="font-semibold text-slate-800 text-sm mt-0.5">
                {course.duration}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-medium">Agency Commission</span>
              <p className="font-bold text-[#0B5D3B] text-sm mt-0.5">
                {course.commissionRate}
              </p>
            </div>
          </div>

          {/* Department & Academic Faculty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                Academic Faculty & Department
              </span>
              <p className="font-bold text-slate-800 text-sm">{course.department}</p>
              <p className="text-slate-500">Subject Field: <strong>{course.subject}</strong></p>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                Intake Schedules & Deadlines
              </span>
              <p className="font-semibold text-[#0B5D3B]">Active: {course.activeIntake}</p>
              <p className="text-slate-500">
                Application Deadline: <strong className="text-slate-900">{course.applicationDeadline}</strong>
              </p>
            </div>
          </div>

          {/* Entry Requirements */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-slate-400 text-xs">
              Admissions & Entry Criteria
            </h4>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-start gap-2">
                <FileCheck2 className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Academic Criteria:</span>
                  <p className="text-slate-600 leading-relaxed mt-0.5">
                    {course.entryRequirements.academic}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-slate-200/60">
                <Globe className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">English Language Requirements:</span>
                  <p className="text-slate-600 leading-relaxed mt-0.5">
                    {course.entryRequirements.english}
                  </p>
                </div>
              </div>

              {course.entryRequirements.workExperience && (
                <div className="flex items-start gap-2 pt-2 border-t border-slate-200/60">
                  <Briefcase className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Work Experience:</span>
                    <p className="text-slate-600 leading-relaxed mt-0.5">
                      {course.entryRequirements.workExperience}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interview & Scholarship Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1">
              <span className="font-bold text-emerald-950">Scholarship Information</span>
              <p className="text-slate-700">
                {course.scholarshipsInfo || "Standard institutional international bursaries applicable."}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900">Interview Requirement</span>
              <p className="text-slate-600">
                {course.badges.interviewRequired
                  ? "Admissions or Credibility interview required prior to unconditional offer issuance."
                  : "No interview required for standard applicants meeting all criteria."}
              </p>
            </div>
          </div>

          {/* Additional Notes */}
          {course.additionalNotes && (
            <div className="p-3 bg-slate-50 rounded-lg text-slate-600 text-xs">
              <strong>Counselor Note:</strong> {course.additionalNotes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-semibold text-xs hover:bg-slate-100 rounded-xl"
          >
            CLOSE
          </button>

          <button
            onClick={() => {
              onClose();
              onApplyNow(course);
            }}
            className="px-6 py-2.5 bg-[#0B5D3B] hover:bg-[#08482D] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>APPLY NOW</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
