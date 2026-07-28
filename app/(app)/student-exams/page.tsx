"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StudentExamCard } from "@/components/exams/student-exam-card";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { useStudentExams } from "@/hooks/use-student-exams";

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "NOT_STARTED", label: "Chưa làm" },
  { value: "DONE", label: "Đã làm" },
  { value: "PASSED", label: "Đạt" },
  { value: "FAILED", label: "Chưa đạt" },
];

const CATEGORY_FILTERS = [
  { value: "all", label: "Tất cả loại đề" },
  { value: "ATTENDANCE", label: "Điểm danh" },
  { value: "PERIODIC", label: "Định kỳ" },
];

export default function StudentExamsPage() {

  const { data, isLoading } =
    useStudentExams();

  const [query, setQuery] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const [category, setCategory] =
    useState("all");

  const exams = useMemo(() => {

    if (!data) return [];

    return data.filter((exam) => {

      const matchTitle =
        exam.title
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchStatus =
        status === "all" ||
        exam.status === status;

      const matchCategory =
        category === "all" ||
        exam.category === category;

      return (
        matchTitle &&
        matchStatus &&
        matchCategory
      );

    });

  }, [
    data,
    query,
    status,
    category,
  ]);

  if (isLoading) {

    return (
      <div className="p-10">
        Đang tải...
      </div>
    );

  }

  return (

    <div className="space-y-6">

      <PageHeader
        title="Bài kiểm tra"
        description="Danh sách các bài kiểm tra định kì và bài điểm danh."
      />

      <div className="space-y-4">

        <InputGroup className="max-w-md">

          <InputGroupInput
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Tìm kiếm đề..."
          />

          <InputGroupAddon>

            <Search />

          </InputGroupAddon>

        </InputGroup>

        <div className="flex flex-wrap gap-4">

          <ToggleGroup
            value={[status]}
            onValueChange={(v) =>
              setStatus(v[0] ?? "all")
            }
          >

            {STATUS_FILTERS.map((item) => (

              <ToggleGroupItem
                key={item.value}
                value={item.value}
              >
                {item.label}
              </ToggleGroupItem>

            ))}

          </ToggleGroup>

          <ToggleGroup
            value={[category]}
            onValueChange={(v) =>
              setCategory(v[0] ?? "all")
            }
          >

            {CATEGORY_FILTERS.map((item) => (

              <ToggleGroupItem
                key={item.value}
                value={item.value}
              >
                {item.label}
              </ToggleGroupItem>

            ))}

          </ToggleGroup>

        </div>

      </div>

      {exams.length === 0 ? (

        <Empty>

          <EmptyHeader>

            <EmptyMedia>

              <Search />

            </EmptyMedia>

            <EmptyTitle>
              Không có bài tập
            </EmptyTitle>

            <EmptyDescription>
              Không tìm thấy bài tập phù hợp.
            </EmptyDescription>

          </EmptyHeader>

        </Empty>

      ) : (

        <div className="space-y-4">

          {exams.map((exam) => (

            <StudentExamCard
              key={exam.id}
              exam={exam}
            />

          ))}

        </div>

      )}

    </div>

  );

}