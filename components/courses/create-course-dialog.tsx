"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { CourseForm } from "./course-form";

import {
  courseRepository,
  CreateCourseDto,
} from "@/repositories/course.repository";

import type { Course } from "@/types/course";

interface Props {
  open: boolean;
  course: Course | null;
  onOpenChange(open: boolean): void;
  onUpdated(): Promise<void> | void;
}
const courseId = course?.id;
export function EditCourseDialog({
  open,
  course,
  onOpenChange,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!course) return null;

  async function handleUpdate(
  values: CreateCourseDto
) {
  if (!courseId) return;

  try {
    setLoading(true);

    await courseRepository.update(
      courseId,
      values
    );

    toast.success("Cập nhật khóa học thành công.");

    onOpenChange(false);

    await onUpdated();
  } catch (error: any) {
    toast.error(
      error.message ??
      "Không thể cập nhật khóa học."
    );
  } finally {
    setLoading(false);
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
          loading={loading}
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