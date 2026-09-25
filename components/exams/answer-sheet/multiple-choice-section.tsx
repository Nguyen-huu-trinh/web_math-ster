"use client";

import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExamAnswers } from "./types";

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
  answers,
  answerKey = [],
  submitted,
  showAnswer,
  markedQuestions,
  onChoose,
  onToggleMark,
}: MultipleChoiceSectionProps) {
  if (count <= 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
      {/* HEADER SECTION */}
      <div className="mb-3 flex items-center justify-between rounded-lg bg-slate-50/80 px-3 py-1.5 border border-slate-100">
        <h3 className="text-xs font-black tracking-tight text-slate-800">
          <span>PHẦN I.</span> TRẮC NGHIỆM 4 PHƯƠNG ÁN (1 – {count})
        </h3>
      </div>

      {/* QUESTION GRID: Linh hoạt 1 cột (mobile), 2 cột (tablet), 3 cột (desktop) */}
     <div className="columns-1 sm:columns-2 lg:columns-3 gap-2.5 space-y-2">
        {Array.from({ length: count }).map((_, index) => {
          const selected = answers.multipleChoice[index] ?? "";
          const correct = answerKey[index];
          const questionKey = `mc-${index}`;
          const isMarked = markedQuestions.has(questionKey);

          return (
            <div
              key={index}
              id={`question-${questionKey}`}
              tabIndex={-1}
            className="break-inside-avoid mb-2 flex items-center justify-between rounded-xl border border-slate-100 bg-white p-2 transition-all hover:border-slate-200 focus:outline-2 focus:outline-slate-900"
            >
              {/* STT & CỜ ĐÁNH DẤU NẰM CẠNH NHAU */}
              <div className="flex items-center gap-1.5">
                <span className="w-5 text-center text-[11.5px] font-black text-slate-700">
                  {index + 1}
                </span>

                <button
                  type="button"
                  disabled={submitted}
                  onClick={() => onToggleMark(questionKey)}
                  title={isMarked ? "Bỏ cắm cờ" : "Cắm cờ câu này"}
                  aria-label={`Đánh dấu câu ${index + 1}`}
                  className={cn(
                    "flex size-5 items-center justify-center rounded transition-colors",
                    isMarked
                      ? "text-amber-500 hover:text-amber-600"
                      : "text-slate-300 hover:text-amber-500"
                  )}
                >
                  <Flag
                    className={cn(
                      "size-3",
                      isMarked ? "fill-amber-500 text-amber-500" : "text-current"
                    )}
                  />
                </button>
              </div>

              {/* NÚT TRÒN A, B, C, D */}
              <div className="flex items-center gap-1">
                {MC.map((item) => {
                  const isSelected = selected === item;
                  const isCorrect = item === correct;

                  // 1. Trạng thái đang làm bài
                  let buttonStyle =
                    "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900";

                  if (!showAnswer && isSelected) {
                    buttonStyle =
                      "border-slate-900 bg-slate-900 text-white font-black shadow-2xs";
                  }

                  // 2. Trạng thái xem lại đáp án (Review)
                  if (showAnswer) {
                    if (isCorrect) {
                      // Đáp án đúng chuẩn của đề
                      buttonStyle =
                        "border-slate-900 bg-slate-900 text-white font-black shadow-2xs ring-1 ring-slate-900";
                    } else if (isSelected && !isCorrect) {
                      // Học sinh chọn SAI: Nền đỏ pastel + gạch chéo 45 độ gọn trong hình tròn
                      buttonStyle =
                        "border-rose-300 bg-rose-50 text-rose-600 font-extrabold shadow-2xs relative overflow-hidden after:absolute after:h-[1.5px] after:w-full after:bg-rose-500 after:rotate-45 after:pointer-events-none";
                    } else {
                      // Các lựa chọn còn lại
                      buttonStyle =
                        "border-slate-100 bg-white text-slate-300 pointer-events-none";
                    }
                  }

                  return (
                    <button
                      key={item}
                      type="button"
                      disabled={submitted}
                      onClick={() => onChoose(index, item)}
                      aria-label={`Câu ${index + 1}: ${item}`}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex size-6.5 shrink-0 items-center justify-center rounded-full border text-[11px] font-extrabold transition-all active:scale-95 disabled:pointer-events-none",
                        buttonStyle
                      )}
                    >
                      {item}
                    </button>
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