"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  History,
  Mail,
  Send,
  Search,
  PhoneCall,
  Sparkles,
  Ticket,
  DollarSign,
  MessageSquare,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FilePlus,
  ShieldCheck,
  CreditCard,
  Building,
  PiggyBank,
  Tag,
  Gift,
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
  | "other";

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (key: NavItemKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenAddNewModal: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onOpenAddNewModal,
  isMobileOpen,
  onCloseMobile,
}) => {
  // Expandable sections state
  const [isVoucherExpanded, setIsVoucherExpanded] = useState(
    currentTab.startsWith("voucher")
  );
  const [isFinanceExpanded, setIsFinanceExpanded] = useState(
    currentTab.startsWith("finance")
  );

  const handleNavClick = (key: NavItemKey) => {
    onSelectTab(key);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const isVoucherActive = currentTab.startsWith("voucher");
  const isFinanceActive = currentTab.startsWith("finance");

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-[101px] bottom-0 left-0 z-40 bg-[#0B132B] text-slate-300 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        } ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Circular Sidebar Collapse Control on Right Edge */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3.5 top-5 w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-600 text-white border-2 border-[#0B132B] items-center justify-center shadow-md transition-transform hover:scale-110 z-50 focus:outline-none"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>

        {/* Top Prominent Orange Button: "+ Add New Application" */}
        <div className="p-3.5 border-b border-slate-800/80">
          <button
            onClick={onOpenAddNewModal}
            className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-600/20 active:scale-98 transition-all flex items-center justify-center gap-2.5 py-3 ${
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

        {/* Sidebar Nav Items with Independent Vertical Scrollbar */}
        <div className="flex-1 overflow-y-auto sidebar-scroll py-2 px-2.5 space-y-1">
          {/* Dashboard */}
          <button
            onClick={() => handleNavClick("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
              currentTab === "dashboard"
                ? "bg-[#060B17] text-white border-l-4 border-orange-500 font-semibold shadow-inner"
                : "text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
            }`}
            title={isCollapsed ? "Dashboard" : undefined}
          >
            <LayoutDashboard
              className={`w-4 h-4 shrink-0 transition-colors ${
                currentTab === "dashboard"
                  ? "text-orange-400"
                  : "text-slate-400 group-hover:text-white"
              }`}
            />
            {!isCollapsed && <span className="truncate">Dashboard</span>}
          </button>

          {/* Application History */}
          <button
            onClick={() => handleNavClick("application-history")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
              currentTab === "application-history"
                ? "bg-[#060B17] text-white border-l-4 border-orange-500 font-semibold shadow-inner"
                : "text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
            }`}
            title={isCollapsed ? "Application History" : undefined}
          >
            <History
              className={`w-4 h-4 shrink-0 transition-colors ${
                currentTab === "application-history"
                  ? "text-orange-400"
                  : "text-slate-400 group-hover:text-white"
              }`}
            />
            {!isCollapsed && <span className="truncate">Application History</span>}
          </button>

          {/* Mail */}
          <button
            onClick={() => handleNavClick("mail")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
              currentTab === "mail"
                ? "bg-[#060B17] text-white border-l-4 border-orange-500 font-semibold shadow-inner"
                : "text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
            }`}
            title={isCollapsed ? "Mail" : undefined}
          >
            <div className="flex items-center gap-3">
              <Mail
                className={`w-4 h-4 shrink-0 transition-colors ${
                  currentTab === "mail"
                    ? "text-orange-400"
                    : "text-slate-400 group-hover:text-white"
                }`}
              />
              {!isCollapsed && <span className="truncate">Mail</span>}
            </div>
            {!isCollapsed && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-500/20 text-orange-400 rounded-full">
                3
              </span>
            )}
          </button>

          {/* Apply Enquiry */}
          <button
            onClick={() => handleNavClick("apply-enquiry")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
              currentTab === "apply-enquiry"
                ? "bg-[#060B17] text-white border-l-4 border-orange-500 font-semibold shadow-inner"
                : "text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
            }`}
            title={isCollapsed ? "Apply Enquiry" : undefined}
          >
            <Send
              className={`w-4 h-4 shrink-0 transition-colors ${
                currentTab === "apply-enquiry"
                  ? "text-orange-400"
                  : "text-slate-400 group-hover:text-white"
              }`}
            />
            {!isCollapsed && <span className="truncate">Apply Enquiry</span>}
          </button>

          {/* Search Program */}
          <button
            onClick={() => handleNavClick("search-program")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
              currentTab === "search-program"
                ? "bg-[#060B17] text-white border-l-4 border-orange-500 font-semibold shadow-inner"
                : "text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
            }`}
            title={isCollapsed ? "Search Program" : undefined}
          >
            <Search
              className={`w-4 h-4 shrink-0 transition-colors ${
                currentTab === "search-program"
                  ? "text-orange-400"
                  : "text-slate-400 group-hover:text-white"
              }`}
            />
            {!isCollapsed && <span className="truncate">Search Program</span>}
          </button>

          {/* URM Contact Number */}
          <button
            onClick={() => handleNavClick("urm-contact")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
              currentTab === "urm-contact"
                ? "bg-[#060B17] text-white border-l-4 border-orange-500 font-semibold shadow-inner"
                : "text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
            }`}
            title={isCollapsed ? "URM Contact Number" : undefined}
          >
            <PhoneCall
              className={`w-4 h-4 shrink-0 transition-colors ${
                currentTab === "urm-contact"
                  ? "text-orange-400"
                  : "text-slate-400 group-hover:text-white"
              }`}
            />
            {!isCollapsed && <span className="truncate">URM Contact Number</span>}
          </button>

          {/* Value Added Services */}
          <button
            onClick={() => handleNavClick("vas")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
              currentTab === "vas"
                ? "bg-[#060B17] text-white border-l-4 border-orange-500 font-semibold shadow-inner"
                : "text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
            }`}
            title={isCollapsed ? "Value Added Services" : undefined}
          >
            <Sparkles
              className={`w-4 h-4 shrink-0 transition-colors ${
                currentTab === "vas"
                  ? "text-orange-400"
                  : "text-slate-400 group-hover:text-white"
              }`}
            />
            {!isCollapsed && (
              <span className="truncate">Value Added Services</span>
            )}
          </button>

          {/* Voucher (Expandable) */}
          <div>
            <button
              onClick={() => {
                if (isCollapsed) onToggleCollapse();
                setIsVoucherExpanded(!isVoucherExpanded);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isVoucherActive
                  ? "text-white bg-white/5"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              title={isCollapsed ? "Voucher" : undefined}
            >
              <div className="flex items-center gap-3">
                <Ticket
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isVoucherActive
                      ? "text-orange-400"
                      : "text-slate-400 group-hover:text-white"
                  }`}
                />
                {!isCollapsed && <span className="truncate">Voucher</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isVoucherExpanded ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {/* Voucher Submenu */}
            {!isCollapsed && isVoucherExpanded && (
              <div className="ml-5 pl-3 border-l border-slate-800 space-y-1 my-1 animate-fade-in">
                <button
                  onClick={() => handleNavClick("voucher-buy")}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    currentTab === "voucher-buy"
                      ? "text-orange-400 font-semibold bg-white/5"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Buy Voucher</span>
                </button>
                <button
                  onClick={() => handleNavClick("voucher-manage")}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    currentTab === "voucher-manage"
                      ? "text-orange-400 font-semibold bg-white/5"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Manage Voucher List</span>
                </button>
              </div>
            )}
          </div>

          {/* Finance (Expandable) */}
          <div>
            <button
              onClick={() => {
                if (isCollapsed) onToggleCollapse();
                setIsFinanceExpanded(!isFinanceExpanded);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isFinanceActive
                  ? "text-white bg-white/5"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              title={isCollapsed ? "Finance" : undefined}
            >
              <div className="flex items-center gap-3">
                <DollarSign
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isFinanceActive
                      ? "text-orange-400"
                      : "text-slate-400 group-hover:text-white"
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
              <div className="ml-5 pl-3 border-l border-slate-800 space-y-1 my-1 animate-fade-in">
                <button
                  onClick={() => handleNavClick("finance-account")}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    currentTab === "finance-account"
                      ? "text-orange-400 font-semibold bg-white/5"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Account</span>
                </button>
                <button
                  onClick={() => handleNavClick("finance-commission")}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    currentTab === "finance-commission"
                      ? "text-orange-400 font-semibold bg-white/5"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Commission</span>
                </button>
                <button
                  onClick={() => handleNavClick("finance-promotional-commission")}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    currentTab === "finance-promotional-commission"
                      ? "text-orange-400 font-semibold bg-white/5"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Promotional Commission</span>
                </button>
                <button
                  onClick={() => handleNavClick("finance-accommodation-commission")}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    currentTab === "finance-accommodation-commission"
                      ? "text-orange-400 font-semibold bg-white/5"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Accommodation Commission</span>
                </button>
                <button
                  onClick={() => handleNavClick("finance-loan-commission")}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    currentTab === "finance-loan-commission"
                      ? "text-orange-400 font-semibold bg-white/5"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <PiggyBank className="w-3.5 h-3.5" />
                  <span>Loan Commission</span>
                </button>
                <button
                  onClick={() => handleNavClick("finance-promotional-deals")}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    currentTab === "finance-promotional-deals"
                      ? "text-orange-400 font-semibold bg-white/5"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Promotional Deals</span>
                </button>
              </div>
            )}
          </div>

          {/* Chat */}
          <button
            onClick={() => handleNavClick("chat")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
              currentTab === "chat"
                ? "bg-[#060B17] text-white border-l-4 border-orange-500 font-semibold shadow-inner"
                : "text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
            }`}
            title={isCollapsed ? "Chat" : undefined}
          >
            <div className="flex items-center gap-3">
              <MessageSquare
                className={`w-4 h-4 shrink-0 transition-colors ${
                  currentTab === "chat"
                    ? "text-orange-400"
                    : "text-slate-400 group-hover:text-white"
                }`}
              />
              {!isCollapsed && <span className="truncate">Chat</span>}
            </div>
            {!isCollapsed && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>

          {/* Other */}
          <button
            onClick={() => handleNavClick("other")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
              currentTab === "other"
                ? "bg-[#060B17] text-white border-l-4 border-orange-500 font-semibold shadow-inner"
                : "text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
            }`}
            title={isCollapsed ? "Other" : undefined}
          >
            <MoreHorizontal
              className={`w-4 h-4 shrink-0 transition-colors ${
                currentTab === "other"
                  ? "text-orange-400"
                  : "text-slate-400 group-hover:text-white"
              }`}
            />
            {!isCollapsed && <span className="truncate">Other</span>}
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#060B17]/60 text-slate-500 text-[10px] text-center">
          {!isCollapsed ? (
            <div className="space-y-0.5">
              <p>© 2026 Company Name - All Rights Reserved.</p>
              <p className="font-semibold text-slate-400">Version 1.0.0</p>
            </div>
          ) : (
            <span className="font-bold text-slate-400">v1.0</span>
          )}
        </div>
      </aside>
    </>
  );
};
