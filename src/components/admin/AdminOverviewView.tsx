"use client";

import React from "react";
import { usePlatform } from "@/context/PlatformContext";
import { AdminTabKey } from "./AdminHeader";
import {
  Users,
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface AdminOverviewViewProps {
  onNavigateTab: (tab: AdminTabKey) => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({ onNavigateTab }) => {
  const { students, applications, courses, universities } = usePlatform();

  const totalStudents = students.length;
  const totalApps = applications.length;
  const offersCount = applications.filter((a) => a.primaryStatus.includes("Offer")).length;
  const pendingDocsCount = students.reduce(
    (acc, s) => acc + s.documents.filter((d) => d.status === "Uploaded" || d.status === "Under Review").length,
    0
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-purple-800/40 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 uppercase tracking-wider">
            Platform Master Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Central Platform Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Live reactive overview of all students, partners, applications, and university requirements across Dakshinvedha Abroad Solutions.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div
          onClick={() => onNavigateTab("students")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
        >
          <span className="text-xs font-bold text-slate-500">Registered Students</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalStudents}</p>
          <p className="text-[11px] text-purple-700 font-bold mt-1 flex items-center gap-1">
            <span>Manage directory</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("applications")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
        >
          <span className="text-xs font-bold text-slate-500">Total Applications</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalApps}</p>
          <p className="text-[11px] text-purple-700 font-bold mt-1 flex items-center gap-1">
            <span>View pipeline</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("applications")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group"
        >
          <span className="text-xs font-bold text-slate-500">Offers Issued</span>
          <p className="text-2xl sm:text-3xl font-black text-orange-600 mt-2">{offersCount}</p>
          <p className="text-[11px] text-orange-700 font-bold mt-1 flex items-center gap-1">
            <span>Scholarship grants</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("documents")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <span className="text-xs font-bold text-slate-500">Documents Pending Queue</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">{pendingDocsCount}</p>
          <p className="text-[11px] text-amber-700 font-bold mt-1 flex items-center gap-1">
            <span>Review dossier scans</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Recent Applications Feed */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900">
            Recent Applications Stream
          </h2>
          <button
            onClick={() => onNavigateTab("applications")}
            className="text-xs font-bold text-purple-700 hover:underline"
          >
            View all ({applications.length})
          </button>
        </div>

        <div className="space-y-3">
          {applications.slice(0, 5).map((app) => (
            <div
              key={app.camsId}
              className="p-3.5 bg-slate-50 border rounded-2xl flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-mono font-bold text-purple-700">{app.camsId}</span>
                <p className="font-extrabold text-slate-900 mt-0.5">
                  {app.student.name} • {app.course.courseName}
                </p>
                <p className="text-[11px] text-slate-500">
                  {app.university.name} • Submitted: {app.dateAdded}
                </p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  app.primaryStatus.includes("Offer")
                    ? "bg-orange-100 text-orange-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {app.primaryStatus}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
