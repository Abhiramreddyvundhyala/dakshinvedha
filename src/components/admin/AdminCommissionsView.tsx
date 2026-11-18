"use client";

import React, { useMemo, useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { currencyMark, money } from "@/lib/catalogOffers";
import {
  adminMargin,
  claimStage,
  commissionChannel,
  figures,
  parseMoney,
  universityIncome,
} from "@/lib/commission";
import { downloadCommissionPdf, type CommissionPdfDoc } from "@/lib/commissionPdf";
import { newestFirst } from "@/lib/recent";
import { ApplicationRecord, B2BPartnerProfile } from "@/types";

type Screen = "income" | "payees";
type ChannelFilter = "all" | "b2b" | "agent";
type StageFilter = "all" | "invoiced" | "university-paid" | "requested" | "paid";

function payeeName(
  app: { partnerRecordId?: string; partnerTrackingId?: string; counselorName: string; agentTrackingId?: string },
  channel: "b2b" | "agent",
  partners: B2BPartnerProfile[]
) {
  if (channel === "b2b") {
    const partner = partners.find((item) => item.id === app.partnerRecordId || item.partnerId === app.partnerTrackingId);
    return partner?.organizationName || partner?.name || app.partnerTrackingId || "B2B partner";
  }
  return app.counselorName || app.agentTrackingId || "Agent";
}

function partnerBank(app: ApplicationRecord, partners: B2BPartnerProfile[]) {
  return partners.find((item) => item.id === app.partnerRecordId || item.partnerId === app.partnerTrackingId)?.bankDetails;
}

function maskAccount(value: string) {
  const compact = value.replace(/\s/g, "");
  if (!compact) return "Not on file";
  if (compact.length <= 4) return compact;
  return `${"•".repeat(compact.length - 4)}${compact.slice(-4)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const card = {
  background: "#ffffff",
  border: "1px solid #dde1e7",
  borderRadius: 12,
  padding: 16,
};

export const AdminCommissionsView: React.FC = () => {
  const { applications, courses, b2bPartners, settleCommission, recordUniversityIncome, canAccessAdminFeature } = usePlatform();
  const canSettle = canAccessAdminFeature("commissions");
  const [screen, setScreen] = useState<Screen>("income");
  const [channel, setChannel] = useState<ChannelFilter>("all");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(today());
  const [formError, setFormError] = useState<string | null>(null);
  const [formNote, setFormNote] = useState<string | null>(null);

  const rows = useMemo(() => {
    return newestFirst(
      applications
        .filter((app) => commissionChannel(app) !== "direct" && app.primaryStatus !== "Closed")
        .map((app) => {
          const snapshot = figures(app);
          const income = universityIncome(app);
          const payout = snapshot.eligible > 0 ? snapshot.eligible : snapshot.expected;
          return {
            app,
            snapshot,
            income,
            payout,
            margin: adminMargin(app, payout),
            channel: commissionChannel(app) as "b2b" | "agent",
            stage: claimStage(app),
          };
        }),
      (row) => row.app.dateModified || row.app.dateAdded
    );
  }, [applications]);

  const placed = rows.filter((row) => row.app.primaryStatus === "Completed" || row.income.expected > 0 || row.income.received > 0);
  const mark = currencyMark(courses.length ? courses : placed.map((row) => row.app.course));
  const selected = rows.find((row) => row.app.camsId === selectedId) || null;

  const openIncome = (camsId: string, mode: "invoice" | "payment") => {
    const row = rows.find((item) => item.app.camsId === camsId);
    setScreen("income");
    setSelectedId(camsId);
    setFormError(null);
    setFormNote(null);
    setDate(today());
    setReference("");
    setRate(row?.app.commission.universityRate || "");
    const outstanding = row ? Math.max(row.income.outstanding, row.income.expected === 0 ? 0 : row.income.outstanding) : 0;
    setAmount(mode === "payment" && outstanding > 0 ? String(outstanding) : "");
  };

  const openPayout = (camsId: string) => {
    setScreen("payees");
    setSelectedId(camsId);
    setFormError(null);
    setFormNote(null);
    setDate(today());
    setReference("");
  };

  const saveIncome = (mode: "invoice" | "payment") => {
    if (!selected) return;
    const error = recordUniversityIncome(selected.app.camsId, {
      mode,
      amount,
      date,
      reference,
      rate,
    });
    if (error) {
      setFormError(error);
      setFormNote(null);
      return;
    }
    const entered = parseMoney(amount);
    const received = mode === "payment" ? selected.income.received + entered : selected.income.received;
    const expected = mode === "invoice" ? entered : selected.income.expected || entered;
    const done = mode === "payment" && received >= expected && received > 0;
    setFormError(null);
    setFormNote(
      done
        ? `Payment recorded. ${payeeName(selected.app, selected.channel, b2bPartners)} can now claim ${money(selected.payout, mark)} on their commission page. Your margin on this application: ${money(received - selected.payout, mark)}.`
        : mode === "invoice"
          ? "University amount saved. Record the payment when it reaches the Dakshinvedha account."
          : "Part payment saved. The payee can claim after the full university amount is received."
    );
    if (done) {
      downloadCommissionPdf(adminIncomeDoc(selected.app, selected.channel, b2bPartners, mark, {
        expected,
        received,
        payout: selected.payout,
        margin: received - selected.payout,
        date,
        reference,
        rate,
      }));
    }
    setAmount("");
    setReference("");
  };

  const savePayout = () => {
    if (!selected) return;
    if (!reference.trim()) {
      setFormError("Enter the bank transfer reference.");
      return;
    }
    settleCommission(selected.app.camsId, "Paid", { reference: reference.trim(), paidDate: date });
    setFormError(null);
    setFormNote(`Paid ${money(selected.payout, mark)} to ${payeeName(selected.app, selected.channel, b2bPartners)}. Reference ${reference.trim()}.`);
    downloadCommissionPdf(adminPayoutDoc(selected.app, selected.channel, b2bPartners, mark, {
      payout: selected.payout,
      margin: selected.margin,
      received: selected.income.received,
      date,
      reference: reference.trim(),
    }));
    setReference("");
  };

  const incomeTiles = [
    { label: "Expected from universities", value: money(placed.reduce((sum, row) => sum + row.income.expected, 0), mark), color: "#1e293b" },
    { label: "Received (university paid)", value: money(placed.reduce((sum, row) => sum + row.income.received, 0), mark), color: "#15803d" },
    { label: "Outstanding (invoiced)", value: money(placed.reduce((sum, row) => sum + row.income.outstanding, 0), mark), color: "#c2410c" },
    { label: "Universities", value: String(new Set(placed.map((row) => row.app.university.name)).size), color: "#1e293b" },
  ];
  const owed = placed.filter((row) => row.stage === "ready" || row.stage === "requested");
  const paidOut = placed.filter((row) => row.stage === "claimed");
  const payeeTiles = [
    { label: "Expected from universities", value: money(placed.reduce((sum, row) => sum + row.income.expected, 0), mark), color: "#1e293b" },
    { label: "Received from universities", value: money(placed.reduce((sum, row) => sum + row.income.received, 0), mark), color: "#1e293b" },
    { label: "Owed to payees", value: money(owed.reduce((sum, row) => sum + row.payout, 0), mark), color: "#c2410c" },
    { label: "Paid out to payees", value: money(paidOut.reduce((sum, row) => sum + row.payout, 0), mark), color: "#1e293b" },
    { label: "Your margin", value: money(placed.reduce((sum, row) => sum + row.margin, 0), mark), color: "#15803d" },
  ];

  const visiblePayees = placed.filter((row) => {
    if (channel !== "all" && row.channel !== channel) return false;
    if (stageFilter === "invoiced") return row.stage === "waiting-university";
    if (stageFilter === "university-paid") return row.stage === "ready";
    if (stageFilter === "requested") return row.stage === "requested";
    if (stageFilter === "paid") return row.stage === "claimed";
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: 0 }}>
          {screen === "income" ? "University income" : "Commissions"}
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 6, maxWidth: 820, lineHeight: 1.5 }}>
          {screen === "income"
            ? "Commission the university pays Dakshinvedha. Record it here. The B2B partner or agent can claim their own share only after this payment is received. They never see this amount."
            : "Money in from universities, then money out to B2B partners and agents. The payee amount is the commission already saved on the course. Your margin is the university payment minus that amount."}
        </p>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {([
          ["income", "University income"],
          ["payees", "Payee commissions"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setScreen(key); setFormError(null); setFormNote(null); }}
            style={{
              border: "1px solid #fed7aa",
              background: screen === key ? "#f97316" : "#ffffff",
              color: screen === key ? "#ffffff" : "#c2410c",
              borderRadius: 999,
              padding: "7px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {(screen === "income" ? incomeTiles : payeeTiles).map((tile) => (
          <div key={tile.label} style={card}>
            <p style={{ fontSize: 22, fontWeight: 800, color: tile.color, margin: 0 }}>{tile.value}</p>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{tile.label}</p>
          </div>
        ))}
      </div>

      {screen === "income" ? (
        <IncomeTable
          rows={placed}
          partners={b2bPartners}
          canSettle={canSettle}
          selectedId={selectedId}
          onInvoice={(id) => openIncome(id, "invoice")}
          onPayment={(id) => openIncome(id, "payment")}
          onPdf={(row) => downloadCommissionPdf(adminIncomeDoc(row.app, row.channel, b2bPartners, mark, {
            expected: row.income.expected,
            received: row.income.received,
            payout: row.payout,
            margin: row.margin,
            date: row.income.receivedOn || row.income.invoicedOn,
            reference: row.income.reference,
            rate: row.app.commission.universityRate || "",
          }))}
        />
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {([
              ["all", "All"],
              ["b2b", "B2B"],
              ["agent", "Agent"],
            ] as const).map(([key, label]) => (
              <FilterButton key={key} active={channel === key} tone="orange" onClick={() => setChannel(key)}>{label}</FilterButton>
            ))}
            {([
              ["all", "Every stage"],
              ["invoiced", "University invoiced"],
              ["university-paid", "University paid"],
              ["requested", "Claim requested"],
              ["paid", "Paid to payee"],
            ] as const).map(([key, label]) => (
              <FilterButton key={key} active={stageFilter === key} tone="ink" onClick={() => setStageFilter(key)}>{label}</FilterButton>
            ))}
          </div>
          <PayeeTable
            rows={visiblePayees}
            partners={b2bPartners}
            mark={mark}
            canSettle={canSettle}
            onPay={openPayout}
            onPdf={(row) => downloadCommissionPdf(adminPayoutDoc(row.app, row.channel, b2bPartners, mark, {
              payout: row.payout,
              margin: row.margin,
              received: row.income.received,
              date: row.app.commission.paidDate || row.income.receivedOn,
              reference: row.app.commission.referenceNumber || row.income.reference,
            }))}
          />
        </>
      )}

      {selected && screen === "income" && selected.income.status !== "Paid" && canSettle && (
        <section style={{ ...card, borderColor: "#fdba74" }}>
          <h2 style={{ margin: 0, fontSize: 16, color: "#1e293b" }}>
            {selected.income.expected > 0 ? `Record university payment: ${selected.app.university.name}` : `Set university amount: ${selected.app.university.name}`}
          </h2>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            {selected.app.student.name} · {selected.app.camsId}. This amount stays on the admin screen.
            The payee share already on the course is {money(selected.payout, mark)} ({selected.snapshot.rateLabel}).
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 14 }}>
            <Field label={selected.income.expected > 0 ? "Amount received now" : "Amount expected from the university"}>
              <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="3000" style={inputStyle} />
            </Field>
            {selected.income.expected <= 0 && (
              <Field label="University rate (optional, admin only)">
                <input value={rate} onChange={(event) => setRate(event.target.value)} placeholder="10%" style={inputStyle} />
              </Field>
            )}
            <Field label={selected.income.expected > 0 ? "Date received" : "Invoice date"}>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} style={inputStyle} />
            </Field>
            {selected.income.expected > 0 && (
              <Field label="Bank reference">
                <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Bank transfer reference" style={inputStyle} />
              </Field>
            )}
          </div>
          {formError && <p style={{ color: "#b91c1c", fontSize: 12, fontWeight: 700 }}>{formError}</p>}
          {formNote && <p style={{ color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 12px", fontSize: 12 }}>{formNote}</p>}
          <button
            type="button"
            onClick={() => saveIncome(selected.income.expected > 0 ? "payment" : "invoice")}
            style={primaryButton}
          >
            {selected.income.expected > 0 ? "Save payment" : "Save university amount"}
          </button>
        </section>
      )}

      {selected && screen === "payees" && selected.stage === "requested" && canSettle && (
        <section style={{ ...card, borderColor: "#fdba74" }}>
          <h2 style={{ margin: 0, fontSize: 16, color: "#1e293b" }}>Pay to bank: {payeeName(selected.app, selected.channel, b2bPartners)}</h2>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            Transfer the payee amount, then record the payment. The university amount is not included in the statement they download.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 14 }}>
            <BankCard app={selected.app} channel={selected.channel} partners={b2bPartners} />
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
              <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>AMOUNT TO TRANSFER</p>
              <p style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 800, color: "#1e293b" }}>{money(selected.payout, mark)}</p>
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "#64748b" }}>
                Received from university: {selected.income.receivedLabel}. Payee rate: {selected.snapshot.rateLabel} of tuition.
                Your margin: {money(selected.margin, mark)}.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Payment reference">
                <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Bank transfer reference" style={inputStyle} />
              </Field>
              <Field label="Date paid">
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} style={inputStyle} />
              </Field>
              <button type="button" onClick={savePayout} style={primaryButton}>Mark claimed done</button>
            </div>
          </div>
          {formError && <p style={{ color: "#b91c1c", fontSize: 12, fontWeight: 700 }}>{formError}</p>}
          {formNote && <p style={{ color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 12px", fontSize: 12 }}>{formNote}</p>}
        </section>
      )}
    </div>
  );
};

function IncomeTable({
  rows,
  partners,
  canSettle,
  selectedId,
  onInvoice,
  onPayment,
  onPdf,
}: {
  rows: RowModel[];
  partners: B2BPartnerProfile[];
  canSettle: boolean;
  selectedId: string | null;
  onInvoice: (id: string) => void;
  onPayment: (id: string) => void;
  onPdf: (row: RowModel) => void;
}) {
  return (
    <div style={{ ...card, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
        <thead>
          <tr>
            {["University", "Applications", "Expected", "Received", "Outstanding", "Status", "Action"].map((heading) => (
              <th key={heading} style={thStyle}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: 16, fontSize: 12, color: "#94a3b8" }}>
                Placed B2B and agent applications appear here. Mark the application Completed first.
              </td>
            </tr>
          )}
          {rows.map((row) => {
            const paid = row.income.paid;
            return (
              <tr key={row.app.camsId} style={{ borderTop: "1px solid #f1f5f9", background: paid ? "#f0fdf4" : selectedId === row.app.camsId ? "#fff7ed" : "#ffffff" }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 700 }}>{row.app.university.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{row.app.course.courseName}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#c2410c" }}>{row.app.camsId}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{row.app.student.name}</div>
                </td>
                <td style={tdStyle}>{row.income.expectedLabel}{row.income.rateLabel ? ` · ${row.income.rateLabel}` : ""}</td>
                <td style={{ ...tdStyle, color: paid ? "#15803d" : "#1e293b", fontWeight: 700 }}>{row.income.receivedLabel}</td>
                <td style={{ ...tdStyle, color: row.income.outstanding > 0 ? "#c2410c" : "#1e293b", fontWeight: 700 }}>{row.income.outstandingLabel}</td>
                <td style={tdStyle}>
                  <StatusPill tone={paid ? "green" : row.income.status === "Invoiced" ? "amber" : "slate"}>
                    {paid ? "University paid" : row.income.status === "Invoiced" ? `Invoiced ${row.income.invoicedOn}` : "Not invoiced"}
                  </StatusPill>
                </td>
                <td style={tdStyle}>
                  {canSettle && !paid && row.income.expected <= 0 && (
                    <button type="button" onClick={() => onInvoice(row.app.camsId)} style={darkButton}>Set university amount</button>
                  )}
                  {canSettle && !paid && row.income.expected > 0 && (
                    <button type="button" onClick={() => onPayment(row.app.camsId)} style={darkButton}>Record university payment</button>
                  )}
                  {paid && (
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      <div>Ref: {row.income.reference || "—"}</div>
                      <button type="button" onClick={() => onPdf(row)} style={linkButton}>Download admin record</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PayeeTable({
  rows,
  partners,
  mark,
  canSettle,
  onPay,
  onPdf,
}: {
  rows: RowModel[];
  partners: B2BPartnerProfile[];
  mark: string;
  canSettle: boolean;
  onPay: (id: string) => void;
  onPdf: (row: RowModel) => void;
}) {
  return (
    <div style={{ ...card, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1200 }}>
        <thead>
          <tr>
            {["Tracking ID", "Student", "Payee", "Tuition fee", "Uni commission", "Received from uni", "Payee rate", "Payee payout", "Your margin", "Stage", "Action"].map((heading) => (
              <th key={heading} style={thStyle}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={11} style={{ padding: 16, fontSize: 12, color: "#94a3b8" }}>No commission rows for this filter.</td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.app.camsId} style={{ borderTop: "1px solid #f1f5f9", background: row.stage === "requested" ? "#fff7ed" : "#ffffff" }}>
              <td style={{ ...tdStyle, fontFamily: "monospace", fontWeight: 700, color: "#c2410c" }}>{row.app.camsId}</td>
              <td style={tdStyle}>
                <div>{row.app.student.name}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{row.app.university.name}</div>
              </td>
              <td style={tdStyle}>
                <div style={{ fontWeight: 700 }}>{payeeName(row.app, row.channel, partners)}</div>
                <div style={{ fontSize: 10, textTransform: "uppercase", color: "#94a3b8" }}>{row.channel}</div>
              </td>
              <td style={tdStyle}>{row.snapshot.tuitionLabel}</td>
              <td style={{ ...tdStyle, color: "#c2410c", fontWeight: 700 }}>
                {row.income.rateLabel || "Amount"}
                <div style={{ color: "#1e293b" }}>{row.income.expectedLabel}</div>
              </td>
              <td style={tdStyle}>{row.income.paid ? `${row.income.receivedLabel}` : "Not received yet"}{row.income.receivedOn ? <div style={{ fontSize: 10, color: "#94a3b8" }}>{row.income.receivedOn}</div> : null}</td>
              <td style={{ ...tdStyle, color: "#c2410c", fontWeight: 700 }}>{row.snapshot.rateLabel}</td>
              <td style={{ ...tdStyle, fontWeight: 800 }}>{money(row.payout, mark)}</td>
              <td style={{ ...tdStyle, color: row.income.paid ? "#15803d" : "#94a3b8", fontWeight: 700 }}>
                {row.income.paid ? money(row.margin, mark) : row.income.expected > 0 ? `${money(row.income.expected - row.payout, mark)} pending` : "Pending"}
              </td>
              <td style={tdStyle}>
                <StatusPill tone={row.stage === "claimed" ? "green" : row.stage === "requested" ? "amber" : row.stage === "ready" ? "green" : "slate"}>
                  {stageLabel(row.stage, row.income.invoicedOn)}
                </StatusPill>
              </td>
              <td style={tdStyle}>
                {canSettle && row.stage === "requested" && (
                  <button type="button" onClick={() => onPay(row.app.camsId)} style={darkButton}>Pay to bank</button>
                )}
                {row.stage === "waiting-university" && <span style={{ fontSize: 11, color: "#94a3b8" }}>Waiting for university</span>}
                {row.stage === "ready" && <span style={{ fontSize: 11, color: "#94a3b8" }}>Waiting for their claim</span>}
                {row.stage === "in-process" && <span style={{ fontSize: 11, color: "#94a3b8" }}>Waiting for placement</span>}
                {row.stage === "claimed" && (
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    <div>Paid {row.app.commission.paidDate}</div>
                    <button type="button" onClick={() => onPdf(row)} style={linkButton}>Download admin statement</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type RowModel = {
  app: ApplicationRecord;
  snapshot: ReturnType<typeof figures>;
  income: ReturnType<typeof universityIncome>;
  payout: number;
  margin: number;
  channel: "b2b" | "agent";
  stage: ReturnType<typeof claimStage>;
};

function stageLabel(stage: RowModel["stage"], invoicedOn: string) {
  if (stage === "claimed") return "Paid to payee";
  if (stage === "requested") return "Claim requested";
  if (stage === "ready") return "University paid";
  if (stage === "waiting-university") return invoicedOn ? `University invoiced` : "Not invoiced";
  return "In process";
}

function BankCard({ app, channel, partners }: { app: ApplicationRecord; channel: "b2b" | "agent"; partners: B2BPartnerProfile[] }) {
  const bank = channel === "b2b" ? partnerBank(app, partners) : undefined;
  return (
    <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14, fontSize: 12, color: "#334155" }}>
      <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>BANK ACCOUNT ON FILE</p>
      {bank ? (
        <>
          <p style={{ margin: "8px 0 0" }}>Account holder: {bank.accountHolderName || "Not filled"}</p>
          <p style={{ margin: "4px 0 0" }}>Bank: {bank.bankName || "Not filled"}</p>
          <p style={{ margin: "4px 0 0" }}>Sort / IFSC: {bank.ifsc || "Not filled"}</p>
          <p style={{ margin: "4px 0 0" }}>Account number: {maskAccount(bank.accountNumber)}</p>
        </>
      ) : (
        <p style={{ margin: "8px 0 0" }}>No bank account is stored for this {channel === "agent" ? "agent" : "partner"}. Pay them from your own record, then enter the transfer reference.</p>
      )}
      <p style={{ margin: "8px 0 0", color: "#94a3b8" }}>Payee type: {channel === "b2b" ? "B2B" : "Agent"}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, fontWeight: 700, color: "#64748b" }}>
      {label}
      {children}
    </label>
  );
}

function FilterButton({ active, tone, onClick, children }: { active: boolean; tone: "orange" | "ink"; onClick: () => void; children: React.ReactNode }) {
  const on = tone === "orange" ? { background: "#f97316", color: "#ffffff", border: "1px solid #f97316" } : { background: "#1e293b", color: "#ffffff", border: "1px solid #1e293b" };
  const off = tone === "orange" ? { background: "#ffffff", color: "#c2410c", border: "1px solid #fed7aa" } : { background: "#ffffff", color: "#334155", border: "1px solid #e2e8f0" };
  return (
    <button type="button" onClick={onClick} style={{ ...(active ? on : off), borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
      {children}
    </button>
  );
}

function StatusPill({ tone, children }: { tone: "green" | "amber" | "slate"; children: React.ReactNode }) {
  const palette = {
    green: { background: "#dcfce7", color: "#166534" },
    amber: { background: "#ffedd5", color: "#9a3412" },
    slate: { background: "#f1f5f9", color: "#475569" },
  }[tone];
  return <span style={{ ...palette, borderRadius: 999, padding: "3px 8px", fontSize: 11, fontWeight: 700 }}>{children}</span>;
}

const thStyle: React.CSSProperties = { padding: "8px 10px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textAlign: "left", textTransform: "uppercase" };
const tdStyle: React.CSSProperties = { padding: "10px", fontSize: 12, color: "#1e293b", verticalAlign: "top" };
const inputStyle: React.CSSProperties = { border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 10px", fontSize: 13, color: "#1e293b" };
const primaryButton: React.CSSProperties = { marginTop: 12, border: "none", background: "#ea580c", color: "#ffffff", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer" };
const darkButton: React.CSSProperties = { border: "none", background: "#1e293b", color: "#ffffff", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" };
const linkButton: React.CSSProperties = { border: "none", background: "transparent", color: "#c2410c", padding: 0, fontSize: 11, fontWeight: 700, cursor: "pointer" };

function adminIncomeDoc(
  app: ApplicationRecord,
  channel: "b2b" | "agent",
  partners: B2BPartnerProfile[],
  mark: string,
  figuresIn: { expected: number; received: number; payout: number; margin: number; date: string; reference: string; rate: string }
): CommissionPdfDoc {
  return {
    filename: `${app.camsId}-university-income.pdf`,
    title: "University income record",
    subtitle: "Admin copy. This page includes the amount the university paid Dakshinvedha. Do not send this copy to the B2B partner or agent.",
    rows: [
      { label: "Tracking ID", value: app.camsId },
      { label: "Student", value: app.student.name },
      { label: "University", value: app.university.name },
      { label: "Course", value: app.course.courseName },
      { label: "Tuition fee", value: app.course.tuitionFee || "Not set" },
      { label: "University rate", value: figuresIn.rate || "Not set" },
      { label: "Expected from university", value: money(figuresIn.expected, mark) },
      { label: "Received from university", value: money(figuresIn.received, mark) },
      { label: "Date", value: figuresIn.date || "—" },
      { label: "Bank reference", value: figuresIn.reference || "—" },
      { label: "Payee", value: `${payeeName(app, channel, partners)} (${channel.toUpperCase()})` },
      { label: "Payee rate on the course", value: app.course.commissionRate || "Not set" },
      { label: "Payee payout", value: money(figuresIn.payout, mark) },
      { label: "Dakshinvedha margin", value: money(figuresIn.margin, mark) },
    ],
    note: "The payee payout is the commission already stored on the application. The university amount on this record is visible to portal admin only.",
  };
}

function adminPayoutDoc(
  app: ApplicationRecord,
  channel: "b2b" | "agent",
  partners: B2BPartnerProfile[],
  mark: string,
  figuresIn: { payout: number; margin: number; received: number; date: string; reference: string }
): CommissionPdfDoc {
  return {
    filename: `${app.camsId}-payout-admin.pdf`,
    title: "Commission payout record",
    subtitle: "Admin copy of the transfer to the B2B partner or agent.",
    rows: [
      { label: "Tracking ID", value: app.camsId },
      { label: "Student", value: app.student.name },
      { label: "University", value: app.university.name },
      { label: "Payee", value: `${payeeName(app, channel, partners)} (${channel.toUpperCase()})` },
      { label: "Received from university", value: money(figuresIn.received, mark) },
      { label: "Amount paid to payee", value: money(figuresIn.payout, mark) },
      { label: "Dakshinvedha margin", value: money(figuresIn.margin, mark) },
      { label: "Date paid", value: figuresIn.date || "—" },
      { label: "Payment reference", value: figuresIn.reference || "—" },
      { label: "Claim status", value: `Paid to payee · ${figuresIn.date || "today"}` },
    ],
    note: "Keep this admin copy. The statement downloaded by the payee lists their payout only.",
  };
}
