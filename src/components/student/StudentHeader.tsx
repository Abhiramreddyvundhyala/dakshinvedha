"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePlatform } from "@/context/PlatformContext";
import {
  GraduationCap,
  Bell,
  User,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  BookOpen,
  Building2,
  Clock,
  ExternalLink,
} from "lucide-react";

export type StudentNavTab = "dashboard" | "universities" | "applications" | "profile";

interface StudentHeaderProps {
  currentTab: StudentNavTab;
  onSelectTab: (tab: StudentNavTab) => void;
  onOpenCompleteProfile: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenCompleteProfile,
}) => {
  const { activeStudent, logoutStudent, studentNotifications, markNotificationAsRead, clearNotifications } =
    usePlatform();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = studentNotifications.filter((n) => !n.isRead);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-[#E7E5E0] sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onSelectTab("dashboard")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0B5D3B] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 tracking-tight leading-none block">
                Dakshinvedha
              </span>
              <span className="text-[10px] font-semibold text-[#0B5D3B] tracking-wider uppercase block">
                Abroad Solutions
              </span>
            </div>
          </div>

          {/* Student Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F4F3EF] p-1 rounded-full border border-[#E7E5E0]/70">
            <button
              onClick={() => onSelectTab("dashboard")}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                currentTab === "dashboard"
                  ? "bg-white text-[#0B5D3B] shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 font-medium"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onSelectTab("universities")}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                currentTab === "universities"
                  ? "bg-white text-[#0B5D3B] shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 font-medium"
              }`}
            >
              Universities & Courses
            </button>
            <button
              onClick={() => onSelectTab("applications")}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                currentTab === "applications"
                  ? "bg-white text-[#0B5D3B] shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 font-medium"
              }`}
            >
              My Applications
            </button>
            <button
              onClick={() => onSelectTab("profile")}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                currentTab === "profile"
                  ? "bg-white text-[#0B5D3B] shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 font-medium"
              }`}
            >
              Profile & Documents
            </button>
          </nav>
        </div>

        {/* Right: Profile completion pill, Notifications & User menu */}
        <div className="flex items-center gap-3">
          {/* Profile Completion Widget Pill */}
          <div className="hidden lg:flex items-center gap-2.5 bg-white border border-[#E7E5E0] px-3.5 py-1.5 rounded-full shadow-xs">
            <div className="w-16 h-2 bg-[#F0EEE9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0B5D3B] rounded-full transition-all duration-500"
                style={{ width: `${activeStudent?.profileCompletion || 72}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-800">
              {activeStudent?.profileCompletion || 72}%
            </span>
            <button
              onClick={onOpenCompleteProfile}
              className="text-[11px] font-semibold text-[#0B5D3B] hover:text-[#08482D] bg-[#EAF5EF] hover:bg-[#DCEFE3] border border-[#C8E5D5]/80 px-2.5 py-1 rounded-full transition-all cursor-pointer"
            >
              COMPLETE PROFILE
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
              title="Student Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 animate-fade-in text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-extrabold text-slate-900">
                    Notifications ({unreadNotifs.length} new)
                  </span>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[11px] text-orange-600 font-bold hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {studentNotifications.length === 0 ? (
                    <p className="text-center py-4 text-slate-400">No notifications yet</p>
                  ) : (
                    studentNotifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          !n.isRead
                            ? "bg-orange-50/60 border-orange-200/80"
                            : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-slate-900">{n.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.timeAgo}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Student Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#0B5D3B] text-white font-bold text-xs flex items-center justify-center">
                {activeStudent?.firstName?.charAt(0) || "S"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {activeStudent?.name || "Student"}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  ID: {activeStudent?.studentId || "STU-2026-101"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 animate-fade-in text-xs">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="font-bold text-slate-900">{activeStudent?.name}</p>
                  <p className="text-[11px] text-slate-400">{activeStudent?.email}</p>
                  <p className="text-[10px] text-[#0B5D3B] font-bold mt-1">
                    Student ID: {activeStudent?.studentId}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onSelectTab("profile");
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Full Profile</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onSelectTab("universities");
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Browse Universities</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenCompleteProfile();
                  }}
                  className="w-full text-left px-3 py-2 text-orange-700 hover:bg-orange-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer font-bold"
                >
                  <FileText className="w-3.5 h-3.5 text-orange-500" />
                  <span>Profile Completion ({activeStudent?.profileCompletion || 72}%)</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logoutStudent();
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex border-t border-slate-100 px-2 py-1.5 gap-1 bg-slate-50 overflow-x-auto">
        <button
          onClick={() => onSelectTab("dashboard")}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg whitespace-nowrap px-2.5 ${
            currentTab === "dashboard" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab("universities")}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg whitespace-nowrap px-2.5 ${
            currentTab === "universities" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
          }`}
        >
          Universities
        </button>
        <button
          onClick={() => onSelectTab("applications")}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg whitespace-nowrap px-2.5 ${
            currentTab === "applications" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
          }`}
        >
          Applications
        </button>
        <button
          onClick={() => onSelectTab("profile")}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg whitespace-nowrap px-2.5 ${
            currentTab === "profile" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
          }`}
        >
          Profile
        </button>
      </div>
    </header>
  );
};
