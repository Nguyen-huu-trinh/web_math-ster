"use client";
import { toast } from "sonner";
import "./answers.css";
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

const passedCount = attempts.filter((item) => item.id !== null && item.is_passed === true).length;
const failedCount = attempts.filter((item) => item.id !== null && item.is_passed === false).length;
const notSubmittedCount = attempts.length - submittedCount;
const passedPercentage = submittedCount ? Math.round(passedCount / submittedCount * 100) : 0;
const highestScore = submittedCount
  ? Math.max(...attempts.filter((item) => item.id !== null).map((item) => Number(item.score ?? 0)))
  : 0;

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
        Đang tải bài làm…
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
    <div className="exam-answers space-y-7">
      <div className="flex items-center gap-4">
        <Link href="/exams" aria-label="Quay lại quản lý đề thi" className="flex size-12 shrink-0 items-center justify-center rounded-[20px] border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <Badge className="mb-1.5 rounded-lg border-amber-200 bg-amber-50 px-2.5 py-1 font-bold text-amber-700">
            {category === "PERIODIC" ? "Định kỳ (KTĐK)" : category === "ATTENDANCE" ? "Điểm danh (BTDD)" : "Bài kiểm tra"}
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Bài Làm Học Sinh: {examTitle}</h1>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="answers-summary">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="summary-icon border-slate-900 bg-slate-900 text-amber-400"><Users className="size-6" /></div>
            <div>
              <p className="summary-label">Đã nộp bài</p>
              <p className="summary-value text-slate-900">{submittedCount} <span className="text-sm font-bold text-slate-400">/ {attempts.length} HS</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="answers-summary">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="summary-icon border-emerald-200 bg-emerald-50 text-emerald-600"><CheckCircle2 className="size-6" /></div>
            <div>
              <p className="summary-label">Đạt chuẩn</p>
              <p className="summary-value text-emerald-700">{passedCount} <span className="text-base font-bold text-emerald-600">({passedPercentage}%)</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="answers-summary">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="summary-icon border-amber-200 bg-amber-50 text-amber-600"><Trophy className="size-6" /></div>
            <div>
              <p className="summary-label">Điểm cao nhất</p>
              <p className="summary-value text-slate-900">{highestScore.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="answers-summary">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="summary-icon border-rose-200 bg-rose-50 text-rose-500"><Clock className="size-6" /></div>
            <div>
              <p className="summary-label">Chưa nộp bài</p>
              <p className="summary-value text-rose-600">{notSubmittedCount} <span className="text-sm font-bold text-rose-500">cần đôn đốc</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="answers-table gap-0 rounded-[30px] bg-white py-0 shadow-none">
        <CardHeader className="px-5 py-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Lọc trạng thái bài làm">
              {([
                { value: "all", label: `Tất cả (${attempts.length})` },
                { value: "passed", label: `Đạt (${passedCount})` },
                { value: "failed", label: `Chưa đạt (${failedCount})` },
                { value: "not_started", label: `Chưa nộp (${notSubmittedCount})` },
              ] as const).map((filter) => (
                <button key={filter.value} type="button" data-filter={filter.value} aria-pressed={statusFilter === filter.value} onClick={() => setStatusFilter(filter.value)} className="answers-filter rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors">
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
        Sắp xếp: Mã học sinh
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

        <CardContent className="p-0">

          {sortedAttempts.length === 0 ? (

            <div className="py-12 text-center">

              <Users className="mx-auto size-10 text-muted-foreground/40" />

              <p className="mt-3 font-medium">
                Không có học sinh phù hợp với bộ lọc
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Hãy chọn trạng thái khác để xem danh sách bài làm.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <Table className="min-w-[1100px]">

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
                      Thời điểm nộp
                    </TableHead>

                    <TableHead>
                      Thời gian làm
                    </TableHead>

                    <TableHead>
                      Trạng thái
                    </TableHead>

                    <TableHead>
                      Vào lớp
                    </TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>

                  </TableRow>

                </TableHeader>

                <TableBody>

                    {sortedAttempts.map(
                    (attempt) => (

                    <TableRow
                      key={attempt.student_id}
                      data-submitted={attempt.id !== null}
                      data-overdue={isOverdue(attempt, examDurationDays, category)}
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

                          <span className="student-code">
                            {attempt.student_code}
                          </span>

                        </TableCell>

                        <TableCell>

                          <span className="font-extrabold">
                            {attempt.full_name}
                          </span>

                        </TableCell>

                        <TableCell>

                          <span className={attempt.is_passed ? "text-lg font-extrabold text-emerald-700" : "text-lg font-extrabold"}>
                            {attempt.score ??
                              "—"}
                          </span>

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

                          {attempt.is_passed === true ? (

                            <Badge className="gap-1 rounded-lg border-emerald-200 bg-emerald-50 px-2.5 py-1 font-extrabold text-emerald-700">

                              <CheckCircle2 className="size-3" />

                              Đạt

                            </Badge>

                          ) : attempt.is_passed === false ? (

                            <Badge
                              variant="destructive"
                              className="gap-1 rounded-lg border-rose-200 bg-rose-50 px-2.5 py-1 font-extrabold text-rose-700"
                            >

                              <XCircle className="size-3" />

                              Chưa đạt

                            </Badge>

                          ) : (

                            <Badge variant="secondary" className="rounded-lg border-transparent bg-slate-100 px-2.5 py-1 font-bold text-slate-500">
                              {attempt.id === null ? "Chưa nộp" : "—"}
                            </Badge>

                          )}

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
                            className="size-9 rounded-xl border-slate-200 bg-white p-0 text-slate-700 shadow-none hover:bg-slate-100"
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
                            className="size-9 rounded-xl border-slate-200 bg-white p-0 text-slate-700 shadow-none hover:bg-slate-100"
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
                            variant="outline"
                            className="size-9 rounded-xl border-rose-200 bg-white text-rose-500 shadow-none hover:bg-rose-50 hover:text-rose-600"
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
