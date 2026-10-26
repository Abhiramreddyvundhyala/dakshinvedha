import type { StudentProfile } from "@/types";

/** Real profile completion. Empty profiles score 0. */
export function computeProfileCompletion(student: Partial<StudentProfile>): number {
  let score = 0;
  if (student.name && student.email) score += 10;
  if (student.personal?.dob && student.personal?.address?.city) score += 15;
  if (student.passport?.passportNumber || student.passport?.hasPassport === "NO") score += 15;
  if (student.education && student.education.length > 0) score += 20;
  if (student.standardizedTests && student.standardizedTests.length > 0) score += 10;
  else if (student.testsStatus === "NO") score += 10;
  if (student.studyPreferences?.preferredCountries && student.studyPreferences.preferredCountries.length > 0) score += 10;
  const storedDocs = student.documents?.filter((doc) => doc.storagePath || doc.fileName) || [];
  if (storedDocs.length > 0) score += 20;
  return Math.min(score, 100);
}
