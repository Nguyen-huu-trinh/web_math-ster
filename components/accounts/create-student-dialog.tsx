"use client";
import { toast } from "sonner";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  ScrollArea,
} from "@/components/ui/scroll-area";

import {
  Checkbox,
} from "@/components/ui/checkbox";

import {
  Plus,
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
      <DialogTrigger>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm học sinh
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogTrigger
        render={<Button />}
        >
        Tạo học sinh
        </DialogTrigger>

        <div className="space-y-5">

          <div className="space-y-2">
            <Label>
              Student Code *
            </Label>

            <Input
              value={studentCode}
              onChange={(e) =>
                setStudentCode(e.target.value)
              }
              placeholder="VD: HS0001"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Full Name *
            </Label>

            <Input
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Personal Email
            </Label>

            <Input
              value={personalEmail}
              onChange={(e) =>
                setPersonalEmail(e.target.value)
              }
              placeholder="abc@gmail.com"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Khóa học
            </Label>

            <ScrollArea className="h-52 rounded-md border p-3">

              <div className="space-y-3">

                {courses.map((course) => (

                  <div
                    key={course.id}
                    className="flex items-center gap-3"
                  >

                    <Checkbox
                      checked={selectedCourses.includes(
                        course.id
                      )}
                      onCheckedChange={() =>
                        toggleCourse(course.id)
                      }
                    />

                    <span>
                      {course.name}
                    </span>

                  </div>

                ))}

              </div>

            </ScrollArea>
          </div>

          <div className="flex justify-end gap-3">

            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>

            <Button
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading
                ? "Đang tạo..."
                : "Tạo học sinh"}
            </Button>

          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}