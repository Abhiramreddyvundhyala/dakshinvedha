"use client";

import React, { useEffect, useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { ApplicationRecord } from "@/types";
import { listDirectory } from "@/lib/portalDb";
import type { DirectoryAccount } from "@/lib/records";
import { APPLICATION_STAGES, primaryForStage, resolveTimeline } from "@/utils/tracking";
import { newestFirst } from "@/lib/recent";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import { ApplicationTracker } from "@/components/shared/ApplicationTracker";
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

  const [stage, setStage] = useState<string>(APPLICATION_STAGES[0]);
  const [agentTrackingId, setAgentTrackingId] = useState("");
  const [agents, setAgents] = useState<DirectoryAccount[]>([]);
  useEffect(() => {
    void listDirectory().then((result) => {
      setAgents(result.accounts.filter((account) => account.role === "agent" && account.status === "Active"));
    });
  }, []);

  const filteredApps = newestFirst(applications, (app) => app.dateModified || app.dateAdded).filter((app) => {
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
    const current = resolveTimeline(app).find((item) => item.state === "current");
    setStage(current?.status || APPLICATION_STAGES[0]);
    setAgentTrackingId(app.agentTrackingId || "");
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const chosen = agents.find((agent) => agent.trackingId === agentTrackingId);
    const mapped = primaryForStage(stage);
    updateApplicationStatus(
      selectedApp.camsId,
      mapped.primary,
      mapped.secondary,
      stage,
      [],
      agentTrackingId ? { trackingId: agentTrackingId, name: chosen?.name || "Agent" } : null
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
            Applying sets stage 1. Choose the current stage once here. The student tracker uses that same stage.
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
                const isStudentSelf = app.counselorName?.includes("Student");

                return (
                  <tr key={app.camsId} className="hover:bg-orange-50/40 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-orange-700">{app.camsId}</div>
                      <div className="text-[10px] text-slate-400">{app.agentTrackingId ? app.counselorName : "No agent"}</div>
                    </td>
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
                            ? "bg-orange-100 text-orange-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {app.primaryStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <ApplicationTracker application={app} compact />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenStatusManager(app)}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
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
        <ModalOverlay onClose={() => setSelectedApp(null)}>
          <form
            onSubmit={handleSaveStatus}
            className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 text-xs max-h-[calc(100dvh-2rem)] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase font-mono">
                  {selectedApp.camsId}
                </span>
                <h3 className="font-black text-sm text-slate-900">
                  Update application stage
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

            <div>
              <label className="font-bold text-slate-700 block mb-1">Current stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold text-orange-900"
              >
                {APPLICATION_STAGES.map((status, idx) => (
                  <option key={status} value={status}>
                    Stage {idx + 1} of {APPLICATION_STAGES.length} — {status}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-slate-400">This is the only place a stage is changed. Earlier stages are marked complete.</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Assigned agent</label>
              <select
                value={agentTrackingId}
                onChange={(e) => setAgentTrackingId(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs"
              >
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.trackingId || agent.id}>
                    {agent.name} ({agent.trackingId})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-slate-400">Agents sign in separately. This does not add them to a B2B team.</p>
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
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save & Notify Student
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}
    </div>
  );
};
