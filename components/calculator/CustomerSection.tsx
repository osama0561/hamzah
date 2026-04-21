"use client";

import type { CalculationInput, CalculationResult } from "@/lib/policy/types";
import {
  Callout,
  Field,
  Metric,
  SectionCard,
  Select,
  TextInput,
} from "./ui";
import { Num } from "./ui";

export default function CustomerSection({
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
      title="العميل"
      subtitle="البيانات الشخصية ونقطة انطلاق جميع الحسابات العمرية ومدة الخدمة"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="اسم العميل">
          <TextInput
            value={input.customerName ?? ""}
            onChange={(v) => update({ customerName: v })}
            placeholder="الاسم الكامل"
          />
        </Field>
        <Field label="رقم الجوال">
          <TextInput
            value={input.mobile ?? ""}
            onChange={(v) => update({ mobile: v })}
            placeholder="05xxxxxxxx"
          />
        </Field>
        <Field label="سنة الميلاد">
          <TextInput
            type="number"
            value={input.birthYear}
            onChange={(v) => update({ birthYear: Number(v) })}
          />
        </Field>
        <Field label="سنة التعيين">
          <TextInput
            type="number"
            value={input.hireYear}
            onChange={(v) => update({ hireYear: Number(v) })}
          />
        </Field>
        <Field label="السنة الحالية">
          <TextInput
            type="number"
            value={input.currentYear}
            onChange={(v) => update({ currentYear: Number(v) })}
          />
        </Field>
        <Field label="نوع الوظيفة">
          <Select
            value={input.jobType}
            onChange={(v) =>
              update({ jobType: v as CalculationInput["jobType"] })
            }
            options={[
              { value: "مدني", label: "مدني" },
              { value: "عسكري", label: "عسكري" },
              { value: "قطاع خاص", label: "قطاع خاص" },
            ]}
          />
        </Field>
        <Field label="حالة العميل">
          <Select
            value={input.employmentStatus}
            onChange={(v) =>
              update({
                employmentStatus: v as CalculationInput["employmentStatus"],
              })
            }
            options={[
              { value: "active", label: "على رأس العمل" },
              { value: "retired", label: "متقاعد" },
            ]}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric
          label="العمر"
          value={<Num value={result.age} />}
          suffix="سنة"
        />
        <Metric
          label="سنوات الخدمة"
          value={<Num value={result.currentServiceYears} />}
          suffix="سنة"
        />
        <Metric
          label="المتبقي للتقاعد"
          value={<Num value={result.yearsToRetirement} />}
          suffix="سنة"
        />
        <Metric
          label="إجمالي أشهر الخدمة عند التقاعد"
          value={<Num value={result.totalRetirementServiceMonths} />}
          suffix="شهر"
        />
      </div>

      {result.goesDirectToRetirement ? (
        <Callout tone="warning" title="تنبيه: تحويل مباشر لمرحلة التقاعد">
          المدة المتبقية للتقاعد ≤ 18 شهر. يُعامَل العميل مباشرةً كمتقاعد، ولن
          تُحسب مرحلة الدمج أو مرحلة ما قبل التقاعد.
        </Callout>
      ) : null}
    </SectionCard>
  );
}
