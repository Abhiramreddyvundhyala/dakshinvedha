"use client";

import React from "react";
import { usePlatform } from "@/context/PlatformContext";
import { performLogout } from "@/utils/auth";
import {
  LayoutDashboard, BarChart3, Users, FileText, Building2,
  BookOpen, FolderCheck, Building, UserCog, Megaphone,
  LogOut, ChevronLeft, ChevronRight, ShieldCheck, Headset, KeyRound, Wallet,
} from "lucide-react";
import type { AdminFeatureKey } from "@/lib/adminAccess";

export type AdminTabKey = AdminFeatureKey;

interface AdminSidebarProps {
  currentTab: AdminTabKey;
  onSelectTab: (tab: AdminTabKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: { key: AdminTabKey; label: string; icon: React.ElementType; group: string }[] = [
  { key: "dashboard",    label: "Dashboard",         icon: LayoutDashboard, group: "Overview"    },
  { key: "analytics",   label: "Analytics",          icon: BarChart3,       group: "Overview"    },
  { key: "students",    label: "Students",           icon: Users,           group: "Management"  },
  { key: "applications",label: "Applications",       icon: FileText,        group: "Management"  },
  { key: "universities",label: "Universities",       icon: Building,        group: "Management"  },
  { key: "courses",     label: "Courses",            icon: BookOpen,        group: "Management"  },
  { key: "documents",   label: "Documents Queue",    icon: FolderCheck,     group: "Management"  },
  { key: "partners",    label: "B2B Partners",       icon: Building2,       group: "Operations"  },
  { key: "agents",      label: "Agents",             icon: Headset,         group: "Operations"  },
  { key: "commissions", label: "Commissions",        icon: Wallet,          group: "Operations"  },
  { key: "team",        label: "Team",               icon: UserCog,         group: "Operations"  },
  { key: "accounts",    label: "Accounts",           icon: KeyRound,        group: "Operations"  },
  { key: "notices",     label: "Notices",            icon: Megaphone,       group: "Operations"  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab, onSelectTab, collapsed, onToggleCollapse, mobileOpen, onCloseMobile,
}) => {
  const { students, applications, staffName, staffTitle, canAccessAdminFeature } = usePlatform();

  const pendingDocs = students.reduce(
    (acc, s) => acc + s.documents.filter((d) => d.status === "Uploaded" || d.status === "Under Review").length, 0
  );
  const badges: Partial<Record<AdminTabKey, number>> = {
    students: students.length,
    applications: applications.length,
    documents: pendingDocs,
  };

  const visibleItems = NAV_ITEMS.filter((item) => canAccessAdminFeature(item.key));
  const groups = Array.from(new Set(visibleItems.map((n) => n.group)));
  const initials = (staffName || "A")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "A";
  const compact = collapsed && !mobileOpen;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-transform duration-300 w-64 ${
        collapsed ? "lg:w-[72px]" : "lg:w-64"
      } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      style={{
        background: "#ffffff",
        borderRight: "1px solid #dde1e7",
      }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-3 px-4 py-4"
        style={{ borderBottom: "1px solid #dde1e7" }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "#f97316" }}
        >
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        {!compact && (
          <div>
            <p className="text-sm font-black" style={{ color: "#1e293b" }}>Dakshinvedha</p>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#f97316" }}>
              Admin Console
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {groups.map((group) => (
          <div key={group} className="mb-4">
            {!compact && (
              <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-1" style={{ color: "#94a3b8" }}>
                {group}
              </p>
            )}
            <div className="space-y-0.5">
              {visibleItems.filter((n) => n.group === group).map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.key;
                const badge = badges[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onSelectTab(item.key);
                      onCloseMobile();
                    }}
                    title={compact ? item.label : undefined}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer relative"
                    style={{
                      background: isActive ? "#fff4ed" : "transparent",
                      color: isActive ? "#ea580c" : "#64748b",
                      borderLeft: isActive ? "3px solid #f97316" : "3px solid transparent",
                    }}
                  >
                    <Icon style={{ width: 17, height: 17, flexShrink: 0 }} />
                    {!compact && (
                      <>
                        <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                        {badge !== undefined && badge > 0 && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            style={
                              item.key === "documents"
                                ? { background: "#fff4ed", color: "#ea580c" }
                                : { background: "#eff6ff", color: "#2563eb" }
                            }
                          >
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                    {badge !== undefined && badge > 0 && compact && (
                      <span
                        className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full text-[9px] font-black text-white flex items-center justify-center"
                        style={{ background: "#f97316" }}
                      >
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-2" style={{ borderTop: "1px solid #dde1e7" }}>
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer"
          style={{ color: "#94a3b8" }}
        >
          {compact ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!compact && <span>Collapse</span>}
        </button>

        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
          style={{ background: "#f8fafc", border: "1px solid #dde1e7" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0"
            style={{ background: "#2563eb" }}
          >
            {initials}
          </div>
          {!compact && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate" style={{ color: "#1e293b" }}>{staffName || "Admin"}</p>
              <p className="text-[10px] truncate" style={{ color: "#94a3b8" }}>{staffTitle === "Super Admin" ? "Super Admin" : staffTitle === "Team" ? "Team member" : staffTitle || "Admin"}</p>
            </div>
          )}
          {!compact && (
            <button
              onClick={() => performLogout()}
              className="p-1.5 rounded cursor-pointer transition-colors"
              style={{ color: "#94a3b8" }}
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {compact && (
          <button
            onClick={() => performLogout()}
            className="w-full flex items-center justify-center p-2 rounded-lg cursor-pointer"
            style={{ color: "#94a3b8" }}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
