"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ChevronDown,
  ChevronRight,
  CircleCheckBig,
  BookOpen,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface LessonSidebarProps {
  course: any;
  currentLessonId: string;
  mobile?: boolean;
  onClose?: () => void;
}

export function LessonSidebar({
  course,
  currentLessonId,
  mobile = false,
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

  const [openChapterId, setOpenChapterId] =
    useState<string | null>(
      currentChapter?.id ??
        course?.chapters?.[0]?.id ??
        null
    );

  /*
   * =========================================================
   * KHI CHUYỂN SANG BÀI KHÁC
   *
   * Tự động mở chương chứa bài đó.
   * =========================================================
   */

  useEffect(() => {
    if (currentChapter?.id) {
      setOpenChapterId(currentChapter.id);
    }
  }, [currentChapter?.id]);

  /*
   * =========================================================
   * MỞ / ĐÓNG CHƯƠNG
   *
   * Chỉ cho phép một chương mở tại một thời điểm.
   * =========================================================
   */

  function toggleChapter(
    chapterId: string
  ) {
    setOpenChapterId((currentId) =>
      currentId === chapterId
        ? null
        : chapterId
    );
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
        "rounded-xl border bg-card",
        "sticky top-20",
        "max-h-[calc(100vh-6rem)]",
        "overflow-y-auto",
        mobile &&
          "h-full max-h-none rounded-none border-0"
      )}
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between border-b px-4 py-4">

        <div className="flex min-w-0 items-center gap-2">

          {/* ICON */}

          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="size-4" />
          </div>

          {/* TITLE */}

          <div className="min-w-0">

            <h2 className="truncate text-sm font-semibold">
              Nội dung khóa học
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

      <div className="p-2">

        {course?.chapters?.map(
          (
            chapter: any,
            chapterIndex: number
          ) => {

            /*
             * Chương hiện tại có đang mở không?
             */

            const isOpen =
              openChapterId ===
              chapter.id;

            /*
             * Chương có chứa bài hiện tại không?
             */

            const isCurrentChapter =
              currentChapter?.id ===
              chapter.id;

            return (
              <div
                key={chapter.id}
                className="mb-1 last:mb-0"
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
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors",
                    "hover:bg-accent",
                    isCurrentChapter &&
                      !isOpen &&
                      "bg-primary/5"
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
                      "flex-1 truncate text-sm font-semibold",
                      isCurrentChapter &&
                        "text-primary"
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
                  <div className="ml-3 border-l pl-2">

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
                            onClick={onClose}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                              active
                                ? "bg-primary/10 font-semibold text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                          >

                            {/* =================================================
                                STATUS ICON
                            ================================================== */}

                            {completed ? (
                              <CircleCheckBig
                                className={cn(
                                  "size-4 shrink-0",
                                  active
                                    ? "text-primary"
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