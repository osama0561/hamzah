"use client";

import type { CalculationInput, CalculationResult } from "@/lib/policy/types";
import { Callout, Field, Metric, Num, SectionCard, TextInput } from "./ui";

export default function PropertySection({
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
      title="العقار"
      subtitle="بيانات العقار والتقييم والأهداف الاختيارية"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="سعر بيع المالك (ر.س)"
          hint="ما يدفعه العميل للبائع"
        >
          <TextInput
            type="number"
            value={input.ownerSalePrice}
            onChange={(v) => update({ ownerSalePrice: Number(v) })}
          />
        </Field>
        <Field
          label="قيمة تقييم الجهة التمويلية (ر.س)"
          hint="ما يُقيّمه البنك"
        >
          <TextInput
            type="number"
            value={input.financingValuation}
            onChange={(v) => update({ financingValuation: Number(v) })}
          />
        </Field>
        <Field
          label="قيمة العقار (ر.س)"
          hint="القيمة السوقية؛ إن تُركت فارغة = سعر بيع المالك"
        >
          <TextInput
            type="number"
            value={input.propertyValue ?? input.ownerSalePrice}
            onChange={(v) => update({ propertyValue: Number(v) })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Metric
          label="قيمة التمويل النهائية"
          value={<Num value={result.finalFinancingAmount} />}
          suffix="ر.س"
          tone="amber"
        />
        <Metric
          label="الدفعة الأولى"
          value={<Num value={result.firstPayment} />}
          suffix="ر.س"
          tone="stone"
        />
        <Metric
          label="نسبة الدفعة الأولى"
          value={<Num value={result.firstPaymentRate * 100} digits={1} />}
          suffix="%"
        />
        <Metric
          label="فائض التقييم النظري"
          value={<Num value={result.theoreticalSurplus} />}
          suffix="ر.س"
          tone={result.hasDeficit ? "rose" : "emerald"}
        />
      </div>

      <details className="rounded-sm border-2 border-dashed border-stone-200 bg-stone-50 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-stone-800">
          أهداف اختيارية (وضع محرك الهدف غير مفعّل في هذه النسخة)
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <Field label="قيمة التمويل المطلوبة">
            <TextInput
              type="number"
              value={input.targetFinancing as number | string}
              onChange={(v) =>
                update({
                  targetFinancing: v === "" ? "" : Number(v),
                })
              }
            />
          </Field>
          <Field label="القسط المستهدف">
            <TextInput
              type="number"
              value={input.targetInstallment as number | string}
              onChange={(v) =>
                update({
                  targetInstallment: v === "" ? "" : Number(v),
                })
              }
            />
          </Field>
          <Field label="المدة المستهدفة (سنوات)">
            <TextInput
              type="number"
              value={input.targetDuration as number | string}
              onChange={(v) =>
                update({
                  targetDuration: v === "" ? "" : Number(v),
                })
              }
            />
          </Field>
          <Field label="مبلغ الدفعة الأولى">
            <TextInput
              type="number"
              value={input.targetFirstPayment as number | string}
              onChange={(v) =>
                update({
                  targetFirstPayment: v === "" ? "" : Number(v),
                })
              }
            />
          </Field>
        </div>
      </details>

      <Callout tone="positive" title="الفرق بين سعر البيع وقيمة التقييم">
        سعر البيع = ما يدفعه العميل للبائع. قيمة التقييم = ما يُقيّمه البنك.
        إذا كان التقييم أعلى من سعر البيع، الفرق يمكن أن يذهب للعميل كفائض شيك.
      </Callout>
    </SectionCard>
  );
}
