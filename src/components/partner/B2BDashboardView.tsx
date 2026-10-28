"use client";

import React, { useState, useMemo } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { B2BPartnerProfile, ApplicationRecord } from "@/types";
import {
  FileText, Loader2, CheckCircle2, XCircle, Plus, ArrowRight, Users, TrendingUp,
} from "lucide-react";
import { readSessionValue } from "@/utils/accounts";
import { currencyMark, money } from "@/lib/catalogOffers";
import { figures, partnerApplications } from "@/lib/commission";
import { timeValue } from "@/lib/recent";
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

  const viewerName = readSessionValue("dakshin_user_name") || partner.name;
  const initials = viewerName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const mine = useMemo(() => partnerApplications(applications, partner), [applications, partner]);

  const sortedApplications = useMemo(() => {
    return [...mine].sort((a, b) => {
      const dateA = timeValue(a.dateModified || a.dateAdded);
      const dateB = timeValue(b.dateModified || b.dateAdded);
      if (dateB !== dateA) return dateB - dateA;
      return b.camsId.localeCompare(a.camsId);
    });
  }, [mine]);

  const totals = useMemo(() => {
    const rows = mine.map((app) => figures(app));
    const mark = currencyMark(mine.map((app) => ({ tuitionFee: app.course.tuitionFee })));
    return {
      total: mine.length,
      processing: mine.filter((app) => app.primaryStatus !== "Completed" && app.primaryStatus !== "Closed").length,
      completed: mine.filter((app) => app.primaryStatus === "Completed").length,
      rejected: mine.filter((app) => app.primaryStatus === "Closed").length,
      expected: money(rows.reduce((sum, row) => sum + row.eligible, 0), mark),
      pending: money(rows.filter((row) => row.awaiting).reduce((sum, row) => sum + row.eligible, 0), mark),
      paid: money(rows.filter((row) => row.paid).reduce((sum, row) => sum + row.eligible, 0), mark),
    };
  }, [mine]);

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
      value: totals.total,
      icon: FileText,
      iconColor: "#2563eb",
      iconBg: "#eff6ff",
      note: "On file",
      noteColor: "#64748b",
    },
    {
      label: "Processing",
      value: totals.processing,
      icon: Loader2,
      iconColor: "#f97316",
      iconBg: "#fff4ed",
      note: "In progress",
      noteColor: "#64748b",
    },
    {
      label: "Completed",
      value: totals.completed,
      icon: CheckCircle2,
      iconColor: "#0284c7",
      iconBg: "#f0f9ff",
      note: "Finished",
      noteColor: "#64748b",
    },
    {
      label: "Rejected",
      value: totals.rejected,
      icon: XCircle,
      iconColor: "#dc2626",
      iconBg: "#fef2f2",
      note: "Cancelled or closed",
      noteColor: "#dc2626",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Welcome Header — plain white card, orange accent */}
      <div style={{ ...CARD, padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "#fff4ed", border: "1px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#ea580c", flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", margin: 0 }}>
                Welcome back, {viewerName.split(" ")[0]}!
              </h1>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                {partner.partnerId} &bull; {partner.organizationName || "Dakshinvedha B2B Partner"}
              </p>
              <p style={{ fontSize: 11, fontWeight: 700, marginTop: 6, color: partner.verificationStatus === "Verified" ? "#0284c7" : "#c2410c" }}>
                {partner.verificationStatus === "Verified"
                  ? "Organization status: Verified"
                  : partner.profileCompleted
                    ? "Organization status: Under verification. Dakshinvedha admin confirms it from Admin → Partners."
                    : "Organization status: Verification pending. Finish the organization profile so admin can verify it."}
              </p>
            </div>
          </div>

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
          { label: "Commission recorded", value: totals.expected, color: "#f97316" },
          { label: "Claim requested", value: totals.pending, color: "#2563eb" },
          { label: "Claimed done", value: totals.paid, color: "#0284c7" },
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
