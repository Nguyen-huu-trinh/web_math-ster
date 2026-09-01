"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TRUE_FALSE_OPTIONS,
  type ExamAnswers,
} from "./types";

interface TrueFalseSectionProps {
  count: number;
  questionOffset?: number; // Đã đổi tên offsetIndex -> questionOffset
  answers: ExamAnswers;
  answerKey?: unknown[];
  submitted: boolean;
  showAnswer: boolean;
  markedQuestions: Set<string>;
  onChoose: (questionIndex: number, columnIndex: number, value: string) => void;
  onToggleMark: (key: string) => void;
}

function normalizeTrueFalseRow(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .slice(0, 4)
      .map((item) => (item == null ? "" : String(item)));
  }
  return ["", "", "", ""];
}

export default function TrueFalseSection({
  count,
  questionOffset = 0, // Đã đổi tên offsetIndex -> questionOffset
  answers,
  answerKey = [],
  submitted,
  showAnswer,
  markedQuestions,
  onChoose,
  onToggleMark,
}: TrueFalseSectionProps) {
  if (count <= 0) return null;

  return (
    <section className="rounded-xl border border-border bg-card p-4 mb-8">
      {/* HEADER */}
      <div className="mb-3 flex justify-between border-b pb-2">
        <h3 className="font-bold">
          <span className="text-primary">PHẦN II.</span> Đúng / Sai
        </h3>
      </div>

      {/* QUESTION GRID */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 min-[2560px]:grid-cols-5">
        {Array.from({ length: count }).map((_, questionIndex) => {
          const selectedRow = [
            ...(answers.trueFalse?.[questionIndex] ?? []),
          ]
            .slice(0, 4)
            .map((value) => (value == null ? "" : String(value)));

          while (selectedRow.length < 4) {
            selectedRow.push("");
          }

          const correctRow = normalizeTrueFalseRow(answerKey[questionIndex]);

          const questionKey = `tf-${questionIndex}`;
          const isMarked = markedQuestions.has(questionKey);

          const hasAnswer = selectedRow.some((value) => value !== "");
          const isQuestionCorrect =
            hasAnswer &&
            selectedRow.every(
              (value, colIdx) =>
                value !== "" && value === correctRow[colIdx]
            );

          return (
            <div key={questionIndex} className="rounded-lg border p-3">
              {/* TOP ITEM: STT & TRẠNG THÁI ĐÚNG/SAI BÀI TẬP */}
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  disabled={submitted}
                  onClick={() => onToggleMark(questionKey)}
                  className={cn(
                    "flex h-7 min-w-fit px-2 items-center justify-center rounded-full font-bold whitespace-nowrap transition-colors",
                    isMarked
                      ? "bg-red-100 text-red-700 ring-2 ring-red-400 hover:bg-red-200"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  Câu {questionOffset + questionIndex + 1}
                </button>

                {showAnswer && hasAnswer && (
                  isQuestionCorrect ? (
                    <span className="text-green-600 text-lg">✓</span>
                  ) : (
                    <span className="text-red-600 text-lg">✕</span>
                  )
                )}
              </div>

              {/* LIST CÁC CÂU HỎI CON (a, b, c, d) */}
              {["a", "b", "c", "d"].map((label, columnIndex) => {
                const selected = selectedRow[columnIndex];
                const correct = correctRow[columnIndex];
                const markKey = `tf-${questionIndex}-${columnIndex}`;
                const isSubMarked = markedQuestions.has(markKey);

                return (
                  <div
                    key={columnIndex}
                    className="flex justify-between items-center mb-2"
                  >
                    <button
                      type="button"
                      disabled={submitted}
                      onClick={() => onToggleMark(markKey)}
                      className={cn(
                        "rounded-md px-2 py-1 font-semibold transition-colors",
                        isSubMarked
                          ? "bg-red-100 text-red-700 ring-2 ring-red-400 hover:bg-red-200"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {label})
                    </button>

                    <div className="flex gap-2">
                      {/* NÚT ĐÚNG (Đ) */}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={submitted}
                        onClick={() =>
                          onChoose(questionIndex, columnIndex, "Đ")
                        }
                        className={cn(
                          !showAnswer &&
                            selected === "Đ" &&
                            "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground hover:border-primary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground",

                          showAnswer &&
                            correct === "Đ" &&
                            "bg-green-600 text-white border-green-600 hover:bg-green-600 hover:text-white hover:border-green-600 dark:bg-green-600 dark:text-white dark:border-green-600 dark:hover:bg-green-600 dark:hover:text-white dark:hover:border-green-600",

                          showAnswer &&
                            selected === "Đ" &&
                            selected !== correct &&
                            "bg-red-600 text-white border-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 dark:bg-red-600 dark:text-white dark:border-red-600 dark:hover:bg-red-600 dark:hover:text-white dark:hover:border-red-600"
                        )}
                      >
                        Đ
                      </Button>

                      {/* NÚT SAI (S) */}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={submitted}
                        onClick={() =>
                          onChoose(questionIndex, columnIndex, "S")
                        }
                        className={cn(
                          !showAnswer &&
                            selected === "S" &&
                            "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground hover:border-primary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground",

                          showAnswer &&
                            correct === "S" &&
                            "bg-green-600 text-white border-green-600 hover:bg-green-600 hover:text-white hover:border-green-600 dark:bg-green-600 dark:text-white dark:border-green-600 dark:hover:bg-green-600 dark:hover:text-white dark:hover:border-green-600",

                          showAnswer &&
                            selected === "S" &&
                            selected !== correct &&
                            "bg-red-600 text-white border-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 dark:bg-red-600 dark:text-white dark:border-red-600 dark:hover:bg-red-600 dark:hover:text-white dark:hover:border-red-600"
                        )}
                      >
                        S
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}