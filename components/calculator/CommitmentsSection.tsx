"use client";

import type {
  CalculationInput,
  CalculationResult,
  Commitment,
} from "@/lib/policy/types";
import { Num, SectionCard, TextInput } from "./ui";

let nextId = 1;
function newId() {
  return `c-${Date.now()}-${nextId++}`;
}

export default function CommitmentsSection({
  input,
  result,
  update,
}: {
  input: CalculationInput;
  result: CalculationResult;
  update: (p: Partial<CalculationInput>) => void;
}) {
  const commitments = input.commitments ?? [];

  function add() {
    update({
      commitments: [
        ...commitments,
        { id: newId(), entity: "", name: "", amount: 0 },
      ],
    });
  }

  function remove(id: string) {
    update({
      commitments: commitments.filter((c) => c.id !== id),
    });
  }

  function patch(id: string, partial: Partial<Commitment>) {
    update({
      commitments: commitments.map((c) =>
        c.id === id ? { ...c, ...partial } : c,
      ),
    });
  }

  return (
    <SectionCard
      title="الالتزامات"
      subtitle="الالتزامات الشهرية القائمة على العميل"
      actions={
        <button
          type="button"
          onClick={add}
          className="rounded-sm border-2 border-stone-900 bg-stone-900 text-white px-3 py-1.5 text-sm font-semibold hover:bg-stone-800"
        >
          + إضافة التزام
        </button>
      }
    >
      {commitments.length === 0 ? (
        <div className="rounded-sm border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-600 text-center">
          لا توجد التزامات مسجّلة. اضغط «إضافة التزام» لإدخال الأول.
        </div>
      ) : (
        <div className="space-y-3">
          {commitments.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-1 md:grid-cols-[1.2fr_1.2fr_1fr_auto] gap-3 items-end rounded-sm border-2 border-stone-200 bg-stone-50 p-3"
            >
              <div>
                <div className="text-xs text-stone-500 mb-1">جهة الالتزام</div>
                <TextInput
                  value={c.entity}
                  onChange={(v) => patch(c.id, { entity: v })}
                  placeholder="اسم البنك / الجهة"
                />
              </div>
              <div>
                <div className="text-xs text-stone-500 mb-1">اسم الالتزام</div>
                <TextInput
                  value={c.name}
                  onChange={(v) => patch(c.id, { name: v })}
                  placeholder="اسم المنتج"
                />
              </div>
              <div>
                <div className="text-xs text-stone-500 mb-1">القيمة (ر.س)</div>
                <TextInput
                  type="number"
                  value={c.amount}
                  onChange={(v) => patch(c.id, { amount: Number(v) })}
                />
              </div>
              <button
                type="button"
                onClick={() => remove(c.id)}
                className="rounded-sm border-2 border-rose-300 bg-white text-rose-700 px-3 py-2 text-sm font-semibold hover:bg-rose-50"
                aria-label="حذف"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between rounded-sm border-2 border-stone-300 bg-stone-100 p-3">
        <span className="text-sm font-semibold text-stone-700">
          إجمالي الالتزامات ({result.commitmentsCount})
        </span>
        <span className="text-lg font-bold text-stone-900">
          <Num value={result.commitmentsTotal} /> ر.س
        </span>
      </div>
    </SectionCard>
  );
}
