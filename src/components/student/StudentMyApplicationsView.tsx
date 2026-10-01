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
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and manage your university applications, offers, and document submissions.
          </p>
        </div>

        <button
          onClick={onOpenApplyWizard}
          className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Apply to New Course</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-bold pb-1">
        {tabsList.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-3 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {/* Application Cards List */}
      {filteredApplications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900">
            No applications found under &quot;{activeTab}&quot;
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don&apos;t have any application records matching this tab right now.
          </p>
          <button
            onClick={onOpenApplyWizard}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl cursor-pointer"
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
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Bar: ID & Current Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200/60">
                      {app.camsId}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                        app.primaryStatus.includes("Offer")
                          ? "bg-emerald-100 text-emerald-800"
                          : app.primaryStatus === "Closed"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {app.primaryStatus}
                    </span>
                  </div>

                  {/* Course & University */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {app.course.courseName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {app.university.name} • {app.course.campus}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl text-[11px]">
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
                      <span className="font-bold text-slate-800">
                        {completedStages} / 11 Completed
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      {app.timeline.map((st, i) => (
                        <div
                          key={i}
                          className={`h-full flex-1 border-r border-white/50 ${
                            st.state === "completed"
                              ? "bg-emerald-500"
                              : st.state === "current"
                              ? "bg-orange-500 animate-pulse"
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
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onSelectApplication(app)}
                    className="flex-1 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    VIEW APPLICATION
                  </button>

                  {app.primaryStatus === "Draft" && (
                    <button
                      onClick={onOpenApplyWizard}
                      className="flex-1 py-2 text-xs font-extrabold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer text-center"
                    >
                      CONTINUE APPLICATION
                    </button>
                  )}

                  {isOfferReady && (
                    <button
                      onClick={() => onSelectApplication(app)}
                      className="flex-1 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>VIEW OFFER</span>
                    </button>
                  )}

                  <button
                    onClick={onOpenDocumentsProfile}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Upload additional documents"
                  >
                    <Upload className="w-3.5 h-3.5" />
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
