"use client";

import { Dispatch, SetStateAction, useMemo, useEffect } from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { CreateExamDto } from "@/types/exam";

interface Props {
  form: CreateExamDto;
  setForm: Dispatch<SetStateAction<CreateExamDto>>;
}

export function QuestionConfigStep({
  form,
  setForm,
}: Props) {
  const config = form.question_config;

 const isTHPT =
  form.exam_type === "MOET";

  // Tự động áp cấu trúc THPT
  useEffect(() => {
    if (!isTHPT) return;

    if (
      config.multipleChoice === 12 &&
      config.trueFalse === 4 &&
      config.shortAnswer === 6
    ) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      question_config: {
        multipleChoice: 12,
        trueFalse: 4,
        shortAnswer: 6,
      },
    }));
  }, [
    isTHPT,
    config.multipleChoice,
    config.trueFalse,
    config.shortAnswer,
    setForm,
  ]);

  const totalQuestions =
    config.multipleChoice +
    config.trueFalse +
    config.shortAnswer;

  const scorePerQuestion = useMemo(() => {
    if (isTHPT) return null;

    if (totalQuestions === 0) return 0;

    return Number((10 / totalQuestions).toFixed(2));
  }, [isTHPT, totalQuestions]);

  function update(
    key:
      | "multipleChoice"
      | "trueFalse"
      | "shortAnswer",
    value: number
  ) {
    setForm((prev) => ({
      ...prev,
      question_config: {
        ...prev.question_config,
        [key]: value,
      },
    }));
  }

  return (
    <Card>
      <CardContent className="space-y-8 p-6">

        <div>

          <h3 className="text-lg font-semibold">
            Cấu hình đề thi
          </h3>

          <p className="text-sm text-muted-foreground">
            {isTHPT
              ? "Đề THPT sử dụng cấu trúc cố định."
              : "Đề tự do sẽ tự chia đều 10 điểm."}
          </p>

        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          <div>

            <Label>Trắc nghiệm</Label>

            <Input
              type="number"
              min={0}
              disabled={isTHPT}
              value={config.multipleChoice}
              onChange={(e) =>
                update(
                  "multipleChoice",
                  Number(e.target.value)
                )
              }
            />

          </div>

          <div>

            <Label>Đúng / Sai</Label>

            <Input
              type="number"
              min={0}
              disabled={isTHPT}
              value={config.trueFalse}
              onChange={(e) =>
                update(
                  "trueFalse",
                  Number(e.target.value)
                )
              }
            />

          </div>

          <div>

            <Label>Trả lời ngắn</Label>

            <Input
              type="number"
              min={0}
              disabled={isTHPT}
              value={config.shortAnswer}
              onChange={(e) =>
                update(
                  "shortAnswer",
                  Number(e.target.value)
                )
              }
            />

          </div>

        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">
              Tổng số câu
            </p>

            <p className="mt-2 text-4xl font-bold">
              {totalQuestions}
            </p>

          </div>

          <div className="rounded-xl border p-5">

            {isTHPT ? (

              <>
                <p className="text-sm text-muted-foreground">
                  Thang điểm
                </p>

                <div className="mt-2 flex items-center gap-3">

                  <p className="text-4xl font-bold">
                    Bộ GD
                  </p>

                  <Badge>
                    Cố định
                  </Badge>

                </div>

              </>

            ) : (

              <>
                <p className="text-sm text-muted-foreground">
                  Điểm mỗi câu
                </p>

                <div className="mt-2 flex items-center gap-3">

                  <p className="text-4xl font-bold">
                    {scorePerQuestion}
                  </p>

                  <Badge>
                    Tổng = 10
                  </Badge>

                </div>

              </>

            )}

          </div>

        </div>

        {isTHPT && (

          <div className="rounded-xl border bg-muted/40 p-5">

            <h4 className="font-semibold">
              Cấu trúc đề THPT 2025
            </h4>

            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">

              <li>Phần I: 12 câu trắc nghiệm</li>

              <li>Phần II: 4 câu đúng / sai</li>

              <li>Phần III: 6 câu trả lời ngắn</li>

              <li>Tổng cộng: 22 câu</li>

            </ul>

          </div>

        )}

      </CardContent>
    </Card>
  );
}