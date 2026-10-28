"use client";

import React, { useMemo, useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { currencyMark, money } from "@/lib/catalogOffers";
import { claimStage, claimStatusLabel, commissionChannel, figures } from "@/lib/commission";
import { newestFirst } from "@/lib/recent";
import { B2BPartnerProfile } from "@/types";

type ChannelFilter = "all" | "b2b" | "agent";
type ClaimFilter = "all" | "requested" | "claimed" | "waiting";
type SortMode = "newest" | "low" | "high";

function payeeName(app: { partnerRecordId?: string; partnerTrackingId?: string; counselorName: string; agentTrackingId?: string }, channel: "b2b" | "agent", partners: B2BPartnerProfile[]): string {
  if (channel === "b2b") {
    const partner = partners.find(
      (item) => item.id === app.partnerRecordId || item.partnerId === app.partnerTrackingId
    );
    return partner?.organizationName || partner?.name || app.partnerTrackingId || "B2B partner";
  }
  return app.counselorName || app.agentTrackingId || "Agent";
}

const card = {
  background: "#ffffff",
  border: "1px solid #dde1e7",
  borderRadius: 12,
  padding: 16,
};

export const AdminCommissionsView: React.FC = () => {
  const { applications, courses, b2bPartners, settleCommission, canAccessAdminFeature } = usePlatform();
  const canSettle = canAccessAdminFeature("commissions");
  const [channel, setChannel] = useState<ChannelFilter>("all");
  const [claimFilter, setClaimFilter] = useState<ClaimFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  const rows = useMemo(() => {
    const sourced = applications
      .filter((app) => commissionChannel(app) !== "direct")
      .map((app) => ({
        app,
        snapshot: figures(app),
        channel: commissionChannel(app) as "b2b" | "agent",
        stage: claimStage(app),
      }));
    if (sortMode === "low" || sortMode === "high") {
      return [...sourced].sort((left, right) => {
        const delta = left.snapshot.expected - right.snapshot.expected;
        return sortMode === "low" ? delta : -delta;
      });
    }
    return newestFirst(sourced, (row) => row.app.dateModified || row.app.dateAdded);
  }, [applications, sortMode]);

  const openRows = rows.filter((row) => row.app.primaryStatus !== "Closed");
  const mark = currencyMark(courses.length ? courses : openRows.map((row) => row.app.course));
  const sumEligible = (list: typeof openRows) => list.reduce((total, row) => total + row.snapshot.eligible, 0);
  const sumPaid = (list: typeof openRows) =>
    list.reduce((total, row) => total + (row.snapshot.paid ? row.snapshot.eligible : 0), 0);
  const requestedRows = openRows.filter((row) => row.stage === "requested");
  const tiles = [
    { label: "Claim requests", value: String(requestedRows.length) },
    { label: "Requested amount", value: money(sumEligible(requestedRows), mark) },
    { label: "Claimed done", value: money(sumPaid(openRows), mark) },
    { label: "B2B + agent on file", value: money(sumEligible(openRows), mark) },
  ];
  const visible = rows.filter((row) => {
    if (channel !== "all" && row.channel !== channel) return false;
    if (claimFilter === "requested") return row.stage === "requested";
    if (claimFilter === "claimed") return row.stage === "claimed";
    if (claimFilter === "waiting") return row.stage === "in-process" || row.stage === "ready";
    return true;
  });
  const filters: { key: ChannelFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "b2b", label: "B2B" },
    { key: "agent", label: "Agent" },
  ];
  const claimFilters: { key: ClaimFilter; label: string }[] = [
    { key: "all", label: "Every stage" },
    { key: "requested", label: "Claim requested" },
    { key: "claimed", label: "Claimed done" },
    { key: "waiting", label: "Not claimed yet" },
  ];
  const sorts: { key: SortMode; label: string }[] = [
    { key: "newest", label: "Newest" },
    { key: "low", label: "Low to high" },
    { key: "high", label: "High to low" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>Commissions</h1>
        <p style={{ fontSize: 12, color: "#64748b", marginTop: 6, maxWidth: 760 }}>
          Student self-applies are not listed. Tuition fee, commission percentage, and commission amount come from the course.
          The partner or agent presses Claim commission after you mark the application Completed. That request shows here.
          Transfer the amount to the bank account on file, then press Mark claimed done. The file then shows under Claimed in the B2B or agent portal.
          Reload this page to see a claim that was just sent.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {tiles.map((tile) => (
          <div key={tile.label} style={card}>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>{tile.value}</p>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{tile.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setChannel(item.key)}
            style={{
              border: "1px solid #fed7aa",
              background: channel === item.key ? "#f97316" : "#ffffff",
              color: channel === item.key ? "#ffffff" : "#c2410c",
              borderRadius: 999,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
        {claimFilters.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setClaimFilter(item.key)}
            style={{
              border: "1px solid #e2e8f0",
              background: claimFilter === item.key ? "#9a3412" : "#ffffff",
              color: claimFilter === item.key ? "#ffffff" : "#9a3412",
              borderRadius: 999,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
        {sorts.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setSortMode(item.key)}
            style={{
              border: "1px solid #e2e8f0",
              background: sortMode === item.key ? "#1e293b" : "#ffffff",
              color: sortMode === item.key ? "#ffffff" : "#475569",
              borderRadius: 999,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ ...card, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Tracking ID", "Student", "Payee", "Tuition fee", "Commission %", "Commission amount", "Claim", "Action"].map((heading) => (
                <th key={heading} style={{ padding: "8px 10px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textAlign: "left", textTransform: "uppercase" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 16, fontSize: 12, color: "#94a3b8" }}>
                  No commission rows for this filter. A claim appears after a B2B partner or an agent presses Claim commission.
                </td>
              </tr>
            )}
            {visible.map(({ app, snapshot, channel: rowChannel, stage }) => {
              const canFinish = canSettle && (stage === "requested");
              return (
                <tr key={app.camsId} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 10px", fontSize: 11, fontWeight: 700, color: "#f97316", fontFamily: "monospace" }}>{app.camsId}</td>
                  <td style={{ padding: "8px 10px", fontSize: 12, color: "#1e293b" }}>
                    <div>{app.student.name}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{app.university.name}</div>
                  </td>
                  <td style={{ padding: "8px 10px", fontSize: 11, color: "#64748b" }}>
                    <div style={{ fontWeight: 700, color: "#1e293b" }}>{payeeName(app, rowChannel, b2bPartners)}</div>
                    <div style={{ fontSize: 10, textTransform: "uppercase" }}>{rowChannel}</div>
                  </td>
                  <td style={{ padding: "8px 10px", fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{snapshot.tuitionLabel}</td>
                  <td style={{ padding: "8px 10px", fontSize: 12, fontWeight: 700, color: "#c2410c" }}>{snapshot.rateLabel}</td>
                  <td style={{ padding: "8px 10px", fontSize: 12, fontWeight: 800, color: "#1e293b" }}>{snapshot.amountLabel}</td>
                  <td style={{ padding: "8px 10px", fontSize: 11, color: "#64748b" }}>{claimStatusLabel(app)}</td>
                  <td style={{ padding: "8px 10px" }}>
                    {canFinish && (
                      <button
                        type="button"
                        onClick={() => settleCommission(app.camsId, "Paid")}
                        style={{ border: "none", background: "#f97316", color: "#ffffff", borderRadius: 8, padding: "4px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                      >
                        Mark claimed done
                      </button>
                    )}
                    {stage === "claimed" && (
                      <span style={{ fontSize: 11, color: "#64748b" }}>{app.commission.referenceNumber || app.commission.paidDate || "Claimed done"}</span>
                    )}
                    {stage === "ready" && (
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>Waiting for their claim</span>
                    )}
                    {stage === "in-process" && (
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>Waiting for placement</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
