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
  Menu,
  LogOut,
  DollarSign,
  Headphones,
} from "lucide-react";
import { ApplicationRecord } from "@/types";
import { BrandMark } from "@/components/brand/BrandMark";
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
          <BrandMark className="h-10 w-10 shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                DAKSHINVEDHA ABROAD
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-orange-50 text-[#f97316] border border-orange-200 rounded">
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
              className="w-44 sm:w-64 md:w-72 pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-[#f97316] rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 transition-all"
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
                        <span className="text-xs font-bold text-[#f97316]">
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

        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg max-w-[180px]">
          <Building2 className="w-4 h-4 text-[#f97316] shrink-0" />
          <span className="font-medium truncate">{orgLabel}</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-slate-600 hover:text-[#f97316] hover:bg-orange-50 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#f97316] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
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
                    <span className="px-1.5 py-0.5 bg-orange-50 text-[#f97316] text-[10px] font-bold rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-[#f97316] hover:text-[#ea580c] font-semibold hover:underline"
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
                      !item.isRead ? "bg-orange-50" : ""
                    }`}
                  >
                    <div className="mt-0.5">
                      {item.type === "offer" && (
                        <div className="w-6 h-6 rounded-full bg-orange-50 text-[#f97316] flex items-center justify-center">
                          <Sparkles className="w-3 h-3" />
                        </div>
                      )}
                      {item.type === "cas" && (
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <ShieldAlert className="w-3 h-3" />
                        </div>
                      )}
                      {item.type === "finance" && (
                        <div className="w-6 h-6 rounded-full bg-orange-50 text-[#f97316] flex items-center justify-center">
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
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#f97316] mt-1 hover:underline">
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
              <div className="w-8 h-8 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-xs">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-orange-500 border-2 border-white rounded-full"></span>
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
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span className="text-[10px] text-orange-700 font-semibold">
                    {activeB2BPartner ? `${roleLabel} · ${activeB2BPartner.partnerId}` : roleLabel}
                  </span>
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
