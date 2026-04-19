"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { CalculationInput } from "@/lib/policy/types";

const schema = z.object({
  birthYear: z.coerce.number().int().min(1300).max(2100),
  hireYear: z.coerce.number().int().min(1300).max(2100),
  currentYear: z.coerce.number().int().min(1300).max(2100),
  basicSalary: z.coerce.number().positive(),
  netSalary: z.coerce.number().positive(),
  employmentType: z.enum(["civilian", "military", "private", "semi-gov"]),
  status: z.enum(["active", "retired"]),
  conversionFactor: z.coerce.number().positive(),
});

type FormValues = z.infer<typeof schema>;

const FIELD_CLS =
  "w-full rounded-lg border border-navy-900/10 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-blue/30 bg-white";

export default function CalculatorForm({
  onSubmit,
  defaults,
}: {
  onSubmit: (input: CalculationInput) => void;
  defaults?: Partial<FormValues>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      birthYear: 1397,
      hireYear: 1420,
      currentYear: 1447,
      basicSalary: 16100,
      netSalary: 15000,
      employmentType: "civilian",
      status: "active",
      conversionFactor: 2.16,
      ...defaults,
    },
  });

  function submit(values: FormValues) {
    onSubmit(values as CalculationInput);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <Section title="بيانات العميل">
        <Field label="سنة الميلاد" error={errors.birthYear?.message}>
          <input type="number" className={FIELD_CLS} {...register("birthYear")} />
        </Field>
        <Field label="سنة التعيين" error={errors.hireYear?.message}>
          <input type="number" className={FIELD_CLS} {...register("hireYear")} />
        </Field>
        <Field label="السنة الحالية" error={errors.currentYear?.message}>
          <input
            type="number"
            className={FIELD_CLS}
            {...register("currentYear")}
          />
        </Field>
      </Section>

      <Section title="البيانات المالية">
        <Field label="الراتب الأساسي (ريال)" error={errors.basicSalary?.message}>
          <input
            type="number"
            step="any"
            className={FIELD_CLS}
            {...register("basicSalary")}
          />
        </Field>
        <Field label="صافي الراتب (ريال)" error={errors.netSalary?.message}>
          <input
            type="number"
            step="any"
            className={FIELD_CLS}
            {...register("netSalary")}
          />
        </Field>
        <Field label="جهة العمل">
          <select className={FIELD_CLS} {...register("employmentType")}>
            <option value="civilian">مدني</option>
            <option value="military">عسكري</option>
            <option value="private">قطاع خاص</option>
            <option value="semi-gov">شبه حكومي</option>
          </select>
        </Field>
        <Field label="الحالة الوظيفية">
          <select className={FIELD_CLS} {...register("status")}>
            <option value="active">على رأس العمل</option>
            <option value="retired" disabled>
              متقاعد (خارج نطاق النسخة التجريبية)
            </option>
          </select>
        </Field>
      </Section>

      <Section title="إعدادات المعاملة">
        <Field
          label="معامل التحويل"
          error={errors.conversionFactor?.message}
          hint="افتراضي 2.16"
        >
          <input
            type="number"
            step="0.01"
            className={FIELD_CLS}
            {...register("conversionFactor")}
          />
        </Field>
      </Section>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-navy text-white py-3 font-semibold hover:bg-navy-800 transition disabled:opacity-60"
      >
        احسب الحل التمويلي
      </button>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-surface p-5">
      <h3 className="text-sm font-bold text-navy mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
      {hint ? (
        <span className="block text-xs text-navy-700/60 mt-1">{hint}</span>
      ) : null}
      {error ? (
        <span className="block text-xs text-red-600 mt-1">{error}</span>
      ) : null}
    </label>
  );
}
