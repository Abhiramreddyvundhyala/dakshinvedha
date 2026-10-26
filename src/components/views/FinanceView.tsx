"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { BankAccountDetails, CommissionLedgerItem } from "@/types";
import { BankDetailsModal } from "@/components/modals/BankDetailsModal";
import { loadLedger } from "@/lib/portalDb";
import { currencyMark, money } from "@/lib/catalogOffers";
import { figures, partnerApplications } from "@/lib/commission";
import { newestFirst } from "@/lib/recent";

interface FinanceViewProps {
  subTab?: "account" | "commission";
}

type CommissionTab = "in-process" | "claim" | "ready" | "paid" | "ledger";

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

const COMMISSION_TABS: { id: CommissionTab; label: string }[] = [
  { id: "in-process", label: "Commission In Process" },
  { id: "claim", label: "Claim Commission" },
  { id: "ready", label: "Ready For Payment" },
  { id: "paid", label: "Paid Students" },
  { id: "ledger", label: "Ledger" },
];

export const FinanceView: React.FC<FinanceViewProps> = ({ subTab = "account" }) => {
  const { applications, activeB2BPartner, updateB2BProfile } = usePlatform();
  const [bankDetails, setBankDetails] = useState<BankAccountDetails>(EMPTY_BANK);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [commissionTab, setCommissionTab] = useState<CommissionTab>("in-process");
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

  const rows = useMemo(() => {
    const partnerApps = partnerApplications(applications, activeB2BPartner).filter((app) => app.primaryStatus !== "Closed");
    return newestFirst(
      partnerApps.map((app) => ({ app, snapshot: figures(app) })),
      (row) => row.app.dateModified || row.app.dateAdded
    );
  }, [applications, activeB2BPartner]);

  const inProcess = rows.filter((row) => row.app.primaryStatus !== "Completed");
  const claimable = rows.filter((row) => row.app.primaryStatus === "Completed" && row.snapshot.status === "Pending");
  const ready = rows.filter((row) => row.snapshot.status === "Approved");
  const paid = rows.filter((row) => row.snapshot.paid);
  const mark = currencyMark(rows.map((row) => row.app.course));
  const recorded = rows.reduce((total, row) => total + row.snapshot.eligible, 0);
  const awaiting = rows.filter((row) => row.snapshot.awaiting).reduce((total, row) => total + row.snapshot.eligible, 0);
  const paidTotal = paid.reduce((total, row) => total + row.snapshot.eligible, 0);

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
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex gap-6 overflow-x-auto">
              {COMMISSION_TABS.map((tab) => {
                const active = commissionTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCommissionTab(tab.id)}
                    className={`whitespace-nowrap pb-3 text-sm ${
                      active
                        ? "border-b-2 border-orange-500 font-semibold text-orange-600"
                        : "border-b-2 border-transparent font-medium text-slate-900 hover:text-slate-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <p className="pb-3 text-[11px] text-slate-500">
              Recorded {money(recorded, mark)} · Awaiting payout {money(awaiting, mark)} · Paid {money(paidTotal, mark)}
            </p>
          </div>

          <div className="overflow-x-auto p-2">
            {commissionTab === "in-process" && (
              <CommissionTable
                empty="No applications are still in process."
                headings={["Student", "Tracking ID", "University", "Course", "Commission", "Status"]}
                rows={inProcess.map(({ app, snapshot }) => [
                  app.student.name,
                  app.camsId,
                  app.university.name,
                  app.course.courseName,
                  snapshot.eligibleLabel,
                  "Updates when placed",
                ])}
              />
            )}
            {commissionTab === "claim" && (
              <CommissionTable
                empty="Nothing is waiting here. The amount appears after the admin team marks the student placed."
                headings={["Student", "Tracking ID", "University", "Commission", "Payout"]}
                rows={claimable.map(({ app, snapshot }) => [
                  app.student.name,
                  app.camsId,
                  app.university.name,
                  snapshot.eligibleLabel,
                  "Waiting for admin",
                ])}
              />
            )}
            {commissionTab === "ready" && (
              <CommissionTable
                empty="No payout is approved yet."
                headings={["Student", "Tracking ID", "Amount", "Application"]}
                rows={ready.map(({ app, snapshot }) => [
                  app.student.name,
                  app.camsId,
                  snapshot.eligibleLabel,
                  app.primaryStatus,
                ])}
              />
            )}
            {commissionTab === "paid" && (
              <CommissionTable
                empty="No commission has been marked paid."
                headings={["Student", "Tracking ID", "University", "Commission", "Paid date", "Reference"]}
                rows={paid.map(({ app, snapshot }) => [
                  app.student.name,
                  app.camsId,
                  app.university.name,
                  snapshot.eligibleLabel,
                  app.commission.paidDate || app.dateModified,
                  app.commission.referenceNumber || "—",
                ])}
              />
            )}
            {commissionTab === "ledger" && (
              <CommissionTable
                empty={ledgerError || "No commission ledger entries yet."}
                headings={["Transaction ID", "Date", "Description", "Credit", "Debit", "Balance"]}
                rows={ledger.map((entry) => [
                  entry.transactionId,
                  entry.date,
                  entry.description,
                  entry.credit,
                  entry.debit,
                  entry.balance,
                ])}
              />
            )}
          </div>
        </section>
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

function CommissionTable({
  headings,
  rows,
  empty,
}: {
  headings: string[];
  rows: string[][];
  empty: string;
}) {
  return (
    <table className="w-full min-w-[720px] text-left text-xs">
      <thead>
        <tr className="border-b border-slate-200 text-[11px] font-medium text-slate-500">
          {headings.map((heading) => (
            <th key={heading} className="px-3 py-3 font-medium">{heading}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={headings.length} className="px-3 py-8 text-slate-400">{empty}</td>
          </tr>
        )}
        {rows.map((cells, index) => (
          <tr key={`${cells[0]}-${cells[1]}-${index}`} className="border-b border-slate-100 text-slate-800">
            {cells.map((cell, cellIndex) => (
              <td key={cellIndex} className={`px-3 py-3 ${cellIndex === 0 ? "font-semibold text-slate-900" : ""}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
