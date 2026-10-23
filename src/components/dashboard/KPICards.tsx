"use client";

import React from "react";
import { FileText, CheckCircle2, ShieldCheck, FolderX, ArrowUpRight, TrendingUp } from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";

interface KPICardsProps {
  onCardClick?: (filterType: string) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ onCardClick }) => {
  const { applications } = usePlatform();
  const processed = applications.filter((app) => !["Draft", "Application Submitted"].includes(app.primaryStatus)).length;
  const withCas = applications.filter((app) => app.primaryStatus === "CAS Processing" || app.primaryStatus === "CAS Issued").length;
  const closed = applications.filter((app) => app.primaryStatus === "Closed" || app.primaryStatus === "Completed").length;
  const cards = [
    {
      id: "total",
      label: "Total Applications",
      value: String(applications.length),
      subtext: "Live application records",
      icon: FileText,
      badgeColor: "text-orange-700 bg-orange-50",
    },
    {
      id: "processed",
      label: "Applications Processed",
      value: String(processed),
      subtext: "Past the submitted stage",
      icon: CheckCircle2,
      badgeColor: "text-blue-700 bg-blue-50",
    },
    {
      id: "cas",
      label: "With CAS Team",
      value: String(withCas),
      subtext: "CAS processing or issued",
      icon: ShieldCheck,
      badgeColor: "text-orange-700 bg-orange-50",
    },
    {
      id: "closed",
      label: "Case Closed",
      value: String(closed),
      subtext: "Completed or closed",
      icon: FolderX,
      badgeColor: "text-slate-600 bg-slate-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onCardClick && onCardClick(card.id)}
            className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:border-orange-200"
          >
            <div className="flex items-start justify-between">
              {/* Large circular icon container with orange line icon */}
              <div className="w-14 h-14 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#f97316] group-hover:bg-[#f97316] group-hover:text-white transition-colors duration-200 shadow-xs">
                <IconComponent className="w-7 h-7 stroke-[1.75]" />
              </div>

              {/* Sub-badge / trend */}
              <div className="flex items-center gap-1">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${card.badgeColor} flex items-center gap-0.5`}>
                  <TrendingUp className="w-3 h-3" />
                  Active
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-orange-600 transition-colors" />
              </div>
            </div>

            <div className="mt-4">
              {/* Metric label */}
              <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                {card.label}
              </p>

              {/* Large bold metric value */}
              <div className="mt-1 flex items-baseline justify-between">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </h3>
              </div>

              {/* Auxiliary metric detail */}
              <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
