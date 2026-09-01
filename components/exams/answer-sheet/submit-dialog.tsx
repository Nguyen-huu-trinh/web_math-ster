"use client";

import {
  AlertTriangle,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SubmitDialogProps {
  open: boolean;

  submitting: boolean;

  answeredCount: number;

  totalQuestions: number;

  onOpenChange: (
    open: boolean
  ) => void;

  onConfirm: () => void;
}

export default function SubmitDialog({
  open,
  submitting,
  answeredCount,
  totalQuestions,
  onOpenChange,
  onConfirm,
}: SubmitDialogProps) {
  const unansweredCount = Math.max(
    totalQuestions -
      answeredCount,
    0
  );

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Xác nhận nộp bài
          </DialogTitle>

          <DialogDescription>
            Bạn có chắc chắn muốn nộp
            bài không?
          </DialogDescription>
        </DialogHeader>

        {/* ========================================
            SUMMARY
        ========================================= */}

        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="flex items-center justify-between text-sm">
            <span>
              Đã trả lời
            </span>

            <span className="font-semibold">
              {answeredCount}/
              {totalQuestions}
            </span>
          </div>

          {unansweredCount >
            0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
              <AlertTriangle className="size-4" />

              <span>
                Còn{" "}
                <strong>
                  {
                    unansweredCount
                  }
                </strong>{" "}
                câu chưa trả lời.
              </span>
            </div>
          )}
        </div>

        {/* ========================================
            FOOTER
        ========================================= */}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() =>
              onOpenChange(false)
            }
          >
            Tiếp tục làm bài
          </Button>

          <Button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
          >
            {submitting
              ? "Đang nộp..."
              : "Nộp bài"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}