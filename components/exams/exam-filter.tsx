"use client";

import { Button } from "@/components/ui/button";
import type { ExamCategory } from "@/types/exam";

export type ExamCategoryFilter = "all" | ExamCategory;

interface Props {
  total?: number;
  category: ExamCategoryFilter;
  onCategoryChange: (value: ExamCategoryFilter) => void;
}

const filters = [
  { value: "all", label: "Tất cả đề" },
  { value: "PERIODIC", label: "Định kỳ (KTĐK)" },
  { value: "ATTENDANCE", label: "Điểm danh (BTDD)" },
] as const;

export function ExamFilter({ category, onCategoryChange, total }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc danh mục đề thi">
      {filters.map(({ value, label }) => (
        <Button
          key={value}
          variant="ghost"
          className={`h-10 gap-2 rounded-2xl px-4 font-bold ${category === value ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100"}`}
          aria-pressed={category === value}
          onClick={() => onCategoryChange(value)}
        >
          {value !== "all" && <span className={`size-2.5 rounded-full ${value === "PERIODIC" ? "bg-amber-500" : "bg-sky-500"}`} />}
          {label}
          {value === "all" && total !== undefined && <span className="rounded bg-slate-700/50 px-2 py-0.5 text-xs text-amber-400">{total}</span>}
        </Button>
      ))}
    </div>
  );
}
