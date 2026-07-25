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
  onOpenChange: (open: boolean) => void;

  examTitle: string;

  onConfirm: () => void;

  loading?: boolean;
}

export function ExamDeleteDialog({
  open,
  onOpenChange,
  examTitle,
  onConfirm,
  loading = false,
}: Props) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>

        <AlertDialogHeader>

          <AlertDialogTitle>
            Xóa đề thi?
          </AlertDialogTitle>

          <AlertDialogDescription>

            Bạn sắp xóa đề

            <strong className="mx-1">
              "{examTitle}"
            </strong>

            .

            <br />

            Đề thi sẽ được chuyển sang trạng thái
            <strong> Deleted </strong>

            và có thể khôi phục trong vòng 7 ngày.

          </AlertDialogDescription>

        </AlertDialogHeader>

        <AlertDialogFooter>

          <AlertDialogCancel>
            Hủy
          </AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading
              ? "Đang xóa..."
              : "Xóa đề"}
          </AlertDialogAction>

        </AlertDialogFooter>

      </AlertDialogContent>
    </AlertDialog>
  );
}