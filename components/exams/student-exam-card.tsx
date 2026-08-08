"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

  const startExam =
    useStartExam();
const [isStarting, setIsStarting] = useState(false);
  function renderStatus() {

    switch (exam.status) {

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

      

    }

  }

  async function handleStartExam() {
    setIsStarting(true);
    try {
      const attempt = await startExam.mutateAsync(exam.id);

      router.push(
        `/student-exams/${attempt.id}`
      );

    } catch (error: any) {

      alert(
        error.message ??
          "Không thể bắt đầu bài làm."
      );

    }

  }

  function renderButton() {

    if (!exam.canStart) {

      return (
        <Button
          disabled
          className="w-32"
        >
          Hết lượt
        </Button>
      );

    }

    return (
      <Button
        className="w-32"
        disabled={isStarting || startExam.isPending}
        onClick={handleStartExam}
      >
        {isStarting ||startExam.isPending
          ? "Đang mở..."
          : exam.attempts === 0
          ? "Làm bài"
          : "Làm lại"}
      </Button>
    );

  }

  return (

    <Card className="transition-all duration-300 hover:border-primary/40 hover:shadow-md">

      <CardContent className="flex items-center justify-between gap-8 p-5">

        {/* LEFT */}

        <div className="min-w-[260px]">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="text-lg font-semibold">
              {exam.title}
            </h3>

            <Badge variant="outline">

              {exam.category === "ATTENDANCE"
                ? "Điểm danh"
                : "Định kỳ"}

            </Badge>

            {renderStatus()}

          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            {exam.courseName}
          </p>

        </div>

        {/* CENTER */}

        <div className="flex flex-1 justify-center gap-3">

          {/* Thời gian */}

          <div className="w-24 rounded-md border border-blue-100 bg-blue-50 px-3 py-2">

            <div className="flex items-center gap-1 text-blue-700">

              <Clock3 className="h-3.5 w-3.5" />

              <span className="text-[10px] uppercase">
                Thời gian
              </span>

            </div>

            <p className="mt-1 text-xs font-semibold text-blue-900">
              {exam.duration} phút
            </p>

          </div>

          {/* Lượt */}

          <div className="w-24 rounded-md border border-purple-100 bg-purple-50 px-3 py-2">

            <div className="flex items-center gap-1 text-purple-700">

              <GraduationCap className="h-3.5 w-3.5" />

              <span className="text-[10px] uppercase">
                Lượt
              </span>

            </div>

            <p className="mt-1 text-xs font-semibold text-purple-900">
              {exam.attempts}/{exam.maxAttempts}
            </p>

          </div>

          {/* Điểm */}

          <div className="w-24 rounded-md border border-yellow-100 bg-yellow-50 px-3 py-2">

            <div className="flex items-center gap-1 text-yellow-700">

              <Trophy className="h-3.5 w-3.5" />

              <span className="text-[10px] uppercase">
                Điểm
              </span>

            </div>

            <p className="mt-1 text-xs font-semibold text-yellow-900">
              {exam.lastScore ?? "--"}
            </p>

          </div>

          {/* Gần nhất */}

          <div className="w-28 rounded-md border border-green-100 bg-green-50 px-3 py-2">

            <div className="flex items-center gap-1 text-green-700">

              <Calendar className="h-3.5 w-3.5" />

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

        <div className="flex items-center">

          {renderButton()}

        </div>

      </CardContent>

    </Card>

  );

}