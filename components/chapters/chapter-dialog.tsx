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
      <DialogContent>

        <DialogHeader>

          <DialogTitle>

            {chapter
              ? "Edit Chapter"
              : "New Chapter"}

          </DialogTitle>

        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(submit)}
          className="space-y-5"
        >

          <div>

            <Label>
              Chapter title
            </Label>

            <Input
              {...form.register("title", {
                required: true,
              })}
            />

          </div>

          <div>

            <Label>

              Order

            </Label>

            <Input
              type="number"
              {...form.register(
                "order_index",
                {
                  valueAsNumber: true,
                }
              )}
            />

          </div>

          <DialogFooter>

            <Button
              variant="outline"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
            >
              Save
            </Button>

          </DialogFooter>

        </form>

      </DialogContent>
    </Dialog>
  );
}