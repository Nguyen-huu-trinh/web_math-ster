"use client";

import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ExamAnswers } from "./types";

interface TrueFalseSectionProps {
  count: number;
  questionOffset?: number;
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
  questionOffset = 0,
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
    <section className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between rounded-lg bg-slate-50/80 px-3 py-1.5 border border-slate-100">
        <h3 className="text-xs font-black tracking-tight text-slate-800">
          <span>PHẦN II.</span> TRẮC NGHIỆM ĐÚNG / SAI ({questionOffset + 1} – {questionOffset + count})
        </h3>
      </div>

      {/* QUESTION GRID: Linh hoạt 1, 2, 4 cột theo độ rộng màn hình */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
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

          // Đếm số ý đúng khi review
          let correctCount = 0;
          if (showAnswer) {
            correctRow.forEach((val, i) => {
              if (val && selectedRow[i] === val) correctCount++;
            });
          }

          return (
            <div
              key={questionIndex}
              id={`question-${questionKey}`}
              tabIndex={-1}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-2.5 transition-all hover:border-slate-300 focus:outline-2 focus:outline-slate-900"
            >
              {/* TOP: STT & NÚT CẮM CỜ */}
              <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-black text-slate-800">
                    Câu {questionOffset + questionIndex + 1}
                  </span>
                  {showAnswer && (
                    <span className="rounded bg-slate-100 px-1 py-0.2 text-[9.5px] font-bold text-slate-600">
                      {correctCount}/4 ý
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={submitted}
                  onClick={() => onToggleMark(questionKey)}
                  title={isMarked ? "Bỏ cắm cờ" : "Cắm cờ câu này"}
                  aria-label={`Đánh dấu câu ${questionOffset + questionIndex + 1}`}
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

              {/* LIST CÁC Ý a, b, c, d */}
              <div className="space-y-1.5">
                {["a", "b", "c", "d"].map((label, columnIndex) => {
                  const selected = selectedRow[columnIndex];
                  const correct = correctRow[columnIndex];
                  const markKey = `tf-${questionIndex}-${columnIndex}`;
                  const isSubMarked = markedQuestions.has(markKey);

                  // Hàm sinh style cho từng nút Đ và S
                  const getBtnStyle = (optionValue: "Đ" | "S") => {
                    const isSelected = selected === optionValue;
                    const isCorrect = correct === optionValue;

                    // 1. Trạng thái đang làm bài
                    if (!showAnswer) {
                      return isSelected
                        ? "border-slate-900 bg-slate-900 text-white font-black shadow-2xs"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900";
                    }

                    // 2. Trạng thái xem lại (Review)
                    if (isCorrect) {
                      // Đáp án đúng chuẩn của đề (học sinh làm đúng sẽ thấy nút đen)
                      return "border-slate-900 bg-slate-900 text-white font-black shadow-2xs";
                    }

                    if (isSelected && !isCorrect) {
                      // Học sinh chọn SAI: Nền đỏ pastel + gạch chéo 45 độ nằm gọn trong nút
                      return "border-rose-300 bg-rose-50 text-rose-600 font-extrabold shadow-2xs relative overflow-hidden after:absolute after:h-[1.5px] after:w-full after:bg-rose-500 after:rotate-45 after:pointer-events-none";
                    }

                    // Lựa chọn còn lại không chọn
                    return "border-slate-100 bg-white text-slate-300 pointer-events-none";
                  };

                  return (
                    <div
                      key={columnIndex}
                      className="flex items-center justify-between gap-1 py-0.5"
                    >
                      <button
                        type="button"
                        disabled={submitted}
                        onClick={() => onToggleMark(markKey)}
                        className={cn(
                          "rounded px-1 text-[11px] font-black transition-colors",
                          isSubMarked
                            ? "text-amber-600"
                            : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        {label})
                      </button>

                      <div className="flex items-center gap-1">
                        {/* NÚT ĐÚNG (Đ) */}
                        <button
                          type="button"
                          disabled={submitted}
                          onClick={() => onChoose(questionIndex, columnIndex, "Đ")}
                          className={cn(
                            "flex h-5.5 w-7 shrink-0 items-center justify-center rounded-[5px] border text-[10.5px] font-extrabold transition-all active:scale-95 disabled:pointer-events-none",
                            getBtnStyle("Đ")
                          )}
                        >
                          Đ
                        </button>

                        {/* NÚT SAI (S) */}
                        <button
                          type="button"
                          disabled={submitted}
                          onClick={() => onChoose(questionIndex, columnIndex, "S")}
                          className={cn(
                            "flex h-5.5 w-7 shrink-0 items-center justify-center rounded-[5px] border text-[10.5px] font-extrabold transition-all active:scale-95 disabled:pointer-events-none",
                            getBtnStyle("S")
                          )}
                        >
                          S
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DÒNG ĐÁP ÁN CHUẨN HIGHLIGHT CÂU SAI CHUẨN THEO ẢNH */}
              {showAnswer && (
                <div className="mt-2.5 border-t border-slate-100 pt-2 text-[10px]">
                  <p className="mb-1 text-[9.5px] font-bold text-slate-400">
                    Đáp án chuẩn:
                  </p>
                  <div className="flex items-center justify-between gap-1">
                    {correctRow.map((val, idx) => {
                      const optLabel = ["a", "b", "c", "d"][idx];
                      const isItemCorrect = selectedRow[idx] === val && val !== "";

                      return (
                        <span
                          key={idx}
                          className={cn(
                            "flex-1 text-center rounded-md py-0.5 text-[10px] font-black tracking-tight",
                            isItemCorrect
                              ? "bg-slate-100 text-slate-600"
                              : "border border-amber-300/90 bg-amber-100/80 text-slate-950 shadow-2xs"
                          )}
                        >
                          {optLabel}: <b>{val || "—"}</b>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}