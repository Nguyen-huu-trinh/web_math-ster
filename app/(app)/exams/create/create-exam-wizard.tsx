"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  useCreateExam,
  useUpdateExam,
} from "@/hooks/use-exams";

import {
  CreateExamDto,
  Exam,
  QuestionConfig,
} from "@/types/exam";

import { BasicInfoStep } from "./steps/basic-info-step";
import { QuestionConfigStep } from "./steps/question-config-step";
import { ScoringStep } from "./steps/scoring-step";
import { AnswerKeyStep } from "./steps/answer-key-step";

interface Props {
  mode?: "create" | "edit";
  initialData?: Exam;
}

const defaultQuestionConfig: QuestionConfig = {
  multipleChoice: 12,
  trueFalse: 4,
  shortAnswer: 6,
};

export function CreateExamWizard({
  mode = "create",
  initialData,
}: Props) {
  const router = useRouter();

  const createExam = useCreateExam();
  const updateExam = useUpdateExam();

  const [step, setStep] = useState(1);

  const [form, setForm] = useState<CreateExamDto>(() => {
    if (mode === "edit" && initialData) {
      return {
        title: initialData.title,
        description: initialData.description,
        course_id: initialData.course_id,
        exam_file_url: initialData.exam_file_url,
        exam_type: initialData.exam_type,
        category: initialData.category,
        duration_minutes: initialData.duration_minutes,
        attendance_min_score:
          initialData.attendance_min_score,
        show_answer: initialData.show_answer,
        max_attempts: initialData.max_attempts,
        start_at: initialData.start_at,
        end_at: initialData.end_at,
        question_config: initialData.question_config,
        answer_key: initialData.answer_key,
        teacherId: initialData.created_by ?? "",
      };
    }

    return {
      title: "",
      description: "",
      course_id: null,
      exam_file_url: "",
      exam_type: "MOET",
      category: "PERIODIC",
      duration_minutes: 90,
      attendance_min_score: 8,
      show_answer: false,
      max_attempts: 1,
      start_at: null,
      end_at: null,
      question_config: defaultQuestionConfig,
      answer_key: {
        multipleChoice: [],
        trueFalse: [],
        shortAnswer: [],
      },
      teacherId: "",
    };
  });

  function next() {
    setStep((s) => Math.min(4, s + 1));
  }

  function previous() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    try {
      if (mode === "edit" && initialData) {
        await updateExam.mutateAsync({
          id: initialData.id,
          values: form,
        });

        router.push(`/exams/${initialData.id}`);
        return;
      }

      const exam = await createExam.mutateAsync(form);

      // KHÔNG còn sang trang answer-key nữa
      router.push(`/exams/${exam.id}`);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Card>

      <CardContent className="space-y-8 p-6">

        {/* Step */}

        <div className="flex items-center justify-center gap-4">

          {[1, 2, 3, 4].map((value) => (

            <div
              key={value}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold
              ${
                value === step
                  ? "bg-primary text-primary-foreground"
                  : "bg-background"
              }`}
            >
              {value}
            </div>

          ))}

        </div>

        {/* Body */}

        {step === 1 && (
          <BasicInfoStep
            form={form}
            setForm={setForm}
          />
        )}

        {step === 2 && (
          <QuestionConfigStep
            form={form}
            setForm={setForm}
          />
        )}

        {step === 3 && (
          <ScoringStep
            form={form}
            setForm={setForm}
          />
        )}

        {step === 4 && (
          <AnswerKeyStep
            form={form}
            setForm={setForm}
          />
        )}

        {/* Footer */}

        <div className="flex justify-between">

          <Button
            variant="outline"
            disabled={step === 1}
            onClick={previous}
          >
            Quay lại
          </Button>

          {step < 4 ? (

            <Button onClick={next}>
              Tiếp tục
            </Button>

          ) : (

            <Button
              onClick={submit}
              disabled={
                createExam.isPending ||
                updateExam.isPending
              }
            >
              {mode === "edit"
                ? updateExam.isPending
                  ? "Đang lưu..."
                  : "Lưu thay đổi"
                : createExam.isPending
                ? "Đang tạo..."
                : "Tạo đề"}
            </Button>

          )}

        </div>

      </CardContent>

    </Card>
  );
}