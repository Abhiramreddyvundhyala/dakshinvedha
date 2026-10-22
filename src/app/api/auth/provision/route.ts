import { isGuardError, requireCaller } from "@/lib/authGuard";
import { createConfirmedUser, nextTrackingCode } from "@/lib/createPortalUser";
import { blankPartner, directoryFromProfile, partnerFromRow, partnerToRow, profileFromRow, type DirectoryAccount } from "@/lib/records";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { B2BPartnerProfile } from "@/types";

const STAFF_ROLES = new Set(["partner", "team", "agent", "admin"]);

export async function POST(request: Request) {
  const gate = await requireCaller(request);
  if (isGuardError(gate)) return Response.json({ error: gate.error }, { status: gate.status });

  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ error: "Database is not configured." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as {
    role?: string;
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    partnerId?: string;
    organizationName?: string;
    staffTitle?: string;
    department?: string;
  } | null;

  const role = body?.role || "";
  const email = (body?.email || "").trim().toLowerCase();
  const password = (body?.password || "").trim();
  const fullName = (body?.fullName || "").trim();
  const phone = (body?.phone || "").trim();
  if (!STAFF_ROLES.has(role)) {
    return Response.json({ error: "Signup is only for the student dashboard." }, { status: 400 });
  }
  if (!fullName || !email.includes("@") || password.length < 6) {
    return Response.json({ error: "Name, a valid email, and a password of at least 6 characters are required." }, { status: 400 });
  }

  const caller = gate.caller;
  if (role === "team") {
    const ownOrg = caller.role === "partner" && caller.partner_id && caller.partner_id === body?.partnerId;
    if (caller.role !== "admin" && !ownOrg) {
      return Response.json({ error: "A B2B owner can create team logins only for their own organization." }, { status: 403 });
    }
    if (!body?.partnerId) return Response.json({ error: "Choose the B2B organization for this team member." }, { status: 400 });
  } else if (caller.role !== "admin") {
    return Response.json({ error: "Only an admin can create this login." }, { status: 403 });
  }

  const created = await createConfirmedUser(admin, { email, password, fullName, phone });
  if (created.error || !created.data.user) {
    return Response.json({ error: created.error?.message || "Could not create the login." }, { status: 400 });
  }
  const userId = created.data.user.id;
  const kind = role === "partner" ? "B2B" : role === "team" ? "TEM" : role === "agent" ? "AGN" : "ADM";
  const issued = await nextTrackingCode(admin, kind);
  if ("error" in issued) {
    await admin.auth.admin.deleteUser(userId);
    return Response.json({ error: issued.error }, { status: 500 });
  }

  let partner: B2BPartnerProfile | undefined;
  const partnerRecordId = role === "partner" ? crypto.randomUUID() : role === "team" ? body?.partnerId || null : null;

  if (role === "partner" && partnerRecordId) {
    partner = blankPartner({
      id: partnerRecordId,
      partnerId: issued.code,
      ownerProfileId: userId,
      name: fullName,
      phone,
      email,
      organizationName: body?.organizationName,
    });
    const inserted = await admin.from("partners").insert(partnerToRow(partner));
    if (inserted.error) {
      await admin.auth.admin.deleteUser(userId);
      return Response.json({ error: inserted.error.message }, { status: 500 });
    }
  }

  const profilePatch = {
    role,
    full_name: fullName,
    phone,
    tracking_id: issued.code,
    partner_id: partnerRecordId,
    staff_title: role === "admin" ? body?.staffTitle || "Admin" : null,
    department: role === "admin" ? body?.department || "Operations" : null,
  };
  const updated = await admin.from("profiles").update(profilePatch).eq("id", userId).select("*").maybeSingle();
  if (updated.error || !updated.data) {
    await admin.auth.admin.deleteUser(userId);
    return Response.json({ error: updated.error?.message || "Could not assign the portal role." }, { status: 500 });
  }
  await admin.from("students").delete().eq("profile_id", userId);

  if (role === "team" && body?.partnerId) {
    const existing = await admin.from("partners").select("*").eq("id", body.partnerId).maybeSingle();
    if (existing.data) {
      const org = partnerFromRow(existing.data as Record<string, unknown>);
      const members = org.teamMembers || [];
      org.teamMembers = [
        ...members.filter((member) => member.email.toLowerCase() !== email),
        {
          id: userId,
          name: fullName,
          email,
          password: "",
          role: "Team Member",
          status: "Active",
          createdAt: new Date().toISOString().slice(0, 10),
          trackingId: issued.code,
        },
      ];
      await admin.from("partners").update(partnerToRow(org)).eq("id", org.id);
      partner = org;
    }
  }

  const profile = profileFromRow(updated.data as Record<string, unknown>);
  const account: DirectoryAccount | null = profile ? directoryFromProfile(profile) : null;
  return Response.json({ account, partner: partner || null });
}
