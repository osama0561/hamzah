"use client";

import type {
  CalculationInput,
  CalculationResult,
  Suspension,
} from "@/lib/policy/types";
import { Metric, Num, SectionCard, TextInput } from "./ui";

let nextId = 1;
function newId() {
  return `s-${Date.now()}-${nextId++}`;
}

export default function SuspensionsSection({
  input,
  result,
  update,
}: {
  input: CalculationInput;
  result: CalculationResult;
  update: (p: Partial<CalculationInput>) => void;
}) {
  const hasSuspension = !!input.hasSuspension;
  const suspensions = input.suspensions ?? [];

  function setHas(v: boolean) {
    update({ hasSuspension: v });
  }

  function add() {
    update({
      suspensions: [
        ...suspensions,
        {
          id: newId(),
          bondAmount: 0,
          beneficiary: "",
          actualAmount: 0,
          reason: "",
        },
      ],
    });
  }

  function remove(id: string) {
    update({ suspensions: suspensions.filter((s) => s.id !== id) });
  }

  function patch(id: string, partial: Partial<Suspension>) {
    update({
      suspensions: suspensions.map((s) =>
        s.id === id ? { ...s, ...partial } : s,
      ),
    });
  }

  return (
    <SectionCard
      title="إيقاف الخدمات"
      subtitle="السندات المُوقِفة للخدمات — تُحجب الرواتب حتى السداد"
      actions={
        <div className="inline-flex rounded-sm overflow-hidden border-2 border-stone-300">
          <button
            type="button"
            onClick={() => setHas(false)}
            className={`px-3 py-1.5 text-sm font-semibold ${
              !hasSuspension
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-700"
            }`}
          >
            لا
          </button>
          <button
            type="button"
            onClick={() => setHas(true)}
            className={`px-3 py-1.5 text-sm font-semibold ${
              hasSuspension
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-700"
            }`}
          >
            نعم
          </button>
        </div>
      }
    >
      {!hasSuspension ? (
        <div className="rounded-sm border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-600 text-center">
          لا يوجد إيقاف خدمات. فعّل «نعم» لإضافة سندات إيقاف.
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={add}
              className="rounded-sm border-2 border-stone-900 bg-stone-900 text-white px-3 py-1.5 text-sm font-semibold hover:bg-stone-800"
            >
              + إضافة إيقاف
            </button>
          </div>

          {suspensions.length === 0 ? (
            <div className="rounded-sm border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-600 text-center">
              لا توجد إيقافات مسجّلة. اضغط «إضافة إيقاف» لإدخال الأول.
            </div>
          ) : (
            <div className="space-y-3">
              {suspensions.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-sm border-2 border-stone-200 bg-stone-50 p-3"
                >
                  <div>
                    <div className="text-xs text-stone-500 mb-1">
                      قيمة سند الإيقاف (ر.س)
                    </div>
                    <TextInput
                      type="number"
                      value={s.bondAmount}
                      onChange={(v) =>
                        patch(s.id, { bondAmount: Number(v) })
                      }
                    />
                  </div>
                  <div>
                    <div className="text-xs text-stone-500 mb-1">لصالح من</div>
                    <TextInput
                      value={s.beneficiary}
                      onChange={(v) => patch(s.id, { beneficiary: v })}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-stone-500 mb-1">
                      المبلغ المستحق الفعلي (ر.س)
                    </div>
                    <TextInput
                      type="number"
                      value={s.actualAmount}
                      onChange={(v) =>
                        patch(s.id, { actualAmount: Number(v) })
                      }
                    />
                  </div>
                  <div>
                    <div className="text-xs text-stone-500 mb-1">
                      سبب الإيقاف
                    </div>
                    <TextInput
                      value={s.reason}
                      onChange={(v) => patch(s.id, { reason: v })}
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => remove(s.id)}
                      className="rounded-sm border-2 border-rose-300 bg-white text-rose-700 px-3 py-1.5 text-sm font-semibold hover:bg-rose-50"
                    >
                      حذف هذا الإيقاف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Metric
              label="مجموع الإيقافات الفعلية"
              value={<Num value={result.suspensionsActualTotal} />}
              suffix="ر.س"
              tone="stone"
            />
            <Metric
              label="فائدة سداد الإيقاف (25%)"
              value={<Num value={result.suspensionPayoffProfit} />}
              suffix="ر.س"
              tone="amber"
            />
            <Metric
              label="إجمالي متطلبات الإيقاف"
              value={<Num value={result.suspensionTotalRequirement} />}
              suffix="ر.س"
              tone="rose"
            />
          </div>
        </>
      )}
    </SectionCard>
  );
}
