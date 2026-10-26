"use client";

import React, { useEffect, useState } from "react";
import { X, CreditCard, Check, Building } from "lucide-react";
import { BankAccountDetails } from "@/types";
import { bankFieldError } from "@/lib/b2bValidation";

interface BankDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankDetails: BankAccountDetails;
  onSave: (updated: BankAccountDetails) => void;
}

export const BankDetailsModal: React.FC<BankDetailsModalProps> = ({
  isOpen,
  onClose,
  bankDetails,
  onSave,
}) => {
  const [formData, setFormData] = useState<BankAccountDetails>(bankDetails);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFormData(bankDetails);
    setError(null);
  }, [isOpen, bankDetails]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = bankFieldError({
      accountHolder: formData.businessAccountName,
      bankName: formData.bankName,
      ifsc: formData.ifscSortCode,
      accountNumber: formData.accountNumber,
      swiftCode: formData.swift,
    });
    if (problem) {
      setError(problem);
      return;
    }
    onSave({
      ...formData,
      businessAccountName: formData.businessAccountName.trim(),
      accountNumber: formData.accountNumber.replace(/\D/g, ""),
      bankName: formData.bankName.trim(),
      ifscSortCode: formData.ifscSortCode.trim().toUpperCase(),
      swift: formData.swift.trim().toUpperCase(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Update Agency Remittance Bank Details</h3>
              <p className="text-[11px] text-slate-400">Direct commission wire coordinates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          {error && <p className="text-xs font-semibold text-rose-700">{error}</p>}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Business Account Name *
            </label>
            <input
              type="text"
              required
              value={formData.businessAccountName}
              onChange={(e) =>
                setFormData({ ...formData, businessAccountName: e.target.value })
              }
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Account Number *
              </label>
              <input
                type="text"
                required
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c] font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                required
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Branch Address *
            </label>
            <input
              type="text"
              required
              value={formData.branch}
              onChange={(e) =>
                setFormData({ ...formData, branch: e.target.value })
              }
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                SWIFT Code *
              </label>
              <input
                type="text"
                required
                value={formData.swift}
                onChange={(e) =>
                  setFormData({ ...formData, swift: e.target.value })
                }
                className="w-full p-2 border border-slate-200 rounded-lg font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                IFSC / Sort Code *
              </label>
              <input
                type="text"
                required
                value={formData.ifscSortCode}
                onChange={(e) =>
                  setFormData({ ...formData, ifscSortCode: e.target.value })
                }
                className="w-full p-2 border border-slate-200 rounded-lg font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                IBAN / BIC Code *
              </label>
              <input
                type="text"
                required
                value={formData.ibanBic}
                onChange={(e) =>
                  setFormData({ ...formData, ibanBic: e.target.value })
                }
                className="w-full p-2 border border-slate-200 rounded-lg font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                VAT / Tax ID
              </label>
              <input
                type="text"
                value={formData.vatNumber}
                onChange={(e) =>
                  setFormData({ ...formData, vatNumber: e.target.value })
                }
                className="w-full p-2 border border-slate-200 rounded-lg font-mono uppercase"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 text-xs font-semibold hover:bg-slate-100 rounded-lg"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>SAVE CHANGES</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
