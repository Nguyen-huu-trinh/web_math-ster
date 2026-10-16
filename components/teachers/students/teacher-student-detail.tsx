"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { useDisableTeacherStudent } from "@/hooks/use-disable-teacher-student";
import { useEnableTeacherStudent } from "@/hooks/use-enable-teacher-student";
import "./student-detail.css";

import {
    ArrowLeft, KeyRound, Ban, Unlock,
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
    courseId?: string;
}

export function TeacherStudentDetailPage({
    studentId,
    courseId,
}: Props) {
    const router = useRouter();
    const disableStudent = useDisableTeacherStudent();
    const enableStudent = useEnableTeacherStudent();
    const [resetting, setResetting] = useState(false);
    const accountBusy = resetting || disableStudent.isPending || enableStudent.isPending;

    async function resetPassword() {
        if (accountBusy || !window.confirm("Reset mật khẩu học sinh về 123456?")) return;
        setResetting(true);
        try {
            await apiClient.post(`/api/teachers/students/${studentId}/reset-password`, {});
            toast.success("Đã reset mật khẩu về 123456.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể reset mật khẩu.");
        } finally { setResetting(false); }
    }

    async function toggleAccount() {
        if (!data || accountBusy) return;
        const active = data.profile.isActive;
        if (!window.confirm(`${active ? "Khóa" : "Mở khóa"} tài khoản của ${data.profile.fullName}?`)) return;
        try {
            await (active ? disableStudent : enableStudent).mutateAsync(studentId);
            toast.success(active ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể cập nhật trạng thái tài khoản.");
        }
    }

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
                    description="Đang húc . . . "
                />

                <div className="rounded-xl border p-10 text-center text-muted-foreground">
                    Đang húc . . . 
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
                                courseId
                                    ? `/courses/${courseId}/students`
                                    : "/students"
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
        <div className="student-detail space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="outline" className="rounded-2xl border-slate-200 bg-white font-bold text-slate-600" onClick={() => router.push(courseId ? `/courses/${courseId}/students` : "/students")}><ArrowLeft className="size-4" />Quay lại danh sách học sinh</Button>
                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="rounded-2xl border-slate-200 bg-white font-bold text-slate-600" disabled={accountBusy} onClick={resetPassword}><KeyRound className="size-4 text-slate-400" />{resetting ? "Đang reset…" : "Reset mật khẩu"}</Button>
                    <Button variant="outline" className={`rounded-2xl font-bold ${data.profile.isActive ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`} disabled={accountBusy} onClick={toggleAccount}>{data.profile.isActive ? <Ban className="size-4" /> : <Unlock className="size-4" />}{disableStudent.isPending || enableStudent.isPending ? "Đang xử lý…" : data.profile.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}</Button>
                </div>
            </div>
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(280px,0.75fr)_minmax(0,2.2fr)]">
                <StudentProfileCard key={data.profile.id} profile={data.profile} />
                <div className="min-w-0 space-y-6">
                    <StudentStatistics averageScore={data.statistics.averageScore} pendingExams={data.statistics.pendingExams} incompleteLessons={data.statistics.incompleteLessons} passedExercises={data.statistics.passedExercises} failedExercises={data.statistics.failedExercises} />
                    <StudentExamHistory studentId={data.profile.id} exams={data.exams} />
                </div>
            </div>
        </div>
    );
}
