"use client";

import { StartExamDialog } from "@/components/exams/start-exam-dialog";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Play,
  RotateCcw,
  Eye,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StudentExamItem } from "@/services/student-exam-client.service";
import { useStartExam } from "@/hooks/use-start-exam";

interface Props {
  exam: StudentExamItem;
}

export function OpenExamContent({ exam }: Props) {
  const router = useRouter();
  const startExam = useStartExam();

  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showPrerequisiteDialog, setShowPrerequisiteDialog] = useState(false);
  const [missingPrerequisites, setMissingPrerequisites] = useState<
    { id: string; title: string }[]
  >([]);

  const [isStarting, setIsStarting] = useState(false);
  const startLockRef = useRef(false);

  const isPassed = exam.status === "PASSED";
  const isFailed = exam.status === "FAILED";

  function handleOpenStartDialog() {
    if (startLockRef.current) return;
    setShowStartDialog(true);
  }

  function handleCancelStart() {
    if (isStarting) return;
    setShowStartDialog(false);
  }

  async function handleStartExam() {
    if (startLockRef.current) return;
    startLockRef.current = true;
    setIsStarting(true);

    try {
      const attempt = await startExam.mutateAsync(exam.id);
      setShowStartDialog(false);
      router.push(`/student-exams/${attempt.id}`);
    } catch (error: any) {
      startLockRef.current = false;
      setIsStarting(false);

      if (error?.status === 409 && error?.code === "EXAM_IN_PROGRESS") {
        setShowStartDialog(false);
        if (error?.attemptId) {
          router.push(`/student-exams/${error.attemptId}`);
        } else {
          toast.error("Không tìm thấy lượt làm bài đang diễn ra.");
        }
        return;
      }

      if (error?.status === 403 && error?.code === "PREREQUISITE_NOT_COMPLETED") {
        setShowStartDialog(false);
        setMissingPrerequisites(error?.missingPrerequisites ?? []);
        setShowPrerequisiteDialog(true);
        return;
      }

      toast.error(error?.message ?? "Không thể bắt đầu bài làm.");
    }
  }

  /* =====================================================
   * NÚT BẤM ĐỒNG BỘ 100% VỚI STUDENT_EXAM_CARD
   * ===================================================== */
  function renderButton() {
    // 1. Đề đang bị khóa
    if (exam.status === "LOCKED" && !exam.inProgress) {
      return (
        <Button
          className="h-9 w-28 rounded-xl border-slate-200 bg-slate-100 text-xs font-bold text-slate-400 cursor-not-allowed"
          variant="outline"
          disabled
        >
          <Lock className="mr-1.5 size-3.5" />
          Đang khóa
        </Button>
      );
    }

    // 2. Đang có bài làm dở dang
    if (exam.inProgress) {
      return (
        <Button
          className="h-9 w-32 rounded-xl border border-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-xs font-bold text-white shadow-xs shadow-blue-200/50 transition-all"
          onClick={() => {
            if (!exam.lastAttemptId) {
              toast.error("Không tìm thấy lượt làm bài đang diễn ra.");
              return;
            }
            router.push(`/student-exams/${exam.lastAttemptId}`);
          }}
        >
          <Play className="mr-1.5 size-3.5 fill-current" />
          Tiếp tục làm
        </Button>
      );
    }

    // 3. Đã hết lượt làm (chỉ xem lại)
    if (!exam.canStart) {
      return (
        <Button
          className="h-9 w-24 rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
          variant="outline"
          disabled={!exam.lastAttemptId}
          onClick={() => {
            if (!exam.lastAttemptId) return;
            router.push(`/student-exams/${exam.lastAttemptId}?review=true`);
          }}
        >
          <Eye className="mr-1.5 size-3.5 text-slate-400" />
          Xem lại
        </Button>
      );
    }

    // 4. Chưa làm lần nào (Làm bài)
    if (exam.attempts === 0) {
      return (
        <Button
          className="h-9 w-28 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-900 font-bold text-xs hover:from-amber-100 hover:to-amber-200/70 shadow-2xs transition-all active:scale-[0.98]"
          disabled={isStarting || startExam.isPending}
          onClick={handleOpenStartDialog}
        >
          <Play className="mr-1.5 size-3.5 fill-current" />
          Làm bài
        </Button>
      );
    }

    // 5. Đã từng làm và còn lượt (Làm lại + Xem lại)
    return (
      <div className="flex items-center gap-1.5">
        <Button
          className={`h-9 px-3 rounded-xl text-xs font-bold transition-all ${
            isFailed
              ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              : isPassed
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              : "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
          }`}
          disabled={isStarting || startExam.isPending}
          onClick={handleOpenStartDialog}
        >
          <RotateCcw className="mr-1 size-3" />
          Làm lại
        </Button>

        <Button
          variant="outline"
          className="h-9 px-3 rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
          disabled={!exam.lastAttemptId}
          onClick={() => {
            if (!exam.lastAttemptId) return;
            router.push(`/student-exams/${exam.lastAttemptId}?review=true`);
          }}
        >
          <Eye className="mr-1 size-3 text-slate-400" />
          Xem lại
        </Button>
      </div>
    );
  }

  return (
    <>
      {renderButton()}

      {showStartDialog && (
        <StartExamDialog
          exam={exam}
          busy={isStarting || startExam.isPending}
          onClose={handleCancelStart}
          onStart={handleStartExam}
        />
      )}

      {showPrerequisiteDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setShowPrerequisiteDialog(false)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-slate-150 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Chưa thể bắt đầu bài thi
                </h2>
                <p className="text-xs font-semibold text-slate-400">
                  Cần hoàn thành các bài kiểm tra trước
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs text-slate-500">
                Bạn cần làm và đạt điểm các bài kiểm tra sau trước khi mở đề này:
              </p>

              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {missingPrerequisites.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-700"
                  >
                    <span>{idx + 1}. {item.title}</span>
                    <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] text-red-700">
                      Cần làm
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={() => setShowPrerequisiteDialog(false)}
                className="h-10 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800"
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
