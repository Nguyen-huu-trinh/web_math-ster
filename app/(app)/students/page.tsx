"use client";

import {
    PageHeader,
} from "@/components/layout/page-header";

import {
    TeacherStudentsTable,
} from "@/components/teachers/students/teacher-students-table";

import {
    useTeacherStudents,
} from "@/hooks/use-teacher-students";

export default function TeacherStudentsPage() {
    const {
        data: students,
        isLoading,
        isError,
        error,
    } = useTeacherStudents();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Học sinh"
                    description="Danh sách học sinh."
                />

                <div className="rounded-lg border p-8 text-center text-muted-foreground">
                    Đang tải danh sách học sinh...
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Học sinh"
                    description="Danh sách học sinh."
                />

                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">
                    {error instanceof Error
                        ? error.message
                        : "Không thể tải danh sách học sinh."}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Học sinh"
                description="Quản lý danh sách học sinh."
            />

            <TeacherStudentsTable
                students={students ?? []}
            />
        </div>
    );
}