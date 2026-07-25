"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import type { Course } from "@/types/course";

interface Props {
  open: boolean;
  loading?: boolean;
  course?: Course | null;

  onClose: () => void;

  onDelete: () => Promise<void>;
}

export function DeleteCourseDialog({
  open,
  loading = false,
  course,
  onClose,
  onDelete,
}: Props) {
  async function handleDelete() {
    await onDelete();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Delete Course
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this course?
          </p>

          <div className="rounded-lg border bg-muted p-3">
            <p className="font-medium">
              {course?.name}
            </p>

            {course?.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            This course will be moved to the recycle bin and
            can be restored within 7 days.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            disabled={loading}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}