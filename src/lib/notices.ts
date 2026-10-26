import { NoticeItem } from "@/types";

export type NoticeAudience = "all" | "students" | "partners" | "agents";

export const NOTICE_AUDIENCES: { value: NoticeAudience; label: string }[] = [
  { value: "all", label: "All users" },
  { value: "students", label: "Students" },
  { value: "partners", label: "B2B partners" },
  { value: "agents", label: "Agents" },
];

export function noticeAudience(value: string | undefined): NoticeAudience {
  if (value === "students" || value === "partners" || value === "agents" || value === "all") return value;
  return "all";
}

export function noticeVisibleTo(notice: NoticeItem, role: string): boolean {
  const audience = noticeAudience(notice.audience);
  if (audience === "all") return true;
  if (audience === "students") return role === "student";
  if (audience === "partners") return role === "partner" || role === "team";
  if (audience === "agents") return role === "agent";
  return false;
}

export function audienceLabel(value: string | undefined): string {
  return NOTICE_AUDIENCES.find((item) => item.value === noticeAudience(value))?.label || "All users";
}
