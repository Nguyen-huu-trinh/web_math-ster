"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useUpdateExam } from "@/hooks/use-exams";
import { queryKeys } from "@/lib/react-query/query-keys";
import type { Exam } from "@/types/exam";
import { UpdateExamSchema } from "@/validators/exam.schema";

type EditableField = "attendance_min_score" | "exam_duration_days";

export function ExamEditableNumber({ exam, field }: { exam: Exam; field: EditableField }) {
  const update = useUpdateExam();
  const queryClient = useQueryClient();
  const saving = useRef(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const isDays = field === "exam_duration_days";
  const label = isDays ? "Số ngày được phép làm" : "Điểm điểm danh";
  const value = exam[field];

  async function save() {
    if (saving.current) return;
    const nextValue = draft.trim() === "" ? null : Number(draft);
    const payload = { [field]: nextValue };
    if (!UpdateExamSchema.safeParse(payload).success || (isDays && nextValue !== null && nextValue > 2147483647)) {
      setError(isDays ? "Nhập số ngày nguyên từ 1 đến 2147483647 hoặc để trống." : "Nhập điểm từ 0 đến 10 hoặc để trống.");
      return;
    }
    if (nextValue === value) {
      setEditing(false);
      return;
    }
    saving.current = true;
    setError("");
    try {
      const saved = await update.mutateAsync({ id: exam.id, values: payload });
      // Merge only this field to preserve simultaneous edits in other cells.
      queryClient.setQueryData<Exam[]>(queryKeys.exam.all, (current) => current?.map((item) =>
        item.id === exam.id ? { ...item, [field]: saved[field] } : item
      ));
      queryClient.setQueryData<Exam>(queryKeys.exam.detail(exam.id), (current) =>
        current ? { ...current, [field]: saved[field] } : current
      );
      setEditing(false);
      toast.success(`Đã lưu ${label.toLowerCase()}.`);
    } catch {
      setError("Không thể lưu. Nhấn Enter để thử lại.");
    } finally {
      saving.current = false;
    }
  }

  if (!editing) {
    return <button
      type="button"
      className="min-h-9 rounded px-2 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
      aria-label={`Sửa ${label.toLowerCase()} của ${exam.title}`}
      title="Bấm để sửa, Enter để lưu"
      onClick={() => { setDraft(value == null ? "" : String(value)); setError(""); setEditing(true); }}
    >{value == null ? (isDays ? "Không giới hạn" : "--") : `${value}${isDays ? " ngày" : ""}`}</button>;
  }

  return <div className="min-w-32 max-w-56">
    <Input
      autoFocus
      type="number"
      min={isDays ? 1 : 0}
      max={isDays ? 2147483647 : 10}
      step={isDays ? 1 : "any"}
      value={draft}
      readOnly={update.isPending}
      aria-busy={update.isPending}
      aria-label={`${label} của ${exam.title}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${exam.id}-${field}-error` : undefined}
      placeholder={isDays ? "Không giới hạn" : "--"}
      onFocus={(event) => event.target.select()}
      onChange={(event) => { setDraft(event.target.value); setError(""); }}
      onBlur={() => { if (!saving.current) setEditing(false); }}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Enter") {
          event.preventDefault();
          if (!event.currentTarget.validity.valid) { event.currentTarget.reportValidity(); return; }
          void save();
        }
        if (event.key === "Escape" && !saving.current) { event.preventDefault(); setEditing(false); }
      }}
    />
    {error && <p id={`${exam.id}-${field}-error`} role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
  </div>;
}
