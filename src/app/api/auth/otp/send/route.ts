import { randomUUID } from "crypto";
import {
  assertSendAllowed,
  clientIp,
  createChallenge,
  displayPhone,
  hashOtp,
  indiaTenDigit,
  resendKey,
  sendEmailOtp,
  sendSmsOtp,
  sixDigitCode,
  twoFactorKey,
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
  if (!resendKey()) {
    return Response.json(
      {
        error: "Email OTP is not configured. Add RESEND_API_KEY to .env.local, then restart the app.",
      },
      { status: 503 }
    );
  }

  const ip = clientIp(request);
  const allowed = assertSendAllowed([`ip:${ip}`, `email:${email}`, `phone:${ten}`]);
  if (!allowed.ok) {
    return Response.json({ error: allowed.error }, { status: allowed.status });
  }

  let smsSessionId = "";
  let smsSent = false;
  if (twoFactorKey()) {
    const sms = await sendSmsOtp(ten);
    if (!sms.ok) {
      return Response.json({ error: sms.error }, { status: 502 });
    }
    smsSessionId = sms.sessionId;
    smsSent = true;
  }

  const challengeId = randomUUID();
  const emailCode = sixDigitCode();
  const emailSend = await sendEmailOtp(email, fullName, emailCode);
  if (!emailSend.ok) {
    return Response.json({ error: emailSend.error }, { status: 502 });
  }

  const challenge = await createChallenge({
    id: challengeId,
    email,
    phone: displayPhone(ten),
    emailOtpHash: hashOtp(emailCode, challengeId),
    smsSessionId,
  });

  return Response.json({ ok: true, challengeId: challenge.id, cooldown: 45, smsSent });
}
