"use client";

import { useRouter } from "next/navigation";
import { RotateCcw, ListFilter } from "lucide-react";

interface ExamResultProps {
  result: {
    score: number;
    passed: boolean;
    part1Score?: string;
    part2Score?: string;
    part3Score?: string;
  };
  exam: any;
  attempt: any;
  viewerRole: "STUDENT" | "TEACHER" | "ADMIN";
  returnUrl?: string;
  onRetry: () => void;
}

export default function ExamResult({
  result,
  exam,
  attempt,
  viewerRole,
  returnUrl,
  onRetry,
}: ExamResultProps) {
  const router = useRouter();

  function handleBack() {
    if (returnUrl) {
      router.push(returnUrl);
      return;
    }

    if (viewerRole === "TEACHER") {
      router.push(`/exams/${exam.id}/answers`);
      return;
    }

    router.push("/student-exams");
  }

  const canRetry = (exam?.max_attempts ?? 1) > (attempt?.attempt_number ?? 1);
  const examCode = exam?.title || exam?.code || "KTĐK Lần 2";

  return (
    <div className="w-full rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h2 className="text-xs font-bold uppercase tracking-tight text-slate-900 shrink-0">
          KẾT QUẢ BÀI LÀM
        </h2>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 truncate max-w-[240px]">
          {examCode}
        </span>
      </div>

      {/* Điểm số */}
      <div className="my-3.5 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          ĐIỂM TỔNG KẾT
        </p>
        <p className="mt-0.5 text-4xl font-extrabold tracking-tight text-slate-900 leading-none">
          {Number(result?.score ?? 0).toFixed(2)}
        </p>
        <p className="mt-1 text-[11px] font-medium text-slate-400">
          Thang điểm 10.0
        </p>
      </div>

      {/* Badge Đạt / Chưa Đạt */}
      <div
        className={`mx-auto flex max-w-md items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold ${
          result?.passed
            ? "border border-emerald-100 bg-emerald-50 text-emerald-600"
            : "border border-rose-100 bg-rose-50/70 text-rose-600"
        }`}
      >
        {result?.passed ? (
          <>
            <span>✓</span> ĐẠT YÊU CẦU
          </>
        ) : (
          <>
            <span className="text-xs font-normal">✕</span> CHƯA ĐẠT YÊU CẦU
          </>
        )}
      </div>



      {/* Hàng nút hành động */}
      <div className="mx-auto max-w-md pt-1">
        <div className={`grid gap-2.5 ${canRetry ? "grid-cols-2" : "grid-cols-1"}`}>
          {/* Nút Danh sách bài */}
          <button
            type="button"
            onClick={handleBack}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
          >
            <ListFilter className="h-3.5 w-3.5 text-slate-500" />
            <span>Danh sách bài</span>
          </button>

          {/* Nút Làm lại đề */}
          {canRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#0f172a] text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-[0.99]"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
              <span>Làm lại đề</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}