"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateCourseSchema } from "@/validators/course.schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
      <DialogContent className="sm:max-w-xl">

        <DialogHeader>

          <DialogTitle>

            {course
              ? "Edit Course"
              : "Create Course"}

          </DialogTitle>

        </DialogHeader>

        <CourseForm
          value={form}
          onChange={setForm}
        />

        <DialogFooter>

          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save"}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
