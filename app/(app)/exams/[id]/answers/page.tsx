"use client";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Clock,
  Users,
  Trophy,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useExamAttempts } from "@/hooks/use-exam-attempts";
import type { ExamAttemptStudent } from "@/services/exam-attempts-client.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

function formatDate(
  value: string | null
) {
  if (!value) return "—";

  return new Date(value).toLocaleString(
    "vi-VN",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  );
}

function formatClassDate(
  value: string | null
) {
  if (!value) return "—";

  return new Date(
    value
  ).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}
function formatDuration(
  startedAt: string | null,
  submittedAt: string | null
) {
  if (!startedAt || !submittedAt) {
    return "—";
  }

  const started =
    new Date(startedAt).getTime();

  const submitted =
    new Date(submittedAt).getTime();

  const seconds = Math.max(
    0,
    Math.floor(
      (submitted - started) / 1000
    )
  );

  
  const hours = Math.floor(
    seconds / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const remainingSeconds =
    seconds % 60;

  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  }

  if (minutes > 0) {
    return remainingSeconds > 0
      ? `${minutes} phút ${remainingSeconds} giây`
      : `${minutes} phút`;
  }

  return `${remainingSeconds} giây`;
}
function getDurationSeconds(
  startedAt: string | null,
  submittedAt: string | null
) {
  if (!startedAt || !submittedAt) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      (
        new Date(submittedAt).getTime() -
        new Date(startedAt).getTime()
      ) / 1000
    )
  );
}

function isOverdue(
  attempt: ExamAttemptStudent,
  examDurationDays: number | null,
  category: string | null
) {
  if (attempt.id !== null) return false;

  // Chỉ áp dụng cho category cần tính quá hạn
  if (category !== "PERIODIC") return false;

  if (examDurationDays === null || examDurationDays === undefined) {
    return false;
  }

  if (!attempt.class_joined_at) return false;

  const created = new Date(attempt.class_joined_at);
  const now = new Date();

  const createdVN = new Date(
    created.toLocaleDateString("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    })
  );

  const todayVN = new Date(
    now.toLocaleDateString("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    })
  );

  const daysElapsed = Math.floor(
    (todayVN.getTime() - createdVN.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return daysElapsed > examDurationDays;
}
export default function ExamAnswersPage() {

  const params = useParams();

  const examId =
    params.id as string;
const queryClient = useQueryClient();


const [sortBy, setSortBy] = useState<
  "student_code" | "score_desc" | "score_asc"
>("student_code");

const [statusFilter, setStatusFilter] = useState<
  "all" | "passed" | "failed" | "not_started"
>("all");

const [adjustingAttemptId, setAdjustingAttemptId] =
  useState<string | null>(null);

const [deletingAttemptId, setDeletingAttemptId] =
  useState<string | null>(null);

const {
  data: response,
  isLoading,
  isError,
  error,
} = useExamAttempts(examId);

const attempts =
  response?.data ?? [];

const examDurationDays =
  response?.examDurationDays ?? null;

const category = response?.category ?? null;


const examTitle =
  response?.examTitle ??
  "Bài kiểm tra";
const submittedCount = useMemo(
  () =>
    attempts.filter(
      (item) => item.id !== null
    ).length,
  [attempts]
);

const filteredAttempts = useMemo(() => {
  switch (statusFilter) {
    case "passed":
      return attempts.filter(
        (item) =>
          item.id !== null &&
          item.is_passed === true
      );

    case "failed":
      return attempts.filter(
        (item) =>
          item.id !== null &&
          item.is_passed === false
      );

    case "not_started":
      return attempts.filter(
        (item) => item.id === null
      );

    case "all":
    default:
      return attempts;
  }
}, [attempts, statusFilter]);

const sortedAttempts = useMemo(() => {
  const result = [...filteredAttempts];

  if (sortBy === "student_code") {
    return result.sort((a, b) =>
      a.student_code.localeCompare(
        b.student_code,
        "vi"
      )
    );
  }

  if (sortBy === "score_desc") {
    return result.sort(
      (a, b) =>
        Number(b.score ?? -1) -
        Number(a.score ?? -1)
    );
  }

  if (sortBy === "score_asc") {
    return result.sort(
      (a, b) =>
        Number(a.score ?? 999999) -
        Number(b.score ?? 999999)
    );
  }

  return result;
}, [filteredAttempts, sortBy]);

async function adjustPoints(
  studentId: string,
  action: "increase" | "decrease"
) {
  try {
    setAdjustingAttemptId(studentId);

    const response = await fetch(
      `/api/exams/${examId}/points`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          action,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Không thể cập nhật điểm."
      );
    }

    const oldPoints = Number(
      data.oldPoints ?? 0
    );

    const newPoints = Number(
      data.newPoints ?? 0
    );

    const amount = Math.abs(
      Number(data.change ?? 0)
    );

    toast.success(
      action === "increase"
        ? `Đã cộng ${amount} điểm`
        : `Đã trừ ${amount} điểm`,
      {
        description:
          `Điểm: ${oldPoints} → ${newPoints}`,
      }
    );

  } catch (error) {
    console.error(
      "[ADJUST POINTS ERROR]",
      error
    );

    toast.error(
      error instanceof Error
        ? error.message
        : "Không thể cập nhật điểm."
    );

  } finally {
    setAdjustingAttemptId(null);
  }
}


async function deleteAttempt(
  studentId: string,
  attemptId: string
) {
  try {
    setDeletingAttemptId(attemptId);

    const response = await fetch(
      `/api/teachers/students/${studentId}/attempts/${attemptId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          "Không thể xóa lượt làm bài."
      );
    }

    console.log(
      "[DELETE ATTEMPT SUCCESS]",
      data
    );

    await queryClient.invalidateQueries({
      queryKey: [
        "exam-attempts",
        examId,
      ],
    });

    toast.success(
      "Đã xóa lượt làm bài."
    );

  } catch (error) {
    console.error(
      "[DELETE ATTEMPT ERROR]",
      error
    );

    toast.error(
      error instanceof Error
        ? error.message
        : "Không thể xóa lượt làm bài."
    );

  } finally {
    setDeletingAttemptId(null);
  }
}

  if (isLoading) {
    return (
      <div className="p-8">
        Đang tải danh sách bài làm...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-destructive">
        Không thể tải danh sách bài làm.

        <p className="mt-2 text-sm">
          {error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-center gap-3">

        <Link href="/exams">

          <button
            type="button"
            className="
              flex
              size-9
              items-center
              justify-center
              rounded-lg
              border
              hover:bg-accent
            "
          >
            <ArrowLeft className="size-4" />
          </button>

        </Link>

        <div>

          <h1 className="text-3xl font-bold">
            Bài làm học sinh
          </h1>

          <p className="mt-1 text-lg font-semibold text-primary">
              {examTitle}
            </p>

          <p className="mt-1 text-muted-foreground">
            Danh sách học sinh đã nộp bài kiểm tra
          </p>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2">

        <Card>

          <CardContent className="flex items-center gap-3 p-5">

            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>

            <div>

              <p className="text-sm text-muted-foreground">
                Đã nộp bài
              </p>

              <p className="text-2xl font-bold">
                {submittedCount}
              </p>

            </div>

          </CardContent>

        </Card>

        <Card>

          <CardContent className="flex items-center gap-3 p-5">

            <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-600">
              <Trophy className="size-5" />
            </div>

            <div>

              <p className="text-sm text-muted-foreground">
                Điểm cao nhất
              </p>

              <p className="text-2xl font-bold">

            {submittedCount
              ? Math.max(
                  ...attempts
                    .filter(
                      (item) => item.id !== null
                    )
                    .map(
                      (item) =>
                        Number(
                          item.score ?? 0
                        )
                    )
                )
              : 0}

              </p>

            </div>

          </CardContent>

        </Card>

        {/* <Card>

          <CardContent className="flex items-center gap-3 p-5">

            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
              <Clock className="size-5" />
            </div>

            <div>

              <p className="text-sm text-muted-foreground">
                Thời gian trung bình
              </p>

              <p className="text-2xl font-bold">

                {attempts.length
                  ? formatDuration(
                        null,
                        new Date(
                            Date.now() +
                            (
                                attempts.reduce(
                                (sum, item) =>
                                    sum +
                                    getDurationSeconds(
                                    item.started_at,
                                    item.submitted_at
                                    ),
                                0
                                ) /
                                attempts.length
                            ) *
                                1000
                        ).toISOString()
                        )
                  : "—"}

              </p>

            </div>

          </CardContent>

        </Card> */}

      </div>

      {/* TABLE */}

      <Card>
<CardHeader>

  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

  <CardTitle>
    Danh sách bài làm
  </CardTitle>

  <div className="flex flex-wrap items-center gap-2">

    {/* BỘ LỌC TRẠNG THÁI */}
    <select
      value={statusFilter}
      onChange={(e) =>
        setStatusFilter(
          e.target.value as
            | "all"
            | "passed"
            | "failed"
            | "not_started"
        )
      }
      className="
        h-9
        rounded-md
        border
        bg-background
        px-3
        text-sm
        outline-none
        focus:ring-2
        focus:ring-primary/30
      "
    >
      <option value="all">
        Tất cả
      </option>

      <option value="passed">
        Đạt
      </option>

      <option value="failed">
        Chưa đạt
      </option>

      <option value="not_started">
        Chưa làm
      </option>
    </select>

    {/* SẮP XẾP */}
    <select
      value={sortBy}
      onChange={(e) =>
        setSortBy(
          e.target.value as
            | "student_code"
            | "score_desc"
            | "score_asc"
        )
      }
      className="
        h-9
        rounded-md
        border
        bg-background
        px-3
        text-sm
        outline-none
        focus:ring-2
        focus:ring-primary/30
      "
    >
      <option value="student_code">
        Mã học sinh
      </option>

      <option value="score_desc">
        Điểm cao → thấp
      </option>

      <option value="score_asc">
        Điểm thấp → cao
      </option>
    </select>

  </div>

</div>

</CardHeader>

        <CardContent>

          {sortedAttempts.length === 0 ? (

            <div className="py-12 text-center">

              <Users className="mx-auto size-10 text-muted-foreground/40" />

              <p className="mt-3 font-medium">
                Chưa có học sinh nào nộp bài
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Danh sách sẽ xuất hiện khi học sinh hoàn thành bài kiểm tra.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <Table>

                <TableHeader>

                  <TableRow>

                    <TableHead>
                      Mã học sinh
                    </TableHead>

                    <TableHead>
                      Họ tên
                    </TableHead>


                    <TableHead>
                      Điểm
                    </TableHead>

                    <TableHead>
                      Trạng thái
                    </TableHead>

                    <TableHead>
                      Thời điểm nộp
                    </TableHead>

                    <TableHead>
                      Thời gian làm
                    </TableHead>

                    <TableHead>
                      Vào lớp
                    </TableHead>                    

                  </TableRow>

                </TableHeader>

                <TableBody>

                    {sortedAttempts.map(
                    (attempt) => (

                    <TableRow
                      key={attempt.student_id}
                      className={
                        isOverdue(
                          attempt,
                          examDurationDays,
                          category
                        )
                          ? "bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30"
                          : attempt.id
                            ? "cursor-pointer hover:bg-accent/50"
                            : ""
                      }
                      onClick={() => {
                        if (!attempt.id) {
                          return;
                        }

                        window.location.href =
                          `/student-exams/${attempt.id}?review=true`;
                      }}
                    >

                        <TableCell>

                          <span className="font-mono font-semibold text-primary">
                            {attempt.student_code}
                          </span>

                        </TableCell>

                        <TableCell>

                          <span className="font-medium">
                            {attempt.full_name}
                          </span>

                        </TableCell>

                        <TableCell>

                          <span className="font-bold">
                            {attempt.score ??
                              "—"}
                          </span>

                        </TableCell>

                        <TableCell>

                          {attempt.is_passed === true ? (

                            <Badge className="gap-1">

                              <CheckCircle2 className="size-3" />

                              Đạt

                            </Badge>

                          ) : attempt.is_passed === false ? (

                            <Badge
                              variant="destructive"
                              className="gap-1"
                            >

                              <XCircle className="size-3" />

                              Chưa đạt

                            </Badge>

                          ) : (

                            <Badge variant="secondary">
                              —
                            </Badge>

                          )}

                        </TableCell>

                        <TableCell>

                          {formatDate(
                            attempt.submitted_at
                          )}

                        </TableCell>

                        <TableCell>

                          <span className="flex items-center gap-1 text-muted-foreground">

                            <Clock className="size-3.5" />

                            {formatDuration(
                            attempt.started_at,
                            attempt.submitted_at
                            )}

                          </span>

                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatClassDate(
                              attempt.class_joined_at
                            )}
                          </span>
                        </TableCell>                        
                        <TableCell>
                          <div className="flex justify-end gap-1">

                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            disabled={
                              adjustingAttemptId === attempt.student_id
                            }
                            onClick={(e) => {
                              e.stopPropagation();

                              adjustPoints(
                                attempt.student_id,
                                "increase"
                              );
                            }}
                          >
                            <Plus className="size-3" />
                          </Button>

                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            disabled={
                              adjustingAttemptId === attempt.student_id
                            }
                            onClick={(e) => {
                              e.stopPropagation();

                              adjustPoints(
                                attempt.student_id,
                                "decrease"
                              );
                            }}
                          >
                            <Minus className="size-3" />
                          </Button>

                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            disabled={
                              !attempt.id ||
                              deletingAttemptId === attempt.id
                            }
                            onClick={(e) => {
                              e.stopPropagation();

                              if (!attempt.id) {
                                return;
                              }

                              deleteAttempt(
                                attempt.student_id,
                                attempt.id
                              );
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>

                          </div>
                        </TableCell>

                      </TableRow>

                    )
                  )}

                </TableBody>

              </Table>

            </div>

          )}

        </CardContent>

      </Card>

    </div>
  );
}