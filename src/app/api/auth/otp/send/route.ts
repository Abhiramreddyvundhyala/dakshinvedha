import { randomUUID } from "crypto";
import {
  assertSendAllowed,
  clientIp,
  createChallenge,
  displayPhone,
  emailOtpReady,
  emailOtpSetupError,
  hashOtp,
  indiaTenDigit,
  sendEmailOtp,
  sendSmsOtp,
  sixDigitCode,
  smsOtpSetupError,
  verifyNowConfigured,
} from "@/lib/otp";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    phone?: string;
    fullName?: string;
  } | null;

  const email = (body?.email || "").trim().toLowerCase();
  const fullName = (body?.fullName || "").trim();
  const ten = indiaTenDigit(body?.phone || "");
  if (!email.includes("@") || !ten) {
    return Response.json({ error: "A valid email and 10-digit Indian mobile number are required." }, { status: 400 });
  }
  if (!emailOtpReady()) {
    return Response.json({ error: emailOtpSetupError() }, { status: 503 });
  }
  if (!verifyNowConfigured()) {
    return Response.json({ error: smsOtpSetupError() }, { status: 503 });
  }

  const ip = clientIp(request);
  const allowed = await assertSendAllowed([`ip:${ip}`, `email:${email}`, `phone:${ten}`]);
  if (!allowed.ok) {
    return Response.json({ error: allowed.error }, { status: allowed.status });
  }

  const challengeId = randomUUID();
  const emailCode = sixDigitCode();
  const emailSend = await sendEmailOtp(email, fullName, emailCode);
  if (!emailSend.ok) {
    return Response.json({ error: emailSend.error }, { status: 502 });
  }
  const sms = await sendSmsOtp(ten);
  if (!sms.ok) {
    return Response.json({ error: sms.error }, { status: 502 });
  }

  const stored = await createChallenge({
    id: challengeId,
    email,
    phone: displayPhone(ten),
    emailOtpHash: hashOtp(emailCode, challengeId),
    smsSessionId: sms.sessionId,
  });
  if (!stored.ok) return Response.json({ error: stored.error }, { status: 500 });

  return Response.json({ ok: true, challengeId: stored.challenge.id, cooldown: 45, smsSent: true });
}
