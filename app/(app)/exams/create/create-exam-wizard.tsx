"use client";
import { useState,useEffect, } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import "./create-exam.css";

import {
  useCreateExam,
  useUpdateExam,
  useExamPrerequisites,
  useAddExamPrerequisite,
  useRemoveExamPrerequisite,
} from "@/hooks/use-exams";

import {
  CreateExamDto,
  Exam,
  QuestionConfig,
  AnswerKey,
} from "@/types/exam";

import { BasicInfoStep } from "./steps/basic-info-step";
import { QuestionConfigStep } from "./steps/question-config-step";
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

function resizeAnswerKey(
  answerKey: AnswerKey,
  config: QuestionConfig
): AnswerKey {
  return {
    multipleChoice: Array.from(
      {
        length: config.multipleChoice,
      },
      (_, index) =>
        answerKey.multipleChoice?.[index] ?? ""
    ),

    trueFalse: Array.from(
      {
        length: config.trueFalse,
      },
      (_, index) =>
        answerKey.trueFalse?.[index] ?? [
          "",
          "",
          "",
          "",
        ]
    ),

    shortAnswer: Array.from(
      {
        length: config.shortAnswer,
      },
      (_, index) =>
        answerKey.shortAnswer?.[index] ?? ""
    ),
  };
}

export function CreateExamWizard({
  mode = "create",
  initialData,
}: Props) {
  const router = useRouter();

  const createExam = useCreateExam();
  const updateExam = useUpdateExam();

  const [step, setStep] = useState(1);

  const [
  selectedPrerequisiteIds,
  setSelectedPrerequisiteIds,
] = useState<string[]>([]);

const { data: existingPrerequisites = [] } =
  useExamPrerequisites(
    mode === "edit" && initialData
      ? initialData.id
      : ""
  );

const addPrerequisite =
  useAddExamPrerequisite();

const removePrerequisite =
  useRemoveExamPrerequisite();

  useEffect(() => {
  if (
    mode !== "edit" ||
    !initialData
  ) {
    return;
  }

  setSelectedPrerequisiteIds(
    existingPrerequisites.map(
      (item) =>
        item.prerequisite_exam_id
    )
  );
}, [
  mode,
  initialData,
  existingPrerequisites,
]);

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
        exam_duration_days:initialData.exam_duration_days,
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
      exam_duration_days: null,
      duration_minutes: 90,
      attendance_min_score: 9,
      show_answer: false,
      max_attempts: 20,
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

function updateQuestionConfig(
  newConfig: QuestionConfig
) {
  setForm((prev) => ({
    ...prev,

    question_config: newConfig,

    answer_key: resizeAnswerKey(
      prev.answer_key,
      newConfig
    ),
  }));
}

  function next() {
    setStep((s) => Math.min(2, s + 1));
  }

  function previous() {
    setStep((s) => Math.max(1, s - 1));
  }

async function submit() {
  try {
    // ======================================================
    // EDIT
    // ======================================================

    if (
      mode === "edit" &&
      initialData
    ) {
      await updateExam.mutateAsync({
        id: initialData.id,
        values: form,
      });

      const oldIds =
        existingPrerequisites.map(
          (item) =>
            item.prerequisite_exam_id
        );

      const oldSet =
        new Set(oldIds);

      const newSet =
        new Set(
          selectedPrerequisiteIds
        );

      // ------------------------------
      // Thêm prerequisite mới
      // ------------------------------

      for (
        const prerequisiteExamId
        of selectedPrerequisiteIds
      ) {
        if (!oldSet.has(
          prerequisiteExamId
        )) {
          await addPrerequisite.mutateAsync({
            examId: initialData.id,
            prerequisiteExamId,
          });
        }
      }

      // ------------------------------
      // Xóa prerequisite đã bỏ chọn
      // ------------------------------

      for (
        const prerequisiteExamId
        of oldIds
      ) {
        if (!newSet.has(
          prerequisiteExamId
        )) {
          await removePrerequisite.mutateAsync({
            examId: initialData.id,
            prerequisiteExamId,
          });
        }
      }

      router.push(
        `/exams/${initialData.id}`
      );

      return;
    }

    // ======================================================
    // CREATE
    // ======================================================

    const exam =
      await createExam.mutateAsync(form);

    for (
      const prerequisiteExamId
      of selectedPrerequisiteIds
    ) {
      await addPrerequisite.mutateAsync({
        examId: exam.id,
        prerequisiteExamId,
      });
    }

    router.push(
      `/exams/${exam.id}`
    );
  } catch (err) {
    console.error(err);
  }
}

  const totalQuestions = form.question_config.multipleChoice + form.question_config.trueFalse + form.question_config.shortAnswer;
  const completedAnswers = form.answer_key.multipleChoice.filter(Boolean).length
    + form.answer_key.trueFalse.filter((row) => row.length === 4 && row.every(Boolean)).length
    + form.answer_key.shortAnswer.filter(Boolean).length;

  return (
    <div className="create-exam space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          {step === 1 ? <Link href="/exams" aria-label="Quay lại danh sách đề" className="wizard-back"><ArrowLeft className="size-4" /></Link> : <button type="button" onClick={previous} aria-label="Quay lại cấu hình đề" className="wizard-back"><ArrowLeft className="size-4" /></button>}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{step === 1 ? mode === "edit" ? "Chỉnh Sửa Đề Thi" : "Thiết Lập Đề Thi Mới" : "Thiết Lập Đáp Án Chuẩn OMR"}</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">{step === 1 ? "Cấu hình thông tin chung, file PDF và điều kiện làm bài." : `Đề thi: ${form.title || "Chưa đặt tên"} • Đã nhập ${completedAnswers}/${totalQuestions} câu`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 text-xs font-bold sm:text-sm" aria-label={`Bước ${step} trên 2`}>
          {(["Cấu hình đề thi", "Nhập đáp án OMR"] as const).map((label, index) => <div key={label} className={`flex items-center gap-2 rounded-xl px-3 py-2 ${step === index + 1 ? "bg-slate-900 text-white" : "text-slate-500"}`}><span className={`flex size-5 items-center justify-center rounded-full ${step === index + 1 ? "bg-amber-500 text-slate-900" : "bg-slate-100"}`}>{index + 1}</span>{label}{index === 0 && <ChevronRight className="size-3" />}</div>)}
        </div>
      </header>
      {step === 1 ? (
        <BasicInfoStep form={form} setForm={setForm} selectedPrerequisiteIds={selectedPrerequisiteIds} setSelectedPrerequisiteIds={setSelectedPrerequisiteIds} currentExamId={initialData?.id}
          structure={<QuestionConfigStep form={form} setForm={setForm} onConfigChange={updateQuestionConfig} />}
          footer={<Button onClick={next} className="h-11 w-full rounded-2xl bg-slate-900 font-bold text-white hover:bg-slate-800">Tiếp tục: Thiết lập đáp án OMR <ArrowRight className="ml-2 size-4 text-amber-400" /></Button>}
        />
      ) : (
        <>
          <AnswerKeyStep form={form} setForm={setForm} />
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={previous} className="rounded-xl">Quay lại cấu hình</Button>
            <Button onClick={submit} disabled={createExam.isPending || updateExam.isPending} className="h-11 rounded-2xl bg-slate-900 px-6 font-bold text-white hover:bg-slate-800"><CheckCircle2 className="mr-2 size-4 text-amber-400" />{mode === "edit" ? updateExam.isPending ? "Đang lưu..." : "Lưu thay đổi" : createExam.isPending ? "Đang tạo..." : "Lưu bộ đáp án & tạo đề"}</Button>
          </div>
        </>
      )}
    </div>
  );
}
