"use client";

import { useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { calculate, defaultInput } from "@/lib/policy/calculate";
import type { CalculationInput } from "@/lib/policy/types";
import {
  buildCSVRows,
  downloadFile,
  rowsToCSV,
} from "@/lib/policy/exports";
import CustomerSection from "./calculator/CustomerSection";
import FinancialSection from "./calculator/FinancialSection";
import PropertySection from "./calculator/PropertySection";
import CommitmentsSection from "./calculator/CommitmentsSection";
import SuspensionsSection from "./calculator/SuspensionsSection";
import ProgramSection from "./calculator/ProgramSection";
import SummarySection from "./calculator/SummarySection";
import { Num } from "./calculator/ui";

type SectionKey =
  | "customer"
  | "financial"
  | "property"
  | "commitments"
  | "suspension"
  | "program"
  | "summary";

const NAV: { key: SectionKey; label: string; icon: string }[] = [
  { key: "customer", label: "العميل", icon: "👤" },
  { key: "financial", label: "المالي", icon: "💰" },
  { key: "property", label: "العقار", icon: "🏠" },
  { key: "commitments", label: "الالتزامات", icon: "📋" },
  { key: "suspension", label: "إيقاف الخدمات", icon: "⏸" },
  { key: "program", label: "البرنامج التمويلي", icon: "📊" },
  { key: "summary", label: "الملخص التنفيذي", icon: "📄" },
];

export default function CalculatorClient({
  userEmail,
}: {
  userEmail?: string;
}) {
  const [input, setInput] = useState<CalculationInput>(() => defaultInput());
  const [section, setSection] = useState<SectionKey>("customer");
  const [scenarios, setScenarios] = useState<
    { id: string; label: string; input: CalculationInput; at: number }[]
  >([]);

  const result = useMemo(() => calculate(input), [input]);

  function update(partial: Partial<CalculationInput>) {
    setInput((prev) => ({ ...prev, ...partial }));
  }

  function saveScenario() {
    const id = `sc-${Date.now()}`;
    const label = input.customerName?.trim() || `سيناريو ${scenarios.length + 1}`;
    setScenarios((prev) => [
      ...prev,
      { id, label, input: { ...input }, at: Date.now() },
    ]);
  }

  function exportCSV() {
    const rows = buildCSVRows(input, result);
    const csv = rowsToCSV(rows);
    downloadFile(
      `hamzah-${Date.now()}.csv`,
      csv,
      "text/csv;charset=utf-8",
    );
  }

  function exportJSON() {
    downloadFile(
      `hamzah-${Date.now()}.json`,
      JSON.stringify(input, null, 2),
      "application/json",
    );
  }

  function loadJSON() {
    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "application/json";
    picker.onchange = () => {
      const file = picker.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          setInput({ ...defaultInput(), ...parsed });
        } catch {
          alert("ملف غير صالح");
        }
      };
      reader.readAsText(file);
    };
    picker.click();
  }

  function printPDF() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Header
        userEmail={userEmail}
        onSave={saveScenario}
        onCSV={exportCSV}
        onJSON={exportJSON}
        onLoad={loadJSON}
        onPrint={printPDF}
        scenarios={scenarios.length}
      />

      <IssuesBanner
        errors={result.errors}
        warnings={result.warnings}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-6">
        <Sidebar active={section} onSelect={setSection} />

        <main className="min-w-0 space-y-6">
          {section === "customer" && (
            <CustomerSection input={input} result={result} update={update} />
          )}
          {section === "financial" && (
            <FinancialSection input={input} result={result} update={update} />
          )}
          {section === "property" && (
            <PropertySection input={input} result={result} update={update} />
          )}
          {section === "commitments" && (
            <CommitmentsSection input={input} result={result} update={update} />
          )}
          {section === "suspension" && (
            <SuspensionsSection input={input} result={result} update={update} />
          )}
          {section === "program" && <ProgramSection result={result} />}
          {section === "summary" && (
            <SummarySection input={input} result={result} />
          )}
        </main>

        <LivePanel
          age={result.age}
          yearsToRetirement={result.yearsToRetirement}
          finalFinancingAmount={result.finalFinancingAmount}
          firstPayment={result.firstPayment}
        />
      </div>

      <footer className="max-w-7xl mx-auto px-6 py-6 text-xs text-stone-500 no-print">
        Hamzah.sa — حاسبة التمويل المدمج. بُنيت بواسطة نهر AI.
      </footer>
    </div>
  );
}

function Header({
  userEmail,
  onSave,
  onCSV,
  onJSON,
  onLoad,
  onPrint,
  scenarios,
}: {
  userEmail?: string;
  onSave: () => void;
  onCSV: () => void;
  onJSON: () => void;
  onLoad: () => void;
  onPrint: () => void;
  scenarios: number;
}) {
  return (
    <header className="bg-white border-b-2 border-stone-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] text-amber-600 font-bold tracking-wide">
            نهر AI
          </div>
          <h1 className="text-lg font-bold">
            Hamzah.sa — حاسبة التمويل العقاري المدمج
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <HeaderBtn onClick={onSave}>حفظ سيناريو ({scenarios})</HeaderBtn>
          <HeaderBtn onClick={onCSV}>تصدير CSV</HeaderBtn>
          <HeaderBtn onClick={onJSON}>حفظ JSON</HeaderBtn>
          <HeaderBtn onClick={onLoad}>تحميل JSON</HeaderBtn>
          <HeaderBtn onClick={onPrint}>طباعة PDF</HeaderBtn>
          {userEmail ? (
            <span className="text-xs text-stone-500 hidden md:inline" dir="ltr">
              {userEmail}
            </span>
          ) : null}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs text-stone-500 hover:text-stone-800 font-semibold ms-2"
          >
            خروج
          </button>
        </div>
      </div>
    </header>
  );
}

function HeaderBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm border-2 border-stone-200 bg-white text-stone-700 px-3 py-1.5 text-xs font-semibold hover:border-amber-400 hover:text-amber-700"
    >
      {children}
    </button>
  );
}

function Sidebar({
  active,
  onSelect,
}: {
  active: SectionKey;
  onSelect: (s: SectionKey) => void;
}) {
  return (
    <aside className="lg:sticky lg:top-6 self-start no-print">
      <nav className="bg-white rounded-sm border-2 border-stone-200 overflow-hidden">
        {NAV.map((item, i) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            className={`w-full text-start px-4 py-3 text-sm flex items-center gap-3 border-stone-200 ${
              i > 0 ? "border-t-2" : ""
            } ${
              active === item.key
                ? "bg-amber-50 text-amber-900 font-bold"
                : "bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
            <span className="ms-auto text-xs text-stone-400 num-font">
              {String(i + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function LivePanel({
  age,
  yearsToRetirement,
  finalFinancingAmount,
  firstPayment,
}: {
  age: number;
  yearsToRetirement: number;
  finalFinancingAmount: number;
  firstPayment: number;
}) {
  return (
    <aside className="lg:sticky lg:top-6 self-start space-y-3 no-print hidden lg:block">
      <div className="bg-stone-900 text-white rounded-sm border-2 border-stone-900 p-4">
        <div className="text-[11px] text-stone-400 mb-1">
          قيمة التمويل النهائية
        </div>
        <div className="text-2xl font-bold text-amber-300">
          <Num value={finalFinancingAmount} />
        </div>
        <div className="text-[11px] text-stone-400 mt-1">ر.س</div>
      </div>
      <div className="bg-white rounded-sm border-2 border-stone-200 p-4 space-y-3">
        <LiveStat label="الدفعة الأولى" value={firstPayment} unit="ر.س" />
        <LiveStat label="العمر" value={age} unit="سنة" />
        <LiveStat
          label="المتبقي للتقاعد"
          value={yearsToRetirement}
          unit="سنة"
        />
      </div>
    </aside>
  );
}

function LiveStat({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs text-stone-500">{label}</span>
      <span className="text-sm font-bold text-stone-900">
        <Num value={value} />
        <span className="ms-1 text-[10px] text-stone-500">{unit}</span>
      </span>
    </div>
  );
}

function IssuesBanner({
  errors,
  warnings,
}: {
  errors: string[];
  warnings: string[];
}) {
  if (errors.length === 0 && warnings.length === 0) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 space-y-2 no-print">
      {errors.length > 0 ? (
        <div className="rounded-sm border-2 border-rose-300 bg-rose-50 p-3">
          <div className="text-sm font-bold text-rose-800 mb-1">
            أخطاء مانعة للاحتساب:
          </div>
          <ul className="text-sm text-rose-800 list-disc ps-5 space-y-0.5">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {warnings.length > 0 ? (
        <div className="rounded-sm border-2 border-amber-300 bg-amber-50 p-3">
          <div className="text-sm font-bold text-amber-900 mb-1">تنبيهات:</div>
          <ul className="text-sm text-amber-900 list-disc ps-5 space-y-0.5">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
