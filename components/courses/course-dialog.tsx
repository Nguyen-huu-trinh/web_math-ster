"use client";

import { ManagementDialogHeader, managementDialogClass, managementFormClass, managementFooterClass, managementCancelClass, managementSaveClass } from "@/components/ui/management-dialog";
import { GraduationCap, Plus, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateCourseSchema } from "@/validators/course.schema";

import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  CourseForm,
  CourseFormValues,
} from "@/components/courses/course-form";

import type { Course } from "@/types/course";

interface Props {
  open: boolean;
  course: Course | null;
  onClose: () => void;
  onSubmit: (
    values: CourseFormValues
  ) => Promise<void>;
}

const defaultValues: CourseFormValues = {
  name: "",
  description: "",
  thumbnail_url: "",
  is_active: true,
  course_order: 0,
};

export function CourseDialog({
  open,
  course,
  onClose,
  onSubmit,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState<CourseFormValues>(
      defaultValues
    );

  useEffect(() => {
    if (!course) {
      setForm(defaultValues);
      return;
    }

    setForm({
      course_order: course.course_order ?? 0,
      name: course.name ?? "",
      description:
        course.description ?? "",
      thumbnail_url:
        course.thumbnail_url ?? "",
      is_active:
        course.is_active ?? true,
    });
  }, [course, open]);

  async function handleSubmit() {
    const parsed = CreateCourseSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
      return;
    }

    try {
      setLoading(true);

      await onSubmit({ ...form, ...parsed.data });

    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
    >
      <DialogContent className={managementDialogClass}>

        <ManagementDialogHeader icon={GraduationCap} title={course ? "Chỉnh Sửa Khóa Học" : "Tạo Khóa Học Mới"} description="Thiết lập thông tin khóa học cho học sinh" />

        <div className={managementFormClass}>
        <CourseForm
          value={form}
          onChange={setForm}
        />

        <DialogFooter className={managementFooterClass}>

          <Button
            variant="outline"
              className={managementCancelClass}
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>

          <Button
            className={managementSaveClass}
            onClick={handleSubmit}
            disabled={loading}
          >
            {course ? <Check className="size-5 text-amber-400" /> : <Plus className="size-5 text-amber-400" />}
            {loading ? "Đang lưu…" : course ? "Lưu thay đổi" : "Tạo khóa học"}
          </Button>

        </DialogFooter>
        </div>

      </DialogContent>
    </Dialog>
  );
}
