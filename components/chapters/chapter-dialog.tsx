"use client";

import { ManagementDialogHeader, managementDialogClass, managementFormClass, managementFooterClass, managementCancelClass, managementSaveClass } from "@/components/ui/management-dialog";
import { FolderPlus, Plus, Check } from "lucide-react";
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

import type { Chapter } from "@/types/chapter";

interface Props {
  open: boolean;

  chapter: Chapter | null;

  onClose: () => void;

  onSubmit: (values: {
    title: string;
    order_index: number;
  }) => Promise<void>;
}

export function ChapterDialog({
  open,
  chapter,
  onClose,
  onSubmit,
}: Props) {
  const form = useForm({
    defaultValues: {
      title: "",
      order_index: 1,
    },
  });

  useEffect(() => {
    if (chapter) {
      form.reset({
        title: chapter.title,
        order_index: chapter.order_index,
      });
    } else {
      form.reset({
        title: "",
        order_index: 1,
      });
    }
  }, [chapter]);

  async function submit(values: any) {
    await onSubmit(values);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className={managementDialogClass}>

        <ManagementDialogHeader icon={FolderPlus} title={chapter ? "Chỉnh Sửa Chương" : "Thêm Chương Mới"} description="Sắp xếp nội dung khóa học theo từng chương" />

        <form
          onSubmit={form.handleSubmit(submit)}
          className={managementFormClass}
        >

          <div className="space-y-2">

            <Label>
              Tên chương <span className="text-rose-500">*</span>
            </Label>

            <Input
              placeholder="VD: Chương 1. Ứng dụng đạo hàm…"
              {...form.register("title", {
                required: true,
              })}
            />

          </div>

          <div className="space-y-2">

            <Label>

              Thứ tự

            </Label>

            <Input
              type="number"
              min={1}
              {...form.register(
                "order_index",
                {
                  valueAsNumber: true,
                }
              )}
            />

          </div>

          <DialogFooter className={managementFooterClass}>

            <Button
              variant="outline"
              className={managementCancelClass}
              type="button"
              onClick={onClose}
            >
              Hủy
            </Button>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className={managementSaveClass}
            >
              {chapter ? <Check className="size-5 text-amber-400" /> : <Plus className="size-5 text-amber-400" />}
              {form.formState.isSubmitting ? "Đang lưu…" : chapter ? "Lưu thay đổi" : "Thêm chương"}
            </Button>

          </DialogFooter>

        </form>

      </DialogContent>
    </Dialog>
  );
}