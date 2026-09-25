"use client";

import { Flag } from "lucide-react";
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
  onToggleMark: (key: string) => void;
}

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
  if (count <= 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
      {/* HEADER SECTION */}
      <div className="mb-3 flex items-center justify-between rounded-lg bg-slate-50/80 px-3 py-1.5 border border-slate-100">
        <h3 className="text-xs font-black tracking-tight text-slate-800">
          <span>PHẦN III.</span> TRẮC NGHIỆM TRẢ LỜI NGẮN ({questionOffset + 1} – {questionOffset + count})
        </h3>
        <span className="text-[10px] font-bold text-slate-400">
          Tô ô OMR (0.5đ/câu)
        </span>
      </div>

      {/* QUESTION GRID: Linh hoạt responsive 1, 2 hoặc 3 cột */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => {
          const selectedRow = normalizeShortAnswerRow(answers.shortAnswer?.[index]);
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
            (selectedAnswer === correctAnswer ||
              parseFloat(selectedAnswer) === parseFloat(correctAnswer));

          return (
            <div
              key={questionKey}
              id={`question-${questionKey}`}
              tabIndex={-1}
              className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs transition-all hover:border-slate-300 focus:outline-2 focus:outline-slate-900"
            >
              {/* TOP HEADER: Câu X, Kết quả review, Xoá, Cắm cờ */}
              <div className="mb-2 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[13px] font-black text-slate-900 shrink-0">
                    Câu {questionNumber}
                  </span>

                  {/* Hiển thị giá trị đang tô hoặc kết quả khi Review */}
                  {!showAnswer ? (
                    <div className="rounded border border-slate-100 bg-slate-50 px-1.5 py-0.2">
                      <span
                        className={cn(
                          "font-mono text-[11px] font-black tracking-wider",
                          hasAnswer ? "text-slate-900" : "text-slate-400 font-semibold"
                        )}
                      >
                        {selectedAnswer || "Chưa tô"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11.5px] font-black tracking-tight truncate">
                      {isCorrect ? (
                        <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {selectedAnswer}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-rose-600 line-through">
                            {selectedAnswer || "Chưa tô"}
                          </span>
                          <span className="text-slate-400 font-normal">➔</span>
                          <span className="text-slate-950 font-black">
                            {correctAnswer}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cụm nút: Xoá + Flag */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={submitted || !hasAnswer}
                    onClick={() => {
                      for (let col = 0; col < SHORT_ANSWER_COLUMNS; col++) {
                        onChoose(index, col, "");
                      }
                    }}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-700 px-1 py-0.5 rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Xoá
                  </button>

                  <button
                    type="button"
                    disabled={submitted}
                    onClick={() => onToggleMark(questionKey)}
                    title={isMarked ? "Bỏ cắm cờ" : "Cắm cờ câu này"}
                    aria-label={`Đánh dấu câu ${questionNumber}`}
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
              </div>

              {/* BẢNG TÔ OMR (4 CỘT DỌC CHUẨN MẪU) */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2 flex justify-center">
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {Array.from({ length: SHORT_ANSWER_COLUMNS }).map((_, columnIndex) => {
                    const current = selectedRow[columnIndex] ?? "";

                    return (
                      <div
                        key={columnIndex}
                        className="flex flex-col items-center gap-1"
                      >
                        {/* Ô preview ký tự đã chọn ở hàng đỉnh */}
                        <div
                          className={cn(
                            "flex size-5 items-center justify-center rounded border text-[11px] font-black tracking-tight mb-0.5 shadow-2xs transition-all",
                            current
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200/90 bg-white text-slate-400"
                          )}
                        >
                          {current || "-"}
                        </div>

                        {/* Hàng nút dấu: Cột 0 là dấu âm '-', các cột 1-3 là dấu '.' */}
                        {columnIndex === 0 ? (
                          <button
                            type="button"
                            disabled={submitted}
                            onClick={() =>
                              onChoose(index, columnIndex, current === "-" ? "" : "-")
                            }
                            aria-label={`Câu ${questionNumber}, cột 1: dấu âm`}
                            className={cn(
                              "flex size-[21px] items-center justify-center rounded-full border text-[11px] font-black transition-all active:scale-95 disabled:pointer-events-none",
                              current === "-"
                                ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                            )}
                          >
                            -
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={submitted}
                            onClick={() =>
                              onChoose(index, columnIndex, current === "." ? "" : ".")
                            }
                            aria-label={`Câu ${questionNumber}, cột ${columnIndex + 1}: dấu chấm`}
                            className={cn(
                              "flex size-[21px] items-center justify-center rounded-full border text-[11px] font-black transition-all active:scale-95 disabled:pointer-events-none",
                              current === "."
                                ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                            )}
                          >
                            .
                          </button>
                        )}

                        {/* Các số từ 0 đến 9 dạng tròn OMR */}
                        {DIGITS.map((d) => {
                          const isDigitSelected = current === d;

                          return (
                            <button
                              key={d}
                              type="button"
                              disabled={submitted}
                              onClick={() =>
                                onChoose(index, columnIndex, isDigitSelected ? "" : d)
                              }
                              aria-label={`Câu ${questionNumber}, cột ${columnIndex + 1}: ${d}`}
                              className={cn(
                                "flex size-[21px] items-center justify-center rounded-full border text-[10.5px] font-extrabold transition-all active:scale-95 disabled:pointer-events-none",
                                isDigitSelected
                                  ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                              )}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}