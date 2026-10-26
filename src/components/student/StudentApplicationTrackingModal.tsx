"use client";

import React, { useState } from "react";
import { ApplicationRecord } from "@/types";
import { resolveTimeline } from "@/utils/tracking";
import {
  X,
  CheckCircle2,
  Clock,
  Ban,
  FileText,
  Award,
  Building2,
  Calendar,
  DollarSign,
  Upload,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface StudentApplicationTrackingModalProps {
  application: ApplicationRecord | null;
  onClose: () => void;
  onUploadAdditionalDoc?: () => void;
}

export const StudentApplicationTrackingModal: React.FC<StudentApplicationTrackingModalProps> = ({
  application,
  onClose,
  onUploadAdditionalDoc,
}) => {
  const [modalTab, setModalTab] = useState<"tracking" | "offer" | "documents">("tracking");

  if (!application) return null;

  const stages = resolveTimeline(application);

  const isOfferAvailable =
    application.primaryStatus.includes("Offer") ||
    application.secondaryStatus.includes("Offer") ||
    stages.some((t) => t.status === "Offer Received" && (t.state === "completed" || t.state === "current"));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-orange-950 border-b border-orange-900 text-white flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold text-orange-300 bg-orange-900/80 px-2.5 py-0.5 rounded-full border border-orange-700/60">
                {application.camsId}
              </span>
              <span className="text-xs text-slate-300 font-bold">
                Submitted {application.dateAdded}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1">
              {application.course.courseName}
            </h2>
            <p className="text-xs text-slate-300">
              {application.university.name} • {application.course.activeIntake}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subtabs */}
        <div className="flex border-b px-6 gap-6 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            onClick={() => setModalTab("tracking")}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              modalTab === "tracking"
                ? "border-orange-600 text-orange-600"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            11-Stage Progress Tracker
          </button>
          {isOfferAvailable && (
            <button
              onClick={() => setModalTab("offer")}
              className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                modalTab === "offer"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-orange-700 hover:text-orange-900"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Official Offer Letter</span>
            </button>
          )}
          <button
            onClick={() => setModalTab("documents")}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              modalTab === "documents"
                ? "border-orange-600 text-orange-600"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            Documents ({application.documents.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs">
          {/* TAB 1: 11-STAGE APPLICATION TRACKING */}
          {modalTab === "tracking" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold uppercase text-orange-800 tracking-wider">
                    Current Milestone Status
                  </span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">
                    {application.primaryStatus} —{" "}
                    <span className="text-orange-700">{application.secondaryStatus}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Stage progression managed by Central Admissions Registry.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-orange-200">
                    Last Updated: {application.dateModified}
                  </span>
                </div>
              </div>

              {/* Detailed 11-stage vertical timeline */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {stages.map((stage, idx) => {
                  const isCompleted = stage.state === "completed";
                  const isCurrent = stage.state === "current";
                  const isNA = stage.state === "not_applicable";

                  return (
                    <div key={idx} className="relative flex items-start gap-4 group">
                      {/* Timeline icon indicator */}
                      <div
                        className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? "bg-orange-500 border-white text-white shadow-xs"
                            : isCurrent
                            ? "bg-orange-500 border-white text-white shadow-md shadow-orange-500/30 animate-pulse"
                            : isNA
                            ? "bg-slate-200 border-slate-300 text-slate-400"
                            : "bg-white border-slate-300 text-slate-300"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : isNA ? (
                          <Ban className="w-3 h-3" />
                        ) : isCurrent ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">{idx + 1}</span>
                        )}
                      </div>

                      <div className="flex-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`text-xs font-extrabold ${
                              isNA ? "line-through text-slate-400" : "text-slate-900"
                            }`}
                          >
                            {stage.status}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {isNA ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-600">
                                Not Applicable
                              </span>
                            ) : isCompleted ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-800">
                                Completed • {stage.date}
                              </span>
                            ) : isCurrent ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 animate-pulse">
                                In Progress
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{stage.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIAL OFFER LETTER */}
          {modalTab === "offer" && (
            <div className="p-6 bg-orange-50/50 border-2 border-orange-200 rounded-3xl space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-orange-200/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xl shadow-xs">
                    {application.university.logo}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                      Conditional Offer Confirmed
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">
                      {application.university.name}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Ref: OFF-GRE-2026-991
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-orange-100">
                  <span className="text-[10px] text-slate-400 font-bold block">Annual Tuition</span>
                  <strong className="text-slate-900 text-sm">{application.course.tuitionFee}</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-orange-100">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    Scholarship Awarded
                  </span>
                  <strong className="text-orange-700 text-sm">£2,500 Merit Grant</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-orange-100">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    Acceptance Deposit
                  </span>
                  <strong className="text-slate-900 text-sm">£3,000 (Refundable if visa refused)</strong>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-orange-100 space-y-1.5 text-xs text-slate-700">
                <p className="font-bold text-slate-900">Offer Acceptance Conditions:</p>
                <p>• Submit final official degree certificate prior to CAS issuance.</p>
                <p>• Maintain minimum 60% standard in final undergraduate semester.</p>
                <p>• Clear £3,000 deposit via bank transfer before 15 July 2026.</p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => alert("Downloading official Offer Letter PDF.")}
                  className="px-4 py-2 border border-orange-300 text-orange-800 font-bold text-xs rounded-xl hover:bg-orange-50 transition-colors cursor-pointer"
                >
                  Download Offer Letter PDF
                </button>
                <button
                  type="button"
                  onClick={() => alert("Offer accepted! Our admissions counselor will contact you for deposit clearance.")}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Accept Offer Online
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {modalTab === "documents" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">
                  Application documents ({application.documents.length})
                </span>
                {onUploadAdditionalDoc && (
                  <button
                    onClick={onUploadAdditionalDoc}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Additional Document</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-slate-50 border rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-extrabold text-slate-900">{doc.category}</p>
                      <p className="text-[11px] text-slate-500">
                        {doc.fileName} • {doc.fileSize}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        doc.status === "Verified"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
