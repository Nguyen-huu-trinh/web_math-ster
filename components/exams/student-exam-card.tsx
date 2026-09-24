"use client";
import { StartExamDialog } from "@/components/exams/start-exam-dialog";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import {
  Calendar,
  Clock3,
  Star,
  Play,
  RotateCcw,
  Eye,
  AlertTriangle,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StudentExamItem } from "@/services/student-exam-client.service";
import { useStartExam } from "@/hooks/use-start-exam";

interface Props {
  exam: StudentExamItem;
}

export function StudentExamCard({ exam }: Props) {
  const router = useRouter();
  const startExam = useStartExam();

  const [isStarting, setIsStarting] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const startLockRef = useRef(false);

  const [showPrerequisiteDialog, setShowPrerequisiteDialog] = useState(false);
  const [missingPrerequisites, setMissingPrerequisites] = useState<
    { id: string; title: string }[]
  >([]);

  // API ánh xạ is_passed của lượt làm bài thành PASSED / FAILED.
  const isPassed = exam.status === "PASSED";
  const isFailed = exam.status === "FAILED";

  // Đồng bộ nền, viền và điểm nhấn theo trạng thái bài thi.
  const palette = exam.inProgress
    ? {
        surface: "border-blue-200/80 to-blue-50/80 hover:border-blue-300",
        accent: "before:border-l-blue-500",
        dot: "bg-blue-500 ring-4 ring-blue-100/70",
        progress: "from-blue-400 to-blue-600",
        title: "group-hover:text-blue-700",
      }
    : exam.status === "LOCKED"
    ? {
        surface: "border-slate-200 to-slate-100/60 hover:border-slate-300",
        accent: "before:border-l-slate-300",
        dot: "bg-slate-400 ring-4 ring-slate-100",
        progress: "from-slate-300 to-slate-400",
        title: "group-hover:text-slate-700",
      }
    : isPassed
    ? {
        surface: "border-emerald-200/70 to-emerald-50/80 hover:border-emerald-300",
        accent: "before:border-l-emerald-500",
        dot: "bg-emerald-500 ring-4 ring-emerald-100/70",
        progress: "from-emerald-400 to-emerald-600",
        title: "group-hover:text-emerald-700",
      }
    : isFailed
    ? {
        surface: "border-red-200/70 to-red-50/70 hover:border-red-300",
        accent: "before:border-l-red-500",
        dot: "bg-red-400 ring-4 ring-red-100/70",
        progress: "from-red-300 to-red-500",
        title: "group-hover:text-red-700",
      }
    : {
        surface: "border-slate-200 to-amber-50/30 hover:border-amber-200",
        accent: "before:border-l-amber-600/80",
        dot: "bg-amber-600/70 ring-4 ring-amber-50",
        progress: "from-amber-200 to-amber-500/70",
        title: "group-hover:text-amber-800",
      };

  /* ==========================================
   * RENDER STATUS BADGE
   * ========================================== */
  function renderStatus() {
    switch (exam.status) {
      case "LOCKED":
        return (
          <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
            Đang khóa
          </span>
        );
      case "PASSED":
        return (
          <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
            Đạt chuẩn
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
            Chưa đạt
          </span>
        );
      case "DONE":
        return (
          <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600">
            Đã làm
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md border border-amber-200/70 bg-amber-50/60 px-2 py-0.5 text-[11px] font-bold text-amber-800">
            Chưa làm
          </span>
        );
    }
  }

  /* ==========================================
   * RENDER SCORE
   * ========================================== */
  function renderScore() {
    if (exam.lastScore === null || exam.lastScore === undefined || exam.attempts === 0) {
      return (
        <span className="font-mono text-sm font-semibold text-slate-400">
          -- / 10
        </span>
      );
    }

    const scoreNum = Number(exam.lastScore);

    if (isPassed) {
      return (
        <div className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50/70 px-2.5 py-1 font-mono text-xs font-black text-emerald-600 shadow-2xs">
          {scoreNum >= 9 && <Star className="size-3 fill-emerald-500 text-emerald-500" />}
          <span>{scoreNum.toFixed(1)}</span>
        </div>
      );
    }

    if (!isFailed) {
      return (
        <div className="inline-flex items-center rounded-xl border border-blue-200 bg-blue-50/70 px-2.5 py-1 font-mono text-xs font-black text-blue-600 shadow-2xs">
          <span>{scoreNum.toFixed(1)}</span>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center rounded-xl border border-red-200 bg-red-50/70 px-2.5 py-1 font-mono text-xs font-black text-red-600 shadow-2xs">
        <span>{scoreNum.toFixed(1)}</span>
      </div>
    );
  }

  /* ==========================================
   * DIALOG CONTROLS
   * ========================================== */
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

  /* ==========================================
   * RENDER NÚT BẤM (MÀU DỊU NHẸ, THANH THOÁT)
   * ========================================== */
  function renderButton() {
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

    // Nút chính dùng gradient vàng ấm, chữ tối để dễ đọc.
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

  const attemptRatio = Math.min(100, (exam.attempts / (exam.maxAttempts || 1)) * 100);

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-[20px] border bg-white bg-gradient-to-r from-white via-white px-5 py-4 shadow-2xs transition-all hover:shadow-sm before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border-l-[5px] ${palette.surface} ${palette.accent}`}
      >
        {/* GRID LAYOUT 12 CỘT CỐ ĐỊNH: ĐẢM BẢO TẤT CẢ CÁC HÀNG THẲNG ĐỀU TẮP */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
          
          {/* CỘT 1: THÔNG TIN BÀI THI (Chiếm 5 cột trên Desktop) */}
          <div className="flex items-start gap-3 min-w-0 lg:col-span-5">
            <div className={`mt-1.5 size-2.5 shrink-0 rounded-full ${palette.dot}`} />
            
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className={`truncate text-[14px] font-black tracking-tight text-slate-900 transition-colors ${palette.title}`}>
                {exam.title}
              </h3>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                  {exam.courseName}
                </span>
                <span className="text-slate-300">•</span>
                {renderStatus()}
{/* {exam.category === "ATTENDANCE" ? (
  <span className="rounded-md border border-slate-200/80 bg-white/80 px-1.5 py-0.5 text-[10.5px] font-bold text-slate-600">
    Điểm danh
  </span>
) : (
  <span className="rounded-md border border-slate-200/80 bg-white/80 px-1.5 py-0.5 text-[10.5px] font-bold text-slate-600">
    Định kì
  </span>
)} */}
              </div>
            </div>
          </div>

          {/* CỘT 2: THỜI GIAN & NGÀY THI (Chiếm 2 cột) */}
          <div className="flex flex-row lg:flex-col justify-start gap-1 text-xs text-slate-500 lg:col-span-2">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock3 className="size-3.5 text-slate-400 shrink-0" />
              <span>{exam.duration} phút</span>
            </div>

            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="size-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {exam.lastAttemptAt
                  ? `Gần nhất: ${new Date(exam.lastAttemptAt).toLocaleDateString("vi-VN")}`
                  : "Gần nhất: _ _"}
              </span>
            </div>
          </div>

          {/* CỘT 3: SỐ LƯỢT LÀM & PROGRESS BAR (Chiếm 2 cột) */}
          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <div className="text-xs font-bold text-slate-700">
              {exam.attempts} / {exam.maxAttempts} lượt
            </div>
            <div className="h-1 w-20 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full bg-gradient-to-r transition-all duration-300 ${palette.progress}`}
                style={{ width: `${attemptRatio}%` }}
              />
            </div>
          </div>

          {/* CỘT 4: ĐIỂM SỐ (Chiếm 1 cột, căn giữa) */}
          <div className="flex items-center justify-start lg:justify-center lg:col-span-1">
            {renderScore()}
          </div>

          {/* CỘT 5: CÁC NÚT ĐIỀU KHIỂN (Chiếm 2 cột, căn lề phải) */}
          <div className="flex items-center justify-end lg:col-span-2">
            {renderButton()}
          </div>

        </div>
      </div>

      {/* ==========================================
          MODAL XÁC NHẬN BẮT ĐẦU BÀI THI
      ========================================== */}
      {showStartDialog && (
        <StartExamDialog exam={exam} busy={isStarting || startExam.isPending} onClose={handleCancelStart} onStart={handleStartExam} />
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
