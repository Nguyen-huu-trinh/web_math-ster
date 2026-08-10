"use client";

import {
    ChevronDown,
    ChevronRight,
    Trash2,
} from "lucide-react";

import {
    useState,
} from "react";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {
    useDeleteStudentAttempt,
} from "@/hooks/use-delete-student-attempt";

import type {
    TeacherStudentExam,
} from "@/services/teacher-student-client.service";

interface Props {
    studentId: string;
    exams: TeacherStudentExam[];
}

export function StudentExamHistory({
    studentId,
    exams,
}: Props) {
    const [openExam, setOpenExam] =
        useState<string | null>(null);

    const deleteAttempt =
        useDeleteStudentAttempt(
            studentId
        );

    function handleDelete(
        attemptId: string
    ) {
        const confirmed =
            window.confirm(
                "Bạn có chắc muốn xóa hẳn lượt làm này? Hành động này không thể hoàn tác."
            );

        if (!confirmed) {
            return;
        }

        deleteAttempt.mutate(
            attemptId
        );
    }

    return (
        <div className="rounded-xl border bg-card">
            <div className="border-b p-6">
                <h2 className="text-lg font-semibold">
                    Bài kiểm tra
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Lịch sử các bài kiểm tra và
                    lượt làm của học sinh.
                </p>
            </div>

            <div className="divide-y">
                {exams.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        Chưa có bài kiểm tra.
                    </div>
                ) : (
                    exams.map((exam) => {
                        const isOpen =
                            openExam ===
                            exam.id;

                        return (
                            <div
                                key={exam.id}
                            >
                                {/* EXAM */}
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-muted/30"
                                    onClick={() =>
                                        setOpenExam(
                                            isOpen
                                                ? null
                                                : exam.id
                                        )
                                    }
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        {isOpen ? (
                                            <ChevronDown className="h-4 w-4 shrink-0" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 shrink-0" />
                                        )}

                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {
                                                    exam.title
                                                }
                                            </p>

                                            <div className="mt-1 flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {exam.category ===
                                                    "ATTENDANCE"
                                                        ? "Điểm danh"
                                                        : "Định kỳ"}
                                                </Badge>

                                                <span className="text-xs text-muted-foreground">
                                                    {
                                                        exam.attempts
                                                            .length
                                                    }{" "}
                                                    lượt làm
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <span className="shrink-0 text-sm text-muted-foreground">
                                        {
                                            exam.duration
                                        }{" "}
                                        phút
                                    </span>
                                </button>

                                {/* ATTEMPTS */}
                                {isOpen && (
                                    <div className="border-t bg-muted/20 px-5 py-4">
                                        {exam
                                            .attempts
                                            .length ===
                                        0 ? (
                                            <p className="py-3 text-center text-sm text-muted-foreground">
                                                Học sinh chưa
                                                làm bài này.
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {exam.attempts.map(
                                                    (
                                                        attempt
                                                    ) => (
                                                        <div
                                                            key={
                                                                attempt.id
                                                            }
                                                            className="flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                                                        >
                                                            <div className="grid gap-2 text-sm sm:grid-cols-4">
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Lượt
                                                                    </p>

                                                                    <p className="font-medium">
                                                                        #
                                                                        {
                                                                            attempt.attemptNumber
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Điểm
                                                                    </p>

                                                                    <p className="font-medium">
                                                                        {attempt.score ??
                                                                            "--"}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Bắt đầu
                                                                    </p>

                                                                    <p className="font-medium">
                                                                        {attempt.startedAt
                                                                            ? new Date(
                                                                                  attempt.startedAt
                                                                              ).toLocaleString(
                                                                                  "vi-VN"
                                                                              )
                                                                            : "--"}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Nộp bài
                                                                    </p>

                                                                    <p className="font-medium">
                                                                        {attempt.submittedAt
                                                                            ? new Date(
                                                                                  attempt.submittedAt
                                                                              ).toLocaleString(
                                                                                  "vi-VN"
                                                                              )
                                                                            : "Chưa nộp"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        attempt.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    deleteAttempt.isPending
                                                                }
                                                            >
                                                                <Trash2 />

                                                                {deleteAttempt.isPending
                                                                    ? "Đang xóa..."
                                                                    : "Xóa lượt"}
                                                            </Button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}