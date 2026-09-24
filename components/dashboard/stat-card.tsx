"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  BookOpen,
  PlayCircle,
  Users,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/icon";

/* =========================================================================
   1. STAT CARDS DÀNH CHO HỌC SINH (STUDENT DASHBOARD)
========================================================================= */
export interface StatCardsGridProps {
  completedLessons?: number;
  totalLessons?: number;
  pendingExams?: number;
  averageScore?: number;
  rank?: number;
  totalStudents?: number;
  topPercent?: number;
}

export function StatCardsGrid({
  completedLessons = 0,
  totalLessons = 0,
  pendingExams = 0,
  averageScore = 0,
  rank = 1,
  totalStudents = 1,
  topPercent,
}: StatCardsGridProps) {
  // Tự động tính phần trăm nếu không truyền topPercent từ database
  const calculatedTopPercent =
    topPercent !== undefined
      ? Math.round(topPercent)
      : totalStudents > 0
      ? Math.max(1, Math.round((rank / totalStudents) * 100))
      : 100;
  const lessonPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const remainingLessons = Math.max(0, totalLessons - completedLessons);

 const getScoreClassification = (score: number) => {
  if (score >= 9.0)
    return {
      label: "Giỏi",
      // Thêm: px-3 py-1 text-xs sm:text-sm font-bold rounded-lg
      color: "px-3 py-1 text-xs sm:text-sm font-bold rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50",
    };
  if (score >= 7.5)
    return {
      label: "Tạm",
      color: "px-3 py-1 text-xs sm:text-sm font-bold rounded-lg bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50",
    };
  if (score >= 6.0)
    return {
      label: "Trâu Bò",
      color: "px-3 py-1 text-xs sm:text-sm font-bold rounded-lg bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50",
    };
  return {
    label: "Ngô",
    color: "px-3 py-1 text-xs sm:text-sm font-bold rounded-lg bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50",
  };
};

  const classification = getScoreClassification(averageScore);

  // Hàm cuộn mượt đến phần tử theo id
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  

      {/* ========================================================
          CARD 2: BÀI HỌC ĐÃ HỌC
      ========================================================= */}
      <div className="flex flex-col justify-between rounded-[24px] border border-slate-150/80 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-slate-400">
              BÀI HỌC ĐÃ HỌC
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40">
              <CheckCircle2 className="size-4.5 stroke-[2.5]" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <div className="flex items-baseline font-black tracking-tight text-slate-950 dark:text-white">
              <span className="text-3xl font-black">{completedLessons}</span>
              <span className="text-base font-bold text-slate-400">/{totalLessons}</span>
            </div>
            <span className="rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-black text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
              {lessonPercent}%
            </span>
          </div>

          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, lessonPercent)}%` }}
            />
          </div>
        </div>

        {/* Chân card: Bỏ chữ chỉ tiêu tuần, thay bằng nút Học ngay dẫn tới /courses */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold dark:border-slate-800/80">
          <span className="text-[11px] text-slate-400">Còn {remainingLessons} bài chưa xong</span>
          <Link
            href="/courses"
            className="flex items-center gap-1 font-bold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <span>Học ngay</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* ========================================================
          CARD 3: KIỂM TRA CHƯA LÀM
      ========================================================= */}
      <div className="flex flex-col justify-between rounded-[24px] border border-slate-150/80 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-slate-400">
              KIỂM TRA CHƯA LÀM
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/40">
              <AlertTriangle className="size-4.5 stroke-[2.5]" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-amber-500">
              {pendingExams}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              bài tồn đọng
            </span>
          </div>
        </div>

        {/* Chân card: Badge trạng thái & nút Làm ngay */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
          {pendingExams > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50 px-2.5 py-0.5 text-[11px] font-black text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
              <span className="size-1.5 rounded-full bg-amber-500" />
              <span>Cần tăng tốc</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-black text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>Đã hoàn thành</span>
            </span>
          )}

          <Link
            href="/student-exams"
            className="flex items-center gap-1 text-xs font-bold text-slate-700 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
          >
            <span>Làm ngay</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* ========================================================
          CARD 4: ĐIỂM TRUNG BÌNH
      ========================================================= */}
      <div className="flex flex-col justify-between rounded-[24px] border border-slate-150/80 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-slate-400">
              ĐIỂM TRUNG BÌNH
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40">
              <BarChart3 className="size-4.5 stroke-[2.5]" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="font-mono text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              {Number(averageScore).toFixed(2)}
            </span>
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-[11px] font-extrabold tracking-tight",
                classification.color
              )}
            >
              {classification.label}
            </span>
          </div>
        </div>

        {/* Chân card: Bỏ vượt 82% và +0.45, thay bằng nút Chi tiết cuộn xuống Chart */}
        <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => scrollToSection("progress-chart-section")}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <span>Chi tiết</span>
            <ArrowRight className="size-3" />
          </button>
        </div>
      </div>

{/* CARD 1: XẾP HẠNG CỦA BẠN */}
      <div className="flex flex-col justify-between rounded-[24px] border border-slate-150/80 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-slate-400">
              XẾP HẠNG CỦA BẠN
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/40">
              <TrendingUp className="size-4.5 stroke-[2.5]" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <div className="flex items-baseline font-black tracking-tight text-slate-950 dark:text-white">
              <span className="text-3xl font-black">#{rank}</span>
              <span className="text-base font-bold text-slate-400">/{totalStudents}</span>
            </div>

            {/* HIỂN THỊ TOP % ĐỘNG THEO DỮ LIỆU THỰC TẾ */}
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10.5px] font-black uppercase tracking-wider text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
              TOP {calculatedTopPercent}%
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => scrollToSection("top-students-section")}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 transition-colors hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-400"
          >
            <span>Bảng vàng</span>
            <ArrowRight className="size-3" />
          </button>
        </div>
      </div>

    </div>
  );
}



/* =========================================================================
   2. STAT CARDS DÀNH CHO GIÁO VIÊN (TEACHER DASHBOARD)
========================================================================= */
export interface TeacherStatCardsGridProps {
  totalCourses?: number;
  totalLessons?: number;
  totalStudents?: number;
  totalExams?: number;
}

export function TeacherStatCardsGrid({
  totalCourses = 0,
  totalLessons = 0,
  totalStudents = 0,
  totalExams = 0,
}: TeacherStatCardsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. KHÓA HỌC */}
      <div className="flex flex-col justify-between rounded-[24px] border border-slate-150/80 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-slate-400">
              KHÓA HỌC QUẢN LÝ
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-950/40">
              <BookOpen className="size-4.5 stroke-[2.5]" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              {totalCourses}
            </span>
            <span className="text-xs font-bold text-slate-400">khóa đang mở</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-400 dark:border-slate-800/80">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">● Đang hoạt động</span>
          <Link
            href="/courses"
            className="flex items-center gap-1 font-bold text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
          >
            <span>Quản lý</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* 2. BÀI HỌC */}
      <div className="flex flex-col justify-between rounded-[24px] border border-slate-150/80 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-slate-400">
              TỔNG BÀI GIẢNG
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40">
              <PlayCircle className="size-4.5 stroke-[2.5]" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              {totalLessons}
            </span>
            <span className="text-xs font-bold text-slate-400">video & tài liệu</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-400 dark:border-slate-800/80">
          <span className="text-[11px] text-slate-500">Giáo trình 2K9</span>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Đầy đủ</span>
        </div>
      </div>

      {/* 3. HỌC SINH */}
      <div className="flex flex-col justify-between rounded-[24px] border border-slate-150/80 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-slate-400">
              TỔNG HỌC VIÊN
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/40">
              <Users className="size-4.5 stroke-[2.5]" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-amber-500">
              {totalStudents}
            </span>
            <span className="text-xs font-bold text-slate-400">chiến binh</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-400 dark:border-slate-800/80">
          <span className="text-[11px] text-slate-500">Quy mô lớp</span>
          <Link
            href="/students"
            className="flex items-center gap-1 font-bold text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
          >
            <span>Danh sách</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* 4. BÀI KIỂM TRA */}
      <div className="flex flex-col justify-between rounded-[24px] border border-slate-150/80 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-slate-400">
              ĐỀ THI ĐÃ TẠO
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40">
              <ClipboardList className="size-4.5 stroke-[2.5]" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              {totalExams}
            </span>
            <span className="text-xs font-bold text-slate-400">đề định kỳ & luyện tập</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-400 dark:border-slate-800/80">
          <span className="text-[11px] text-slate-500">Khảo sát tuần</span>
          <Link
            href="/exams"
            className="flex items-center gap-1 font-bold text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
          >
            <span>Tạo đề mới</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. LEGACY STAT CARD (GIỮ LẠI ĐỂ TƯƠNG THÍCH NẾU CÒN NƠI SỬ DỤNG)
========================================================================= */
export interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  suffix?: string;
  displayValue?: string;
  index?: number;
}

export function StatCard({
  label,
  value,
  icon,
  suffix,
  displayValue,
  index = 0,
}: StatCardProps) {
  return (
    <Card
      className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{
        animationDelay: `${index * 60}ms`,
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2.5">
            <Icon name={icon} className="size-5 text-primary" />
          </div>
          <p className="whitespace-nowrap text-sm font-semibold text-foreground">
            {label}
          </p>
        </div>

        <div className="mt-3">
          <p className="text-3xl font-extrabold tracking-tight tabular-nums">
            {displayValue ?? value}
            {!displayValue && suffix && (
              <span className="ml-1 text-lg font-medium text-muted-foreground">
                {suffix}
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}