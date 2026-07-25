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
        Đang tải...
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

      <Card>

        <CardHeader>

          <CardTitle>
            Nhập đáp án
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            {exam.title}
          </p>

        </CardHeader>

        <CardContent>

          <AnswerKeyEditor
            answerKey={answerKey}
            questionConfig={exam.question_config}
            onChange={setAnswerKey}
          />

        </CardContent>

      </Card>

      <div className="flex justify-end gap-3">

        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Hủy
        </Button>

        <Button
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