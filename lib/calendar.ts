// Year-level conversion between Hijri (Umm al-Qura style) and Gregorian.
// Accurate to ±1 year — enough for age / service-year calculations that
// operate on differences of years, not exact dates.

export type Calendar = "hijri" | "gregorian";

const H_TO_G_SLOPE = 0.970224;
const H_TO_G_OFFSET = 621.5774;

export function hijriToGregorianYear(h: number): number {
  return Math.round(h * H_TO_G_SLOPE + H_TO_G_OFFSET);
}

export function gregorianToHijriYear(g: number): number {
  return Math.round((g - H_TO_G_OFFSET) / H_TO_G_SLOPE);
}

export function convertYear(year: number, from: Calendar, to: Calendar): number {
  if (from === to) return year;
  return from === "hijri"
    ? hijriToGregorianYear(year)
    : gregorianToHijriYear(year);
}
