"use client";

import React, { useState } from "react";
import {
  Ticket,
  Tag,
  Gift,
  Copy,
  Check,
  ShoppingBag,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { MOCK_VOUCHERS } from "@/data/mockData";
import { VoucherItem } from "@/types";

interface VoucherViewProps {
  subTab?: "buy" | "manage";
}

export const VoucherView: React.FC<VoucherViewProps> = ({ subTab = "buy" }) => {
  const [activeTab, setActiveTab] = useState<"buy" | "manage">(subTab);
  const [vouchers, setVouchers] = useState<VoucherItem[]>(MOCK_VOUCHERS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBuyProduct = (testType: string, price: string) => {
    const newVoucher: VoucherItem = {
      id: `v-${Date.now()}`,
      code: `${testType.slice(0, 4).toUpperCase()}-${Math.floor(10000 + Math.random() * 89999)}`,
      type: testType,
      purchasedDate: "29 Sep 2026",
      amount: price,
      status: "Available",
      usedBy: "Unassigned",
    };

    setVouchers([newVoucher, ...vouchers]);
    alert(`Successfully purchased ${testType} for ${price}! Voucher generated: ${newVoucher.code}`);
    setActiveTab("manage");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-5 h-5 text-orange-500" />
            Voucher Management Portal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Purchase discounted test fee vouchers and assign promotional exam coupons to applicants.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("buy")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "buy"
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Buy Voucher</span>
          </button>

          <button
            onClick={() => setActiveTab("manage")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "manage"
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Manage Voucher List</span>
          </button>
        </div>
      </div>

      {/* 1. BUY VOUCHER PRODUCTS */}
      {activeTab === "buy" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-orange-300 transition-colors">
            <div className="space-y-2">
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded">
                British Council & IDP
              </span>
              <h3 className="text-base font-bold text-slate-900">
                IELTS Academic Test Voucher
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Official registration code redeemable at any British Council or IDP IELTS testing center globally.
              </p>
              <div className="pt-2">
                <span className="text-2xl font-black text-slate-900 font-mono">£145.00</span>
                <span className="text-xs text-slate-400 line-through ml-2">£180.00</span>
                <span className="text-[10px] font-bold text-emerald-600 ml-1">Save 20%</span>
              </div>
            </div>

            <button
              onClick={() => handleBuyProduct("IELTS Academic Test Voucher", "£145.00")}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Purchase IELTS Voucher</span>
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-orange-300 transition-colors">
            <div className="space-y-2">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                Pearson Official
              </span>
              <h3 className="text-base font-bold text-slate-900">
                PTE Academic Test Voucher
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Official Pearson VUE voucher code. Instant score delivery within 48 hours for fast visa filing.
              </p>
              <div className="pt-2">
                <span className="text-2xl font-black text-slate-900 font-mono">£135.00</span>
                <span className="text-xs text-slate-400 line-through ml-2">£170.00</span>
                <span className="text-[10px] font-bold text-emerald-600 ml-1">Save 21%</span>
              </div>
            </div>

            <button
              onClick={() => handleBuyProduct("PTE Academic Voucher", "£135.00")}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Purchase PTE Voucher</span>
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-orange-300 transition-colors">
            <div className="space-y-2">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">
                Duolingo Fast-Track
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Duolingo English Test (DET)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Accepted by 4,000+ universities worldwide. 1-hour computer-adaptive test taken from home.
              </p>
              <div className="pt-2">
                <span className="text-2xl font-black text-slate-900 font-mono">£45.00</span>
                <span className="text-xs text-slate-400 line-through ml-2">£60.00</span>
                <span className="text-[10px] font-bold text-emerald-600 ml-1">Save 25%</span>
              </div>
            </div>

            <button
              onClick={() => handleBuyProduct("Duolingo English Test (DET)", "£45.00")}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Purchase DET Voucher</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. MANAGE VOUCHER LIST TABLE */}
      {activeTab === "manage" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Manage Voucher List ({vouchers.length})
            </h3>
            <span className="text-xs text-slate-500">Live agency voucher inventory</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Voucher ID</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Purchased Date</th>
                  <th className="py-3 px-3 font-mono">Amount</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3">Used By</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Voucher ID */}
                    <td className="py-3 px-3 font-mono font-bold text-orange-600">
                      {v.code}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {v.type}
                    </td>

                    {/* Purchased Date */}
                    <td className="py-3 px-3 text-slate-500">
                      {v.purchasedDate}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {v.amount}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status === "Available"
                            ? "bg-emerald-100 text-emerald-800"
                            : v.status === "Redeemed"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>

                    {/* Used By */}
                    <td className="py-3 px-3 text-slate-700">
                      {v.usedBy}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => copyCode(v.id, v.code)}
                        className="p-1.5 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-600 rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Copy Voucher Code"
                      >
                        {copiedId === v.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[10px] font-semibold">Copy</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
