import { describe, expect, it } from "vitest";
import { calculate, defaultInput } from "../calculate";
import type { CalculationInput } from "../types";

// CEO's hand-calculated acceptance case. Hijri years throughout (1447 current);
// the engine is calendar-agnostic — year differences are what matter.
//
// NOTE: CEO's sheet uses a 17% personal-loan discount (personalDiscountRate=0.17)
// which is this one specific lender's discount. The engine's new DEFAULT is 0.30
// (prospect spec default), so this test passes the 0.17 override explicitly.
const ceoCase: CalculationInput = {
  ...defaultInput(),
  birthYear: 1397,
  hireYear: 1420,
  currentYear: 1447,
  basicSalary: 16100,
  netSalary: 15000,
  jobType: "مدني",
  employmentStatus: "active",
  personalDiscountRate: 0.17,
  conversionFactor: 2.16,
  ownerSalePrice: 0,
  financingValuation: 0,
  propertyValue: 0,
};

describe("calculate — CEO acceptance case", () => {
  const res = calculate(ceoCase);

  it("passes validation with no blocking errors", () => {
    expect(res.errors).toEqual([]);
  });

  it("computes derived fields exactly per CEO's manual sheet", () => {
    expect(res.age).toBe(50);
    expect(res.currentServiceYears).toBe(27);
    expect(res.yearsToRetirement).toBe(10);
    expect(res.totalRetirementServiceMonths).toBe(444);
    // 16100 * 444 / 480 = 14,892.5 (CEO rounds to 14,892)
    expect(res.retirementSalary).toBeCloseTo(14892.5, 5);
  });

  it("stage1 merged: 5 years at 0.32 rate -> 4,800 × 60 = 288,000 SAR", () => {
    expect(res.stage1.exists).toBe(true);
    expect(res.stage1.mergedYears).toBe(5);
    expect(res.stage1.mergedMonths).toBe(60);
    expect(res.stage1.mortgageRate).toBeCloseTo(0.32, 5);
    expect(res.stage1.mortgageInstallment).toBeCloseTo(4800, 1);
    expect(res.stage1.mortgageTotal).toBeCloseTo(288000, 1);
  });

  it("personal loan inside stage1: 4,950 × 60 gross -> 246,510 net (CEO rounded 247,000)", () => {
    expect(res.stage1.personalRate).toBeCloseTo(0.33, 5);
    expect(res.stage1.personalInstallment).toBeCloseTo(4950, 1);
    expect(res.stage1.personalGrossTotal).toBeCloseTo(297000, 1);
    // 297,000 * 0.83 = 246,510. CEO noted ≈247,000 as hand-rounded.
    expect(res.stage1.personalNetFinance).toBeCloseTo(246510, 1);
    expect(res.stage1.personalBankProfits).toBeCloseTo(50490, 1);
  });

  it("stage2 pre-retirement: 5 years at 0.65 rate -> 9,750 × 60 = 585,000 SAR", () => {
    expect(res.stage2.exists).toBe(true);
    expect(res.stage2.years).toBe(5);
    expect(res.stage2.months).toBe(60);
    expect(res.stage2.rate).toBeCloseTo(0.65, 5);
    expect(res.stage2.installment).toBeCloseTo(9750, 1);
    expect(res.stage2.total).toBeCloseTo(585000, 1);
  });

  it("stage3 post-retirement: 15 years, pension 14,892.5 × 0.55 × 180", () => {
    // CEO's sheet: 14,892 × 0.55 ≈ 8,190 × 180 = 1,474,200 (he further wrote
    // 1,472,000 — spec treats 1,474,200 as correct).
    // Precise math: 14,892.5 × 0.55 × 180 = 1,474,357.5.
    expect(res.stage3.exists).toBe(true);
    expect(res.stage3.years).toBe(15);
    expect(res.stage3.months).toBe(180);
    expect(res.stage3.rate).toBeCloseTo(0.55, 5);
    expect(res.stage3.installment).toBeCloseTo(8190.875, 3);
    expect(res.stage3.total).toBeCloseTo(1474357.5, 1);
  });

  it("totals: final financing value within 0.5% of CEO's 1,085,648", () => {
    // 288,000 + 585,000 + 1,474,357.5 = 2,347,357.5
    // / 2.16 = 1,086,739.58 — CEO wrote 1,085,648 (diff ~1,091 SAR).
    expect(res.finalMortgageInstallmentsTotal).toBeCloseTo(2347357.5, 1);
    const diff = Math.abs(res.finalFinancingAmount - 1085648);
    expect(diff).toBeLessThan(1085648 * 0.005);
    expect(res.totalDurationYears).toBe(25);
  });
});

describe("calculate — validation & edge cases", () => {
  it("rejects zero or negative salaries", () => {
    const res = calculate({ ...ceoCase, netSalary: 0, basicSalary: 0 });
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it("DIRECT_TO_RETIREMENT: no merged phase, warning raised", () => {
    // Age 59 -> 1 year remaining = 12 months <= 18
    const res = calculate({ ...ceoCase, birthYear: 1447 - 59 });
    expect(
      res.warnings.some((w) => w.includes("18 شهر")),
    ).toBe(true);
    expect(res.stage1.exists).toBe(false);
    expect(res.stage2.exists).toBe(false);
    expect(res.stage3.exists).toBe(true);
    expect(res.stage3.years).toBe(25);
  });

  it("applies low-salary ceiling (0.55) when net < 15,000", () => {
    const res = calculate({ ...ceoCase, netSalary: 14000 });
    expect(res.stage1.mortgageRate).toBeCloseTo(0.22, 5);
    expect(res.stage2.rate).toBeCloseTo(0.55, 5);
  });

  it("retired status is now supported (MVP lock removed)", () => {
    const res = calculate({ ...ceoCase, employmentStatus: "retired" });
    expect(res.isRetired).toBe(true);
    expect(res.stage1.exists).toBe(false);
    expect(res.stage3.exists).toBe(true);
  });
});
