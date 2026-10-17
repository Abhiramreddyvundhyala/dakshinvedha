"use client";

import React, { useState, useMemo } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { ApplicationRecord } from "@/types";
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  Upload,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Plus,
} from "lucide-react";

interface StudentMyApplicationsViewProps {
  onSelectApplication: (app: ApplicationRecord) => void;
  onOpenApplyWizard: () => void;
  onOpenDocumentsProfile: () => void;
}

export const StudentMyApplicationsView: React.FC<StudentMyApplicationsViewProps> = ({
  onSelectApplication,
  onOpenApplyWizard,
  onOpenDocumentsProfile,
}) => {
  const { studentApplications } = usePlatform();

  // Filter Tabs: All, Draft, Submitted, Under Review, Offer Received, Completed, Rejected
  const [activeTab, setActiveTab] = useState<
    "All" | "Draft" | "Submitted" | "Under Review" | "Offer Received" | "Completed" | "Rejected"
  >("All");

  const filteredApplications = useMemo(() => {
    if (activeTab === "All") return studentApplications;
    if (activeTab === "Draft") {
      return studentApplications.filter((a) => a.primaryStatus === "Draft");
    }
    if (activeTab === "Submitted") {
      return studentApplications.filter(
        (a) =>
          a.primaryStatus === "Application Submitted" ||
          a.primaryStatus === "Submitted to University"
      );
    }
    if (activeTab === "Under Review") {
      return studentApplications.filter(
        (a) => a.primaryStatus === "Under Review" || a.secondaryStatus === "Documents Pending"
      );
    }
    if (activeTab === "Offer Received") {
      return studentApplications.filter(
        (a) =>
          a.primaryStatus.includes("Offer") ||
          a.secondaryStatus.includes("Offer") ||
          a.timeline.some((t) => t.status === "Offer Received" && t.state === "completed")
      );
    }
    if (activeTab === "Completed") {
      return studentApplications.filter(
        (a) => a.primaryStatus === "Completed" || a.primaryStatus === "Payment Done"
      );
    }
    if (activeTab === "Rejected") {
      return studentApplications.filter(
        (a) => a.primaryStatus === "Closed" || a.secondaryStatus.includes("Rejected")
      );
    }
    return studentApplications;
  }, [studentApplications, activeTab]);

  const tabsList = [
    "All",
    "Draft",
    "Submitted",
    "Under Review",
    "Offer Received",
    "Completed",
    "Rejected",
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-heading">
            My Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and manage your university applications, offers, and document submissions.
          </p>
        </div>

        <button
          onClick={onOpenApplyWizard}
          className="h-10 px-4 bg-[#0B5D3B] hover:bg-[#08482D] text-white font-semibold text-xs rounded-[10px] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Apply to New Course</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="inline-flex p-1 bg-[#F4F3EF] border border-[#E7E5E0]/70 rounded-xl overflow-x-auto gap-1 text-xs">
        {tabsList.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1.5 px-3 rounded-lg transition-all whitespace-nowrap cursor-pointer text-xs ${
                isSelected
                  ? "bg-white text-[#0B5D3B] font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 font-medium"
              }`}
            >
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {/* Application Cards List */}
      {filteredApplications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E7E5E0] shadow-xs space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            No applications found under &quot;{activeTab}&quot;
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don&apos;t have any application records matching this tab right now.
          </p>
          <button
            onClick={onOpenApplyWizard}
            className="h-10 px-4 bg-[#0B5D3B] hover:bg-[#08482D] text-white text-xs font-semibold rounded-[10px] cursor-pointer active:scale-[0.98]"
          >
            Start an Application
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredApplications.map((app) => {
            const completedStages = app.timeline.filter((t) => t.state === "completed").length;
            const isOfferReady =
              app.primaryStatus.includes("Offer") ||
              app.secondaryStatus.includes("Offer") ||
              app.timeline.some((t) => t.status === "Offer Received" && t.state === "completed");

            return (
              <div
                key={app.camsId}
                className="bg-white rounded-xl p-5 sm:p-6 border border-[#E7E5E0] shadow-xs hover:border-[#C8E5D5] transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Bar: ID & Current Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-[#E7E5E0]">
                      {app.camsId}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                        app.primaryStatus.includes("Offer")
                          ? "bg-[#EAF5EF] text-[#0B5D3B] border-[#C8E5D5]"
                          : app.primaryStatus === "Closed"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-slate-50 text-slate-700 border-[#E7E5E0]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          app.primaryStatus.includes("Offer")
                            ? "bg-[#0B5D3B]"
                            : app.primaryStatus === "Closed"
                            ? "bg-rose-500"
                            : "bg-slate-400"
                        }`}
                      />
                      {app.primaryStatus}
                    </span>
                  </div>

                  {/* Course & University */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0B5D3B] transition-colors">
                      {app.course.courseName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {app.university.name} • {app.course.campus}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-[#FAFAF8] rounded-xl text-[11px] border border-[#E7E5E0]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Intake</span>
                      <strong className="text-slate-800 truncate block">{app.course.activeIntake}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Submitted Date</span>
                      <strong className="text-slate-800 block">{app.dateAdded}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Last Updated</span>
                      <strong className="text-slate-800 block">{app.dateModified}</strong>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Progress Stage:</span>
                      <span className="font-semibold text-slate-800">
                        {completedStages} / 11 Completed
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex border border-[#E7E5E0]">
                      {app.timeline.map((st, i) => (
                        <div
                          key={i}
                          className={`h-full flex-1 border-r border-white/50 ${
                            st.state === "completed"
                              ? "bg-[#0B5D3B]"
                              : st.state === "current"
                              ? "bg-[#0B5D3B] animate-pulse"
                              : st.state === "not_applicable"
                              ? "bg-slate-300"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions depending on state */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E7E5E0]">
                  <button
                    onClick={() => onSelectApplication(app)}
                    className="flex-1 h-10 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-[#E7E5E0] rounded-[10px] transition-colors cursor-pointer text-center active:scale-[0.98]"
                  >
                    VIEW APPLICATION
                  </button>

                  {app.primaryStatus === "Draft" && (
                    <button
                      onClick={onOpenApplyWizard}
                      className="flex-1 h-10 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08482D] rounded-[10px] transition-colors cursor-pointer text-center active:scale-[0.98]"
                    >
                      CONTINUE APPLICATION
                    </button>
                  )}

                  {isOfferReady && (
                    <button
                      onClick={() => onSelectApplication(app)}
                      className="flex-1 h-10 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08482D] rounded-[10px] shadow-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1 active:scale-[0.98]"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>VIEW OFFER</span>
                    </button>
                  )}

                  <button
                    onClick={onOpenDocumentsProfile}
                    className="h-10 px-3 text-slate-500 hover:text-[#0B5D3B] hover:bg-[#EAF5EF] border border-[#E7E5E0] rounded-[10px] transition-colors cursor-pointer"
                    title="Upload additional documents"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
