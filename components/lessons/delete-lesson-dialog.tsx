"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  lesson: any;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteLessonDialog({
  open,
  lesson,
  onClose,
  onDelete,
}: Props) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(open: boolean) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete Lesson
          </AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete

            <strong>
              {" "}
              {lesson?.title}
            </strong>

            ?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}