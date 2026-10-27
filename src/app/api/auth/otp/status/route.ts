import { emailOtpReady, verifyNowConfigured } from "@/lib/otp";

export async function GET() {
  return Response.json({ emailOtp: emailOtpReady(), smsOtp: verifyNowConfigured() });
}
