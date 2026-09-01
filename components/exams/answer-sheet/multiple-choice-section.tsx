"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExamAnswers } from "./types";

interface MultipleChoiceSectionProps {
  count: number;
answers: ExamAnswers;
  answerKey?: string[];
  submitted: boolean;
  showAnswer: boolean;
  markedQuestions: Set<string>;
  onChoose: (index: number, value: string) => void;
  onToggleMark: (key: string) => void;
}

const MC = ["A", "B", "C", "D"];

export default function MultipleChoiceSection({
  count,
  answers ,
  answerKey = [],
  submitted,
  showAnswer,
  markedQuestions,
  onChoose,
  onToggleMark,
}: MultipleChoiceSectionProps) {
  if (count <= 0) return null;

  return (
    <section className="mb-8 rounded-xl border border-border bg-card p-4">
      {/* HEADER */}
      <div className="mb-3 flex items-baseline justify-between border-b pb-2">
        <h3 className="text-base font-bold">
          <span className="text-primary">PHẦN I.</span> Trắc nghiệm nhiều lựa chọn
        </h3>
      </div>

      {/* QUESTION GRID */}
      <div className="columns-1 gap-x-6 sm:columns-1 md:columns-2 lg:columns-2 2xl:columns-3 min-[1920px]:columns-5 min-[2560px]:columns-6">
        {Array.from({ length: count }).map((_, index) => {
          const selected = answers.multipleChoice[index] ?? "";
          const correct = answerKey[index];
          const questionKey = `mc-${index}`;
          const isMarked = markedQuestions.has(questionKey);

          return (
            <div
              key={index}
              className="mb-3 flex items-center justify-start gap-3 break-inside-avoid rounded-lg px-2 py-1.5"
            >
              {/* Cụm Icon (✓ / ✕) + STT đứng sát nhau */}
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-5 items-center justify-center text-base font-bold">
                  {showAnswer && (
                    <span
                      className={
                        selected === correct
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {selected === correct ? "✓" : "✕"}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={submitted}
                  onClick={() => onToggleMark(questionKey)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md font-bold transition-colors",
                    isMarked
                      ? "bg-red-100 text-red-700 ring-2 ring-red-400 hover:bg-red-200"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {index + 1}
                </button>
              </div>

              {/* Các nút A, B, C, D nằm ngay liền sau STT */}
              <div className="flex gap-2">
                {MC.map((item) => {
                  const isSelected = selected === item;
                  const isCorrect = item === correct;

                  return (
                    <Button
                      key={item}
                      size="sm"
                      disabled={submitted}
                      variant="outline"
                      onClick={() => onChoose(index, item)}
                      className={cn(
                        "h-8 w-8 rounded-full p-0 transition-colors",

                        // 1. Chưa nộp bài + học sinh đã chọn
                        !showAnswer &&
                          isSelected &&
                          "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground hover:border-primary dark:bg-primary dark:text-primary-foreground dark:border-primary dark:hover:bg-primary dark:hover:text-primary-foreground dark:hover:border-primary",

                        // 2. Đã nộp bài + đáp án đúng
                        showAnswer &&
                          isCorrect &&
                          "bg-green-600 text-white border-green-600 hover:bg-green-600 hover:text-white hover:border-green-600 dark:bg-green-600 dark:text-white dark:border-green-600 dark:hover:bg-green-600 dark:hover:text-white dark:hover:border-green-600",

                        // 3. Đã nộp bài + học sinh chọn sai
                        showAnswer &&
                          isSelected &&
                          !isCorrect &&
                          "bg-red-600 text-white border-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 dark:bg-red-600 dark:text-white dark:border-red-600 dark:hover:bg-red-600 dark:hover:text-white dark:hover:border-red-600"
                      )}
                    >
                      {item}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}





















