import { getSupabase } from "@/lib/supabase";

export const STORAGE_BUCKETS = {
  student: "student-documents",
  partner: "partner-documents",
  institution: "institution-media",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

const PDF_TYPES = new Set(["application/pdf"]);
const MEDIA_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 10 * 1024 * 1024;

export const PDF_ACCEPT = "application/pdf";
export const MEDIA_ACCEPT = "application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp";

export type UploadKind = "pdf" | "media";

export function uploadKindFor(label: string): UploadKind {
  return /photo|image|logo|campus/i.test(label) ? "media" : "pdf";
}

export function acceptFor(label: string): string {
  return uploadKindFor(label) === "media" ? MEDIA_ACCEPT : PDF_ACCEPT;
}

function mimeOf(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "application/pdf";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function storedFileName(path?: string): string {
  if (!path) return "";
  const leaf = path.split("/").pop() || path;
  return leaf.replace(/^\d+-/, "");
}

export function hasStoredFile(path?: string): boolean {
  if (!path) return false;
  return path.startsWith("http://") || path.startsWith("https://") || path.includes("/");
}

function safeName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/_+/g, "_");
  return cleaned.slice(0, 80) || "file";
}

export async function uploadPortalFile(input: {
  bucket: StorageBucket;
  folder: string;
  file: File;
  kind?: UploadKind;
}): Promise<
  | { ok: true; path: string; fileName: string; fileSize: string; bucket: StorageBucket; publicUrl?: string }
  | { ok: false; error: string }
> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: "File storage is not configured." };
  const kind = input.kind || "pdf";
  const mime = mimeOf(input.file);
  const allowed = kind === "media" ? MEDIA_TYPES : PDF_TYPES;
  if (!allowed.has(mime)) {
    return {
      ok: false,
      error: kind === "media" ? "Upload a PDF, JPG, PNG, or WebP." : "Upload a PDF.",
    };
  }
  if (input.file.size <= 0 || input.file.size > MAX_BYTES) return { ok: false, error: "Each file must be 10 MB or smaller." };

  const folder = input.folder.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9/_-]+/g, "_");
  if (!folder) return { ok: false, error: "Choose where this file should be stored." };
  const path = `${folder}/${Date.now()}-${safeName(input.file.name)}`;
  const uploaded = await supabase.storage.from(input.bucket).upload(path, input.file, {
    contentType: mime,
    upsert: false,
  });
  if (uploaded.error) return { ok: false, error: uploaded.error.message };

  const publicUrl =
    input.bucket === STORAGE_BUCKETS.institution
      ? supabase.storage.from(input.bucket).getPublicUrl(path).data.publicUrl
      : undefined;
  return {
    ok: true,
    path,
    fileName: input.file.name,
    fileSize: formatFileSize(input.file.size),
    bucket: input.bucket,
    publicUrl,
  };
}

export async function uploadStudentFile(file: File, category: string) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false as const, error: "File storage is not configured." };
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  if (!userId) return { ok: false as const, error: "Sign in again before uploading a file." };
  const folder = category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "document";
  return uploadPortalFile({
    bucket: STORAGE_BUCKETS.student,
    folder: `${userId}/${folder}`,
    file,
    kind: uploadKindFor(category),
  });
}

export async function uploadForCurrentUser(file: File, folder: string) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false as const, error: "File storage is not configured." };
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  if (!userId) return { ok: false as const, error: "Sign in again before uploading a file." };
  const profile = await supabase.from("profiles").select("role,partner_id").eq("id", userId).maybeSingle();
  const role = String(profile.data?.role || "");
  const kind = uploadKindFor(folder);
  if (role === "student" || !role) {
    return uploadPortalFile({ bucket: STORAGE_BUCKETS.student, folder: `${userId}/${folder}`, file, kind });
  }
  const owner = String(profile.data?.partner_id || userId);
  return uploadPortalFile({ bucket: STORAGE_BUCKETS.partner, folder: `${owner}/${folder}`, file, kind });
}

export async function openStoredFile(
  bucket: string,
  path: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!path) return { ok: false, error: "This document has no stored file." };
  if (path.startsWith("http://") || path.startsWith("https://")) {
    window.open(path, "_blank", "noopener,noreferrer");
    return { ok: true, url: path };
  }
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: "File storage is not configured." };
  if (bucket === STORAGE_BUCKETS.institution) {
    const url = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    window.open(url, "_blank", "noopener,noreferrer");
    return { ok: true, url };
  }
  const signed = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 10);
  if (signed.error || !signed.data?.signedUrl) {
    return { ok: false, error: signed.error?.message || "Could not open this file." };
  }
  window.open(signed.data.signedUrl, "_blank", "noopener,noreferrer");
  return { ok: true, url: signed.data.signedUrl };
}
