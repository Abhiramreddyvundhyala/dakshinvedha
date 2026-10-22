"use client";

import React from "react";
import { usePlatform } from "@/context/PlatformContext";
import { AdminTabKey } from "./AdminSidebar";
import {
  Users, FileText, Building, CheckCircle2,
  TrendingUp, TrendingDown, AlertTriangle, ArrowRight, Award, Globe, UserCheck, Briefcase,
} from "lucide-react";

interface AdminDashboardViewProps {
  onNavigateTab: (tab: AdminTabKey) => void;
}

const card = {
  background: "#ffffff",
  border: "1px solid #dde1e7",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

// Simple bar chart — no gradients
const MiniBar: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5" style={{ height: 28 }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${Math.max(Math.round((v / max) * 100), 8)}%`,
            background: i === values.length - 1 ? color : "#e2e8f0",
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
};

// Donut — no gradients
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cum = 0;
  const r = 40, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" style={{ width: 80, height: 80, transform: "rotate(-90deg)", flexShrink: 0 }}>
        {data.map((d, i) => {
          const pct = d.value / total;
          const da = `${pct * circ} ${circ}`;
          const off = -cum * circ;
          cum += pct;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={d.color} strokeWidth="18"
              strokeDasharray={da} strokeDashoffset={off}
            />
          );
        })}
        <circle cx={cx} cy={cy} r="28" fill="#ffffff" />
      </svg>
      <div className="space-y-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>{d.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginLeft: "auto" }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  "Application Submitted": { bg: "#eff6ff", color: "#2563eb" },
  "Under Review":          { bg: "#f0f9ff", color: "#0369a1" },
  "Submitted to University":{ bg: "#eef2ff", color: "#4338ca" },
  "Offer Issued":          { bg: "#f0f9ff", color: "#0284c7" },
  "Payment Pending":       { bg: "#fffbeb", color: "#d97706" },
  "CAS Processing":        { bg: "#f0f9ff", color: "#0891b2" },
  "Visa Processing":       { bg: "#f0f9ff", color: "#0284c7" },
  Completed:               { bg: "#f0f9ff", color: "#0369a1" },
  Closed:                  { bg: "#fef2f2", color: "#dc2626" },
};

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigateTab }) => {
  const { students, applications, universities, courses, b2bPartners } = usePlatform();

  const totalStudents   = students.length;
  const totalApps       = applications.length;
  const offersCount     = applications.filter((a) => a.primaryStatus.includes("Offer") || a.primaryStatus === "Completed").length;
  const pendingDocs     = students.reduce((acc, s) => acc + s.documents.filter((d) => d.status === "Uploaded" || d.status === "Under Review").length, 0);
  const activePartners  = b2bPartners.filter((p) => p.accountStatus === "Active").length;
  const completedApps   = applications.filter((a) => a.primaryStatus === "Completed").length;
  const visaApps        = applications.filter((a) => a.primaryStatus === "Visa Processing" || a.primaryStatus === "CAS Processing").length;
  const underReview     = applications.filter((a) => a.primaryStatus === "Under Review").length;

  const kpis = [
    { label: "Students",     value: totalStudents,  change: "+12%", up: true,  color: "#2563eb", icon: Users,         tab: "students"     as AdminTabKey, trend: [8,12,15,11,18,22,19,25,28,24,30,totalStudents] },
    { label: "Applications", value: totalApps,      change: "+8%",  up: true,  color: "#f97316", icon: FileText,      tab: "applications" as AdminTabKey, trend: [5,9,12,8,15,19,16,21,24,20,26,totalApps] },
    { label: "Offers Issued",value: offersCount,    change: "+18%", up: true,  color: "#0284c7", icon: Award,         tab: "applications" as AdminTabKey, trend: [2,3,5,4,7,8,7,9,11,10,13,offersCount] },
    { label: "Doc Queue",    value: pendingDocs,    change: "-5%",  up: false, color: "#dc2626", icon: CheckCircle2,  tab: "documents"    as AdminTabKey, trend: [10,12,9,14,11,15,13,11,9,12,10,pendingDocs] },
  ];

  const donutData = [
    { label: "Under Review", value: underReview,   color: "#2563eb" },
    { label: "Offer Issued", value: offersCount,   color: "#0284c7" },
    { label: "Visa/CAS",     value: visaApps,      color: "#0891b2" },
    { label: "Completed",    value: completedApps, color: "#f97316" },
  ];

  const countryBreakdown = universities.reduce<Record<string, number>>((acc, u) => {
    acc[u.country] = (acc[u.country] || 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countryBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const barColors = ["#f97316", "#2563eb", "#0284c7", "#0891b2", "#7c3aed"];

  const recentApps = applications.slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Dakshinvedha Abroad Solutions — Admin Overview</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <button
              key={k.label}
              onClick={() => onNavigateTab(k.tab)}
              style={{ ...card, padding: 16, textAlign: "left", cursor: "pointer", display: "block", width: "100%" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: k.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: 16, height: 16, color: k.color }} />
                </div>
                <span
                  style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                    background: k.up ? "#f0f9ff" : "#fef2f2",
                    color: k.up ? "#0284c7" : "#dc2626",
                    display: "flex", alignItems: "center", gap: 3,
                  }}
                >
                  {k.up ? <TrendingUp style={{ width: 10, height: 10 }} /> : <TrendingDown style={{ width: 10, height: 10 }} />}
                  {k.change}
                </span>
              </div>
              <p style={{ fontSize: 28, fontWeight: 900, color: "#1e293b", lineHeight: 1, margin: 0 }}>{k.value}</p>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{k.label}</p>
              <div style={{ marginTop: 10 }}>
                <MiniBar values={k.trend} color={k.color} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Middle Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>

        {/* Donut */}
        <div style={{ ...card, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>Application Status</p>
            <button onClick={() => onNavigateTab("applications")} style={{ fontSize: 11, color: "#f97316", fontWeight: 600, display: "flex", alignItems: "center", gap: 3, cursor: "pointer", background: "none", border: "none" }}>
              View all <ArrowRight style={{ width: 11, height: 11 }} />
            </button>
          </div>
          <DonutChart data={donutData} />
          <div style={{ borderTop: "1px solid #f0f2f5", marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>Total</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#1e293b" }}>{totalApps}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ ...card, padding: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 14px" }}>Quick Stats</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Universities",          value: universities.length, icon: Building,   color: "#2563eb" },
              { label: "Courses",               value: courses.length,      icon: Briefcase,  color: "#f97316" },
              { label: "Active B2B Partners",   value: activePartners,      icon: UserCheck,  color: "#0284c7" },
              { label: "Completed",             value: completedApps,       icon: Award,      color: "#0891b2" },
              { label: "Visa Processing",       value: visaApps,            icon: Globe,      color: "#7c3aed" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 14, height: 14, color: s.color }} />
                  </div>
                  <span style={{ fontSize: 12, color: "#64748b", flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#1e293b" }}>{s.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Country breakdown */}
        <div style={{ ...card, padding: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 14px" }}>Universities by Country</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topCountries.map(([country, count], i) => {
              const pct = Math.round((count / universities.length) * 100);
              return (
                <div key={country}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{country}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{count}</span>
                  </div>
                  <div style={{ height: 5, background: "#f0f2f5", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: barColors[i], borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f0f2f5" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>Recent Applications</p>
          <button onClick={() => onNavigateTab("applications")} style={{ fontSize: 11, color: "#f97316", fontWeight: 600, display: "flex", alignItems: "center", gap: 3, cursor: "pointer", background: "none", border: "none" }}>
            View all ({applications.length}) <ArrowRight style={{ width: 11, height: 11 }} />
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Tracking ID", "Student", "University", "Course", "Intake", "Status"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", borderBottom: "1px solid #f0f2f5" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentApps.map((app, idx) => {
                const s = STATUS_STYLE[app.primaryStatus] || { bg: "#f8fafc", color: "#64748b" };
                return (
                  <tr key={app.camsId} style={{ borderBottom: idx < recentApps.length - 1 ? "1px solid #f8fafc" : "none" }}>
                    <td style={{ padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "#f97316", fontFamily: "monospace" }}>{app.camsId}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: "#fff4ed", border: "1px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#ea580c", flexShrink: 0 }}>
                          {app.student.name.charAt(0)}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>{app.student.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>{app.university.name}</td>
                    <td style={{ padding: "11px 16px", fontSize: 11, color: "#64748b", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{app.course.courseName}</td>
                    <td style={{ padding: "11px 16px", fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>{app.course.activeIntake}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
                        {app.primaryStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert */}
      {pendingDocs > 0 && (
        <div
          onClick={() => onNavigateTab("documents")}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, background: "#fff7ed", border: "1px solid #fed7aa", cursor: "pointer" }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fff4ed", border: "1px solid #fdba74", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertTriangle style={{ width: 18, height: 18, color: "#f97316" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#ea580c", margin: 0 }}>
              {pendingDocs} Document{pendingDocs > 1 ? "s" : ""} Pending Review
            </p>
            <p style={{ fontSize: 11, color: "#9a3412", marginTop: 2 }}>
              Click to review documents in the queue.
            </p>
          </div>
          <ArrowRight style={{ width: 16, height: 16, color: "#f97316" }} />
        </div>
      )}
    </div>
  );
};
