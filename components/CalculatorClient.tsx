"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import CalculatorForm from "./CalculatorForm";
import ResultsPanel from "./ResultsPanel";
import { calculate } from "@/lib/policy/calculate";
import type { CalculationInput, CalculationResult } from "@/lib/policy/types";

export default function CalculatorClient({ userEmail }: { userEmail?: string }) {
  const [result, setResult] = useState<CalculationResult | null>(null);

  function onSubmit(input: CalculationInput) {
    setResult(calculate(input));
  }

  return (
    <main className="min-h-screen bg-surface">
      <header className="bg-white border-b border-navy-900/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-brand-blue font-bold tracking-wide">
              نهر AI
            </div>
            <h1 className="text-lg font-bold text-navy">
              Hamzah.sa — حاسبة التمويل
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {userEmail ? (
              <span className="text-navy-700/70 hidden sm:inline" dir="ltr">
                {userEmail}
              </span>
            ) : null}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-navy-700/70 hover:text-navy font-medium"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-2">
          <div className="rounded-2xl bg-white shadow-card p-6">
            <h2 className="text-base font-bold text-navy mb-4">
              إدخال بيانات العميل
            </h2>
            <CalculatorForm onSubmit={onSubmit} />
          </div>
        </section>
        <section className="lg:col-span-3">
          {result ? (
            <ResultsPanel result={result} />
          ) : (
            <EmptyState />
          )}
        </section>
      </div>

      <footer className="max-w-6xl mx-auto px-6 py-6 text-xs text-navy-700/50">
        نسخة تجريبية — البنك السعودي الفرنسي — منتج شراء وحدة جاهزة — الموظف
        النشط فقط.
      </footer>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white border border-dashed border-navy-900/10 p-10 text-center">
      <div className="text-navy-700/60 text-sm">
        أدخل بيانات العميل ثم اضغط «احسب الحل التمويلي» لعرض النتائج.
      </div>
    </div>
  );
}
