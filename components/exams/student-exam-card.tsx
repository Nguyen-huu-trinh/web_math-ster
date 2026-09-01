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

import { StudentExamItem } from "@/services/student-exam-client.service";
import { useStartExam } from "@/hooks/use-start-exam";

interface Props {
  exam: StudentExamItem;
}

export function StudentExamCard({
  exam,
}: Props) {

  const router = useRouter();

  const startExam = useStartExam();
  const [isStarting, setIsStarting] = useState(false);

  const startLockRef = useRef(false);

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

  async function handleStartExam() {
    if (startLockRef.current) {
      return;
    }

    startLockRef.current = true;
    setIsStarting(true);

    try {
      const attempt = await startExam.mutateAsync(
        exam.id
      );

      console.log("[START EXAM FRONTEND]", {
        examId: exam.id,
        attemptId: attempt.id,
      });

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

      // =====================================================
      // ĐÃ CÓ MỘT LƯỢT ĐANG LÀM
      // =====================================================

      if (
        error?.status === 409 &&
        error?.code === "EXAM_IN_PROGRESS"
      ) {
        toast.warning(
          "Bài thi đang được diễn ra",
          {
            description:
              "Bạn đã có một lượt làm bài chưa nộp. Vui lòng tiếp tục lượt làm bài hiện tại.",
          }
        );

        return;
      }

      // =====================================================
      // LỖI KHÁC
      // =====================================================

      toast.error(
        error?.message ??
          "Không thể bắt đầu bài làm."
      );
    }
  }
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
      onClick={handleStartExam}
    >
      {isStarting || startExam.isPending
        ? "Đang mở..."
        : exam.attempts === 0
        ? "Làm bài"
        : "Làm lại"}
    </Button>
  );
}

  return (
    <Card className="transition-all duration-300 hover:border-primary/40 hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:gap-6 md:p-5">

        {/* LEFT: Tên bài thi & Thông tin khóa học */}
        <div className="w-full md:min-w-[240px] md:max-w-[320px]">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold md:text-lg">
              {exam.title}
            </h3>

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

        {/* CENTER: Các chỉ số (Thời gian, Lượt, Điểm, Ngày) */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:flex md:flex-1 md:justify-end md:gap-3">

          {/* Thời gian */}
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

          {/* Lượt */}
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

          {/* Điểm */}
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

          {/* Gần nhất */}
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
                  ).toLocaleDateString("vi-VN")
                : "Chưa làm"}
            </p>
          </div>

        </div>

        {/* RIGHT: Nút bấm */}
        <div className="mt-2 flex w-full items-center md:mt-0 md:w-auto">
          {renderButton()}
        </div>

      </CardContent>
    </Card>
  );
}