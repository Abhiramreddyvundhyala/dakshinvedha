import { B2BAccessRequest, B2BPartnerProfile, PortalAccount, PortalRole } from "@/types";
import { createTrackingId, DEMO_AGENT_TRACKING_ID, DEMO_TEAM_TRACKING_ID } from "@/utils/tracking";

export const DEMO_PASSWORD = "password123";

const ACCOUNTS_KEY = "dakshin_accounts_v1";
const REQUESTS_KEY = "dakshin_b2b_requests_v1";
const PARTNERS_KEY = "dakshin_b2b_partners_v1";

export const SESSION_KEYS = [
  "dakshin_authenticated",
  "dakshin_portal_role",
  "dakshin_user_email",
  "dakshin_user_name",
  "dakshin_account_id",
  "dakshin_partner_id",
  "dakshin_member_kind",
  "dakshin_student_auth",
  "dakshin_student_new_registration",
  "dakshin_new_student_name",
  "dakshin_new_student_mobile",
  "dakshin_new_student_email",
  "dakshin_new_student_password",
  "devgrate_authenticated",
  "devgrate_portal_role",
  "devgrate_user_email",
  "devgrate_user_name",
  "devgrate_student_auth",
  "devgrate_student_new_registration",
  "devgrate_new_student_name",
  "devgrate_new_student_mobile",
  "devgrate_new_student_email",
] as const;

export const SEED_ACCOUNTS: PortalAccount[] = [
  {
    id: "acc-admin",
    email: "admin@dakshinvedha.com",
    password: DEMO_PASSWORD,
    name: "Central Super Admin",
    role: "admin",
    status: "Active",
  },
  {
    id: "acc-partner-sarah",
    email: "partner@dakshinvedha.com",
    password: DEMO_PASSWORD,
    name: "Sarah Jenkins",
    role: "partner",
    phone: "+91 99887 76655",
    status: "Active",
    partnerId: "b2b-001",
    memberKind: "owner",
  },
  {
    id: "acc-team-anita",
    email: "team@dakshinvedha.com",
    password: DEMO_PASSWORD,
    name: "Anita Rao",
    role: "team",
    phone: "+91 90000 11223",
    status: "Active",
    partnerId: "b2b-001",
    memberKind: "team",
    trackingId: DEMO_TEAM_TRACKING_ID,
  },
  {
    id: "acc-agent-meera",
    email: "agent@dakshinvedha.com",
    password: DEMO_PASSWORD,
    name: "Meera Iyer",
    role: "agent",
    phone: "+91 98480 22011",
    status: "Active",
    trackingId: DEMO_AGENT_TRACKING_ID,
  },
  {
    id: "acc-partner-rajesh",
    email: "rajesh@globaledu.example",
    password: DEMO_PASSWORD,
    name: "Rajesh Kumar",
    role: "partner",
    phone: "+91 98765 11223",
    status: "Active",
    partnerId: "b2b-002",
    memberKind: "owner",
  },
  {
    id: "acc-rohan",
    email: "rohan.sharma@example.com",
    password: DEMO_PASSWORD,
    name: "Rohan Sharma",
    role: "student",
    phone: "+91 98765 43210",
    status: "Active",
  },
  {
    id: "acc-priya",
    email: "priya.patel@example.com",
    password: DEMO_PASSWORD,
    name: "Priya Patel",
    role: "student",
    status: "Active",
  },
  {
    id: "acc-demo-student",
    email: "student@dakshinvedha.com",
    password: DEMO_PASSWORD,
    name: "Demo Student",
    role: "student",
    status: "Active",
  },
];

function canStore() {
  return typeof window !== "undefined";
}

export function loadAccounts(): PortalAccount[] {
  if (!canStore()) return SEED_ACCOUNTS.map((account) => ({ ...account }));
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(SEED_ACCOUNTS));
      return SEED_ACCOUNTS.map((account) => ({ ...account }));
    }
    const parsed = JSON.parse(raw) as PortalAccount[];
    if (!Array.isArray(parsed)) return SEED_ACCOUNTS.map((account) => ({ ...account }));
    const byEmail = new Map<string, PortalAccount>();
    let changed = false;
    parsed.forEach((account) => {
      if (!account?.email) return;
      const normalized = normalizeStoredAccount(account);
      byEmail.set(normalized.email.toLowerCase(), normalized);
      if (accountShapeChanged(account, normalized)) changed = true;
    });
    SEED_ACCOUNTS.forEach((seed) => {
      if (!byEmail.has(seed.email.toLowerCase())) {
        byEmail.set(seed.email.toLowerCase(), seed);
        changed = true;
      }
    });
    const list = Array.from(byEmail.values());
    if (changed) localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
    return list;
  } catch {
    return SEED_ACCOUNTS.map((account) => ({ ...account }));
  }
}

export function saveAccounts(accounts: PortalAccount[]) {
  if (!canStore()) return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function findAccount(email: string): PortalAccount | undefined {
  const clean = email.trim().toLowerCase();
  return loadAccounts().find((account) => account.email.toLowerCase() === clean);
}

export function emailTaken(email: string, exceptId?: string) {
  const found = findAccount(email);
  if (!found) return false;
  if (exceptId && found.id === exceptId) return false;
  return true;
}

export function upsertAccount(account: PortalAccount) {
  const accounts = loadAccounts();
  const email = account.email.trim().toLowerCase();
  const index = accounts.findIndex(
    (item) => item.id === account.id || item.email.toLowerCase() === email
  );
  const next = { ...account, email };
  if (index >= 0) accounts[index] = { ...accounts[index], ...next };
  else accounts.push(next);
  saveAccounts(accounts);
}

export function removeAccountByEmail(email: string) {
  const clean = email.trim().toLowerCase();
  saveAccounts(loadAccounts().filter((account) => account.email.toLowerCase() !== clean));
}

export type AuthResult =
  | { ok: true; account: PortalAccount }
  | { ok: false; reason: string };

export function authenticate(email: string, password: string): AuthResult {
  const account = findAccount(email);
  if (!account || account.password !== password) {
    return { ok: false, reason: "The email or password is incorrect." };
  }
  if (account.status === "Suspended") {
    return { ok: false, reason: "This account is suspended. Contact your administrator." };
  }
  return { ok: true, account };
}

export function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint32Array(10);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * alphabet.length);
  }
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");
}

export function loadRequests(): B2BAccessRequest[] {
  if (!canStore()) return [];
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as B2BAccessRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRequests(requests: B2BAccessRequest[]) {
  if (!canStore()) return;
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

export function addAccessRequest(
  input: Omit<B2BAccessRequest, "id" | "status" | "createdAt" | "partnerId">
): B2BAccessRequest | { error: string } {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid work email address." };
  }
  if (!input.contactName.trim() || !input.organizationName.trim() || !input.phone.trim()) {
    return { error: "Organization, contact name, and phone are required." };
  }
  if (findAccount(email)) {
    return { error: "This email already has a portal login. Sign in, or ask the admin to reset it." };
  }
  if (loadRequests().some((request) => request.email.toLowerCase() === email && request.status === "Pending")) {
    return { error: "A request for this email is already waiting for admin review." };
  }
  const request: B2BAccessRequest = {
    ...input,
    organizationName: input.organizationName.trim(),
    contactName: input.contactName.trim(),
    phone: input.phone.trim(),
    message: input.message.trim(),
    email,
    id: `req-${Date.now()}`,
    status: "Pending",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  saveRequests([request, ...loadRequests()]);
  return request;
}

export function patchRequest(id: string, updates: Partial<B2BAccessRequest>) {
  const next = loadRequests().map((request) => (request.id === id ? { ...request, ...updates } : request));
  saveRequests(next);
  return next;
}

export function approveRequestByEmail(email: string, partnerId: string) {
  const clean = email.trim().toLowerCase();
  const next = loadRequests().map((request) =>
    request.email.toLowerCase() === clean && request.status === "Pending"
      ? { ...request, status: "Approved" as const, partnerId }
      : request
  );
  saveRequests(next);
}

export function loadStoredPartners(): B2BPartnerProfile[] | null {
  if (!canStore()) return null;
  try {
    const raw = localStorage.getItem(PARTNERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as B2BPartnerProfile[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveStoredPartners(partners: B2BPartnerProfile[]) {
  if (!canStore()) return;
  localStorage.setItem(PARTNERS_KEY, JSON.stringify(partners));
}

export function readSessionValue(key: string): string | null {
  if (!canStore()) return null;
  return sessionStorage.getItem(key) || localStorage.getItem(key);
}

function accountShapeChanged(before: PortalAccount, after: PortalAccount) {
  return (
    before.email.toLowerCase() !== after.email.toLowerCase() ||
    before.role !== after.role ||
    before.name !== after.name ||
    (before.memberKind || "") !== (after.memberKind || "") ||
    (before.partnerId || "") !== (after.partnerId || "") ||
    (before.trackingId || "") !== (after.trackingId || "")
  );
}

function normalizeStoredAccount(account: PortalAccount): PortalAccount {
  const email = account.email.toLowerCase();
  if (email === "agent@dakshinvedha.com") {
    const seed = SEED_ACCOUNTS.find((item) => item.email === email);
    const stillTeam = account.role !== "agent" || account.memberKind === "team" || !!account.partnerId;
    if (seed && stillTeam) {
      return { ...seed, password: account.password || seed.password, status: account.status };
    }
    return {
      ...account,
      email,
      role: "agent",
      memberKind: undefined,
      partnerId: undefined,
      trackingId: account.trackingId || seed?.trackingId || DEMO_AGENT_TRACKING_ID,
    };
  }
  if (account.memberKind === "team" && account.role !== "team") {
    return { ...account, email, role: "team", trackingId: account.trackingId || createTrackingId("TEM") };
  }
  if (account.role === "team" && !account.trackingId) {
    return { ...account, email, trackingId: createTrackingId("TEM") };
  }
  if (account.role === "agent" && !account.trackingId) {
    return { ...account, email, memberKind: undefined, trackingId: createTrackingId("AGN") };
  }
  return { ...account, email };
}

export function writeSession(account: PortalAccount, remember: boolean) {
  if (!canStore()) return;
  const memberKind =
    account.memberKind || (account.role === "partner" ? "owner" : account.role === "team" ? "team" : "");
  const values: Record<string, string> = {
    dakshin_authenticated: "true",
    dakshin_portal_role: account.role,
    dakshin_user_email: account.email.toLowerCase(),
    dakshin_user_name: account.name,
    dakshin_account_id: account.id,
    dakshin_partner_id: account.partnerId || "",
    dakshin_member_kind: memberKind,
    dakshin_tracking_id: account.trackingId || "",
    devgrate_authenticated: "true",
    devgrate_portal_role: account.role,
    devgrate_user_email: account.email.toLowerCase(),
    devgrate_user_name: account.name,
  };
  if (account.role === "student") {
    values.dakshin_student_auth = "true";
    values.devgrate_student_auth = "true";
  }

  Object.entries(values).forEach(([key, value]) => {
    sessionStorage.setItem(key, value);
    if (remember) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  });
}

export function isPortalRole(value: string | null): value is PortalRole {
  return value === "student" || value === "partner" || value === "team" || value === "agent" || value === "admin";
}
