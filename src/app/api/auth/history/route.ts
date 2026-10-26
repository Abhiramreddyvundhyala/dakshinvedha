import { historyFromRow } from "@/lib/accountHistory";
import { callerCanUseFeature, callerIsSuperAdmin, isGuardError, requireCaller } from "@/lib/authGuard";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

async function canSeeRole(caller: Parameters<typeof callerCanUseFeature>[0], role: string): Promise<boolean> {
  if (callerIsSuperAdmin(caller)) return true;
  if (role === "student") return callerCanUseFeature(caller, "students");
  if (role === "partner" || role === "team") return callerCanUseFeature(caller, "partners");
  if (role === "agent") return callerCanUseFeature(caller, "agents");
  return false;
}

export async function GET(request: Request) {
  const gate = await requireCaller(request);
  if (isGuardError(gate)) return Response.json({ error: gate.error }, { status: gate.status });

  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ error: "Database is not configured." }, { status: 503 });

  const result = await admin.from("account_history").select("*").order("created_at", { ascending: false }).limit(200);
  if (result.error) {
    return Response.json({
      events: [],
      error: "Account history is not ready. Run supabase/account-history.sql in the Supabase SQL editor.",
    });
  }

  const events = [];
  for (const row of result.data || []) {
    const event = historyFromRow(row as Record<string, unknown>);
    if (await canSeeRole(gate.caller, event.role)) events.push(event);
  }
  return Response.json({ events });
}
