"use client";

import React, { useState, useMemo } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { B2BPartnerProfile, ApplicationRecord } from "@/types";
import {
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { ImportantNotices } from "@/components/dashboard/ImportantNotices";
import { LatestApplications } from "@/components/dashboard/LatestApplications";
import { ApplicationDetailsModal } from "@/components/modals/ApplicationDetailsModal";

interface B2BDashboardViewProps {
  partner: B2BPartnerProfile;
  onSelectApplication?: (app: ApplicationRecord) => void;
  onViewAllApplications?: () => void;
  onAddNewApplication?: () => void;
}

export const B2BDashboardView: React.FC<B2BDashboardViewProps> = ({
  partner,
  onSelectApplication,
  onViewAllApplications,
  onAddNewApplication,
}) => {
  const { applications } = usePlatform();
  const [localSelectedApp, setLocalSelectedApp] = useState<ApplicationRecord | null>(null);

  const m = partner.metrics;

  // Sort applications with whichever student applied latest coming on the top
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Welcome Header (No 'Verified Partner', No 'Central Admissions Intake...') */}
      <div className="bg-[#0B5D3B] rounded-2xl p-6 text-white relative overflow-hidden shadow-xs border border-[#08482D]">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
              {partner.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white">
                Welcome back, {partner.name.split(" ")[0]}!
              </h1>
              <p className="text-xs text-white/75 mt-0.5">
                {partner.partnerId} • {partner.organizationName || "Dakshinvedha B2B Partner"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onAddNewApplication && (
              <button
                onClick={onAddNewApplication}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#0B5D3B] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
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
              color: "bg-[#0B5D3B]",
              bg: "bg-emerald-50/60",
              text: "text-[#0B5D3B]",
              border: "border-emerald-200/80",
              change: "+12 this month",
              positive: true,
            },
            {
              label: "Processing",
              value: m.processingApplications,
              icon: Loader2,
              color: "bg-emerald-700",
              bg: "bg-emerald-50/40",
              text: "text-[#0B5D3B]",
              border: "border-emerald-200/60",
              change: "In progress",
              positive: null,
            },
            {
              label: "Completed",
              value: m.completedApplications,
              icon: CheckCircle2,
              color: "bg-[#0B5D3B]",
              bg: "bg-emerald-50/60",
              text: "text-[#0B5D3B]",
              border: "border-emerald-200/80",
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
                      ? "text-emerald-700"
                      : card.positive === false
                      ? "text-rose-600"
                      : "text-slate-500"
                  }`}
                >
                  {card.change}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. IMPORTANT NOTICES */}
      <div>
        <ImportantNotices />
      </div>

      {/* 4. LATEST APPLICATIONS TABLE (LATEST APPLIED STUDENT AT THE VERY TOP OF THE LIST) */}
      <div>
        <LatestApplications
          applications={sortedApplications}
          onSelectApplication={handleSelectApp}
          onViewAllClick={() => {
            if (onViewAllApplications) onViewAllApplications();
          }}
        />
      </div>

      {/* Fallback Details Modal */}
      {localSelectedApp && !onSelectApplication && (
        <ApplicationDetailsModal
          application={localSelectedApp}
          onClose={() => setLocalSelectedApp(null)}
        />
      )}
    </div>
  );
};
