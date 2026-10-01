"use client";

import React, { useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { ApplicationRecord, PrimaryStatusType, SecondaryStatusType } from "@/types";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  ShieldCheck,
  Edit2,
  Ban,
  X,
  Sparkles,
} from "lucide-react";

export const AdminApplicationsView: React.FC = () => {
  const { applications, updateApplicationStatus } = usePlatform();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected application to modify
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);

  // Form states for status update
  const [primaryStatus, setPrimaryStatus] = useState<PrimaryStatusType>("Application Submitted");
  const [secondaryStatus, setSecondaryStatus] = useState<SecondaryStatusType>("Documents Pending");
  const [timelineAdvanceStage, setTimelineAdvanceStage] = useState<string>("");
  const [naStages, setNaStages] = useState<string[]>([]);

  const filteredApps = applications.filter((app) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        app.camsId.toLowerCase().includes(q) ||
        app.student.name.toLowerCase().includes(q) ||
        app.university.name.toLowerCase().includes(q) ||
        app.course.courseName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== "all" && app.primaryStatus !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleOpenStatusManager = (app: ApplicationRecord) => {
    setSelectedApp(app);
    setPrimaryStatus(app.primaryStatus);
    setSecondaryStatus(app.secondaryStatus);
    setTimelineAdvanceStage(app.primaryStatus);
    const existingNA = app.timeline
      .filter((t) => t.state === "not_applicable")
      .map((t) => t.status);
    setNaStages(existingNA);
  };

  const handleToggleNA = (stageStatus: string) => {
    setNaStages((prev) =>
      prev.includes(stageStatus) ? prev.filter((s) => s !== stageStatus) : [...prev, stageStatus]
    );
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    updateApplicationStatus(
      selectedApp.camsId,
      primaryStatus,
      secondaryStatus,
      timelineAdvanceStage,
      naStages
    );

    setSelectedApp(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Central Application Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global master view of all student self-applied and partner-managed dossiers. Adjust status, issue offers, or customize 11-stage workflows.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Application ID, student name, university, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 rounded-xl border border-slate-200 text-xs"
        >
          <option value="all">All Primary Statuses</option>
          <option value="Application Submitted">Application Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="Submitted to University">Submitted to University</option>
          <option value="Offer Issued">Offer Issued</option>
          <option value="Payment Done">Payment Done</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b text-[11px] font-black text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">App ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">University & Course</th>
                <th className="p-4">Intake</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Current Status</th>
                <th className="p-4">Timeline</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => {
                const completedCount = app.timeline.filter((t) => t.state === "completed").length;
                const isStudentSelf = app.counselorName?.includes("Student");

                return (
                  <tr key={app.camsId} className="hover:bg-purple-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-purple-700">{app.camsId}</td>
                    <td className="p-4">
                      <strong className="text-slate-900 block">{app.student.name}</strong>
                      <span className="text-slate-400 text-[11px] font-mono">{app.student.studentId}</span>
                    </td>
                    <td className="p-4">
                      <strong className="text-slate-900 block">{app.course.courseName}</strong>
                      <span className="text-slate-500 text-[11px]">{app.university.name}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">{app.course.activeIntake}</td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isStudentSelf
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {isStudentSelf ? "Student Portal" : "Partner B2B"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          app.primaryStatus.includes("Offer")
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {app.primaryStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-700 text-[11px]">
                          {completedCount} / 11
                        </span>
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                          {app.timeline.map((t, idx) => (
                            <div
                              key={idx}
                              className={`h-full flex-1 ${
                                t.state === "completed"
                                  ? "bg-emerald-500"
                                  : t.state === "current"
                                  ? "bg-purple-600 animate-pulse"
                                  : t.state === "not_applicable"
                                  ? "bg-slate-300"
                                  : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenStatusManager(app)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Change Status
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLICATION STATUS & TIMELINE MODIFIER MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStatus}
            className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 text-xs max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase font-mono">
                  {selectedApp.camsId}
                </span>
                <h3 className="font-black text-sm text-slate-900">
                  Update Application Status & Workflow
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Status</label>
                <select
                  value={primaryStatus}
                  onChange={(e) => setPrimaryStatus(e.target.value as PrimaryStatusType)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold text-purple-900"
                >
                  <option value="Application Submitted">Application Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Submitted to University">Submitted to University</option>
                  <option value="Offer Issued">Offer Issued</option>
                  <option value="Payment Pending">Payment Pending</option>
                  <option value="Payment Done">Payment Done</option>
                  <option value="CAS Processing">CAS Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Secondary Status</label>
                <select
                  value={secondaryStatus}
                  onChange={(e) => setSecondaryStatus(e.target.value as SecondaryStatusType)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  <option value="Documents Pending">Documents Pending</option>
                  <option value="Documents Verified">Documents Verified</option>
                  <option value="Conditional Offer">Conditional Offer</option>
                  <option value="Unconditional Offer">Unconditional Offer</option>
                  <option value="Deposit Pending">Deposit Pending</option>
                  <option value="Deposit Paid">Deposit Paid</option>
                </select>
              </div>
            </div>

            {/* Advance Timeline Stage */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Advance / Complete Timeline Stage
              </label>
              <select
                value={timelineAdvanceStage}
                onChange={(e) => setTimelineAdvanceStage(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs"
              >
                {selectedApp.timeline.map((t, idx) => (
                  <option key={idx} value={t.status}>
                    {idx + 1}. {t.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Mark Stages as Not Applicable (CRITICAL REQUIREMENT) */}
            <div className="space-y-2 p-4 bg-slate-50 border rounded-2xl">
              <span className="font-black text-slate-900 block text-xs">
                Workflow Flexibility: Mark Stages as &quot;Not Applicable&quot; (N/A)
              </span>
              <p className="text-[11px] text-slate-500">
                Not every university uses the same workflow (e.g. CAS not applicable for Australia/US, or direct offers without initial review).
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {selectedApp.timeline.map((t, idx) => {
                  const isChecked = naStages.includes(t.status);
                  return (
                    <label
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer text-[11px]"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleNA(t.status)}
                        className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                      />
                      <span className={isChecked ? "line-through text-slate-400 font-medium" : "text-slate-700 font-bold"}>
                        {t.status}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save & Notify Student
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
