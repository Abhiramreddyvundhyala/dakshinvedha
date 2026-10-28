"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { BankAccountDetails, CommissionLedgerItem } from "@/types";
import { BankDetailsModal } from "@/components/modals/BankDetailsModal";
import { CommissionBoard } from "@/components/views/CommissionBoard";
import { loadLedger } from "@/lib/portalDb";
import { partnerApplications } from "@/lib/commission";

interface FinanceViewProps {
  subTab?: "account" | "commission";
}

const EMPTY_BANK: BankAccountDetails = {
  businessAccountName: "",
  accountNumber: "",
  bankName: "",
  branch: "",
  swift: "",
  ifscSortCode: "",
  ibanBic: "",
  vatNumber: "",
  status: "Pending Verification",
};

export const FinanceView: React.FC<FinanceViewProps> = ({ subTab = "account" }) => {
  const { applications, activeB2BPartner, updateB2BProfile, claimCommission } = usePlatform();
  const [bankDetails, setBankDetails] = useState<BankAccountDetails>(EMPTY_BANK);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [ledger, setLedger] = useState<CommissionLedgerItem[]>([]);
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  useEffect(() => {
    void loadLedger().then((result) => {
      if (result.error) setLedgerError(result.error);
      setLedger(result.entries);
    });
  }, []);

  useEffect(() => {
    if (!activeB2BPartner) return;
    if (activeB2BPartner.financeAccount) {
      setBankDetails(activeB2BPartner.financeAccount);
      return;
    }
    const bank = activeB2BPartner.bankDetails;
    setBankDetails({
      businessAccountName: bank.accountHolderName,
      accountNumber: bank.accountNumber,
      bankName: bank.bankName,
      branch: "",
      swift: bank.swiftCode,
      ifscSortCode: bank.ifsc,
      ibanBic: "",
      vatNumber: "",
      status: bank.status === "Verified" ? "Approved" : bank.status === "Action Required" ? "Action Required" : "Pending Verification",
    });
  }, [activeB2BPartner]);

  const partnerApps = useMemo(
    () => (activeB2BPartner ? partnerApplications(applications, activeB2BPartner) : []),
    [applications, activeB2BPartner]
  );

  const saveBank = (updated: BankAccountDetails) => {
    setBankDetails(updated);
    if (!activeB2BPartner) return;
    updateB2BProfile(activeB2BPartner.id, {
      financeAccount: updated,
      bankDetails: {
        ...activeB2BPartner.bankDetails,
        accountHolderName: updated.businessAccountName,
        accountNumber: updated.accountNumber,
        bankName: updated.bankName,
        swiftCode: updated.swift,
        ifsc: updated.ifscSortCode,
        status: updated.status === "Approved" ? "Verified" : updated.status === "Action Required" ? "Action Required" : "Pending",
      },
    });
  };

  const swiftCell = [bankDetails.swift, bankDetails.ifscSortCode].filter(Boolean).join(" / ") || "N/A";
  const ibanCell = bankDetails.ibanBic || bankDetails.ifscSortCode || "N/A";

  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="text-lg font-semibold text-slate-900">{subTab === "commission" ? "Commission" : "Account"}</h2>

      {subTab === "account" && (
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-bold text-slate-900">Bank Account Details:</h3>
            <button
              type="button"
              onClick={() => setIsBankModalOpen(true)}
              className="self-start rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600"
            >
              Update Bank Details Now
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-medium text-slate-500">
                  {["Business Account Name", "Business Account Number", "Bank Name", "Branch Address", "SWIFT Code / Sort Code", "IBAN / BIC / IFSC Code", "VAT", "Status"].map((heading) => (
                    <th key={heading} className="px-3 py-3 font-medium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100 text-slate-800">
                  <td className="px-3 py-4 font-semibold">{bankDetails.businessAccountName || "—"}</td>
                  <td className="px-3 py-4 font-mono">{bankDetails.accountNumber || "—"}</td>
                  <td className="px-3 py-4">{bankDetails.bankName || "—"}</td>
                  <td className="px-3 py-4">{bankDetails.branch || "—"}</td>
                  <td className="px-3 py-4 font-mono">{swiftCell}</td>
                  <td className="px-3 py-4 font-mono">{ibanCell}</td>
                  <td className="px-3 py-4">{bankDetails.vatNumber || "N/A"}</td>
                  <td className="px-3 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      bankDetails.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-800"
                    }`}>
                      {bankDetails.status}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(subTab === "account" || subTab === "commission") && (
        <CommissionBoard
          applications={partnerApps}
          audience="b2b"
          onClaim={claimCommission}
          ledger={ledger}
          ledgerError={ledgerError}
        />
      )}

      <BankDetailsModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        bankDetails={bankDetails}
        onSave={saveBank}
      />
    </div>
  );
};

