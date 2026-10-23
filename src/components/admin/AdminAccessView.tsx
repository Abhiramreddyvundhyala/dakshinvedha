"use client";

import React, { useEffect, useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import {
  ADMIN_FEATURE_COPY,
  GRANTABLE_ADMIN_FEATURES,
  parseTeamFeatures,
  type AdminFeatureKey,
} from "@/lib/adminAccess";
import { AlertCircle, CheckCircle2, Lock, ShieldCheck } from "lucide-react";

export const AdminAccessView: React.FC = () => {
  const { isSuperAdmin, teamFeatures, saveTeamAccess } = usePlatform();
  const [selected, setSelected] = useState<AdminFeatureKey[]>(() => parseTeamFeatures(teamFeatures));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSelected(parseTeamFeatures(teamFeatures));
  }, [teamFeatures]);

  const toggle = (feature: AdminFeatureKey) => {
    setSaved(false);
    setSelected((prev) => (prev.includes(feature) ? prev.filter((item) => item !== feature) : [...prev, feature]));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const result = await saveTeamAccess(parseTeamFeatures(selected));
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSelected(parseTeamFeatures(selected));
    setSaved(true);
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg">
        <Lock className="w-8 h-8 text-slate-400 mx-auto" />
        <h1 className="mt-3 text-lg font-extrabold text-slate-900">Team access</h1>
        <p className="mt-2 text-sm text-slate-500">Only Super Admin can choose which screens the admin team may open.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Team access</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tick the admin-console screens your team may use. Unticked screens stay hidden for every staff login that is not Super Admin. Team roster and this page stay with you.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {saved && !error && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Team access saved. Staff see the new menu after they refresh or sign in again.</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        <label className="flex items-start gap-3 p-4 bg-slate-50">
          <input type="checkbox" checked disabled className="mt-1" />
          <span>
            <span className="block text-sm font-bold text-slate-900">{ADMIN_FEATURE_COPY.dashboard.label}</span>
            <span className="block text-xs text-slate-500 mt-0.5">{ADMIN_FEATURE_COPY.dashboard.description}</span>
          </span>
        </label>

        {GRANTABLE_ADMIN_FEATURES.map((feature) => {
          const copy = ADMIN_FEATURE_COPY[feature];
          const checked = selected.includes(feature);
          return (
            <label key={feature} className="flex items-start gap-3 p-4 cursor-pointer hover:bg-orange-50/40">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(feature)}
                className="mt-1 accent-orange-500"
              />
              <span>
                <span className="block text-sm font-bold text-slate-900">{copy.label}</span>
                <span className="block text-xs text-slate-500 mt-0.5">{copy.description}</span>
              </span>
            </label>
          );
        })}

        {(["team", "access"] as const).map((feature) => {
          const copy = ADMIN_FEATURE_COPY[feature];
          return (
            <div key={feature} className="flex items-start gap-3 p-4 bg-slate-50">
              <Lock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span>
                <span className="block text-sm font-bold text-slate-900">{copy.label}</span>
                <span className="block text-xs text-slate-500 mt-0.5">{copy.description}</span>
              </span>
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold disabled:opacity-70 cursor-pointer"
      >
        <ShieldCheck className="w-4 h-4" />
        {saving ? "Saving..." : "Save team access"}
      </button>
    </form>
  );
};
