const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/** Parses ISO dates and labels such as "29 Sep 2026". Unknown text sorts last. */
export function timeValue(value: string | undefined | null): number {
  const raw = (value || "").trim();
  if (!raw) return 0;
  const direct = Date.parse(raw);
  if (!Number.isNaN(direct)) return direct;
  const match = raw.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})/);
  if (!match) return 0;
  const month = MONTHS[match[2].slice(0, 3).toLowerCase()];
  if (month === undefined) return 0;
  return Date.UTC(Number(match[3]), month, Number(match[1]));
}

export function newestFirst<T>(items: readonly T[], dateOf: (item: T) => string | undefined): T[] {
  return [...items].sort((a, b) => timeValue(dateOf(b)) - timeValue(dateOf(a)));
}
