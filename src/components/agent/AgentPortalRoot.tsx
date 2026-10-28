"use client";

import React, { useMemo, useState } from "react";
import { Menu, Plus, Search } from "lucide-react";
import { ApplicationRecord, CourseInfo, UniversityInfo } from "@/types";
import { usePlatform } from "@/context/PlatformContext";
import { readSessionValue } from "@/utils/accounts";
import { claimStage, claimStatusLabel, figures } from "@/lib/commission";
import { CommissionBoard } from "@/components/views/CommissionBoard";
import { newestFirst } from "@/lib/recent";
import { ApplicationTracker } from "@/components/shared/ApplicationTracker";
import { ImportantNotices } from "@/components/dashboard/ImportantNotices";
import { ApplicationWizardModal } from "@/components/modals/ApplicationWizardModal";
import { StudentApplicationTrackingModal } from "@/components/student/StudentApplicationTrackingModal";
import { StudentUniversitiesView } from "@/components/student/StudentUniversitiesView";
import { StudentUniversityDetailsView } from "@/components/student/StudentUniversityDetailsView";
import { StudentCourseDetailsModal } from "@/components/student/StudentCourseDetailsModal";
import { saveApplicationDraft } from "@/lib/portalDb";
import { AgentSidebar, AgentNavTab } from "./AgentSidebar";

export const AgentPortalRoot: React.FC = () => {
  const { applications, recordApplication, claimCommission } = usePlatform();
  const name = readSessionValue("dakshin_user_name") || "Agent";
  const trackingId = readSessionValue("dakshin_tracking_id") || "";
  const accountId = readSessionValue("dakshin_account_id") || "";
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ApplicationRecord | null>(null);
  const [section, setSection] = useState<AgentNavTab>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityInfo | null>(null);
  const [universityTab, setUniversityTab] = useState<"details" | "courses">("details");
  const [viewingCourse, setViewingCourse] = useState<CourseInfo | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const assigned = useMemo(() => {
    const mine = applications.filter((app) => {
      if (trackingId && app.agentTrackingId === trackingId) return true;
      if (accountId && app.agentProfileId === accountId) return true;
      return app.counselorName.trim().toLowerCase() === name.trim().toLowerCase();
    });
    return newestFirst(mine, (app) => app.dateModified || app.dateAdded);
  }, [applications, name, trackingId, accountId]);

  const visible = assigned.filter((app) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      app.camsId.toLowerCase().includes(q) ||
      app.student.name.toLowerCase().includes(q) ||
      app.university.name.toLowerCase().includes(q) ||
      app.course.courseName.toLowerCase().includes(q)
    );
  });

  const offers = assigned.filter((app) => app.primaryStatus.includes("Offer") || app.secondaryStatus.includes("Offer")).length;
  const rejectedCount = assigned.filter((app) => app.primaryStatus === "Closed").length;
  const claimableCount = assigned.filter((app) => claimStage(app) === "ready").length;

  const openApply = () => {
    setViewingCourse(null);
    setWizardOpen(true);
  };

  const handleSubmitted = (app: ApplicationRecord) => {
    recordApplication({
      ...app,
      counselorName: name,
      agentTrackingId: trackingId || undefined,
      agentProfileId: accountId || undefined,
      partnerTrackingId: undefined,
      partnerRecordId: undefined,
    });
    setSection("applications");
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-800" style={{ background: "#FAFAF8" }}>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <AgentSidebar
        currentTab={section}
        onSelectTab={setSection}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        name={name}
        trackingId={trackingId}
        applicationCount={assigned.length}
        claimableCount={claimableCount}
      />

      <div className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-64"}`}>
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-white px-4 py-3" style={{ borderColor: "#E7E5E0" }}>
          <button type="button" className="lg:hidden rounded-lg border border-slate-200 p-2" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <p className="text-sm font-black text-slate-900">Agent portal</p>
            <p className="text-[11px] text-slate-500">{name}{trackingId ? ` · ${trackingId}` : ""}</p>
          </div>
        </header>

        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-5">
          {section === "dashboard" && (
            <>
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned applications</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{assigned.length}</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Offers in progress</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{offers}</p>
                </article>
                <button
                  type="button"
                  onClick={() => setSection("commission")}
                  className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-left"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Ready to claim</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{claimableCount}</p>
                </button>
                <article className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Rejected</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{rejectedCount}</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Agent tracking ID</p>
                  <p className="mt-1 font-mono text-sm font-black text-orange-700">{trackingId || "—"}</p>
                </article>
              </section>
              <ImportantNotices />
            </>
          )}

          {section === "universities" && (
            selectedUniversity ? (
              <StudentUniversityDetailsView
                university={selectedUniversity}
                initialTab={universityTab}
                onBack={() => setSelectedUniversity(null)}
                onOpenCourseDetails={(course) => setViewingCourse(course)}
                allowApply={false}
              />
            ) : (
              <StudentUniversitiesView
                onSelectUniversity={(university, target) => {
                  setUniversityTab(target || "details");
                  setSelectedUniversity(university);
                }}
              />
            )
          )}

          {section === "commission" && (
            <CommissionBoard applications={assigned} audience="agent" onClaim={claimCommission} />
          )}

          {section === "applications" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-lg font-black text-slate-900">Applications</h1>
                  <p className="text-xs text-slate-500">Files you submitted or that admin assigned to you. Newest first.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search tracking ID or student"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-orange-500 sm:w-64"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => openApply()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-3 py-2 text-xs font-bold text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Apply
                  </button>
                </div>
              </div>

              {visible.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
                  <p className="text-sm font-bold text-slate-700">No applications yet.</p>
                  <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                    Use Apply to file a student. University and course stay unselected until you choose them. You cannot change the application stage.
                  </p>
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[1040px] text-left text-xs">
                    <thead className="border-y border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-3 py-3">Tracking ID</th>
                        <th className="px-3 py-3">Student</th>
                        <th className="px-3 py-3">Course</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Tuition fee</th>
                        <th className="px-3 py-3">Commission %</th>
                        <th className="px-3 py-3">Commission amount</th>
                        <th className="px-3 py-3">Tracker</th>
                        <th className="px-3 py-3 text-right">Open</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visible.map((app) => {
                        const snapshot = figures(app);
                        return (
                          <tr key={app.camsId} className="hover:bg-orange-50/40">
                            <td className="px-3 py-3 font-mono font-bold text-orange-700">{app.camsId}</td>
                            <td className="px-3 py-3">
                              <p className="font-bold text-slate-900">{app.student.name}</p>
                              <p className="font-mono text-[10px] text-slate-400">{app.student.studentId}</p>
                            </td>
                            <td className="px-3 py-3">
                              <p className="font-semibold text-slate-800">{app.course.courseName}</p>
                              <p className="text-[10px] text-slate-500">{app.university.name}</p>
                            </td>
                            <td className="px-3 py-3">
                              <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                                {app.primaryStatus}
                              </span>
                            </td>
                            <td className="px-3 py-3 font-semibold text-slate-800">{snapshot.tuitionLabel}</td>
                            <td className="px-3 py-3 font-semibold text-orange-700">{snapshot.rateLabel}</td>
                            <td className="px-3 py-3">
                              <p className="font-bold text-slate-900">{snapshot.amountLabel}</p>
                              <p className="text-[10px] text-slate-500">{claimStatusLabel(app)}</p>
                            </td>
                            <td className="px-3 py-3">
                              <ApplicationTracker application={app} compact />
                            </td>
                            <td className="px-3 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelected(app)}
                                className="rounded-lg bg-orange-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-orange-700"
                              >
                                Track
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      <StudentApplicationTrackingModal application={selected} onClose={() => setSelected(null)} />
      <StudentCourseDetailsModal
        course={viewingCourse}
        onClose={() => setViewingCourse(null)}
        allowApply={false}
      />
      <ApplicationWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        initialCourseSelection={null}
        onApplicationSubmitted={handleSubmitted}
        onSaveDraft={(draft) => {
          void saveApplicationDraft(draft);
        }}
      />
    </div>
  );
};
