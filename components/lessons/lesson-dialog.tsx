"use client";

import { ManagementDialogHeader, managementDialogClass, managementFormClass, managementFooterClass, managementCancelClass, managementSaveClass } from "@/components/ui/management-dialog";
import { BookPlus, Plus, Check } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  title: string;
  order_index: number;
  is_active: boolean;
}

interface Props {
  open: boolean;
  lesson?: any;
  onClose: () => void;
  onSubmit: (values: FormData) => void | Promise<void>;
}

export function LessonDialog({
  open,
  lesson,
  onClose,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      order_index: 1,
      is_active: true,
    },
  });

  useEffect(() => {
    if (!open) return;

    reset({
      title: lesson?.title ?? "",
      order_index: lesson?.order_index ?? 1,
      is_active: lesson?.is_active ?? true,
    });
  }, [open, lesson, reset]);

  async function submit(values: FormData) {
    await onSubmit(values);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          reset({
            title: "",
            order_index: 1,
            is_active: true,
          });

          onClose();
        }
      }}
    >
      <DialogContent className={managementDialogClass}>
        <ManagementDialogHeader icon={BookPlus} title={lesson ? "Chỉnh Sửa Bài Học" : "Tạo Bài Học Mới"} description="Thêm bài giảng vào chương học hiện tại" />

        <form
          onSubmit={handleSubmit(submit)}
          className={managementFormClass}
        >
          <div className="space-y-2">
            <Label htmlFor="title">
              Tên bài học <span className="text-rose-500">*</span>
            </Label>

            <Input
              id="title"
              placeholder="VD: Bài 1. Sự đồng biến, nghịch biến của hàm số…"
              {...register("title", {
                required: "Vui lòng nhập tên bài học",
              })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_2fr] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="order">
              Thứ tự
            </Label>

            <Input
              id="order"
              type="number"
              min={1}
              {...register("order_index", {
                valueAsNumber: true,
                required: true,
              })}
            />
          </div>

          <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 px-4">
            <span className="size-2.5 shrink-0 rounded-full bg-emerald-500" />
            <input
              id="active"
              className="order-last ml-auto size-5 accent-slate-900"
              type="checkbox"
              {...register("is_active")}
            />

            <Label htmlFor="active">
              Hiển thị bài học (Active)
            </Label>
          </div>

          </div>

          <DialogFooter className={managementFooterClass}>
            <Button
              type="button"
              variant="outline"
              className={managementCancelClass}
              onClick={onClose}
            >
              Hủy
            </Button>

            <Button
              type="submit"
              className={managementSaveClass}
              disabled={isSubmitting}
            >
              {lesson ? <Check className="size-5 text-amber-400" /> : <Plus className="size-5 text-amber-400" />}
              {isSubmitting ? "Đang lưu…" : lesson ? "Lưu thay đổi" : "Tạo bài học"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}