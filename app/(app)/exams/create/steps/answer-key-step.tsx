"use client";

import { Dispatch, SetStateAction } from "react";

import { Card, CardContent } from "@/components/ui/card";

import { CreateExamDto } from "@/types/exam";

import { AnswerKeyBuilder } from "@/components/exams/answer-key-builder";

interface Props {
  form: CreateExamDto;
  setForm: Dispatch<SetStateAction<CreateExamDto>>;
}

export function AnswerKeyStep({
  form,
  setForm,
}: Props) {
  return (
    <Card>

      <CardContent className="p-6">

        <AnswerKeyBuilder
          examType={form.exam_type}
          questionConfig={form.question_config}
          value={form.answer_key}
          onChange={(answer_key) =>
            setForm({
              ...form,
              answer_key,
            })
          }
        />

      </CardContent>

    </Card>
  );
}