"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  History,
  Search,
  PhoneCall,
  Sparkles,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FilePlus,
  CreditCard,
  Users,
} from "lucide-react";

export type NavItemKey =
  | "dashboard"
  | "application-history"
  | "mail"
  | "apply-enquiry"
  | "search-program"
  | "urm-contact"
  | "vas"
  | "voucher-buy"
  | "voucher-manage"
  | "finance-account"
  | "finance-commission"
  | "finance-promotional-commission"
  | "finance-accommodation-commission"
  | "finance-loan-commission"
  | "finance-promotional-deals"
  | "chat"
  | "other"
  | "team";

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (key: NavItemKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenAddNewModal: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  showTeam?: boolean;
  canOpen?: (key: NavItemKey) => boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onOpenAddNewModal,
  isMobileOpen,
  onCloseMobile,
  showTeam = true,
  canOpen = () => true,
}) => {
  // Expandable sections state
  const [isFinanceExpanded, setIsFinanceExpanded] = useState(
    currentTab.startsWith("finance")
  );

  const handleNavClick = (key: NavItemKey) => {
    onSelectTab(key);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const isFinanceActive = currentTab.startsWith("finance");

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar Container (Clean white aesthetic - NO dark blue/black) */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 bg-white text-slate-700 border-r border-[#E7E5E0] shadow-2xs flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        } ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Circular Sidebar Collapse Control on Right Edge */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3.5 top-5 w-7 h-7 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white border-2 border-white items-center justify-center shadow-md transition-transform hover:scale-110 z-50 focus:outline-none cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>

        {/* Top Prominent Button: "+ Add New Application" */}
        {canOpen("application-history") && (
        <div className="p-3.5 border-b border-[#E7E5E0]">
          <button
            onClick={onOpenAddNewModal}
            className={`w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold rounded-xl shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2.5 py-3 cursor-pointer ${
              isCollapsed ? "px-2" : "px-4"
            }`}
            title="Add New Application"
          >
            <FilePlus className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <span className="text-xs font-bold tracking-wide uppercase truncate">
                Add New Application
              </span>
            )}
          </button>
        </div>
        )}

        {/* Sidebar Nav Items with Independent Vertical Scrollbar */}
        <div className="flex-1 overflow-y-auto sidebar-scroll py-2 px-2.5 space-y-1">
          {/* Dashboard */}
          <button
            onClick={() => handleNavClick("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
              currentTab === "dashboard"
                ? "bg-[#fff4ed] text-[#f97316] border-l-4 border-[#f97316] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-4 border-transparent"
            }`}
            title={isCollapsed ? "Dashboard" : undefined}
          >
            <LayoutDashboard
              className={`w-4 h-4 shrink-0 transition-colors ${
                currentTab === "dashboard"
                  ? "text-[#f97316]"
                  : "text-slate-400 group-hover:text-slate-700"
              }`}
            />
            {!isCollapsed && <span className="truncate">Dashboard</span>}
          </button>

          {canOpen("application-history") && (
          <button
            onClick={() => handleNavClick("application-history")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
              currentTab === "application-history"
                ? "bg-[#fff4ed] text-[#f97316] border-l-4 border-[#f97316] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-4 border-transparent"
            }`}
            title={isCollapsed ? "Application History" : undefined}
          >
            <History
              className={`w-4 h-4 shrink-0 transition-colors ${
                currentTab === "application-history"
                  ? "text-[#f97316]"
                  : "text-slate-400 group-hover:text-slate-700"
              }`}
            />
            {!isCollapsed && <span className="truncate">Application History</span>}
          </button>
          )}

          {canOpen("search-program") && (
          <button
            onClick={() => handleNavClick("search-program")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
              currentTab === "search-program"
                ? "bg-[#fff4ed] text-[#f97316] border-l-4 border-[#f97316] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-4 border-transparent"
            }`}
            title={isCollapsed ? "Search Program" : undefined}
          >
            <Search
              className={`w-4 h-4 shrink-0 transition-colors ${
                currentTab === "search-program"
                  ? "text-[#f97316]"
                  : "text-slate-400 group-hover:text-slate-700"
              }`}
            />
            {!isCollapsed && <span className="truncate">Search Program</span>}
          </button>
          )}

          {canOpen("urm-contact") && (
          <button
            onClick={() => handleNavClick("urm-contact")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
              currentTab === "urm-contact"
                ? "bg-[#fff4ed] text-[#f97316] border-l-4 border-[#f97316] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-4 border-transparent"
            }`}
            title={isCollapsed ? "URM Contact Number" : undefined}
          >
            <PhoneCall
              className={`w-4 h-4 shrink-0 transition-colors ${
                currentTab === "urm-contact"
                  ? "text-[#f97316]"
                  : "text-slate-400 group-hover:text-slate-700"
              }`}
            />
            {!isCollapsed && <span className="truncate">URM Contact Number</span>}
          </button>
          )}

          {canOpen("vas") && (
          <button
            onClick={() => handleNavClick("vas")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
              currentTab === "vas"
                ? "bg-[#fff4ed] text-[#f97316] border-l-4 border-[#f97316] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-4 border-transparent"
            }`}
            title={isCollapsed ? "Value Added Services" : undefined}
          >
            <Sparkles
              className={`w-4 h-4 shrink-0 transition-colors ${
                currentTab === "vas"
                  ? "text-[#f97316]"
                  : "text-slate-400 group-hover:text-slate-700"
              }`}
            />
            {!isCollapsed && (
              <span className="truncate">Value Added Services</span>
            )}
          </button>
          )}

          {canOpen("finance-account") && (
          <div>
            <button
              onClick={() => {
                if (isCollapsed) onToggleCollapse();
                setIsFinanceExpanded(!isFinanceExpanded);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                isFinanceActive
                  ? "text-[#f97316] bg-[#fff4ed] font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              title={isCollapsed ? "Finance" : undefined}
            >
              <div className="flex items-center gap-3">
                <DollarSign
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isFinanceActive
                      ? "text-[#f97316]"
                      : "text-slate-400 group-hover:text-slate-700"
                  }`}
                />
                {!isCollapsed && <span className="truncate">Finance</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isFinanceExpanded ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {/* Finance Submenu */}
            {!isCollapsed && isFinanceExpanded && (
              <div className="ml-5 pl-3 border-l border-[#E7E5E0] space-y-1 my-1 animate-fade-in">
                <button
                  onClick={() => handleNavClick("finance-account")}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    currentTab === "finance-account"
                      ? "text-[#f97316] font-semibold bg-[#fff4ed]"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Account</span>
                </button>
                <button
                  onClick={() => handleNavClick("finance-commission")}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    currentTab === "finance-commission"
                      ? "text-[#f97316] font-semibold bg-[#fff4ed]"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Commission</span>
                </button>
              </div>
            )}
          </div>
          )}

          {showTeam && (
          <button
            onClick={() => handleNavClick("team")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
              currentTab === "team"
                ? "bg-[#fff4ed] text-[#f97316] border-l-4 border-[#f97316] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-4 border-transparent"
            }`}
            title={isCollapsed ? "Team Management" : undefined}
          >
            <Users
              className={`w-4 h-4 shrink-0 transition-colors ${
                currentTab === "team"
                  ? "text-[#f97316]"
                  : "text-slate-400 group-hover:text-slate-700"
              }`}
            />
            {!isCollapsed && <span className="truncate">Team Management</span>}
          </button>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#E7E5E0] bg-[#FAFAF8] text-slate-400 text-[10px] text-center">
          {!isCollapsed ? (
            <div className="space-y-0.5">
              <p>© 2026 Dakshinvedha Abroad Solutions</p>
              <p className="font-semibold text-slate-500">Version 1.0.0</p>
            </div>
          ) : (
            <span className="font-bold text-slate-400">v1.0</span>
          )}
        </div>
      </aside>
    </>
  );
};
