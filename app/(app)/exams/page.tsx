"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import "./exams.css";
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
    <div className="exam-management space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-1 text-sm font-extrabold uppercase tracking-wide text-amber-600">Quản trị khảo thí</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-[40px] sm:leading-tight">Quản Lý Đề Thi</h1>
          <p className="mt-1 text-sm font-medium text-slate-500 sm:text-base">Quản lý kho đề định kỳ (KTĐK) và bài tập điểm danh (BTDD) toàn hệ thống.</p>
        </div>
        <Link href="/exams/create" className="flex h-12 items-center gap-3 rounded-[20px] bg-slate-900 px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-slate-800">
          <Plus className="size-5 text-amber-400" />Tạo đề thi mới
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-white p-4">
        <ExamFilter category={category} onCategoryChange={setCategory} total={examsQuery.data?.length ?? 0} />
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input aria-label="Tìm đề thi" placeholder="Tìm tên đề, chuyên đề…" value={keyword} onChange={(event) => setKeyword(event.target.value)} className="h-10 rounded-2xl border-slate-200 bg-slate-50 pl-10 text-slate-700 shadow-none placeholder:text-slate-400" />
        </div>
      </div>
      <ExamTable
        exams={exams}
        onPublish={(id) => publish.mutate(id)}
        onDeactivate={(id) => close.mutate(id)}
        onDuplicate={(id) => duplicate.mutate(id)}
        onDelete={(id) => remove.mutate(id)}
      />
    </div>
  );
}
