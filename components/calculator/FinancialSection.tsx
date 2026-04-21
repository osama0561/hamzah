"use client";

import type { CalculationInput, CalculationResult } from "@/lib/policy/types";
import { Callout, Field, Metric, Num, SectionCard, TextInput } from "./ui";

export default function FinancialSection({
  input,
  result,
  update,
}: {
  input: CalculationInput;
  result: CalculationResult;
  update: (p: Partial<CalculationInput>) => void;
}) {
  return (
    <SectionCard
      title="المالي"
      subtitle="الرواتب والمعاملات المستخدمة في حساب الأقساط والسقوف"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="الراتب الأساسي (ر.س)"
          hint="يُستخدم فقط في حساب راتب التقاعد"
        >
          <TextInput
            type="number"
            value={input.basicSalary}
            onChange={(v) => update({ basicSalary: Number(v) })}
          />
        </Field>
        <Field
          label="الراتب الصافي المعتمد (ر.س)"
          hint="يُستخدم لجميع الأقساط ونسب الاستقطاع"
        >
          <TextInput
            type="number"
            value={input.netSalary}
            onChange={(v) => update({ netSalary: Number(v) })}
          />
        </Field>
        <Field
          label="نسبة خصم التمويل الشخصي"
          hint="0.30 = 30% (افتراضي)"
        >
          <TextInput
            type="number"
            value={input.personalDiscountRate ?? 0.3}
            onChange={(v) => update({ personalDiscountRate: Number(v) })}
          />
        </Field>
        <Field
          label="معامل التحويل النهائي"
          hint="مقسوم، وليس نسبة. افتراضي 2.16"
        >
          <TextInput
            type="number"
            value={input.conversionFactor}
            onChange={(v) => update({ conversionFactor: Number(v) })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric
          label="راتب التقاعد التقديري"
          value={<Num value={result.retirementSalary} />}
          suffix="ر.س"
          tone="stone"
        />
        <Metric
          label="نسبة الشخصي"
          value={<Num value={result.personalRate * 100} digits={1} />}
          suffix="%"
        />
        <Metric
          label="سقف العقاري (الصافي)"
          value={<Num value={result.mortgageCap * 100} digits={0} />}
          suffix="%"
        />
        <Metric
          label="سقف العقاري (التقاعد)"
          value={<Num value={result.retirementMortgageCap * 100} digits={0} />}
          suffix="%"
        />
      </div>

      <details className="rounded-sm border-2 border-dashed border-stone-200 bg-stone-50 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-stone-800">
          كيف يُحسب راتب التقاعد؟ (اضغط للتفاصيل)
        </summary>
        <ol className="list-decimal ps-5 mt-3 space-y-1 text-sm text-stone-700">
          <li>
            سنوات الخدمة الحالية = السنة الحالية − سنة التعيين ={" "}
            <Num value={result.currentServiceYears} /> سنة
          </li>
          <li>
            أشهر الخدمة الحالية = سنوات الخدمة × 12 ={" "}
            <Num value={result.currentServiceMonths} /> شهر
          </li>
          <li>
            السنوات للتقاعد = 60 − عمر العميل ={" "}
            <Num value={result.yearsToRetirement} /> سنة
          </li>
          <li>
            أشهر التبقي للتقاعد = السنوات × 12 ={" "}
            <Num value={result.monthsToRetirement} /> شهر
          </li>
          <li>
            إجمالي أشهر الخدمة عند التقاعد ={" "}
            <Num value={result.totalRetirementServiceMonths} /> شهر
          </li>
          <li>
            راتب التقاعد = الأساسي × إجمالي الأشهر ÷ 480 ={" "}
            <Num value={input.basicSalary} /> ×{" "}
            <Num value={result.totalRetirementServiceMonths} /> ÷ 480 ={" "}
            <Num value={result.retirementSalary} /> ر.س
          </li>
        </ol>
      </details>

      <Callout tone="warning" title="تنبيه مهم">
        الراتب <b>الأساسي</b> يُستخدم فقط في حساب راتب التقاعد. الراتب{" "}
        <b>الصافي</b> يُستخدم في حساب جميع الأقساط ونسب الاستقطاع. لا تخلط
        بينهما.
      </Callout>
    </SectionCard>
  );
}
