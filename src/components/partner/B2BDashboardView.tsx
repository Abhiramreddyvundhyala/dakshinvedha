"use client";

import React, { useState, useMemo } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { B2BPartnerProfile, ApplicationRecord } from "@/types";
import {
  FileText, Loader2, CheckCircle2, XCircle, Plus, ArrowRight, Users, TrendingUp,
} from "lucide-react";
import { readSessionValue } from "@/utils/accounts";
import { ImportantNotices } from "@/components/dashboard/ImportantNotices";
import { LatestApplications } from "@/components/dashboard/LatestApplications";
import { ApplicationDetailsModal } from "@/components/modals/ApplicationDetailsModal";

interface B2BDashboardViewProps {
  partner: B2BPartnerProfile;
  onSelectApplication?: (app: ApplicationRecord) => void;
  onViewAllApplications?: () => void;
  onAddNewApplication?: () => void;
}

const CARD = {
  background: "#ffffff",
  border: "1px solid #dde1e7",
  borderRadius: 10,
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

export const B2BDashboardView: React.FC<B2BDashboardViewProps> = ({
  partner,
  onSelectApplication,
  onViewAllApplications,
  onAddNewApplication,
}) => {
  const { applications } = usePlatform();
  const [localSelectedApp, setLocalSelectedApp] = useState<ApplicationRecord | null>(null);

  const m = partner.metrics;
  const viewerName = readSessionValue("dakshin_user_name") || partner.name;
  const initials = viewerName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      const dateA = new Date(a.dateAdded).getTime() || 0;
      const dateB = new Date(b.dateAdded).getTime() || 0;
      if (dateB !== dateA) return dateB - dateA;
      return b.camsId.localeCompare(a.camsId);
    });
  }, [applications]);

  const handleSelectApp = (app: ApplicationRecord) => {
    if (onSelectApplication) {
      onSelectApplication(app);
    } else {
      setLocalSelectedApp(app);
    }
  };

  const kpiCards = [
    {
      label: "Total Applications",
      value: m.totalApplications,
      icon: FileText,
      iconColor: "#2563eb",
      iconBg: "#eff6ff",
      note: "+12 this month",
      noteColor: "#0284c7",
    },
    {
      label: "Processing",
      value: m.processingApplications,
      icon: Loader2,
      iconColor: "#f97316",
      iconBg: "#fff4ed",
      note: "In progress",
      noteColor: "#64748b",
    },
    {
      label: "Completed",
      value: m.completedApplications,
      icon: CheckCircle2,
      iconColor: "#0284c7",
      iconBg: "#f0f9ff",
      note: "+8 this month",
      noteColor: "#0284c7",
    },
    {
      label: "Rejected",
      value: m.rejectedApplications,
      icon: XCircle,
      iconColor: "#dc2626",
      iconBg: "#fef2f2",
      note: "Requires attention",
      noteColor: "#dc2626",
    },
  ];

  return (
<<<<<<< HEAD
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Welcome Header — plain white card, orange accent */}
      <div style={{ ...CARD, padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "#fff4ed", border: "1px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#ea580c", flexShrink: 0 }}>
              {initials}
=======
    <div className="space-y-6 animate-fade-in">
      {/* 1. Welcome Header (No 'Verified Partner', No 'Central Admissions Intake...') */}
      <div className="bg-[#D56732] rounded-2xl p-6 text-white relative overflow-hidden shadow-xs border border-[#BA5322]">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
              {partner.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            </div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", margin: 0 }}>
                Welcome back, {viewerName.split(" ")[0]}!
              </h1>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                {partner.partnerId} &bull; {partner.organizationName || "Dakshinvedha B2B Partner"}
              </p>
            </div>
          </div>

<<<<<<< HEAD
          {onAddNewApplication && (
            <button
              onClick={onAddNewApplication}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "#f97316", color: "#ffffff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}
            >
              <Plus style={{ width: 15, height: 15 }} />
              Add New Application
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{ ...CARD, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: 17, height: 17, color: card.iconColor }} />
                </div>
                <TrendingUp style={{ width: 14, height: 14, color: "#d1d5db" }} />
=======
          <div className="flex items-center gap-3">
            {onAddNewApplication && (
              <button
                onClick={onAddNewApplication}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#D56732] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Application</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. KPI Cards: Application Overview */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-3">
          Application Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Applications",
              value: m.totalApplications,
              icon: FileText,
              color: "bg-[#D56732]",
              bg: "bg-[#FDF5F0]/60",
              text: "text-[#D56732]",
              border: "border-[#F5D2C1]",
              change: "+12 this month",
              positive: true,
            },
            {
              label: "Processing",
              value: m.processingApplications,
              icon: Loader2,
              color: "bg-[#D56732]",
              bg: "bg-[#FDF5F0]/40",
              text: "text-[#D56732]",
              border: "border-[#F5D2C1]",
              change: "In progress",
              positive: null,
            },
            {
              label: "Completed",
              value: m.completedApplications,
              icon: CheckCircle2,
              color: "bg-[#D56732]",
              bg: "bg-[#FDF5F0]/60",
              text: "text-[#D56732]",
              border: "border-[#F5D2C1]",
              change: "+8 this month",
              positive: true,
            },
            {
              label: "Rejected",
              value: m.rejectedApplications,
              icon: XCircle,
              color: "bg-rose-600",
              bg: "bg-rose-50/60",
              text: "text-rose-700",
              border: "border-rose-200/80",
              change: "Requires attention",
              positive: false,
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`${card.bg} border ${card.border} rounded-2xl p-4 sm:p-5 flex flex-col gap-2 group hover:shadow-md transition-all cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl ${card.color} text-white flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className={`w-4 h-4 ${card.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <div>
                  <p className={`text-3xl font-black ${card.text}`}>{card.value}</p>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">{card.label}</p>
                </div>
                <p
                  className={`text-[11px] font-semibold ${
                    card.positive === true
                      ? "text-[#D56732]"
                      : card.positive === false
                      ? "text-rose-600"
                      : "text-slate-500"
                  }`}
                >
                  {card.change}
                </p>
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
              </div>
              <p style={{ fontSize: 30, fontWeight: 900, color: "#1e293b", margin: 0, lineHeight: 1 }}>{card.value}</p>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{card.label}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: card.noteColor, marginTop: 6 }}>{card.note}</p>
            </div>
          );
        })}
      </div>

      {/* Partner Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {[
          { label: "Commission Earned", value: m.commissionAmount, color: "#f97316" },
          { label: "Commission Pending", value: m.commissionPending, color: "#2563eb" },
          { label: "Commission Paid", value: m.commissionPaid, color: "#0284c7" },
        ].map((s) => (
          <div key={s.label} style={{ ...CARD, padding: 16 }}>
            <p style={{ fontSize: 24, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Notices */}
      <ImportantNotices />

      {/* Applications */}
      <LatestApplications
        applications={sortedApplications}
        onSelectApplication={handleSelectApp}
        onViewAllClick={() => { if (onViewAllApplications) onViewAllApplications(); }}
      />

      {localSelectedApp && !onSelectApplication && (
        <ApplicationDetailsModal
          application={localSelectedApp}
          onClose={() => setLocalSelectedApp(null)}
        />
      )}
    </div>
  );
};
