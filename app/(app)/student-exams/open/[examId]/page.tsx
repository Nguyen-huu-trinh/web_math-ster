import { requireStudent } from "@/lib/auth/student";
import { studentExamService } from "@/services/student-exam.service";
import {
  Calendar,
  Clock3,
  GraduationCap,
  Trophy,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { OpenExamContent } from "@/components/exams/open-exam-content";

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

  const exams =
    await studentExamService.getMyExams(
      student.id
    );

  const exam = exams.find(
    (item) => item.id === examId
  );

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

  // =====================================================
  // STATUS
  // =====================================================

  function renderStatus() {
    switch (exam?.status) {
      case "NOT_STARTED":
        return (
          <Badge className="border bg-gray-100 text-gray-700">
            Chưa làm
          </Badge>
        );

      case "PASSED":
        return (
          <Badge className="border-green-200 bg-green-100 text-green-700">
            Đạt
          </Badge>
        );

      case "FAILED":
        return (
          <Badge className="border-red-200 bg-red-100 text-red-700">
            Chưa đạt
          </Badge>
        );

      default:
        return null;
    }
  }

  // Accent border màu cạnh trái & dấu chấm đồng bộ với danh sách bài thi
  const isPassed = exam.status === "PASSED";
  const isFailed = exam.status === "FAILED";
  const accentBorder = isPassed
    ? "before:bg-emerald-500"
    : isFailed
    ? "before:bg-rose-500"
    : "before:bg-amber-400";
  const dotColor = isPassed
    ? "bg-emerald-500 ring-4 ring-emerald-50"
    : isFailed
    ? "bg-rose-500 ring-4 ring-rose-50"
    : "bg-slate-300";

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl">
        <div
          className={`group relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white px-5 py-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-sm before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1.5 before:rounded-r-full ${accentBorder}`}
        >
          {/* GRID 12 CỘT CỐ ĐỊNH: ĐỒNG BỘ THẲNG HÀNG VỚI STUDENT_EXAM_CARD */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">

            {/* =================================================
                LEFT (5 Cột)
            ================================================= */}
            <div className="flex items-start gap-3 min-w-0 lg:col-span-5">
              <div className={`mt-1.5 size-2.5 shrink-0 rounded-full ${dotColor}`} />

              <div className="min-w-0 flex-1 space-y-1">
                <h1 className="truncate text-[14px] font-black tracking-tight text-slate-900">
                  {exam.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
                    {exam.courseName}
                  </span>

                  <span className="text-slate-300">•</span>

                  <Badge variant="outline" className="text-xs">
                    {exam.category === "ATTENDANCE"
                      ? "Điểm danh"
                      : "Định kỳ"}
                  </Badge>

                  {renderStatus()}
                </div>
              </div>
            </div>

            {/* =================================================
                CENTER (5 Cột): THỜI GIAN, LƯỢT, ĐIỂM, GẦN NHẤT
            ================================================= */}
            <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3 lg:col-span-5">

              {/* THỜI GIAN */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-2.5 py-1.5 md:w-24">
                <div className="flex items-center gap-1 text-blue-700">
                  <Clock3 className="h-3 w-3 shrink-0" />
                  <span className="text-[10px] font-bold uppercase">
                    Thời gian
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-black text-blue-900">
                  {exam.duration} phút
                </p>
              </div>

              {/* LƯỢT */}
              <div className="rounded-xl border border-purple-100 bg-purple-50/70 px-2.5 py-1.5 md:w-24">
                <div className="flex items-center gap-1 text-purple-700">
                  <GraduationCap className="h-3 w-3 shrink-0" />
                  <span className="text-[10px] font-bold uppercase">
                    Lượt
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-black text-purple-900">
                  {exam.attempts}/{exam.maxAttempts}
                </p>
              </div>

              {/* ĐIỂM */}
              <div className="rounded-xl border border-yellow-100 bg-yellow-50/70 px-2.5 py-1.5 md:w-20">
                <div className="flex items-center gap-1 text-yellow-700">
                  <Trophy className="h-3 w-3 shrink-0" />
                  <span className="text-[10px] font-bold uppercase">
                    Điểm
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-black text-yellow-900">
                  {exam.lastScore ?? "--"}
                </p>
              </div>

              {/* GẦN NHẤT */}
              <div className="rounded-xl border border-green-100 bg-green-50/70 px-2.5 py-1.5 md:w-28">
                <div className="flex items-center gap-1 text-green-700">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span className="text-[10px] font-bold uppercase">
                    Gần nhất
                  </span>
                </div>
                <p className="mt-0.5 whitespace-nowrap text-[11px] font-bold text-green-900">
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

            {/* =================================================
                RIGHT (2 Cột): OPEN EXAM CONTENT BUTTON
            ================================================= */}
            <div className="flex items-center justify-end lg:col-span-2">
              <OpenExamContent 
                exam={{
                  ...exam,
                  examFile: (exam as any).examFile ?? null, 
                }} 
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}