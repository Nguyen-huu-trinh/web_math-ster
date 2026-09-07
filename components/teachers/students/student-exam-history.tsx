"use client";

import { useState } from "react"; // 1. ĐÃ THÊM: Import useState
import { Trash2, Eye } from "lucide-react";

import { useDeleteStudentAttempt } from "@/hooks/use-delete-student-attempt";
import type { TeacherStudentExam } from "@/services/teacher-student-client.service";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
    studentId: string;
    exams: TeacherStudentExam[];
}

export function StudentExamHistory({ studentId, exams }: Props) {
    // 2. ĐÃ THÊM: State lưu trạng thái lọc (Mặc định chọn "ALL")
    const [filterCategory, setFilterCategory] = useState<
        "ALL" | "PERIODIC" | "ATTENDANCE"
    >("ALL");

    const deleteAttempt = useDeleteStudentAttempt(studentId);

    function handleDelete(attemptId: string) {
        const confirmed = window.confirm(
            "Bạn có chắc muốn xóa hẳn lượt làm này? Hành động này không thể hoàn tác."
        );

        if (!confirmed) return;

        deleteAttempt.mutate(attemptId);
    }

    function formatDate(value: string | null) {
        if (!value) return "--";
        return new Date(value).toLocaleString("vi-VN");
    }

    function formatAttemptDuration(
        startedAt: string | null,
        submittedAt: string | null
    ) {
        if (!startedAt || !submittedAt) return "--";

        const start = new Date(startedAt).getTime();
        const end = new Date(submittedAt).getTime();
        const diff = Math.max(0, end - start);

        const totalMinutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 0) return `${hours} giờ ${minutes} phút`;
        return `${minutes} phút`;
    }

    function formatCategory(category: string) {
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

    type ExamTableRow = {
        exam: TeacherStudentExam;
        attempt: TeacherStudentExam["attempts"][number] | null;
    };

    // 3. ĐÃ THAY ĐỔI: Tạo danh sách tất cả các dòng trước
    const allRows: ExamTableRow[] = exams.flatMap((exam): ExamTableRow[] => {
        if (exam.attempts.length === 0) {
            return [{ exam, attempt: null }];
        }
        return exam.attempts.map((attempt) => ({
            exam,
            attempt,
        }));
    });

    // 4. ĐÃ THÊM: Lọc các dòng hiển thị dựa trên state filterCategory
    const rows = allRows.filter((row) => {
        if (filterCategory === "ALL") return true;
        return row.exam.category === filterCategory;
    });

    return (
        <div className="rounded-xl border bg-card">
            {/* HEADER METADATA & 3 NÚT BỘ LỌC */}
            <div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Bài kiểm tra</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Lịch sử các bài kiểm tra và lượt làm của học sinh.
                    </p>
                </div>

                {/* 5. ĐÃ THÊM: Cụm 3 nút bấm bộ lọc */}
                <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1 self-start sm:self-auto">
                    <Button
                        type="button"
                        variant={filterCategory === "ALL" ? "default" : "ghost"}
                        size="sm"
                        className="h-8 text-xs font-medium"
                        onClick={() => setFilterCategory("ALL")}
                    >
                        Tất cả
                    </Button>
                    <Button
                        type="button"
                        variant={filterCategory === "PERIODIC" ? "default" : "ghost"}
                        size="sm"
                        className="h-8 text-xs font-medium"
                        onClick={() => setFilterCategory("PERIODIC")}
                    >
                        Đề định kỳ
                    </Button>
                    <Button
                        type="button"
                        variant={filterCategory === "ATTENDANCE" ? "default" : "ghost"}
                        size="sm"
                        className="h-8 text-xs font-medium"
                        onClick={() => setFilterCategory("ATTENDANCE")}
                    >
                        Đề điểm danh
                    </Button>
                </div>
            </div>

            {/* EMPTY STATE */}
            {rows.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                    Không có bài kiểm tra phù hợp.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/30">
                            <tr className="text-left">
                                <th className="px-5 py-3 font-medium">Tên đề</th>
                                <th className="px-5 py-3 text-center font-medium">Loại đề</th>
                                <th className="px-5 py-3 text-center font-medium">Trạng thái</th>
                                <th className="px-5 py-3 text-center font-medium">Điểm</th>
                                <th className="px-5 py-3 text-center font-medium">Thời gian làm bài</th>
                                <th className="px-5 py-3 text-center font-medium">Thời điểm nộp bài</th>
                                <th className="w-24 px-3 py-3 text-center font-medium">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {rows.map(({ exam, attempt }) => {
                                let status: "passed" | "failed" | "pending";

                                if (!attempt || !attempt.submittedAt) {
                                    status = "pending";
                                } else if (attempt.isPassed === true) {
                                    status = "passed";
                                } else {
                                    status = "failed";
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
                                        <td className="px-5 py-4">
                                            <div className="min-w-0">
                                                <p className="font-medium">{exam.title}</p>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-center">
                                            <Badge variant="outline">
                                                {formatCategory(exam.category)}
                                            </Badge>
                                        </td>

                                        <td className="px-5 py-4 text-center">
                                            {status === "passed" ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                                    Đạt
                                                </Badge>
                                            ) : status === "failed" ? (
                                                <Badge variant="destructive">
                                                    Chưa đạt
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    Chưa làm
                                                </Badge>
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-center">
                                            <span className="font-medium">
                                                {attempt?.score ?? "--"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-center text-muted-foreground">
                                            {attempt
                                                ? formatAttemptDuration(
                                                      attempt.startedAt,
                                                      attempt.submittedAt
                                                  )
                                                : "--"}
                                        </td>

                                        <td className="px-5 py-4 text-center text-muted-foreground">
                                            {attempt
                                                ? formatDate(attempt.submittedAt)
                                                : "--"}
                                        </td>

                                        <td className="px-3 py-4 text-center">
                                            {attempt ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                                                        onClick={() => {
                                                            const returnUrl =
                                                                window.location.pathname +
                                                                window.location.search;

                                                            window.location.href = `/student-exams/${attempt.id}?review=true&returnUrl=${encodeURIComponent(returnUrl)}`;
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">Xem bài làm</span>
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                        disabled={deleteAttempt.isPending}
                                                        onClick={() => handleDelete(attempt.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Xóa lượt làm</span>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}