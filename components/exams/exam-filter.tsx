"use client";

import { Button } from "@/components/ui/button";
import type { ExamCategory } from "@/types/exam";

export type ExamCategoryFilter = "all" | ExamCategory;

interface Props {
  category: ExamCategoryFilter;
  onCategoryChange: (value: ExamCategoryFilter) => void;
}

const filters = [
  { value: "all", label: "Tất cả" },
  { value: "PERIODIC", label: "Định kỳ" },
  { value: "ATTENDANCE", label: "Điểm danh" },
] as const;

export function ExamFilter({ category, onCategoryChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc danh mục đề thi">
      {filters.map(({ value, label }) => (
        <Button
          key={value}
          variant={category === value ? "default" : "outline"}
          aria-pressed={category === value}
          onClick={() => onCategoryChange(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
