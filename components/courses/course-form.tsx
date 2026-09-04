

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ThumbnailUpload } from "./thumbnail-upload";
export interface CourseFormValues {
  name: string;
  description: string;
  thumbnail_url: string;
  is_active: boolean;
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
          Course Name
        </Label>

        <Input
          id="name"
          value={value.name}
          onChange={(e) =>
            update("name", e.target.value)
          }
          placeholder="Enter course name..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description
        </Label>

        <Textarea
          id="description"
          rows={5}
          value={value.description}
          onChange={(e) =>
            update("description", e.target.value)
          }
          placeholder="Course description..."
        />
      </div>

      <ThumbnailUpload
        value={value.thumbnail_url}
        onChange={(url) =>
          update("thumbnail_url", url)
        }
      />

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="font-medium">
            Active
          </p>

          <p className="text-sm text-muted-foreground">
            Students can see this course.
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