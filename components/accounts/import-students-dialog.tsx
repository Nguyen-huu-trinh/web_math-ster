"use client";

import { toast } from "sonner";
import { StudentDialogHeader, StudentCourseChoices } from "./student-dialog-parts";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, FileSpreadsheet } from "lucide-react";

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
      <DialogContent className="student-enrollment-dialog sm:max-w-[640px]" showCloseButton={false}>
        <StudentDialogHeader importing />
        <div className="student-dialog-body space-y-6">
          <div className="space-y-3">
            <Label htmlFor="excel-file">Danh sách học sinh (Excel) <span className="text-rose-500">*</span></Label>
            <div className="space-y-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <div className="flex items-center gap-3"><FileSpreadsheet className="size-7 shrink-0 text-emerald-600" /><div><p className="text-sm font-bold text-slate-800">{file ? file.name : "Chọn file Excel để thêm học sinh"}</p><p className="mt-1 text-xs text-slate-500">Hỗ trợ định dạng .xlsx và .xls</p></div></div>
              <Input id="excel-file" type="file" accept=".xlsx,.xls" disabled={loading} className="cursor-pointer pt-3" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-xs leading-relaxed text-slate-600"><p className="mb-2 font-bold text-slate-700">File gồm 3 cột bắt buộc:</p><div className="flex flex-wrap gap-2">{["student_code", "full_name", "personal_email"].map((column) => <code key={column} className="rounded-md border border-amber-200 bg-white px-2 py-1 text-xs font-semibold">{column}</code>)}</div></div>
          </div>
          <div className="space-y-3"><Label>Ghi danh vào Khóa học</Label><StudentCourseChoices courses={courses} selectedIds={courseIds} prefix="import-student-course" disabled={loading} onToggle={(id) => setCourseIds((prev) => prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id])} /></div>
        </div>
        <div className="student-dialog-footer">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100">Hủy bỏ</Button>
          <Button disabled={loading} onClick={handleImport} className="gap-2 bg-slate-900 text-white hover:bg-slate-800"><Upload className="size-4 text-amber-400" />{loading ? "Đang import..." : "Import học sinh"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
