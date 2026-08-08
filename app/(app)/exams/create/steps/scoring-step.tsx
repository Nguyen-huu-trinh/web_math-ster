"use client";

import { Dispatch, SetStateAction, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { CreateExamDto } from "@/types/exam";

interface Props {
  form: CreateExamDto;
  setForm: Dispatch<SetStateAction<CreateExamDto>>;
}

export function ScoringStep({
  form,
  setForm,
}: Props) {
  const totalQuestions =
    form.question_config.multipleChoice +
    form.question_config.trueFalse +
    form.question_config.shortAnswer;

  const customScore =
    totalQuestions === 0
      ? 0
      : Number((10 / totalQuestions).toFixed(2));

  useEffect(() => {
    if (form.exam_type !== "FREE") return;

    setForm((prev) => ({
      ...prev,
      attendance_min_score: Number(
        customScore.toFixed(2)
      ),
    }));
  }, [customScore, form.exam_type, setForm]);

  return (
    <Card>

      <CardContent className="space-y-6 p-6">

        {form.exam_type === "MOET" ? (
          <>
            <Label className="text-lg font-semibold">
              Thang điểm THPT 2025
            </Label>

            <div className="rounded-lg border p-4 space-y-2">

              <p>Trắc nghiệm: 0.25 điểm / câu</p>

              <p>Đúng Sai: theo đáp án Bộ GD</p>

              <p>Tự luận: theo đáp án Bộ GD</p>

              <p className="font-semibold">
                Giáo viên không cần chỉnh sửa.
              </p>

            </div>
          </>
        ) : (
          <>
            <Label className="text-lg font-semibold">
              Thang điểm đề tự do
            </Label>

            <div className="rounded-lg border p-4 space-y-3">

              <p>
                Tổng số câu:
                <strong> {totalQuestions}</strong>
              </p>

              <p>
                Tổng điểm:
                <strong> 10 điểm</strong>
              </p>

              <p>
                Điểm mỗi câu:
                <strong> {customScore}</strong>
              </p>

            </div>
          </>
        )}

      </CardContent>

    </Card>
  );
}