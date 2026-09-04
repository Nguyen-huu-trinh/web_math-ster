"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Play,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  StudentExamItem,
} from "@/services/student-exam-client.service";

import {
  useStartExam,
} from "@/hooks/use-start-exam";

interface Props {
  exam: StudentExamItem;
}

export function OpenExamContent({
  exam,
}: Props) {
  const router = useRouter();

  const startExam = useStartExam();

  const [showStartDialog, setShowStartDialog] =
    useState(false);

  const [showPrerequisiteDialog, setShowPrerequisiteDialog] =
    useState(false);

  const [missingPrerequisites, setMissingPrerequisites] =
    useState<
      {
        id: string;
        title: string;
      }[]
    >([]);

  const [isStarting, setIsStarting] =
    useState(false);

  const startLockRef =
    useRef(false);

  // =====================================================
  // MỞ MODAL XÁC NHẬN
  // =====================================================

  function handleOpenStartDialog() {
    if (startLockRef.current) {
      return;
    }

    setShowStartDialog(true);
  }

  // =====================================================
  // HỦY
  // =====================================================

  function handleCancelStart() {
    if (isStarting) {
      return;
    }

    setShowStartDialog(false);
  }

  // =====================================================
  // BẮT ĐẦU BÀI THI
  // =====================================================

  async function handleStartExam() {
    if (startLockRef.current) {
      return;
    }

    startLockRef.current = true;
    setIsStarting(true);

    try {
      const attempt =
        await startExam.mutateAsync(
          exam.id
        );

      console.log(
        "[OPEN EXAM START]",
        {
          examId: exam.id,
          attemptId: attempt.id,
        }
      );

      setShowStartDialog(false);

      router.push(
        `/student-exams/${attempt.id}`
      );
    } catch (error: any) {
      console.error(
        "[OPEN EXAM] START ERROR",
        error
      );

      startLockRef.current = false;
      setIsStarting(false);

      // =================================================
      // ĐANG CÓ LƯỢT LÀM BÀI
      // =================================================

      if (
        error?.status === 409 &&
        error?.code === "EXAM_IN_PROGRESS"
      ) {
        setShowStartDialog(false);

        toast.warning(
          "Bài thi đang được diễn ra",
          {
            description:
              "Bạn đã có một lượt làm bài chưa nộp. Vui lòng tiếp tục lượt làm bài hiện tại.",
          }
        );

        return;
      }

      // =================================================
      // THIẾU BÀI KIỂM TRA TIÊN QUYẾT
      // =================================================

      if (
        error?.status === 403 &&
        error?.code ===
          "PREREQUISITE_NOT_COMPLETED"
      ) {
        setShowStartDialog(false);

        setMissingPrerequisites(
          error?.missingPrerequisites ?? []
        );

        setShowPrerequisiteDialog(true);

        return;
      }

      // =================================================
      // LỖI KHÁC
      // =================================================

      toast.error(
        error?.message ??
          "Không thể bắt đầu bài làm."
      );
    }
  }

  // =====================================================
  // BUTTON
  // =====================================================

  function renderButton() {
    if (exam.canStart) {
      return (
        <Button
          className="w-full md:w-32"
          onClick={handleOpenStartDialog}
          disabled={
            isStarting ||
            startExam.isPending
          }
        >
          {exam.attempts === 0
            ? "Làm bài"
            : "Làm lại"}
        </Button>
      );
    }

    if (exam.lastAttemptId) {
      return (
        <Button
          className="w-full md:w-32"
          variant="outline"
          onClick={() =>
            router.push(
              `/student-exams/${exam.lastAttemptId}?review=true`
            )
          }
        >
          Xem lại
        </Button>
      );
    }

    return (
      <Button
        className="w-full md:w-32"
        variant="outline"
        disabled
      >
        Không thể mở
      </Button>
    );
  }

  return (
    <>
      {/* ==================================================
          BUTTON
      ================================================== */}

      {renderButton()}

      {/* ==================================================
          START CONFIRM DIALOG
      ================================================== */}

      {showStartDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleCancelStart}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md max-h-[90vh] overflow-hidden rounded-2xl border border-border/50 bg-background shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 border-b px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Play className="h-5 w-5 fill-current" />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Bắt đầu làm bài?
                </h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {exam.title}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Bạn có chắc chắn muốn bắt đầu
                bài thi này không?
              </p>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Sau khi bắt đầu, hệ thống sẽ
                tính giờ ngay lập tức và ghi
                nhận lượt làm bài của bạn.
              </p>

              {/* Warning */}
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-destructive">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

                <div className="text-sm leading-5">
                  <span className="mb-1 block font-bold">
                    LƯU Ý QUAN TRỌNG
                  </span>

                  Nếu bạn thoát khỏi bài thi
                  giữa chừng, bài làm sẽ được
                  tính là{" "}
                  <strong className="underline underline-offset-2">
                    0 điểm
                  </strong>
                  .
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t bg-muted/20 px-5 py-3">
              <Button
                type="button"
                variant="outline"
                disabled={isStarting}
                onClick={handleCancelStart}
              >
                Hủy
              </Button>

              <Button
                type="button"
                disabled={
                  isStarting ||
                  startExam.isPending
                }
                onClick={handleStartExam}
                className="font-semibold"
              >
                {isStarting ||
                startExam.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang mở...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Bắt đầu ngay
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          PREREQUISITE DIALOG
      ================================================== */}

      {showPrerequisiteDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() =>
              setShowPrerequisiteDialog(false)
            }
          />

          {/* Modal */}
          <div className="relative max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-background shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="border-b bg-orange-50/70 px-5 py-4 dark:bg-orange-950/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-bold">
                    Chưa thể bắt đầu
                  </h2>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Bạn cần làm bài tiên quyết
                    trước.
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Để làm bài{" "}
                <span className="font-semibold text-foreground">
                  "{exam.title}"
                </span>
                , bạn cần làm các bài kiểm tra
                sau ít nhất một lần:
              </p>

              {/* Scrollable list */}
              <div className="mt-4 max-h-[280px] overflow-y-auto pr-1">
                <div className="space-y-2">
                  {missingPrerequisites.length >
                  0 ? (
                    missingPrerequisites.map(
                      (
                        prerequisite,
                        index
                      ) => (
                        <div
                          key={
                            prerequisite.id
                          }
                          className="flex items-center gap-3 rounded-xl border bg-muted/30 px-3 py-2.5"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold leading-5 text-foreground">
                              {
                                prerequisite.title
                              }
                            </p>

                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              Chưa có lượt làm
                              bài đã nộp
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-orange-100 px-2 py-1 text-[10px] font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                            Cần làm
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-900/50 dark:bg-orange-950/20 dark:text-orange-300">
                      Bạn chưa hoàn thành
                      bài kiểm tra tiên quyết
                      cần thiết.
                    </div>
                  )}
                </div>
              </div>

              {/* Note */}
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3 text-xs leading-5 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                <p>
                  Bạn chỉ cần{" "}
                  <strong>
                    làm và nộp bài
                  </strong>
                  . Không yêu cầu phải đạt
                  điểm ở các bài tiên quyết.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t bg-muted/20 px-5 py-3">
              <Button
                type="button"
                onClick={() =>
                  setShowPrerequisiteDialog(
                    false
                  )
                }
                className="px-5 font-semibold"
              >
                Đã hiểu
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}