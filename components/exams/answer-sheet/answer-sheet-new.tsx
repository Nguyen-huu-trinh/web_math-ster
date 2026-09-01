"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Clock,
  Send,
} from "lucide-react";

import { toast } from "sonner";

import ExamHeader from "./exam-header";

import MultipleChoiceSection from "./multiple-choice-section";
import TrueFalseSection from "./true-false-section";
import ShortAnswerSection from "./short-answer-section";
import ExamResult from "./exam-result";

import { useExamAnswers } from "./use-exam-answers";
import { useExamSubmit } from "./use-exam-submit";
import { useMarkedQuestions } from "./use-marked-questions";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { cn } from "@/lib/utils";

interface ExamAnswers {
  multipleChoice: string[];
  trueFalse: string[][];
  shortAnswer: string[][];
}

interface Props {
  attempt: any;
  exam: any;
  remainingSeconds: number;
  expiresAt: number;
  savedAnswers: ExamAnswers;

  review?: boolean;

  viewerRole?:
    | "STUDENT"
    | "TEACHER"
    | "ADMIN";

  returnUrl?: string;
}

export default function AnswerSheetNew({
  attempt,
  exam,
  remainingSeconds,
  expiresAt,
  savedAnswers,
  review = false,
  viewerRole = "STUDENT",
  returnUrl,
}: Props) {
  const router = useRouter();

  // ==========================================================
  // QUESTION CONFIG
  // ==========================================================

  const questionConfig =
    exam?.question_config ?? {
      multipleChoice: 0,
      trueFalse: 0,
      shortAnswer: 0,
    };

  // ==========================================================
  // ANSWER KEY
  // ==========================================================

  const answerKey = useMemo(
    () => ({
      multipleChoice:
        exam?.answer_key
          ?.multipleChoice ?? [],

      trueFalse:
        exam?.answer_key
          ?.trueFalse ?? [],

      shortAnswer:
        exam?.answer_key
          ?.shortAnswer ?? [],
    }),
    [exam?.answer_key]
  );

  // ==========================================================
  // ANSWERS
  // ==========================================================

  const {
    answers,
    answersRef,

    chooseMultipleChoice,
    chooseTrueFalse,
    chooseShortAnswer,

    answeredCount,
    totalQuestions,
  } = useExamAnswers({
    config: questionConfig,
    savedAnswers,
  });

  // ==========================================================
  // MARKED QUESTIONS
  // ==========================================================

  const {
    markedQuestions,
    toggleMark,
  } = useMarkedQuestions();

  // ==========================================================
  // SUBMIT STATE
  // ==========================================================

  const [
    result,
    setResult,
  ] = useState<any>(() => {
    if (!review) {
      return null;
    }

    return {
      score:
        attempt?.score ?? 0,

      passed:
        attempt?.is_passed ?? false,

      alreadySubmitted: true,

      showAnswer:
        exam?.show_answer ?? false,

      answers:
        attempt?.answers ?? null,

      answerKey:
        exam?.show_answer
          ? exam?.answer_key
          : null,
    };
  });

  const submitted =
    !!result;

  const showAnswer =
    submitted &&
    !!exam?.show_answer;

  // ==========================================================
  // TIMER
  // ==========================================================

 // ==========================================================
// TIMER
// ==========================================================

const initialRemainingSeconds =
  Number.isFinite(
    Number(remainingSeconds)
  )
    ? Math.max(
        0,
        Number(remainingSeconds)
      )
    : 0;

const [
  timeLeft,
  setTimeLeft,
] = useState(
  initialRemainingSeconds
);
  // ==========================================================
  // SUBMIT DIALOG
  // ==========================================================

  const [
    submitDialogOpen,
    setSubmitDialogOpen,
  ] = useState(false);

  // ==========================================================
  // SUBMIT LOCK
  // ==========================================================

  const submitStartedRef =
    useRef(false);

  // ==========================================================
  // DISPLAY TIME
  // ==========================================================

  const displayTime =
    useMemo(() => {
      const m =
        Math.floor(
          timeLeft / 60
        );

      const s =
        timeLeft % 60;

      return `${String(
        m
      ).padStart(
        2,
        "0"
      )}:${String(
        s
      ).padStart(
        2,
        "0"
      )}`;
    }, [timeLeft]);

  const lowTime =
    timeLeft <= 300;

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const {
    submit,
    submitting,
  } = useExamSubmit({
    attemptId:
      attempt?.id ?? "",

onSuccess: (data) => {
  /*
   * Backend mới trả kết quả chấm.
   *
   * Không tự tính điểm ở frontend.
   */

  // Đánh dấu submit thành công trước
  submitStartedRef.current = true;

  // Hiển thị kết quả
  setResult(data);

  // Đóng dialog
  setSubmitDialogOpen(false);

  /*
   * Báo cho StudentExamLayout rằng bài
   * đã submit thành công.
   *
   * StudentExamLayout sẽ:
   * - khóa xử lý fullscreen_exit
   * - set submitted
   * - thoát fullscreen
   */
  window.dispatchEvent(
    new Event("submit-success")
  );

  console.log(
    "[EXAM] SUBMIT SUCCESS",
    data
  );
},

    onError: (error) => {
      /*
       * Cho phép thử lại nếu
       * request thực sự thất bại.
       */

      submitStartedRef.current =
        false;

      toast.error(
        error.message ||
          "Nộp bài thất bại."
      );
    },
  });

  // ==========================================================
  // HANDLE SUBMIT
  // ==========================================================

  const handleSubmit =
    useCallback(
      async (
        reason:
          | "manual"
          | "timeout"
          | "fullscreen_exit"
          | "page_exit" =
          "manual"
      ) => {
        // -----------------------------------------------
        // Review
        // -----------------------------------------------

        if (review) {
          return;
        }

        // -----------------------------------------------
        // Đã submit
        // -----------------------------------------------

        if (submitted) {
          return;
        }

        // -----------------------------------------------
        // Frontend lock
        // -----------------------------------------------

        if (
          submitStartedRef.current
        ) {
          return;
        }

        submitStartedRef.current =
          true;

        try {
          /*
           * QUAN TRỌNG:
           *
           * Lấy answers từ ref.
           *
           * Không lấy state trực tiếp để tránh
           * trường hợp click đáp án ngay trước
           * lúc submit nhưng React chưa render.
           */

          const currentAnswers =
            answersRef.current;

          await submit(
            currentAnswers,
            reason
          );
        } catch {
          /*
           * useExamSubmit đã xử lý
           * error + reset submitting.
           *
           * Chỉ reset lock để cho phép
           * submit lại.
           */

          submitStartedRef.current =
            false;
        }
      },
      [
        review,
        submitted,
        submit,
        answersRef,
      ]
    );

  // ==========================================================
  // COUNTDOWN
  // ==========================================================

 // ==========================================================
// COUNTDOWN
// ==========================================================
useEffect(() => {
  if (review || submitted) {
    return;
  }

  function updateTimer() {
    const remaining =
      Math.max(
        0,
        Math.ceil(
          (expiresAt - Date.now()) /
            1000
        )
      );

    setTimeLeft(remaining);
  }

  updateTimer();

  const timer =
    window.setInterval(
      updateTimer,
      1000
    );

  return () => {
    window.clearInterval(timer);
  };
}, [
  expiresAt,
  review,
  submitted,
]);



// ==========================================================
// AUTO SUBMIT WHEN TIME IS OVER
// ==========================================================

useEffect(() => {
  if (review || submitted) {
    return;
  }

  if (timeLeft !== 0) {
    return;
  }

  if (submitStartedRef.current) {
    return;
  }

  console.log(
    "[EXAM] TIMEOUT - AUTO SUBMIT"
  );

  void handleSubmit(
    "timeout"
  );
}, [
  timeLeft,
  review,
  submitted,
  handleSubmit,
]);
  // ==========================================================
  // FORCE SUBMIT
  //
  // StudentExamLayout sẽ dispatch event này
  // khi học sinh thoát fullscreen.
  // ==========================================================

  useEffect(() => {
    if (review) {
      return;
    }

    const forceSubmit =
      () => {
        console.log(
          "[EXAM] FORCE SUBMIT"
        );

        void handleSubmit(
          "fullscreen_exit"
        );
      };

    window.addEventListener(
      "force-submit",
      forceSubmit
    );

    return () => {
      window.removeEventListener(
        "force-submit",
        forceSubmit
      );
    };
  }, [
    review,
    handleSubmit,
  ]);

  // ==========================================================
  // RETRY
  // ==========================================================

  const handleRetry =
    useCallback(
      async () => {
        try {
          /*
           * Giữ lại cách start attempt
           * hiện tại của hệ thống.
           */

          const response =
            await fetch(
              `/api/students/my-exams/${exam.id}/start`,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.error ||
                "Không thể bắt đầu lượt làm mới."
            );
          }

          router.push(
            `/student-exams/${data.id}`
          );
        } catch (error) {
          console.error(
            "[EXAM RETRY ERROR]",
            error
          );

          toast.error(
            error instanceof Error
              ? error.message
              : "Không thể làm lại bài."
          );
        }
      },
      [
        exam?.id,
        router,
      ]
    );

  // ==========================================================
  // RESULT NAVIGATION
  // ==========================================================

  const handleBack =
    useCallback(() => {
      if (returnUrl) {
        router.push(
          returnUrl
        );

        return;
      }

      if (
        viewerRole ===
        "TEACHER"
      ) {
        router.push(
          `/exams/${exam.id}/answers`
        );

        return;
      }

      router.push(
        "/student-exams"
      );
    }, [
      returnUrl,
      viewerRole,
      exam?.id,
      router,
    ]);

  // ==========================================================
  // TOTAL / PROGRESS
  // ==========================================================

  const progress =
    totalQuestions === 0
      ? 0
      : (
          answeredCount /
          totalQuestions
        ) * 100;

  // ==========================================================
  // RESULT OBJECT FOR EXAM RESULT COMPONENT
  // ==========================================================
console.log(
  "[EXAM RESULT DEBUG]",
  {
    result,
    attemptScore: attempt?.score,
    attemptIsPassed:
      attempt?.is_passed,
    resultPassed:
      result?.passed,
    resultIsPassed:
      result?.is_passed,
  }
);
 const resultData = result
  ? {
      score: Number(
        result.score ??
          attempt?.score ??
          0
      ),

      passed:
        result.isPassed !== undefined &&
        result.isPassed !== null
          ? Boolean(result.isPassed)
          : attempt?.is_passed !==
              undefined &&
            attempt?.is_passed !== null
          ? Boolean(
              attempt.is_passed
            )
          : false,
    }
  : null;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <ExamHeader
        title={exam.title}
        displayTime={
          displayTime
        }
        lowTime={lowTime}
        submitted={submitted}
        score={result?.score}
        submitting={submitting}
        onSubmit={() =>
          setSubmitDialogOpen(
            true
          )
        }
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="flex-1 overflow-y-auto bg-[#f8f6ef]">
        <div className="space-y-6 p-4">
          {/* ==================================================
              PROGRESS
          ================================================== */}

          {!submitted && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">
                  Tiến độ làm bài
                </span>

                <span className="font-semibold">
                  {answeredCount}/
                  {totalQuestions}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* ==================================================
              PHẦN I
          ================================================== */}

          {questionConfig.multipleChoice >
            0 && (
            <MultipleChoiceSection
              count={
                questionConfig.multipleChoice
              }
              answers={answers}
              answerKey={
                answerKey.multipleChoice
              }
              submitted={submitted}
              showAnswer={
                showAnswer
              }
              markedQuestions={
                markedQuestions
              }
              onChoose={
                chooseMultipleChoice
              }
              onToggleMark={
                toggleMark
              }
            />
          )}

          {/* ==================================================
              PHẦN II
          ================================================== */}

          {questionConfig.trueFalse >
            0 && (
            <TrueFalseSection
              count={
                questionConfig.trueFalse
              }
              answers={answers}
              answerKey={
                answerKey.trueFalse
              }
              submitted={submitted}
              showAnswer={
                showAnswer
              }
              questionOffset={
                questionConfig.multipleChoice
              }
              markedQuestions={
                markedQuestions
              }
              onChoose={
                chooseTrueFalse
              }
              onToggleMark={
                toggleMark
              }
            />
          )}

          {/* ==================================================
              PHẦN III
          ================================================== */}

          {questionConfig.shortAnswer >
            0 && (
            <ShortAnswerSection
              count={
                questionConfig.shortAnswer
              }
              answers={answers}
              answerKey={
                answerKey.shortAnswer
              }
              submitted={submitted}
              showAnswer={
                showAnswer
              }
              questionOffset={
                questionConfig.multipleChoice +
                questionConfig.trueFalse
              }
              markedQuestions={
                markedQuestions
              }
              onChoose={
                chooseShortAnswer
              }
              onToggleMark={
                toggleMark
              }
            />
          )}

          {/* ==================================================
              RESULT
          ================================================== */}

          {resultData && (
            <ExamResult
              result={
                resultData
              }
              exam={exam}
              attempt={attempt}
              viewerRole={
                viewerRole
              }
              returnUrl={
                returnUrl
              }
              onRetry={
                handleRetry
              }
            />
          )}

          {/* ==================================================
              SHOW ANSWER INFORMATION
          ================================================== */}

          {showAnswer && (
            <Card className="mb-8 border-blue-300">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Đáp án đúng đã
                  được hiển thị ngay
                  trên từng câu hỏi.
                  <br />
                  Màu xanh là đáp án
                  đúng.
                  <br />
                  Màu đỏ là đáp án bạn
                  làm sai.
                </p>
              </CardContent>
            </Card>
          )}

          {/* ==================================================
              SUBMIT BUTTON
          ================================================== */}

          {!submitted && (
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="pt-6">
                <Button
                  className="h-12 w-full text-base font-semibold"
                  disabled={
                    submitting
                  }
                  onClick={() =>
                    setSubmitDialogOpen(
                      true
                    )
                  }
                >
                  <Send className="mr-2 size-4" />

                  {submitting
                    ? "Đang nộp bài..."
                    : "Nộp bài"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* =====================================================
          SUBMIT CONFIRMATION
      ===================================================== */}

      <AlertDialog
        open={
          submitDialogOpen
        }
        onOpenChange={
          (open) => {
            /*
             * Không cho đóng dialog
             * bằng cách vô tình submit
             * hai lần.
             */

            if (
              !submitting
            ) {
              setSubmitDialogOpen(
                open
              );
            }
          }
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xác nhận nộp bài
            </AlertDialogTitle>

            <AlertDialogDescription>
              Sau khi nộp bài bạn sẽ
              không thể thay đổi đáp
              án. Bạn có chắc chắn
              muốn nộp bài?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* =================================================
              ANSWER SUMMARY
          ================================================= */}

          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="flex items-center justify-between text-sm">
              <span>
                Đã trả lời
              </span>

              <span className="font-semibold">
                {answeredCount}/
                {totalQuestions}
              </span>
            </div>

            {answeredCount <
              totalQuestions && (
              <div className="mt-3 text-sm text-amber-600">
                Còn{" "}
                <strong>
                  {totalQuestions -
                    answeredCount}
                </strong>{" "}
                câu chưa trả lời.
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={
                submitting
              }
            >
              Huỷ
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={
                submitting
              }
              onClick={async (
                event
              ) => {
                /*
                 * Không để AlertDialog
                 * tự đóng trước khi API
                 * submit hoàn thành.
                 */

                event.preventDefault();

                if (
                  submitting ||
                  submitStartedRef.current
                ) {
                  return;
                }

                await handleSubmit(
                  "manual"
                );
              }}
            >
              {submitting
                ? "Đang nộp bài..."
                : "Nộp bài"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}