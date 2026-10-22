"use client";

import React, { useMemo, useState } from "react";
import { Headset, LogOut, Search } from "lucide-react";
import { ApplicationRecord } from "@/types";
import { usePlatform } from "@/context/PlatformContext";
import { readSessionValue } from "@/utils/accounts";
import { performLogout } from "@/utils/auth";
import { ApplicationTracker } from "@/components/shared/ApplicationTracker";
import { StudentApplicationTrackingModal } from "@/components/student/StudentApplicationTrackingModal";

export const AgentPortalRoot: React.FC = () => {
  const { applications } = usePlatform();
  const name = readSessionValue("dakshin_user_name") || "Agent";
  const email = readSessionValue("dakshin_user_email") || "";
  const trackingId = readSessionValue("dakshin_tracking_id") || "";
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ApplicationRecord | null>(null);

  const assigned = useMemo(() => {
    return applications.filter((app) => {
      if (trackingId && app.agentTrackingId === trackingId) return true;
      return app.counselorName.trim().toLowerCase() === name.trim().toLowerCase();
    });
  }, [applications, name, trackingId]);

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

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
              <Headset className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Dakshinvedha Agent</p>
              <p className="text-[11px] text-slate-500">
                {name} · {email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 font-mono text-[11px] font-bold text-orange-800">
              {trackingId || "No tracking ID"}
            </span>
            <button
              type="button"
              onClick={performLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned applications</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{assigned.length}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Offers in progress</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{offers}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Agent tracking ID</p>
            <p className="mt-1 font-mono text-sm font-black text-orange-700">{trackingId || "—"}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-black text-slate-900">Application tracker</h1>
              <p className="text-xs text-slate-500">Every application assigned to you shows its tracking ID and 11-stage progress.</p>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tracking ID or student"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-orange-500 sm:w-64"
              />
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
              <p className="text-sm font-bold text-slate-700">No applications are assigned to this agent yet.</p>
              <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                Admin assigns an application from the Applications pipeline. An agent login is separate from a B2B team login.
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="border-y border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Tracking ID</th>
                    <th className="px-3 py-3">Student</th>
                    <th className="px-3 py-3">Course</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Tracker</th>
                    <th className="px-3 py-3 text-right">Open</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((app) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <StudentApplicationTrackingModal application={selected} onClose={() => setSelected(null)} />
    </div>
  );
};
