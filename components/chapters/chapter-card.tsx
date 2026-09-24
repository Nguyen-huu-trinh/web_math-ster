"use client";

import React from "react";
import {
  TrendingUp,
  BarChart3,
  Dices,
  Cuboid,
  Activity,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Props {
  chapter: any;
  index?: number;
  children?: React.ReactNode;
  onEdit?: (chapter: any) => void;
  onDelete?: (chapter: any) => void;
  onAddLesson?: (chapter: any) => void;
}

// Icon tích phân SVG vector chuẩn, bo nét mượt mà
function IntegralIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 4a3 3 0 0 0-3 3v10a3 3 0 0 1-3 3" />
      <path d="M8 11h8" strokeWidth="2" strokeOpacity="0.4" />
    </svg>
  );
}

// Icon sigma SVG vector nét dày hiện đại
function SigmaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 5H7l6 7-6 7h11" />
    </svg>
  );
}

// Hàm gán Icon & Màu sắc cao cấp dạng hộp bo tròn (Squircle)
function getChapterVisual(title: string, index: number = 0) {
  const t = (title || "").toLowerCase();

  if (t.includes("hàm số") || t.includes("đồ thị") || t.includes("tiệm cận")) {
    return {
      bg: "bg-rose-50/90 border-rose-100 text-rose-500",
      icon: <TrendingUp className="size-5 stroke-[2.5]" />,
    };
  }

  if (
    t.includes("nguyên hàm") ||
    t.includes("tích phân") ||
    t.includes("ứng dụng")
  ) {
    return {
      bg: "bg-purple-50/90 border-purple-100 text-purple-600",
      icon: <SigmaIcon className="size-5" />,
    };
  }

  if (
    t.includes("lượng giác") ||
    t.includes("cấp số") ||
    t.includes("mũ") ||
    t.includes("logarit")
  ) {
    return {
      bg: "bg-amber-50/90 border-amber-100 text-amber-600",
      icon: <Activity className="size-5 stroke-[2.5]" />,
    };
  }

  if (t.includes("thống kê")) {
    return {
      bg: "bg-blue-50/90 border-blue-100 text-blue-500",
      icon: <BarChart3 className="size-5 stroke-[2.5]" />,
    };
  }

  if (t.includes("xác suất")) {
    return {
      bg: "bg-emerald-50/90 border-emerald-100 text-emerald-600",
      icon: <Dices className="size-5 stroke-[2.5]" />,
    };
  }

  if (t.includes("oxyz") || t.includes("không gian") || t.includes("hình")) {
    return {
      bg: "bg-indigo-50/90 border-indigo-100 text-indigo-500",
      icon: <Cuboid className="size-5 stroke-[2.5]" />,
    };
  }

  // Fallback xoay vòng
  const fallbacks = [
    {
      bg: "bg-amber-50/90 border-amber-100 text-amber-600",
      icon: <Activity className="size-5 stroke-[2.5]" />,
    },
    {
      bg: "bg-rose-50/90 border-rose-100 text-rose-500",
      icon: <TrendingUp className="size-5 stroke-[2.5]" />,
    },
    {
      bg: "bg-purple-50/90 border-purple-100 text-purple-600",
      icon: <IntegralIcon className="size-5" />,
    },
    {
      bg: "bg-blue-50/90 border-blue-100 text-blue-500",
      icon: <BarChart3 className="size-5 stroke-[2.5]" />,
    },
  ];
  return fallbacks[index % fallbacks.length];
}

export function ChapterCard({
  chapter,
  index = 0,
  children,
  onEdit,
  onDelete,
  onAddLesson,
}: Props) {
  const lessons = chapter.lessons ?? [];
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(
    (l: any) => l.progress?.completed ?? l.completed ?? false
  ).length;

  const visual = getChapterVisual(chapter.title, index);

  return (
    <AccordionItem
      value={chapter.id}
      className="group mb-3 overflow-hidden rounded-[22px] border border-slate-200/80 bg-[#F8FAFC] shadow-2xs transition-all hover:border-slate-300 hover:bg-[#F1F5F9]/80"
    >
<AccordionTrigger className="px-3.5 py-3 hover:no-underline sm:px-5 sm:py-3.5">
        <div className="flex w-full items-center justify-between gap-2.5 sm:gap-3 pr-1 sm:pr-2">
          {/* Cột trái: Khối Squircle + Tên chương (Tự cân đối Mobile & Desktop) */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            <div
              className={`flex size-9 sm:size-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border ${visual.bg} shadow-2xs transition-transform group-hover:scale-105`}
            >
              {visual.icon}
            </div>

            <div className="text-left min-w-0 flex-1">
              {/* Mobile: 2 dòng gọn gàng, không tràn; Desktop: 1 dòng thẳng tắp có truncate */}
              <p className="line-clamp-2 sm:line-clamp-none sm:truncate text-[12.5px] sm:text-[14.5px] font-black uppercase tracking-tight text-slate-800 transition-colors group-hover:text-amber-600 leading-snug sm:leading-normal">
                {chapter.title}
              </p>
            </div>
          </div>

          {/* Cột phải: Badge tiến độ & Các nút thao tác */}
          <div
            className="flex items-center gap-1.5 sm:gap-2.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Badge hiển thị X/Y Bài */}
            <span className="rounded-full border border-slate-200/80 bg-white px-2.5 py-0.5 sm:px-3 sm:py-1 font-mono text-[10.5px] sm:text-xs font-black text-slate-700 shadow-2xs">
              {completedLessons}/{totalLessons} Bài
            </span>

            {/* Các nút thao tác dành cho Giáo viên */}
            {onAddLesson && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-7 sm:size-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                title="Thêm bài học"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddLesson(chapter);
                }}
              >
                <Plus className="size-3.5 sm:size-4" />
              </Button>
            )}

            {onEdit && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-7 sm:size-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                title="Chỉnh sửa chương"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(chapter);
                }}
              >
                <Pencil className="size-3.5 sm:size-4" />
              </Button>
            )}

            {onDelete && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-7 sm:size-8 rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                title="Xóa chương"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(chapter);
                }}
              >
                <Trash2 className="size-3.5 sm:size-4" />
              </Button>
            )}
          </div>
        </div>
      </AccordionTrigger>

      {/* Nội dung danh sách bài học khi mở chương */}
      <AccordionContent className="border-t border-slate-100 bg-slate-50/50 px-4 pt-2 pb-3.5 sm:px-5">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}