"use client";

import {
    BookOpenCheck,
    ClipboardList,
    GraduationCap,
    CircleCheck,
    CircleX,
} from "lucide-react";

interface Props {
    averageScore: number;
    pendingExams: number;
    incompleteLessons: number;
    passedExercises: number;
    failedExercises: number;
}

export function StudentStatistics({
    averageScore,
    pendingExams,
    incompleteLessons,
    passedExercises,
    failedExercises,
}: Props) {
    return (
        <div className="student-statistics grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

            {/* AVG SCORE */}
            <div className="student-stat-card rounded-[26px] border border-slate-200 bg-white p-4">
                <div className="flex flex-row-reverse items-center justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <GraduationCap className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-xs font-bold text-slate-500">
                            Điểm TB
                        </p>

                        <p className="mt-1.5 text-3xl tabular-nums font-extrabold text-slate-900">
                            {averageScore.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* PENDING EXAMS */}
            <div className="student-stat-card rounded-[26px] border border-slate-200 bg-white p-4">
                <div className="flex flex-row-reverse items-center justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                        <ClipboardList className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-xs font-bold text-slate-500">
                            Đề chưa làm
                        </p>

                        <p className="mt-1.5 text-3xl tabular-nums font-extrabold text-slate-900">
                            {pendingExams}
                        </p>
                    </div>
                </div>
            </div>

            {/* INCOMPLETE LESSONS */}
            <div className="student-stat-card rounded-[26px] border border-slate-200 bg-white p-4">
                <div className="flex flex-row-reverse items-center justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                        <BookOpenCheck className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-xs font-bold text-slate-500">
                            Bài chưa học
                        </p>

                        <p className="mt-1.5 text-3xl tabular-nums font-extrabold text-slate-900">
                            {incompleteLessons}
                        </p>
                    </div>
                </div>
            </div>

            {/* PASSED EXERCISES */}
            <div className="student-stat-card rounded-[26px] border border-slate-200 bg-white p-4">
                <div className="flex flex-row-reverse items-center justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                        <CircleCheck className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-xs font-bold text-slate-500">
                            Bài đạt chuẩn
                        </p>

                        <p className="mt-1.5 text-3xl tabular-nums font-extrabold text-emerald-600">
                            {passedExercises}
                        </p>
                    </div>
                </div>
            </div>

            {/* FAILED EXERCISES */}
            <div className="student-stat-card rounded-[26px] border border-slate-200 bg-white p-4">
                <div className="flex flex-row-reverse items-center justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                        <CircleX className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-xs font-bold text-slate-500">
                            Chưa đạt
                        </p>

                        <p className="mt-1.5 text-3xl tabular-nums font-extrabold text-rose-600">
                            {failedExercises}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}