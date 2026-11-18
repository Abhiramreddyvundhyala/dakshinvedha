"use client";

import React, { useMemo, useState } from "react";
import { ApplicationRecord, CommissionLedgerItem } from "@/types";
import { currencyMark, money } from "@/lib/catalogOffers";
import { claimStage, claimStatusLabel, figures } from "@/lib/commission";
import { downloadCommissionPdf, type CommissionPdfDoc } from "@/lib/commissionPdf";
import { newestFirst } from "@/lib/recent";

type BoardTab = "in-process" | "claim" | "requested" | "claimed" | "ledger";

interface CommissionBoardProps {
  applications: ApplicationRecord[];
  audience: "b2b" | "agent";
  onClaim: (camsId: string) => string | null;
  payeeLabel?: string;
  ledger?: CommissionLedgerItem[];
  ledgerError?: string | null;
}

const TABS: { id: BoardTab; label: string }[] = [
  { id: "in-process", label: "In process" },
  { id: "claim", label: "Claim commission" },
  { id: "requested", label: "Requested" },
  { id: "claimed", label: "Claimed" },
];

export const CommissionBoard: React.FC<CommissionBoardProps> = ({
  applications,
  audience,
  onClaim,
  payeeLabel,
  ledger,
  ledgerError,
}) => {
  const [tab, setTab] = useState<BoardTab>("claim");
  const [notice, setNotice] = useState<string | null>(null);

  const rows = useMemo(() => {
    const open = applications.filter((app) => app.primaryStatus !== "Closed");
    return newestFirst(
      open.map((app) => ({ app, snapshot: figures(app), stage: claimStage(app) })),
      (row) => row.app.dateModified || row.app.dateAdded
    );
  }, [applications]);

  const inProcess = rows.filter((row) => row.stage === "in-process" || row.stage === "waiting-university");
  const ready = rows.filter((row) => row.stage === "ready");
  const requested = rows.filter((row) => row.stage === "requested");
  const claimed = rows.filter((row) => row.stage === "claimed");
  const visible =
    tab === "in-process" ? inProcess : tab === "claim" ? ready : tab === "requested" ? requested : tab === "claimed" ? claimed : [];
  const mark = currencyMark(rows.map((row) => row.app.course));
  const sum = (list: typeof rows, field: "expected" | "eligible") => list.reduce((total, row) => total + row.snapshot[field], 0);
  const showLedger = ledger !== undefined;

  const claim = (camsId: string) => {
    const row = rows.find((item) => item.app.camsId === camsId);
    const error = onClaim(camsId);
    setNotice(
      error || "Claim request sent to admin. After the transfer, it moves to Claimed. A statement of your commission has been downloaded."
    );
    if (!error && row) {
      downloadCommissionPdf(payeeStatement(row.app, row.snapshot, audience, payeeLabel, "Claim requested"));
      setTab("requested");
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="space-y-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Commission</h3>
          <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-slate-500">
            Your commission is the percentage already saved on the course, multiplied by the tuition fee.
            A claim opens after the student is placed and Dakshinvedha has received the university payment.
            Claiming downloads a statement of your amount. Admin then transfers it and marks the claim done.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Summary label="Ready to claim" value={money(sum(ready, "eligible"), mark)} note={`${ready.length} file${ready.length === 1 ? "" : "s"}`} />
          <Summary label="Requested" value={money(sum(requested, "eligible"), mark)} note="Waiting for admin" />
          <Summary label="Claimed done" value={money(sum(claimed, "eligible"), mark)} note={`${claimed.length} paid`} />
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto border-b border-slate-200 px-5 pt-3">
        {TABS.map((item) => {
          const count = item.id === "in-process" ? inProcess.length : item.id === "claim" ? ready.length : item.id === "requested" ? requested.length : claimed.length;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`whitespace-nowrap pb-3 text-sm ${
                active
                  ? "border-b-2 border-orange-500 font-semibold text-orange-600"
                  : "border-b-2 border-transparent font-medium text-slate-900 hover:text-slate-600"
              }`}
            >
              {item.label}
              <span className="ml-1 text-[11px] text-slate-400">{count}</span>
            </button>
          );
        })}
        {showLedger && (
          <button
            type="button"
            onClick={() => setTab("ledger")}
            className={`whitespace-nowrap pb-3 text-sm ${
              tab === "ledger"
                ? "border-b-2 border-orange-500 font-semibold text-orange-600"
                : "border-b-2 border-transparent font-medium text-slate-900 hover:text-slate-600"
            }`}
          >
            Ledger
          </button>
        )}
      </div>

      {notice && (
        <p className="mx-5 mt-4 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-900">
          {notice}
        </p>
      )}

      <div className="overflow-x-auto p-2">
        {tab === "ledger" && showLedger ? (
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-medium text-slate-500">
                {["Transaction ID", "Date", "Description", "Credit", "Debit", "Balance"].map((heading) => (
                  <th key={heading} className="px-3 py-3 font-medium">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(ledger || []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-slate-400">{ledgerError || "No commission ledger entries yet."}</td>
                </tr>
              )}
              {(ledger || []).map((entry) => (
                <tr key={entry.id || entry.transactionId} className="border-b border-slate-100 text-slate-800">
                  <td className="px-3 py-3 font-semibold">{entry.transactionId}</td>
                  <td className="px-3 py-3">{entry.date}</td>
                  <td className="px-3 py-3">{entry.description}</td>
                  <td className="px-3 py-3">{entry.credit}</td>
                  <td className="px-3 py-3">{entry.debit}</td>
                  <td className="px-3 py-3">{entry.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-medium text-slate-500">
                {["Student", "University / course", "Tuition fee", "Commission percentage", "Commission amount", "Status", "Action"].map((heading) => (
                  <th key={heading} className="px-3 py-3 font-medium">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-slate-400">{emptyCopy(tab)}</td>
                </tr>
              )}
              {visible.map(({ app, snapshot, stage }) => (
                <tr key={app.camsId} className="border-b border-slate-100 text-slate-800">
                  <td className="px-3 py-3">
                    <p className="font-semibold text-slate-900">{app.student.name}</p>
                    <p className="font-mono text-[10px] text-slate-400">{app.camsId}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-slate-800">{app.university.name}</p>
                    <p className="text-[10px] text-slate-500">{app.course.courseName}</p>
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-900">{snapshot.tuitionLabel}</td>
                  <td className="px-3 py-3 font-semibold text-orange-700">{snapshot.rateLabel}</td>
                  <td className="px-3 py-3 font-bold text-slate-900">{snapshot.amountLabel}</td>
                  <td className="px-3 py-3 text-slate-600">{claimStatusLabel(app)}</td>
                  <td className="px-3 py-3">
                    {stage === "ready" && snapshot.expected > 0 ? (
                      <button
                        type="button"
                        onClick={() => claim(app.camsId)}
                        className="rounded-lg bg-orange-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-orange-600"
                      >
                        Claim commission
                      </button>
                    ) : stage === "ready" ? (
                      <span className="text-[11px] text-slate-400">No commission on this course</span>
                    ) : stage === "requested" || stage === "claimed" ? (
                      <div className="flex flex-col items-start gap-1">
                        <span className={`text-[11px] font-semibold ${stage === "claimed" ? "text-emerald-700" : "text-amber-800"}`}>
                          {stage === "claimed" ? "Paid" : "Waiting for admin"}
                        </span>
                        <button
                          type="button"
                          onClick={() => downloadCommissionPdf(payeeStatement(app, snapshot, audience, payeeLabel, claimStatusLabel(app)))}
                          className="text-[11px] font-bold text-orange-700 hover:text-orange-800"
                        >
                          Download statement
                        </button>
                      </div>
                    ) : stage === "waiting-university" ? (
                      <span className="text-[11px] text-slate-400">Waiting for the university payment</span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Opens after placement</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

function Summary({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-sm font-black text-slate-900">{value}</p>
      <p className="text-[11px] font-semibold text-slate-700">{label}</p>
      <p className="text-[10px] text-slate-400">{note}</p>
    </div>
  );
}

function payeeStatement(
  app: ApplicationRecord,
  snapshot: ReturnType<typeof figures>,
  audience: "b2b" | "agent",
  payeeLabel: string | undefined,
  status: string
): CommissionPdfDoc {
  return {
    filename: `${app.camsId}-commission-statement.pdf`,
    title: "Commission statement",
    subtitle: "This statement shows the commission Dakshinvedha will pay you for this application.",
    rows: [
      { label: "Payee", value: payeeLabel || (audience === "agent" ? "Agent" : "B2B partner") },
      { label: "Tracking ID", value: app.camsId },
      { label: "Student", value: app.student.name },
      { label: "University", value: app.university.name },
      { label: "Course", value: app.course.courseName },
      { label: "Tuition fee", value: snapshot.tuitionLabel },
      { label: "Your commission rate", value: snapshot.rateLabel },
      { label: "Your commission amount", value: snapshot.amountLabel },
      { label: "Status", value: status },
      { label: "Claim date", value: app.commission.claimedOn || "—" },
      { label: "Date paid", value: app.commission.paidDate || "—" },
      { label: "Payment reference", value: app.commission.referenceNumber || "—" },
    ],
    note: "This statement lists your commission only. It is the rate already saved on the course.",
  };
}

function emptyCopy(tab: BoardTab): string {
  if (tab === "in-process") return "No applications are still in process.";
  if (tab === "claim") return "Nothing is ready to claim. The button appears after the student is placed and Dakshinvedha has received the university payment.";
  if (tab === "requested") return "No claim is waiting with admin.";
  if (tab === "claimed") return "No commission has been marked claimed done.";
  return "No commission ledger entries yet.";
}
