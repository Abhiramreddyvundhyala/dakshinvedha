"use client";

import React, { useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { AdminTabKey } from "./AdminSidebar";
import { Bell, Menu, Search, X } from "lucide-react";

const TAB_LABELS: Record<AdminTabKey, string> = {
  dashboard:    "Dashboard",
  analytics:    "Analytics & Reports",
  students:     "Students",
  applications: "Applications",
  universities: "Universities",
  courses:      "Courses",
  documents:    "Documents Queue",
  partners:     "B2B Partners",
  agents:       "Agents",
  team:         "Team",
  access:       "Team Access",
  notices:      "Notices",
};

interface AdminTopbarProps {
  currentTab: AdminTabKey;
  onOpenMenu: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ currentTab, onOpenMenu }) => {
  const { notifications, markNotificationAsRead, clearNotifications } = usePlatform();
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState("");
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-3 px-3 sm:px-6 h-14"
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #dde1e7",
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onOpenMenu}
          className="lg:hidden p-2 rounded-lg cursor-pointer"
          style={{ background: "#f8fafc", border: "1px solid #dde1e7" }}
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" style={{ color: "#64748b" }} />
        </button>
        <div className="min-w-0">
        <h1 className="text-sm font-bold truncate" style={{ color: "#1e293b" }}>{TAB_LABELS[currentTab]}</h1>
        <p className="text-[10px]" style={{ color: "#94a3b8" }}>Admin Console</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: "#f8fafc", border: "1px solid #dde1e7" }}
        >
          <Search className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs outline-none w-32"
            style={{ color: "#1e293b" }}
          />
        </div>

        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg cursor-pointer"
            style={{ background: "#f8fafc", border: "1px solid #dde1e7" }}
          >
            <Bell className="w-4 h-4" style={{ color: "#64748b" }} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black text-white flex items-center justify-center"
                style={{ background: "#f97316" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              className="absolute right-0 top-11 w-72 rounded-xl overflow-hidden z-50"
              style={{ background: "#ffffff", border: "1px solid #dde1e7", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
            >
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderBottom: "1px solid #f0f2f5" }}
              >
                <p className="text-xs font-bold" style={{ color: "#1e293b" }}>Notifications</p>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] font-bold cursor-pointer"
                      style={{ color: "#f97316" }}
                    >
                      Clear all
                    </button>
                  )}
                  <button onClick={() => setShowNotifs(false)} style={{ color: "#94a3b8" }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs" style={{ color: "#94a3b8" }}>No notifications</p>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className="px-4 py-3 cursor-pointer"
                      style={{
                        borderBottom: "1px solid #f8fafc",
                        background: !n.isRead ? "#fff9f5" : "transparent",
                      }}
                    >
                      <div className="flex items-start gap-2">
                        {!n.isRead && (
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#f97316" }} />
                        )}
                        <div className={!n.isRead ? "" : "ml-3.5"}>
                          <p className="text-xs font-semibold" style={{ color: "#1e293b" }}>{n.title}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>{n.message}</p>
                          <p className="text-[10px] mt-1" style={{ color: "#94a3b8" }}>{n.timeAgo}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date */}
        <span
          className="hidden lg:block text-xs px-3 py-1.5 rounded-lg"
          style={{ background: "#f8fafc", border: "1px solid #dde1e7", color: "#64748b" }}
        >
          {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>
    </header>
  );
};
