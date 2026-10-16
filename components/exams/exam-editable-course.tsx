"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCourses } from "@/hooks/use-courses";
import { useUpdateExam } from "@/hooks/use-exams";
import { queryKeys } from "@/lib/react-query/query-keys";
import type { Exam } from "@/types/exam";

export function ExamEditableCourse({ exam }: { exam: Exam }) {
  const [editing, setEditing] = useState(false);
  const name = exam.courses?.name;
  const courseLabel = name?.split("-")[0].trim();
  const courseCode = courseLabel?.toUpperCase().match(/^(?:KHÓA\s+)?([STER])$/)?.[1];

  if (editing) return <CourseEditor exam={exam} onClose={() => setEditing(false)} />;

  return <button
    type="button"
    data-course-code={courseCode}
    className="min-h-9 rounded px-2 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
    aria-label={`Sửa khóa học của ${exam.title}`}
    title={name ? `${name} — Bấm để sửa` : "Bấm để gắn khóa học"}
    onClick={() => setEditing(true)}
  >{name ? courseLabel : <span className="text-muted-foreground">Chưa gắn khóa học</span>}</button>;
}

function CourseEditor({ exam, onClose }: { exam: Exam; onClose: () => void }) {
  const { courses, loading, isError, refetch } = useCourses();
  const update = useUpdateExam();
  const queryClient = useQueryClient();
  const saving = useRef(false);
  const [draft, setDraft] = useState(exam.course_id ?? "");
  const [error, setError] = useState("");

  async function save() {
    if (saving.current || loading || isError) return;
    const courseId = draft || null;
    if (courseId === exam.course_id) { onClose(); return; }
    saving.current = true;
    setError("");
    try {
      const saved = await update.mutateAsync({ id: exam.id, values: { course_id: courseId } });
      const course = courses.find((item) => item.id === saved.course_id);
      const changes = {
        course_id: saved.course_id,
        courses: course ? { id: course.id, name: course.name } : null,
      };
      queryClient.setQueryData<Exam[]>(queryKeys.exam.all, (current) => current?.map((item) =>
        item.id === exam.id ? { ...item, ...changes } : item
      ));
      queryClient.setQueryData<Exam>(queryKeys.exam.detail(exam.id), (current) =>
        current ? { ...current, ...changes } : current
      );
      onClose();
      toast.success("Đã lưu khóa học của đề thi.");
    } catch {
      setError("Không thể lưu. Nhấn Enter để thử lại.");
    } finally {
      saving.current = false;
    }
  }

  return <div className="min-w-32 max-w-56">
    <select
      autoFocus
      value={draft}
      aria-label={`Khóa học của ${exam.title}`}
      aria-busy={loading || update.isPending}
      aria-disabled={loading || isError || update.isPending}
      aria-invalid={!!error}
      aria-describedby={error || isError ? `${exam.id}-course-error` : undefined}
      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
      onChange={(event) => { if (!saving.current && !loading && !isError) { setDraft(event.target.value); setError(""); } }}
      onBlur={() => { if (!saving.current) onClose(); }}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Enter") { event.preventDefault(); void save(); }
        if (event.key === "Escape" && !saving.current) { event.preventDefault(); onClose(); }
      }}
    >
      <option value="">{loading ? "Đang tải khóa học…" : "Chưa gắn khóa học"}</option>
      {exam.course_id && !courses.some((course) => course.id === exam.course_id) &&
        <option value={exam.course_id}>{exam.courses?.name ?? "Khóa học hiện tại"}</option>}
      {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
    </select>
    {isError && <p id={`${exam.id}-course-error`} role="alert" className="mt-1 text-xs text-destructive">
      Không thể tải khóa học. <button type="button" className="underline" onMouseDown={(event) => event.preventDefault()} onClick={() => void refetch()}>Thử lại</button>
    </p>}
    {error && <p id={`${exam.id}-course-error`} role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
  </div>;
}
