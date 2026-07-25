"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { useSubmitAttempt } from "@/hooks/use-submit-attempt";

interface Props {
  attempt: any;
  exam: any;
}

const OPTIONS = ["A", "B", "C", "D"];

export default function AnswerSheet({
  attempt,
  exam,
}: Props) {
  const router = useRouter();
const questionConfig = exam.question_config ?? {};

const generatedQuestions = [
  ...Array.from(
    {
      length: questionConfig.multipleChoice ?? 0,
    },
    (_, i) => ({
      id: `mc_${i + 1}`,
      number: i + 1,
      type: "MC",
    })
  ),

  ...Array.from(
    {
      length: questionConfig.trueFalse ?? 0,
    },
    (_, i) => ({
      id: `tf_${i + 1}`,
      number:
        (questionConfig.multipleChoice ?? 0) +
        i +
        1,
      type: "TF",
    })
  ),

  ...Array.from(
    {
      length: questionConfig.shortAnswer ?? 0,
    },
    (_, i) => ({
      id: `sa_${i + 1}`,
      number:
        (questionConfig.multipleChoice ?? 0) +
        (questionConfig.trueFalse ?? 0) +
        i +
        1,
      type: "SA",
    })
  ),
];
  const duration =
    (exam.duration_minutes ?? 60) * 60;

  const [timeLeft, setTimeLeft] =
    useState(duration);

  const [answers, setAnswers] =
    useState<Record<string, string>>({});

  const [result, setResult] =
    useState<any>(null);

  const submitMutation =
    useSubmitAttempt();

  // =====================
  // TIMER
  // =====================

  useEffect(() => {
    if (result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [result]);

  const displayTime = useMemo(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;

    return `${String(m).padStart(2, "0")}:${String(
      s
    ).padStart(2, "0")}`;
  }, [timeLeft]);

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );

  function chooseAnswer(
    questionId: string,
    answer: string
  ) {
    if (result) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }

  async function handleSubmit(
    confirm = true
  ) {
    if (submitMutation.isPending) return;

    if (
      confirm &&
      !window.confirm(
        "Bạn chắc chắn muốn nộp bài?"
      )
    ) {
      return;
    }

    try {
      const data =
        await submitMutation.mutateAsync({
          attemptId: attempt.id,
          answers,
        });

      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Nộp bài thất bại.");
    }
  }

  return (
    <div className="h-full overflow-y-auto p-5">

      <Card>

        <CardHeader>

          <CardTitle>
            {exam.title}
          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-6">

          {/* TIMER */}

          <div>

            <p className="text-sm text-muted-foreground">
              Thời gian còn lại
            </p>

            <p className="text-4xl font-bold text-red-600">
              {displayTime}
            </p>

          </div>

          {/* PROGRESS */}

          <div className="rounded-lg border p-3">

            <div className="flex justify-between text-sm">

              <span>Đã trả lời</span>

              <span>
                {answeredCount}/{generatedQuestions.length}
              </span>

            </div>

          </div>

          {/* QUESTIONS */}

          <div className="space-y-4">

            {generatedQuestions.map((question) => (
  <div
    key={question.id}
    className="rounded-lg border p-3"
  >
    <div className="mb-3 flex justify-between">

      <span className="font-semibold">
        Câu {question.number}
      </span>

      {answers[question.id] && (
        <span className="text-xs text-green-600">
          Đã chọn: {answers[question.id]}
        </span>
      )}

    </div>

    {/* Trắc nghiệm */}

    {question.type === "MC" && (
      <div className="grid grid-cols-4 gap-2">

        {OPTIONS.map((option) => (

          <Button
            key={option}
            type="button"
            variant={
              answers[question.id] === option
                ? "default"
                : "outline"
            }
            disabled={!!result}
            onClick={() =>
              chooseAnswer(
                question.id,
                option
              )
            }
          >
            {option}
          </Button>

        ))}

      </div>
    )}

    {/* Đúng Sai */}

    {question.type === "TF" && (
      <div className="grid grid-cols-2 gap-2">

        <Button
          variant={
            answers[question.id] === "TRUE"
              ? "default"
              : "outline"
          }
          disabled={!!result}
          onClick={() =>
            chooseAnswer(
              question.id,
              "TRUE"
            )
          }
        >
          Đúng
        </Button>

        <Button
          variant={
            answers[question.id] === "FALSE"
              ? "default"
              : "outline"
          }
          disabled={!!result}
          onClick={() =>
            chooseAnswer(
              question.id,
              "FALSE"
            )
          }
        >
          Sai
        </Button>

      </div>
    )}

    {/* Trả lời ngắn */}

    {question.type === "SA" && (
      <input
        type="text"
        disabled={!!result}
        value={answers[question.id] ?? ""}
        onChange={(e) =>
          chooseAnswer(
            question.id,
            e.target.value
          )
        }
        className="w-full rounded-md border px-3 py-2"
        placeholder="Nhập đáp án..."
      />
    )}
  </div>
))}

                  

          </div>

          {/* RESULT */}

          {result && (

            <div className="space-y-3 rounded-lg border bg-muted p-4">

              <p className="text-2xl font-bold">
                Điểm:{" "}
                {Number(
                  result.score
                ).toFixed(2)}
              </p>

              <p
                className={
                  result.passed
                    ? "font-semibold text-green-600"
                    : "font-semibold text-red-600"
                }
              >
                {result.passed
                  ? "Đạt"
                  : "Chưa đạt"}
              </p>

              {(exam.max_attempts ?? 1) >
                (attempt.attempt_number ?? 1) && (

                <Button
                  className="w-full"
                  onClick={() =>
                    router.push(
                      "/student-exams"
                    )
                  }
                >
                  Quay về danh sách
                </Button>

              )}

            </div>

          )}

          {/* SUBMIT */}

          {!result && (

            <Button
              className="w-full"
              disabled={
                submitMutation.isPending
              }
              onClick={() =>
                handleSubmit(true)
              }
            >
              {submitMutation.isPending
                ? "Đang nộp..."
                : "Nộp bài"}
            </Button>

          )}

        </CardContent>

      </Card>

    </div>
  );
}