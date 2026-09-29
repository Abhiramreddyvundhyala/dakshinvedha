"use client";

import React from "react";
import { Download, FileText, Globe, BookOpen, ShieldCheck, HelpCircle } from "lucide-react";

export const OtherView: React.FC = () => {
  const resources = [
    {
      title: "UK Student Route Visa Checklist (2026/2027)",
      desc: "Comprehensive document checklist including 28-day financial proof, ATAS clearance codes, and tuberculosis test clinics.",
      format: "PDF (2.4 MB)",
    },
    {
      title: "Australian Genuine Student (GS) Protocol Guide",
      desc: "Step-by-step drafting guidelines for the new Australian Department of Home Affairs genuine student criteria.",
      format: "PDF (3.1 MB)",
    },
    {
      title: "German Public Universities English Taught Masters Directory",
      desc: "APS India certificate requirements, blocked account minimum deposits (€11,208/yr), and deadline schedules.",
      format: "XLSX (1.8 MB)",
    },
    {
      title: "Official IELTS vs PTE vs Duolingo Score Equivalence Matrix",
      desc: "Detailed score conversion table across UK Russell Group and Australian Group of Eight institutions.",
      format: "PDF (850 KB)",
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            Admissions Knowledge Base & Compliance Library
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Download verified immigration checklists, intake brochures, and embassy guidelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((item, i) => (
          <div
            key={i}
            className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3 hover:border-orange-300 transition-colors"
          >
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-orange-600 uppercase bg-orange-50 px-2 py-0.5 rounded">
                Official Guide
              </span>
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">{item.format}</span>
              <button
                onClick={() => alert(`Downloading verified file: ${item.title}`)}
                className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
