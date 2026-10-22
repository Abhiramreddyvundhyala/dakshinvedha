"use client";

import React from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { ApplicationRecord } from "@/types";
import { trackerProgress } from "@/utils/tracking";

interface ApplicationTrackerProps {
  application: ApplicationRecord;
  compact?: boolean;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({ application, compact = false }) => {
  const { stages, completed, total } = trackerProgress(application);

  const bar = (
    <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-200" aria-hidden="true">
      {stages.map((stage) => (
        <div
          key={stage.status}
          title={`${stage.status} (${stage.state})`}
          className={`h-full flex-1 ${
            stage.state === "completed"
              ? "bg-orange-500"
              : stage.state === "current"
              ? "bg-orange-400 animate-pulse"
              : stage.state === "not_applicable"
              ? "bg-slate-300"
              : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );

  if (compact) {
    return (
      <div className="min-w-[120px]">
        <div className="mb-1 text-[10px] font-bold text-slate-500">
          Stage {completed}/{total}
        </div>
        {bar}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">11-stage tracker</p>
          <p className="font-mono text-xs font-bold text-orange-700">{application.camsId}</p>
        </div>
        <p className="text-[11px] font-bold text-slate-700">
          {completed} / {total} completed
        </p>
      </div>
      {bar}
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {stages.map((stage, idx) => (
          <li
            key={stage.status}
            className={`rounded-xl border px-3 py-2 ${
              stage.state === "current"
                ? "border-orange-300 bg-orange-50"
                : stage.state === "completed"
                ? "border-orange-200 bg-orange-50/70"
                : stage.state === "not_applicable"
                ? "border-slate-200 bg-slate-50 opacity-70"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[11px] font-bold ${stage.state === "not_applicable" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                {idx + 1}. {stage.status}
              </span>
              {stage.state === "completed" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-orange-600" />
              ) : stage.state === "current" ? (
                <Clock className="h-3.5 w-3.5 text-orange-500" />
              ) : null}
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500">{stage.description}</p>
            <p className="font-mono text-[10px] text-slate-400">{stage.date}</p>
          </li>
        ))}
      </ol>
    </div>
  );
};
