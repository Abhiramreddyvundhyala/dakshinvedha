"use client";

import React, { useMemo, useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { currencyMark, money } from "@/lib/catalogOffers";
import { commissionChannel, figures } from "@/lib/commission";
import { newestFirst } from "@/lib/recent";

type ChannelFilter = "all" | "b2b" | "agent";
type SortMode = "newest" | "low" | "high";

const card = {
  background: "#ffffff",
  border: "1px solid #dde1e7",
  borderRadius: 12,
  padding: 16,
};

export const AdminCommissionsView: React.FC = () => {
  const { applications, courses, settleCommission, canAccessAdminFeature } = usePlatform();
  const canSettle = canAccessAdminFeature("applications");
  const [channel, setChannel] = useState<ChannelFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  const rows = useMemo(() => {
    const sourced = applications
      .filter((app) => commissionChannel(app) !== "direct")
      .map((app) => ({
        app,
        snapshot: figures(app),
        channel: commissionChannel(app) as "b2b" | "agent",
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
  const tiles = [
    { label: "Commission recorded", value: money(sumEligible(openRows), mark) },
    { label: "B2B commissions", value: money(sumEligible(openRows.filter((row) => row.channel === "b2b")), mark) },
    { label: "Agent commissions", value: money(sumEligible(openRows.filter((row) => row.channel === "agent")), mark) },
    { label: "Paid out", value: money(sumPaid(openRows), mark) },
  ];
  const visible = rows.filter((row) => channel === "all" || row.channel === channel);
  const filters: { key: ChannelFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "b2b", label: "B2B" },
    { key: "agent", label: "Agent" },
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
          Only applications that come from a B2B partner or an agent are listed. Student self-applies are not commission.
          The amount stays at zero until your team marks the application Completed, which means the student is placed at the university.
          Approve, then mark paid, records the payout to the bank account already on file. A card payment gateway is not used.
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
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Tracking ID", "Student", "Channel", "Application", "Commission", "Payout", "Record"].map((heading) => (
                <th key={heading} style={{ padding: "8px 10px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textAlign: "left", textTransform: "uppercase" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 16, fontSize: 12, color: "#94a3b8" }}>
                  No B2B or agent applications yet. Commission appears here after a partner or agent submits one.
                </td>
              </tr>
            )}
            {visible.map(({ app, snapshot, channel: rowChannel }) => {
              const placed = app.primaryStatus === "Completed";
              const canApprove = canSettle && placed && (snapshot.status === "Pending" || snapshot.status === "Claimed");
              const canPay = canSettle && (snapshot.status === "Claimed" || snapshot.status === "Approved");
              return (
                <tr key={app.camsId} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 10px", fontSize: 11, fontWeight: 700, color: "#f97316", fontFamily: "monospace" }}>{app.camsId}</td>
                  <td style={{ padding: "8px 10px", fontSize: 12, color: "#1e293b" }}>
                    <div>{app.student.name}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{app.university.name}</div>
                  </td>
                  <td style={{ padding: "8px 10px", fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>{rowChannel}</td>
                  <td style={{ padding: "8px 10px", fontSize: 11, color: "#64748b" }}>{app.primaryStatus}</td>
                  <td style={{ padding: "8px 10px", fontSize: 12, color: "#1e293b" }}>
                    <div style={{ fontWeight: 700 }}>{snapshot.eligibleLabel}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>
                      {placed ? `Course rate ${snapshot.expectedLabel}` : `Updates when placed · rate ${snapshot.expectedLabel}`}
                    </div>
                  </td>
                  <td style={{ padding: "8px 10px", fontSize: 11, color: "#64748b" }}>{snapshot.status}</td>
                  <td style={{ padding: "8px 10px" }}>
                    {canApprove && snapshot.status !== "Approved" && snapshot.status !== "Paid" && (
                      <button
                        type="button"
                        onClick={() => settleCommission(app.camsId, "Approved")}
                        style={{ marginRight: 6, border: "1px solid #fed7aa", background: "#fff7ed", color: "#c2410c", borderRadius: 8, padding: "4px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                      >
                        Approve
                      </button>
                    )}
                    {canPay && (
                      <button
                        type="button"
                        onClick={() => settleCommission(app.camsId, "Paid")}
                        style={{ border: "none", background: "#f97316", color: "#ffffff", borderRadius: 8, padding: "4px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                      >
                        Mark paid
                      </button>
                    )}
                    {snapshot.status === "Paid" && (
                      <span style={{ fontSize: 11, color: "#64748b" }}>{app.commission.paidDate || "Paid"}</span>
                    )}
                    {!placed && snapshot.status === "Pending" && (
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
