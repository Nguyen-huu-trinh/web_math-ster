"use client";
import { toast } from "sonner";
import { StudentDialogHeader, StudentCourseChoices } from "./student-dialog-parts";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Plus, Check,
} from "lucide-react";

interface Course {
  id: string;
  name: string;
}

interface Props {
  courses: Course[];
  onCreate: (payload: {
    student_code: string;
    full_name: string;
    personal_email: string;
    course_ids: string[];
  }) => Promise<void>;
}

export function CreateStudentDialog({
  courses,
  onCreate,
}: Props) {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [studentCode, setStudentCode] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [personalEmail, setPersonalEmail] =
    useState("");

  const [selectedCourses, setSelectedCourses] =
    useState<string[]>([]);

  const toggleCourse = (id: string) => {
    setSelectedCourses((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  async function handleSubmit() {
    if (!studentCode.trim()) {
    toast.error("Nhập mã học sinh");
      return;
    }

    if (!fullName.trim()) {
     toast.error("Nhập họ tên");
      return;
    }

    if (selectedCourses.length === 0) {
     toast.error("Chọn ít nhất một khóa học");
      return;
    }

    try {
      setLoading(true);

      await onCreate({
        student_code: studentCode,
        full_name: fullName,
        personal_email: personalEmail,
        course_ids: selectedCourses,
      });

      setStudentCode("");
      setFullName("");
      setPersonalEmail("");
      setSelectedCourses([]);

      setOpen(false);

    toast.success("Tạo học sinh thành công");
    } catch (e: any) {
    toast.success(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={<Button className="h-11 gap-2 rounded-2xl bg-slate-900 px-5 font-bold text-white hover:bg-slate-800" />}
      >
        <Plus className="size-4 text-amber-400" />
        Thêm học sinh
      </DialogTrigger>

      <DialogContent className="student-enrollment-dialog sm:max-w-[640px]" showCloseButton={false}>
        <StudentDialogHeader />
        <div className="student-dialog-body space-y-6">
          <div className="grid gap-4 sm:grid-cols-[0.65fr_1.35fr]">
            <div className="space-y-2"><Label htmlFor="new-student-code">Mã HS <span className="text-rose-500">*</span></Label><Input id="new-student-code" value={studentCode} onChange={(event) => setStudentCode(event.target.value)} placeholder="MS054" disabled={loading} /></div>
            <div className="space-y-2"><Label htmlFor="new-student-name">Họ và Tên <span className="text-rose-500">*</span></Label><Input id="new-student-name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="VD: Nguyễn Văn A" disabled={loading} /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="new-student-email">Email cá nhân (Nhận thông báo)</Label><Input id="new-student-email" type="email" value={personalEmail} onChange={(event) => setPersonalEmail(event.target.value)} placeholder="hocsinh@gmail.com" disabled={loading} /></div>
          <div className="space-y-3"><Label>Ghi danh vào Khóa học</Label><StudentCourseChoices courses={courses} selectedIds={selectedCourses} onToggle={toggleCourse} prefix="create-student-course" disabled={loading} /></div>
        </div>
        <div className="student-dialog-footer">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100">Hủy bỏ</Button>
          <Button disabled={loading} onClick={handleSubmit} className="gap-2 bg-slate-900 text-white hover:bg-slate-800"><Check className="size-4 text-amber-400" />{loading ? "Đang tạo..." : "Tạo học sinh"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
