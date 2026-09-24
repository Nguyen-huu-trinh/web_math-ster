'use client'

import { DeleteLessonDialog } from "@/components/lessons/delete-lesson-dialog";
import { toast } from "sonner";
import { useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChapterDialog } from "@/components/chapters/chapter-dialog";
import {
  BookOpen,
  CircleCheckBig,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  Users,
  PlayCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LessonDialog } from "@/components/lessons/lesson-dialog";
import { Accordion } from '@/components/ui/accordion'
import { DeleteChapterDialog } from "@/components/chapters/delete-chapter-dialog";
import { useAuth } from '@/providers/auth-provider'
import { ChapterCard } from "@/components/chapters/chapter-card";

import {
  useCourseDetail,
  useCreateChapter,
  useCreateLesson,
  useDeleteChapter,
  useDeleteLesson,
  useUpdateChapter,
  useUpdateLesson,
} from "@/hooks/use-course-detail";

interface CourseClientViewProps {
  courseId: string;
  embedded?: boolean;
}

export default function CourseClientView({ courseId, embedded = false }: CourseClientViewProps) {
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [selectedChapterForLesson, setSelectedChapterForLesson] = useState<any>(null);

  const { profile } = useAuth();
  const role = profile?.role;

  const courseQuery = useCourseDetail(courseId, profile?.id);
  const createChapterMutation = useCreateChapter(courseId);
  const updateChapterMutation = useUpdateChapter(courseId);
  const deleteChapterMutation = useDeleteChapter(courseId);
  const createLessonMutation = useCreateLesson(courseId);
  const updateLessonMutation = useUpdateLesson(courseId);
  const deleteLessonMutation = useDeleteLesson(courseId);

  const course = courseQuery.course;
  const chapters = course?.chapters ?? [];
  const loading = courseQuery.isLoading;
  const [deleteLessonOpen, setDeleteLessonOpen] = useState(false);

  async function createChapter(values: { title: string; order_index: number }) {
    try {
      await createChapterMutation.mutateAsync({
        course_id: courseId,
        title: values.title,
        order_index: values.order_index,
      });
      toast.success("Đã tạo chương mới");
      setChapterDialogOpen(false);
    } catch {
      toast.error("Không thể tạo chương");
    }
  }

  async function deleteLesson() {
    if (!selectedLesson) return;
    try {
      await deleteLessonMutation.mutateAsync(selectedLesson.id);
      toast.success("Đã xóa bài học");
      setDeleteLessonOpen(false);
      setSelectedLesson(null);
    } catch {
      toast.error("Không thể xóa bài học");
    }
  }

  async function updateChapter(values: { title: string; order_index: number }) {
    if (!selectedChapter) return;
    try {
      await updateChapterMutation.mutateAsync({
        id: selectedChapter.id,
        values,
      });
      toast.success("Đã cập nhật chương");
      setChapterDialogOpen(false);
    } catch {
      toast.error("Không thể cập nhật chương");
    }
  }

  async function deleteChapter() {
    if (!selectedChapter) return;
    try {
      await deleteChapterMutation.mutateAsync(selectedChapter.id);
      toast.success("Đã xóa chương");
      setDeleteOpen(false);
    } catch {
      toast.error("Không thể xóa chương");
    }
  }

  interface LessonFormValues {
    title: string;
    order_index: number;
    is_active: boolean;
  }

  async function createLesson(values: LessonFormValues) {
    if (!selectedChapterForLesson) return;
    try {
      await createLessonMutation.mutateAsync({
        chapter_id: selectedChapterForLesson.id,
        title: values.title,
        order_index: values.order_index,
        is_active: values.is_active,
      });
      toast.success("Đã tạo bài học");
      setLessonDialogOpen(false);
    } catch {
      toast.error("Không thể tạo bài học");
    }
  }

  async function updateLesson(values: LessonFormValues) {
    if (!selectedLesson) return;
    try {
      await updateLessonMutation.mutateAsync({
        id: selectedLesson.id,
        values: {
          title: values.title,
          order_index: values.order_index,
          is_active: values.is_active,
        },
      });
      toast.success("Đã cập nhật bài học");
      setLessonDialogOpen(false);
    } catch {
      toast.error("Không thể cập nhật bài học");
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">Đang tải khóa học...</div>;
  }

  if (!course) {
    notFound();
  }

  const allLessons = chapters.flatMap((chapter: any) => chapter.lessons ?? []);
  const completedCount = allLessons.filter(
    (lesson: any) => lesson.progress?.completed ?? lesson.completed ?? false
  ).length;

  // Tìm bài học tiếp theo chưa hoàn thành
  const nextLesson = allLessons.find(
    (l: any) => !(l.progress?.completed ?? l.completed ?? false)
  );

  return (
    <div className="flex flex-col gap-5">
      {!embedded && (
        <Link
          href="/courses"
          className="flex w-fit items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="size-4" />
          Quay về danh sách khóa học
        </Link>
      )}

      {/* HERO BANNER KHÓA HỌC CHUẨN THEO MOCKUP */}
      <div className="rounded-[28px] border border-amber-200/80 bg-[#FFFDF7] p-6 sm:p-7 shadow-[0_4px_24px_-6px_rgba(251,191,36,0.12)]">
        {/* Badges: Active & Số bài học */}
        <div className="flex items-center gap-2 mb-3.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-600">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 shadow-2xs">
            <BookOpen className="size-3.5 text-slate-400" />
            {course.totalLessons ?? 0} bài học
          </span>
        </div>

        {/* Tiêu đề Khóa học */}
        <h1 className="text-2xl sm:text-[28px] font-black uppercase tracking-tight text-slate-900">
          {course.name}
        </h1>

        {role === "STUDENT" ? (
          /* Khối Tiến độ học của Học sinh */
          <div className="mt-5 rounded-2xl border border-amber-100 bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between text-xs sm:text-[13px] font-black text-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="text-base leading-none">🔥</span>
                <span>Đã học {completedCount}/{course.totalLessons ?? 0} bài</span>
              </span>
              <span className="text-amber-600 font-extrabold">{course.progress ?? 0}%</span>
            </div>

            {/* Thanh Progress Đỏ-Cam gradient */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 transition-all duration-500"
                style={{ width: `${Math.min(100, course.progress ?? 0)}%` }}
              />
            </div>
          </div>
        ) : (
          /* Tác vụ Giáo viên */
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Button
              className="rounded-full font-bold bg-slate-900 text-white hover:bg-slate-800"
              onClick={() => {
                setSelectedChapter(null);
                setChapterDialogOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm Chapter
            </Button>
            <Link href={`/courses/${course.id}/students`}>
              <Button variant="outline" className="rounded-full font-bold border-slate-200">
                <Users className="mr-1.5 h-4 w-4" />
                Học sinh trong khóa
              </Button>
            </Link>
          </div>
        )}

        {/* Footer Banner: Bài tiếp theo & Nút Học tiếp ngay */}
        {role === "STUDENT" && (
          <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="text-xs sm:text-[13px] text-slate-500 font-medium">
              Bài tiếp theo:{" "}
              <strong className="font-extrabold text-slate-800">
                {nextLesson?.title ? nextLesson.title : "Đã hoàn thành toàn bộ bài học"}
              </strong>
            </div>

            {nextLesson ? (
              <Link href={`/courses/${course.id}/lessons/${nextLesson.id}`}>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#181F2C] px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-slate-950 transition-all active:scale-[0.98]"
                >
                  <PlayCircle className="size-4" />
                  <span>Học tiếp ngay</span>
                </button>
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-200 px-5 py-2.5 text-xs font-bold text-slate-400"
              >
                <span>Đã hết bài</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* DANH SÁCH CÁC CHAPTERS ĐỘC LẬP TỪNG THANH */}
      <div className="space-y-3 pt-2">
        <Accordion defaultValue={[]} className="space-y-3">
          {chapters.map((chapter: any, idx: number) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              index={idx}
              onAddLesson={
                role === "TEACHER"
                  ? (chapter) => {
                      setSelectedChapterForLesson(chapter);
                      setSelectedLesson(null);
                      setLessonDialogOpen(true);
                    }
                  : undefined
              }
              onEdit={
                role === "TEACHER"
                  ? (chapter) => {
                      setSelectedChapter(chapter);
                      setChapterDialogOpen(true);
                    }
                  : undefined
              }
              onDelete={
                role === "TEACHER"
                  ? (chapter) => {
                      setSelectedChapter(chapter);
                      setDeleteOpen(true);
                    }
                  : undefined
              }
            >
              <div className="space-y-2.5 pb-2 pt-3">
                {(chapter.lessons ?? []).length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-400">
                    Chương này chưa có bài học.
                  </div>
                )}
                {(chapter.lessons ?? []).map((lesson: any) => {
                  const isCompleted = lesson.progress?.completed ?? lesson.completed ?? false;
                  const isNext = role === "STUDENT" && lesson.id === nextLesson?.id;

                  return (
                  <div
                    key={lesson.id}
                    className={`group flex items-center gap-1 rounded-2xl border transition-all duration-200 hover:shadow-sm ${
                      isNext
                        ? "border-amber-200 bg-gradient-to-r from-white to-amber-50 shadow-sm"
                        : isCompleted
                        ? "border-emerald-100 bg-gradient-to-r from-white to-emerald-50/60 hover:border-emerald-200"
                        : "border-slate-200/80 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                    }`}
                  >
                    <Link
                      href={`/courses/${course.id}/lessons/${lesson.id}`}
                      prefetch={false}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-3 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:gap-4 sm:p-4"
                    >
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl border sm:size-11 ${
                          isCompleted
                            ? "border-emerald-200 bg-emerald-100/70 text-emerald-600"
                            : isNext
                            ? "border-amber-200 bg-amber-100 text-amber-700"
                            : "border-slate-200 bg-slate-50 text-slate-400 group-hover:border-blue-200 group-hover:text-blue-600"
                        }`}
                      >
                        {isCompleted ? <CircleCheckBig className="size-5" /> : <PlayCircle className="size-5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block break-words text-sm font-bold leading-relaxed text-slate-700 group-hover:text-slate-950">
                          {lesson.title}
                        </span>
                        {(isCompleted || isNext) && (
                        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold sm:text-[11px]">
                          {isCompleted ? (
                            <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-emerald-700">Đã hoàn thành</span>
                          ) : isNext ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">Bài tiếp theo</span>
                          ) : null}
                        </div>
                        )}

                      </div>
                      <ChevronRight className={`hidden size-4 shrink-0 sm:block ${isNext ? "text-amber-500" : "text-slate-300 group-hover:text-blue-500"}`} />
                    </Link>

                    {role === "TEACHER" && (
                      <div className="flex shrink-0 gap-0.5 pr-2 sm:gap-1 sm:pr-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                          aria-label={`Chỉnh sửa bài học ${lesson.title}`}
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setSelectedChapterForLesson(chapter);
                            setLessonDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Xóa bài học ${lesson.title}`}
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setSelectedChapterForLesson(chapter);
                            setDeleteLessonOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </ChapterCard>
          ))}
        </Accordion>
      </div>

      <ChapterDialog
        open={chapterDialogOpen}
        chapter={selectedChapter}
        onClose={() => {
          setChapterDialogOpen(false);
          setSelectedChapter(null);
        }}
        onSubmit={selectedChapter ? updateChapter : createChapter}
      />

      <DeleteChapterDialog
        open={deleteOpen}
        chapter={selectedChapter}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedChapter(null);
        }}
        onDelete={deleteChapter}
      />

      <LessonDialog
        open={lessonDialogOpen}
        lesson={selectedLesson}
        onClose={() => {
          setLessonDialogOpen(false);
          setSelectedLesson(null);
          setSelectedChapterForLesson(null);
        }}
        onSubmit={selectedLesson ? updateLesson : createLesson}
      />

      <DeleteLessonDialog
        open={deleteLessonOpen}
        lesson={selectedLesson}
        onClose={() => {
          setDeleteLessonOpen(false);
          setSelectedLesson(null);
        }}
        onDelete={deleteLesson}
      />
    </div>
  );
}
