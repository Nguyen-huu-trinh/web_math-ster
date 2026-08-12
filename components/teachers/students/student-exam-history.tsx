"use client";
import {
    Trash2,
} from "lucide-react";
import {
    MoreHorizontal,
} from "lucide-react";

import {
    useDeleteStudentAttempt,
} from "@/hooks/use-delete-student-attempt";

import type {
    TeacherStudentExam,
} from "@/services/teacher-student-client.service";

import {
    Button,
} from "@/components/ui/button";

import {
    Badge,
} from "@/components/ui/badge";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
    studentId: string;
    exams: TeacherStudentExam[];
}

export function StudentExamHistory({
    studentId,
    exams,
}: Props) {
    const deleteAttempt =
        useDeleteStudentAttempt(
            studentId
        );

    /*
     * ==========================================
     * DELETE ATTEMPT
     * ==========================================
     */
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

    /*
     * ==========================================
     * FORMAT DATE
     * ==========================================
     */
    function formatDate(
        value: string | null
    ) {
        if (!value) {
            return "--";
        }

        return new Date(
            value
        ).toLocaleString(
            "vi-VN"
        );
    }

    /*
     * ==========================================
     * CALCULATE ATTEMPT DURATION
     * ==========================================
     *
     * Thời gian làm bài =
     *
     * submittedAt - startedAt
     *
     * Nếu chưa nộp bài thì chưa có
     * thời gian hoàn thành.
     */
    function formatAttemptDuration(
        startedAt: string | null,
        submittedAt: string | null
    ) {
        if (
            !startedAt ||
            !submittedAt
        ) {
            return "--";
        }

        const start =
            new Date(
                startedAt
            ).getTime();

        const end =
            new Date(
                submittedAt
            ).getTime();

        const diff =
            Math.max(
                0,
                end - start
            );

        const totalMinutes =
            Math.floor(
                diff /
                    (1000 * 60)
            );

        const hours =
            Math.floor(
                totalMinutes / 60
            );

        const minutes =
            totalMinutes % 60;

        if (hours > 0) {
            return `${hours} giờ ${minutes} phút`;
        }

        return `${minutes} phút`;
    }

    /*
     * ==========================================
     * FORMAT EXAM CATEGORY
     * ==========================================
     */
    function formatCategory(
        category: string
    ) {
        switch (category) {
            case "ATTENDANCE":
                return "Điểm danh";

            case "PERIODIC":
                return "Định kỳ";

            case "PRACTICE":
                return "Luyện tập";

            default:
                return category;
        }
    }

    /*
     * ==========================================
     * CREATE TABLE ROWS
     * ==========================================
     *
     * Mỗi attempt = một dòng.
     *
     * Nếu chưa có attempt:
     * tạo một dòng "Chưa làm".
     */
type ExamTableRow = {
    exam: TeacherStudentExam;
    attempt:
        | TeacherStudentExam["attempts"][number]
        | null;
};

const rows: ExamTableRow[] =
    exams.flatMap(
        (exam): ExamTableRow[] => {
            if (
                exam.attempts.length === 0
            ) {
                return [
                    {
                        exam,
                        attempt: null,
                    },
                ];
            }

            return exam.attempts.map(
                (attempt) => ({
                    exam,
                    attempt,
                })
            );
        }
    );

    return (
        <div className="rounded-xl border bg-card">

            {/* HEADER */}
            <div className="border-b p-6">
                <h2 className="text-lg font-semibold">
                    Bài kiểm tra
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Lịch sử các bài kiểm tra và lượt làm của học sinh.
                </p>
            </div>

            {/* EMPTY */}
            {rows.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                    Chưa có bài kiểm tra.
                </div>
            ) : (
                <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                        {/* TABLE HEADER */}
                        <thead className="border-b bg-muted/30">
                            <tr className="text-left">

                                <th className="px-5 py-3 font-medium">
                                    Tên đề
                                </th>

                                <th className="px-5 py-3 text-center font-medium">
                                    Loại đề
                                </th>

                                <th className="px-5 py-3 text-center font-medium">
                                    Trạng thái
                                </th>

                                <th className="px-5 py-3 text-center font-medium">
                                    Điểm
                                </th>

                                <th className="px-5 py-3 text-center font-medium">
                                    Thời gian làm bài
                                </th>

                               <th className="px-5 py-3 text-center font-medium">
                                    Thời điểm nộp bài
                                </th>

                                <th className="w-12 px-3 py-3 text-center font-medium">
                                    Action
                                </th>

                            </tr>
                        </thead>

                        {/* TABLE BODY */}
                        <tbody className="divide-y">

                            {rows.map(
                                ({
                                    exam,
                                    attempt,
                                }) => {

                                    /*
                                     * ==================================
                                     * STATUS
                                     * ==================================
                                     *
                                     * Không có attempt
                                     *      -> Chưa làm
                                     *
                                     * Có attempt nhưng chưa nộp
                                     *      -> Chưa làm
                                     *
                                     * Đã nộp + isPassed true
                                     *      -> Đạt
                                     *
                                     * Đã nộp + isPassed false
                                     *      -> Chưa đạt
                                     */

                                    let status:
                                        | "passed"
                                        | "failed"
                                        | "pending";

                                    if (
                                        !attempt ||
                                        !attempt.submittedAt
                                    ) {
                                        status =
                                            "pending";
                                    } else if (
                                        attempt.isPassed ===
                                        true
                                    ) {
                                        status =
                                            "passed";
                                    } else {
                                        status =
                                            "failed";
                                    }

                                    return (
                                        <tr
                                            key={
                                                attempt
                                                    ? attempt.id
                                                    : `${exam.id}-not-attempted`
                                            }
                                            className="hover:bg-muted/20"
                                        >

                                            {/* TÊN ĐỀ */}
                                            <td className="px-5 py-4">
                                                <div className="min-w-0">

                                                    <p className="font-medium">
                                                        {
                                                            exam.title
                                                        }
                                                    </p>

                                                    {/* {attempt && (
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Lượt làm #
                                                            {
                                                                attempt.attemptNumber
                                                            }
                                                        </p>
                                                    )} */}

                                                </div>
                                            </td>

                                            {/* LOẠI ĐỀ */}
                                            <td className="px-5 py-4 text-center">
                                                <Badge
                                                    variant="outline"
                                                >
                                                    {formatCategory(
                                                        exam.category
                                                    )}
                                                </Badge>
                                            </td>

                                            {/* TRẠNG THÁI */}
                                            <td className="px-5 py-4 text-center">

                                                {status ===
                                                "passed" ? (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                                        Đạt
                                                    </Badge>
                                                ) : status ===
                                                  "failed" ? (
                                                    <Badge
                                                        variant="destructive"
                                                    >
                                                        Chưa đạt
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        Chưa làm
                                                    </Badge>
                                                )}

                                            </td>

                                            {/* ĐIỂM */}
                                            <td className="px-5 py-4 text-center">
                                                <span className="font-medium">
                                                    {attempt?.score ??
                                                        "--"}
                                                </span>
                                            </td>

                                            {/* THỜI GIAN LÀM */}
                                           <td className="px-5 py-4 text-center text-muted-foreground">
                                                {attempt
                                                    ? formatAttemptDuration(
                                                          attempt.startedAt,
                                                          attempt.submittedAt
                                                      )
                                                    : "--"}
                                            </td>

                                            {/* THỜI ĐIỂM NỘP */}
                                            <td className="px-5 py-4 text-center text-muted-foreground">
                                                {attempt
                                                    ? formatDate(
                                                          attempt.submittedAt
                                                      )
                                                    : "--"}
                                            </td>

{/* ACTION */}
<td className="px-3 py-4 text-center">
    {attempt ? (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
            disabled={deleteAttempt.isPending}
            onClick={() =>
                handleDelete(attempt.id)
            }
        >
            <Trash2 className="h-4 w-4" />

            <span className="sr-only">
                Xóa lượt làm
            </span>
        </Button>
    ) : (
        <span className="text-muted-foreground">
            —
        </span>
    )}
</td>

                                        </tr>
                                    );
                                }
                            )}

                        </tbody>

                    </table>

                </div>
            )}

        </div>
    );
}