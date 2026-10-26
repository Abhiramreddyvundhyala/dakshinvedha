/** Fee and intake ranges derived from real courses. Empty data stays empty. */

export type FeeSource = {
  tuitionFee?: string;
  tuitionFeeNum?: number;
};

export type IntakeSource = {
  activeIntake?: string;
  availableIntakes?: string[];
};

export type ScholarshipSource = {
  badges?: { scholarship?: boolean };
  scholarshipsInfo?: string;
};

export type FeeBucket = {
  id: string;
  label: string;
  min: number;
  max: number;
};

const MONTHS = [
  ["january", "jan"],
  ["february", "feb"],
  ["march", "mar"],
  ["april", "apr"],
  ["may"],
  ["june", "jun"],
  ["july", "jul"],
  ["august", "aug"],
  ["september", "sep", "sept"],
  ["october", "oct"],
  ["november", "nov"],
  ["december", "dec"],
];

export function feeNumber(course: FeeSource): number {
  if (typeof course.tuitionFeeNum === "number" && course.tuitionFeeNum > 0) {
    return course.tuitionFeeNum;
  }
  const match = (course.tuitionFee || "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  const parsed = match ? Number(match[1]) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function currencyMark(courses: FeeSource[]): string {
  const blob = courses.map((course) => course.tuitionFee || "").join(" ");
  if (blob.includes("₹")) return "₹";
  if (blob.includes("€")) return "€";
  if (blob.includes("$")) return "$";
  return "£";
}

export function formatFee(amount: number, mark: string): string {
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return `${mark}${Math.round(amount).toLocaleString("en-GB")}`;
}

export function money(amount: number, mark = "£"): string {
  if (!Number.isFinite(amount) || amount <= 0) return `${mark}0`;
  return formatFee(amount, mark);
}

export type FeeSort = "low" | "high";

/** Courses with no fee sort last in both directions. */
export function compareByFee(left: FeeSource, right: FeeSource, direction: FeeSort): number {
  const a = feeNumber(left);
  const b = feeNumber(right);
  const safeA = a > 0 ? a : direction === "low" ? Number.POSITIVE_INFINITY : -1;
  const safeB = b > 0 ? b : direction === "low" ? Number.POSITIVE_INFINITY : -1;
  return direction === "low" ? safeA - safeB : safeB - safeA;
}

export function extremeFee(courses: FeeSource[], direction: FeeSort): number {
  const fees = courses.map(feeNumber).filter((fee) => fee > 0);
  if (!fees.length) return direction === "low" ? Number.POSITIVE_INFINITY : -1;
  return direction === "low" ? Math.min(...fees) : Math.max(...fees);
}

export function feeBounds(courses: FeeSource[]): string {
  const fees = courses.map(feeNumber).filter((fee) => fee > 0);
  if (fees.length === 0) return "Fee not set";
  const mark = currencyMark(courses);
  const min = Math.min(...fees);
  const max = Math.max(...fees);
  if (min === max) return formatFee(min, mark);
  return `${formatFee(min, mark)} – ${formatFee(max, mark)}`;
}

export function feeBuckets(courses: FeeSource[]): FeeBucket[] {
  const fees = [...new Set(courses.map(feeNumber).filter((fee) => fee > 0))].sort((a, b) => a - b);
  if (fees.length === 0) return [];
  const mark = currencyMark(courses);
  if (fees.length <= 4) {
    return fees.map((fee) => ({
      id: String(fee),
      label: formatFee(fee, mark),
      min: fee,
      max: fee,
    }));
  }
  const size = Math.ceil(fees.length / 3);
  return [fees.slice(0, size), fees.slice(size, size * 2), fees.slice(size * 2)]
    .filter((group) => group.length > 0)
    .map((group) => {
      const min = group[0];
      const max = group[group.length - 1];
      return {
        id: `${min}-${max}`,
        label: min === max ? formatFee(min, mark) : `${formatFee(min, mark)} – ${formatFee(max, mark)}`,
        min,
        max,
      };
    });
}

export function feeInBucket(course: FeeSource, bucket: FeeBucket): boolean {
  const fee = feeNumber(course);
  return fee > 0 && fee >= bucket.min && fee <= bucket.max;
}

export function courseIntakes(course: IntakeSource): string[] {
  const raw = [...(course.availableIntakes || []), course.activeIntake || ""];
  const seen = new Set<string>();
  const intakes: string[] = [];
  raw.forEach((value) => {
    const label = value.trim();
    const key = label.toLowerCase();
    if (!label || seen.has(key)) return;
    seen.add(key);
    intakes.push(label);
  });
  return intakes;
}

export function intakeSortKey(label: string): number {
  const tokens = label.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const yearToken = tokens.find((token) => /^20\d{2}$/.test(token));
  const year = yearToken ? Number(yearToken) : 9999;
  let month = 6;
  for (let index = 0; index < MONTHS.length; index += 1) {
    if (MONTHS[index].some((name) => tokens.includes(name))) {
      month = index;
      break;
    }
  }
  return year * 12 + month;
}

export function intakeOptions(courses: IntakeSource[]): string[] {
  const seen = new Set<string>();
  const intakes: string[] = [];
  courses.forEach((course) => {
    courseIntakes(course).forEach((label) => {
      const key = label.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      intakes.push(label);
    });
  });
  return intakes.sort((a, b) => intakeSortKey(a) - intakeSortKey(b));
}

export function intakeBounds(courses: IntakeSource[]): string {
  const intakes = intakeOptions(courses);
  if (intakes.length === 0) return "Intake not set";
  if (intakes.length === 1) return intakes[0];
  return `${intakes[0]} – ${intakes[intakes.length - 1]}`;
}

export function hasScholarship(course: ScholarshipSource): boolean {
  return Boolean(course.badges?.scholarship) || Boolean((course.scholarshipsInfo || "").trim());
}

export function collegeHasScholarship(courses: ScholarshipSource[]): boolean {
  return courses.some(hasScholarship);
}
