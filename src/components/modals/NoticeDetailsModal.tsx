"use client";

import React from "react";
import { X, FileText, Download, Calendar, Building, AlertCircle } from "lucide-react";
import { NoticeItem } from "@/types";

interface NoticeDetailsModalProps {
  notice: NoticeItem | null;
  onClose: () => void;
}

export const NoticeDetailsModal: React.FC<NoticeDetailsModalProps> = ({
  notice,
  onClose,
}) => {
  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/60">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-[#0B5D3B]">
                {notice.category}
              </span>
              {notice.isUrgent && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Urgent Advisory
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {notice.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Metadata pill row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-medium">
              <Building className="w-4 h-4 text-[#0B5D3B]" />
              <span>{notice.university}</span>
              <span className="text-slate-400 font-normal">({notice.country})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Published: {notice.dateAdded}</span>
            </div>
          </div>

          {/* Abstract / Summary */}
          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-950 font-medium leading-relaxed">
            {notice.description}
          </div>

          {/* Full content */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Official University Notice
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {notice.fullContent}
            </p>
          </div>

          {/* Attachment placeholder */}
          {notice.attachmentName && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Official Attachment
              </h4>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#0B5D3B] flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {notice.attachmentName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Size: {notice.attachmentSize || "1.2 MB"} • Document Verified
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    alert(`Downloading official circular: ${notice.attachmentName}`)
                  }
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#0B5D3B]" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0B5D3B] hover:bg-[#08482D] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
