import { openPortalSession } from "@/lib/checkPassword";
import { hashOtp, hashesMatch, MAX_VERIFY_ATTEMPTS, patchChallenge, readChallenge } from "@/lib/otp";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    challengeId?: string;
    email?: string;
    password?: string;
    emailCode?: string;
  } | null;
  const challengeId = (body?.challengeId || "").trim();
  const email = (body?.email || "").trim().toLowerCase();
  const password = body?.password || "";
  const emailCode = (body?.emailCode || "").replace(/\D/g, "");
  if (!challengeId || !email.includes("@") || password.trim().length < 6 || emailCode.length !== 6) {
    return Response.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });
  }

  const challenge = await readChallenge(challengeId);
  if (!challenge || challenge.consumed || challenge.email !== email) {
    return Response.json({ error: "This verification session expired. Request a new code." }, { status: 400 });
  }
  if (Date.now() > challenge.expiresAt) {
    return Response.json({ error: "The code expired. Request a new code." }, { status: 400 });
  }
  if (challenge.attempts >= MAX_VERIFY_ATTEMPTS) {
    return Response.json({ error: "Too many incorrect attempts. Request a new code." }, { status: 429 });
  }

  if (!hashesMatch(challenge.emailOtpHash, hashOtp(emailCode, challenge.id))) {
    await patchChallenge(challenge.id, { attempts: challenge.attempts + 1 });
    return Response.json({ error: "Incorrect email code. Check the latest message and try again." }, { status: 400 });
  }

  const consumed = await patchChallenge(challenge.id, { verified: true, consumed: true });
  if (!consumed) return Response.json({ error: "Could not store the verification result." }, { status: 500 });
  const session = await openPortalSession(email, password);
  if (!session.ok) return Response.json({ error: session.error }, { status: session.status });
  return Response.json({ ok: true, accessToken: session.accessToken, refreshToken: session.refreshToken });
}
