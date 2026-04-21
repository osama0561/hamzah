import type { CalculationInput, CalculationResult } from "./types";

export type AnalystTone = "info" | "warning" | "positive" | "negative";

export type AnalystBlock = {
  tone: AnalystTone;
  title: string;
  message: string;
};

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString("en-US");
}

export function generateLocalAnalysis(
  _input: CalculationInput,
  result: CalculationResult,
): AnalystBlock[] {
  const blocks: AnalystBlock[] = [];

  // 1. Path classification
  if (result.isRetired && !result.goesDirectToRetirement) {
    blocks.push({
      tone: "info",
      title: "مسار متقاعد",
      message: `العميل في مسار التقاعد. راتب التقاعد المحسوب: ${fmt(result.retirementSalary)} ر.س.`,
    });
  } else if (result.goesDirectToRetirement) {
    blocks.push({
      tone: "warning",
      title: "تحويل مباشر",
      message: `تبقّى ${result.monthsToRetirement} شهر فقط للتقاعد (≤18)، لذا يُعامَل العميل مباشرة كمتقاعد.`,
    });
  } else {
    blocks.push({
      tone: "info",
      title: "مسار مدمج",
      message: `مسار دمج كامل: ${result.totalStagesCount} مراحل على ${result.totalDurationYears} سنة.`,
    });
  }

  // 2. Stage summaries
  if (result.stage1.exists) {
    blocks.push({
      tone: "info",
      title: "مرحلة الدمج",
      message: `${result.stage1.mergedYears} سنة. قسط شخصي ${fmt(result.stage1.personalInstallment)} ر.س + قسط عقاري ${fmt(result.stage1.mortgageInstallment)} ر.س. الشخصي الصافي للعميل ${fmt(result.stage1.personalNetFinance)} ر.س، وأرباح بنكية ${fmt(result.stage1.personalBankProfits)} ر.س.`,
    });
  }
  if (result.stage3.exists) {
    blocks.push({
      tone: "info",
      title: "مرحلة التقاعد",
      message: `${result.stage3.years} سنة بقسط ${fmt(result.stage3.installment)} ر.س شهرياً (نسبة ${(result.stage3.rate * 100).toFixed(1)}% من راتب التقاعد).`,
    });
  }

  // 3. Financing coverage
  if (
    result.finalFinancingAmount >= result.ownerSalePrice &&
    result.ownerSalePrice > 0
  ) {
    const margin = result.finalFinancingAmount - result.ownerSalePrice;
    blocks.push({
      tone: "positive",
      title: "تغطية كاملة",
      message: `قيمة التمويل (${fmt(result.finalFinancingAmount)}) تغطي سعر البيع مع هامش ${fmt(margin)} ر.س.`,
    });
  } else if (
    result.ownerSalePrice > 0 &&
    result.finalFinancingAmount < result.ownerSalePrice
  ) {
    const gap = result.ownerSalePrice - result.finalFinancingAmount;
    blocks.push({
      tone: "negative",
      title: "فجوة تمويل",
      message: `التمويل (${fmt(result.finalFinancingAmount)}) أقل من سعر البيع بـ ${fmt(gap)} ر.س. يحتاج العميل لتوفير دفعة أولى بهذا القدر.`,
    });
  }

  // 4. Surplus
  if (result.hasDeficit) {
    blocks.push({
      tone: "negative",
      title: "لا يوجد فائض",
      message: "قيمة التقييم أقل من سعر البيع — لا يوجد فائض شيك متاح.",
    });
  } else if (result.displaySurplus > 0) {
    blocks.push({
      tone: "positive",
      title: "فائض متاح",
      message: `فائض نظري ${fmt(result.displaySurplus)} ر.س (قابل للاستخدام: ${fmt(result.usableSurplus)} ر.س).`,
    });
  }

  // 5. Suspensions
  if (result.hasSuspension) {
    if (result.coversWithProfit) {
      blocks.push({
        tone: "positive",
        title: "الإيقافات مغطاة",
        message: `الفائض يغطي الإيقافات كاملةً مع فائدة السداد. المتبقي بعد الإيقاف: ${fmt(result.remainingAfterSuspension)} ر.س.`,
      });
    } else if (result.coversActual) {
      blocks.push({
        tone: "warning",
        title: "تغطية جزئية",
        message: `الفائض يغطي الإيقافات الفعلية لكن لا يغطي الفائدة. عجز الفائدة: ${fmt(result.shortfallWithProfit)} ر.س.`,
      });
    } else {
      blocks.push({
        tone: "negative",
        title: "فائض غير كافٍ",
        message: `عجز كلي ${fmt(result.shortfallActual)} ر.س في تغطية الإيقافات الفعلية نفسها.`,
      });
    }
  }

  // 6. Commitments ratio
  if (result.commitmentsCount > 0) {
    const ratio =
      result.finalMortgageInstallmentsTotal > 0
        ? (result.commitmentsTotal / result.finalMortgageInstallmentsTotal) *
          100
        : 0;
    blocks.push({
      tone: "info",
      title: "الالتزامات",
      message: `${result.commitmentsCount} التزام بإجمالي ${fmt(result.commitmentsTotal)} ر.س (${ratio.toFixed(1)}% من إجمالي الأقساط العقارية).`,
    });
  }

  return blocks;
}
