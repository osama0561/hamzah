import { POLICY } from "./constants";
import { computeDerived } from "./derived";
import {
  computeStage1,
  computeStage2,
  computeStage3,
} from "./stages";
import { aggregateCommitments } from "./commitments";
import {
  aggregateSuspensions,
  computeCoverage,
} from "./suspensions";
import { computeSurplus } from "./surplus";
import type { CalculationInput, CalculationResult } from "./types";

function validate(input: CalculationInput): {
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const currentYear =
    Number(input.currentYear) || new Date().getFullYear();
  const birthYear = Number(input.birthYear) || 0;
  const hireYear = Number(input.hireYear) || 0;
  const basicSalary = Number(input.basicSalary) || 0;
  const netSalary = Number(input.netSalary) || 0;
  const conversionFactor = Number(input.conversionFactor) || 0;

  if (basicSalary <= 0)
    errors.push("الراتب الأساسي مطلوب وأكبر من صفر.");
  if (netSalary <= 0) errors.push("الراتب الصافي مطلوب وأكبر من صفر.");
  if (birthYear > 0 && birthYear >= currentYear)
    errors.push("سنة الميلاد يجب أن تسبق السنة الحالية.");
  if (hireYear > 0 && hireYear > currentYear)
    errors.push("سنة التعيين لا يمكن أن تكون في المستقبل.");
  if (conversionFactor <= 0)
    errors.push("معامل التحويل يجب أن يكون أكبر من صفر.");

  if (
    hireYear > 0 &&
    birthYear > 0 &&
    hireYear - birthYear < 18
  ) {
    warnings.push("فارق غير منطقي بين الميلاد والتعيين (<18 سنة).");
  }

  if (
    basicSalary > 0 &&
    netSalary > 0 &&
    netSalary > basicSalary * 3
  ) {
    warnings.push("صافي الراتب يبدو أكبر من ثلاثة أضعاف الأساسي — يرجى التحقق.");
  }

  return { errors, warnings };
}

export function calculate(input: CalculationInput): CalculationResult {
  const { errors, warnings } = validate(input);
  const notes: string[] = [];

  const derived = computeDerived(input);

  const stage1 = computeStage1(input, derived);
  const stage2 = computeStage2(input, derived, stage1);
  const stage3 = computeStage3(derived, stage1, stage2);

  const finalMortgageInstallmentsTotal =
    (stage1.mortgageTotal || 0) +
    (stage2.total || 0) +
    (stage3.total || 0);

  const conversionFactor =
    Number(input.conversionFactor) || POLICY.DEFAULT_CONVERSION_FACTOR;
  const finalFinancingAmount =
    conversionFactor > 0
      ? finalMortgageInstallmentsTotal / conversionFactor
      : 0;

  const totalDurationYears =
    (stage1.mergedYears || 0) + (stage2.years || 0) + (stage3.years || 0);
  const totalStagesCount =
    (stage1.exists ? 1 : 0) +
    (stage2.exists ? 1 : 0) +
    (stage3.exists ? 1 : 0);

  const { commitmentsTotal, commitmentsCount } = aggregateCommitments(
    input.commitments,
  );

  const suspensionsAgg = aggregateSuspensions(
    !!input.hasSuspension,
    input.suspensions,
  );

  const surplus = computeSurplus(input, finalFinancingAmount);
  const coverage = computeCoverage(surplus.displaySurplus, suspensionsAgg);

  // Notes
  if (stage1.exists)
    notes.push("مرحلة الدمج مفعّلة: تمويل شخصي + عقاري سوياً.");
  if (!stage2.exists && !derived.isRetired && derived.yearsToRetirement > 0)
    notes.push(
      "لا توجد مرحلة عقاري منفرد قبل التقاعد - مرحلة الدمج استوعبت المدة.",
    );
  if (stage3.exists)
    notes.push(
      `مرحلة التقاعد: ${stage3.years} سنة بقسط شهري ${Math.round(stage3.installment).toLocaleString("en-US")} ر.س.`,
    );
  if (commitmentsCount > 0)
    notes.push(
      `يوجد ${commitmentsCount} التزام بإجمالي ${Math.round(commitmentsTotal).toLocaleString("en-US")} ر.س.`,
    );

  // Warnings
  if (derived.goesDirectToRetirement)
    warnings.push(
      "المدة المتبقية للتقاعد ≤ 18 شهر - تحويل مباشر لمرحلة التقاعد.",
    );
  if (surplus.hasDeficit)
    warnings.push("التقييم أقل من سعر بيع المالك - لا يوجد فائض.");
  if (suspensionsAgg.hasSuspension && !coverage.coversWithProfit)
    warnings.push(
      `فائض الشيك لا يغطي الإيقافات + 25% فائدة - العجز: ${Math.round(coverage.shortfallWithProfit).toLocaleString("en-US")} ر.س.`,
    );

  return {
    inputs: input,

    errors,
    warnings,
    notes,

    age: derived.age,
    currentServiceYears: derived.currentServiceYears,
    currentServiceMonths: derived.currentServiceMonths,
    yearsToRetirement: derived.yearsToRetirement,
    monthsToRetirement: derived.monthsToRetirement,
    totalRetirementServiceMonths: derived.totalRetirementServiceMonths,

    retirementSalary: derived.retirementSalary,
    isRetired: derived.isRetired,
    goesDirectToRetirement: derived.goesDirectToRetirement,
    personalRate: derived.personalRate,
    mortgageCap: derived.mortgageCap,
    retirementMortgageCap: derived.retirementMortgageCap,

    stage1,
    stage2,
    stage3,

    finalMortgageInstallmentsTotal,
    conversionFactor,
    finalFinancingAmount,
    totalDurationYears,
    totalStagesCount,

    commitmentsTotal,
    commitmentsCount,

    hasSuspension: suspensionsAgg.hasSuspension,
    suspensionsActualTotal: suspensionsAgg.suspensionsActualTotal,
    suspensionsBondsTotal: suspensionsAgg.suspensionsBondsTotal,
    suspensionPayoffProfit: suspensionsAgg.suspensionPayoffProfit,
    suspensionTotalRequirement: suspensionsAgg.suspensionTotalRequirement,

    ownerSalePrice: surplus.ownerSalePrice,
    financingValuation: surplus.financingValuation,
    propertyValue: surplus.propertyValue,
    theoreticalSurplus: surplus.theoreticalSurplus,
    hasDeficit: surplus.hasDeficit,
    displaySurplus: surplus.displaySurplus,
    usableSurplus: surplus.usableSurplus,

    coversActual: coverage.coversActual,
    coversWithProfit: coverage.coversWithProfit,
    remainingAfterSuspension: coverage.remainingAfterSuspension,
    shortfallActual: coverage.shortfallActual,
    shortfallWithProfit: coverage.shortfallWithProfit,

    firstPayment: surplus.firstPayment,
    firstPaymentRate: surplus.firstPaymentRate,
  };
}

// Backwards-compat default input factory used by the UI.
export function defaultInput(): CalculationInput {
  return {
    customerName: "",
    mobile: "",
    birthYear: 1985,
    hireYear: 2010,
    currentYear: new Date().getFullYear(),
    jobType: "مدني",
    employmentStatus: "active",
    basicSalary: 12000,
    netSalary: 16000,
    personalDiscountRate: POLICY.DEFAULT_PERSONAL_DISCOUNT,
    conversionFactor: POLICY.DEFAULT_CONVERSION_FACTOR,
    ownerSalePrice: 1000000,
    financingValuation: 1150000,
    propertyValue: 1000000,
    targetFinancing: "",
    targetInstallment: "",
    targetDuration: "",
    targetFirstPayment: "",
    commitments: [],
    hasSuspension: false,
    suspensions: [],
    mode: "customer_driven",
  };
}
