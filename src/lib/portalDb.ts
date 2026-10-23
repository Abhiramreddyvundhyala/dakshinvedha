import type {
  ApplicationRecord,
  B2BAccessRequest,
  B2BPartnerProfile,
  ChatConversation,
  ChatMessage,
  CommissionLedgerItem,
  MailItem,
  NoticeItem,
  NotificationItem,
  StudentProfile,
  VoucherItem,
} from "@/types";
import { DEFAULT_TEAM_FEATURES, parseTeamFeatures, type AdminFeatureKey } from "@/lib/adminAccess";
import { getSupabase } from "@/lib/supabase";
import {
  applicationFromRow,
  applicationToRow,
  directoryFromProfile,
  isUuid,
  ledgerFromRow,
  mailFromRow,
  noticeFromRow,
  noticeToRow,
  notificationFromRow,
  partnerFromRow,
  partnerToRow,
  profileFromRow,
  requestFromRow,
  stripPartner,
  stripStudent,
  studentFromRow,
  studentToRow,
  voucherFromRow,
  type DirectoryAccount,
  type SessionProfile,
} from "@/lib/records";

export interface PortalBundle {
  profile: SessionProfile;
  students: StudentProfile[];
  applications: ApplicationRecord[];
  partners: B2BPartnerProfile[];
  notices: NoticeItem[];
  notifications: NotificationItem[];
  requests: B2BAccessRequest[];
}

type DbResult<T> = { ok: true; data: T } | { ok: false; error: string; reason: "unconfigured" | "signed_out" | "error" };

const SETUP = "Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env.local, run supabase/schema.sql, then restart the app.";

function explain(message: string | undefined): string {
  const text = message || "The database rejected the change.";
  if (/payload|schema cache|application_drafts|relation|column/i.test(text)) {
    return `${text} Run supabase/schema.sql again in the Supabase SQL editor, then refresh.`;
  }
  return text;
}

function digest<T>(items: T[], idOf: (item: T) => string, strip: (item: T) => unknown): [string, string][] {
  return items
    .map((item) => [idOf(item), JSON.stringify(strip(item))] as [string, string])
    .sort((a, b) => a[0].localeCompare(b[0]));
}

export function portalSnapshot(data: Omit<PortalBundle, "profile">): string {
  return JSON.stringify({
    students: digest(data.students, (item) => item.id, stripStudent),
    applications: digest(data.applications, (item) => item.camsId, (item) => item),
    partners: digest(data.partners, (item) => item.id, stripPartner),
    notices: digest(data.notices, (item) => item.id, (item) => item),
    requests: digest(data.requests, (item) => item.id, (item) => item),
    notifications: digest(data.notifications, (item) => item.id, (item) => ({ ...item, timeAgo: "" })),
  });
}

function asMap(value: unknown): Map<string, string> {
  const map = new Map<string, string>();
  if (!Array.isArray(value)) return map;
  for (const entry of value) {
    if (Array.isArray(entry) && typeof entry[0] === "string" && typeof entry[1] === "string") {
      map.set(entry[0], entry[1]);
    }
  }
  return map;
}

export async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function loadTeamFeatures(): Promise<{ features: AdminFeatureKey[]; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { features: DEFAULT_TEAM_FEATURES, error: SETUP };
  const { data, error } = await supabase.from("portal_settings").select("team_features").eq("id", "global").maybeSingle();
  if (error) {
    return {
      features: DEFAULT_TEAM_FEATURES,
      error: /relation|schema cache|portal_settings/i.test(error.message)
        ? "Run supabase/team-access.sql in the Supabase SQL editor, then refresh."
        : explain(error.message),
    };
  }
  return { features: parseTeamFeatures(data?.team_features), error: null };
}

export async function saveTeamFeatures(features: AdminFeatureKey[]): Promise<{ ok: true; features: AdminFeatureKey[] } | { ok: false; error: string }> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Sign in again before changing team access." };
  const response = await fetch("/api/admin/team-access", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ features }),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string; features?: AdminFeatureKey[]; sql?: string };
  if (!response.ok) {
    const extra = payload.sql ? ` Run supabase/team-access.sql in the Supabase SQL editor.` : "";
    return { ok: false, error: `${payload.error || "Could not save team access."}${extra}` };
  }
  return { ok: true, features: parseTeamFeatures(payload.features) };
}

export async function fetchMyProfile(): Promise<DbResult<SessionProfile>> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: "unconfigured", error: SETUP };
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { ok: false, reason: "signed_out", error: "Sign in to open the portal." };
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userData.user.id).maybeSingle();
  if (error) return { ok: false, reason: "error", error: explain(error.message) };
  const profile = data ? profileFromRow(data as Record<string, unknown>) : null;
  if (!profile) {
    return { ok: false, reason: "error", error: "Your profile is missing. Run supabase/schema.sql, then sign in again." };
  }
  return { ok: true, data: profile };
}

export async function loadPortalBundle(): Promise<DbResult<PortalBundle>> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: "unconfigured", error: SETUP };
  const profileResult = await fetchMyProfile();
  if (!profileResult.ok) return profileResult;
  const [studentsRes, appsRes, partnersRes, noticesRes, notifRes, requestsRes] = await Promise.all([
    supabase.from("students").select("*"),
    supabase.from("applications").select("*"),
    supabase.from("partners").select("*"),
    supabase.from("notices").select("*").order("created_at", { ascending: false }),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }),
    supabase.from("b2b_access_requests").select("*").order("created_at", { ascending: false }),
  ]);
  const failed = [studentsRes, appsRes, partnersRes, noticesRes, notifRes, requestsRes].find((result) => result.error);
  if (failed?.error) return { ok: false, reason: "error", error: explain(failed.error.message) };
  return {
    ok: true,
    data: {
      profile: profileResult.data,
      students: (studentsRes.data || []).map((row) => studentFromRow(row as Record<string, unknown>)),
      applications: (appsRes.data || [])
        .map((row) => applicationFromRow(row as Record<string, unknown>))
        .filter((row): row is ApplicationRecord => Boolean(row)),
      partners: (partnersRes.data || []).map((row) => partnerFromRow(row as Record<string, unknown>)),
      notices: (noticesRes.data || []).map((row) => noticeFromRow(row as Record<string, unknown>)),
      notifications: (notifRes.data || []).map((row) => notificationFromRow(row as Record<string, unknown>)),
      requests: (requestsRes.data || []).map((row) => requestFromRow(row as Record<string, unknown>)),
    },
  };
}

async function currentUserId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function writeStudent(student: StudentProfile): Promise<string | null> {
  if (!isUuid(student.id)) return null;
  const supabase = getSupabase();
  if (!supabase) return SETUP;
  const { error } = await supabase.from("students").update(studentToRow(student)).eq("profile_id", student.id);
  if (error) return explain(error.message);
  await supabase.from("profiles").update({ full_name: student.name, phone: student.mobile || "" }).eq("id", student.id);
  return null;
}

async function resolveApplicationLinks(app: ApplicationRecord): Promise<{ partnerId: string | null; agentId: string | null }> {
  const supabase = getSupabase();
  let partnerId = isUuid(app.partnerRecordId) ? app.partnerRecordId : null;
  let agentId = isUuid(app.agentProfileId) ? app.agentProfileId : null;
  if (!supabase) return { partnerId, agentId };
  if (!partnerId && app.partnerTrackingId) {
    const { data } = await supabase.from("partners").select("id").eq("tracking_id", app.partnerTrackingId).maybeSingle();
    partnerId = data?.id ?? null;
  }
  if (!agentId && app.agentTrackingId) {
    const { data } = await supabase.from("profiles").select("id").eq("tracking_id", app.agentTrackingId).eq("role", "agent").maybeSingle();
    agentId = data?.id ?? null;
  }
  return { partnerId, agentId };
}

async function writeApplication(app: ApplicationRecord): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return SETUP;
  const links = await resolveApplicationLinks(app);
  const row = applicationToRow(app, links);
  let result = await supabase.from("applications").upsert(row, { onConflict: "cams_id" });
  if (result.error && /foreign key/i.test(result.error.message)) {
    result = await supabase.from("applications").upsert({ ...row, institution_id: null, course_id: null }, { onConflict: "cams_id" });
  }
  return result.error ? explain(result.error.message) : null;
}

async function writePartner(partner: B2BPartnerProfile): Promise<string | null> {
  if (!isUuid(partner.id)) return "This organization is not stored in the database yet.";
  const supabase = getSupabase();
  if (!supabase) return SETUP;
  const { error } = await supabase.from("partners").update(partnerToRow(partner)).eq("id", partner.id);
  return error ? explain(error.message) : null;
}

async function writeNotice(notice: NoticeItem): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return SETUP;
  const { error } = await supabase.from("notices").upsert(noticeToRow(notice), { onConflict: "id" });
  return error ? explain(error.message) : null;
}

async function writeRequest(request: B2BAccessRequest): Promise<string | null> {
  if (!isUuid(request.id)) return null;
  const supabase = getSupabase();
  if (!supabase) return SETUP;
  const { error } = await supabase
    .from("b2b_access_requests")
    .update({ status: request.status, partner_id: isUuid(request.partnerId) ? request.partnerId : null })
    .eq("id", request.id);
  return error ? explain(error.message) : null;
}

async function writeNotification(item: NotificationItem, students: StudentProfile[]): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return SETUP;
  const match = students.find((student) => student.id === item.studentId || student.studentId === item.studentId);
  const recipient = match && isUuid(match.id) ? match.id : null;
  if (isUuid(item.id)) {
    const { error } = await supabase.from("notifications").update({ is_read: item.isRead }).eq("id", item.id);
    return error ? explain(error.message) : null;
  }
  const { error } = await supabase.from("notifications").insert({
    recipient_id: recipient,
    title: item.title,
    message: item.message,
    kind: item.type,
    is_read: item.isRead,
    cams_id: item.camsId || null,
  });
  return error ? explain(error.message) : null;
}

export async function flushPortalChanges(
  current: Omit<PortalBundle, "profile">,
  previous: string
): Promise<{ snapshot: string; error: string | null }> {
  const snapshotNow = portalSnapshot(current);
  if (snapshotNow === previous) return { snapshot: snapshotNow, error: null };
  let parsed: Record<string, unknown> = {};
  try {
    parsed = previous ? (JSON.parse(previous) as Record<string, unknown>) : {};
  } catch {
    parsed = {};
  }
  const errors: string[] = [];
  const students = asMap(parsed.students);
  const applications = asMap(parsed.applications);
  const partners = asMap(parsed.partners);
  const notices = asMap(parsed.notices);
  const requests = asMap(parsed.requests);
  const notifications = asMap(parsed.notifications);

  const keep = <T,>(map: Map<string, string>, items: T[], idOf: (item: T) => string) => {
    const live = new Set(items.map(idOf));
    for (const key of map.keys()) if (!live.has(key)) map.delete(key);
  };

  for (const student of current.students) {
    const next = JSON.stringify(stripStudent(student));
    if (students.get(student.id) === next) continue;
    const error = await writeStudent(student);
    if (error) errors.push(error);
    else students.set(student.id, next);
  }
  keep(students, current.students, (item) => item.id);

  for (const app of current.applications) {
    const next = JSON.stringify(app);
    if (applications.get(app.camsId) === next) continue;
    const error = await writeApplication(app);
    if (error) errors.push(error);
    else applications.set(app.camsId, next);
  }
  keep(applications, current.applications, (item) => item.camsId);

  for (const partner of current.partners) {
    const next = JSON.stringify(stripPartner(partner));
    if (partners.get(partner.id) === next) continue;
    const error = await writePartner(partner);
    if (error) errors.push(error);
    else partners.set(partner.id, next);
  }
  keep(partners, current.partners, (item) => item.id);

  for (const notice of current.notices) {
    const next = JSON.stringify(notice);
    if (notices.get(notice.id) === next) continue;
    const error = await writeNotice(notice);
    if (error) errors.push(error);
    else notices.set(notice.id, next);
  }
  keep(notices, current.notices, (item) => item.id);

  for (const request of current.requests) {
    const next = JSON.stringify(request);
    if (requests.get(request.id) === next) continue;
    const error = await writeRequest(request);
    if (error) errors.push(error);
    else requests.set(request.id, next);
  }
  keep(requests, current.requests, (item) => item.id);

  for (const item of current.notifications) {
    const next = JSON.stringify({ ...item, timeAgo: "" });
    if (notifications.get(item.id) === next) continue;
    const error = await writeNotification(item, current.students);
    if (!error) notifications.set(item.id, next);
  }
  keep(notifications, current.notifications, (item) => item.id);

  const snapshot = JSON.stringify({
    students: [...students.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    applications: [...applications.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    partners: [...partners.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    notices: [...notices.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    requests: [...requests.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    notifications: [...notifications.entries()].sort((a, b) => a[0].localeCompare(b[0])),
  });
  return { snapshot, error: errors[0] || null };
}

export async function provisionAccount(input: {
  role: "partner" | "team" | "agent" | "admin";
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  partnerId?: string;
  organizationName?: string;
  staffTitle?: string;
  department?: string;
}): Promise<{ ok: true; account: DirectoryAccount | null; partner: B2BPartnerProfile | null } | { ok: false; error: string }> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Sign in again before creating an account." };
  const response = await fetch("/api/auth/provision", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string; account?: DirectoryAccount; partner?: B2BPartnerProfile | null };
  if (!response.ok) return { ok: false, error: payload.error || "Could not create the login." };
  return { ok: true, account: payload.account || null, partner: payload.partner || null };
}

export async function manageAccount(input: {
  userId: string;
  action: "update" | "status" | "password";
  fullName?: string;
  phone?: string;
  organizationName?: string;
  status?: "Active" | "Suspended";
  password?: string;
}): Promise<{ ok: true; password?: string; account?: DirectoryAccount | null; partner?: B2BPartnerProfile | null } | { ok: false; error: string }> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Sign in again before changing this account." };
  const response = await fetch("/api/auth/manage", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    password?: string;
    account?: DirectoryAccount | null;
    partner?: B2BPartnerProfile | null;
  };
  if (!response.ok) return { ok: false, error: payload.error || "Could not update the account." };
  return { ok: true, password: payload.password, account: payload.account, partner: payload.partner || null };
}

export async function removeAccount(userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Sign in again before removing an account." };
  const response = await fetch("/api/auth/remove", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId }),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) return { ok: false, error: payload.error || "Could not remove the account." };
  return { ok: true };
}

export async function listDirectory(): Promise<{ accounts: DirectoryAccount[]; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { accounts: [], error: SETUP };
  const { data, error } = await supabase.from("profiles").select("*").order("full_name");
  if (error) return { accounts: [], error: explain(error.message) };
  const accounts = (data || [])
    .map((row) => profileFromRow(row as Record<string, unknown>))
    .filter((row): row is SessionProfile => Boolean(row))
    .map(directoryFromProfile);
  return { accounts, error: null };
}

export async function updateAccountStatus(userId: string, status: "Active" | "Suspended"): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return SETUP;
  const { error } = await supabase.from("profiles").update({ status }).eq("id", userId);
  return error ? explain(error.message) : null;
}

export async function updateAccountProfile(input: {
  userId: string;
  fullName: string;
  phone: string;
  status: "Active" | "Suspended";
  staffTitle?: string;
  department?: string;
}): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return SETUP;
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      phone: input.phone,
      status: input.status,
      staff_title: input.staffTitle || null,
      department: input.department || null,
    })
    .eq("id", input.userId);
  return error ? explain(error.message) : null;
}

export async function saveApplicationDraft(payload: unknown): Promise<string | null> {
  const supabase = getSupabase();
  const ownerId = await currentUserId();
  if (!supabase || !ownerId) return SETUP;
  const { error } = await supabase.from("application_drafts").upsert(
    { owner_id: ownerId, payload, updated_at: new Date().toISOString() },
    { onConflict: "owner_id" }
  );
  return error ? explain(error.message) : null;
}

export async function loadMails(): Promise<{ mails: MailItem[]; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { mails: [], error: SETUP };
  const { data, error } = await supabase.from("mails").select("*").order("created_at", { ascending: false });
  if (error) return { mails: [], error: explain(error.message) };
  return { mails: (data || []).map((row) => mailFromRow(row as Record<string, unknown>)), error: null };
}

export async function saveMail(mail: MailItem): Promise<string | null> {
  const supabase = getSupabase();
  const ownerId = await currentUserId();
  if (!supabase || !ownerId) return SETUP;
  const { error } = await supabase.from("mails").insert({
    id: isUuid(mail.id) ? mail.id : crypto.randomUUID(),
    owner_id: ownerId,
    sender_name: mail.sender,
    sender_email: mail.email,
    subject: mail.subject,
    snippet: mail.snippet,
    body: mail.body,
    folder: mail.folder,
    is_read: mail.isRead,
    is_starred: mail.isStarred,
    attachment_name: mail.attachment?.name || "",
    attachment_size: mail.attachment?.size || "",
  });
  return error ? explain(error.message) : null;
}

export async function updateMail(id: string, patch: { isRead?: boolean; isStarred?: boolean; folder?: MailItem["folder"] }): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase || !isUuid(id)) return null;
  const { error } = await supabase
    .from("mails")
    .update({
      ...(patch.isRead === undefined ? {} : { is_read: patch.isRead }),
      ...(patch.isStarred === undefined ? {} : { is_starred: patch.isStarred }),
      ...(patch.folder ? { folder: patch.folder } : {}),
    })
    .eq("id", id);
  return error ? explain(error.message) : null;
}

export async function loadVouchers(): Promise<{ vouchers: VoucherItem[]; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { vouchers: [], error: SETUP };
  const { data, error } = await supabase.from("vouchers").select("*").order("purchased_at", { ascending: false });
  if (error) return { vouchers: [], error: explain(error.message) };
  return { vouchers: (data || []).map((row) => voucherFromRow(row as Record<string, unknown>)), error: null };
}

export async function saveVoucher(voucher: VoucherItem): Promise<string | null> {
  const supabase = getSupabase();
  const ownerId = await currentUserId();
  if (!supabase || !ownerId) return SETUP;
  const { error } = await supabase.from("vouchers").insert({
    owner_id: ownerId,
    code: voucher.code,
    voucher_type: voucher.type,
    amount: voucher.amount,
    status: voucher.status,
    used_by: voucher.usedBy,
  });
  return error ? explain(error.message) : null;
}

export async function loadLedger(): Promise<{ entries: CommissionLedgerItem[]; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { entries: [], error: SETUP };
  const { data, error } = await supabase.from("commission_ledger").select("*").order("created_at", { ascending: false });
  if (error) return { entries: [], error: explain(error.message) };
  return { entries: (data || []).map((row) => ledgerFromRow(row as Record<string, unknown>)), error: null };
}

export async function submitEnquiry(input: { country: string; courseType: string; intake: string }): Promise<{ trackingId: string } | { error: string }> {
  const supabase = getSupabase();
  const userId = await currentUserId();
  if (!supabase || !userId) return { error: SETUP };
  const { data, error } = await supabase
    .from("enquiries")
    .insert({ submitted_by: userId, country: input.country, course_type: input.courseType, intake: input.intake, status: "Open" })
    .select("tracking_id")
    .maybeSingle();
  if (error) return { error: explain(error.message) };
  return { trackingId: data?.tracking_id || "" };
}

export async function submitVasRequest(input: {
  serviceId: string;
  notes: string;
  camsId?: string;
  studentProfileId?: string;
}): Promise<{ ok: true } | { error: string }> {
  const supabase = getSupabase();
  const userId = await currentUserId();
  if (!supabase || !userId) return { error: SETUP };
  const row = {
    service_id: input.serviceId,
    requested_by: userId,
    student_id: isUuid(input.studentProfileId) ? input.studentProfileId : null,
    cams_id: input.camsId || null,
    notes: input.notes,
    status: "Submitted",
  };
  let result = await supabase.from("vas_requests").insert(row);
  if (result.error && /foreign key/i.test(result.error.message)) {
    result = await supabase.from("vas_requests").insert({ ...row, cams_id: null, student_id: null });
  }
  return result.error ? { error: explain(result.error.message) } : { ok: true };
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "DV";
}

export async function loadConversations(): Promise<{ conversations: ChatConversation[]; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { conversations: [], error: SETUP };
  const { data: conversations, error } = await supabase.from("chat_conversations").select("*").order("updated_at", { ascending: false });
  if (error) return { conversations: [], error: explain(error.message) };
  const ids = (conversations || []).map((row) => row.id as string);
  const messagesResult = ids.length
    ? await supabase.from("chat_messages").select("*").in("conversation_id", ids).order("created_at", { ascending: true })
    : { data: [], error: null };
  if (messagesResult.error) return { conversations: [], error: explain(messagesResult.error.message) };
  const grouped = new Map<string, ChatMessage[]>();
  for (const row of messagesResult.data || []) {
    const role = row.speaker_role === "agent" || row.speaker_role === "university" ? row.speaker_role : "support";
    const message: ChatMessage = {
      id: row.id,
      senderId: row.sender_id || "",
      senderName: row.sender_name || "",
      role,
      text: row.body || "",
      timestamp: new Date(row.created_at).toLocaleString(),
      attachment: row.attachment_path || undefined,
    };
    const list = grouped.get(row.conversation_id) || [];
    list.push(message);
    grouped.set(row.conversation_id, list);
  }
  return {
    conversations: (conversations || []).map((row) => {
      const messages = grouped.get(row.id) || [];
      const last = messages[messages.length - 1];
      return {
        id: row.id,
        participantName: row.participant_name || "Conversation",
        participantRole: row.participant_role || "",
        organization: row.organization || "",
        avatar: row.avatar || initials(row.participant_name || ""),
        unreadCount: 0,
        isOnline: false,
        lastMessage: last?.text || "",
        lastMessageTime: last?.timestamp || "",
        messages,
      };
    }),
    error: null,
  };
}

export async function startConversation(input: {
  participantName: string;
  participantRole: string;
  organization: string;
  text: string;
  senderName: string;
  speakerRole: "agent" | "support";
}): Promise<{ conversation: ChatConversation } | { error: string }> {
  const supabase = getSupabase();
  const userId = await currentUserId();
  if (!supabase || !userId) return { error: SETUP };
  const created = await supabase
    .from("chat_conversations")
    .insert({
      created_by: userId,
      participant_name: input.participantName,
      participant_role: input.participantRole,
      organization: input.organization,
      avatar: initials(input.participantName),
    })
    .select("*")
    .maybeSingle();
  if (created.error || !created.data) return { error: explain(created.error?.message) };
  const joined = await supabase.from("chat_participants").insert({ conversation_id: created.data.id, profile_id: userId, unread_count: 0 });
  if (joined.error) return { error: explain(joined.error.message) };
  const sent = await sendChatMessage({
    conversationId: created.data.id,
    text: input.text,
    senderName: input.senderName,
    speakerRole: input.speakerRole,
  });
  if ("error" in sent) return sent;
  return {
    conversation: {
      id: created.data.id,
      participantName: input.participantName,
      participantRole: input.participantRole,
      organization: input.organization,
      avatar: initials(input.participantName),
      unreadCount: 0,
      isOnline: false,
      lastMessage: input.text,
      lastMessageTime: "Just now",
      messages: [sent.message],
    },
  };
}

export async function sendChatMessage(input: {
  conversationId: string;
  text: string;
  senderName: string;
  speakerRole: "agent" | "support";
}): Promise<{ message: ChatMessage } | { error: string }> {
  const supabase = getSupabase();
  const userId = await currentUserId();
  if (!supabase || !userId) return { error: SETUP };
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: input.conversationId,
      sender_id: userId,
      sender_name: input.senderName,
      speaker_role: input.speakerRole,
      body: input.text,
    })
    .select("*")
    .maybeSingle();
  if (error || !data) return { error: explain(error?.message) };
  await supabase.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", input.conversationId);
  return {
    message: {
      id: data.id,
      senderId: userId,
      senderName: input.senderName,
      role: input.speakerRole,
      text: input.text,
      timestamp: "Just now",
    },
  };
}
