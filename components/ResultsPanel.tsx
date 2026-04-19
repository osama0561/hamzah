import type { CalculationResult, PhaseResult } from "@/lib/policy/types";
import { formatPercent, formatSAR } from "@/lib/utils";

export default function ResultsPanel({ result }: { result: CalculationResult }) {
  if (!result.validation.ok) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 fade-in">
        <h3 className="font-bold text-red-700 mb-2">تعذّر الاحتساب</h3>
        <ul className="list-disc pr-5 text-sm text-red-700 space-y-1">
          {result.validation.errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </div>
    );
  }

  const { derived, personal, phases, totals, validation, explanations } = result;

  return (
    <div className="space-y-4 fade-in">
      <SummaryCard value={totals.finalFinancingValue} />

      {validation.warnings.length > 0 ? (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 space-y-1">
          {validation.warnings.map((w, i) => (
            <div key={i}>• {w}</div>
          ))}
        </div>
      ) : null}

      <Card title="البيانات المشتقة">
        <Row label="العمر" value={`${derived.age} سنة`} />
        <Row
          label="سنوات الخدمة الحالية"
          value={`${derived.currentServiceYears} سنة`}
        />
        <Row
          label="المتبقي للتقاعد"
          value={`${derived.remainingYearsToRetirement} سنة`}
        />
        <Row
          label="مدة الخدمة الكلية عند التقاعد"
          value={`${derived.totalServiceMonthsAtRetirement} شهر`}
        />
        <Row
          label="الراتب التقاعدي التقديري"
          value={`${formatSAR(derived.estimatedPensionSalary)} ريال`}
        />
      </Card>

      <PhaseCard title="المرحلة الأولى — الدمج" phase={phases.merged}>
        {phases.merged.exists ? (
          <Row
            label="القسط العقاري الشهري"
            value={`${formatSAR(phases.merged.installment ?? 0)} ريال`}
          />
        ) : null}
      </PhaseCard>

      <PhaseCard title="المرحلة الثانية — قبل التقاعد" phase={phases.preRetirement} />

      <PhaseCard title="المرحلة الثالثة — التقاعد" phase={phases.postRetirement}>
        {phases.postRetirement.exists ? (
          <Row
            label="الراتب التقاعدي المعتمد"
            value={`${formatSAR(derived.estimatedPensionSalary)} ريال`}
          />
        ) : null}
      </PhaseCard>

      <Card title="التمويل الشخصي">
        <Row
          label="نسبة الخصم"
          value={formatPercent(personal.deductionRate)}
        />
        <Row
          label="القسط الشهري"
          value={`${formatSAR(personal.installment)} ريال`}
        />
        <Row label="الإجمالي" value={`${formatSAR(personal.grossTotal)} ريال`} />
        <Row
          label="ربح البنك"
          value={`${formatSAR(personal.bankProfit)} ريال`}
        />
        <Row
          label="صافي التمويل للعميل"
          value={`${formatSAR(personal.netToCustomer)} ريال`}
          emphasize
        />
      </Card>

      <Card title="الإجماليات">
        <Row
          label="إجمالي الأقساط العقارية"
          value={`${formatSAR(totals.totalRealEstateInstallments)} ريال`}
        />
        <Row label="إجمالي المدة" value={`${totals.totalYears} سنة`} />
        <Row
          label="قيمة التمويل النهائية"
          value={`${formatSAR(totals.finalFinancingValue)} ريال`}
          emphasize
        />
      </Card>

      <Card title="تفسير القرار">
        <ul className="list-disc pr-5 text-sm text-navy-800 space-y-2">
          {explanations.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function SummaryCard({ value }: { value: number }) {
  return (
    <div className="rounded-2xl bg-navy text-white p-6 shadow-card">
      <div className="text-sm opacity-80">قيمة التمويل النهائية</div>
      <div className="mt-2 text-4xl font-black tracking-tight">
        {formatSAR(value)}{" "}
        <span className="text-lg font-bold opacity-80">ريال</span>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white border border-navy-900/5 shadow-card p-5">
      <h3 className="text-sm font-bold text-navy mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PhaseCard({
  title,
  phase,
  children,
}: {
  title: string;
  phase: PhaseResult;
  children?: React.ReactNode;
}) {
  return (
    <Card title={title}>
      {!phase.exists ? (
        <div className="text-sm text-navy-700/70">غير موجودة — {phase.reason}</div>
      ) : (
        <>
          <Row label="المدة" value={`${phase.years} سنة (${phase.months} شهر)`} />
          {phase.deductionRate !== undefined ? (
            <Row
              label="نسبة الخصم"
              value={formatPercent(phase.deductionRate)}
            />
          ) : null}
          {phase.installment !== undefined ? (
            <Row
              label="القسط الشهري"
              value={`${formatSAR(phase.installment)} ريال`}
            />
          ) : null}
          <Row
            label="الإجمالي"
            value={`${formatSAR(phase.totalInstallments)} ريال`}
            emphasize
          />
          {children}
        </>
      )}
    </Card>
  );
}

function Row({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-navy-700/70">{label}</span>
      <span
        className={
          emphasize
            ? "font-bold text-brand-blue text-base"
            : "font-semibold text-navy"
        }
      >
        {value}
      </span>
    </div>
  );
}
