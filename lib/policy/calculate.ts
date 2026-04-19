import { POLICY } from "./constants";
import { computeDerived, realEstateCeilingFor } from "./derived";
import {
  mergedPhase,
  personalLoan,
  postRetirementPhase,
  preRetirementPhase,
  routingPath,
} from "./stages";
import type {
  CalculationInput,
  CalculationResult,
  PhaseResult,
} from "./types";

function validate(input: CalculationInput): {
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (input.birthYear >= input.currentYear)
    errors.push("سنة الميلاد يجب أن تكون قبل السنة الحالية.");
  if (input.hireYear > input.currentYear)
    errors.push("سنة التعيين يجب ألا تتجاوز السنة الحالية.");
  if (input.hireYear <= input.birthYear)
    errors.push("سنة التعيين يجب أن تكون بعد سنة الميلاد.");
  else if (input.hireYear - input.birthYear < 15)
    warnings.push("عمر التعيين يبدو أقل من 15 سنة — يرجى التحقق.");
  if (input.basicSalary <= 0) errors.push("الراتب الأساسي يجب أن يكون أكبر من صفر.");
  if (input.netSalary <= 0) errors.push("صافي الراتب يجب أن يكون أكبر من صفر.");
  if (input.conversionFactor <= 0)
    errors.push("معامل التحويل يجب أن يكون أكبر من صفر.");
  if (input.basicSalary > 0 && input.netSalary > input.basicSalary * 2)
    warnings.push("صافي الراتب يبدو أكبر من ضعف الأساسي — يرجى التحقق.");
  if (input.status === "retired")
    errors.push("المتقاعد خارج نطاق النسخة التجريبية.");

  return { errors, warnings };
}

function buildExplanations(
  input: CalculationInput,
  derived: ReturnType<typeof computeDerived>,
  merged: PhaseResult,
  preRet: PhaseResult,
  postRet: PhaseResult,
  finalFinancingValue: number,
): string[] {
  const lines: string[] = [];
  lines.push(
    `العمر ${derived.age} سنة، سنوات الخدمة الحالية ${derived.currentServiceYears}، المتبقي للتقاعد ${derived.remainingYearsToRetirement} سنة.`,
  );
  lines.push(
    `الراتب التقاعدي التقديري = ${Math.round(derived.estimatedPensionSalary).toLocaleString("ar-SA")} ريال (حسبة: الأساسي × ${derived.totalServiceMonthsAtRetirement} ÷ ${POLICY.PENSION_DIVISOR}).`,
  );
  lines.push(merged.reason);
  if (merged.exists) {
    lines.push(
      `سقف الخصم العقاري أثناء الدمج = ${((merged.deductionRate ?? 0) * 100).toFixed(1)}٪ (السقف الكلي ${(realEstateCeilingFor(input.netSalary) * 100).toFixed(0)}٪ مطروحًا منه نسبة الشخصي).`,
    );
  }
  lines.push(preRet.reason);
  lines.push(postRet.reason);
  lines.push(
    `قيمة التمويل النهائية = إجمالي الأقساط العقارية ÷ معامل التحويل (${input.conversionFactor}) = ${Math.round(finalFinancingValue).toLocaleString("ar-SA")} ريال.`,
  );
  return lines;
}

export function calculate(input: CalculationInput): CalculationResult {
  const { errors, warnings } = validate(input);

  if (errors.length > 0) {
    const emptyPhase: PhaseResult = {
      exists: false,
      months: 0,
      years: 0,
      totalInstallments: 0,
      reason: "لم يتم الاحتساب بسبب أخطاء في الإدخال.",
    };
    return {
      inputs: input,
      derived: {
        age: 0,
        currentServiceYears: 0,
        remainingYearsToRetirement: 0,
        currentServiceMonths: 0,
        remainingMonthsToRetirement: 0,
        totalServiceMonthsAtRetirement: 0,
        estimatedPensionSalary: 0,
      },
      personal: {
        deductionRate: 0,
        installment: 0,
        grossTotal: 0,
        netToCustomer: 0,
        bankProfit: 0,
      },
      phases: {
        merged: emptyPhase,
        preRetirement: { ...emptyPhase },
        postRetirement: { ...emptyPhase },
      },
      totals: {
        totalRealEstateInstallments: 0,
        finalFinancingValue: 0,
        totalMonths: 0,
        totalYears: 0,
      },
      validation: { ok: false, errors, warnings },
      explanations: [],
    };
  }

  const derived = computeDerived(input);
  const path = routingPath(derived.remainingMonthsToRetirement);

  const mergedInfo = mergedPhase(input);
  const mergedYears = mergedInfo.phase.years;
  const personal = personalLoan(
    input,
    mergedInfo.personalRate,
    mergedInfo.personalMonths,
  );
  const preRet = preRetirementPhase(
    input,
    mergedYears,
    mergedInfo.realEstateCeiling,
    mergedInfo.phase.exists,
  );
  const postRet = postRetirementPhase(input, mergedYears, preRet.years);

  const totalRealEstateInstallments =
    mergedInfo.phase.totalInstallments +
    preRet.totalInstallments +
    postRet.totalInstallments;
  const finalFinancingValue = totalRealEstateInstallments / input.conversionFactor;
  const totalMonths = mergedInfo.phase.months + preRet.months + postRet.months;
  const totalYears = totalMonths / 12;

  if (mergedYears + preRet.years + postRet.years > POLICY.MAX_TOTAL_YEARS) {
    errors.push("مجموع المراحل يتجاوز 25 سنة — خلل منطقي في الحساب.");
  }

  const explanations = buildExplanations(
    input,
    derived,
    mergedInfo.phase,
    preRet,
    postRet,
    finalFinancingValue,
  );

  if (path === "DIRECT_TO_RETIREMENT") {
    warnings.push(
      "حالة حافة: المتبقي للتقاعد 18 شهرًا أو أقل — يرجى التحقق يدويًا.",
    );
  }

  return {
    inputs: input,
    derived,
    personal,
    phases: {
      merged: mergedInfo.phase,
      preRetirement: preRet,
      postRetirement: postRet,
    },
    totals: {
      totalRealEstateInstallments,
      finalFinancingValue,
      totalMonths,
      totalYears,
    },
    validation: { ok: errors.length === 0, errors, warnings },
    explanations,
  };
}
