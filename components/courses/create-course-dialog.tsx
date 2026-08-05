"use client";

import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { CourseForm } from "./course-form";

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
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-xl">

        <DialogHeader>

          <DialogTitle>
            Chỉnh sửa khóa học
          </DialogTitle>

        </DialogHeader>

        <CourseForm
          loading={updateCourse.isPending}
          submitText="Lưu thay đổi"
          defaultValues={{
            name: course.name,
            description:
              course.description ?? "",
            thumbnail_url:
              course.thumbnail_url ?? "",
            is_active:
              course.is_active,
          }}
          onSubmit={handleUpdate}
        />

      </DialogContent>
    </Dialog>
  );
}
