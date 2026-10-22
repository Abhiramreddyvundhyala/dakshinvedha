"use client";

import React from "react";
<<<<<<< HEAD
import { usePlatform } from "@/context/PlatformContext";
=======
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
import {
  LayoutDashboard,
  Building2,
  FileText,
<<<<<<< HEAD
  User,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { StudentNavTab } from "./StudentHeader";

interface StudentSidebarProps {
  currentTab: StudentNavTab;
  onSelectTab: (tab: StudentNavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: { key: StudentNavTab; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "universities", label: "Universities & Courses", icon: Building2 },
  { key: "applications", label: "My Applications", icon: FileText },
  { key: "profile", label: "Profile & Documents", icon: User },
];

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { activeStudent, studentApplications, logoutStudent } = usePlatform();
  const compact = collapsed && !mobileOpen;
  const appCount = studentApplications.length;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-transform duration-300 w-64 ${
        collapsed ? "lg:w-[72px]" : "lg:w-64"
      } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      style={{
        background: "#ffffff",
        borderRight: "1px solid #E7E5E0",
      }}
    >
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: "1px solid #E7E5E0" }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white"
          style={{ background: "#ea580c" }}
        >
          <GraduationCap className="w-5 h-5" />
        </div>
        {!compact && (
          <div>
            <p className="text-sm font-bold tracking-tight leading-none" style={{ color: "#0f172a" }}>
              Dakshinvedha
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: "#ea580c" }}>
              Student Portal
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          const showBadge = item.key === "applications" && appCount > 0;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onSelectTab(item.key);
                onCloseMobile();
              }}
              title={compact ? item.label : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer relative"
              style={{
                background: isActive ? "#fff7ed" : "transparent",
                color: isActive ? "#ea580c" : "#64748b",
                borderLeft: isActive ? "3px solid #ea580c" : "3px solid transparent",
              }}
            >
              <Icon style={{ width: 17, height: 17, flexShrink: 0 }} />
              {!compact && (
                <>
                  <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                  {showBadge && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: "#fff7ed", color: "#ea580c" }}
                    >
                      {appCount}
                    </span>
                  )}
                </>
              )}
              {showBadge && compact && (
                <span
                  className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full text-[9px] font-black text-white flex items-center justify-center"
                  style={{ background: "#ea580c" }}
                >
                  {appCount > 9 ? "9+" : appCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 space-y-2" style={{ borderTop: "1px solid #E7E5E0" }}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer"
          style={{ color: "#94a3b8" }}
        >
          {compact ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!compact && <span>Collapse</span>}
        </button>

        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
          style={{ background: "#FAFAF8", border: "1px solid #E7E5E0" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: "#ea580c" }}
          >
            {activeStudent?.firstName?.charAt(0) || "S"}
          </div>
          {!compact && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate" style={{ color: "#0f172a" }}>
                {activeStudent?.name || "Student"}
              </p>
              <p className="text-[10px] truncate" style={{ color: "#94a3b8" }}>
                {activeStudent?.studentId || "Student ID"}
              </p>
            </div>
          )}
          {!compact && (
            <button
              type="button"
              onClick={logoutStudent}
              className="p-1.5 rounded cursor-pointer transition-colors"
              style={{ color: "#94a3b8" }}
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {compact && (
          <button
            type="button"
            onClick={logoutStudent}
            className="w-full flex items-center justify-center p-2 rounded-lg cursor-pointer"
            style={{ color: "#94a3b8" }}
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
=======
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Compass,
  Sparkles,
  HelpCircle,
  Award,
  ArrowUpRight,
} from "lucide-react";
import { StudentNavTab } from "./StudentHeader";
import { usePlatform } from "@/context/PlatformContext";

export interface StudentSidebarProps {
  currentTab: StudentNavTab;
  onSelectTab: (tab: StudentNavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenCompleteProfile?: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenCompleteProfile,
}) => {
  const { activeStudent, studentApplications } = usePlatform();

  const handleNavClick = (tab: StudentNavTab) => {
    onSelectTab(tab);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const navItems = [
    {
      id: "dashboard" as StudentNavTab,
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview & Activities",
    },
    {
      id: "universities" as StudentNavTab,
      label: "Universities & Courses",
      icon: Building2,
      description: "Explore Global Programs",
    },
    {
      id: "applications" as StudentNavTab,
      label: "My Applications",
      icon: FileText,
      description: "Track Status & Offers",
      badge: studentApplications.length > 0 ? studentApplications.length : undefined,
    },
    {
      id: "profile" as StudentNavTab,
      label: "Profile & Documents",
      icon: UserCheck,
      description: "KYC & Academic Records",
      pill: `${activeStudent?.profileCompletion || 72}%`,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 bg-white text-slate-700 border-r border-[#E7E5E0] shadow-2xs flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"
          } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Circular Sidebar Collapse Control on Right Edge */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3.5 top-5 w-7 h-7 rounded-full bg-[#D56732] hover:bg-[#BA5322] text-white border-2 border-white items-center justify-center shadow-md transition-transform hover:scale-110 z-50 focus:outline-none cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>

        {/* Top Section / Quick Action Button */}
        <div className="p-3.5 border-b border-[#E7E5E0]">
          <button
            onClick={() => handleNavClick("universities")}
            className={`w-full bg-[#D56732] hover:bg-[#BA5322] text-white font-semibold rounded-xl shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2.5 py-2.5 cursor-pointer ${isCollapsed ? "px-2" : "px-3.5"
              }`}
            title="Explore Universities"
          >
            <Compass className="w-4 h-4 shrink-0" />
            {!isCollapsed && (
              <span className="text-xs font-bold tracking-wide uppercase truncate">
                Explore Universities
              </span>
            )}
          </button>
        </div>

        {/* Nav Items List */}
        <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1.5">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-1">
              Main Menu
            </p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all group cursor-pointer ${isActive
                    ? "bg-[#FDF5F0] text-[#D56732] border-l-4 border-[#D56732] font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-4 border-transparent font-medium"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${isActive
                      ? "text-[#D56732]"
                      : "text-slate-400 group-hover:text-slate-700"
                    }`}
                />

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-left overflow-hidden">
                    <span className="truncate">{item.label}</span>

                    {item.badge !== undefined && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#D56732] text-white shrink-0">
                        {item.badge}
                      </span>
                    )}

                    {item.pill && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FDF5F0] text-[#D56732] shrink-0 border border-[#F5D2C1]">
                        {item.pill}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Profile Completion & Counselor Guidance Card */}
        <div className="p-3 border-t border-[#E7E5E0] bg-[#FAF9F5]">
          {!isCollapsed ? (
            <div className="p-3 rounded-xl bg-white border border-[#E7E5E0] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Profile Status
                </span>
                <span className="text-[11px] font-extrabold text-[#D56732]">
                  {activeStudent?.profileCompletion || 72}%
                </span>
              </div>

              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D56732] rounded-full transition-all duration-500"
                  style={{ width: `${activeStudent?.profileCompletion || 72}%` }}
                />
              </div>

              <button
                onClick={() => {
                  if (onOpenCompleteProfile) {
                    onOpenCompleteProfile();
                  } else {
                    handleNavClick("profile");
                  }
                }}
                className="w-full mt-1 text-[11px] font-semibold text-center py-1.5 rounded-lg bg-[#FDF5F0] hover:bg-[#FBE5D8] text-[#D56732] transition-colors cursor-pointer border border-[#F5D2C1]"
              >
                Complete Profile
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-1">
              <button
                onClick={() => {
                  if (onOpenCompleteProfile) {
                    onOpenCompleteProfile();
                  } else {
                    handleNavClick("profile");
                  }
                }}
                className="w-9 h-9 rounded-xl bg-[#FDF5F0] text-[#D56732] hover:bg-[#FBE5D8] flex items-center justify-center transition-colors cursor-pointer"
                title={`Profile: ${activeStudent?.profileCompletion || 72}% Complete`}
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
  );
};
