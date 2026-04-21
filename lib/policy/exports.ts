import type { CalculationInput, CalculationResult } from "./types";

function esc(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v).replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

export function buildCSVRows(
  input: CalculationInput,
  result: CalculationResult,
): string[][] {
  const rows: string[][] = [];

  rows.push(["المفتاح", "القيمة"]);

  rows.push(["اسم العميل", input.customerName ?? ""]);
  rows.push(["رقم الجوال", input.mobile ?? ""]);
  rows.push(["سنة الميلاد", String(input.birthYear)]);
  rows.push(["سنة التعيين", String(input.hireYear)]);
  rows.push(["السنة الحالية", String(input.currentYear)]);
  rows.push(["نوع الوظيفة", input.jobType]);
  rows.push(["حالة العميل", input.employmentStatus]);
  rows.push(["الراتب الأساسي", String(input.basicSalary)]);
  rows.push(["الراتب الصافي", String(input.netSalary)]);
  rows.push([
    "نسبة خصم التمويل الشخصي",
    String(input.personalDiscountRate ?? ""),
  ]);
  rows.push(["معامل التحويل", String(input.conversionFactor)]);
  rows.push(["سعر بيع المالك", String(input.ownerSalePrice)]);
  rows.push(["قيمة التقييم", String(input.financingValuation)]);
  rows.push(["قيمة العقار", String(input.propertyValue ?? "")]);

  rows.push([]);
  rows.push(["— النتائج —", ""]);
  rows.push(["العمر", String(result.age)]);
  rows.push(["سنوات الخدمة الحالية", String(result.currentServiceYears)]);
  rows.push(["المتبقي للتقاعد", String(result.yearsToRetirement)]);
  rows.push(["راتب التقاعد", String(Math.round(result.retirementSalary))]);
  rows.push([
    "مرحلة الدمج — سنوات",
    result.stage1.exists ? String(result.stage1.mergedYears) : "—",
  ]);
  rows.push([
    "مرحلة الدمج — القسط العقاري",
    result.stage1.exists
      ? String(Math.round(result.stage1.mortgageInstallment))
      : "—",
  ]);
  rows.push([
    "مرحلة الدمج — القسط الشخصي",
    result.stage1.exists
      ? String(Math.round(result.stage1.personalInstallment))
      : "—",
  ]);
  rows.push([
    "قبل التقاعد — سنوات",
    result.stage2.exists ? String(result.stage2.years) : "—",
  ]);
  rows.push([
    "قبل التقاعد — القسط",
    result.stage2.exists
      ? String(Math.round(result.stage2.installment))
      : "—",
  ]);
  rows.push([
    "التقاعد — سنوات",
    result.stage3.exists ? String(result.stage3.years) : "—",
  ]);
  rows.push([
    "التقاعد — القسط",
    result.stage3.exists
      ? String(Math.round(result.stage3.installment))
      : "—",
  ]);
  rows.push([
    "إجمالي الأقساط العقارية",
    String(Math.round(result.finalMortgageInstallmentsTotal)),
  ]);
  rows.push([
    "قيمة التمويل النهائية",
    String(Math.round(result.finalFinancingAmount)),
  ]);
  rows.push(["الدفعة الأولى", String(Math.round(result.firstPayment))]);
  rows.push([
    "إجمالي الالتزامات",
    String(Math.round(result.commitmentsTotal)),
  ]);

  if (result.hasSuspension) {
    rows.push([
      "الإيقافات الفعلية",
      String(Math.round(result.suspensionsActualTotal)),
    ]);
    rows.push([
      "فائدة الإيقافات (25%)",
      String(Math.round(result.suspensionPayoffProfit)),
    ]);
    rows.push([
      "إجمالي متطلبات الإيقاف",
      String(Math.round(result.suspensionTotalRequirement)),
    ]);
    rows.push([
      "الفائض المتاح",
      String(Math.round(result.displaySurplus)),
    ]);
    rows.push([
      "المتبقي بعد الإيقافات",
      String(Math.round(result.remainingAfterSuspension)),
    ]);
  }

  return rows;
}

export function rowsToCSV(rows: string[][]): string {
  const body = rows.map((r) => r.map(esc).join(",")).join("\n");
  // Excel-friendly BOM for Arabic
  return "﻿" + body;
}

export function downloadFile(
  filename: string,
  content: string,
  mime: string,
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
