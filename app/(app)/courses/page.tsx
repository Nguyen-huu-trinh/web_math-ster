"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import type { CreateCourseDto } from "@/repositories/course.repository";
import { PageHeader } from "@/components/layout/page-header";
import { CourseCard } from "@/components/courses/course-card";
import { CourseDialog } from "@/components/courses/course-dialog";
import { DeleteCourseDialog } from "@/components/courses/delete-course-dialog";
import { CourseToolbar } from "@/components/courses/course-toolbar";
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

export const dynamic = 'force-static';

export default function CoursesPage() {
  const router = useRouter();
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
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [courses, query]);

  // Tự động chọn khóa học đầu tiên khi dữ liệu được nạp xong
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
      toast.success("Course created");
      setDialogOpen(false);
      
      const courseId = (created as { id?: string } | undefined)?.id;
      if (courseId) {
        setSelectedCourseId(courseId);
      }
    } catch {
      toast.error("Create failed");
    }
  }

  async function updateCourse(values: UpdateCourseInput) {
    if (!editingCourse) return;
    try {
      await updateCourseMutation.mutateAsync({
        id: editingCourse.id,
        values,
      });
      toast.success("Course updated");
      setDialogOpen(false);
      setEditingCourse(null);
    } catch {
      toast.error("Update failed");
    }
  }

  async function deleteCourse() {
    if (!editingCourse) return;
    try {
      await deleteCourseMutation.mutateAsync(editingCourse.id);
      toast.success("Course deleted");
      setDeleteOpen(false);
      if (selectedCourseId === editingCourse.id) {
        setSelectedCourseId(null);
      }
      setEditingCourse(null);
    } catch {
      toast.error("Delete failed");
    }
  }

  function handleCourseClick(course: Course) {
    // Trên màn hình mobile (<1024px): chuyển thẳng sang trang chi tiết
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      router.push(`/courses/${course.id}`);
      return;
    }
    // Trên desktop: cập nhật ID để hiển thị ở cột bên phải
    setSelectedCourseId(course.id);
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-2 sm:px-4">
      <PageHeader
        title="Khoá học"
        description={
          role === "TEACHER"
            ? "Manage your courses, chapters and lessons."
            : "Vô học bớt lười đi."
        }
      />

      <CourseToolbar keyword={query} onKeywordChange={setQuery}>
        {role === "TEACHER" && (
          <Button
            onClick={() => {
              setEditingCourse(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Button>
        )}
      </CourseToolbar>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Đang tải...</div>
      ) : filteredCourses.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No courses found</EmptyTitle>
            <EmptyDescription>There are no courses.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        /* Cấu trúc Master-Detail: 2 cột trên Desktop, 1 cột trên Mobile */
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          {/* Cột trái: Danh sách các khóa học */}
          <div className="flex flex-col gap-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
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

          {/* Cột phải (Chỉ hiện trên Desktop): Nhúng trực tiếp chi tiết khóa học */}
          <div className="hidden lg:block rounded-2xl border bg-card p-5 shadow-xs min-h-[500px]">
            {selectedCourseId ? (
              <CourseClientView
                key={selectedCourseId}
                courseId={selectedCourseId}
                embedded={true}
              />
            ) : (
              <div className="py-24 text-center text-muted-foreground text-sm">
                Chọn một khóa học từ danh sách bên trái để xem nội dung.
              </div>
            )}
          </div>
        </div>
      )}

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