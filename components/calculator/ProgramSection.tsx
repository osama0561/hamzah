"use client";

import type { CalculationResult } from "@/lib/policy/types";
import { EmptyStage, Metric, Num, SectionCard } from "./ui";

export default function ProgramSection({
  result,
}: {
  result: CalculationResult;
}) {
  return (
    <SectionCard
      title="البرنامج التمويلي"
      subtitle="المراحل الثلاث: الدمج، قبل التقاعد، وما بعد التقاعد"
    >
      <Stage1Card result={result} />
      <Stage2Card result={result} />
      <Stage3Card result={result} />

      <div className="rounded-sm border-2 border-stone-900 bg-stone-900 text-white p-5 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat
            label="إجمالي المدة"
            value={<Num value={result.totalDurationYears} />}
            suffix="سنة"
          />
          <MiniStat
            label="عدد المراحل الفعالة"
            value={<Num value={result.totalStagesCount} />}
          />
          <MiniStat
            label="إجمالي الأقساط العقارية"
            value={<Num value={result.finalMortgageInstallmentsTotal} />}
            suffix="ر.س"
          />
          <div className="rounded-sm border-2 border-amber-400 bg-amber-500/10 p-3">
            <div className="text-[11px] text-amber-200 mb-1">
              قيمة التمويل النهائية
            </div>
            <div className="text-xl font-bold text-amber-300">
              <Num value={result.finalFinancingAmount} /> ر.س
            </div>
            <div className="text-[10px] text-amber-200/70 mt-1">
              = إجمالي الأقساط ÷ <Num value={result.conversionFactor} digits={2} />
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function MiniStat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: React.ReactNode;
  suffix?: string;
}) {
  return (
    <div className="rounded-sm border-2 border-stone-700 bg-stone-800 p-3">
      <div className="text-[11px] text-stone-400 mb-1">{label}</div>
      <div className="text-lg font-bold text-amber-300">
        {value}
        {suffix ? (
          <span className="ms-1 text-xs font-medium text-stone-400">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function StageHeader({
  index,
  title,
  badge,
  tone,
}: {
  index: number;
  title: string;
  badge?: string;
  tone: "amber" | "emerald" | "orange";
}) {
  const toneCls: Record<string, string> = {
    amber: "bg-amber-500 text-amber-950",
    emerald: "bg-emerald-500 text-emerald-950",
    orange: "bg-orange-500 text-orange-950",
  };
  return (
    <div className="flex items-center gap-3 mb-3">
      <div
        className={`w-8 h-8 rounded-sm font-bold grid place-items-center ${toneCls[tone]}`}
      >
        {index}
      </div>
      <h3 className="text-base font-bold text-stone-900">{title}</h3>
      {badge ? (
        <span className="ms-auto text-xs font-semibold px-2 py-1 rounded-sm bg-stone-200 text-stone-700">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

function Stage1Card({ result }: { result: CalculationResult }) {
  const s = result.stage1;
  return (
    <div>
      <StageHeader
        index={1}
        title="مرحلة الدمج — عقاري + شخصي"
        badge={s.exists ? `${s.mergedYears} سنة` : "غير فعّالة"}
        tone="amber"
      />
      {!s.exists ? (
        <EmptyStage reason={s.reason} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Metric
              label="مدة الدمج"
              value={<Num value={s.mergedYears} />}
              suffix="سنة"
              tone="amber"
            />
            <Metric
              label="نسبة الشخصي"
              value={<Num value={s.personalRate * 100} digits={0} />}
              suffix="%"
            />
            <Metric
              label="القسط الشخصي الشهري"
              value={<Num value={s.personalInstallment} />}
              suffix="ر.س"
            />
            <Metric
              label="نسبة العقاري"
              value={<Num value={s.mortgageRate * 100} digits={1} />}
              suffix="%"
              tone="stone"
            />
            <Metric
              label="القسط العقاري الشهري"
              value={<Num value={s.mortgageInstallment} />}
              suffix="ر.س"
              tone="stone"
            />
            <Metric
              label="إجمالي العقاري"
              value={<Num value={s.mortgageTotal} />}
              suffix="ر.س"
              tone="stone"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <Metric
              label="التمويل الشخصي الصافي للعميل"
              value={<Num value={s.personalNetFinance} />}
              suffix="ر.س"
              tone="emerald"
            />
            <Metric
              label="الأرباح البنكية"
              value={<Num value={s.personalBankProfits} />}
              suffix="ر.س"
              tone="orange"
            />
            <Metric
              label="إجمالي الشخصي مع الأرباح"
              value={<Num value={s.personalTotalWithProfits} />}
              suffix="ر.س"
              tone="stone"
            />
          </div>

          <p className="text-xs text-stone-500 mt-2">{s.reason}</p>
        </>
      )}
    </div>
  );
}

function Stage2Card({ result }: { result: CalculationResult }) {
  const s = result.stage2;
  return (
    <div>
      <StageHeader
        index={2}
        title="قبل التقاعد — عقاري منفرد"
        badge={s.exists ? `${s.years} سنة` : "غير فعّالة"}
        tone="emerald"
      />
      {!s.exists ? (
        <EmptyStage reason={s.reason} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric
              label="المدة"
              value={<Num value={s.years} />}
              suffix="سنة"
              tone="emerald"
            />
            <Metric
              label="نسبة الخصم"
              value={<Num value={s.rate * 100} digits={0} />}
              suffix="%"
            />
            <Metric
              label="القسط الشهري"
              value={<Num value={s.installment} />}
              suffix="ر.س"
            />
            <Metric
              label="الإجمالي"
              value={<Num value={s.total} />}
              suffix="ر.س"
              tone="stone"
            />
          </div>
          <p className="text-xs text-stone-500 mt-2">{s.reason}</p>
        </>
      )}
    </div>
  );
}

function Stage3Card({ result }: { result: CalculationResult }) {
  const s = result.stage3;
  return (
    <div>
      <StageHeader
        index={3}
        title="ما بعد التقاعد"
        badge={s.exists ? `${s.years} سنة` : "غير فعّالة"}
        tone="orange"
      />
      {!s.exists ? (
        <EmptyStage reason={s.reason} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Metric
              label="راتب التقاعد"
              value={<Num value={s.retirementSalary} />}
              suffix="ر.س"
              tone="orange"
            />
            <Metric
              label="المدة"
              value={<Num value={s.years} />}
              suffix="سنة"
            />
            <Metric
              label="نسبة الخصم"
              value={<Num value={s.rate * 100} digits={0} />}
              suffix="%"
            />
            <Metric
              label="القسط الشهري"
              value={<Num value={s.installment} />}
              suffix="ر.س"
            />
            <Metric
              label="الإجمالي"
              value={<Num value={s.total} />}
              suffix="ر.س"
              tone="stone"
            />
          </div>
          <p className="text-xs text-stone-500 mt-2">{s.reason}</p>
        </>
      )}
    </div>
  );
}
