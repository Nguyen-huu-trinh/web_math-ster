// "use client";

// import { useEffect, useState } from "react";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";

// import type { CreateCourseDto } from "@/repositories/course.repository";

// interface Props {
//   defaultValues?: Partial<CreateCourseDto>;
//   loading?: boolean;
//   submitText?: string;
//   onSubmit(values: CreateCourseDto): Promise<void>;
// }

// export function CourseForm({
//   defaultValues,
//   loading,
//   submitText = "Save",
//   onSubmit,
// }: Props) {
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [thumbnailUrl, setThumbnailUrl] = useState("");
//   const [isActive, setIsActive] = useState(true);

//   useEffect(() => {
//     if (!defaultValues) return;

//     setName(defaultValues.name ?? "");
//     setDescription(defaultValues.description ?? "");
//     setThumbnailUrl(defaultValues.thumbnail_url ?? "");
//     setIsActive(defaultValues.is_active ?? true);
//   }, [defaultValues]);

//   async function handleSubmit(
//     e: React.FormEvent<HTMLFormElement>
//   ) {
//     e.preventDefault();

//     if (!name.trim()) return;

//     await onSubmit({
//       name,
//       description,
//       thumbnail_url: thumbnailUrl,
//       is_active: isActive,
//     });
//   }

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="space-y-5"
//     >
//       <div className="space-y-2">
//         <Label>Tên khóa học</Label>

//         <Input
//           value={name}
//           onChange={(e) =>
//             setName(e.target.value)
//           }
//           placeholder="Ví dụ: Toán 12"
//           required
//         />
//       </div>

//       <div className="space-y-2">
//         <Label>Mô tả</Label>

//         <Textarea
//           rows={4}
//           value={description}
//           onChange={(e) =>
//             setDescription(e.target.value)
//           }
//         />
//       </div>

//       <div className="space-y-2">
//         <Label>Thumbnail URL</Label>

//         <Input
//           value={thumbnailUrl}
//           onChange={(e) =>
//             setThumbnailUrl(e.target.value)
//           }
//           placeholder="https://..."
//         />
//       </div>

//       <div className="flex items-center justify-between rounded-lg border p-3">
//         <Label>Kích hoạt khóa học</Label>

//         <Switch
//           checked={isActive}
//           onCheckedChange={setIsActive}
//         />
//       </div>

//       <Button
//         type="submit"
//         className="w-full"
//         disabled={loading}
//       >
//         {loading ? "Đang lưu..." : submitText}
//       </Button>
//     </form>
//   );
// }

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