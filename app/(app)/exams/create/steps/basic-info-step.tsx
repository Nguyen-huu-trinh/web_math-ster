"use client";

import { Dispatch, SetStateAction, useState, ReactNode } from "react";
import { useCourses } from "@/hooks/use-courses";
import { useExams } from "@/hooks/use-exams";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CreateExamDto } from "@/types/exam";

interface Props {
  form: CreateExamDto;
  setForm: Dispatch<SetStateAction<CreateExamDto>>;
  selectedPrerequisiteIds: string[];
  setSelectedPrerequisiteIds: Dispatch<SetStateAction<string[]>>;
  currentExamId?: string;
  structure?: ReactNode;
  footer?: ReactNode;
}
const preventWheelChange = (
  e: React.WheelEvent<HTMLInputElement>
) => {
  e.currentTarget.blur();
};
export function BasicInfoStep({
  form,
  setForm,
  selectedPrerequisiteIds,
  setSelectedPrerequisiteIds,
  currentExamId,
  structure,
  footer,
}: Props) {
  const { courses, loading } = useCourses();
  const { data: exams = [], isLoading: examsLoading } = useExams();

  const [prerequisiteSearch, setPrerequisiteSearch] = useState("");

  const availableExams = exams.filter(
    (exam) => exam.id !== currentExamId
  );

  const filteredExams = availableExams.filter((exam) =>
    exam.title
      .toLowerCase()
      .includes(prerequisiteSearch.toLowerCase())
  );

  const togglePrerequisite = (examId: string) => {
    setSelectedPrerequisiteIds((prev) =>
      prev.includes(examId)
        ? prev.filter((id) => id !== examId)
        : [...prev, examId]
    );
  };

  const allFilteredSelected =
  filteredExams.length > 0 &&
  filteredExams.every((exam) =>
    selectedPrerequisiteIds.includes(exam.id)
  );

const toggleSelectAll = () => {
  setSelectedPrerequisiteIds((prev) => {
    if (allFilteredSelected) {
      // Bỏ chọn tất cả các đề đang hiển thị
      return prev.filter(
        (id) => !filteredExams.some((exam) => exam.id === id)
      );
    }

    // Chọn tất cả các đề đang hiển thị
    const newIds = filteredExams.map((exam) => exam.id);

    return Array.from(new Set([...prev, ...newIds]));
  });
};

   return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_0.95fr]">
      <Card className="wizard-panel">
        <CardContent className="space-y-5 p-6">
          <h2 className="wizard-section-title">1. Thông tin cơ bản & file PDF</h2>
        {/* Title */}

        <div>
          <Label>TÊN ĐỀ THI</Label>

          <Input
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />
        </div>

<div className="grid gap-4 sm:grid-cols-2"><div>

  <Label>KHÓA HỌC</Label>

  <Select
    items={courses.map((course) => ({ value: course.id, label: course.name }))}
    value={form.course_id || undefined}
    onValueChange={(value) =>
      setForm((prev) => ({
        ...prev,
        course_id: value,
      }))
    }
  >

    <SelectTrigger>

      <SelectValue
        placeholder={
          loading
            ? "Đang tải khóa học…"
            : "Chọn khóa học"
        }
      />

    </SelectTrigger>

    <SelectContent>

      {courses.map((course) => (

        <SelectItem
          key={course.id}
          value={course.id}
        >
          {course.name}
        </SelectItem>

      ))}

    </SelectContent>

  </Select>

</div>          <div>
            <Label>DANH MỤC</Label>

            <Select
              items={[
                { value: "PERIODIC", label: "Kiểm tra định kỳ" },
                { value: "ATTENDANCE", label: "Điểm danh" },
              ]}
              value={form.category}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  category: value as CreateExamDto["category"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="PERIODIC">
                  Kiểm tra định kỳ
                </SelectItem>

                <SelectItem value="ATTENDANCE">
                  Điểm danh
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

</div>        {/* Description */}

        <div>
          <Label>MÔ TẢ</Label>

          <Textarea
            rows={2}
            value={form.description ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />
        </div>

        {/* PDF URL */}

        <div>
          <Label>LINK PDF ĐỀ THI</Label>

          <Input
            placeholder="https://drive.google.com/file/..."
            value={form.exam_file_url}
            onChange={(e) =>
              setForm({
                ...form,
                exam_file_url: e.target.value,
              })
            }
          />

        </div>

{/* Prerequisite Exams */}

<div>
  <Label>ĐỀ TIÊN QUYẾT (bắt buộc nộp trước)</Label>

<div className="mt-3 flex gap-2">
  <Input
    className="flex-1"
    placeholder="Tìm kiếm đề thi..."
    value={prerequisiteSearch}
    onChange={(e) => setPrerequisiteSearch(e.target.value)}
  />

  <Button
    type="button"
    variant="outline"
    onClick={toggleSelectAll}
    disabled={filteredExams.length === 0}
  >
    {allFilteredSelected
      ? "Bỏ chọn tất cả"
      : "Chọn tất cả"}
  </Button>
</div>

  <div className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-lg border p-2">
    {examsLoading ? (
      <p className="p-3 text-sm text-muted-foreground">
        Đang tải đề thi…
      </p>
    ) : filteredExams.length === 0 ? (
      <p className="p-3 text-sm text-muted-foreground">
        Không tìm thấy đề thi.
      </p>
    ) : (
      filteredExams.map((exam) => {
        const selected = selectedPrerequisiteIds.includes(exam.id);

        return (
          <button
            key={exam.id}
            type="button"
            onClick={() => togglePrerequisite(exam.id)}
            className={`flex w-full items-center justify-between rounded-md border p-3 text-left transition ${
              selected
                ? "border-amber-300 bg-amber-50"
                : "hover:bg-muted/50"
            }`}
          >
            <div className="min-w-0">
              <p className="truncate font-medium">
                {exam.title}
              </p>

              <p className="text-xs text-muted-foreground">
                {exam.category === "ATTENDANCE"
                  ? "Điểm danh"
                  : "Kiểm tra định kỳ"}{" "}
                · {exam.exam_type === "MOET"
                  ? "THPT 2025"
                  : "Tự do"}
              </p>
            </div>

            {selected && (
            <span className="ml-3 shrink-0 text-xs font-medium text-primary">
              ✓ Đã chọn
            </span>
            )}
          </button>
        );
      })
    )}
  </div>

  {selectedPrerequisiteIds.length > 0 && (
    <p className="mt-2 text-sm text-muted-foreground">
      Đã chọn {selectedPrerequisiteIds.length} đề tiên quyết.
    </p>
  )}
</div>


        </CardContent>
      </Card>
      <div className="space-y-6">
        {structure}
        <Card className="wizard-panel"><CardContent className="space-y-5 p-6">
          <h2 className="wizard-section-title">3. Quy định làm bài</h2>
          {/* Duration */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Thời gian làm bài */}

            <div>
              <Label>Thời gian (phút)</Label>

              <Input
                type="number"
                min={1}
                value={form.duration_minutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    duration_minutes: Number(e.target.value),
                  })
                }
                onWheel={preventWheelChange}
              />
            </div>

            {/* Số ngày được phép làm */}

            <div>
              <Label>Hạn làm bài</Label>

              <Input
                type="number"
                min={1}
                step={1}
                placeholder="Không giới hạn"
                value={form.exam_duration_days ?? ""}
                onChange={(e) => {
                  const value = e.target.value;

                  setForm({
                    ...form,
                    exam_duration_days:
                      value === ""
                        ? null
                        : Number(value),
                  });
                }}
                onWheel={preventWheelChange}
              />
            </div>

            {/* Số lượt làm */}

            <div>
              <Label>Số lượt làm</Label>

              <Input
                type="number"
                min={1}
                value={form.max_attempts ?? 1}
                onChange={(e) =>
                  setForm({
                    ...form,
                    max_attempts: Number(e.target.value),
                  })
                }
                onWheel={preventWheelChange}
              />
            </div>

          </div>

        {/* Điểm đạt */}

<div>
  <Label>Điểm đạt tối thiểu</Label>

  <Input
    type="number"
    min={0}
    max={10}
    step="0.25"
    value={form.attendance_min_score ?? 0}
    onChange={(e) =>
      setForm({
        ...form,
        attendance_min_score: Number(e.target.value),
      })
    }
    onWheel={preventWheelChange}
  />
</div>

        {/* Show Answer */}

        <div className="flex items-center justify-between rounded-lg border p-4">

          <div>
            <p className="font-medium">
              Hiển thị đáp án
            </p>

            <p className="text-sm text-muted-foreground">
              Cho phép học sinh xem đáp án sau khi nộp bài.
            </p>
          </div>

          <Switch
            checked={form.show_answer}
            onCheckedChange={(checked) =>
              setForm({
                ...form,
                show_answer: checked,
              })
            }
          />

        </div>

          {footer}
        </CardContent></Card>
      </div>
    </div>
  );
}
