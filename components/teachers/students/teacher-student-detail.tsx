"use client";

import { useRouter } from "next/navigation";

import {
    ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
    PageHeader,
} from "@/components/layout/page-header";

import {
    StudentStatistics,
} from "@/components/teachers/students/student-statistics";

import {
    StudentProfileCard,
} from "@/components/teachers/students/student-profile-card";

import {
    StudentExamHistory,
} from "@/components/teachers/students/student-exam-history";

import {
    useTeacherStudentDetail,
} from "@/hooks/use-teacher-student-detail";

interface Props {
    studentId: string;
}

export function TeacherStudentDetailPage({
    studentId,
}: Props) {
    const router = useRouter();

    const {
        data,
        isLoading,
        isError,
        error,
    } = useTeacherStudentDetail(
        studentId
    );

    /*
     * ==========================================
     * LOADING
     * ==========================================
     */
    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Học sinh"
                    description="Đang tải thông tin học sinh..."
                />

                <div className="rounded-xl border p-10 text-center text-muted-foreground">
                    Đang tải...
                </div>
            </div>
        );
    }

    /*
     * ==========================================
     * ERROR
     * ==========================================
     */
    if (isError || !data) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Học sinh"
                    description="Không thể tải thông tin học sinh."
                />

                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">
                    {error instanceof Error
                        ? error.message
                        : "Không tìm thấy học sinh."}
                </div>

                <Button
                    variant="outline"
                    onClick={() =>
                        router.push(
                            "/students"
                        )
                    }
                >
                    <ArrowLeft />
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    /*
     * ==========================================
     * PAGE
     * ==========================================
     */
    return (
        <div className="space-y-6">

            {/* BACK */}
            <div>
                <Button
                    variant="ghost"
                    className="-ml-3"
                    onClick={() =>
                        router.push(
                            "/students"
                        )
                    }
                >
                    <ArrowLeft />
                    Danh sách học sinh
                </Button>
            </div>

            {/* HEADER */}
            <PageHeader
                title={
                    data.profile.fullName
                }
                description={`Student Code: ${data.profile.studentCode}`}
            />

            {/* PROFILE */}
            <StudentProfileCard
                profile={
                    data.profile
                }
            />

            {/* STATISTICS */}
            <StudentStatistics
                averageScore={
                    data.statistics
                        .averageScore
                }

                pendingExams={
                    data.statistics
                        .pendingExams
                }

                incompleteLessons={
                    data.statistics
                        .incompleteLessons
                }

                passedExercises={
                    data.statistics
                        .passedExercises
                }

                failedExercises={
                    data.statistics
                        .failedExercises
                }
            />

            {/* EXAMS */}
            <StudentExamHistory
                studentId={
                    data.profile.id
                }
                exams={
                    data.exams
                }
            />

        </div>
    );
}