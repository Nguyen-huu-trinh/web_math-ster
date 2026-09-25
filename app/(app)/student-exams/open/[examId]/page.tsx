import { requireStudent } from "@/lib/auth/student";
import { studentExamService } from "@/services/student-exam.service";
import {
  Calendar,
  Clock3,
  Star,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { OpenExamContent } from "@/components/exams/open-exam-content";
import { StudentExamItem } from "@/services/student-exam-client.service";

interface Props {
  params: Promise<{
    examId: string;
  }>;
}

export default async function OpenExamPage({
  params,
}: Props) {
  const { examId } = await params;
  const student = await requireStudent();

  const exams = await studentExamService.getMyExams(student.id);
  const exam = exams.find((item) => item.id === examId);

  // =====================================================
  // KHÔNG TÌM THẤY ĐỀ
  // =====================================================
  if (!exam) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-bold">
              Không tìm thấy bài kiểm tra
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Exam ID: {examId}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Khẳng định chắc chắn exam không undefined sau block if
  const currentExam = exam;

  // =====================================================
  // HỆ MÀU & TRẠNG THÁI ĐỒNG BỘ VỚI STUDENT_EXAM_CARD
  // =====================================================
  const isPassed = currentExam.status === "PASSED";
  const isFailed = currentExam.status === "FAILED";

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
        surface: "border-emerald-300/90 to-emerald-100/60 hover:border-emerald-400",
        accent: "before:border-l-emerald-600",
        dot: "bg-emerald-600 ring-4 ring-emerald-200/80",
        progress: "from-emerald-400 to-emerald-600",
        title: "group-hover:text-emerald-800",
      }
    : isFailed
    ? {
        surface: "border-red-300/90 to-red-100/60 hover:border-red-400",
        accent: "before:border-l-red-600",
        dot: "bg-red-500 ring-4 ring-red-200/80",
        progress: "from-red-400 to-red-600",
        title: "group-hover:text-red-800",
      }
    : {
        surface: "border-slate-200 to-amber-50/30 hover:border-amber-200",
        accent: "before:border-l-amber-600/80",
        dot: "bg-amber-600/70 ring-4 ring-amber-50",
        progress: "from-amber-200 to-amber-500/70",
        title: "group-hover:text-amber-800",
      };

  function renderStatus(item: StudentExamItem) {
    switch (item.status) {
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

  function renderScore(item: StudentExamItem) {
    if (item.lastScore === null || item.lastScore === undefined || item.attempts === 0) {
      return (
        <span className="font-mono text-sm font-semibold text-slate-400">
          -- / 10
        </span>
      );
    }

    const scoreNum = Number(item.lastScore);

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

  const attemptRatio = Math.min(100, (currentExam.attempts / (currentExam.maxAttempts || 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl">
        <div
          className={`group relative overflow-hidden rounded-[20px] border bg-white bg-gradient-to-r from-white via-white px-5 py-4 shadow-2xs transition-all hover:shadow-sm before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border-l-[5px] ${palette.surface} ${palette.accent}`}
        >
          {/* GRID LAYOUT 12 CỘT */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">

            {/* CỘT 1: THÔNG TIN BÀI THI (5 Cột) */}
            <div className="flex items-start gap-3 min-w-0 lg:col-span-5">
              <div
                className={`mt-1.5 size-2.5 shrink-0 rounded-full ${
                  currentExam.category === "PERIODIC"
                    ? palette.dot
                    : "bg-slate-300 ring-4 ring-slate-100"
                }`}
              />

              <div className="min-w-0 flex-1 space-y-1">
                <h1 className={`truncate text-[14px] font-black tracking-tight text-slate-900 transition-colors ${palette.title}`}>
                  {currentExam.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                    {currentExam.courseName}
                  </span>
                  <span className="text-slate-300">•</span>
                  {renderStatus(currentExam)}
                </div>
              </div>
            </div>

            {/* CỘT 2: THỜI GIAN & NGÀY THI (2 Cột) */}
            <div className="flex flex-row lg:flex-col justify-start gap-1 text-xs text-slate-500 lg:col-span-2">
              <div className="flex items-center gap-1.5 font-medium">
                <Clock3 className="size-3.5 text-slate-400 shrink-0" />
                <span>{currentExam.duration} phút</span>
              </div>

              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="size-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {currentExam.lastAttemptAt
                    ? `Gần nhất: ${new Date(currentExam.lastAttemptAt).toLocaleDateString("vi-VN")}`
                    : "Gần nhất: _ _"}
                </span>
              </div>
            </div>

            {/* CỘT 3: SỐ LƯỢT & PROGRESS BAR (2 Cột) */}
            <div className="flex flex-col gap-1.5 lg:col-span-2">
              <div className="text-xs font-bold text-slate-700">
                {currentExam.attempts} / {currentExam.maxAttempts} lượt
              </div>
              <div className="h-1 w-20 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-300 ${palette.progress}`}
                  style={{ width: `${attemptRatio}%` }}
                />
              </div>
            </div>

            {/* CỘT 4: ĐIỂM SỐ (1 Cột, căn giữa) */}
            <div className="flex items-center justify-start lg:justify-center lg:col-span-1">
              {renderScore(currentExam)}
            </div>

            {/* CỘT 5: NÚT THAO TÁC (2 Cột, căn phải) */}
            <div className="flex items-center justify-end lg:col-span-2">
              <OpenExamContent 
                exam={{
                  ...currentExam,
                  examFile: (currentExam as any).examFile ?? null, 
                }} 
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
