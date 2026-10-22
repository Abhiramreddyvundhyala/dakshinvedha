import {
  hashOtp,
  hashesMatch,
  indiaTenDigit,
  MAX_VERIFY_ATTEMPTS,
  patchChallenge,
  readChallenge,
  signOtpTicket,
  verifySmsOtp,
} from "@/lib/otp";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    challengeId?: string;
    email?: string;
    phone?: string;
    smsCode?: string;
    emailCode?: string;
  } | null;

  const challengeId = (body?.challengeId || "").trim();
  const email = (body?.email || "").trim().toLowerCase();
  const smsCode = (body?.smsCode || "").replace(/\D/g, "");
  const emailCode = (body?.emailCode || "").replace(/\D/g, "");
  const ten = indiaTenDigit(body?.phone || "");

  if (!challengeId || !email.includes("@") || !ten || emailCode.length !== 6) {
    return Response.json({ error: "Enter the 6-digit email verification code." }, { status: 400 });
  }

  const challenge = await readChallenge(challengeId);
  if (!challenge || challenge.consumed) {
    return Response.json({ error: "This verification session expired. Request new codes." }, { status: 400 });
  }
  if (Date.now() > challenge.expiresAt) {
    return Response.json({ error: "The codes expired. Request new codes." }, { status: 400 });
  }
  if (challenge.email !== email || indiaTenDigit(challenge.phone) !== ten) {
    return Response.json({ error: "This verification session does not match the signup details." }, { status: 400 });
  }
  if (challenge.attempts >= MAX_VERIFY_ATTEMPTS) {
    return Response.json({ error: "Too many incorrect attempts. Request new codes." }, { status: 429 });
  }

  const smsRequired = Boolean(challenge.smsSessionId);
  if (smsRequired && smsCode.length !== 6) {
    return Response.json({ error: "Enter the 6-digit SMS verification code." }, { status: 400 });
  }
  const smsOk = smsRequired ? await verifySmsOtp(challenge.smsSessionId, smsCode) : true;
  const emailOk = hashesMatch(challenge.emailOtpHash, hashOtp(emailCode, challenge.id));
  if (!smsOk || !emailOk) {
    await patchChallenge(challenge.id, { attempts: challenge.attempts + 1 });
    const missing = [
      !smsOk ? "SMS code" : null,
      !emailOk ? "email code" : null,
    ].filter(Boolean);
    return Response.json({ error: `Incorrect ${missing.join(" and ")}. Check the latest messages and try again.` }, { status: 400 });
  }

  const verified = await patchChallenge(challenge.id, { verified: true });
  if (!verified) {
    return Response.json({ error: "Could not store the verification result." }, { status: 500 });
  }

  return Response.json({ ok: true, otpTicket: signOtpTicket(verified) });
}
