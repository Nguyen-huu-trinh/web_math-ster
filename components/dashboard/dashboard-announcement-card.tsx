"use client";
import { StartExamDialog } from "@/components/exams/start-exam-dialog";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  ArrowRight,
  AlertTriangle,
  Flame,
  Pin,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStartExam } from "@/hooks/use-start-exam";
import type { StudentExamItem } from "@/services/student-exam-client.service";

interface AnnouncementData {
  title?: string | null;
  content?: string | null;
}

interface Props {
  announcement?: AnnouncementData | null;
  periodicNotifications: StudentExamItem[];
}

export function DashboardAnnouncementCard({
  announcement,
  periodicNotifications,
}: Props) {
  const router = useRouter();
  const startExam = useStartExam();
  // Filter creates a new array: sorting never mutates the parent's query data.
  // Most overdue first, then today, then the nearest upcoming deadline.
  const availableNotifications = periodicNotifications
    .filter((exam) => exam.periodicDaysRemaining != null)
    .sort((a, b) => a.periodicDaysRemaining! - b.periodicDaysRemaining!);

  const [selectedExam, setSelectedExam] = useState<StudentExamItem | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const startLockRef = useRef(false);

  const [showPrerequisiteDialog, setShowPrerequisiteDialog] = useState(false);
  const [missingPrerequisites, setMissingPrerequisites] = useState<
    { id: string; title: string }[]
  >([]);

  const hasTeacherAnnouncement = Boolean(
    (announcement?.title && announcement.title.trim() !== "") ||
    (announcement?.content && announcement.content.trim() !== "")
  );

  const overdueCount = availableNotifications.filter(
    (exam) => (exam.periodicDaysRemaining ?? 0) < 0
  ).length;

  // Nếu không có thông báo và cũng không có bài kiểm tra đến hạn -> Ẩn toàn bộ
  if (!hasTeacherAnnouncement && availableNotifications.length === 0) {
    return null;
  }

  /* ====================================================
   * LOGIC MỞ DIALOG BẮT ĐẦU BÀI THI
   * ==================================================== */
  function handleExamActionClick(exam: StudentExamItem) {
    if (exam.inProgress && exam.lastAttemptId) {
      router.push(`/student-exams/${exam.lastAttemptId}`);
      return;
    }

    if (!exam.canStart && exam.lastAttemptId) {
      router.push(`/student-exams/${exam.lastAttemptId}?review=true`);
      return;
    }

    setSelectedExam(exam);
    setShowStartDialog(true);
  }

  async function handleStartExam() {
    if (!selectedExam || startLockRef.current) return;
    startLockRef.current = true;
    setIsStarting(true);

    try {
      const attempt = await startExam.mutateAsync(selectedExam.id);
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

  return (
    <>
      <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs">
        {/* HEADER CỐ ĐỊNH: ICON CHUÔNG & TIÊU ĐỀ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-xs">
              <BellRing className="size-4.5 stroke-[2.2]" />
            </div>

            <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-none">
              Thông Báo Học Vụ Quan Trọng
            </h3>
          </div>

          {/* Badge đếm số bài quá hạn ở góc phải */}
          {overdueCount > 0 && (
            <div className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 shadow-2xs">
              <Flame className="size-3 fill-rose-500 text-rose-500" />
              <span>{overdueCount} Bài Quá Hạn</span>
            </div>
          )}
        </div>

        {/* KHỐI THÔNG BÁO TỪ GIÁO VIÊN */}
        {hasTeacherAnnouncement && (
          <div className="mt-3 rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-amber-50/90 p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#FBBF24] text-slate-950 shadow-2xs mt-0.5">
                <Pin className="size-3.5" />
              </div>

              <div className="flex-1 space-y-1">
                {announcement?.title && announcement.title.trim() !== "" && (
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-amber-950">
                    {announcement.title}
                  </h4>
                )}

                {announcement?.content && announcement.content.trim() !== "" && (
                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-amber-900 whitespace-pre-line">
                    {announcement.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DANH SÁCH BÀI THI QUÁ HẠN / SẮP HẾT HẠN (Đã giới hạn chiều cao hiển thị đúng 3 dòng) */}
        {availableNotifications.length > 0 && (
          <div
            role="region"
            aria-label="Hạn nộp bài thi, ưu tiên bài quá hạn và hạn gần nhất"
            tabIndex={0}
            className="mt-3 max-h-[10.5rem] divide-y divide-slate-100 overflow-y-auto overscroll-y-contain bg-white [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#cbd5e1_#ffffff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          >
            {availableNotifications.map((exam) => {
              const days = exam.periodicDaysRemaining;
              if (days === null || days === undefined) return null;

              const isOverdue = days < 0;
              const isToday = days === 0;
              const title = exam.title.trim();
              const trailingNumber = title.match(/\d+$/)?.[0];
              const examLabel = trailingNumber
                ? trailingNumber.padStart(2, "0")
                : Array.from(title).pop() ?? "—";

              return (
                <div
                  key={exam.id}
                  className="flex flex-col justify-between gap-3 bg-white py-3.5 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div
                      className={`flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border px-2 text-sm font-bold tabular-nums ${
                        isOverdue
                          ? "border-rose-200 bg-rose-50 text-rose-600"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {examLabel}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="break-words text-sm font-bold tracking-tight text-slate-900">
                          Bài thi {exam.title}
                        </span>

                        {isOverdue ? (
  <span className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600">
    Quá hạn {Math.abs(days)} ngày
  </span>
) : isToday ? (
  <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
    Hết hạn hôm nay
  </span>
) : days === 1 ? (
  <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
    Hết hạn ngày mai
  </span>
) : (
  <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
    Còn {days} ngày
  </span>
)}
                      </div>

                      {exam.description && (
                        <p className="mt-0.5 max-w-xl break-words text-xs font-medium text-slate-400">
                          Chuyên đề: {exam.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    {isOverdue ? (
                      <button
                        type="button"
                        onClick={() => handleExamActionClick(exam)}
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-[#E91148] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
                      >
                        <span>Nộp bài bù ngay</span>
                        <ArrowRight className="size-3.5 stroke-[2.2]" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleExamActionClick(exam)}
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-[#101527] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                      >
                        <span>Vào làm bài ngay</span>
                        <ArrowRight className="size-3.5 text-[#FBBF24]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showStartDialog && selectedExam && (
        <StartExamDialog exam={selectedExam} busy={isStarting || startExam.isPending} onClose={() => { if (!isStarting) setShowStartDialog(false); }} onStart={handleStartExam} />
      )}

      {showPrerequisiteDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setShowPrerequisiteDialog(false)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-150 bg-white p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="size-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Chưa thể bắt đầu bài thi
                </h2>
                <p className="text-xs font-medium text-slate-400">
                  Cần hoàn thành các bài kiểm tra trước
                </p>
              </div>
            </div>

            <div className="mt-3.5 space-y-2">
              <p className="text-xs text-slate-500">
                Bạn cần làm và đạt điểm các bài kiểm tra sau trước khi mở đề này:
              </p>

              <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
                {missingPrerequisites.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-700"
                  >
                    <span>{idx + 1}. {item.title}</span>
                    <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] text-rose-700">
                      Cần làm
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                onClick={() => setShowPrerequisiteDialog(false)}
                className="h-9 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800"
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