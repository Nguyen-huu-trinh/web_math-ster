"use client";

import { cn } from "@/lib/utils";
import type { ExamAnswers, QuestionConfig } from "./types";

interface Props {
  config: QuestionConfig;
  answers: ExamAnswers;
  answerKey: { multipleChoice: string[]; trueFalse: unknown[]; shortAnswer: unknown[] };
  answeredCount: number;
  totalQuestions: number;
  progress: number;
  submitted: boolean;
  showAnswer: boolean;
  markedQuestions: Set<string>;
  onToggleMark: (key: string) => void;
}

export default function QuestionNavigation({
  config,
  answers,
  answerKey,
  answeredCount,
  totalQuestions,
  progress,
  submitted,
  showAnswer,
  markedQuestions,
  onToggleMark,
}: Props) {
  const questions = [
    ...Array.from({ length: config.multipleChoice }, (_, index) => {
      const selected = answers.multipleChoice[index] ?? "";
      const correct = answerKey.multipleChoice[index];
      return {
        key: `mc-${index}`,
        done: selected !== "",
        status: showAnswer && correct ? (selected === correct ? "correct" : "wrong") : null,
      };
    }),
    ...Array.from({ length: config.trueFalse }, (_, index) => {
      const selected = answers.trueFalse[index] ?? [];
      const correct = answerKey.trueFalse[index];
      const key = Array.isArray(correct)
        ? correct.slice(0, 4).map((value) => (value == null ? "" : String(value)))
        : [];
      const matches = key.filter((value, i) => value !== "" && selected[i] === value).length;
      return {
        key: `tf-${index}`,
        done: selected.length === 4 && selected.every((value) => value !== ""),
        status:
          showAnswer && key.length === 4 && key.every(Boolean)
            ? matches === 4
              ? "correct"
              : "wrong"
            : null,
      };
    }),
    ...Array.from({ length: config.shortAnswer }, (_, index) => {
      const row = answers.shortAnswer[index] ?? [];
      const selected = row.slice(0, 4).join("").replace(/\s/g, "").trim();
      const key = answerKey.shortAnswer[index];
      const correct = (
        Array.isArray(key)
          ? key.slice(0, 4).map((value) => (value == null ? "" : String(value))).join("")
          : String(key ?? "").slice(0, 4)
      )
        .replace(/\s/g, "")
        .trim();
      return {
        key: `sa-${index}`,
        done: row.some((value) => value !== ""),
        status:
          showAnswer && correct
            ? selected !== "" && selected === correct
              ? "correct"
              : "wrong"
            : null,
      };
    }),
  ];

  // Đếm số câu đúng và câu sai
  const correctCount = questions.filter((q) => q.status === "correct").length;
  const wrongCount = questions.filter((q) => q.status === "wrong").length;

  return (
    <nav aria-label="Bảng câu hỏi" className="shrink-0 border-b border-slate-100 bg-slate-50/70 p-3">
      {/* HEADER BẢNG CÂU HỎI */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-black tracking-wide text-slate-700">
          BẢNG CÂU HỎI <span className="font-semibold text-slate-400">({totalQuestions} câu)</span>
        </h2>

        <div className="flex items-center gap-1.5">
          <span className="rounded-md border border-slate-200/90 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 shadow-2xs">
            Đã làm: <span className="font-black text-slate-900">{answeredCount}</span>/{totalQuestions}
          </span>

          {showAnswer && (
            <>
              <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-black text-emerald-800 shadow-2xs">
                Đúng: {correctCount}
              </span>
              <span className="rounded-md border border-rose-300 bg-rose-50 px-2 py-0.5 text-[11px] font-black text-rose-800 shadow-2xs">
                Sai: {wrongCount}
              </span>
            </>
          )}
        </div>
      </div>

      {/* GRID NÚT SỐ CÂU HỎI */}
      <div className="grid max-h-36 grid-cols-6 gap-1.5 overflow-y-auto p-1 @min-[400px]/sheet:grid-cols-8 @min-[560px]/sheet:grid-cols-11">
        {questions.map((question, index) => {
          const marked =
            markedQuestions.has(question.key) ||
            (question.key.startsWith("tf-") &&
              [0, 1, 2, 3].some((i) => markedQuestions.has(`${question.key}-${i}`)));

          const statusLabel =
            question.status === "correct"
              ? "Đúng"
              : question.status === "wrong"
              ? "Sai"
              : question.done
              ? "Đã làm"
              : "Chưa hoàn thành";

          let buttonAppearance =
            "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs";

          if (!showAnswer) {
            if (question.done) {
              buttonAppearance =
                "border-slate-900 bg-gradient-to-b from-slate-800 to-slate-950 text-white font-black shadow-xs shadow-slate-900/20";
            }
          } else {
            // Đúng: Nền xanh + Chữ xanh lục đậm
            if (question.status === "correct") {
              buttonAppearance =
                "border-emerald-400/90 bg-gradient-to-b from-emerald-50/90 via-emerald-100 to-emerald-200/90 text-emerald-800 font-black shadow-2xs shadow-emerald-500/15";
            }
            // Sai: Nền đỏ + Chữ đỏ sẫm
            else if (question.status === "wrong") {
              buttonAppearance =
                "border-rose-400/90 bg-gradient-to-b from-rose-50/90 via-rose-100 to-rose-200/90 text-rose-800 font-black shadow-2xs shadow-rose-500/15";
            }
          }

          return (
            <div key={question.key} className="relative">
              <button
                type="button"
                aria-label={`Câu ${index + 1}: ${statusLabel}${marked ? ", đã đánh dấu" : ""}`}
                onClick={() => {
                  const target = document.getElementById(`question-${question.key}`);
                  target?.scrollIntoView({
                    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                      ? "instant"
                      : "smooth",
                    block: "center",
                  });
                  target?.focus({ preventScroll: true });
                }}
                className={cn(
                  "relative flex h-7.5 w-full items-center justify-center rounded-lg border text-[11px] font-black transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-500",
                  buttonAppearance
                )}
              >
                {index + 1}
              </button>

              {/* DẤU CHẤM TRÒN CAM CẮM CỜ */}
              {marked && (
                <button
                  type="button"
                  disabled={submitted}
                  aria-label={`Bỏ đánh dấu câu ${index + 1}`}
                  onClick={() => onToggleMark(question.key)}
                  className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-amber-500 ring-2 ring-white transition-transform hover:scale-125 focus-visible:outline-2 focus-visible:outline-amber-500"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* THANH TIẾN ĐỘ */}
      <div
        role="progressbar"
        aria-label="Tiến độ làm bài"
        aria-valuenow={answeredCount}
        aria-valuemin={0}
        aria-valuemax={totalQuestions}
        className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* CHÚ THÍCH TRẠNG THÁI */}
      {showAnswer && (
        <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[10.5px] font-black">
          <span className="flex items-center gap-1.5 text-emerald-800">
            <span className="size-2.5 rounded-full border border-emerald-400 bg-gradient-to-b from-emerald-100 to-emerald-200 shadow-2xs" />
            Đúng
          </span>
          <span className="flex items-center gap-1.5 text-rose-800">
            <span className="size-2.5 rounded-full border border-rose-400 bg-gradient-to-b from-rose-100 to-rose-200 shadow-2xs" />
            Sai
          </span>
        </div>
      )}
    </nav>
  );
}