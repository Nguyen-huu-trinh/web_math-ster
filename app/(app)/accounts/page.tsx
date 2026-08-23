"use client";
import { toast } from "sonner";
import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Users, Upload } from "lucide-react";

import { CreateStudentDialog } from "@/components/accounts/create-student-dialog";
import ImportStudentsDialog from "@/components/accounts/import-students-dialog";
import { useCourses } from "@/hooks/use-courses";
import { useCreateStudent, useImportStudents } from "@/hooks/use-accounts";

interface Course {
  id: string;
  name: string;
}

export default function AccountsPage() {
  const { courses, isLoading: loading } = useCourses();
  const createStudentMutation = useCreateStudent();
  const importStudentsMutation = useImportStudents();

  const [importOpen, setImportOpen] = useState(false);

  /* Legacy manual course loading; useCourses supplies the shared query above.
  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);

      const res = await fetch("/api/courses");

      if (!res.ok) {
        throw new Error("Không thể tải danh sách khóa học.");
      }

      const data = await res.json();

      setCourses(data);
    } catch (err) {
      console.error(err);
      alert("Không tải được khóa học.");
    } finally {
      setLoading(false);
    }
  }

  */

  async function handleCreateStudent(payload: {
    student_code: string;
    full_name: string;
    personal_email: string;
    course_ids: string[];
  }) {
    try {
      /* const res = await fetch("/api/accounts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message ?? "Có lỗi xảy ra.");
      }

      */
      const result = await createStudentMutation.mutateAsync(payload);

      toast.success(
        `Tạo thành công!\n\nEmail: ${result.email}\nPassword: ${result.password}`
      );
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  }

  async function handleImport(
  file: File,
  courseIds: string[]
) {
  /* const formData = new FormData();

  formData.append("file", file);

  courseIds.forEach((id) => {
    formData.append("courseIds", id);
  });

  const res = await fetch("/api/accounts/import", {
    method: "POST",
    body: formData,
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message);
  }

  */
  const result = await importStudentsMutation.mutateAsync({ file, courseIds });

 toast.success(
    `Import thành công!

Tạo mới: ${result.success}
Lỗi: ${result.failed}`
  );
}

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Quản lý tài khoản học sinh
          </h1>

          <p className="text-muted-foreground">
            Tạo học sinh hoặc import Excel.
          </p>
        </div>

        <div className="flex gap-3">

          {!loading && (
            <CreateStudentDialog
              courses={courses}
              onCreate={handleCreateStudent}
            />
          )}

          <Button
            onClick={() => setImportOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Excel
          </Button>

        </div>

      </div>

      <Card>

        <CardContent className="flex flex-col items-center justify-center py-24">

          <Users className="mb-4 h-12 w-12 text-muted-foreground" />

          <h2 className="text-lg font-semibold">
            Quản lý học sinh
          </h2>

          <p className="mt-2 text-center text-muted-foreground">
            Sử dụng nút phía trên để tạo học sinh hoặc import danh sách từ Excel.
          </p>

        </CardContent>

      </Card>

      <ImportStudentsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        courses={courses}
        onImport={handleImport}
      />

    </div>
  );
}
