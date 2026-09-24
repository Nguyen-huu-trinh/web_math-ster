"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";

import type { CreateCourseDto } from "@/repositories/course.repository";
import { CourseCard } from "@/components/courses/course-card";
import { CourseDialog } from "@/components/courses/course-dialog";
import { DeleteCourseDialog } from "@/components/courses/delete-course-dialog";
import { Button } from "@/components/ui/button";
import CourseClientView from "@/app/(app)/courses/[courseId]/course-client-view";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

import { useAuth } from "@/providers/auth-provider";
import type { Course } from "@/types/course";
import {
  useCourses,
  useCreateCourse,
  useDeleteCourse,
  useRestoreCourse,
  useUpdateCourse,
} from "@/hooks/use-courses";
import { toast } from "sonner";
import { UpdateCourseInput } from "@/validators/course.schema";

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-slate-400">Đang tải danh sách khóa học...</div>}>
      <CoursesContent />
    </Suspense>
  );
}

function CoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCourseId = searchParams.get("courseId");
  const queryChapterId = searchParams.get("chapterId");
  const { profile } = useAuth();
  const role = profile?.role;

  const coursesQuery = useCourses();
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();
  const restoreCourseMutation = useRestoreCourse();

  const courses = coursesQuery.courses ?? [];
  const loading = coursesQuery.isLoading;

  const [query, setQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(queryCourseId);

  useEffect(() => {
    if (queryCourseId) setSelectedCourseId(queryCourseId);
  }, [queryCourseId]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [courses, query]);

  // Tự động chọn khóa học đầu tiên khi có dữ liệu
  useEffect(() => {
    if (!selectedCourseId && filteredCourses.length > 0) {
      setSelectedCourseId(filteredCourses[0].id);
    }
  }, [filteredCourses, selectedCourseId]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  async function createCourse(values: CreateCourseDto) {
    try {
      const created = await createCourseMutation.mutateAsync(values);
      toast.success("Tạo khóa học thành công");
      setDialogOpen(false);

      const courseId = (created as { id?: string } | undefined)?.id;
      if (courseId) {
        setSelectedCourseId(courseId);
      }
    } catch {
      toast.error("Không thể tạo khóa học");
    }
  }

  async function updateCourse(values: UpdateCourseInput) {
    if (!editingCourse) return;
    try {
      await updateCourseMutation.mutateAsync({
        id: editingCourse.id,
        values,
      });
      toast.success("Cập nhật khóa học thành công");
      setDialogOpen(false);
      setEditingCourse(null);
    } catch {
      toast.error("Không thể cập nhật khóa học");
    }
  }

  async function deleteCourse() {
    if (!editingCourse) return;
    try {
      await deleteCourseMutation.mutateAsync(editingCourse.id);
      toast.success("Đã xóa khóa học");
      setDeleteOpen(false);
      if (selectedCourseId === editingCourse.id) {
        setSelectedCourseId(null);
      }
      setEditingCourse(null);
    } catch {
      toast.error("Không thể xóa khóa học");
    }
  }

  function handleCourseClick(course: Course) {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      router.push(`/courses/${course.id}`);
      return;
    }
    setSelectedCourseId(course.id);
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1440px] mx-auto px-2 sm:px-4 pb-12">
      {/* HEADER TRANG & THANH TÌM KIẾM PILL CHUẨN MOCKUP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Khóa học
          </h1>
          <p className="mt-1 text-sm font-semibold italic text-slate-400">
            {role === "TEACHER"
              ? "Quản lý khóa học, chương và các bài giảng trực tuyến."
              : "Vô học bớt lười đi."}
          </p>
        </div>

        {/* Thanh tìm kiếm Pill và Nút Tạo khóa học */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-[280px]">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Search className="size-4.5 stroke-[2.5]" />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm khoá học..."
              className="h-11 w-full rounded-full border border-slate-200/90 bg-white pl-11 pr-5 text-sm font-medium text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all focus:border-amber-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

          {role === "TEACHER" && (
            <Button
              className="h-11 shrink-0 rounded-full px-5 font-bold shadow-xs bg-slate-900 hover:bg-slate-800 text-white"
              onClick={() => {
                setEditingCourse(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Tạo khóa học
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center font-medium text-slate-400">
          Đang tải danh sách khóa học...
        </div>
      ) : filteredCourses.length === 0 ? (
        <Empty className="rounded-3xl border border-slate-200 bg-white p-12">
          <EmptyHeader>
            <EmptyTitle>Không tìm thấy khóa học nào</EmptyTitle>
            <EmptyDescription>
              {query ? "Thử tìm kiếm với từ khóa khác." : "Chưa có khóa học nào được tạo."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        /* CẤU TRÚC 2 CỘT MASTER-DETAIL (DESKTOP: 340px - 1fr) */
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          {/* CỘT TRÁI: Danh sách khóa học */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1 text-[11.5px] font-black uppercase tracking-wider text-slate-400">
              <span>DANH SÁCH KHÓA HỌC</span>
              <span>{filteredCourses.length} KHÓA</span>
            </div>

            <div className="flex flex-col gap-3">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isActive={course.id === selectedCourseId}
                  onSelect={() => handleCourseClick(course)}
                  onEdit={() => {
                    setEditingCourse(course);
                    setDialogOpen(true);
                  }}
                  onDelete={() => {
                    setEditingCourse(course);
                    setDeleteOpen(true);
                  }}
                />
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: KHUNG TRẮNG CHỨA CHI TIẾT KHÓA HỌC NHÚNG CHUẨN HÌNH MẪU */}
          <div className={queryCourseId ? "block" : "hidden lg:block"}>
            <div className="min-h-[600px] rounded-[32px] border border-slate-200/80 bg-white p-5 sm:p-7 shadow-2xs">
              {selectedCourseId ? (
                <CourseClientView
                  key={selectedCourseId}
                  courseId={selectedCourseId}
                  embedded={true}
                  initialChapterId={selectedCourseId === queryCourseId ? queryChapterId ?? undefined : undefined}
                />
              ) : (
                <div className="flex h-full min-h-[500px] flex-col items-center justify-center text-center">
                  <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 text-xl">
                    📚
                  </div>
                  <p className="text-sm font-bold text-slate-600">
                    Chưa chọn khóa học
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Chọn một khóa học từ danh sách bên trái để bắt đầu xem lộ trình.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DIALOGS DÀNH CHO GIÁO VIÊN */}
      <CourseDialog
        open={dialogOpen}
        course={editingCourse}
        onClose={() => {
          setDialogOpen(false);
          setEditingCourse(null);
        }}
        onSubmit={editingCourse ? updateCourse : createCourse}
      />

      <DeleteCourseDialog
        open={deleteOpen}
        course={editingCourse}
        onClose={() => {
          setDeleteOpen(false);
          setEditingCourse(null);
        }}
        onDelete={deleteCourse}
      />
    </div>
  );
}
