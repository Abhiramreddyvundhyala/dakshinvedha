import { getSupabase } from "@/lib/supabase";
import { STORAGE_BUCKETS } from "@/lib/storage";

/** Turn a campus photo value into a URL an <img> can load. Empty when it is not a photo. */
export function campusPhotoUrl(value?: string | null): string {
  const raw = String(value || "").trim();
  if (!raw || raw.length > 2048 || /\s/.test(raw)) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(raw)) return raw;
  if (raw.startsWith("blob:") || raw.startsWith("/")) return raw;
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return "";

  const supabase = getSupabase();
  if (!supabase) return "";
  const path = raw.replace(/^\/+/, "").replace(/^institution-media\//, "");
  if (!path || path.includes("..")) return "";
  return supabase.storage.from(STORAGE_BUCKETS.institution).getPublicUrl(path).data.publicUrl || "";
}
