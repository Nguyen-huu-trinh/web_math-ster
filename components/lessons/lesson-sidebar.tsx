"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ChevronDown,
  ChevronRight,
  CircleCheckBig,
  BookOpen,
  CirclePlay,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface LessonSidebarProps {
  course: any;
  currentLessonId: string;
  mobile?: boolean;
  embedded?: boolean;
  onClose?: () => void;
}

export function LessonSidebar({
  course,
  currentLessonId,
  mobile = false,
  embedded = false,
  onClose,
}: LessonSidebarProps) {

  /*
   * =========================================================
   * TÌM CHƯƠNG CHỨA BÀI HIỆN TẠI
   * =========================================================
   */

  const currentChapter = course?.chapters?.find(
    (chapter: any) =>
      chapter.lessons?.some(
        (lesson: any) =>
          lesson.id === currentLessonId
      )
  );

  /*
   * =========================================================
   * CHƯƠNG ĐANG MỞ
   *
   * Ưu tiên:
   * 1. Chương chứa bài hiện tại
   * 2. Nếu không tìm thấy → chương đầu tiên
   * =========================================================
   */

  const [openChapters, setOpenChapters] =
  useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};

    course?.chapters?.forEach(
      (chapter: any) => {
        initial[chapter.id] =
          chapter.id === currentChapter?.id;
      }
    );

    return initial;
  });

  /*
   * =========================================================
   * KHI CHUYỂN SANG BÀI KHÁC
   *
   * Tự động mở chương chứa bài đó.
   * =========================================================
   */

useEffect(() => {
  if (!currentChapter?.id) return;

  setOpenChapters((prev) => ({
    ...prev,
    [currentChapter.id]: true,
  }));
}, [currentChapter?.id]);

  /*
   * =========================================================
   * MỞ / ĐÓNG CHƯƠNG
   *
   * Chỉ cho phép một chương mở tại một thời điểm.
   * =========================================================
   */

function toggleChapter(chapterId: string) {
  setOpenChapters((prev) => ({
    ...prev,
    [chapterId]: !prev[chapterId],
  }));
}

  /*
   * =========================================================
   * KIỂM TRA BÀI ĐÃ HOÀN THÀNH
   * =========================================================
   */

  function isCompleted(
    lesson: any
  ) {
    return (
      lesson.progress?.completed ??
      lesson.completed ??
      false
    );
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <aside
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-transparent dark:text-slate-200",
        "relative",
        "max-h-[calc(100vh-6rem)]",
        "overflow-y-auto",
        embedded && "max-h-none rounded-none border-0 shadow-none",
        mobile &&
          "h-full max-h-none rounded-none border-0"
      )}
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-4 dark:border-slate-800 dark:bg-transparent">

        <div className="flex min-w-0 items-center gap-2">

          {/* ICON */}

          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <BookOpen className="size-4" />
          </div>

          {/* TITLE */}

          <div className="min-w-0">

            <h2 className="truncate text-sm font-semibold">
              {embedded ? course.name : "Nội dung khóa học"}
            </h2>

            <p className="text-xs text-muted-foreground">
              {course?.chapters?.length ?? 0} chương
            </p>

          </div>

        </div>

        {/* MOBILE CLOSE */}

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="
              flex
              size-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-muted-foreground
              transition-colors
              hover:bg-accent
              hover:text-foreground
            "
            aria-label="Đóng danh sách bài học"
          >
            <X className="size-5" />
          </button>
        )}

      </div>


      {/* =====================================================
          CHAPTER LIST
      ====================================================== */}

      <div className="divide-y divide-slate-100 dark:divide-slate-800">

        {course?.chapters?.map(
          (
            chapter: any,
            chapterIndex: number
          ) => {

            /*
             * Chương hiện tại có đang mở không?
             */

           const isOpen =openChapters[chapter.id] ?? false;

            /*
             * Chương có chứa bài hiện tại không?
             */

            const isCurrentChapter =
              currentChapter?.id ===
              chapter.id;

            return (
              <div
                key={chapter.id}
                className=""
              >

                {/* =================================================
                    CHAPTER BUTTON
                ================================================== */}

                <button
                  type="button"
                  onClick={() =>
                    toggleChapter(
                      chapter.id
                    )
                  }
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-3 text-left transition-colors",
                    "hover:bg-accent dark:hover:bg-slate-800/60",
                    isCurrentChapter &&
                      !isOpen &&
                      "bg-amber-50/40 dark:bg-amber-500/5"
                  )}
                >

                  {/* ARROW */}

                  {isOpen ? (
                    <ChevronDown className="size-4 shrink-0" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0" />
                  )}

                  {/* CHAPTER TITLE */}

                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-xs font-bold uppercase",
                      isCurrentChapter &&
                        "text-amber-700 dark:text-amber-300"
                    )}
                  >
                    {chapter.title ??
                      chapter.name ??
                      `Chương ${
                        chapterIndex + 1
                      }`}
                  </span>

                  {/* LESSON COUNT */}

                  <span className="text-xs text-muted-foreground">
                    {chapter.lessons?.length ??
                      0}
                  </span>

                </button>


                {/* =================================================
                    LESSONS
                ================================================== */}

                {isOpen && (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800/60">

                    {chapter.lessons?.map(
                      (
                        lesson: any,
                        lessonIndex: number
                      ) => {

                        /*
                         * BÀI HIỆN TẠI
                         */

                        const active =
                          lesson.id ===
                          currentLessonId;

                        /*
                         * BÀI ĐÃ HOÀN THÀNH
                         */

                        const completed =
                          isCompleted(
                            lesson
                          );

                        return (
                        <Link
                          key={lesson.id}
                          href={`/courses/${course.id}/lessons/${lesson.id}`}
                          prefetch={false} // <-- Tắt prefetch tại đây
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-2.5 border-l-[3px] px-3.5 py-2.5 text-xs transition-colors",
                            active
                              ? "border-l-amber-500 bg-amber-50/60 font-semibold text-amber-900 dark:bg-amber-500/10 dark:text-amber-300"
                              : "border-l-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                          )}
                        >

                            {/* =================================================
                                STATUS ICON
                            ================================================== */}

                            {active ? (<CirclePlay className="size-4 shrink-0 text-amber-600" />) : completed ? (
                              <CircleCheckBig
                                className={cn(
                                  "size-4 shrink-0",
                                  active
                                    ? "text-amber-700"
                                    : "text-green-600"
                                )}
                              />
                            ) : (
                              <span
                                className={cn(
                                  "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                                  active
                                    ? "border-primary text-primary"
                                    : "border-muted-foreground/30"
                                )}
                              >
                                {lessonIndex +
                                  1}
                              </span>
                            )}

                            {/* =================================================
                                LESSON TITLE
                            ================================================== */}

                            <span className="min-w-0 flex-1 truncate">
                              {lesson.title}
                            </span>

                            {active && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-amber-500" />}
                          </Link>
                        );
                      }
                    )}

                  </div>
                )}

              </div>
            );
          }
        )}

      </div>

    </aside>
  );
}
