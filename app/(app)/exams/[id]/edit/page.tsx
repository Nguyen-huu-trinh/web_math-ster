"use client";

import { useParams } from "next/navigation";

import { CreateExamWizard } from "../../create/create-exam-wizard";

import { useExam } from "@/hooks/use-exams";

export default function EditExamPage() {
  const params = useParams();

  const id = params.id as string;

  const examQuery = useExam(id);

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

  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          Chỉnh sửa đề thi
        </h1>

        <p className="mt-2 text-muted-foreground">
          Cập nhật thông tin đề thi.
        </p>

      </div>

      <CreateExamWizard
        mode="edit"
        initialData={examQuery.data}
      />

    </div>
  );
}