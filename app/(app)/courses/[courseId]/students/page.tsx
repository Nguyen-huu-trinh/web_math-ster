"use client";

import { use } from "react";
import Link from "next/link";

import { ChevronLeft, Plus } from "lucide-react";
import { useState } from "react";

import {
    AddStudentToCourseDialog,
} from "@/components/teachers/students/add-student-to-course-dialog";

import {
    useTeacherStudents,
} from "@/hooks/use-teacher-students";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TeacherStudentsTable } from "@/components/teachers/students/teacher-students-table";

import { useTeacherCourseStudents } from "@/hooks/use-teacher-course-students";

export default function CourseStudentsPage({
    params,
}: {
    params: Promise<{
        courseId: string;
    }>;
}) {
    const { courseId } = use(params);
    const [addStudentOpen, setAddStudentOpen] =
    useState(false);
    const {
        data: students,
        isLoading,
        isError,
        error,
    } = useTeacherCourseStudents(courseId);
const {
    data: allStudents,
    isLoading: isLoadingAllStudents,
} =
    useTeacherStudents();
const enrolledStudentIds =
    new Set(
        (students ?? []).map(
            (student) => student.id
        )
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Học sinh"
                    description="Danh sách học sinh của khóa học."
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
                    description="Danh sách học sinh của khóa học."
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
            <div className="flex items-center justify-between gap-4">
                <PageHeader
                    title="Học sinh"
                    description="Quản lý danh sách học sinh của khóa học."
                />

                <div className="flex items-center gap-2">
                    <Link href={`/courses/${courseId}`}>
                        <Button variant="outline">
                            <ChevronLeft />
                            Quay lại khóa học
                        </Button>
                    </Link>

                    <Button
                        onClick={() =>
                            setAddStudentOpen(true)
                        }
                        disabled={isLoadingAllStudents}
                    >
                        <Plus />
                        Thêm học sinh
                    </Button>
                </div>
            </div>

            <TeacherStudentsTable
                students={students ?? []}
                courseId={courseId}
            />
            <AddStudentToCourseDialog
                open={addStudentOpen}
                onOpenChange={setAddStudentOpen}
                courseId={courseId}
                students={allStudents ?? []}
                enrolledStudentIds={
                    enrolledStudentIds
                }
            />
        </div>
    );
}