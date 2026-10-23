import { callerCanUseFeature, callerIsSuperAdmin, isGuardError, requireCaller } from "@/lib/authGuard";
import { partnerFromRow, partnerToRow } from "@/lib/records";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  const gate = await requireCaller(request);
  if (isGuardError(gate)) return Response.json({ error: gate.error }, { status: gate.status });

  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ error: "Database is not configured." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { userId?: string } | null;
  const userId = (body?.userId || "").trim();
  if (!userId) return Response.json({ error: "Choose the account to remove." }, { status: 400 });
  if (userId === gate.caller.id) return Response.json({ error: "You cannot remove the account you are signed in with." }, { status: 400 });

  const targetResult = await admin.from("profiles").select("*").eq("id", userId).maybeSingle();
  const target = targetResult.data;
  if (!target) return Response.json({ error: "That account was not found." }, { status: 404 });

  const caller = gate.caller;
  const sameOrg = caller.role === "partner" && target.role === "team" && target.partner_id && target.partner_id === caller.partner_id;
  const superAdmin = callerIsSuperAdmin(caller);
  const mayRemovePartner = target.role === "partner" && (await callerCanUseFeature(caller, "partners"));
  const mayRemoveAgent = target.role === "agent" && (await callerCanUseFeature(caller, "agents"));
  const mayRemoveB2BTeam = target.role === "team" && (sameOrg || (await callerCanUseFeature(caller, "partners")));
  const mayRemoveAdmin = target.role === "admin" && superAdmin;
  if (!superAdmin && !mayRemovePartner && !mayRemoveAgent && !mayRemoveB2BTeam && !mayRemoveAdmin) {
    return Response.json({ error: "You cannot remove this account." }, { status: 403 });
  }

  if (target.role === "team" && target.partner_id) {
    const orgResult = await admin.from("partners").select("*").eq("id", target.partner_id).maybeSingle();
    if (orgResult.data) {
      const org = partnerFromRow(orgResult.data as Record<string, unknown>);
      org.teamMembers = (org.teamMembers || []).filter((member) => member.id !== userId && member.email.toLowerCase() !== String(target.email || "").toLowerCase());
      await admin.from("partners").update(partnerToRow(org)).eq("id", org.id);
    }
  }

  if (target.role === "partner" && target.partner_id) {
    const team = await admin.from("profiles").select("id").eq("partner_id", target.partner_id).eq("role", "team");
    for (const row of team.data || []) {
      await admin.auth.admin.deleteUser(row.id);
    }
    await admin.from("partners").delete().eq("id", target.partner_id);
  }

  const removed = await admin.auth.admin.deleteUser(userId);
  if (removed.error) return Response.json({ error: removed.error.message }, { status: 500 });
  return Response.json({ ok: true });
}
