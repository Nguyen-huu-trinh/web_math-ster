"use client";

import { toast } from "sonner";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload } from "lucide-react";

interface Course {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  onImport: (file: File, courseIds: string[]) => Promise<void>;
}

export default function ImportStudentsDialog({
  open,
  onOpenChange,
  courses,
  onImport,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    if (!file) {
      toast.error("Vui lòng chọn file Excel");
      return;
    }

    if (courseIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 khóa học");
      return;
    }

    try {
      setLoading(true);
      await onImport(file, courseIds);
      toast.success("Import thành công");
      onOpenChange(false);
      setFile(null);
      setCourseIds([]);
    } catch (error) {
      // Catch lỗi nếu hàm onImport throw exception
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full p-6">
        <DialogHeader>
          <DialogTitle>Import học sinh từ Excel</DialogTitle>
        </DialogHeader>

        {/* Khung chứa các phần nhập liệu, giới hạn chiều cao tối đa và cho phép cuộn khi quá dài */}
        <div className="space-y-4 my-2 max-h-[60vh] overflow-y-auto pr-1">
          {/* Khối 1: Upload File */}
          <div className="rounded-xl border p-4 bg-card text-card-foreground space-y-3 w-full box-border">
            <Label htmlFor="excel-file" className="font-semibold block">
              File Excel
            </Label>

            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              className="cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            <div className="text-xs text-muted-foreground space-y-1">
              <p>File gồm 3 cột bắt buộc:</p>
              <ul className="list-disc list-inside pl-1 space-y-0.5">
                <li><code className="font-mono">student_code</code></li>
                <li><code className="font-mono">full_name</code></li>
                <li><code className="font-mono">personal_email</code></li>
              </ul>
            </div>
          </div>

          {/* Khối 2: Chọn khóa học */}
          <div className="rounded-xl border p-4 bg-card text-card-foreground space-y-3 w-full box-border">
            <Label className="font-semibold block">Chọn khóa học</Label>

            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-2">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center space-x-2.5">
                  <Checkbox
                    id={`course-${course.id}`}
                    checked={courseIds.includes(course.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCourseIds((prev) => [...prev, course.id]);
                      } else {
                        setCourseIds((prev) =>
                          prev.filter((x) => x !== course.id)
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={`course-${course.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                  >
                    {course.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nút bấm ở chân Dialog */}
        <DialogFooter className="pt-2">
          <Button
            className="w-full"
            disabled={loading}
            onClick={handleImport}
          >
            <Upload className="mr-2 h-4 w-4" />
            {loading ? "Đang import..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}