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
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">

            {/* AVG SCORE */}
            <div className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <GraduationCap className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Avg Score
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {averageScore.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* PENDING EXAMS */}
            <div className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                        <ClipboardList className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Bài kiểm tra chưa làm
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {pendingExams}
                        </p>
                    </div>
                </div>
            </div>

            {/* INCOMPLETE LESSONS */}
            <div className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                        <BookOpenCheck className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Bài học chưa hoàn thành
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {incompleteLessons}
                        </p>
                    </div>
                </div>
            </div>

            {/* PASSED EXERCISES */}
            <div className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                        <CircleCheck className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Bài tập đã đạt
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {passedExercises}
                        </p>
                    </div>
                </div>
            </div>

            {/* FAILED EXERCISES */}
            <div className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                        <CircleX className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Bài tập chưa đạt
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {failedExercises}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}