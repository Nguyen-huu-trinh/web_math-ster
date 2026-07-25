"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  keyword: string;
  onKeywordChange: (value: string) => void;

  course: string;
  category: string;
  examType: string;
  status: string;

  onCourseChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onExamTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;

  courses?: {
    id: string;
    title: string;
  }[];
}

export function ExamFilter({
  keyword,
  onKeywordChange,

  course,
  category,
  examType,
  status,

  onCourseChange,
  onCategoryChange,
  onExamTypeChange,
  onStatusChange,

  courses = [],
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">

      {/* Search */}

      <div className="relative w-72">

        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

        <Input
          placeholder="Tìm đề thi..."
          value={keyword}
          onChange={(e) =>
            onKeywordChange(e.target.value)
          }
          className="pl-9"
        />

      </div>

      {/* Course */}

      <Select
        value={course}
        onValueChange={(value) => {
          if (value) {
            onCourseChange(value);
          }
        }}
      >
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Khóa học" />
        </SelectTrigger>

        <SelectContent>

          <SelectItem value="all">
            Tất cả khóa học
          </SelectItem>

          {courses.map((course) => (
            <SelectItem
              key={course.id}
              value={course.id}
            >
              {course.title}
            </SelectItem>
          ))}

        </SelectContent>

      </Select>

      {/* Category */}

      <Select
        value={category}
        onValueChange={(value) => {
          if (value) {
            onCategoryChange(value);
          }
        }}
      >
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Danh mục" />
        </SelectTrigger>

        <SelectContent>

          <SelectItem value="all">
            Tất cả
          </SelectItem>

          <SelectItem value="ATTENDANCE">
            Điểm danh
          </SelectItem>

          <SelectItem value="PERIODIC">
            Định kỳ
          </SelectItem>

        </SelectContent>

      </Select>

      {/* Exam Type */}

      <Select
        value={examType}
        onValueChange={(value) => {
          if (value) {
            onExamTypeChange(value);
          }
        }}
      >
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Loại đề" />
        </SelectTrigger>

        <SelectContent>

          <SelectItem value="all">
            Tất cả
          </SelectItem>

          <SelectItem value="THPT_2025">
            THPT 2025
          </SelectItem>

          <SelectItem value="CUSTOM">
            Tự do
          </SelectItem>

        </SelectContent>

      </Select>

      {/* Status */}

      <Select
        value={status}
        onValueChange={(value) => {
          if (value) {
            onStatusChange(value);
          }
        }}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>

        <SelectContent>

          <SelectItem value="all">
            Tất cả
          </SelectItem>

          <SelectItem value="DRAFT">
            Draft
          </SelectItem>

          <SelectItem value="PUBLISHED">
            Published
          </SelectItem>

          <SelectItem value="CLOSED">
            Closed
          </SelectItem>

        </SelectContent>

      </Select>

    </div>
  );
}