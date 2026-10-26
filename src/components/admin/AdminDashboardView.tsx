"use client";

import React from "react";
import { usePlatform } from "@/context/PlatformContext";
import { AdminTabKey } from "./AdminSidebar";
import {
  Users, FileText, Building, CheckCircle2,
  AlertTriangle, ArrowRight, Award, Globe, UserCheck, Briefcase,
} from "lucide-react";
import { newestFirst } from "@/lib/recent";

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
  const max = Math.max(...values, 0);
  if (max <= 0) return null;
  return (
    <div className="flex items-end gap-0.5" style={{ height: 28 }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: v > 0 ? `${Math.round((v / max) * 100)}%` : 0,
            background: color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
};

function countsByMonth(dates: string[]): number[] {
  const months = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  dates.forEach((value) => {
    const month = new Date(value).getMonth();
    if (!Number.isNaN(month) && month >= 0 && month < 12) months[month] += 1;
  });
  return months;
}

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
  "Submitted to University":{ bg: "#fff7ed", color: "#c2410c" },
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

  const offerDates = applications
    .filter((application) => application.primaryStatus.includes("Offer") || application.primaryStatus === "Completed")
    .map((application) => application.dateAdded);
  const kpis = [
    { label: "Students",     value: totalStudents,  color: "#2563eb", icon: Users,         tab: "students"     as AdminTabKey, trend: countsByMonth(students.map((student) => student.registrationDate)) },
    { label: "Applications", value: totalApps,      color: "#f97316", icon: FileText,      tab: "applications" as AdminTabKey, trend: countsByMonth(applications.map((application) => application.dateAdded)) },
    { label: "Offers Issued",value: offersCount,    color: "#0284c7", icon: Award,         tab: "applications" as AdminTabKey, trend: countsByMonth(offerDates) },
    { label: "Doc Queue",    value: pendingDocs,    color: "#dc2626", icon: CheckCircle2,  tab: "documents"    as AdminTabKey, trend: [] as number[] },
  ];

  const statusColors = ["#2563eb", "#f97316", "#0284c7", "#0891b2", "#d97706", "#ea580c", "#0369a1", "#dc2626"];
  const statusCounts = applications.reduce<Record<string, number>>((acc, application) => {
    acc[application.primaryStatus] = (acc[application.primaryStatus] || 0) + 1;
    return acc;
  }, {});
  const donutData = Object.entries(statusCounts)
    .filter(([, value]) => value > 0)
    .map(([label, value], index) => ({ label, value, color: statusColors[index % statusColors.length] }));

  const countryBreakdown = universities.reduce<Record<string, number>>((acc, u) => {
    acc[u.country] = (acc[u.country] || 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countryBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const barColors = ["#f97316", "#2563eb", "#0284c7", "#0891b2", "#ea580c"];

  const recentApps = newestFirst(applications, (app) => app.dateModified || app.dateAdded).slice(0, 6);

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
          {totalApps === 0 ? (
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "24px 0" }}>No applications yet.</p>
          ) : (
            <DonutChart data={donutData} />
          )}
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
              { label: "Visa Processing",       value: visaApps,            icon: Globe,      color: "#ea580c" },
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
            {topCountries.length === 0 && (
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>No universities yet.</p>
            )}
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
              {recentApps.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: "center", fontSize: 12, color: "#94a3b8" }}>No applications yet.</td>
                </tr>
              )}
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
