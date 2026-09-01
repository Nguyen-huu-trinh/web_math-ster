"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ExamAnswers } from "./types";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const SHORT_ANSWER_COLUMNS = 4;

interface ShortAnswerSectionProps {
  count: number;
  answers: ExamAnswers;
  answerKey?: unknown[];
  submitted: boolean;
  showAnswer: boolean;
  questionOffset?: number;

  markedQuestions: Set<string>;

  onChoose: (
    questionIndex: number,
    columnIndex: number,
    value: string
  ) => void;

  onToggleMark: (
    key: string
  ) => void;
}

/**
 * Chuẩn hóa đáp án của một câu trả lời ngắn.
 */
function normalizeShortAnswerRow(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .slice(0, SHORT_ANSWER_COLUMNS)
      .map((item) => (item == null ? "" : String(item)));
  }

  if (value === null || value === undefined) {
    return ["", "", "", ""];
  }

  return String(value)
    .split("")
    .slice(0, SHORT_ANSWER_COLUMNS);
}

export default function ShortAnswerSection({
  count,
  answers,
  answerKey = [],
  submitted,
  showAnswer,
  questionOffset = 0,
  markedQuestions,
  onChoose,
  onToggleMark,
}: ShortAnswerSectionProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <section className="mb-8 rounded-xl border border-border bg-card p-4">
      {/* HEADER */}
      <div className="mb-3 border-b pb-2">
        <h3 className="font-bold">
          <span className="text-primary">PHẦN III.</span> Trả lời ngắn
        </h3>
      </div>

      {/* QUESTIONS GRID */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 min-[2560px]:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => {
          const selectedRow = normalizeShortAnswerRow(
            answers.shortAnswer?.[index]
          );
          const correctRow = normalizeShortAnswerRow(answerKey[index]);

          while (selectedRow.length < SHORT_ANSWER_COLUMNS) {
            selectedRow.push("");
          }
          while (correctRow.length < SHORT_ANSWER_COLUMNS) {
            correctRow.push("");
          }

          const questionKey = `sa-${index}`;
          const isMarked = markedQuestions.has(questionKey);
          const questionNumber = questionOffset + index + 1;

          const selectedAnswer = selectedRow
            .slice(0, SHORT_ANSWER_COLUMNS)
            .join("")
            .replace(/\s/g, "")
            .trim();

          const correctAnswer = correctRow
            .slice(0, SHORT_ANSWER_COLUMNS)
            .join("")
            .replace(/\s/g, "")
            .trim();

          const hasAnswer = selectedAnswer.length > 0;
          const isCorrect =
            hasAnswer &&
            correctAnswer.length > 0 &&
            selectedAnswer === correctAnswer;

          return (
            <div
              key={questionKey}
              className="rounded-lg border border-border/60 p-3"
            >
              {/* QUESTION HEADER */}
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  disabled={submitted}
                  onClick={() => onToggleMark(questionKey)}
                  className={cn(
                    "flex h-7 min-w-fit items-center justify-center rounded-full px-2 font-bold whitespace-nowrap transition-colors",
                    isMarked
                      ? "bg-red-100 text-red-700 ring-2 ring-red-400 hover:bg-red-200"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  Câu {questionNumber}
                </button>

                {showAnswer && (
                  <div className="flex items-center gap-2">
                    {correctAnswer && (
                      <span className="text-xs font-semibold text-blue-600">
                        Đáp án: {correctAnswer}
                      </span>
                    )}
                    {hasAnswer && (
                      <span
                        className={cn(
                          "font-bold text-lg",
                          isCorrect ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {isCorrect ? "✓" : "✕"}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* BẢNG TÔ ĐÁP ÁN (4 CỘT) */}
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: SHORT_ANSWER_COLUMNS }).map(
                  (_, columnIndex) => {
                    const current = selectedRow[columnIndex] ?? "";
                    const correct = correctRow[columnIndex] ?? "";

                    return (
                      <div
                        key={columnIndex}
                        className="flex flex-col items-center gap-1"
                      >
                        {/* Ô Hiển Thị Ký Tự Đã Chọn */}
                        <div
                          className={cn(
                            "relative flex h-11 w-11 items-center justify-center rounded border font-bold transition-all",

                            !showAnswer &&
                              current &&
                              "border-primary bg-primary/10",

                            showAnswer &&
                              current === correct &&
                              current !== "" &&
                              "bg-green-600 border-green-600 text-white",

                            showAnswer &&
                              current !== "" &&
                              current !== correct &&
                              "bg-red-600 border-red-600 text-white"
                          )}
                        >
                          {current}
                        </div>

                        {/* Danh sách nút bấm chọn ký tự */}
                        <div className="flex flex-col gap-1">
                          {/* Dấu âm '-' (Chỉ áp dụng cột 0) */}
                          <Button
                            size="sm"
                            className={cn(
                              "h-7 w-7 p-0 text-sm font-semibold",
                              current === "-"
                                ? "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground hover:border-primary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground"
                                : "bg-background text-foreground border-input hover:bg-background hover:text-foreground dark:bg-background dark:text-foreground dark:hover:bg-background dark:hover:text-foreground"
                            )}
                            variant="outline"
                            disabled={submitted || columnIndex !== 0}
                            onClick={() => onChoose(index, columnIndex, "-")}
                          >
                            {columnIndex === 0 ? "-" : ""}
                          </Button>

                          {/* Dấu thập phân '.' (Chỉ áp dụng cột 1 hoặc 2) */}
                          <Button
                            size="sm"
                            className={cn(
                              "h-7 w-7 p-0 text-xs font-semibold",
                              current === "."
                                ? "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground hover:border-primary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground"
                                : "bg-background text-foreground border-input hover:bg-background hover:text-foreground dark:bg-background dark:text-foreground dark:hover:bg-background dark:hover:text-foreground"
                            )}
                            variant="outline"
                            disabled={
                              submitted ||
                              !(columnIndex === 1 || columnIndex === 2)
                            }
                            onClick={() => onChoose(index, columnIndex, ".")}
                          >
                            {columnIndex === 1 || columnIndex === 2 ? "." : ""}
                          </Button>

                          {/* Các chữ số từ 0 đến 9 */}
                          {DIGITS.map((d) => (
                            <Button
                              key={d}
                              size="sm"
                              className={cn(
                                "h-7 w-7 p-0 text-xs font-semibold",
                                current === d
                                  ? "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground hover:border-primary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground"
                                  : "bg-background text-foreground border-input hover:bg-background hover:text-foreground dark:bg-background dark:text-foreground dark:hover:bg-background dark:hover:text-foreground"
                              )}
                              variant="outline"
                              disabled={submitted}
                              onClick={() => onChoose(index, columnIndex, d)}
                            >
                              {d}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}