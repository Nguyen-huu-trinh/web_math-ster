"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { AnswerKeyEditor } from "@/components/exams/answer-key-editor";

import {
  useExam,
  useUpdateAnswerKey,
} from "@/hooks/use-exams";

import { AnswerKey } from "@/types/exam";

export default function ExamAnswerKeyPage() {
  const { id } = useParams<{ id: string }>();

  const router = useRouter();

  const examQuery = useExam(id);

  const updateAnswerKey = useUpdateAnswerKey();

  const [answerKey, setAnswerKey] =
    useState<AnswerKey>({
      multipleChoice: [],
      trueFalse: [],
      shortAnswer: [],
    });

  useEffect(() => {
    if (!examQuery.data) return;

    setAnswerKey(
      examQuery.data.answer_key ?? {
        multipleChoice: [],
        trueFalse: [],
        shortAnswer: [],
      }
    );
  }, [examQuery.data]);

  if (examQuery.isLoading) {
    return (
      <div className="p-8">
        Đang tải đáp án...
      </div>
    );
  }

  if (!examQuery.data) {
    return (
      <div className="p-8">
        Không tìm thấy đề thi.
      </div>
    );
  }

  const exam = examQuery.data;

  async function save() {
    try {
      await updateAnswerKey.mutateAsync({
        id,
        answerKey,
      });

      router.push(`/exams/${id}`);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      <Card className="gap-0 rounded-[26px] border-slate-200 bg-white py-0 shadow-none">

        <CardHeader className="px-6 py-5">

          <CardTitle className="text-xl font-extrabold tracking-tight text-slate-900">
            Nhập đáp án
          </CardTitle>

          <p className="text-sm font-semibold text-slate-500">
            {exam.title}
          </p>

        </CardHeader>

        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">

          <AnswerKeyEditor
            answerKey={answerKey}
            questionConfig={exam.question_config}
            examType={exam.exam_type}
            onChange={setAnswerKey}
          />

        </CardContent>

      </Card>

      <div className="flex justify-end gap-3">

        <Button
          variant="outline"
          className="h-10 rounded-full border-slate-200 bg-white px-5 font-extrabold text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => router.back()}
        >
          Hủy
        </Button>

        <Button
          className="h-10 rounded-full border-amber-400 bg-amber-400 px-5 font-extrabold text-slate-900 hover:border-amber-500 hover:bg-amber-500"
          onClick={save}
          disabled={updateAnswerKey.isPending}
        >
          {updateAnswerKey.isPending
            ? "Đang lưu..."
            : "Lưu đáp án"}
        </Button>

      </div>

    </div>
  );
}
