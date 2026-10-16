

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
export interface CourseFormValues {
  name: string;
  description: string;
  thumbnail_url: string;
  is_active: boolean;
  course_order: number;
}

interface CourseFormProps {
  value: CourseFormValues;
  onChange: (value: CourseFormValues) => void;
}

export function CourseForm({
  value,
  onChange,
}: CourseFormProps) {
  function update<K extends keyof CourseFormValues>(
    key: K,
    val: CourseFormValues[K]
  ) {
    onChange({
      ...value,
      [key]: val,
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">
          Tên khóa học <span className="text-rose-500">*</span>
        </Label>

        <Input
          id="name"
          value={value.name}
          onChange={(e) =>
            update("name", e.target.value)
          }
          placeholder="VD: KHÓA S – NỀN TẢNG"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Mô tả
        </Label>

        <Textarea
          id="description"
          rows={5}
          value={value.description}
          onChange={(e) =>
            update("description", e.target.value)
          }
          placeholder="Nhập mô tả khóa học…"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="course_order">Thứ tự khóa học</Label>
        <Input
          id="course_order"
          type="number"
          min={0}
          max={2147483647}
          step={1}
          value={Number.isNaN(value.course_order) ? "" : value.course_order}
          onChange={(e) => update("course_order", e.target.valueAsNumber)}
        />
        <p className="text-sm text-muted-foreground">Số nhỏ hiển thị trước.</p>
      </div>


      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <div>
          <p className="font-bold text-slate-700">
            Hiển thị khóa học
          </p>

          <p className="text-sm text-muted-foreground">
            Học sinh có thể xem khóa học này.
          </p>
        </div>

        <Switch
          checked={value.is_active}
          onCheckedChange={(checked) =>
            update("is_active", checked)
          }
        />
      </div>
    </div>
  );
}
