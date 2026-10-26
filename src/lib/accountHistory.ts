import type { SupabaseClient } from "@supabase/supabase-js";

export type AccountHistoryAction = "paused" | "resumed" | "deleted";

export type AccountHistoryEvent = {
  id: string;
  accountId: string;
  email: string;
  fullName: string;
  role: string;
  action: AccountHistoryAction;
  actorName: string;
  note: string;
  createdAt: string;
};

type EventInput = {
  accountId?: string | null;
  email?: string | null;
  fullName?: string | null;
  role?: string | null;
  action: AccountHistoryAction;
  actorId?: string | null;
  actorName?: string | null;
  note?: string | null;
};

export async function recordAccountEvents(admin: SupabaseClient, events: EventInput[]): Promise<string | null> {
  if (events.length === 0) return null;
  const { error } = await admin.from("account_history").insert(
    events.map((event) => ({
      account_id: event.accountId || null,
      email: event.email || "",
      full_name: event.fullName || "",
      role: event.role || "",
      action: event.action,
      actor_id: event.actorId || null,
      actor_name: event.actorName || "",
      note: event.note || "",
    }))
  );
  return error ? error.message : null;
}

export function historyFromRow(row: Record<string, unknown>): AccountHistoryEvent {
  const action = String(row.action || "");
  return {
    id: String(row.id || ""),
    accountId: String(row.account_id || ""),
    email: String(row.email || ""),
    fullName: String(row.full_name || ""),
    role: String(row.role || ""),
    action: action === "resumed" || action === "deleted" ? action : "paused",
    actorName: String(row.actor_name || ""),
    note: String(row.note || ""),
    createdAt: String(row.created_at || ""),
  };
}
