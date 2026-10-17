"use client";

import type { Dispatch, SetStateAction } from "react";
import { AnswerKeyEditor } from "@/components/exams/answer-key-editor";
import type { CreateExamDto } from "@/types/exam";

interface Props {
  form: CreateExamDto;
  setForm: Dispatch<SetStateAction<CreateExamDto>>;
}

export function AnswerKeyStep({ form, setForm }: Props) {
  return (
    <AnswerKeyEditor
      answerKey={form.answer_key}
      questionConfig={form.question_config}
      examType={form.exam_type}
      onChange={(answerKey) => setForm((prev) => ({ ...prev, answer_key: answerKey }))}
    />
  );
}
