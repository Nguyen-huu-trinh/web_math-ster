"use client";

import { AnswerKey, ExamType, QuestionConfig } from "@/types/exam";
import { ShortAnswerPicker } from "./short-answer-picker";
import { cn } from "@/lib/utils";

interface Props {
  value: AnswerKey;
  examType: ExamType;
  questionConfig: QuestionConfig;
  onChange(value: AnswerKey): void;
}

const MC = ["A", "B", "C", "D"];
const TF = ["Đ", "S"];

function Bubble({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick(): void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium transition",
  active
    ? "border-primary bg-primary text-primary-foreground"
    : "hover:bg-accent"
)}
    >
      {label}
    </button>
  );
}

export function AnswerKeyBuilder({
  value,
  questionConfig,
  onChange,
}: Props) {

  const answerKey: AnswerKey = {
    multipleChoice:
      value.multipleChoice.length
        ? [...value.multipleChoice]
        : Array(questionConfig.multipleChoice).fill(""),

    trueFalse:
      value.trueFalse.length
        ? value.trueFalse.map((r) => [...r])
        : Array.from(
            { length: questionConfig.trueFalse },
            () => ["", "", "", ""]
          ),

    shortAnswer:
      value.shortAnswer.length
        ? [...value.shortAnswer]
        : Array(questionConfig.shortAnswer).fill(""),
  };

  const updateMC = (
    index: number,
    answer: string
  ) => {
    answerKey.multipleChoice[index] = answer;

    onChange({
      ...answerKey,
    });
  };

  const updateTF = (
    q: number,
    col: number,
    answer: string
  ) => {

    if (!answerKey.trueFalse[q]) {
      answerKey.trueFalse[q] = [
        "",
        "",
        "",
        "",
      ];
    }

    answerKey.trueFalse[q][col] = answer;

    onChange({
      ...answerKey,
    });
  };

  const updateShort = (
    index: number,
    answer: string
  ) => {

    answerKey.shortAnswer[index] = answer;

    onChange({
      ...answerKey,
    });
  };

  const part2Start =
    questionConfig.multipleChoice;

  const part3Start =
    questionConfig.multipleChoice +
    questionConfig.trueFalse;

  return (
    <div className="space-y-10">

      {/* PART I */}

      <section className="rounded-xl border p-5">

        <h2 className="mb-5 text-xl font-bold">
          PHẦN I · Trắc nghiệm
        </h2>

        <div
          className="
            columns-1
            sm:columns-2
            lg:columns-3
            xl:columns-4
            2xl:columns-5
            gap-x-6
          "
        >
          {Array.from({
            length:
              questionConfig.multipleChoice,
          }).map((_, i) => (

            <div
              key={i}
              className="
                mb-2
                break-inside-avoid
                flex
                items-center
                gap-2
                rounded-md
                px-2
                py-1
              "
            >

              <span className="w-8 text-right font-bold">
                {i + 1}
              </span>

              <div className="flex gap-2">

                {MC.map((item) => (

                  <Bubble
                    key={item}
                    label={item}
                    active={
                      answerKey.multipleChoice[i] ===
                      item
                    }
                    onClick={() =>
                      updateMC(i, item)
                    }
                  />

                ))}

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* PART II */}

      <section className="rounded-xl border p-5">

        <h2 className="mb-5 text-xl font-bold">
          PHẦN II · Đúng / Sai
        </h2>

        <div
          className="
            grid
            gap-4
            [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]
          "
        >
          {Array.from({
            length:
              questionConfig.trueFalse,
          }).map((_, q) => (

            <div
              key={q}
              className="rounded-lg border p-4"
            >

              <p className="mb-3 font-semibold">
                Câu {part2Start + q + 1}
              </p>

              {["a", "b", "c", "d"].map(
                (label, col) => (

                  <div
                    key={col}
                    className="mb-2 flex items-center justify-between"
                  >

                    <span>{label})</span>

                    <div className="flex gap-2">

                      {TF.map((item) => (

                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            updateTF(
                              q,
                              col,
                              item
                            )
                          }
                          className={cn(
                            "rounded-md border px-3 py-1 text-xs font-semibold",
                            answerKey.trueFalse[q]?.[
                              col
                            ] === item
                              ? item === "Đ"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-destructive bg-destructive text-destructive-foreground"
                              : "hover:bg-accent"
                          )}
                        >
                          {item}
                        </button>

                      ))}

                    </div>

                  </div>

                )
              )}

            </div>

          ))}

        </div>

      </section>

      {/* PART III */}

      <section className="rounded-xl border p-5">

        <h2 className="mb-5 text-xl font-bold">
          PHẦN III · Trả lời ngắn
        </h2>

        <div
          className="
            grid
            gap-5
            [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]
          "
        >
          {Array.from({
            length:
              questionConfig.shortAnswer,
          }).map((_, i) => (

            <div
              key={i}
              className="rounded-lg border p-4"
            >

              <p className="mb-4 font-semibold">
                Câu {part3Start + i + 1}
              </p>

              <ShortAnswerPicker
                value={
                  answerKey.shortAnswer[i] ??
                  ""
                }
                onChange={(v) =>
                  updateShort(i, v)
                }
              />

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}