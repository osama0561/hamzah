"use client";

import type { CalculationInput, CalculationResult } from "@/lib/policy/types";
import { generateLocalAnalysis } from "@/lib/policy/analyst";
import { Callout, Num, SectionCard } from "./ui";

export default function SummarySection({
  input,
  result,
}: {
  input: CalculationInput;
  result: CalculationResult;
}) {
  const blocks = generateLocalAnalysis(input, result);

  return (
    <SectionCard
      title="الملخص التنفيذي"
      subtitle="التقرير النهائي للمحلل والقرار التمويلي"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          className={`rounded-sm border-2 p-4 ${
            result.hasDeficit
              ? "border-rose-300 bg-rose-50"
              : "border-emerald-300 bg-emerald-50"
          }`}
        >
          <div className="text-xs text-stone-600 mb-1">فائض التقييم</div>
          <div className="text-xl font-bold">
            {result.hasDeficit ? (
              <span className="text-rose-700">لا يوجد فائض</span>
            ) : (
              <>
                <Num value={result.displaySurplus} /> ر.س
                <div className="text-xs font-medium text-stone-600 mt-1">
                  قابل للاستخدام: <Num value={result.usableSurplus} /> ر.س
                </div>
              </>
            )}
          </div>
        </div>

        {result.hasSuspension ? (
          <div
            className={`rounded-sm border-2 p-4 ${
              result.coversWithProfit
                ? "border-emerald-300 bg-emerald-50"
                : result.coversActual
                ? "border-amber-300 bg-amber-50"
                : "border-rose-300 bg-rose-50"
            }`}
          >
            <div className="text-xs text-stone-600 mb-1">تغطية الإيقافات</div>
            <div className="text-sm font-bold">
              {result.coversWithProfit ? (
                <span className="text-emerald-800">
                  مغطاة بالكامل. المتبقي:{" "}
                  <Num value={result.remainingAfterSuspension} /> ر.س
                </span>
              ) : result.coversActual ? (
                <span className="text-amber-800">
                  تغطية فعلية، عجز فائدة:{" "}
                  <Num value={result.shortfallWithProfit} /> ر.س
                </span>
              ) : (
                <span className="text-rose-800">
                  عجز كلي: <Num value={result.shortfallActual} /> ر.س
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-sm border-2 border-stone-200 bg-stone-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <KV label="قيمة التمويل النهائية" value={<Num value={result.finalFinancingAmount} />} unit="ر.س" />
        <KV label="إجمالي الأقساط العقارية" value={<Num value={result.finalMortgageInstallmentsTotal} />} unit="ر.س" />
        <KV label="الدفعة الأولى" value={<Num value={result.firstPayment} />} unit="ر.س" />
        <KV label="نسبة الدفعة الأولى" value={<Num value={result.firstPaymentRate * 100} digits={1} />} unit="%" />
        <KV label="إجمالي المدة" value={<Num value={result.totalDurationYears} />} unit="سنة" />
        <KV label="عدد المراحل" value={<Num value={result.totalStagesCount} />} />
        <KV label="راتب التقاعد" value={<Num value={result.retirementSalary} />} unit="ر.س" />
        <KV label="إجمالي الالتزامات" value={<Num value={result.commitmentsTotal} />} unit="ر.س" />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-stone-900">تحليل المحلل</h3>
        {blocks.length === 0 ? (
          <p className="text-sm text-stone-500">لا يوجد تحليل متاح.</p>
        ) : (
          blocks.map((b, i) => (
            <Callout key={i} tone={b.tone} title={b.title}>
              {b.message}
            </Callout>
          ))
        )}
      </div>
    </SectionCard>
  );
}

function KV({
  label,
  value,
  unit,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-stone-200 pb-1">
      <span className="text-stone-600">{label}</span>
      <span className="font-bold text-stone-900">
        {value}
        {unit ? <span className="ms-1 text-xs text-stone-500">{unit}</span> : null}
      </span>
    </div>
  );
}
