import { describe, expect, it } from "vitest";
import { calculate, defaultInput } from "../calculate";
import type { CalculationInput } from "../types";

// 10 unit tests from prospect spec §6. These drive the merged engine.
// All amounts in SAR. English locale for digits.

const canonical: CalculationInput = {
  ...defaultInput(),
  birthYear: 1985,
  hireYear: 2010,
  currentYear: 2026,
  basicSalary: 12000,
  netSalary: 16000,
  personalDiscountRate: 0.30,
  conversionFactor: 2.16,
  ownerSalePrice: 1_000_000,
  financingValuation: 1_150_000,
  propertyValue: 1_000_000,
  employmentStatus: "active",
};

describe("§6 Test 1 — Canonical active employee", () => {
  const r = calculate(canonical);

  it("no blocking errors", () => {
    expect(r.errors).toEqual([]);
  });

  it("derived age/service/retirement", () => {
    expect(r.age).toBe(41);
    expect(r.yearsToRetirement).toBe(19);
    expect(r.currentServiceMonths).toBe(192);
    expect(r.monthsToRetirement).toBe(228);
    expect(r.totalRetirementServiceMonths).toBe(420);
    expect(r.retirementSalary).toBeCloseTo(10_500, 5);
    expect(r.isRetired).toBe(false);
    expect(r.goesDirectToRetirement).toBe(false);
  });

  it("rates", () => {
    expect(r.personalRate).toBeCloseTo(0.33, 5);
    expect(r.mortgageCap).toBeCloseTo(0.65, 5);
    expect(r.retirementMortgageCap).toBeCloseTo(0.55, 5);
  });

  it("stage1 merged — personal loan", () => {
    expect(r.stage1.exists).toBe(true);
    expect(r.stage1.mergedYears).toBe(5);
    expect(r.stage1.personalInstallment).toBeCloseTo(5280, 1);
    expect(r.stage1.personalGrossTotal).toBeCloseTo(316_800, 1);
    expect(r.stage1.personalNetFinance).toBeCloseTo(221_760, 1);
    expect(r.stage1.personalBankProfits).toBeCloseTo(95_040, 1);
  });

  it("stage1 merged — mortgage portion", () => {
    expect(r.stage1.mortgageRate).toBeCloseTo(0.32, 5);
    expect(r.stage1.mortgageInstallment).toBeCloseTo(5120, 1);
    expect(r.stage1.mortgageTotal).toBeCloseTo(307_200, 1);
  });

  it("stage2 pre-retirement", () => {
    expect(r.stage2.exists).toBe(true);
    expect(r.stage2.years).toBe(14);
    expect(r.stage2.installment).toBeCloseTo(10_400, 1);
    expect(r.stage2.total).toBeCloseTo(1_747_200, 1);
  });

  it("stage3 post-retirement", () => {
    expect(r.stage3.exists).toBe(true);
    expect(r.stage3.years).toBe(6);
    expect(r.stage3.installment).toBeCloseTo(5775, 1);
    expect(r.stage3.total).toBeCloseTo(415_800, 1);
  });

  it("totals & final financing amount", () => {
    expect(r.finalMortgageInstallmentsTotal).toBeCloseTo(2_470_200, 1);
    expect(r.finalFinancingAmount).toBeCloseTo(1_143_611.11, 1);
    expect(r.totalDurationYears).toBe(25);
    expect(r.totalStagesCount).toBe(3);
  });
});

describe("§6 Test 2 — Already retired", () => {
  const r = calculate({
    ...defaultInput(),
    employmentStatus: "retired",
    birthYear: 1960,
    hireYear: 1985,
    currentYear: 2026,
    basicSalary: 8000,
    netSalary: 10000,
    ownerSalePrice: 500_000,
    financingValuation: 600_000,
    conversionFactor: 2.16,
  });

  it("isRetired true, stage1/2 missing, stage3 takes full 25y", () => {
    expect(r.age).toBe(66);
    expect(r.isRetired).toBe(true);
    expect(r.yearsToRetirement).toBe(0);
    expect(r.stage1.exists).toBe(false);
    expect(r.stage2.exists).toBe(false);
    expect(r.stage3.exists).toBe(true);
    expect(r.stage3.years).toBe(25);
  });

  it("retirement salary from current service only", () => {
    // currentServiceYears = 41 -> months 492, monthsToRetirement = 0
    // retirementSalary = 8000 × 492 / 480 = 8,200
    expect(r.retirementSalary).toBeCloseTo(8200, 5);
    expect(r.retirementMortgageCap).toBeCloseTo(0.55, 5);
    expect(r.stage3.installment).toBeCloseTo(8200 * 0.55, 1);
  });
});

describe("§6 Test 3 — Direct-to-retirement (≤18 months)", () => {
  const r = calculate({
    ...defaultInput(),
    employmentStatus: "active",
    birthYear: 1967, // age 59 in 2026
    hireYear: 1990,
    currentYear: 2026,
    basicSalary: 12000,
    netSalary: 16000,
  });

  it("flags direct path and skips stages 1 & 2", () => {
    expect(r.age).toBe(59);
    expect(r.yearsToRetirement).toBe(1);
    expect(r.monthsToRetirement).toBe(12);
    expect(r.goesDirectToRetirement).toBe(true);
    expect(r.isRetired).toBe(true);
    expect(r.stage1.exists).toBe(false);
    expect(r.stage2.exists).toBe(false);
    expect(r.stage3.exists).toBe(true);
    expect(
      r.warnings.some((w) => w.includes("18 شهر")),
    ).toBe(true);
  });
});

describe("§6 Test 4 — Low salary (< 15,000)", () => {
  const r = calculate({
    ...canonical,
    netSalary: 10000,
    basicSalary: 8000,
  });

  it("uses low-salary cap 0.55", () => {
    expect(r.mortgageCap).toBeCloseTo(0.55, 5);
    expect(r.stage1.mortgageRate).toBeCloseTo(0.22, 5);
    expect(r.stage1.mortgageInstallment).toBeCloseTo(2200, 1);
  });
});

describe("§6 Test 5 — Suspension fully covered", () => {
  const r = calculate({
    ...canonical,
    ownerSalePrice: 800_000,
    financingValuation: 1_000_000,
    hasSuspension: true,
    suspensions: [
      {
        id: "1",
        actualAmount: 100_000,
        bondAmount: 100_000,
        beneficiary: "X",
        reason: "Y",
      },
    ],
  });

  it("covers actual and with-profit", () => {
    expect(r.displaySurplus).toBeCloseTo(200_000, 1);
    expect(r.suspensionsActualTotal).toBeCloseTo(100_000, 1);
    expect(r.suspensionPayoffProfit).toBeCloseTo(25_000, 1);
    expect(r.suspensionTotalRequirement).toBeCloseTo(125_000, 1);
    expect(r.coversActual).toBe(true);
    expect(r.coversWithProfit).toBe(true);
    expect(r.remainingAfterSuspension).toBeCloseTo(75_000, 1);
    expect(r.shortfallActual).toBe(0);
    expect(r.shortfallWithProfit).toBe(0);
  });
});

describe("§6 Test 6 — Suspension uncovered", () => {
  const r = calculate({
    ...canonical,
    ownerSalePrice: 1_000_000,
    financingValuation: 1_050_000,
    hasSuspension: true,
    suspensions: [
      {
        id: "1",
        actualAmount: 200_000,
        bondAmount: 200_000,
        beneficiary: "X",
        reason: "Y",
      },
    ],
  });

  it("shortfall computed for both actual and with-profit", () => {
    expect(r.displaySurplus).toBeCloseTo(50_000, 1);
    expect(r.suspensionsActualTotal).toBeCloseTo(200_000, 1);
    expect(r.coversActual).toBe(false);
    expect(r.coversWithProfit).toBe(false);
    expect(r.shortfallActual).toBeCloseTo(150_000, 1);
    expect(r.shortfallWithProfit).toBeCloseTo(200_000, 1);
    expect(
      r.warnings.some((w) => w.includes("فائض الشيك لا يغطي")),
    ).toBe(true);
  });
});

describe("§6 Test 7 — Valuation deficit", () => {
  const r = calculate({
    ...canonical,
    ownerSalePrice: 1_000_000,
    financingValuation: 900_000,
  });

  it("marks deficit, surplus zeroed", () => {
    expect(r.theoreticalSurplus).toBeCloseTo(-100_000, 1);
    expect(r.hasDeficit).toBe(true);
    expect(r.displaySurplus).toBe(0);
    expect(r.usableSurplus).toBe(0);
    expect(
      r.warnings.some((w) => w.includes("لا يوجد فائض")),
    ).toBe(true);
  });
});

describe("§6 Test 8 — Merging consumes all pre-retirement years", () => {
  const r = calculate({
    ...canonical,
    birthYear: 2026 - 57, // age 57 -> yearsToRetirement 3
    hireYear: 2010,
    currentYear: 2026,
  });

  it("stage1 = 3y, stage2 empty", () => {
    expect(r.yearsToRetirement).toBe(3);
    expect(r.stage1.mergedYears).toBe(3);
    expect(r.stage2.years).toBe(0);
    expect(r.stage2.exists).toBe(false);
    expect(
      r.notes.some((n) =>
        n.includes("مرحلة الدمج استوعبت المدة"),
      ),
    ).toBe(true);
  });
});

describe("§6 Test 9 — Validation errors", () => {
  const r = calculate({
    ...defaultInput(),
    basicSalary: 0,
    netSalary: 0,
    birthYear: 2030,
    hireYear: 2030,
    currentYear: 2026,
    conversionFactor: 0,
  });

  it("lists all four expected errors", () => {
    const joined = r.errors.join(" | ");
    expect(joined).toContain("الراتب الأساسي مطلوب");
    expect(joined).toContain("الراتب الصافي مطلوب");
    expect(joined).toContain("سنة الميلاد يجب أن تسبق السنة الحالية");
    expect(joined).toContain("معامل التحويل يجب أن يكون أكبر من صفر");
  });
});

describe("§6 Test 10 — 25-year cap hit in stages 1+2", () => {
  // Design: yearsToRetirement = 30 is impossible (cap 60-age<=60),
  // but we can force usedYears = 25 via a very young customer.
  // age 25, yearsToRetirement=35, mergedYears=5, stage2=max(1..) → still yearsToRet-5=30.
  // The engine does NOT cap stage2 to (MAX_TOTAL_YEARS-mergedYears); it caps stage2
  // at yearsToRet - mergedYears. So stage2 can grow beyond 20 → stage3 empties naturally.
  // For the exact §6 Test 10 shape: stage1=5, stage2=20 -> stage3=0.
  // age 35 -> yearsToRet=25 -> stage2 = 25-5 = 20 -> stage3 = max(0, 25-25) = 0.
  const r = calculate({
    ...canonical,
    birthYear: 1991, // age 35 in 2026
  });

  it("stage3 collapses to 0", () => {
    expect(r.yearsToRetirement).toBe(25);
    expect(r.stage1.mergedYears).toBe(5);
    expect(r.stage2.years).toBe(20);
    expect(r.stage3.years).toBe(0);
    expect(r.stage3.exists).toBe(false);
    expect(r.stage3.reason).toContain("استنفاد");
  });
});
