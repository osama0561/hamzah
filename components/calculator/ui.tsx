"use client";

import type { ReactNode } from "react";
import { fmt } from "@/lib/utils";

export function Num({
  value,
  digits = 0,
  suffix,
}: {
  value: number | null | undefined;
  digits?: number;
  suffix?: string;
}) {
  const text = fmt(value, digits);
  return (
    <span className="num-font" dir="ltr">
      {text}
      {suffix ? <span className="ms-1 font-sans text-stone-500">{suffix}</span> : null}
    </span>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-stone-700 mb-1">
      {children}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value as string}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-sm border-2 border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500 bg-white disabled:bg-stone-50 disabled:text-stone-400"
    />
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-sm border-2 border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500 bg-white"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint ? (
        <p className="text-xs text-stone-500 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="bg-white rounded-sm border-2 border-stone-200 p-6 space-y-5 fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">{title}</h2>
          {subtitle ? (
            <p className="text-xs text-stone-500 mt-1">{subtitle}</p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Metric({
  label,
  value,
  suffix,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  suffix?: string;
  tone?: "default" | "amber" | "emerald" | "rose" | "orange" | "stone";
}) {
  const toneCls: Record<string, string> = {
    default: "border-stone-200 bg-stone-50",
    amber: "border-amber-300 bg-amber-50",
    emerald: "border-emerald-300 bg-emerald-50",
    rose: "border-rose-300 bg-rose-50",
    orange: "border-orange-300 bg-orange-50",
    stone: "border-stone-300 bg-stone-100",
  };
  return (
    <div className={`rounded-sm border-2 p-3 ${toneCls[tone]}`}>
      <div className="text-xs text-stone-600 mb-1">{label}</div>
      <div className="text-lg font-bold text-stone-900">
        {value}
        {suffix ? (
          <span className="ms-1 text-xs font-medium text-stone-500">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function Callout({
  tone,
  title,
  children,
}: {
  tone: "info" | "warning" | "positive" | "negative";
  title?: string;
  children: ReactNode;
}) {
  const cls: Record<string, string> = {
    info: "border-stone-300 bg-stone-50 text-stone-800",
    warning: "border-amber-300 bg-amber-50 text-amber-900",
    positive: "border-emerald-300 bg-emerald-50 text-emerald-900",
    negative: "border-rose-300 bg-rose-50 text-rose-900",
  };
  return (
    <div className={`rounded-sm border-2 p-4 text-sm ${cls[tone]}`}>
      {title ? <div className="font-bold mb-1">{title}</div> : null}
      <div>{children}</div>
    </div>
  );
}

export function EmptyStage({ reason }: { reason: string }) {
  return (
    <div className="rounded-sm border-2 border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
      {reason}
    </div>
  );
}
