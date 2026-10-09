"use client";

import { toast } from "sonner";

import { CourseDialog } from "./course-dialog";

import type { CreateCourseDto } from "@/repositories/course.repository";
import { useUpdateCourse } from "@/hooks/use-courses";

import type { Course } from "@/types/course";

interface Props {
  open: boolean;
  course: Course | null;
  onOpenChange(open: boolean): void;
}
export function EditCourseDialog({
  open,
  course,
  onOpenChange,
}: Props) {
  const updateCourse = useUpdateCourse();

  if (!course) return null;

  async function handleUpdate(
  values: CreateCourseDto
) {
  if (!course) return;

  try {
    await updateCourse.mutateAsync({
      id: course.id,
      values,
    });

    toast.success("Cập nhật khóa học thành công.");

    onOpenChange(false);

  } catch (error: any) {
    toast.error(
      error.message ??
      "Không thể cập nhật khóa học."
    );
  }
}

  return (
    <CourseDialog
      open={open}
      course={course}
      onClose={() => onOpenChange(false)}
      onSubmit={handleUpdate}
    />
  );
}
