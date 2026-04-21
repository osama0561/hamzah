import { POLICY } from "./constants";
import type { DerivedBasics } from "./derived";
import type { CalculationInput, Stage1, Stage2, Stage3 } from "./types";

export function computeStage1(
  input: CalculationInput,
  derived: DerivedBasics,
): Stage1 {
  const netSalary = Number(input.netSalary) || 0;

  if (derived.isRetired || derived.yearsToRetirement === 0) {
    return {
      exists: false,
      reason: "العميل متقاعد أو في حكم المتقاعد - لا توجد مرحلة دمج.",
      mergedYears: 0,
      mergedMonths: 0,
      personalRate: 0,
      personalInstallment: 0,
      personalGrossTotal: 0,
      personalNetFinance: 0,
      personalBankProfits: 0,
      personalTotalWithProfits: 0,
      mortgageRate: 0,
      mortgageInstallment: 0,
      mortgageTotal: 0,
    };
  }

  const mergedYears = Math.min(derived.yearsToRetirement, POLICY.MAX_MERGED_YEARS);
  const mergedMonths = mergedYears * 12;

  const personalRate = derived.personalRate;
  const personalInstallment = netSalary * personalRate;
  const personalGrossTotal = personalInstallment * mergedMonths;

  const personalDiscount =
    input.personalDiscountRate !== undefined
      ? Number(input.personalDiscountRate)
      : POLICY.DEFAULT_PERSONAL_DISCOUNT;
  const personalNetFinance = personalGrossTotal * (1 - personalDiscount);
  const personalBankProfits = personalGrossTotal - personalNetFinance;

  const mortgageRate = Math.max(0, derived.mortgageCap - personalRate);
  const mortgageInstallment = netSalary * mortgageRate;
  const mortgageTotal = mortgageInstallment * mergedMonths;

  return {
    exists: mergedYears > 0,
    reason: `أقل قيمة بين السنوات المتبقية للتقاعد (${derived.yearsToRetirement}) والحد الأقصى لمرحلة الدمج (${POLICY.MAX_MERGED_YEARS})`,
    mergedYears,
    mergedMonths,
    personalRate,
    personalInstallment,
    personalGrossTotal,
    personalNetFinance,
    personalBankProfits,
    personalTotalWithProfits: personalGrossTotal,
    mortgageRate,
    mortgageInstallment,
    mortgageTotal,
  };
}

export function computeStage2(
  input: CalculationInput,
  derived: DerivedBasics,
  stage1: Stage1,
): Stage2 {
  const netSalary = Number(input.netSalary) || 0;

  if (derived.isRetired || derived.yearsToRetirement === 0) {
    return {
      exists: false,
      reason: "العميل متقاعد أو في حكم المتقاعد - لا توجد مرحلة قبل التقاعد.",
      years: 0,
      months: 0,
      rate: 0,
      installment: 0,
      total: 0,
    };
  }

  const remainingBeforeRetirement = Math.max(
    0,
    derived.yearsToRetirement - stage1.mergedYears,
  );
  const years = remainingBeforeRetirement >= 1 ? remainingBeforeRetirement : 0;
  const months = years * 12;
  const rate = derived.mortgageCap;
  const installment = netSalary * rate;
  const total = installment * months;

  return {
    exists: years > 0,
    reason:
      years > 0
        ? `سنوات متبقية قبل التقاعد بعد مرحلة الدمج = ${years} سنة`
        : "لا توجد سنة كاملة متبقية قبل التقاعد بعد مرحلة الدمج",
    years,
    months,
    rate,
    installment,
    total,
  };
}

export function computeStage3(
  derived: DerivedBasics,
  stage1: Stage1,
  stage2: Stage2,
): Stage3 {
  const usedYears = (stage1.mergedYears || 0) + (stage2.years || 0);
  const years = Math.max(0, POLICY.MAX_TOTAL_YEARS - usedYears);
  const months = years * 12;
  const rate = derived.retirementMortgageCap;
  const installment = derived.retirementSalary * rate;
  const total = installment * months;

  const exists = years > 0 && derived.retirementSalary > 0;
  const reason =
    years > 0
      ? `${POLICY.MAX_TOTAL_YEARS} − (${usedYears}) = ${years} سنة، لضمان عدم تجاوز ${POLICY.MAX_TOTAL_YEARS} سنة إجمالي.`
      : "تم استنفاد الحد الأقصى (25 سنة) في المرحلتين السابقتين";

  return {
    exists,
    reason,
    years,
    months,
    rate,
    installment,
    total,
    retirementSalary: derived.retirementSalary,
  };
}
