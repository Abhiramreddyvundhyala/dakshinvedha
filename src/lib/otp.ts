import { createHmac, createHash, randomInt, randomUUID, timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const COOLDOWN_MS = 45_000;
const EMAIL_TTL_MS = 10 * 60_000;
const TICKET_TTL_MS = 10 * 60_000;
const MAX_SENDS_PER_HOUR = 8;
const MAX_VERIFY_ATTEMPTS = 5;

export type OtpChallenge = {
  id: string;
  email: string;
  phone: string;
  emailOtpHash: string;
  smsSessionId: string;
  attempts: number;
  verified: boolean;
  consumed: boolean;
  expiresAt: number;
};

const memory = new Map<string, OtpChallenge>();
const sendWindow = new Map<string, { count: number; resetAt: number; lastAt: number }>();

function ticketSecret() {
  return process.env.OTP_TICKET_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function hashSecret() {
  return process.env.OTP_TICKET_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "dakshin-otp";
}

export function resendKey() {
  return (process.env.RESEND_API_KEY || "").trim();
}

export function resendFrom() {
  return (process.env.RESEND_FROM || "Dakshinvedha <onboarding@resend.dev>").trim();
}

function resendCustomFrom() {
  const from = resendFrom();
  if (!resendKey() || !from) return null;
  const address = (from.match(/<([^>]+)>/)?.[1] || from).trim().toLowerCase();
  const domain = address.split("@")[1] || "";
  if (!domain || domain === "resend.dev" || domain === "gmail.com" || domain === "googlemail.com") return null;
  return from;
}

export function emailOtpReady() {
  return Boolean(resendCustomFrom());
}

export function emailOtpSetupError() {
  return "Email OTP needs a verified sending domain. In Resend, verify the domain, set RESEND_API_KEY, and set RESEND_FROM to an address on that domain, such as Dakshinvedha <noreply@mail.yourdomain.com>.";
}

export function smsOtpSetupError() {
  return "SMS OTP needs VERIFYNOW_CUSTOMER_ID, VERIFYNOW_EMAIL, and VERIFYNOW_PASSWORD.";
}

export function indiaTenDigit(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  const ten = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  if (ten.length !== 10) return null;
  return ten;
}

export function displayPhone(ten: string) {
  return `+91 ${ten}`;
}

export function sixDigitCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtp(otp: string, challengeId: string) {
  return createHash("sha256").update(`${otp}:${challengeId}:${hashSecret()}`).digest("hex");
}

export function hashesMatch(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  return forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function rateIdentity(key: string): { column: "email" | "phone"; value: string } | null {
  if (key.startsWith("email:") || key.startsWith("login:")) {
    return { column: "email", value: key.slice(key.indexOf(":") + 1) };
  }
  if (key.startsWith("phone:")) return { column: "phone", value: displayPhone(key.slice("phone:".length)) };
  return null;
}

export async function assertSendAllowed(keys: string[]) {
  const now = Date.now();
  for (const key of keys) {
    const current = sendWindow.get(key);
    if (current && now < current.resetAt && now - current.lastAt < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - (now - current.lastAt)) / 1000);
      return { ok: false as const, error: `Please wait ${wait}s before requesting new codes.`, status: 429 };
    }
    if (current && now < current.resetAt && current.count >= MAX_SENDS_PER_HOUR) {
      return { ok: false as const, error: "Too many OTP requests. Try again in an hour.", status: 429 };
    }
  }

  const admin = getSupabaseAdmin();
  if (admin) {
    const hourAgo = new Date(now - 60 * 60_000).toISOString();
    const cooldownAgo = new Date(now - COOLDOWN_MS).toISOString();
    for (const key of keys) {
      const match = rateIdentity(key);
      if (!match) continue;
      const recent = await admin
        .from("otp_challenges")
        .select("created_at")
        .eq(match.column, match.value)
        .gte("created_at", hourAgo);
      if (recent.error) continue;
      const rows = recent.data || [];
      if (rows.length >= MAX_SENDS_PER_HOUR) {
        return { ok: false as const, error: "Too many OTP requests. Try again in an hour.", status: 429 };
      }
      if (rows.some((row) => Date.parse(row.created_at) >= Date.parse(cooldownAgo))) {
        return { ok: false as const, error: "Please wait 45s before requesting new codes.", status: 429 };
      }
    }
  }

  for (const key of keys) {
    const current = sendWindow.get(key);
    if (!current || now >= current.resetAt) {
      sendWindow.set(key, { count: 1, resetAt: now + 60 * 60_000, lastAt: now });
    } else {
      sendWindow.set(key, { count: current.count + 1, resetAt: current.resetAt, lastAt: now });
    }
  }
  return { ok: true as const };
}

function mapChallenge(data: {
  id: string;
  email: string;
  phone: string;
  email_otp_hash: string;
  sms_session_id: string;
  attempts: number;
  verified: boolean;
  consumed: boolean;
  expires_at: string;
}): OtpChallenge {
  return {
    id: data.id,
    email: data.email,
    phone: data.phone,
    emailOtpHash: data.email_otp_hash,
    smsSessionId: data.sms_session_id,
    attempts: data.attempts,
    verified: data.verified,
    consumed: data.consumed,
    expiresAt: Date.parse(data.expires_at),
  };
}

function otpStoreError(message: string) {
  if (/otp_challenges|schema cache|does not exist/i.test(message)) {
    return "OTP storage is missing. Run the otp_challenges section of supabase/schema.sql in the Supabase SQL editor.";
  }
  return "Could not store the verification code.";
}

export async function createChallenge(input: {
  id?: string;
  email: string;
  phone: string;
  emailOtpHash: string;
  smsSessionId: string;
}) {
  const row: OtpChallenge = {
    id: input.id || randomUUID(),
    email: input.email,
    phone: input.phone,
    emailOtpHash: input.emailOtpHash,
    smsSessionId: input.smsSessionId,
    attempts: 0,
    verified: false,
    consumed: false,
    expiresAt: Date.now() + EMAIL_TTL_MS,
  };
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false as const, error: "Database is not configured. Add the Supabase service role key and redeploy." };
  const { error } = await admin.from("otp_challenges").insert({
    id: row.id,
    email: row.email,
    phone: row.phone,
    email_otp_hash: row.emailOtpHash,
    sms_session_id: row.smsSessionId,
    attempts: 0,
    verified: false,
    consumed: false,
    expires_at: new Date(row.expiresAt).toISOString(),
  });
  if (error) return { ok: false as const, error: otpStoreError(error.message) };
  memory.set(row.id, row);
  return { ok: true as const, challenge: row };
}

export async function readChallenge(id: string): Promise<OtpChallenge | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data, error } = await admin.from("otp_challenges").select("*").eq("id", id).maybeSingle();
    if (!error && data) {
      const row = mapChallenge(data);
      memory.set(row.id, row);
      return row;
    }
    if (!error && !data) return null;
  }
  return memory.get(id) || null;
}

export async function patchChallenge(id: string, patch: Partial<OtpChallenge>) {
  const current = await readChallenge(id);
  if (!current) return null;
  const next = { ...current, ...patch };
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { error } = await admin
    .from("otp_challenges")
    .update({
      attempts: next.attempts,
      verified: next.verified,
      consumed: next.consumed,
      sms_session_id: next.smsSessionId,
      email_otp_hash: next.emailOtpHash,
      expires_at: new Date(next.expiresAt).toISOString(),
    })
    .eq("id", id);
  if (error) return null;
  memory.set(id, next);
  return next;
}

export function signOtpTicket(challenge: OtpChallenge) {
  const secret = ticketSecret();
  const payload = Buffer.from(
    JSON.stringify({
      cid: challenge.id,
      email: challenge.email,
      phone: challenge.phone,
      exp: Date.now() + TICKET_TTL_MS,
    })
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readOtpTicket(ticket: string): { cid: string; email: string; phone: string } | null {
  const secret = ticketSecret();
  if (!secret || !ticket.includes(".")) return null;
  const [payload, sig] = ticket.split(".");
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      cid: string;
      email: string;
      phone: string;
      exp: number;
    };
    if (!data.cid || Date.now() > data.exp) return null;
    return { cid: data.cid, email: data.email, phone: data.phone };
  } catch {
    return null;
  }
}

const VERIFYNOW_BASE = "https://cpaas.messagecentral.com";

type VerifyNowConfig = {
  customerId: string;
  email: string;
  password: string;
  countryCode: string;
};

type VerifyNowBody = {
  token?: string;
  status?: number;
  responseCode?: number | string;
  message?: string;
  data?: {
    verificationId?: string | number;
    verificationStatus?: string;
    errorMessage?: string | null;
    responseCode?: string;
  };
};

function verifyNowConfig(): VerifyNowConfig | null {
  const customerId = (process.env.VERIFYNOW_CUSTOMER_ID || "").trim();
  const email = (process.env.VERIFYNOW_EMAIL || "").trim();
  const password = (process.env.VERIFYNOW_PASSWORD || "").trim();
  const countryCode = (process.env.VERIFYNOW_COUNTRY_CODE || "91").replace(/\D/g, "") || "91";
  if (!customerId || !email || !password) return null;
  return { customerId, email, password, countryCode };
}

export function verifyNowConfigured() {
  return Boolean(verifyNowConfig());
}

let cachedVerifyNowToken: { value: string; expiresAt: number } | null = null;

function verifyNowError(body: VerifyNowBody, fallback: string) {
  return body.data?.errorMessage || body.message || fallback;
}

function verifyNowAuthFailed(status: number, body: VerifyNowBody) {
  const code = String(body.responseCode || body.data?.responseCode || "");
  return status === 401 || code === "800" || /invalid auth/i.test(body.message || "");
}

async function verifyNowToken(force = false): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const config = verifyNowConfig();
  if (!config) {
    return {
      ok: false,
      error: "Add VERIFYNOW_CUSTOMER_ID, VERIFYNOW_EMAIL, and VERIFYNOW_PASSWORD to .env.local, then restart the app.",
    };
  }
  if (!force && cachedVerifyNowToken && Date.now() < cachedVerifyNowToken.expiresAt) {
    return { ok: true, token: cachedVerifyNowToken.value };
  }
  const params = new URLSearchParams({
    customerId: config.customerId,
    key: Buffer.from(config.password, "utf8").toString("base64"),
    scope: "NEW",
    country: config.countryCode,
    email: config.email,
  });
  const response = await fetch(`${VERIFYNOW_BASE}/auth/v1/authentication/token?${params}`, {
    method: "GET",
    headers: { accept: "*/*" },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as VerifyNowBody;
  if (!response.ok || !body.token) {
    cachedVerifyNowToken = null;
    return { ok: false, error: "Could not sign in to VerifyNow. Check the customer id, login email, and password." };
  }
  cachedVerifyNowToken = { value: body.token, expiresAt: Date.now() + 50 * 60_000 };
  return { ok: true, token: body.token };
}

async function verifyNowRequest(path: string, method: "GET" | "POST") {
  const call = async (force: boolean) => {
    const auth = await verifyNowToken(force);
    if (!auth.ok) return auth;
    const response = await fetch(`${VERIFYNOW_BASE}${path}`, {
      method,
      headers: { accept: "*/*", authToken: auth.token },
      cache: "no-store",
    });
    const body = (await response.json().catch(() => ({}))) as VerifyNowBody;
    return { ok: true as const, response, body };
  };
  const first = await call(false);
  if (!first.ok || !verifyNowAuthFailed(first.response.status, first.body)) return first;
  cachedVerifyNowToken = null;
  return call(true);
}

export async function sendSmsOtp(tenDigit: string) {
  const config = verifyNowConfig();
  if (!config) {
    return {
      ok: false as const,
      error: "Add VERIFYNOW_CUSTOMER_ID, VERIFYNOW_EMAIL, and VERIFYNOW_PASSWORD to .env.local, then restart the app.",
    };
  }
  const params = new URLSearchParams({
    countryCode: config.countryCode,
    customerId: config.customerId,
    flowType: "SMS",
    mobileNumber: tenDigit,
    otpLength: "6",
  });
  const result = await verifyNowRequest(`/verification/v3/send?${params}`, "POST");
  if (!result.ok) return result;
  const verificationId = result.body.data?.verificationId;
  const accepted = result.response.ok && Boolean(verificationId) && String(result.body.data?.responseCode || result.body.responseCode || "200") === "200";
  if (!accepted) {
    return { ok: false as const, error: verifyNowError(result.body, "Could not send the SMS verification code.") };
  }
  return { ok: true as const, sessionId: String(verificationId) };
}

export async function verifySmsOtp(sessionId: string, otp: string, tenDigit: string) {
  const config = verifyNowConfig();
  if (!config || !sessionId || otp.length !== 6) return false;
  const params = new URLSearchParams({
    countryCode: config.countryCode,
    mobileNumber: tenDigit,
    verificationId: sessionId,
    customerId: config.customerId,
    code: otp,
  });
  const result = await verifyNowRequest(`/verification/v3/validateOtp?${params}`, "GET");
  if (!result.ok || !result.response.ok) return false;
  const status = (result.body.data?.verificationStatus || "").toUpperCase();
  return status === "VERIFICATION_COMPLETED" || status === "VERIFIED";
}

export async function sendEmailOtp(to: string, name: string, code: string, purpose: "signup" | "login" = "signup") {
  const subject = purpose === "login" ? "Your Dakshinvedha login code" : "Your Dakshinvedha verification code";
  const action = purpose === "login" ? "finish signing in" : "finish creating your student account";
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
        <p style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#ea580c;font-weight:700">Dakshinvedha Abroad Solutions</p>
        <h1 style="font-size:20px;margin:8px 0 16px">Email verification code</h1>
        <p style="font-size:14px;color:#475569">Hi ${escapeHtml(name || "there")}, use this code to ${action}. It expires in 10 minutes.</p>
        <p style="font-size:32px;letter-spacing:.24em;font-weight:800;margin:24px 0">${code}</p>
        <p style="font-size:12px;color:#94a3b8">If you did not request this, you can ignore the email.</p>
      </div>`;
  const from = resendCustomFrom();
  const key = resendKey();
  if (!from || !key) {
    return { ok: false as const, error: emailOtpSetupError() };
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!response.ok) {
    return { ok: false as const, error: body.message || "Could not send the email verification code." };
  }
  return { ok: true as const };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[char] || char;
  });
}

export { MAX_VERIFY_ATTEMPTS, COOLDOWN_MS };
