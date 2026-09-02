"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Calendar,
  Clock3,
  GraduationCap,
  Trophy,
} from "lucide-react";

import {
  StudentExamItem,
} from "@/services/student-exam-client.service";

import {
  useStartExam,
} from "@/hooks/use-start-exam";

interface Props {
  exam: StudentExamItem;
}

export function StudentExamCard({
  exam,
}: Props) {

  const router = useRouter();

  const startExam = useStartExam();

  const [isStarting, setIsStarting] =
    useState(false);

  const [showStartDialog, setShowStartDialog] =
    useState(false);

  const startLockRef =
    useRef(false);


  /*
   * ==========================================
   * STATUS
   * ==========================================
   */
  function renderStatus() {

    switch (exam.status) {

      case "LOCKED":
        return (
          <Badge className="border-orange-200 bg-orange-100 text-orange-700">
            Đang khóa
          </Badge>
        );

      case "NOT_STARTED":
        return (
          <Badge className="bg-gray-100 text-gray-700 border">
            Chưa làm
          </Badge>
        );

      case "PASSED":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Đạt
          </Badge>
        );

      case "FAILED":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            Chưa đạt
          </Badge>
        );

      case "DONE":
        return (
          <Badge variant="outline">
            Đã làm
          </Badge>
        );

      default:
        return null;
    }
  }


  /*
   * ==========================================
   * MỞ MODAL XÁC NHẬN
   * ==========================================
   */
  function handleOpenStartDialog() {

    if (startLockRef.current) {
      return;
    }

    setShowStartDialog(true);
  }


  /*
   * ==========================================
   * HỦY
   * ==========================================
   */
  function handleCancelStart() {

    if (isStarting) {
      return;
    }

    setShowStartDialog(false);
  }


  /*
   * ==========================================
   * BẮT ĐẦU BÀI THI THỰC SỰ
   * ==========================================
   */
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
        "[START EXAM FRONTEND]",
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
        "[STUDENT EXAM] START ERROR",
        error
      );

      startLockRef.current = false;
      setIsStarting(false);

      /*
       * ======================================
       * ĐÃ CÓ MỘT LƯỢT ĐANG LÀM
       * ======================================
       */
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

      /*
       * ======================================
       * LỖI KHÁC
       * ======================================
       */
      toast.error(
        error?.message ??
          "Không thể bắt đầu bài làm."
      );
    }
  }


  /*
   * ==========================================
   * BUTTON
   * ==========================================
   */
  function renderButton() {

    if (exam.status === "LOCKED") {

      return (
        <Button
          className="w-full md:w-32"
          variant="outline"
          disabled
        >
          Đang khóa
        </Button>
      );
    }

    if (!exam.canStart) {

      return (
        <Button
          className="w-full md:w-32"
          variant="outline"
          disabled={!exam.lastAttemptId}
          onClick={() => {

            if (!exam.lastAttemptId) {
              return;
            }

            router.push(
              `/student-exams/${exam.lastAttemptId}?review=true`
            );
          }}
        >
          Xem lại
        </Button>
      );
    }

    return (
      <Button
        className="w-full md:w-32"
        disabled={
          isStarting ||
          startExam.isPending
        }
        onClick={
          handleOpenStartDialog
        }
      >
        {exam.attempts === 0
          ? "Làm bài"
          : "Làm lại"}
      </Button>
    );
  }


  return (
    <>
      <Card className="transition-all duration-300 hover:border-primary/40 hover:shadow-md">

        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:gap-6 md:px-5 md:py-3">

{/* LEFT */}
<div className="flex-1 min-w-0">
  {/* Tiêu đề bài thi - Tự động xuống dòng khi tên đề dài */}
  <h3 className="text-base font-bold leading-snug text-foreground md:text-lg">
    {exam.title}
  </h3>

  {/* Hàng chứa thông tin phụ: Tên khóa học & Các Badge trạng thái */}
  <div className="mt-2 flex flex-wrap items-center gap-2">
    <span className="text-xs font-medium text-muted-foreground md:text-sm">
      {exam.courseName}
    </span>

    <span className="text-muted-foreground/40">•</span>

    <Badge variant="outline" className="text-xs">
      {exam.category === "ATTENDANCE" ? "Điểm danh" : "Định kỳ"}
    </Badge>

    {renderStatus()}
  </div>
</div>


          {/* CENTER */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:flex md:flex-1 md:justify-end md:gap-3">

            {/* THỜI GIAN */}
            <div className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-2 md:w-24 md:px-3">

              <div className="flex items-center gap-1 text-blue-700">

                <Clock3 className="h-3.5 w-3.5 shrink-0" />

                <span className="text-[10px] uppercase">
                  Thời gian
                </span>

              </div>

              <p className="mt-1 text-xs font-semibold text-blue-900">
                {exam.duration} phút
              </p>

            </div>


            {/* LƯỢT */}
            <div className="rounded-md border border-purple-100 bg-purple-50 px-2.5 py-2 md:w-24 md:px-3">

              <div className="flex items-center gap-1 text-purple-700">

                <GraduationCap className="h-3.5 w-3.5 shrink-0" />

                <span className="text-[10px] uppercase">
                  Lượt
                </span>

              </div>

              <p className="mt-1 text-xs font-semibold text-purple-900">
                {exam.attempts}/{exam.maxAttempts}
              </p>

            </div>


            {/* ĐIỂM */}
            <div className="rounded-md border border-yellow-100 bg-yellow-50 px-2.5 py-2 md:w-24 md:px-3">

              <div className="flex items-center gap-1 text-yellow-700">

                <Trophy className="h-3.5 w-3.5 shrink-0" />

                <span className="text-[10px] uppercase">
                  Điểm
                </span>

              </div>

              <p className="mt-1 text-xs font-semibold text-yellow-900">
                {exam.lastScore ?? "--"}
              </p>

            </div>


            {/* GẦN NHẤT */}
            <div className="rounded-md border border-green-100 bg-green-50 px-2.5 py-2 md:w-28 md:px-3">

              <div className="flex items-center gap-1 text-green-700">

                <Calendar className="h-3.5 w-3.5 shrink-0" />

                <span className="text-[10px] uppercase">
                  Gần nhất
                </span>

              </div>

              <p className="mt-1 whitespace-nowrap text-[11px] font-semibold text-green-900">

                {exam.lastAttemptAt
                  ? new Date(
                      exam.lastAttemptAt
                    ).toLocaleDateString(
                      "vi-VN"
                    )
                  : "Chưa làm"}

              </p>

            </div>

          </div>


          {/* RIGHT */}
          <div className="mt-2 flex w-full items-center md:mt-0 md:w-auto">
            {renderButton()}
          </div>

        </CardContent>

      </Card>


      {/* ==========================================
          START CONFIRM DIALOG
      ========================================== */}
{showStartDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop làm mờ hậu cảnh */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={handleCancelStart}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg rounded-2xl bg-background p-6 shadow-2xl border border-border/50 animate-in zoom-in-95 duration-200">
            {/* Header Icon + Title */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m10 8 6 4-6 4V8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Bắt đầu làm bài?
              </h2>
            </div>

            {/* Content Details */}
            <div className="mt-5 space-y-4">
              <p className="text-base leading-relaxed text-muted-foreground">
                Bạn có chắc chắn muốn bắt đầu làm bài thi{" "}
                <span className="font-bold text-foreground">
                  "{exam.title}"
                </span>{" "}
                không?
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Sau khi bắt đầu, hệ thống sẽ tính giờ ngay lập tức và ghi nhận lượt làm bài của bạn.
              </p>

              {/* Callout warning card */}
              <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 shrink-0 mt-0.5"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div className="text-sm leading-6">
                  <span className="font-bold block mb-1 text-base">LƯU Ý QUAN TRỌNG</span>
                  Nếu bạn thoát khỏi bài thi giữa chừng, bài làm sẽ được tính là{" "}
                  <strong className="underline underline-offset-2">0 điểm</strong>.
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-7 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isStarting}
                onClick={handleCancelStart}
                className="rounded-xl px-5 text-base"
              >
                Hủy
              </Button>

              <Button
                type="button"
                size="lg"
                disabled={isStarting || startExam.isPending}
                onClick={handleStartExam}
                className="rounded-xl px-6 text-base font-semibold shadow-md transition-all active:scale-95"
              >
                {isStarting || startExam.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Đang mở...
                  </span>
                ) : (
                  "Bắt đầu ngay"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}