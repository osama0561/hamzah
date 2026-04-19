import { describe, expect, it } from "vitest";
import {
  convertYear,
  gregorianToHijriYear,
  hijriToGregorianYear,
} from "../calendar";

describe("calendar conversions (year-level)", () => {
  it("CEO's sample years map to the right Gregorian years (±1)", () => {
    // Hijri years straddle two Gregorian years, so ±1 is the correct tolerance.
    expect(hijriToGregorianYear(1397)).toBeGreaterThanOrEqual(1976);
    expect(hijriToGregorianYear(1397)).toBeLessThanOrEqual(1977);
    expect(hijriToGregorianYear(1420)).toBeGreaterThanOrEqual(1999);
    expect(hijriToGregorianYear(1420)).toBeLessThanOrEqual(2000);
    expect(hijriToGregorianYear(1447)).toBeGreaterThanOrEqual(2025);
    expect(hijriToGregorianYear(1447)).toBeLessThanOrEqual(2026);
  });

  it("round-trips within ±1 year", () => {
    for (const y of [1397, 1420, 1447, 1460]) {
      const g = hijriToGregorianYear(y);
      const back = gregorianToHijriYear(g);
      expect(Math.abs(back - y)).toBeLessThanOrEqual(1);
    }
  });

  it("is a no-op when from === to", () => {
    expect(convertYear(2025, "gregorian", "gregorian")).toBe(2025);
    expect(convertYear(1447, "hijri", "hijri")).toBe(1447);
  });
});
