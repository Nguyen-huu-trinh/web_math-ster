"use client";

import { useMemo, useState } from "react";

import {
  useDeactivateExam,
  useDeleteExam,
  useDuplicateExam,
  useExams,
  usePublishExam,
} from "@/hooks/use-exams";

import { ExamFilter } from "@/components/exams/exam-filter";
import { ExamTable } from "@/components/exams/exam-table";

export default function ExamsPage() {
  const examsQuery = useExams();

  const publish = usePublishExam();
  const close = useDeactivateExam();
  const duplicate = useDuplicateExam();
  const remove = useDeleteExam();

  const [keyword, setKeyword] = useState("");

  const [course, setCourse] = useState("all");

  const [category, setCategory] = useState("all");

  const [examType, setExamType] = useState("all");

  const [status, setStatus] = useState("all");

  const exams = useMemo(() => {
    if (!examsQuery.data) return [];

    return examsQuery.data.filter((exam) => {
      const matchKeyword =
        exam.title
          .toLowerCase()
          .includes(keyword.toLowerCase());

      const matchCourse =
        course === "all" ||
        exam.course_id === course;

      const matchCategory =
        category === "all" ||
        exam.category === category;

      const matchExamType =
        examType === "all" ||
        exam.exam_type === examType;

      const matchStatus =
        status === "all" ||
        exam.status === status;

      return (
        matchKeyword &&
        matchCourse &&
        matchCategory &&
        matchExamType &&
        matchStatus
      );
    });
  }, [
    examsQuery.data,
    keyword,
    course,
    category,
    examType,
    status,
  ]);

  if (examsQuery.isLoading) {
    return (
      <div className="p-8">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          Quản lý đề thi
        </h1>

        <p className="mt-1 text-muted-foreground">
          Quản lý tất cả đề thi trong hệ thống.
        </p>

      </div>

      <ExamFilter
        keyword={keyword}
        onKeywordChange={setKeyword}

        course={course}
        onCourseChange={setCourse}

        category={category}
        onCategoryChange={setCategory}

        examType={examType}
        onExamTypeChange={setExamType}

        status={status}
        onStatusChange={setStatus}

        courses={[]}
      />

      <ExamTable
        exams={exams}
        onPublish={(id) => publish.mutate(id)}
        onDeactivate={(id) => close.mutate(id)}
        onDuplicate={(id) => duplicate.mutate(id)}
        onDelete={(id) => remove.mutate(id)}
      />

    </div>
  );
}