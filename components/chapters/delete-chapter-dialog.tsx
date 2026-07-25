"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  chapter: any;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteChapterDialog({
  open,
  chapter,
  onClose,
  onDelete,
}: Props) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <AlertDialogContent>

        <AlertDialogHeader>

          <AlertDialogTitle>

            Delete Chapter

          </AlertDialogTitle>

          <AlertDialogDescription>

            Are you sure you want to delete

            <strong> {chapter?.title}</strong> ?

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