"use client";

import React from "react";
import { usePlatform } from "@/context/PlatformContext";
import { TrendingUp, Award, FileText, Users } from "lucide-react";

const CARD = {
  background: "#ffffff",
  border: "1px solid #dde1e7",
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  padding: 18,
};

// Vertical bar chart
const VBar: React.FC<{ labels: string[]; values: number[]; color: string; empty: string }> = ({ labels, values, color, empty }) => {
  const max = Math.max(...values, 0);
  if (max <= 0) {
    return <p style={{ fontSize: 12, color: "#94a3b8", margin: "36px 0" }}>{empty}</p>;
  }
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
          {v > 0 && (
            <div
              style={{
                width: "100%",
                height: `${Math.round((v / max) * 100)}%`,
                background: color,
                borderRadius: "3px 3px 0 0",
              }}
            />
          )}
          <span style={{ fontSize: 8, color: "#94a3b8", marginTop: 3 }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

function monthChange(values: number[]): string | null {
  const month = new Date().getMonth();
  const current = values[month] || 0;
  const previous = month === 0 ? 0 : values[month - 1] || 0;
  if (previous <= 0 || current === previous) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct > 0 ? "+" : ""}${pct}% MoM`;
}

// Horizontal bar
const HBar: React.FC<{ data: { label: string; value: number; color: string }[]; max: number }> = ({ data, max }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {data.map((d) => (
      <div key={d.label}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: "#64748b", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{d.value}</span>
        </div>
        <div style={{ height: 6, background: "#f0f2f5", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(d.value / max) * 100}%`, background: d.color, borderRadius: 4 }} />
        </div>
      </div>
    ))}
  </div>
);

// Multi segment bar
const MultiBar: React.FC<{ segments: { label: string; value: number; color: string }[] }> = ({ segments }) => {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div>
      <div style={{ display: "flex", height: 10, borderRadius: 6, overflow: "hidden", gap: 2 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ flex: s.value / total, background: s.color }} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 10 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>{s.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const APP_COLORS: Record<string, string> = {
  "Application Submitted":    "#2563eb",
  "Under Review":             "#f97316",
  "Submitted to University":  "#0891b2",
  "Offer Issued":             "#0284c7",
  "Payment Pending":          "#d97706",
  "Payment Done":             "#0891b2",
  "CAS Processing":           "#0284c7",
  "CAS Issued":               "#0369a1",
  "Visa Processing":          "#0369a1",
  Completed:                  "#f97316",
  Closed:                     "#dc2626",
};

const COUNTRY_COLORS = ["#f97316", "#2563eb", "#0284c7", "#0891b2", "#ea580c", "#d97706"];

export const AdminAnalyticsView: React.FC = () => {
  const { students, applications, universities, courses, b2bPartners } = usePlatform();

  const statusGroups: Record<string, number> = {};
  applications.forEach((a) => { statusGroups[a.primaryStatus] = (statusGroups[a.primaryStatus] || 0) + 1; });

  const countryGroups: Record<string, number> = {};
  universities.forEach((u) => { countryGroups[u.country] = (countryGroups[u.country] || 0) + 1; });

  const studyLevels: Record<string, number> = {};
  courses.forEach((c) => { studyLevels[c.studyLevel] = (studyLevels[c.studyLevel] || 0) + 1; });

  const partnerStatuses: Record<string, number> = {};
  b2bPartners.forEach((p) => { partnerStatuses[p.accountStatus] = (partnerStatuses[p.accountStatus] || 0) + 1; });

  const docStatus: Record<string, number> = {};
  students.forEach((s) => s.documents.forEach((d) => { docStatus[d.status] = (docStatus[d.status] || 0) + 1; }));

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const studentMonthly = months.map(() => 0);
  const appMonthly = months.map(() => 0);
  students.forEach((student) => {
    const month = new Date(student.registrationDate).getMonth();
    if (!Number.isNaN(month) && month >= 0) studentMonthly[month] += 1;
  });
  applications.forEach((application) => {
    const month = new Date(application.dateAdded).getMonth();
    if (!Number.isNaN(month) && month >= 0) appMonthly[month] += 1;
  });

  const topUnivsByApps = universities
    .map((u) => ({
      label: u.name.length > 24 ? u.name.substring(0, 24) + "…" : u.name,
      value: applications.filter((a) => a.university.id === u.id).length,
      color: "#2563eb",
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const maxUnivApps = Math.max(...topUnivsByApps.map((u) => u.value), 1);

  const conversionRate = applications.length > 0
    ? Math.round((applications.filter((a) => a.primaryStatus === "Completed").length / applications.length) * 100) : 0;
  const offerRate = applications.length > 0
    ? Math.round((applications.filter((a) =>
        ["Offer Issued", "Payment Pending", "Payment Done", "CAS Processing", "CAS Issued", "Visa Processing", "Completed"].includes(a.primaryStatus)
      ).length / applications.length) * 100) : 0;
  const avgDocs = students.length > 0
    ? (students.reduce((s, st) => s + st.documents.length, 0) / students.length).toFixed(1) : "0";
  const avgProfile = students.length > 0
    ? Math.round(students.reduce((s, st) => s + st.profileCompletion, 0) / students.length) : 0;

  const summaryMetrics = [
    { label: "Conversion Rate", value: `${conversionRate}%`, sub: "Submitted → Completed", icon: TrendingUp, color: "#0284c7" },
    { label: "Offer Rate",      value: `${offerRate}%`,      sub: "Reaching offer stage",   icon: Award,      color: "#f97316" },
    { label: "Avg Docs",        value: avgDocs,               sub: "Documents per student",  icon: FileText,   color: "#2563eb" },
    { label: "Avg Profile",     value: `${avgProfile}%`,     sub: "Profile completion",     icon: Users,      color: "#ea580c" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>Analytics & Reports</h1>
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Platform-wide performance metrics</p>
      </div>

      {/* Summary Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {summaryMetrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} style={CARD}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: m.color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: 14, height: 14, color: m.color }} />
                </div>
                <span style={{ fontSize: 11, color: "#64748b" }}>{m.label}</span>
              </div>
              <p style={{ fontSize: 26, fontWeight: 900, color: "#1e293b", margin: 0, lineHeight: 1 }}>{m.value}</p>
              <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>{m.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Bar Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={CARD}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>Student Registrations</p>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Monthly trend</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#1e293b", margin: 0 }}>{students.length}</p>
              {monthChange(studentMonthly) && <p style={{ fontSize: 10, color: "#0284c7", fontWeight: 700 }}>{monthChange(studentMonthly)}</p>}
            </div>
          </div>
          <VBar labels={months} values={studentMonthly} color="#2563eb" empty="No student registrations yet." />
        </div>

        <div style={CARD}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>Applications Submitted</p>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Monthly trend</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#1e293b", margin: 0 }}>{applications.length}</p>
              {monthChange(appMonthly) && <p style={{ fontSize: 10, color: "#0284c7", fontWeight: 700 }}>{monthChange(appMonthly)}</p>}
            </div>
          </div>
          <VBar labels={months} values={appMonthly} color="#f97316" empty="No applications submitted yet." />
        </div>
      </div>

      {/* Pipeline & Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <div style={CARD}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>Application Pipeline</p>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 14px" }}>Distribution across all statuses</p>
          {applications.length === 0 ? <p style={{ fontSize: 12, color: "#94a3b8", margin: "24px 0" }}>No applications yet.</p> : (
          <MultiBar
            segments={Object.entries(statusGroups).map(([label, value]) => ({
              label, value, color: APP_COLORS[label] || "#94a3b8",
            }))}
          />
          )}
          <div style={{ marginTop: 14, borderTop: "1px solid #f0f2f5", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(statusGroups).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
              <div key={status} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: APP_COLORS[status] || "#94a3b8" }} />
                  <span style={{ fontSize: 11, color: "#64748b" }}>{status}</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{count}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8", minWidth: 28, textAlign: "right" }}>
                    {Math.round((count / applications.length) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Study Levels */}
          <div style={CARD}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 12px" }}>Study Levels</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {courses.length === 0 && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>No courses yet.</p>}
              {Object.entries(studyLevels).map(([level, count], i) => {
                const colors = ["#2563eb", "#f97316", "#0284c7"];
                const pct = Math.round((count / courses.length) * 100);
                return (
                  <div key={level}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: "#64748b" }}>{level}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{count}</span>
                    </div>
                    <div style={{ height: 5, background: "#f0f2f5", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: colors[i % 3] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* B2B Partners */}
          <div style={CARD}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 12px" }}>B2B Partner Status</p>
            {b2bPartners.length === 0 ? <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>No partners yet.</p> : (
            <MultiBar
              segments={Object.entries(partnerStatuses).map(([label, value], i) => ({
                label, value, color: ["#0284c7", "#d97706", "#2563eb", "#dc2626"][i % 4],
              }))}
            />
            )}
          </div>
        </div>
      </div>

      {/* Top Universities */}
      <div style={CARD}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 14px" }}>Top Universities by Applications</p>
        {topUnivsByApps.every((item) => item.value === 0) ? (
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>No applications yet.</p>
        ) : (
          <HBar data={topUnivsByApps.filter((item) => item.value > 0)} max={maxUnivApps} />
        )}
      </div>

      {/* Country & Docs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={CARD}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 12px" }}>Universities by Country</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {universities.length === 0 && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>No universities yet.</p>}
            {Object.entries(countryGroups).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([country, count], i) => {
              const pct = Math.round((count / universities.length) * 100);
              return (
                <div key={country}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{country}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{count}</span>
                  </div>
                  <div style={{ height: 5, background: "#f0f2f5", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: COUNTRY_COLORS[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={CARD}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 12px" }}>Document Status</p>
          {Object.keys(docStatus).length === 0 ? <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>No documents yet.</p> : (
          <MultiBar
            segments={Object.entries(docStatus).map(([label, value], i) => ({
              label, value, color: ["#0284c7", "#d97706", "#2563eb", "#dc2626", "#ea580c"][i % 5],
            }))}
          />
          )}
        </div>
      </div>
    </div>
  );
};
