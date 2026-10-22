"use client";

import React, { useEffect, useState } from "react";
import {
  DollarSign,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  Edit,
  Tag,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";
import { BankAccountDetails, CommissionLedgerItem } from "@/types";
import { BankDetailsModal } from "@/components/modals/BankDetailsModal";
import { loadLedger } from "@/lib/portalDb";

interface FinanceViewProps {
  subTab?:
    | "account"
    | "commission"
    | "promotional-commission"
    | "accommodation-commission"
    | "loan-commission"
    | "promotional-deals";
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

  // Commission Sub-tabs
  const [commissionTab, setCommissionTab] = useState<
    "in-process" | "claim" | "ready" | "paid" | "ledger"
  >("in-process");

  // Local state for claim status simulation
  const [claimedIds, setClaimedIds] = useState<string[]>([]);

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

  const handleClaim = (camsId: string) => {
    setClaimedIds((prev) => [...prev, camsId]);
    claimCommission(camsId);
  };

  // 1. Commission In Process Data
  const inProcessApps = applications.filter(
    (a) => a.primaryStatus !== "Completed" && a.primaryStatus !== "Closed"
  );

  // 2. Claim Commission Data (Offer Issued / Tuition paid students eligible)
  const claimableApps = applications.filter(
    (a) => a.primaryStatus === "Offer Issued" || a.primaryStatus === "Payment Done"
  );

  // 3. Ready For Payment Data
  const readyForPaymentItems: { student: string; invoice: string; amount: string; approvedDate: string; paymentStatus: string }[] = [];

  // 4. Paid Students Data
  const paidStudents = applications.filter(
    (a) => a.secondaryStatus === "Commission Paid" || a.commission.status === "Paid"
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Heading */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-500" />
            Account & Commission Slabs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage agency bank accounts, disburse claims, and reconcile institutional commission ledgers.
          </p>
        </div>

        <button
          onClick={() => alert("Downloaded PDF Consolidated Statement.")}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-orange-600" />
          <span>Download PDF Statement</span>
        </button>
      </div>

      {/* BANK ACCOUNT DETAILS SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-500" />
              Bank Account Details
            </h3>
            <p className="text-xs text-slate-400">
              Verified wire coordinates for international commission settlements
            </p>
          </div>

          <button
            onClick={() => setIsBankModalOpen(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Update Bank Details Now</span>
          </button>
        </div>

        {/* Bank Details Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Business Account Name</th>
                <th className="py-3 px-3">Business Account Number</th>
                <th className="py-3 px-3">Bank Name</th>
                <th className="py-3 px-3">Branch Address</th>
                <th className="py-3 px-3">SWIFT Code / Sort Code</th>
                <th className="py-3 px-3">IBAN / BIC / IFSC Code</th>
                <th className="py-3 px-3">VAT</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3 font-bold text-slate-900">
                  {bankDetails.businessAccountName}
                </td>
                <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                  {bankDetails.accountNumber}
                </td>
                <td className="py-3 px-3 font-medium text-slate-800">
                  {bankDetails.bankName}
                </td>
                <td className="py-3 px-3 text-slate-500 max-w-[200px] truncate">
                  {bankDetails.branch}
                </td>
                <td className="py-3 px-3 font-mono font-semibold text-slate-800 uppercase">
                  {bankDetails.swift} / {bankDetails.ifscSortCode}
                </td>
                <td className="py-3 px-3 font-mono font-semibold text-slate-800 uppercase">
                  {bankDetails.ibanBic}
                </td>
                <td className="py-3 px-3 font-mono text-slate-600">
                  {bankDetails.vatNumber}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300">
                    {bankDetails.status}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* COMMISSION TABS SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Agency Commission Ledger & Claims
            </h3>
            <p className="text-xs text-slate-400">
              Track in-process allocations, submit claims, and audit paid remittances
            </p>
          </div>

          {/* 5 Commission Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {[
              { id: "in-process", label: "Commission In Process" },
              { id: "claim", label: "Claim Commission" },
              { id: "ready", label: "Ready For Payment" },
              { id: "paid", label: "Paid Students" },
              { id: "ledger", label: "Ledger" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCommissionTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                  commissionTab === tab.id
                    ? "bg-orange-500 text-white shadow-xs font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: Commission In Process */}
        {commissionTab === "in-process" && (
          <div className="overflow-x-auto animate-fade-in">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Tracking ID</th>
                  <th className="py-3 px-3">University</th>
                  <th className="py-3 px-3">Course</th>
                  <th className="py-3 px-3 font-mono">Expected Commission</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inProcessApps.map((a) => (
                  <tr key={a.camsId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{a.student.name}</td>
                    <td className="py-3 px-3 font-mono font-bold text-orange-600">{a.camsId}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{a.university.name}</td>
                    <td className="py-3 px-3 text-slate-600">{a.course.courseName}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{a.commission.expectedCommission}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        In Assessment
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: Claim Commission */}
        {commissionTab === "claim" && (
          <div className="overflow-x-auto animate-fade-in">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Tracking ID</th>
                  <th className="py-3 px-3 font-mono">Commission Amount</th>
                  <th className="py-3 px-3 font-mono">Eligible Amount</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claimableApps.map((a) => {
                  const isClaimed = claimedIds.includes(a.camsId) || a.commission.status === "Claimed" || a.commission.status === "Approved" || a.commission.status === "Paid";
                  return (
                    <tr key={a.camsId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{a.student.name}</td>
                      <td className="py-3 px-3 font-mono font-bold text-orange-600">{a.camsId}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{a.commission.amount}</td>
                      <td className="py-3 px-3 font-mono font-bold text-orange-600">{a.commission.eligibleAmount}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          disabled={isClaimed}
                          onClick={() => handleClaim(a.camsId)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isClaimed
                              ? "bg-orange-100 text-orange-800 cursor-not-allowed"
                              : "bg-orange-500 hover:bg-orange-600 text-white shadow-xs cursor-pointer active:scale-98"
                          }`}
                        >
                          {isClaimed ? "CLAIMED" : "CLAIM"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: Ready For Payment */}
        {commissionTab === "ready" && (
          <div className="overflow-x-auto animate-fade-in">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Invoice</th>
                  <th className="py-3 px-3 font-mono">Amount</th>
                  <th className="py-3 px-3">Approved Date</th>
                  <th className="py-3 px-3 text-center">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {readyForPaymentItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{item.student}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-700">{item.invoice}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{item.amount}</td>
                    <td className="py-3 px-3 text-slate-500">{item.approvedDate}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: Paid Students */}
        {commissionTab === "paid" && (
          <div className="overflow-x-auto animate-fade-in">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Tracking ID</th>
                  <th className="py-3 px-3">University</th>
                  <th className="py-3 px-3 font-mono">Commission</th>
                  <th className="py-3 px-3">Paid Date</th>
                  <th className="py-3 px-3 font-mono">Reference Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paidStudents.map((a) => (
                  <tr key={a.camsId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{a.student.name}</td>
                    <td className="py-3 px-3 font-mono font-bold text-orange-600">{a.camsId}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{a.university.name}</td>
                    <td className="py-3 px-3 font-mono font-bold text-orange-600">{a.commission.amount}</td>
                    <td className="py-3 px-3 text-slate-600">{a.commission.paidDate || a.dateModified}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{a.commission.referenceNumber || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: Ledger */}
        {commissionTab === "ledger" && (
          <div className="overflow-x-auto animate-fade-in">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Transaction ID</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 font-mono text-orange-700">Credit</th>
                  <th className="py-3 px-3 font-mono text-rose-700">Debit</th>
                  <th className="py-3 px-3 font-mono font-bold">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 px-3 text-slate-400">{ledgerError || "No commission ledger entries yet."}</td>
                  </tr>
                )}
                {ledger.map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-3 px-3 font-mono font-bold text-orange-700">{entry.transactionId}</td>
                    <td className="py-3 px-3 text-slate-600">{entry.date}</td>
                    <td className="py-3 px-3 text-slate-800">{entry.description}</td>
                    <td className="py-3 px-3 font-mono text-orange-700">{entry.credit}</td>
                    <td className="py-3 px-3 font-mono text-rose-700">{entry.debit}</td>
                    <td className="py-3 px-3 font-mono font-bold">{entry.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bank Details Modal */}
      <BankDetailsModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        bankDetails={bankDetails}
        onSave={(updated) => {
          setBankDetails(updated);
          if (activeB2BPartner) {
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
          }
        }}
      />
    </div>
  );
};
