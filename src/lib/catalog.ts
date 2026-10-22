import { DEFAULT_REQUIREMENTS } from "@/data/studentSeedData";
import type { CourseInfo, UniversityInfo } from "@/types";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export type CatalogStatus = "loading" | "ready" | "unconfigured" | "error";

export type CatalogWriteResult = { ok: true } | { ok: false; error: string };

export type CatalogLoadResult =
  | { ok: true; universities: UniversityInfo[]; courses: CourseInfo[] }
  | { ok: false; reason: "unconfigured" | "error"; error: string };

type InstitutionRow = {
  id: string;
  name: string;
  country: string;
  city: string;
  logo: string | null;
  image: string | null;
  website: string | null;
  about: string | null;
  intakes: string[] | null;
  representative: UniversityInfo["urmRepresentative"] | null;
};

type CourseRow = {
  id: string;
  university_id: string;
  payload: Partial<CourseInfo> | null;
};

const SETUP_HINT =
  "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local in the project root, run supabase/schema.sql in the Supabase SQL editor, then restart the dev server.";

function emptyRepresentative(id: string): UniversityInfo["urmRepresentative"] {
  return {
    id,
    name: "",
    mobile: "",
    phone: "",
    email: "",
    designation: "",
  };
}

export function withCourseCounts(universities: UniversityInfo[], courses: CourseInfo[]): UniversityInfo[] {
  return universities.map((university) => ({
    ...university,
    availableCoursesCount: courses.filter((course) => course.universityId === university.id).length,
  }));
}

function universityFromRow(row: InstitutionRow): UniversityInfo {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    city: row.city,
    logo: row.logo || "",
    image: row.image || "",
    website: row.website || "",
    about: row.about || "",
    availableCoursesCount: 0,
    availableIntakes: row.intakes || [],
    urmRepresentative: row.representative || emptyRepresentative(`rep-${row.id}`),
  };
}

function courseFromRow(row: CourseRow, universities: UniversityInfo[]): CourseInfo {
  const payload = row.payload || {};
  const university = universities.find((item) => item.id === row.university_id);
  return {
    id: row.id,
    universityId: row.university_id,
    universityName: payload.universityName || university?.name || "",
    campus: payload.campus || university?.city || "",
    city: payload.city || university?.city || "",
    country: payload.country || university?.country || "",
    courseName: payload.courseName || "Untitled course",
    studyLevel: payload.studyLevel || "Postgraduate",
    courseType: payload.courseType || "Full-Time",
    department: payload.department || "",
    subject: payload.subject || "",
    duration: payload.duration || "",
    tuitionFee: payload.tuitionFee || "",
    tuitionFeeNum: Number(payload.tuitionFeeNum) || 0,
    applicationFee: payload.applicationFee || "",
    activeIntake: payload.activeIntake || "",
    availableIntakes: payload.availableIntakes || [],
    applicationDeadline: payload.applicationDeadline || "",
    images: payload.images || [],
    badges: payload.badges || {
      scholarship: false,
      freeToApply: false,
      noAppFee: false,
      interviewRequired: false,
    },
    entryRequirements: payload.entryRequirements || { academic: "", english: "" },
    scholarshipsInfo: payload.scholarshipsInfo || "",
    additionalNotes: payload.additionalNotes || "",
    commissionRate: payload.commissionRate || "",
    requirementsConfig: payload.requirementsConfig || DEFAULT_REQUIREMENTS,
    campusesList: payload.campusesList,
    aboutUniversity: payload.aboutUniversity || university?.about || "",
  };
}

function institutionPayload(university: UniversityInfo) {
  return {
    id: university.id,
    name: university.name,
    country: university.country,
    city: university.city,
    logo: university.logo || "",
    image: university.image || "",
    website: university.website || "",
    about: university.about || "",
    intakes: university.availableIntakes || [],
    representative: university.urmRepresentative,
    updated_at: new Date().toISOString(),
  };
}

export async function loadCatalog(): Promise<CatalogLoadResult> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    return { ok: false, reason: "unconfigured", error: SETUP_HINT };
  }

  const institutions = await supabase.from("institutions").select("*").order("name");
  if (institutions.error) {
    return { ok: false, reason: "error", error: institutions.error.message };
  }

  const courseResult = await supabase.from("courses").select("*").order("created_at", { ascending: false });
  if (courseResult.error) {
    return { ok: false, reason: "error", error: courseResult.error.message };
  }

  const universities = ((institutions.data || []) as InstitutionRow[]).map(universityFromRow);
  const courses = ((courseResult.data || []) as CourseRow[]).map((row) => courseFromRow(row, universities));
  return { ok: true, universities: withCourseCounts(universities, courses), courses };
}

export async function saveInstitution(university: UniversityInfo): Promise<CatalogWriteResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: SETUP_HINT };
  const { error } = await supabase.from("institutions").upsert(institutionPayload(university));
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function removeInstitution(id: string): Promise<CatalogWriteResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: SETUP_HINT };
  const { error } = await supabase.from("institutions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function saveCourse(course: CourseInfo): Promise<CatalogWriteResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: SETUP_HINT };
  const { error } = await supabase.from("courses").upsert({
    id: course.id,
    university_id: course.universityId,
    payload: course,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function removeCourse(id: string): Promise<CatalogWriteResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: SETUP_HINT };
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
