"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  ArrowRight,
  Play,
  AlertTriangle,
  Flame,
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

  const overdueCount = periodicNotifications.filter(
    (exam) => (exam.periodicDaysRemaining ?? 0) < 0
  ).length;

  // Nếu không có thông báo và cũng không có bài kiểm tra đến hạn -> Ẩn toàn bộ
  if (!hasTeacherAnnouncement && periodicNotifications.length === 0) {
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
      <div className="rounded-[28px] border border-amber-200/80 bg-[#FFFDF8] p-5 sm:p-6 shadow-2xs">
        {/* HEADER CỐ ĐỊNH: ICON CHUÔNG HIỆN ĐẠI & TIÊU ĐỀ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div className="flex items-start gap-3.5">
            {/* Icon Squircle chuông gradient vàng hổ phách tinh tế */}
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-xs">
              <BellRing className="size-5.5 stroke-[2.3]" />
            </div>

            <div className="space-y-0.5">
              <h3 className="text-lg sm:text-[19px] font-black tracking-tight text-slate-900">
                Thông Báo Học Vụ Quan Trọng
              </h3>
              <p className="text-xs sm:text-[13px] font-semibold text-slate-500">
                Phải làm đạt tất cả bài tập điểm danh mới làm bài tập định kì
              </p>
            </div>
          </div>

          {/* Badge đếm số bài quá hạn ở góc phải */}
          {overdueCount > 0 && (
            <div className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-600 shadow-2xs">
              <Flame className="size-3.5 fill-rose-500 text-rose-500" />
              <span>{overdueCount} Bài Quá Hạn</span>
            </div>
          )}
        </div>

        {/* KHỐI THÔNG BÁO TỪ GIÁO VIÊN (NỔI BẬT & DỄ THẤY) */}
        {hasTeacherAnnouncement && (
          <div className="mt-3.5 rounded-2xl border-2 border-amber-300/90 bg-gradient-to-r from-amber-100/80 via-amber-50/90 to-amber-100/50 p-4 sm:p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white font-bold text-xs shadow-xs">
                📢
              </div>

              <div className="flex-1 space-y-1">
                {announcement?.title && announcement.title.trim() !== "" && (
                  <h4 className="text-sm sm:text-base font-black uppercase tracking-tight text-amber-950">
                    {announcement.title}
                  </h4>
                )}

                {announcement?.content && announcement.content.trim() !== "" && (
                  <p className="text-xs sm:text-[18px] font-semibold leading-relaxed text-amber-900 whitespace-pre-line">
                    {announcement.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DANH SÁCH BÀI THI QUÁ HẠN / SẮP HẾT HẠN */}
        {periodicNotifications.length > 0 && (
          <div className="mt-4 space-y-2.5">
            {periodicNotifications.map((exam) => {
              const days = exam.periodicDaysRemaining;
              if (days === null || days === undefined) return null;

              const isOverdue = days < 0;
              const isToday = days === 0;

              return (
                <div
                  key={exam.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:px-5 sm:py-3.5 shadow-2xs transition-all hover:border-slate-300"
                >
                  {/* Cột trái: Icon ! màu hồng/xanh + Tên bài thi + Badge ngày */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full font-black text-xs ${
                        isOverdue
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}
                    >
                      !
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm sm:text-[14.5px] font-black text-slate-800">
                          Bài thi {exam.title}
                        </span>

                        {isOverdue ? (
                          <span className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600">
                            Quá hạn {Math.abs(days)} ngày
                          </span>
                        ) : isToday ? (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-black text-amber-700">
                            Hết hạn hôm nay
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                            Còn {days} ngày
                          </span>
                        )}
                      </div>

                      {exam.description && (
                        <p className="mt-0.5 truncate text-[11.5px] font-medium text-slate-400 max-w-xl">
                          Chuyên đề: {exam.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cột phải: Nút hành động chuẩn theo điều kiện hạn chót */}
                  <div className="shrink-0 self-end sm:self-center">
                    {isOverdue ? (
                      /* ĐỀ ĐÃ QUÁ HẠN (< 0 ngày) -> Nút đỏ "Nộp bài bù ngay" */
                      <button
                        type="button"
                        onClick={() => handleExamActionClick(exam)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#E11D48] px-5 py-2 text-xs font-black text-white shadow-xs hover:bg-rose-700 active:scale-[0.98] transition-all"
                      >
                        <span>Nộp bài bù ngay</span>
                        <ArrowRight className="size-3.5 stroke-[2.5]" />
                      </button>
                    ) : (
                      /* ĐỀ SẮP HẾT HẠN (Hôm nay hoặc còn hạn) -> Nút "Vào làm bài ngay" */
                      <button
                        type="button"
                        onClick={() => handleExamActionClick(exam)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50/80 px-4.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 active:scale-[0.98] transition-all"
                      >
                        <span>Vào làm bài ngay</span>
                        <ArrowRight className="size-3.5 text-amber-700" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ====================================================
          MODAL XÁC NHẬN BẮT ĐẦU BÀI THI
      ==================================================== */}
      {showStartDialog && selectedExam && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => !isStarting && setShowStartDialog(false)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-slate-150 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Play className="size-5 fill-current" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Bắt đầu làm bài?
                </h2>
                <p className="text-xs font-semibold text-slate-400 truncate max-w-[260px]">
                  {selectedExam.title}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {selectedExam.description && (
                <div className="rounded-xl bg-amber-50/60 p-3 text-xs font-medium text-amber-900 border border-amber-100">
                  <strong>Kiến thức ôn tập:</strong> {selectedExam.description}
                </div>
              )}

              <p className="text-xs leading-relaxed text-slate-500">
                Sau khi bắt đầu, hệ thống sẽ tính giờ ngay lập tức ({selectedExam.duration} phút) và ghi nhận lượt làm bài của bạn.
              </p>

              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-rose-700">
                <AlertTriangle className="size-4.5 shrink-0 mt-0.5 text-rose-600" />
                <div className="text-xs leading-5">
                  <strong className="block font-bold">Lưu ý quan trọng:</strong>
                  Không thoát trình duyệt giữa chừng, nếu thoát bài thi sẽ được tính điểm tại thời điểm đó.
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                disabled={isStarting}
                onClick={() => setShowStartDialog(false)}
                className="h-10 rounded-xl px-4 text-xs font-bold text-slate-600"
              >
                Hủy
              </Button>
              <Button
                type="button"
                disabled={isStarting || startExam.isPending}
                onClick={handleStartExam}
                className="h-10 rounded-xl bg-slate-900 px-5 text-xs font-black text-white hover:bg-slate-800"
              >
                {isStarting || startExam.isPending ? "Đang mở..." : "Bắt đầu ngay"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL ĐIỀU KIỆN TIÊN QUYẾT
      ==================================================== */}
      {showPrerequisiteDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setShowPrerequisiteDialog(false)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-slate-150 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
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
                    <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] text-rose-700">
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