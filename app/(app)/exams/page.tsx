"use client";

import { useMemo, useState } from "react";
import {
  useDeactivateExam,
  useDeleteExam,
  useDuplicateExam,
  useExams,
  usePublishExam,
} from "@/hooks/use-exams";
import { ExamFilter, type ExamCategoryFilter } from "@/components/exams/exam-filter";
import { ExamTable } from "@/components/exams/exam-table";

export default function ExamsPage() {
  const examsQuery = useExams();
  const publish = usePublishExam();
  const close = useDeactivateExam();
  const duplicate = useDuplicateExam();
  const remove = useDeleteExam();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<ExamCategoryFilter>("all");

  const exams = useMemo(() => (examsQuery.data ?? []).filter((exam) =>
    exam.title.toLowerCase().includes(keyword.trim().toLowerCase()) &&
    (category === "all" || exam.category === category)
  ), [examsQuery.data, keyword, category]);

  if (examsQuery.isLoading) {
    return <div className="p-8">Đang tải đề thi…</div>;
  }

  if (examsQuery.isError) {
    return <div role="alert" className="p-8">Không thể tải danh sách đề thi. <button className="underline" onClick={() => void examsQuery.refetch()}>Thử lại</button></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý đề thi</h1>
        <p className="mt-1 text-muted-foreground">Quản lý tất cả đề thi trong hệ thống.</p>
      </div>
      <ExamFilter category={category} onCategoryChange={setCategory} />
      <ExamTable
        exams={exams}
        keyword={keyword}
        onKeywordChange={setKeyword}
        onPublish={(id) => publish.mutate(id)}
        onDeactivate={(id) => close.mutate(id)}
        onDuplicate={(id) => duplicate.mutate(id)}
        onDelete={(id) => remove.mutate(id)}
      />
    </div>
  );
}
