"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileUp, Users, Zap, Wallet, TriangleAlert } from "lucide-react";
import "./students.css";

import { Button } from "@/components/ui/button";
import { TeacherStudentsTable } from "@/components/teachers/students/teacher-students-table";
import { CreateStudentDialog } from "@/components/accounts/create-student-dialog";
import ImportStudentsDialog from "@/components/accounts/import-students-dialog";

import { useCourses } from "@/hooks/use-courses";
import { useCreateStudent, useImportStudents } from "@/hooks/use-accounts";
import { useTeacherStudents } from "@/hooks/use-teacher-students";
export const dynamic = 'force-static';
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

    const allStudents = students ?? [];
    const activeStudents = allStudents.filter((student) => student.isActive);
    const averageHp = allStudents.length ? Math.round(allStudents.reduce((sum, student) => sum + student.points, 0) / allStudents.length) : 0;
    const totalReward = allStudents.reduce((sum, student) => sum + student.rewardMoney, 0);
    const lowHpCount = activeStudents.filter((student) => student.points < 50).length;
    const rewardLabel = new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 2 }).format(totalReward);
    const statsReady = !loadingStudents && !isError;

    return (
        <div className="students-management space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                    <p className="mb-1 text-sm font-extrabold uppercase tracking-wide text-amber-600">Quản trị học viên</p>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Danh Sách Chiến Binh</h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">Quản lý tài khoản, theo dõi Độ trâu (HP), Quỹ thưởng và tiến độ học tập.</p>
                </div>
                <div className="students-header-actions flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => setImportOpen(true)} className="h-11 rounded-2xl border-slate-200 bg-white px-5 font-bold text-slate-700 shadow-none hover:bg-slate-50">
                        <FileUp className="mr-2 size-4 text-emerald-600" />Import Excel
                    </Button>
                    {!loadingCourses && <CreateStudentDialog courses={courses} onCreate={handleCreateStudent} />}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="student-summary">
                    <div className="student-summary-icon border-slate-900 bg-slate-900 text-amber-400"><Users className="size-6" /></div>
                    <div><p className="student-summary-label">Tổng sĩ số</p><p className="student-summary-value text-slate-900">{statsReady ? activeStudents.length : "—"} <span className="text-xs font-bold text-emerald-600">{ ` đang học` }</span></p></div>
                </div>
                <div className="student-summary">
                    <div className="student-summary-icon border-amber-200 bg-amber-50 text-amber-600"><Zap className="size-6" /></div>
                    <div><p className="student-summary-label">Độ trâu trung bình</p><p className="student-summary-value text-slate-900">{statsReady ? averageHp.toLocaleString("vi-VN") : "—"} <span className="text-xs font-bold text-slate-400">HP</span></p></div>
                </div>
                <div className="student-summary" title={statsReady ? `${totalReward.toLocaleString("vi-VN")} VNĐ` : undefined}>
                    <div className="student-summary-icon border-emerald-200 bg-emerald-50 text-emerald-600"><Wallet className="size-6" /></div>
                    <div><p className="student-summary-label">Tổng quỹ thưởng</p><p className="student-summary-value text-emerald-700">{statsReady ? rewardLabel : "—"} <span className="text-xs font-bold text-emerald-600">VNĐ</span></p></div>
                </div>
                <div className="student-summary">
                    <div className="student-summary-icon border-rose-200 bg-rose-50 text-rose-500"><TriangleAlert className="size-6" /></div>
                    <div><p className="student-summary-label">Báo động (&lt;50 HP)</p><p className="student-summary-value text-rose-600">{statsReady ? String(lowHpCount).padStart(2, "0") : "—"} <span className="text-xs font-bold text-rose-500">cần theo dõi</span></p></div>
                </div>
            </div>

            {loadingStudents ? (
                <div className="rounded-lg border p-8 text-center text-muted-foreground">
                    Đang tải danh sách học sinh…
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
