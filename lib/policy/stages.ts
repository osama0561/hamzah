import { POLICY } from "./constants";
import {
  computeDerived,
  personalDeductionRateFor,
  realEstateCeilingFor,
} from "./derived";
import type {
  CalculationInput,
  PersonalLoanBreakdown,
  PhaseResult,
} from "./types";

export type RoutingPath = "MERGED_FIRST" | "DIRECT_TO_RETIREMENT";

export function routingPath(
  remainingMonthsToRetirement: number,
): RoutingPath {
  return remainingMonthsToRetirement <= POLICY.DIRECT_RETIREMENT_THRESHOLD_MONTHS
    ? "DIRECT_TO_RETIREMENT"
    : "MERGED_FIRST";
}

export function mergedPhase(input: CalculationInput): {
  phase: PhaseResult;
  personalRate: number;
  realEstateCeiling: number;
  realEstateRateDuringMerge: number;
  personalMonths: number;
} {
  const { remainingYearsToRetirement, remainingMonthsToRetirement } =
    computeDerived(input);
  const realEstateCeiling = realEstateCeilingFor(input.netSalary);

  const exists =
    remainingMonthsToRetirement > POLICY.DIRECT_RETIREMENT_THRESHOLD_MONTHS;
  if (!exists) {
    // Direct-to-retirement path: no merged real-estate phase, and personal
    // loan is computed at the retired rate (25%) over whatever remains until
    // retirement — per spec: "يحسب له شخصي باستقطاع 25% شخصي".
    return {
      phase: {
        exists: false,
        months: 0,
        years: 0,
        totalInstallments: 0,
        reason:
          "لا توجد مرحلة دمج — المتبقي للتقاعد 18 شهرًا أو أقل، ينتقل العميل مباشرة لمرحلة التقاعد ويُحسب الشخصي باستقطاع 25٪.",
      },
      personalRate: POLICY.PERSONAL_DEDUCTION_RATE_RETIRED,
      realEstateCeiling,
      realEstateRateDuringMerge: 0,
      personalMonths: remainingMonthsToRetirement,
    };
  }

  const personalRate = personalDeductionRateFor(input.status);
  const mergedYears = Math.min(
    remainingYearsToRetirement,
    POLICY.MAX_MERGED_YEARS,
  );
  const mergedMonths = mergedYears * 12;
  const realEstateRateDuringMerge = Math.max(
    0,
    realEstateCeiling - personalRate,
  );
  const installment = input.netSalary * realEstateRateDuringMerge;
  const total = installment * mergedMonths;

  return {
    phase: {
      exists: true,
      months: mergedMonths,
      years: mergedYears,
      deductionRate: realEstateRateDuringMerge,
      installment,
      totalInstallments: total,
      reason: `مدة الدمج ${mergedYears} سنة (الحد الأدنى بين المتبقي للتقاعد ${remainingYearsToRetirement} سنة والسقف ${POLICY.MAX_MERGED_YEARS} سنوات).`,
    },
    personalRate,
    realEstateCeiling,
    realEstateRateDuringMerge,
    personalMonths: mergedMonths,
  };
}

export function personalLoan(
  input: CalculationInput,
  personalRate: number,
  mergedMonths: number,
): PersonalLoanBreakdown {
  const installment = input.netSalary * personalRate;
  const grossTotal = installment * mergedMonths;
  const netToCustomer = grossTotal * (1 - POLICY.PERSONAL_DISCOUNT_RATE);
  const bankProfit = grossTotal - netToCustomer;
  return {
    deductionRate: personalRate,
    installment,
    grossTotal,
    netToCustomer,
    bankProfit,
  };
}

export function preRetirementPhase(
  input: CalculationInput,
  mergedYears: number,
  realEstateCeiling: number,
  mergedExists: boolean,
): PhaseResult {
  const { remainingYearsToRetirement } = computeDerived(input);
  const remainingAfterMerge = remainingYearsToRetirement - mergedYears;

  // Direct-to-retirement path: spec says the customer goes straight to
  // post-retirement — no interim phase.
  if (!mergedExists) {
    return {
      exists: false,
      months: 0,
      years: 0,
      totalInstallments: 0,
      reason:
        "لا توجد مرحلة ثانية — المسار المباشر للتقاعد يتجاوز المرحلة الثانية.",
    };
  }

  if (remainingAfterMerge < 1) {
    return {
      exists: false,
      months: 0,
      years: 0,
      totalInstallments: 0,
      reason:
        "لا توجد مرحلة ثانية — المتبقي بعد الدمج أقل من سنة، يتحول العميل مباشرة لمرحلة التقاعد.",
    };
  }

  const months = remainingAfterMerge * 12;
  const installment = input.netSalary * realEstateCeiling;
  const total = installment * months;

  return {
    exists: true,
    months,
    years: remainingAfterMerge,
    deductionRate: realEstateCeiling,
    installment,
    totalInstallments: total,
    reason: `المرحلة الثانية ${remainingAfterMerge} سنة (المتبقي للتقاعد ${remainingYearsToRetirement} سنة مطروحًا منه مدة الدمج ${mergedYears} سنة).`,
  };
}

export function postRetirementPhase(
  input: CalculationInput,
  mergedYears: number,
  preRetirementYears: number,
): PhaseResult {
  const { estimatedPensionSalary } = computeDerived(input);
  const postRetirementYears = Math.max(
    0,
    POLICY.MAX_TOTAL_YEARS - mergedYears - preRetirementYears,
  );
  const months = postRetirementYears * 12;

  if (postRetirementYears === 0) {
    return {
      exists: false,
      months: 0,
      years: 0,
      totalInstallments: 0,
      reason:
        "لا توجد مرحلة تقاعد — تم استهلاك السقف الكلي 25 سنة قبل التقاعد.",
    };
  }

  const pensionRate = realEstateCeilingFor(estimatedPensionSalary);
  const installment = estimatedPensionSalary * pensionRate;
  const total = installment * months;

  return {
    exists: true,
    months,
    years: postRetirementYears,
    deductionRate: pensionRate,
    installment,
    totalInstallments: total,
    reason: `مدة التقاعد ${postRetirementYears} سنة (السقف الكلي ${POLICY.MAX_TOTAL_YEARS} سنة مطروحًا منه مدة الدمج ${mergedYears} ومدة ما قبل التقاعد ${preRetirementYears}).`,
  };
}
