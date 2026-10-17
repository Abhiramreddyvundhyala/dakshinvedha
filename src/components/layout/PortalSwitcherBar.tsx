"use client";

import React from "react";
import { usePlatform } from "@/context/PlatformContext";
import { GraduationCap, Briefcase, ShieldCheck, UserCheck, Layers, Building2 } from "lucide-react";

export const PortalSwitcherBar: React.FC = () => {
  const { portalRole, setPortalRole, activeStudent, isStudentAuthenticated, activeB2BPartner } = usePlatform();

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white text-xs py-2 px-4 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 shadow-md backdrop-blur-md">
      {/* Brand & Portal Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-[10px] text-white shadow-xs">
            DV
          </div>
          <span className="font-extrabold tracking-tight text-slate-100 hidden sm:inline">
            Dakshinvedha ABROAD Solutions
          </span>
        </div>
        <span className="text-slate-600 hidden md:inline">|</span>
        <span className="text-slate-400 text-[11px] hidden md:inline">
          Shared Reactive Architecture (Student • B2B • Agent • Super Admin)
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
          title="Open Student Portal"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student Portal</span>
          {portalRole === "student" && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>

        {/* 2. B2B / Partner Portal */}
        <button
          onClick={() => setPortalRole("partner")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            portalRole === "partner"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
          title="Open B2B / Partner Portal"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>B2B / Partner</span>
          {portalRole === "partner" && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>

        {/* 3. Agent Portal */}
        <button
          onClick={() => setPortalRole("agent")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            portalRole === "agent"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
          title="Open Agent Portal"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Agent</span>
          {portalRole === "agent" && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>

        {/* 4. Super Admin Portal */}
        <button
          onClick={() => setPortalRole("admin")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            portalRole === "admin"
              ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-sm shadow-purple-500/30 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
          title="Open Super Admin Control Center"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Super Admin</span>
          {portalRole === "admin" && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>
      </div>

      {/* Contextual Status Badge */}
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

        {(portalRole === "partner" || portalRole === "agent") && (
          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">
              {activeB2BPartner ? (
                <>Partner ID: <strong className="text-white">{activeB2BPartner.partnerId}</strong> ({activeB2BPartner.name})</>
              ) : (
                <>Agent ID: <strong className="text-white">AGT-9041</strong> (Agent)</>
              )}
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

        {/* Note on Architecture */}
        <div
          className="hidden xl:flex items-center gap-1 text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800"
          title="Dakshinvedha Unified Platform"
        >
          <Layers className="w-2.5 h-2.5 text-slate-500" />
          <span>Dakshinvedha Portal</span>
        </div>
      </div>
    </div>
  );
};
