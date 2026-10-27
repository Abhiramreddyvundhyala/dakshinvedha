import { randomUUID } from "crypto";
import { checkPortalPassword } from "@/lib/checkPassword";
import {
  assertSendAllowed,
  clientIp,
  createChallenge,
  emailOtpReady,
  emailOtpSetupError,
  hashOtp,
  sendEmailOtp,
  sixDigitCode,
} from "@/lib/otp";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = (body?.email || "").trim().toLowerCase();
  const password = body?.password || "";
  if (!email.includes("@") || password.trim().length < 6) {
    return Response.json({ error: "Enter the email and password for this portal." }, { status: 400 });
  }
  if (!emailOtpReady()) {
    return Response.json({ error: emailOtpSetupError() }, { status: 503 });
  }

  const allowed = await assertSendAllowed([`ip:${clientIp(request)}`, `login:${email}`]);
  if (!allowed.ok) return Response.json({ error: allowed.error }, { status: allowed.status });

  const checked = await checkPortalPassword(email, password);
  if (!checked.ok) return Response.json({ error: checked.error }, { status: checked.status });

  const challengeId = randomUUID();
  const code = sixDigitCode();
  const sent = await sendEmailOtp(email, checked.fullName, code, "login");
  if (!sent.ok) return Response.json({ error: sent.error }, { status: 502 });

  const stored = await createChallenge({
    id: challengeId,
    email,
    phone: "",
    emailOtpHash: hashOtp(code, challengeId),
    smsSessionId: "",
  });
  if (!stored.ok) return Response.json({ error: stored.error }, { status: 500 });
  return Response.json({ ok: true, challengeId: stored.challenge.id, cooldown: 45 });
}
