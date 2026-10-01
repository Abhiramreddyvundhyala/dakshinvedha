"use client";

import React, { useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import {
  ShieldCheck,
  Bell,
  Search,
  Users,
  Briefcase,
  FileText,
  Building2,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Megaphone,
} from "lucide-react";

export type AdminTabKey =
  | "overview"
  | "students"
  | "applications"
  | "courses"
  | "documents"
  | "notices";

interface AdminHeaderProps {
  currentTab: AdminTabKey;
  onSelectTab: (tab: AdminTabKey) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ currentTab, onSelectTab }) => {
  const { students, applications, notifications } = usePlatform();

  const pendingDocsCount = students.reduce((acc, s) => {
    return acc + s.documents.filter((d) => d.status === "Uploaded" || d.status === "Under Review").length;
  }, 0);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-[37px] z-40 shadow-md">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onSelectTab("overview")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-black text-white tracking-tight leading-none block">
                DevGrate Admin
              </span>
              <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase block">
                Super Admin Engine
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            {[
              { key: "overview", label: "Overview", icon: ShieldCheck },
              { key: "students", label: "Students", count: students.length, icon: Users },
              { key: "applications", label: "Applications", count: applications.length, icon: FileText },
              { key: "courses", label: "Course Requirements", icon: BookOpen },
              { key: "documents", label: "Doc Queue", count: pendingDocsCount, badgeColor: "bg-amber-500", icon: CheckCircle2 },
              { key: "notices", label: "Announcements", icon: Megaphone },
            ].map((t) => {
              const isSelected = currentTab === t.key;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => onSelectTab(t.key as AdminTabKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                  {t.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        t.badgeColor ? `${t.badgeColor} text-white` : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Admin User Profile */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
              SA
            </div>
            <div className="text-left hidden sm:block">
              <span className="font-extrabold text-white block leading-tight">Super Administrator</span>
              <span className="text-[10px] text-purple-400 block font-mono">ROOT_LEVEL_ACCESS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="lg:hidden flex border-t border-slate-800 px-2 py-1.5 gap-1 bg-slate-950 overflow-x-auto text-xs">
        {[
          { key: "overview", label: "Overview" },
          { key: "students", label: "Students" },
          { key: "applications", label: "Applications" },
          { key: "courses", label: "Requirements" },
          { key: "documents", label: "Doc Queue" },
          { key: "notices", label: "Notices" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => onSelectTab(t.key as AdminTabKey)}
            className={`py-1.5 px-2.5 rounded-lg whitespace-nowrap font-bold ${
              currentTab === t.key ? "bg-purple-600 text-white" : "text-slate-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </header>
  );
};
