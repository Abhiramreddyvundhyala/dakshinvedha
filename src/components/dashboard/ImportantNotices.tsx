"use client";

import React, { useState } from "react";
import { Eye, ArrowRight, BellRing, Sparkles, Clock } from "lucide-react";
import { MOCK_NOTICES } from "@/data/mockData";
import { NoticeItem } from "@/types";
import { NoticeDetailsModal } from "@/components/modals/NoticeDetailsModal";

export const ImportantNotices: React.FC = () => {
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [viewAll, setViewAll] = useState(false);

  const displayedNotices = viewAll ? MOCK_NOTICES : MOCK_NOTICES.slice(0, 4);

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between h-full">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FDF5F0] border border-[#F5D2C1] flex items-center justify-center text-[#D56732]">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Important Notices
              </h3>
              <p className="text-[11px] text-slate-400">
                Official admissions advisories & circulars
              </p>
            </div>
          </div>

          <button
            onClick={() => setViewAll(!viewAll)}
            className="group flex items-center gap-1 text-xs font-bold text-[#D56732] hover:text-[#BA5322] tracking-wide transition-colors"
          >
            <span>{viewAll ? "SHOW LESS" : "VIEW ALL"}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Notices Table / List */}
        <div className="mt-3 divide-y divide-slate-100 flex-1">
          {displayedNotices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => setSelectedNotice(notice)}
              className="py-3 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
            >
              {/* Left Title & University */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-[#D56732] transition-colors line-clamp-1">
                    {notice.title}
                  </span>
                  {notice.isUrgent && (
                    <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[10px] font-bold rounded shrink-0">
                      Urgent
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700 truncate max-w-[200px]">
                    {notice.university}
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">{notice.category}</span>
                </div>
              </div>

              {/* Right: Date Added & Eye Icon */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">
                    {notice.dateAdded}
                  </span>
                  <span className="text-[10px] text-[#D56732] font-medium group-hover:underline">
                    View Notice
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNotice(notice);
                  }}
                  className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#D56732] group-hover:text-white text-slate-600 flex items-center justify-center transition-colors"
                  title="View Notice Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notice Modal */}
      <NoticeDetailsModal
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />
    </>
  );
};
