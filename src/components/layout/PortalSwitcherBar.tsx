"use client";

import React from "react";
import { usePlatform } from "@/context/PlatformContext";
import { GraduationCap, Briefcase, ShieldCheck, UserCheck, Layers, HelpCircle } from "lucide-react";

export const PortalSwitcherBar: React.FC = () => {
  const { portalRole, setPortalRole, activeStudent, isStudentAuthenticated } = usePlatform();

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white text-xs py-2 px-4 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 shadow-md backdrop-blur-md">
      {/* Brand & Portal Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-[10px] text-white shadow-xs">
            DG
          </div>
          <span className="font-extrabold tracking-tight text-slate-100 hidden sm:inline">
            DevGrate Unified Platform
          </span>
        </div>
        <span className="text-slate-600 hidden md:inline">|</span>
        <span className="text-slate-400 text-[11px] hidden md:inline">
          Shared Reactive Architecture (Student • Partner • Super Admin)
        </span>
      </div>

      {/* Role / Portal Switcher Buttons */}
      <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
        {/* 1. Student Portal */}
        <button
          onClick={() => setPortalRole("student")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            portalRole === "student"
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-500/30 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
          title="Open Dedicated Student Portal"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student Portal</span>
          {portalRole === "student" && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>

        {/* 2. Partner / B2B Portal */}
        <button
          onClick={() => setPortalRole("partner")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            portalRole === "partner"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
          title="Open Existing Partner / B2B Portal"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Partner / B2B</span>
          {portalRole === "partner" && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>

        {/* 3. Super Admin Portal */}
        <button
          onClick={() => setPortalRole("admin")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            portalRole === "admin"
              ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-sm shadow-purple-500/30 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
          title="Open Super Admin Platform Control Center"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Super Admin</span>
          {portalRole === "admin" && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>
      </div>

      {/* Contextual Status Badge & Architecture Reminder */}
      <div className="flex items-center gap-2">
        {portalRole === "student" && (
          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 text-[11px]">
            <UserCheck className="w-3 h-3 text-orange-400" />
            {isStudentAuthenticated && activeStudent ? (
              <span className="text-slate-300">
                Logged In: <strong className="text-white">{activeStudent.name}</strong> ({activeStudent.profileCompletion}% profile)
              </span>
            ) : (
              <span className="text-amber-400 font-medium">Guest / Auth View</span>
            )}
          </div>
        )}

        {portalRole === "partner" && (
          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">
              Agent ID: <strong className="text-white">AGT-9041</strong> (Sarah Jenkins)
            </span>
          </div>
        )}

        {portalRole === "admin" && (
          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span className="text-slate-300">
              Role: <strong className="text-purple-300">Central Super Admin</strong>
            </span>
          </div>
        )}

        {/* Note on Agent Architecture Preservation */}
        <div
          className="hidden xl:flex items-center gap-1 text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800"
          title="Architecture Note: Agent login type preserved separately from Partner/B2B for future extension."
        >
          <Layers className="w-2.5 h-2.5 text-slate-500" />
          <span>Agent Role Modular</span>
        </div>
      </div>
    </div>
  );
};
