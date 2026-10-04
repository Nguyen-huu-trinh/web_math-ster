"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDeactivateExam, usePublishExam } from "@/hooks/use-exams";
import { queryKeys } from "@/lib/react-query/query-keys";
import type { Exam, ExamStatus } from "@/types/exam";
import { ExamStatusBadge } from "./exam-status-badge";

export function ExamEditableStatus({ exam }: { exam: Exam }) {
  const publish = usePublishExam();
  const deactivate = useDeactivateExam();
  const queryClient = useQueryClient();
  const saving = useRef(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ExamStatus>("LOCKED");
  const [error, setError] = useState("");
  const busy = publish.isPending || deactivate.isPending;

  async function save() {
    if (saving.current) return;
    if (draft === exam.status) { setEditing(false); return; }
    saving.current = true;
    setError("");
    try {
      // Use the existing endpoints to update status and is_active together.
      const saved = await (draft === "OPEN" ? publish.mutateAsync(exam.id) : deactivate.mutateAsync(exam.id));
      const changes = { status: saved.status, is_active: saved.is_active };
      queryClient.setQueryData<Exam[]>(queryKeys.exam.all, (current) => current?.map((item) =>
        item.id === exam.id ? { ...item, ...changes } : item
      ));
      queryClient.setQueryData<Exam>(queryKeys.exam.detail(exam.id), (current) => current ? { ...current, ...changes } : current);
      setEditing(false);
      toast.success("Đã lưu trạng thái đề thi.");
    } catch {
      setError("Không thể lưu. Nhấn Enter để thử lại.");
    } finally {
      saving.current = false;
    }
  }

  if (!editing) return <button
    type="button"
    className="min-h-9 rounded px-2 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
    aria-label={`Sửa trạng thái của ${exam.title}`}
    title="Bấm để sửa, Enter để lưu"
    onClick={() => { setDraft(exam.status === "OPEN" ? "OPEN" : "LOCKED"); setError(""); setEditing(true); }}
  ><ExamStatusBadge status={exam.status} /></button>;

  return <div className="min-w-32 max-w-56">
    <select
      autoFocus
      value={draft}
      aria-label={`Trạng thái của ${exam.title}`}
      aria-busy={busy}
      aria-disabled={busy}
      aria-invalid={!!error}
      aria-describedby={error ? `${exam.id}-status-error` : undefined}
      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
      onChange={(event) => { if (!saving.current) { setDraft(event.target.value as ExamStatus); setError(""); } }}
      onBlur={() => { if (!saving.current) setEditing(false); }}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Enter") { event.preventDefault(); void save(); }
        if (event.key === "Escape" && !saving.current) { event.preventDefault(); setEditing(false); }
      }}
    >
      <option value="OPEN">Mở (OPEN)</option>
      <option value="LOCKED">Khóa (LOCKED)</option>
    </select>
    {error && <p id={`${exam.id}-status-error`} role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
  </div>;
}
