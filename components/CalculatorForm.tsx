"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { convertYear, type Calendar } from "@/lib/calendar";
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
  const [calendar, setCalendar] = useState<Calendar>("hijri");
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
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

  function switchCalendar(next: Calendar) {
    if (next === calendar) return;
    const v = getValues();
    setValue("birthYear", convertYear(Number(v.birthYear), calendar, next), {
      shouldValidate: true,
    });
    setValue("hireYear", convertYear(Number(v.hireYear), calendar, next), {
      shouldValidate: true,
    });
    setValue(
      "currentYear",
      convertYear(Number(v.currentYear), calendar, next),
      { shouldValidate: true },
    );
    setCalendar(next);
  }

  function submit(values: FormValues) {
    onSubmit(values as CalculationInput);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <Section
        title="بيانات العميل"
        right={<CalendarToggle value={calendar} onChange={switchCalendar} />}
      >
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
        <div className="sm:col-span-2">
          <YearConverter currentCalendar={calendar} />
        </div>
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

function CalendarToggle({
  value,
  onChange,
}: {
  value: Calendar;
  onChange: (c: Calendar) => void;
}) {
  const base =
    "px-3 py-1 text-xs font-bold rounded-md transition border";
  const on = "bg-navy text-white border-navy";
  const off =
    "bg-white text-navy-700/70 border-navy-900/10 hover:border-navy-900/30";
  return (
    <div
      role="radiogroup"
      aria-label="نوع التقويم"
      className="flex items-center gap-1 p-1 rounded-lg bg-white border border-navy-900/10"
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === "hijri"}
        onClick={() => onChange("hijri")}
        className={`${base} ${value === "hijri" ? on : off}`}
      >
        هجري
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "gregorian"}
        onClick={() => onChange("gregorian")}
        className={`${base} ${value === "gregorian" ? on : off}`}
      >
        ميلادي
      </button>
    </div>
  );
}

function YearConverter({ currentCalendar }: { currentCalendar: Calendar }) {
  const [from, setFrom] = useState<Calendar>(
    currentCalendar === "hijri" ? "gregorian" : "hijri",
  );
  const [year, setYear] = useState<string>("");
  const parsed = Number(year);
  const valid = year !== "" && Number.isFinite(parsed) && parsed >= 1 && parsed <= 3000;
  const to: Calendar = from === "hijri" ? "gregorian" : "hijri";
  const result = valid ? convertYear(parsed, from, to) : null;
  const toLabel = to === "hijri" ? "هجري" : "ميلادي";

  return (
    <details className="rounded-xl border border-dashed border-navy-900/15 bg-white px-4 py-3 text-sm">
      <summary className="cursor-pointer list-none flex items-center justify-between font-medium text-navy">
        <span>تحويل سريع بين التقويمين</span>
        <span className="text-xs text-navy-700/60">
          اعرف السنة بالتقويم الآخر
        </span>
      </summary>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-2 items-center">
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value as Calendar)}
          className={FIELD_CLS}
        >
          <option value="hijri">من هجري</option>
          <option value="gregorian">من ميلادي</option>
        </select>
        <input
          type="number"
          inputMode="numeric"
          placeholder="أدخل السنة"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className={FIELD_CLS}
        />
        <div
          className="px-3 py-2 rounded-md bg-surface text-navy font-bold min-w-[110px] text-center"
          aria-live="polite"
        >
          {result !== null ? `${result} ${toLabel}` : "—"}
        </div>
      </div>
    </details>
  );
}

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-surface p-5">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="text-sm font-bold text-navy">{title}</h3>
        {right}
      </div>
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
