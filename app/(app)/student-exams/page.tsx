"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { StudentExamCard } from "@/components/exams/student-exam-card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { useStudentExams } from "@/hooks/use-student-exams";

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "NOT_STARTED", label: "Chưa làm" },
  { value: "FAILED", label: "Cần cải thiện" },
  { value: "PASSED", label: "Đã đạt chuẩn" },
];

const CATEGORY_FILTERS = [
  { value: "all", label: "Tất cả loại đề" },
  { value: "ATTENDANCE", label: "Điểm danh" },
  { value: "PERIODIC", label: "Định kỳ" },
];

export default function StudentExamsPage() {
  const { data, isLoading } = useStudentExams();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  // Đếm số lượng theo trạng thái để hiển thị badge số đếm
  const counts = useMemo(() => {
    if (!data) return { all: 0, NOT_STARTED: 0, FAILED: 0, PASSED: 0 };
    return {
      all: data.length,
      NOT_STARTED: data.filter((e) => e.status === "NOT_STARTED" || e.attempts === 0).length,
      FAILED: data.filter((e) => e.status === "FAILED").length,
      PASSED: data.filter((e) => e.status === "PASSED").length,
    };
  }, [data]);

  const exams = useMemo(() => {
    if (!data) return [];

    return data.filter((exam) => {
      const matchTitle = exam.title
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchStatus =
        status === "all" ||
        (status === "NOT_STARTED" && (exam.status === "NOT_STARTED" || exam.attempts === 0)) ||
        exam.status === status;

      const matchCategory =
        category === "all" || exam.category === category;

      return matchTitle && matchStatus && matchCategory;
    });
  }, [data, query, status, category]);

  if (isLoading) {
    return (
      <div className="py-24 text-center font-medium text-slate-400">
        Đang húc . . . 
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto px-2 sm:px-4 pb-12">
      {/* 1. HEADER TRANG CHUẨN DESIGN */}
      <div className="pt-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Bài Kiểm Tra & Điểm Danh
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
          Theo dõi tiến độ luyện đề định kỳ, điểm số chi tiết và cơ hội làm lại để nâng band điểm.
        </p>
      </div>

      {/* 2. KHỐI BỘ LỌC VÀ TÌM KIẾM TRÊN 1 DÒNG CARD TRẮNG */}
      <div className="rounded-[24px] border border-slate-200/90 bg-white p-3 sm:px-5 sm:py-3.5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Cụm bộ lọc: Kết hợp 2 bộ lọc (Trạng thái & Loại đề) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Bộ lọc 1: Trạng thái (Capsule/Pill Buttons) */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-50/80 p-1 rounded-full border border-slate-200/60">
              {STATUS_FILTERS.map((item) => {
                const isActive = status === item.value;
                const count =
                  item.value === "all"
                    ? counts.all
                    : item.value === "NOT_STARTED"
                    ? counts.NOT_STARTED
                    : item.value === "FAILED"
                    ? counts.FAILED
                    : counts.PASSED;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setStatus(item.value)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#181F2C] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-200/80 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Vạch ngăn giữa 2 bộ lọc */}
            <div className="hidden sm:block h-6 w-px bg-slate-200" />

            {/* Bộ lọc 2: Loại đề (Điểm danh / Định kỳ) */}
            <div className="flex items-center gap-1 bg-slate-50/80 p-1 rounded-full border border-slate-200/60">
              {CATEGORY_FILTERS.map((cat) => {
                const isActive = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-amber-400 text-slate-950 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Thanh tìm kiếm Pill tròn chuẩn mockup */}
          <div className="relative w-full lg:w-72 shrink-0">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Search className="size-4 stroke-[2.5]" />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm bài kiểm tra..."
              className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all focus:border-amber-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

        </div>
      </div>

      {/* 3. DANH SÁCH BÀI KIỂM TRA */}
      {exams.length === 0 ? (
        <Empty className="rounded-[28px] border border-slate-200 bg-white p-12 text-center">
          <EmptyHeader>
            <EmptyMedia className="mx-auto mb-2 text-slate-300">
              <Search className="size-10" />
            </EmptyMedia>
            <EmptyTitle className="text-base font-bold text-slate-700">
              Không tìm thấy bài tập phù hợp
            </EmptyTitle>
            <EmptyDescription className="text-xs text-slate-400">
              {query
                ? "Không có đề nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại."
                : "Chưa có bài kiểm tra nào trong danh mục này."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <StudentExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </div>
  );
}