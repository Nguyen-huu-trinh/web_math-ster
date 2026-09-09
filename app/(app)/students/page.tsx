"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { TeacherStudentsTable } from "@/components/teachers/students/teacher-students-table";
import { CreateStudentDialog } from "@/components/accounts/create-student-dialog";
import ImportStudentsDialog from "@/components/accounts/import-students-dialog";

import { useCourses } from "@/hooks/use-courses";
import { useCreateStudent, useImportStudents } from "@/hooks/use-accounts";
import { useTeacherStudents } from "@/hooks/use-teacher-students";

export default function TeacherStudentsPage() {
    const { courses, isLoading: loadingCourses } = useCourses();
    const {
        data: students,
        isLoading: loadingStudents,
        isError,
        error,
        refetch,
    } = useTeacherStudents();

    const createStudentMutation = useCreateStudent();
    const importStudentsMutation = useImportStudents();

    const [importOpen, setImportOpen] = useState(false);

    async function handleCreateStudent(payload: {
        student_code: string;
        full_name: string;
        personal_email: string;
        course_ids: string[];
    }) {
        try {
            const result = await createStudentMutation.mutateAsync(payload);
            toast.success(
                `Tạo thành công!\n\nEmail: ${result.email}\nPassword: ${result.password}`
            );
            void refetch();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message ?? "Không thể tạo học sinh.");
        }
    }

    async function handleImport(file: File, courseIds: string[]) {
        try {
            const result = await importStudentsMutation.mutateAsync({
                file,
                courseIds,
            });
            toast.success(
                `Import thành công!\n\nTạo mới: ${result.success}\nLỗi: ${result.failed}`
            );
            void refetch();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message ?? "Import thất bại.");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Học sinh"
                    description="Quản lý danh sách và tài khoản học sinh."
                />

                <div className="flex gap-3">
                    {!loadingCourses && (
                        <CreateStudentDialog
                            courses={courses}
                            onCreate={handleCreateStudent}
                        />
                    )}

                    <Button onClick={() => setImportOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Excel
                    </Button>
                </div>
            </div>

            {loadingStudents ? (
                <div className="rounded-lg border p-8 text-center text-muted-foreground">
                    Đang tải danh sách học sinh...
                </div>
            ) : isError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">
                    {error instanceof Error
                        ? error.message
                        : "Không thể tải danh sách học sinh."}
                </div>
            ) : (
                <TeacherStudentsTable students={students ?? []} />
            )}

            <ImportStudentsDialog
                open={importOpen}
                onOpenChange={setImportOpen}
                courses={courses}
                onImport={handleImport}
            />
        </div>
    );
}