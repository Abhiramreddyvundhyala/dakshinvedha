import { recordAccountEvents, type AccountHistoryAction } from "@/lib/accountHistory";
import { isSuperAdminTitle, parseTeamFeatures } from "@/lib/adminAccess";
import { callerCanUseFeature, callerIsSuperAdmin, isGuardError, requireCaller, type CallerProfile } from "@/lib/authGuard";
import { directoryFromProfile, partnerFromRow, partnerToRow, profileFromRow } from "@/lib/records";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { B2BPartnerProfile } from "@/types";

type ManageBody = {
  userId?: string;
  action?: "update" | "status" | "password";
  fullName?: string;
  phone?: string;
  organizationName?: string;
  status?: "Active" | "Suspended";
  password?: string;
  features?: unknown;
};

async function canManage(caller: CallerProfile, targetRole: string, targetPartnerId: string | null): Promise<boolean> {
  if (callerIsSuperAdmin(caller)) return true;
  if (targetRole === "student") return callerCanUseFeature(caller, "students");
  if (targetRole === "partner") return callerCanUseFeature(caller, "partners");
  if (targetRole === "agent") return callerCanUseFeature(caller, "agents");
  if (targetRole === "admin") return false;
  if (targetRole === "team") {
    const ownOrg = caller.role === "partner" && caller.partner_id && caller.partner_id === targetPartnerId;
    return Boolean(ownOrg) || callerCanUseFeature(caller, "partners");
  }
  return false;
}

function restoredPartnerStatus(org: B2BPartnerProfile): B2BPartnerProfile["accountStatus"] {
  if (org.verificationStatus === "Verified") return "Active";
  if (org.profileCompleted) return "Under Verification";
  return "Pending Profile";
}

export async function POST(request: Request) {
  const gate = await requireCaller(request);
  if (isGuardError(gate)) return Response.json({ error: gate.error }, { status: gate.status });

  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ error: "Database is not configured." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as ManageBody | null;
  const userId = (body?.userId || "").trim();
  const action = body?.action;
  if (!userId) return Response.json({ error: "Choose the account to update." }, { status: 400 });
  if (action !== "update" && action !== "status" && action !== "password") {
    return Response.json({ error: "Choose update, freeze, or a new password." }, { status: 400 });
  }
  if (userId === gate.caller.id) {
    return Response.json({ error: "Use a different admin login to change the account you are signed in with." }, { status: 400 });
  }

  const targetResult = await admin.from("profiles").select("*").eq("id", userId).maybeSingle();
  const target = targetResult.data;
  if (!target) return Response.json({ error: "That account was not found." }, { status: 404 });

  const allowed = await canManage(gate.caller, String(target.role || ""), target.partner_id || null);
  if (!allowed) return Response.json({ error: "You cannot change this account." }, { status: 403 });

  let partner: B2BPartnerProfile | null = null;
  const orgId = target.role === "partner" || target.role === "team" ? target.partner_id : null;
  if (orgId) {
    const orgResult = await admin.from("partners").select("*").eq("id", orgId).maybeSingle();
    if (orgResult.data) partner = partnerFromRow(orgResult.data as Record<string, unknown>);
  }

  if (action === "password") {
    const password = (body?.password || "").trim();
    if (password.length < 6) return Response.json({ error: "Set a password of at least 6 characters." }, { status: 400 });
    const updated = await admin.auth.admin.updateUserById(userId, { password });
    if (updated.error) return Response.json({ error: updated.error.message }, { status: 400 });
    return Response.json({ ok: true, password });
  }

  if (action === "status") {
    const status = body?.status;
    if (status !== "Active" && status !== "Suspended") {
      return Response.json({ error: "Choose Active or Suspended." }, { status: 400 });
    }
    const profilePatch = await admin.from("profiles").update({ status }).eq("id", userId);
    if (profilePatch.error) return Response.json({ error: profilePatch.error.message }, { status: 400 });

    if (target.role === "partner" && partner) {
      partner.accountStatus = status === "Suspended" ? "Suspended" : restoredPartnerStatus(partner);
      await admin.from("partners").update(partnerToRow(partner)).eq("id", partner.id);
      const team = await admin.from("profiles").select("id").eq("partner_id", partner.id).eq("role", "team");
      for (const row of team.data || []) {
        await admin.from("profiles").update({ status }).eq("id", row.id);
      }
      if (status === "Suspended") {
        partner.teamMembers = (partner.teamMembers || []).map((member) => ({ ...member, status: "Suspended" }));
      } else {
        partner.teamMembers = (partner.teamMembers || []).map((member) => ({ ...member, status: "Active" }));
      }
      await admin.from("partners").update(partnerToRow(partner)).eq("id", partner.id);
    }

    if (target.role === "team" && partner) {
      partner.teamMembers = (partner.teamMembers || []).map((member) =>
        member.id === userId || member.email.toLowerCase() === String(target.email || "").toLowerCase()
          ? { ...member, status }
          : member
      );
      await admin.from("partners").update(partnerToRow(partner)).eq("id", partner.id);
    }

    if (target.role === "student") {
      const studentRow = await admin.from("students").select("payload").eq("profile_id", userId).maybeSingle();
      const payload =
        studentRow.data?.payload && typeof studentRow.data.payload === "object"
          ? { ...(studentRow.data.payload as Record<string, unknown>) }
          : {};
      const accountStatus = status === "Suspended" ? "Suspended" : "Active";
      payload.accountStatus = accountStatus;
      await admin.from("students").update({ account_status: accountStatus, payload }).eq("profile_id", userId);
    }

    const action: AccountHistoryAction = status === "Suspended" ? "paused" : "resumed";
    const actorName = gate.caller.full_name || gate.caller.email;
    const events: {
      accountId: string;
      email: string;
      fullName: string;
      role: string;
      action: AccountHistoryAction;
      actorId: string;
      actorName: string;
      note: string;
    }[] = [
      {
        accountId: userId,
        email: String(target.email || ""),
        fullName: String(target.full_name || ""),
        role: String(target.role || ""),
        action,
        actorId: gate.caller.id,
        actorName,
        note: status === "Suspended" ? "Login paused" : "Login resumed",
      },
    ];
    if (target.role === "partner" && partner) {
      for (const member of partner.teamMembers || []) {
        events.push({
          accountId: member.id,
          email: member.email,
          fullName: member.name,
          role: "team",
          action,
          actorId: gate.caller.id,
          actorName,
          note: status === "Suspended" ? `Paused with ${partner.name}` : `Resumed with ${partner.name}`,
        });
      }
    }
    await recordAccountEvents(admin, events);

    const profile = profileFromRow({ ...target, status });
    return Response.json({
      ok: true,
      account: profile ? directoryFromProfile(profile) : null,
      partner,
    });
  }

  const fullName = (body?.fullName || "").trim();
  const phone = (body?.phone || "").trim();
  if (!fullName) return Response.json({ error: "Name is required." }, { status: 400 });

  const patch: Record<string, unknown> = { full_name: fullName, phone };
  if (target.role === "admin" && !isSuperAdminTitle(String(target.staff_title || "")) && body?.features !== undefined) {
    patch.allowed_features = parseTeamFeatures(body.features);
  }
  const profilePatch = await admin.from("profiles").update(patch).eq("id", userId);
  if (profilePatch.error) return Response.json({ error: profilePatch.error.message }, { status: 400 });

  if (target.role === "partner" && partner) {
    partner.name = fullName;
    partner.phone = phone;
    if (typeof body?.organizationName === "string") partner.organizationName = body.organizationName.trim();
    await admin.from("partners").update(partnerToRow(partner)).eq("id", partner.id);
  }

  if (target.role === "team" && partner) {
    partner.teamMembers = (partner.teamMembers || []).map((member) =>
      member.id === userId || member.email.toLowerCase() === String(target.email || "").toLowerCase()
        ? { ...member, name: fullName }
        : member
    );
    await admin.from("partners").update(partnerToRow(partner)).eq("id", partner.id);
  }

  const profile = profileFromRow({ ...target, full_name: fullName, phone });
  return Response.json({
    ok: true,
    account: profile ? directoryFromProfile(profile) : null,
    partner,
  });
}
