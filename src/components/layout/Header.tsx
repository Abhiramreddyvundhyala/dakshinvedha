"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Building2,
  Bell,
  ChevronDown,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  GraduationCap,
  Menu,
  LogOut,
  DollarSign,
  Headphones,
} from "lucide-react";
import { ApplicationRecord } from "@/types";
import { performLogout } from "@/utils/auth";
import { readSessionValue } from "@/utils/accounts";
import { usePlatform } from "@/context/PlatformContext";

interface HeaderProps {
  onToggleSidebarMobile: () => void;
  onSelectApplication: (app: ApplicationRecord) => void;
  onOpenPartnerProgram?: () => void;
  onOpenURMModal?: () => void;
  onOpenFinanceQuick?: () => void;
  onOpenSupportModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebarMobile,
  onSelectApplication,
  onOpenPartnerProgram,
  onOpenURMModal,
  onOpenFinanceQuick,
  onOpenSupportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { applications, notifications: platformNotifications, activeB2BPartner } = usePlatform();
  const [notifications, setNotifications] = useState(platformNotifications);
  const viewerName = readSessionValue("dakshin_user_name") || activeB2BPartner?.name || "Partner";
  const viewerEmail = readSessionValue("dakshin_user_email") || activeB2BPartner?.email || "";
  const memberKind = readSessionValue("dakshin_member_kind");
  const initials = viewerName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "DV";
  const orgLabel = activeB2BPartner?.organizationName || activeB2BPartner?.name || "B2B Partner";
  const roleLabel = memberKind === "team" ? "Team member" : "B2B owner";

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Filter applications live based on query
  const searchResults = searchQuery.trim()
    ? applications.filter((app) => {
        const q = searchQuery.toLowerCase();
        return (
          app.camsId.toLowerCase().includes(q) ||
          app.student.name.toLowerCase().includes(q) ||
          app.student.passportNumber.toLowerCase().includes(q) ||
          app.student.studentId.toLowerCase().includes(q) ||
          app.university.name.toLowerCase().includes(q) ||
          app.course.courseName.toLowerCase().includes(q)
        );
      })
    : [];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 px-3 sm:px-6 flex items-center justify-between shadow-xs">
      {/* LEFT: Mobile toggle & Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Company Logo */}
        <div className="flex items-center gap-2.5">
<<<<<<< HEAD
          <div className="w-9 h-9 rounded-xl bg-[#f97316] flex items-center justify-center text-white shadow-xs">
=======
          <div className="w-9 h-9 rounded-xl bg-[#D56732] flex items-center justify-center text-white shadow-xs">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                DAKSHINVEDHA ABROAD
              </span>
<<<<<<< HEAD
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-orange-50 text-[#f97316] border border-orange-200 rounded">
=======
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-[#FDF5F0] text-[#D56732] border border-[#F5D2C1] rounded">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                SOLUTIONS
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide hidden sm:block">
              Global Education & Overseas Admissions
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: Actions, Search, Dropdowns (NO Partner Growth button, NO 3 utility icons) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Application Search Field */}
        <div className="relative" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Enter CAMS / Name / Passport..."
<<<<<<< HEAD
              className="w-44 sm:w-64 md:w-72 pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-[#f97316] rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 transition-all"
=======
              className="w-44 sm:w-64 md:w-72 pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-[#D56732] rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D56732]/20 transition-all"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Live Search Results Dropdown */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute top-full right-0 sm:left-0 mt-1.5 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span>Search Results ({searchResults.length})</span>
                <span className="text-slate-400">Match by CAMS / Name / Passport / ID</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {searchResults.length > 0 ? (
                  searchResults.map((app) => (
                    <div
                      key={app.camsId}
                      onClick={() => {
                        onSelectApplication(app);
                        setIsSearchOpen(false);
                      }}
                      className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
<<<<<<< HEAD
                        <span className="text-xs font-bold text-[#f97316]">
=======
                        <span className="text-xs font-bold text-[#D56732]">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                          {app.camsId}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {app.primaryStatus}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900">
                        {app.student.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Passport: {app.student.passportNumber}</span>
                        <span>•</span>
                        <span>ID: {app.student.studentId}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 truncate mt-1">
                        {app.university.name} • {app.course.courseName}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No applications found matching &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

<<<<<<< HEAD
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg max-w-[180px]">
          <Building2 className="w-4 h-4 text-[#f97316] shrink-0" />
          <span className="font-medium truncate">{orgLabel}</span>
=======
        {/* Organization / Partner Branch Dropdown */}
        <div className="relative" ref={branchRef}>
          <button
            onClick={() => setIsBranchOpen(!isBranchOpen)}
            className="hidden lg:flex items-center gap-1.5 p-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            title="Agency Branch"
          >
            <Building2 className="w-4 h-4 text-[#D56732]" />
            <span className="font-medium max-w-[130px] truncate">{selectedBranch}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isBranchOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-fade-in text-xs">
              <div className="px-2 py-1.5 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Partner Branches
              </div>
              {[
                "GlobalEdu South Asia HQ",
                "Delhi Regional Branch (AGT-9041)",
                "Mumbai West Hub (AGT-9042)",
                "Dubai Operations Desk (AGT-9099)",
                "London Liaison Office (AGT-9104)",
              ].map((branch) => (
                <button
                  key={branch}
                  onClick={() => {
                    setSelectedBranch(branch);
                    setIsBranchOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between ${
                    selectedBranch === branch
                      ? "bg-[#FDF5F0] text-[#D56732] font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{branch}</span>
                  {selectedBranch === branch && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D56732]" />
                  )}
                </button>
              ))}
            </div>
          )}
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
<<<<<<< HEAD
            className="p-2 text-slate-600 hover:text-[#f97316] hover:bg-orange-50 rounded-lg transition-colors relative"
=======
            className="p-2 text-slate-600 hover:text-[#D56732] hover:bg-[#FDF5F0]/60 rounded-lg transition-colors relative"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
<<<<<<< HEAD
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#f97316] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
=======
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D56732] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
<<<<<<< HEAD
                    <span className="px-1.5 py-0.5 bg-orange-50 text-[#f97316] text-[10px] font-bold rounded-full">
=======
                    <span className="px-1.5 py-0.5 bg-[#FDF5F0] text-[#D56732] text-[10px] font-bold rounded-full">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
<<<<<<< HEAD
                    className="text-[11px] text-[#f97316] hover:text-[#ea580c] font-semibold hover:underline"
=======
                    className="text-[11px] text-[#D56732] hover:text-[#BA5322] font-semibold hover:underline"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.camsId) {
                        const app = applications.find(
                          (a) => a.camsId === item.camsId
                        );
                        if (app) onSelectApplication(app);
                      }
                      setIsNotifOpen(false);
                    }}
                    className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 flex gap-3 ${
<<<<<<< HEAD
                      !item.isRead ? "bg-orange-50" : ""
=======
                      !item.isRead ? "bg-[#FDF5F0]/40" : ""
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                    }`}
                  >
                    <div className="mt-0.5">
                      {item.type === "offer" && (
<<<<<<< HEAD
                        <div className="w-6 h-6 rounded-full bg-orange-50 text-[#f97316] flex items-center justify-center">
=======
                        <div className="w-6 h-6 rounded-full bg-[#FDF5F0] text-[#D56732] flex items-center justify-center">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                          <Sparkles className="w-3 h-3" />
                        </div>
                      )}
                      {item.type === "cas" && (
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <ShieldAlert className="w-3 h-3" />
                        </div>
                      )}
                      {item.type === "finance" && (
<<<<<<< HEAD
                        <div className="w-6 h-6 rounded-full bg-orange-50 text-[#f97316] flex items-center justify-center">
=======
                        <div className="w-6 h-6 rounded-full bg-[#FDF5F0] text-[#D56732] flex items-center justify-center">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                          <DollarSign className="w-3 h-3" />
                        </div>
                      )}
                      {item.type === "deadline" && (
                        <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                          <Bell className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-slate-900">{item.title}</span>
                        <span className="text-[10px] text-slate-400">{item.timeAgo}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {item.message}
                      </p>
                      {item.camsId && (
<<<<<<< HEAD
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#f97316] mt-1 hover:underline">
=======
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#D56732] mt-1 hover:underline">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                          View {item.camsId} <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="relative">
<<<<<<< HEAD
              <div className="w-8 h-8 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-xs">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-orange-500 border-2 border-white rounded-full"></span>
=======
              <div className="w-8 h-8 rounded-full bg-[#D56732] text-white flex items-center justify-center font-bold text-xs">
                SJ
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#D56732] border-2 border-white rounded-full"></span>
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {viewerName}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {roleLabel}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-fade-in text-xs">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="font-bold text-slate-900">{viewerName}</p>
                <p className="text-[11px] text-slate-500 truncate">{viewerEmail}</p>
                <div className="mt-1 flex items-center gap-1">
<<<<<<< HEAD
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span className="text-[10px] text-orange-700 font-semibold">
                    {activeB2BPartner ? `${roleLabel} · ${activeB2BPartner.partnerId}` : roleLabel}
                  </span>
=======
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D56732]"></span>
                  <span className="text-[10px] text-[#D56732] font-semibold">Active Agent #AGT-9041</span>
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                </div>
              </div>

              {onOpenSupportModal && (
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenSupportModal();
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Headphones className="w-3.5 h-3.5 text-slate-400" />
                  <span>Help</span>
                </button>
              )}
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  performLogout();
                }}
                className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
