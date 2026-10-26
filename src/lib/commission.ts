import { ApplicationRecord, CourseInfo, PrimaryStatusType } from "@/types";
import { currencyMark, feeNumber, money } from "@/lib/catalogOffers";

/** Commission is recorded only after the student is placed. Completed is that status. */

type RateCourse = Pick<CourseInfo, "tuitionFee" | "tuitionFeeNum" | "commissionRate">;

export function parseMoney(value: string | undefined): number {
  if (!value) return 0;
  const match = value.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  const amount = match ? Number(match[1]) : 0;
  return Number.isFinite(amount) ? amount : 0;
}

/** "15%" and "15" are 15 percent. A bare decimal at or below 1 is already a fraction. */
export function rateFraction(rate: string | undefined): number {
  const raw = (rate || "").trim();
  if (!raw) return 0;
  const amount = Number(raw.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (raw.includes("%") || amount > 1) return amount / 100;
  return amount;
}

export function expectedAmount(course: RateCourse): number {
  const fee = feeNumber(course);
  const rate = rateFraction(course.commissionRate);
  if (fee <= 0 || rate <= 0) return 0;
  return Math.round(fee * rate);
}

export function commissionReady(status: PrimaryStatusType): boolean {
  return status === "Completed";
}

export type CommissionFigures = {
  expected: number;
  eligible: number;
  expectedLabel: string;
  eligibleLabel: string;
  paid: boolean;
  awaiting: boolean;
  status: ApplicationRecord["commission"]["status"];
  ready: boolean;
  mark: string;
};

export function figures(app: ApplicationRecord): CommissionFigures {
  const computed = expectedAmount(app.course);
  const storedExpected = parseMoney(app.commission?.expectedCommission);
  const expected = storedExpected > 0 ? storedExpected : computed;
  const mark = currencyMark([{ tuitionFee: app.commission?.expectedCommission || app.course?.tuitionFee || "£" }]);
  const status = app.commission?.status || "Pending";
  const ready = commissionReady(app.primaryStatus) || status === "Claimed" || status === "Approved" || status === "Paid";
  const storedEligible = parseMoney(app.commission?.eligibleAmount);
  const eligible = ready ? (storedEligible > 0 ? storedEligible : expected) : 0;
  return {
    expected,
    eligible,
    expectedLabel: money(expected, mark),
    eligibleLabel: money(eligible, mark),
    paid: status === "Paid",
    awaiting: status === "Claimed" || status === "Approved",
    status,
    ready,
    mark,
  };
}

/** Fills expected commission from the course rate. Eligible amount stays 0 until the file is commission-ready. */
export function withCommission(app: ApplicationRecord): ApplicationRecord {
  const snapshot = figures(app);
  const status = app.commission?.status || "Pending";
  const locked = status === "Claimed" || status === "Approved" || status === "Paid";
  const amount = locked
    ? parseMoney(app.commission.amount) > 0
      ? app.commission.amount
      : snapshot.eligibleLabel
    : snapshot.ready
      ? snapshot.expectedLabel
      : money(0, snapshot.mark);
  const eligibleAmount = locked
    ? parseMoney(app.commission.eligibleAmount) > 0
      ? app.commission.eligibleAmount
      : snapshot.eligibleLabel
    : snapshot.ready
      ? snapshot.expectedLabel
      : money(0, snapshot.mark);
  return {
    ...app,
    commission: {
      ...app.commission,
      expectedCommission: snapshot.expectedLabel,
      amount,
      eligibleAmount,
      status,
    },
  };
}

export function freshCommission(course: RateCourse): ApplicationRecord["commission"] {
  const mark = currencyMark([course]);
  return {
    amount: money(0, mark),
    eligibleAmount: money(0, mark),
    expectedCommission: money(expectedAmount(course), mark),
    status: "Pending",
  };
}

export type CommissionChannel = "b2b" | "agent" | "direct";

export function commissionChannel(app: {
  partnerRecordId?: string;
  partnerTrackingId?: string;
  agentTrackingId?: string;
  agentProfileId?: string;
}): CommissionChannel {
  if ((app.partnerRecordId || "").trim() || (app.partnerTrackingId || "").trim()) return "b2b";
  if ((app.agentTrackingId || "").trim() || (app.agentProfileId || "").trim()) return "agent";
  return "direct";
}

export function partnerApplications<T extends {
  partnerRecordId?: string;
  partnerTrackingId?: string;
  agentTrackingId?: string;
  agentProfileId?: string;
}>(
  apps: T[],
  partner: { id?: string; partnerId?: string } | null
): T[] {
  if (!partner) return apps;
  return apps.filter((app) => {
    if (commissionChannel(app) === "agent") return false;
    const recordId = app.partnerRecordId || "";
    const trackingId = app.partnerTrackingId || "";
    if (!recordId && !trackingId) return false;
    return Boolean(
      (partner.id && recordId === partner.id) || (partner.partnerId && trackingId === partner.partnerId)
    );
  });
}
