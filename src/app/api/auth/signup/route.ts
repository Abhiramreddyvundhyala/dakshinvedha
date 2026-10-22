import { createConfirmedUser } from "@/lib/createPortalUser";
import { indiaTenDigit, patchChallenge, readChallenge, readOtpTicket } from "@/lib/otp";
import { blankStudent, studentToRow } from "@/lib/records";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return Response.json(
      { error: "Database is not configured. Add the Supabase URL, anon key, and service role key in .env.local, then restart the app." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    role?: string;
    otpTicket?: string;
  } | null;

  if (body?.role && body.role !== "student") {
    return Response.json({ error: "Signup is only for the student dashboard." }, { status: 400 });
  }

  const email = (body?.email || "").trim().toLowerCase();
  const password = (body?.password || "").trim();
  const fullName = (body?.fullName || "").trim();
  const phone = (body?.phone || "").trim();
  if (!fullName || !email.includes("@") || password.length < 6) {
    return Response.json({ error: "Name, a valid email, and a password of at least 6 characters are required." }, { status: 400 });
  }

  const ticketValue = (body?.otpTicket || "").trim();
  if (ticketValue) {
    const ticket = readOtpTicket(ticketValue);
    if (!ticket || ticket.email !== email || indiaTenDigit(ticket.phone) !== indiaTenDigit(phone)) {
      return Response.json({ error: "Verify the SMS and email codes before creating the account." }, { status: 403 });
    }
    const challenge = await readChallenge(ticket.cid);
    if (!challenge || !challenge.verified || challenge.consumed) {
      return Response.json({ error: "Verify the SMS and email codes before creating the account." }, { status: 403 });
    }
    await patchChallenge(challenge.id, { consumed: true });
  }

  const created = await createConfirmedUser(admin, { email, password, fullName, phone });
  if (created.error || !created.data.user) {
    return Response.json({ error: created.error?.message || "Could not create the student account." }, { status: 400 });
  }

  const userId = created.data.user.id;
  const { data: profile, error: profileError } = await admin.from("profiles").select("tracking_id").eq("id", userId).maybeSingle();
  if (profileError || !profile) {
    await admin.auth.admin.deleteUser(userId);
    return Response.json({ error: "The student profile was not created. Run supabase/schema.sql in the Supabase SQL editor." }, { status: 500 });
  }

  const student = blankStudent({
    id: userId,
    studentId: profile.tracking_id || "",
    name: fullName,
    email,
    mobile: phone,
  });
  const { error: studentError } = await admin.from("students").update(studentToRow(student)).eq("profile_id", userId);
  if (studentError) {
    await admin.auth.admin.deleteUser(userId);
    return Response.json({ error: studentError.message }, { status: 500 });
  }
  await admin.from("profiles").update({ full_name: fullName, phone }).eq("id", userId);

  const { data: admins } = await admin.from("profiles").select("id").eq("role", "admin").eq("status", "Active");
  if (admins && admins.length > 0) {
    await admin.from("notifications").insert(
      admins.map((item) => ({
        recipient_id: item.id,
        title: "New student registered",
        message: `${fullName} (${email}) created a student account. Tracking ID ${student.studentId}.`,
        kind: "system",
      }))
    );
  }

  return Response.json({ ok: true, trackingId: student.studentId });
}
