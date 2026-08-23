import Link from "next/link";

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
import { Button } from "@/components/ui/button";

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
const currentExam = exam;
  console.log("[OPEN EXAM]", {
    urlExamId: examId,
    examId: exam.id,
    title: exam.title,
    attempts: exam.attempts,
    maxAttempts: exam.maxAttempts,
    canStart: exam.canStart,
    lastAttemptId: exam.lastAttemptId,
    status: exam.status,
  });

  // =====================================================
  // STATUS
  // =====================================================

  function renderStatus() {
    switch (currentExam.status) {
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

      case "DONE":
        return (
          <Badge className="border-blue-200 bg-blue-100 text-blue-700">
            Đã hoàn thành
          </Badge>
        );

      default:
        return null;
    }
  }

  // =====================================================
  // BUTTON
  // =====================================================

  function renderButton() {
    /*
     * CÒN LƯỢT
     *
     * Không gọi startExam ở đây.
     *
     * Chỉ chuyển sang /start/[examId].
     */
    if (currentExam.canStart) {
      return (
        <Link
          href={`/student-exams/start/${currentExam.id}`}
          className="w-full md:w-32"
        >
          <Button className="w-full">
            {currentExam.attempts === 0
              ? "Làm bài"
              : "Làm lại"}
          </Button>
        </Link>
      );
    }

    /*
     * HẾT LƯỢT
     *
     * Có attempt → xem lại.
     */
    if (currentExam.lastAttemptId) {
      return (
        <Link
          href={`/student-exams/${currentExam.lastAttemptId}?review=true`}
          className="w-full md:w-32"
        >
          <Button
            className="w-full"
            variant="outline"
          >
            Xem lại
          </Button>
        </Link>
      );
    }

    /*
     * HẾT LƯỢT NHƯNG KHÔNG CÓ ATTEMPT
     */
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

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">

      <div className="mx-auto w-full max-w-6xl">

        <Card className="transition-all duration-300 hover:border-primary/40 hover:shadow-md">

          <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:gap-6 md:p-5">

            {/* =================================================
                LEFT
            ================================================= */}

            <div className="w-full md:min-w-[240px] md:max-w-[320px]">

              <div className="flex flex-wrap items-center gap-2">

                <h1 className="text-base font-semibold md:text-lg">
                  {exam.title}
                </h1>

                <Badge variant="outline">
                  {exam.category === "ATTENDANCE"
                    ? "Điểm danh"
                    : "Định kỳ"}
                </Badge>

                {renderStatus()}

              </div>

              <p className="mt-1 text-xs text-muted-foreground md:mt-2 md:text-sm">
                {exam.courseName}
              </p>

            </div>

            {/* =================================================
                CENTER
            ================================================= */}

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

            {/* =================================================
                RIGHT
            ================================================= */}

            <div className="mt-2 flex w-full items-center md:mt-0 md:w-auto">

              {renderButton()}

            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}