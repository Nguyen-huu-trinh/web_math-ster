"use client";

import { UserPlus, FileUp, X } from "lucide-react";
import { DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import "./student-dialog.css";

export function StudentDialogHeader({ importing = false }: { importing?: boolean }) {
  return <DialogHeader className="student-dialog-header">
    <div className="flex items-center gap-4 pr-8">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-400/10 text-amber-400">{importing ? <FileUp className="size-6" /> : <UserPlus className="size-6" />}</div>
      <div><DialogTitle className="text-xl font-extrabold tracking-tight text-white">{importing ? "Thêm Chiến Binh Từ Excel" : "Thêm Chiến Binh Mới"}</DialogTitle><DialogDescription className="mt-1 text-sm font-medium text-slate-400">{importing ? "Nhập danh sách học viên và ghi danh vào khóa học" : "Khởi tạo tài khoản học viên vào hệ thống"}</DialogDescription></div>
    </div>
    <DialogClose aria-label="Đóng hộp thoại" className="absolute right-5 top-7 flex size-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"><X className="size-5" /></DialogClose>
  </DialogHeader>;
}

export function StudentCourseChoices({ courses, selectedIds, onToggle, prefix, disabled = false }: {
  courses: { id: string; name: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  prefix: string;
  disabled?: boolean;
}) {
  return <div className="grid max-h-64 grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
    {courses.length === 0 && <p className="col-span-full py-3 text-sm text-slate-500">Chưa có khóa học để ghi danh.</p>}
    {courses.map((course) => {
      const selected = selectedIds.includes(course.id);
      const [title, ...description] = course.name.split(/\s*[-–—]\s*/);
      return <label key={course.id} htmlFor={`${prefix}-${course.id}`} className={`student-course-choice ${selected ? "is-selected" : ""}`}>
        <Checkbox id={`${prefix}-${course.id}`} disabled={disabled} checked={selected} onCheckedChange={() => onToggle(course.id)} className="size-5 shrink-0 rounded-sm border-slate-400 data-checked:border-slate-900 data-checked:bg-slate-900 data-checked:text-white" />
        <div className="min-w-0"><p className="text-sm font-extrabold text-slate-900">{title}</p>{description.length > 0 && <p className="mt-1 text-xs font-medium text-slate-400">{description.join(" – ")}</p>}</div>
      </label>;
    })}
  </div>;
}
