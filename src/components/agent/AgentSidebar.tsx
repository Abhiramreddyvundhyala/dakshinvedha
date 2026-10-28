"use client";

import React from "react";
import {
  LayoutDashboard,
  Building2,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { performLogout } from "@/utils/auth";
import { BrandMark } from "@/components/brand/BrandMark";

export type AgentNavTab = "dashboard" | "universities" | "applications" | "commission";

interface AgentSidebarProps {
  currentTab: AgentNavTab;
  onSelectTab: (tab: AgentNavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  name: string;
  trackingId: string;
  applicationCount: number;
  claimableCount: number;
}

const NAV_ITEMS: { key: AgentNavTab; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "universities", label: "Universities & Courses", icon: Building2 },
  { key: "applications", label: "Applications", icon: FileText },
  { key: "commission", label: "Commission", icon: Wallet },
];

export const AgentSidebar: React.FC<AgentSidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  name,
  trackingId,
  applicationCount,
  claimableCount,
}) => {
  const compact = collapsed && !mobileOpen;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-transform duration-300 w-64 ${
        collapsed ? "lg:w-[72px]" : "lg:w-64"
      } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      style={{ background: "#ffffff", borderRight: "1px solid #E7E5E0" }}
    >
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: "1px solid #E7E5E0" }}>
        <BrandMark className="h-10 w-10 shrink-0" />
        {!compact && (
          <div>
            <p className="text-sm font-bold tracking-tight leading-none" style={{ color: "#0f172a" }}>
              Dakshinvedha
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: "#ea580c" }}>
              Agent Portal
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          const badge = item.key === "applications" ? applicationCount : item.key === "commission" ? claimableCount : 0;
          const showBadge = badge > 0;
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
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: "#fff7ed", color: "#ea580c" }}>
                      {badge}
                    </span>
                  )}
                </>
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
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: "#FAFAF8", border: "1px solid #E7E5E0" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "#ea580c" }}>
            {name.charAt(0) || "A"}
          </div>
          {!compact && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate" style={{ color: "#0f172a" }}>{name}</p>
              <p className="text-[10px] truncate" style={{ color: "#94a3b8" }}>{trackingId || "Agent"}</p>
            </div>
          )}
          {!compact && (
            <button type="button" onClick={performLogout} className="p-1.5 rounded cursor-pointer" style={{ color: "#94a3b8" }} title="Sign out">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {compact && (
          <button type="button" onClick={performLogout} className="w-full flex items-center justify-center p-2 rounded-lg cursor-pointer" style={{ color: "#94a3b8" }} title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
