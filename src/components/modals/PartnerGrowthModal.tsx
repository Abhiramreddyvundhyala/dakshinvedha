"use client";

import React from "react";
import { X, Sparkles, Trophy, Award, Gift, CheckCircle2, TrendingUp } from "lucide-react";

interface PartnerGrowthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerGrowthModal: React.FC<PartnerGrowthModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gold/Orange gradient */}
        <div className="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
                Partner Growth Program 2026
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Gold Partner
              </span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Agency Growth & Rewards Dashboard
            </h3>
            <p className="text-xs text-white/90">
              Unlock higher commission slabs, priority CAS slots & fast-track offer turnarounds.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Progress to Next Tier */}
          <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                Progress to Platinum Tier
              </span>
              <span className="font-bold text-orange-700">48 / 60 Enrolled Students (80%)</span>
            </div>

            <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-orange-200">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: "80%" }}
              />
            </div>

            <p className="text-[11px] text-slate-600">
              Just <strong>12 more enrolled students</strong> to unlock <strong>17.5% Platinum Commission</strong> and a dedicated UK University liaison officer.
            </p>
          </div>

          {/* Tier Overview Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Partner Commission Slabs
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 opacity-80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Silver Tier
                </span>
                <p className="text-base font-extrabold text-slate-800">12.5% Base</p>
                <p className="text-[11px] text-slate-500">1 - 25 Enrollments / year</p>
                <p className="text-[10px] text-slate-400">Standard support</p>
              </div>

              <div className="p-3.5 rounded-xl border-2 border-orange-500 bg-orange-50/40 space-y-2 relative shadow-xs">
                <span className="absolute -top-2.5 right-3 px-2 py-0.2 bg-orange-500 text-white rounded-full text-[9px] font-extrabold uppercase">
                  Current
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 block">
                  Gold Tier
                </span>
                <p className="text-base font-extrabold text-slate-900">15.0% Base + Bonus</p>
                <p className="text-[11px] text-slate-600">26 - 60 Enrollments / year</p>
                <p className="text-[10px] text-orange-700 font-semibold">Priority 48h CAS review</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                  Platinum Tier
                </span>
                <p className="text-base font-extrabold text-purple-900">17.5% Top Slab</p>
                <p className="text-[11px] text-slate-500">60+ Enrollments / year</p>
                <p className="text-[10px] text-purple-700 font-semibold">Global Annual Fam Trip</p>
              </div>
            </div>
          </div>

          {/* Active Partner Perks */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Gold Partner Privileges
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Express 72-Hour Offer Guarantee</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Dedicated Regional Liaison Desk</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>50% Subsidized IELTS / PTE Test Vouchers</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Automated Bi-weekly Commission Pay-outs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
