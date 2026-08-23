"use client";
import { toast } from "sonner";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Label,
} from "@/components/ui/label";

import {
  Upload,
} from "lucide-react";

import {
  Checkbox,
} from "@/components/ui/checkbox";

interface Course {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  courses: Course[];

  onImport: (
    file: File,
    courseIds: string[]
  ) => Promise<void>;
}

export default function ImportStudentsDialog({
  open,
  onOpenChange,
  courses,
  onImport,
}: Props) {
  const [file, setFile] =
    useState<File | null>(null);

  const [courseIds, setCourseIds] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(false);

  async function handleImport() {
    if (!file) {
      toast.error("Chọn file Excel");
      return;
    }

    if (courseIds.length === 0) {
      toast.error("Chọn ít nhất 1 khóa học");
      return;
    }

    try {
      setLoading(true);

      await onImport(file, courseIds);

      toast.success("Import thành công");

      onOpenChange(false);

      setFile(null);
      setCourseIds([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-xl">

        <DialogHeader>

          <DialogTitle>

            Import học sinh từ Excel

          </DialogTitle>

        </DialogHeader>

        <div className="space-y-6">

          {/* Upload */}

          <Card>

            <CardContent className="space-y-4 p-5">

              <Label>
                File Excel
              </Label>

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) =>
                  setFile(
                    e.target.files?.[0] ?? null
                  )
                }
              />

              <p className="text-sm text-muted-foreground">
                File gồm 3 cột:
              </p>

              <ul className="list-disc pl-5 text-sm text-muted-foreground">

                <li>student_code</li>

                <li>full_name</li>

                <li>personal_email</li>

              </ul>

            </CardContent>

          </Card>

          {/* Courses */}

          <Card>

            <CardContent className="space-y-3 p-5">

              <Label>

                Chọn khóa học

              </Label>

              {courses.map((course) => (

                <div
                  key={course.id}
                  className="flex items-center gap-3"
                >

                  <Checkbox
                    checked={courseIds.includes(
                      course.id
                    )}
                    onCheckedChange={(checked) => {

                      if (checked) {

                        setCourseIds((prev) => [
                          ...prev,
                          course.id,
                        ]);

                      } else {

                        setCourseIds((prev) =>
                          prev.filter(
                            (x) => x !== course.id
                          )
                        );

                      }

                    }}
                  />

                  <span>

                    {course.name}

                  </span>

                </div>

              ))}

            </CardContent>

          </Card>

          <Button
            className="w-full"
            disabled={loading}
            onClick={handleImport}
          >

            <Upload className="mr-2 h-4 w-4" />

            {loading
              ? "Đang import..."
              : "Import"}

          </Button>

        </div>

      </DialogContent>

    </Dialog>
  );
}