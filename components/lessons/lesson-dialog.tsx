"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {lesson ? "Edit Lesson" : "Create Lesson"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(submit)}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="title">
              Lesson Title
            </Label>

            <Input
              id="title"
              placeholder="Lesson title..."
              {...register("title", {
                required: "Lesson title is required",
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">
              Order
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

          <div className="flex items-center gap-2">
            <input
              id="active"
              type="checkbox"
              {...register("is_active")}
            />

            <Label htmlFor="active">
              Active
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {lesson ? "Update Lesson" : "Create Lesson"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}