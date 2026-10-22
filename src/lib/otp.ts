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

export function twoFactorKey() {
  return (process.env.TWOFACTOR_API_KEY || "").trim();
}

export function resendKey() {
  return (process.env.RESEND_API_KEY || "").trim();
}

export function resendFrom() {
  return (process.env.RESEND_FROM || "Dakshinvedha <onboarding@resend.dev>").trim();
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

export function twoFactorPhone(ten: string) {
  return `91${ten}`;
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

export function assertSendAllowed(keys: string[]) {
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

export async function createChallenge(input: {
  id?: string;
  email: string;
  phone: string;
  emailOtpHash: string;
  smsSessionId: string;
}): Promise<OtpChallenge> {
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
  memory.set(row.id, row);
  try {
    const admin = getSupabaseAdmin();
    if (admin) {
      await admin.from("otp_challenges").insert({
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
    }
  } catch {
    // Memory store still holds the challenge if the SQL table is not created yet.
  }
  return row;
}

export async function readChallenge(id: string): Promise<OtpChallenge | null> {
  const local = memory.get(id);
  if (local) return local;
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data } = await admin.from("otp_challenges").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const row: OtpChallenge = {
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
  memory.set(row.id, row);
  return row;
}

export async function patchChallenge(id: string, patch: Partial<OtpChallenge>) {
  const current = await readChallenge(id);
  if (!current) return null;
  const next = { ...current, ...patch };
  memory.set(id, next);
  try {
    const admin = getSupabaseAdmin();
    if (admin) {
      await admin
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
    }
  } catch {
    // Keep the in-memory copy if the SQL table is missing.
  }
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

export async function sendSmsOtp(tenDigit: string) {
  const key = twoFactorKey();
  if (!key) return { ok: false as const, error: "Add TWOFACTOR_API_KEY to .env.local and restart the app." };
  const template = (process.env.TWOFACTOR_TEMPLATE || "").trim();
  const phone = twoFactorPhone(tenDigit);
  const path = template
    ? `https://2factor.in/API/V1/${encodeURIComponent(key)}/SMS/${phone}/AUTOGEN/${encodeURIComponent(template)}`
    : `https://2factor.in/API/V1/${encodeURIComponent(key)}/SMS/${phone}/AUTOGEN`;
  const response = await fetch(path, { method: "GET", cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as { Status?: string; Details?: string };
  if (body.Status !== "Success" || !body.Details) {
    return { ok: false as const, error: body.Details || "Could not send the SMS verification code." };
  }
  return { ok: true as const, sessionId: body.Details };
}

export async function verifySmsOtp(sessionId: string, otp: string) {
  const key = twoFactorKey();
  if (!key) return false;
  const path = `https://2factor.in/API/V1/${encodeURIComponent(key)}/SMS/VERIFY/${encodeURIComponent(sessionId)}/${encodeURIComponent(otp)}`;
  const response = await fetch(path, { method: "GET", cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as { Status?: string; Details?: string };
  return body.Status === "Success";
}

export async function sendEmailOtp(to: string, name: string, code: string) {
  const key = resendKey();
  const from = resendFrom();
  if (!key || !from) {
    return { ok: false as const, error: "Add RESEND_API_KEY and RESEND_FROM to .env.local and restart the app." };
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Your Dakshinvedha verification code",
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
        <p style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#ea580c;font-weight:700">Dakshinvedha Abroad Solutions</p>
        <h1 style="font-size:20px;margin:8px 0 16px">Email verification code</h1>
        <p style="font-size:14px;color:#475569">Hi ${escapeHtml(name || "student")}, use this code to finish creating your student account. It expires in 10 minutes.</p>
        <p style="font-size:32px;letter-spacing:.24em;font-weight:800;margin:24px 0">${code}</p>
        <p style="font-size:12px;color:#94a3b8">If you did not request this, you can ignore the email.</p>
      </div>`,
    }),
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
