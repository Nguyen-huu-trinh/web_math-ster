"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExamResultProps {
  result: {
    score: number;
    passed: boolean;
  };

  exam: any;
  attempt: any;

  viewerRole:
    | "STUDENT"
    | "TEACHER"
    | "ADMIN";

  returnUrl?: string;

  onRetry: () => void;
}

export default function ExamResult({
  result,
  exam,
  attempt,
  viewerRole,
  returnUrl,
  onRetry,
}: ExamResultProps) {
  const router = useRouter();

  function handleBack() {
    if (returnUrl) {
      router.push(returnUrl);
      return;
    }

    if (viewerRole === "TEACHER") {
      router.push(
        `/exams/${exam.id}/answers`
      );
      return;
    }

    router.push("/student-exams");
  }

  const canRetry =
    (exam.max_attempts ?? 1) >
    attempt.attempt_number;

  return (
    <Card className="mb-8 border-green-300">
      <CardHeader>
        <CardTitle>
          Kết quả bài làm
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ==============================
            SCORE
        =============================== */}

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Điểm số
          </p>

          <p className="mt-2 text-5xl font-bold text-blue-600">
            {Number(result.score).toFixed(2)}
          </p>
        </div>

        {/* ==============================
            PASS / FAIL
        =============================== */}

        <div
          className={
            result.passed
              ? "rounded-lg bg-green-100 p-4 text-center font-bold text-green-700"
              : "rounded-lg bg-red-100 p-4 text-center font-bold text-red-700"
          }
        >
          {result.passed
            ? "✓ ĐẠT"
            : "✗ CHƯA ĐẠT"}
        </div>

        {/* ==============================
            ACTIONS
        =============================== */}

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleBack}
          >
            Quay về danh sách
          </Button>

          {canRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
            >
              Làm lại
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}