import { describe, expect, it } from "vitest";
import { calculate } from "../calculate";
import type { CalculationInput } from "../types";

// CEO's hand-calculated acceptance case.
// Hijri years used throughout (1447 current); the engine is calendar-agnostic.
const ceoCase: CalculationInput = {
  birthYear: 1397,
  hireYear: 1420,
  currentYear: 1447,
  basicSalary: 16100,
  netSalary: 15000,
  employmentType: "civilian",
  status: "active",
  conversionFactor: 2.16,
};

describe("calculate — CEO acceptance case", () => {
  const res = calculate(ceoCase);

  it("passes validation with no errors", () => {
    expect(res.validation.ok).toBe(true);
    expect(res.validation.errors).toEqual([]);
  });

  it("computes derived fields exactly per CEO's manual sheet", () => {
    expect(res.derived.age).toBe(50);
    expect(res.derived.currentServiceYears).toBe(27);
    expect(res.derived.remainingYearsToRetirement).toBe(10);
    expect(res.derived.totalServiceMonthsAtRetirement).toBe(444);
    // 16100 * 444 / 480 = 14,892.5 (CEO rounds to 14,892)
    expect(res.derived.estimatedPensionSalary).toBeCloseTo(14892.5, 5);
  });

  it("merged phase: 5 years at 0.32 rate -> 4,800 × 60 = 288,000 SAR", () => {
    expect(res.phases.merged.exists).toBe(true);
    expect(res.phases.merged.years).toBe(5);
    expect(res.phases.merged.months).toBe(60);
    expect(res.phases.merged.deductionRate).toBeCloseTo(0.32, 5);
    expect(res.phases.merged.installment).toBeCloseTo(4800, 1);
    expect(res.phases.merged.totalInstallments).toBeCloseTo(288000, 1);
  });

  it("personal loan: 4,950 × 60 gross -> 246,510 net (CEO rounded 247,000)", () => {
    expect(res.personal.deductionRate).toBeCloseTo(0.33, 5);
    expect(res.personal.installment).toBeCloseTo(4950, 1);
    expect(res.personal.grossTotal).toBeCloseTo(297000, 1);
    // 297,000 * 0.83 = 246,510. CEO noted ≈247,000 as hand-rounded.
    expect(res.personal.netToCustomer).toBeCloseTo(246510, 1);
    expect(res.personal.bankProfit).toBeCloseTo(50490, 1);
  });

  it("pre-retirement phase: 5 years at 0.65 rate -> 9,750 × 60 = 585,000 SAR", () => {
    expect(res.phases.preRetirement.exists).toBe(true);
    expect(res.phases.preRetirement.years).toBe(5);
    expect(res.phases.preRetirement.months).toBe(60);
    expect(res.phases.preRetirement.deductionRate).toBeCloseTo(0.65, 5);
    expect(res.phases.preRetirement.installment).toBeCloseTo(9750, 1);
    expect(res.phases.preRetirement.totalInstallments).toBeCloseTo(585000, 1);
  });

  it("post-retirement phase: 15 years, pension 14,892.5 × 0.55 × 180", () => {
    // CEO's sheet: 14,892 × 0.55 ≈ 8,190 × 180 = 1,474,200 (he further wrote
    // 1,472,000 in the sheet — spec treats 1,474,200 as correct).
    // Our precise math: 14,892.5 × 0.55 × 180 = 1,474,357.5.
    // We assert the precise value; CEO's rounded figure is within ~160 SAR.
    expect(res.phases.postRetirement.exists).toBe(true);
    expect(res.phases.postRetirement.years).toBe(15);
    expect(res.phases.postRetirement.months).toBe(180);
    expect(res.phases.postRetirement.deductionRate).toBeCloseTo(0.55, 5);
    expect(res.phases.postRetirement.installment).toBeCloseTo(8190.875, 3);
    expect(res.phases.postRetirement.totalInstallments).toBeCloseTo(
      1474357.5,
      1,
    );
  });

  it("totals: final financing value within 0.5% of CEO's 1,085,648", () => {
    // 288,000 + 585,000 + 1,474,357.5 = 2,347,357.5
    // / 2.16 = 1,086,739.58
    // CEO wrote 1,085,648 — diff ~1,091 SAR, within 0.5% tolerance (~5,428).
    expect(res.totals.totalRealEstateInstallments).toBeCloseTo(2347357.5, 1);
    const diff = Math.abs(res.totals.finalFinancingValue - 1085648);
    expect(diff).toBeLessThan(1085648 * 0.005);
    expect(res.totals.totalMonths).toBe(300);
    expect(res.totals.totalYears).toBe(25);
  });

  it("produces at least 5 Arabic explanation lines", () => {
    expect(res.explanations.length).toBeGreaterThanOrEqual(5);
    expect(res.explanations.join(" ")).toMatch(/\u0600-\u06FF|سنة|ريال/);
  });
});

describe("calculate — validation & edge cases", () => {
  it("rejects retired status", () => {
    const res = calculate({ ...ceoCase, status: "retired" });
    expect(res.validation.ok).toBe(false);
    expect(res.validation.errors.join(" ")).toMatch(/المتقاعد/);
  });

  it("rejects zero or negative salaries", () => {
    const res = calculate({ ...ceoCase, netSalary: 0 });
    expect(res.validation.ok).toBe(false);
  });

  it("DIRECT_TO_RETIREMENT: no merged phase, personal at 25% over remaining months", () => {
    // Age 59 -> 1 year remaining = 12 months <= 18
    const res = calculate({ ...ceoCase, birthYear: 1447 - 59 });
    expect(res.validation.warnings.join(" ")).toMatch(/حافة/);
    expect(res.phases.merged.exists).toBe(false);
    // Personal must be 25% × 12 months, per policy: "يحسب له شخصي باستقطاع 25% شخصي".
    expect(res.personal.deductionRate).toBeCloseTo(0.25, 5);
    expect(res.personal.installment).toBeCloseTo(15000 * 0.25, 1);
    expect(res.personal.grossTotal).toBeCloseTo(15000 * 0.25 * 12, 1);
    // Post-retirement takes the full 25-year cap since merged + pre = 0.
    expect(res.phases.postRetirement.years).toBe(25);
    expect(res.phases.postRetirement.months).toBe(300);
  });

  it("applies low-salary ceiling (0.55) when net < 15,000", () => {
    const res = calculate({ ...ceoCase, netSalary: 14000 });
    // merged real-estate rate = 0.55 - 0.33 = 0.22
    expect(res.phases.merged.deductionRate).toBeCloseTo(0.22, 5);
    expect(res.phases.preRetirement.deductionRate).toBeCloseTo(0.55, 5);
  });
});
