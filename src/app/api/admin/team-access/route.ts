import { callerIsSuperAdmin, isGuardError, requireCaller } from "@/lib/authGuard";
import { parseTeamFeatures, TEAM_ACCESS_SQL } from "@/lib/adminAccess";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  const gate = await requireCaller(request);
  if (isGuardError(gate)) return Response.json({ error: gate.error }, { status: gate.status });
  if (gate.caller.role !== "admin") return Response.json({ error: "Only an admin can read team access." }, { status: 403 });

  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ error: "Database is not configured." }, { status: 503 });

  const { data, error } = await admin.from("portal_settings").select("team_features").eq("id", "global").maybeSingle();
  if (error) {
    return Response.json({ error: error.message, sql: TEAM_ACCESS_SQL, features: parseTeamFeatures(null) }, { status: 503 });
  }
  return Response.json({ features: parseTeamFeatures(data?.team_features) });
}

export async function POST(request: Request) {
  const gate = await requireCaller(request);
  if (isGuardError(gate)) return Response.json({ error: gate.error }, { status: gate.status });
  if (!callerIsSuperAdmin(gate.caller)) {
    return Response.json({ error: "Only Super Admin can change team access." }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ error: "Database is not configured." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { features?: unknown } | null;
  const features = parseTeamFeatures(body?.features);

  const saved = await admin
    .from("portal_settings")
    .upsert(
      {
        id: "global",
        team_features: features,
        updated_at: new Date().toISOString(),
        updated_by: gate.caller.id,
      },
      { onConflict: "id" }
    )
    .select("team_features")
    .maybeSingle();

  if (saved.error) {
    return Response.json({ error: saved.error.message, sql: TEAM_ACCESS_SQL }, { status: 503 });
  }
  return Response.json({ features: parseTeamFeatures(saved.data?.team_features ?? features) });
}
