"use client";

import React, { useState } from "react";
import { CalendarClock, ArrowRight, AlertTriangle, Building, Globe } from "lucide-react";
import { MOCK_DEADLINES } from "@/data/mockData";

export const UniversityDeadlines: React.FC = () => {
  const [viewAll, setViewAll] = useState(false);

  const displayedDeadlines = viewAll ? MOCK_DEADLINES : MOCK_DEADLINES.slice(0, 4);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0B5D3B]">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              University Deadline
            </h3>
            <p className="text-[11px] text-slate-400">
              Upcoming intake closing windows
            </p>
          </div>
        </div>

        <button
          onClick={() => setViewAll(!viewAll)}
          className="group flex items-center gap-1 text-xs font-bold text-[#0B5D3B] hover:text-[#08482D] tracking-wide transition-colors"
        >
          <span>{viewAll ? "SHOW LESS" : "VIEW ALL"}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Deadlines Table */}
      <div className="mt-3 overflow-x-auto flex-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
              <th className="pb-2.5 font-medium">University</th>
              <th className="pb-2.5 font-medium">Course Type</th>
              <th className="pb-2.5 font-medium text-right">Application Deadline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedDeadlines.map((dl) => (
              <tr
                key={dl.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                {/* University */}
                <td className="py-3 pr-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold group-hover:bg-emerald-100 group-hover:text-[#0B5D3B] transition-colors">
                      <Building className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 leading-tight">
                        {dl.university}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5" /> {dl.country} • {dl.intake}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Course Type Badges (Undergraduate vs Postgraduate in distinct colors) */}
                <td className="py-3 px-2">
                  {dl.courseType === "Undergraduate" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                      Undergraduate
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                      Postgraduate
                    </span>
                  )}
                </td>

                {/* Application Deadline with Highlight for Upcoming/Urgent */}
                <td className="py-3 pl-2 text-right">
                  <div className="inline-flex flex-col items-end">
                    <span
                      className={`font-bold ${
                        dl.isUrgent
                          ? "text-rose-600 font-extrabold"
                          : "text-slate-800"
                      }`}
                    >
                      {dl.applicationDeadline}
                    </span>
                    {dl.isUrgent ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 mt-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> In {dl.daysRemaining} days
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        In {dl.daysRemaining} days
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Advice */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="text-slate-500 font-medium">
          Priority CAS processing applied for applications lodged 10+ days before cutoff
        </span>
      </div>
    </div>
  );
};
