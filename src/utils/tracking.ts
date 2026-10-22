import { ApplicationRecord, B2BPartnerProfile, TimelineEntry } from "@/types";

export type TrackingKind =
  | "APP"
  | "STU"
  | "B2B"
  | "AGN"
  | "TEM"
  | "ADM"
  | "DOC"
  | "PAY"
  | "NTC"
  | "ENQ";

/** Canonical 11-stage application flow. Every application tracker uses this list. */
export const APPLICATION_STAGES = [
  "Application Submitted",
  "Initial Review",
  "Documents Verified",
  "Submitted to University",
  "University Review",
  "Offer Received",
  "Offer Accepted",
  "Deposit / Payment",
  "Admission / CAS Processing",
  "Visa Stage",
  "Completed",
] as const;

export const DEMO_AGENT_TRACKING_ID = "DV-AGN-2026-10001";
export const DEMO_TEAM_TRACKING_ID = "DV-TEM-2026-10001";
export const DEMO_PARTNER_TRACKING_ID = "DV-B2B-2026-00001";

const KIND_BY_PREFIX: Record<string, TrackingKind> = {
  ID: "APP",
  APP: "APP",
  STU: "STU",
  PTR: "B2B",
  B2B: "B2B",
  TXN: "PAY",
  INV: "PAY",
  PAY: "PAY",
  AGT: "AGN",
  AGN: "AGN",
  TEM: "TEM",
  ADM: "ADM",
  DOC: "DOC",
  NTC: "NTC",
  ENQ: "ENQ",
};

const STAGE_ALIASES: Record<string, (typeof APPLICATION_STAGES)[number]> = {
  "application created": "Application Submitted",
  "application submitted": "Application Submitted",
  "documents submitted": "Documents Verified",
  "documents verified": "Documents Verified",
  "application reviewed": "Initial Review",
  "admissions verification": "Initial Review",
  "initial review": "Initial Review",
  "submitted to university": "Submitted to University",
  "university review": "University Review",
  "offer received": "Offer Received",
  "offer accepted": "Offer Accepted",
  payment: "Deposit / Payment",
  "deposit / payment": "Deposit / Payment",
  "cas processing": "Admission / CAS Processing",
  "admission / cas processing": "Admission / CAS Processing",
  visa: "Visa Stage",
  "visa stage": "Visa Stage",
  completed: "Completed",
};

/**
 * Tracking IDs use one format everywhere:
 * DV-{TYPE}-{YEAR}-{5 digits}
 * APP application, STU student, B2B organization, AGN agent,
 * TEM team member, ADM admin staff, DOC document, PAY payment,
 * NTC notice, ENQ enquiry.
 */
export function formatTrackingId(kind: TrackingKind, serial: number, year = 2026): string {
  const safe = Math.abs(Math.trunc(serial)) % 100000;
  return `DV-${kind}-${year}-${String(safe).padStart(5, "0")}`;
}

export function createTrackingId(kind: TrackingKind, year = new Date().getFullYear()): string {
  const serial = Math.floor(10000 + Math.random() * 90000);
  return formatTrackingId(kind, serial, year);
}

export function isTrackingId(value: string): boolean {
  return /^DV-[A-Z]{3}-\d{4}-\d{5}$/.test(value);
}

export function normalizeTrackingId(value: string, fallback: TrackingKind = "APP"): string {
  const raw = (value || "").trim().replace(/^DV-DV-/, "DV-");
  if (!raw || isTrackingId(raw)) return raw;
  const withYear = raw.match(/^([A-Za-z]+)-(\d{4})-(\d+)$/);
  if (withYear) {
    const kind = KIND_BY_PREFIX[withYear[1].toUpperCase()] || fallback;
    return formatTrackingId(kind, Number(withYear[3]), Number(withYear[2]));
  }
  const plain = raw.match(/^([A-Za-z]+)-(\d+)$/);
  if (plain) {
    const kind = KIND_BY_PREFIX[plain[1].toUpperCase()] || fallback;
    return formatTrackingId(kind, Number(plain[2]), 2026);
  }
  return raw;
}

function canonicalStage(status: string) {
  return STAGE_ALIASES[status.trim().toLowerCase()];
}

function progressFor(primary: string) {
  switch (primary) {
    case "Draft":
      return { index: 0, allDone: false, closed: false };
    case "Application Submitted":
      return { index: 1, allDone: false, closed: false };
    case "Under Review":
      return { index: 2, allDone: false, closed: false };
    case "Submitted to University":
      return { index: 4, allDone: false, closed: false };
    case "Offer Issued":
      return { index: 5, allDone: false, closed: false };
    case "Payment Pending":
      return { index: 7, allDone: false, closed: false };
    case "Payment Done":
      return { index: 8, allDone: false, closed: false };
    case "CAS Processing":
      return { index: 8, allDone: false, closed: false };
    case "CAS Issued":
      return { index: 9, allDone: false, closed: false };
    case "Visa Processing":
      return { index: 9, allDone: false, closed: false };
    case "Completed":
      return { index: 10, allDone: true, closed: false };
    case "Closed":
      return { index: 0, allDone: false, closed: true };
    default:
      return { index: 1, allDone: false, closed: false };
  }
}

function defaultDescription(status: string, state: TimelineEntry["state"]) {
  if (state === "not_applicable") return "This stage does not apply to this application.";
  if (state === "current") return `${status} is the active stage.`;
  if (state === "completed") return `${status} is complete.`;
  return "Waiting for the previous stage.";
}

export function buildTimeline(
  primaryStatus: string,
  date: string,
  previous: TimelineEntry[] = []
): TimelineEntry[] {
  const progress = progressFor(primaryStatus);
  return APPLICATION_STAGES.map((status, idx) => {
    const existing = previous.find((entry) => canonicalStage(entry.status) === status);
    let state: TimelineEntry["state"];
    if (progress.closed) state = idx === 0 ? "completed" : "not_applicable";
    else if (progress.allDone || idx < progress.index) state = "completed";
    else if (idx === progress.index) state = "current";
    else state = "pending";
    const keptDate = existing?.date && existing.date !== "Pending" ? existing.date : date;
    return {
      status,
      date: state === "pending" ? "Pending" : state === "not_applicable" ? "Not applicable" : keptDate,
      description: existing?.description || defaultDescription(status, state),
      state,
    };
  });
}

export function resolveTimeline(
  app: Pick<ApplicationRecord, "primaryStatus" | "dateModified" | "timeline">
): TimelineEntry[] {
  const canonical =
    app.timeline.length === APPLICATION_STAGES.length &&
    app.timeline.every((entry, idx) => entry.status === APPLICATION_STAGES[idx]);
  if (canonical) return app.timeline;
  return buildTimeline(app.primaryStatus, app.dateModified || "Pending", app.timeline);
}

export function trackerProgress(
  app: Pick<ApplicationRecord, "primaryStatus" | "dateModified" | "timeline">
) {
  const stages = resolveTimeline(app);
  const completed = stages.filter((stage) => stage.state === "completed").length;
  return { stages, completed, total: APPLICATION_STAGES.length };
}

export function normalizeStoredApplication(app: ApplicationRecord, index: number): ApplicationRecord {
  const rawId = app.camsId || "";
  const legacy = /CAMS-|^APP-\d{4}-/.test(rawId);
  const camsId = normalizeTrackingId(rawId, "APP");
  let agentTrackingId = app.agentTrackingId;
  let counselorName = app.counselorName;
  if (!agentTrackingId && legacy && index % 4 === 0) {
    agentTrackingId = DEMO_AGENT_TRACKING_ID;
    counselorName = "Meera Iyer";
  }
  const next: ApplicationRecord = {
    ...app,
    camsId,
    counselorName,
    agentTrackingId,
    partnerTrackingId: app.partnerTrackingId || (legacy ? DEMO_PARTNER_TRACKING_ID : app.partnerTrackingId),
    student: {
      ...app.student,
      studentId: normalizeTrackingId(app.student?.studentId || "", "STU") || app.student.studentId,
    },
  };
  return { ...next, timeline: resolveTimeline(next) };
}

export function migratePartnerProfile(partner: B2BPartnerProfile): B2BPartnerProfile {
  return {
    ...partner,
    partnerId: normalizeTrackingId(partner.partnerId, "B2B"),
    teamMembers: (partner.teamMembers || []).map((member) => {
      const email =
        member.email.toLowerCase() === "agent@dakshinvedha.com" ? "team@dakshinvedha.com" : member.email;
      const trackingId =
        member.trackingId ||
        (email.toLowerCase() === "team@dakshinvedha.com" ? DEMO_TEAM_TRACKING_ID : createTrackingId("TEM"));
      return { ...member, email, trackingId };
    }),
  };
}
