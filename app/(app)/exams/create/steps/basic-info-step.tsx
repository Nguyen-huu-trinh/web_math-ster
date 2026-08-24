"use client";

import { Dispatch, SetStateAction } from "react";
import { useCourses } from "@/hooks/use-courses";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

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
}
const preventWheelChange = (
  e: React.WheelEvent<HTMLInputElement>
) => {
  e.currentTarget.blur();
};
export function BasicInfoStep(
  {
  
  form,
  setForm,
}: Props) {
  const { courses, loading } = useCourses();
  console.log("courses =", courses);
   return (
    <Card>
      <CardContent className="grid gap-6 p-6">

        {/* Title */}

        <div>
          <Label>Tên đề thi</Label>

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

        {/* Description */}

        <div>
          <Label>Mô tả</Label>

          <Textarea
            rows={4}
            value={form.description ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />
        </div>

        {/* Course */}

        <div>

  <Label>Khóa học</Label>

  <Select
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
            ? "Đang tải khóa học..."
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

</div>

        {/* PDF URL */}

        <div>
          <Label>Link PDF đề thi</Label>

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

          <p className="mt-2 text-xs text-muted-foreground">
            Dán link Google Drive, OneDrive hoặc đường dẫn PDF công khai.
          </p>
        </div>

        {/* Exam Type + Category */}

        <div className="grid grid-cols-2 gap-4">

          <div>
            <Label>Loại đề</Label>

            <Select
              value={form.exam_type}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  exam_type: value as any,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="MOET">
                  THPT 2025
                </SelectItem>

                <SelectItem value="FREE">
                  Tự do
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Danh mục</Label>

            <Select
              value={form.category}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  category: value as any,
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

        </div>

        {/* Duration */}

        <div className="grid grid-cols-2 gap-4">

          <div>
            <Label>Thời gian (phút)</Label>

            <Input
              type="number"
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

          <div>
            <Label>Số lượt làm</Label>

            <Input
              type="number"
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

      </CardContent>
    </Card>
  );
}