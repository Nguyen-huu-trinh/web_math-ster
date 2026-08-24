"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Clock,
  Users,
  Trophy,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useExamAttempts } from "@/hooks/use-exam-attempts";

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
export default function ExamAnswersPage() {

  const params = useParams();

  const examId =
    params.id as string;
const [sortBy, setSortBy] = useState<
  "student_code" | "score_desc" | "score_asc"
>("student_code");

const [statusFilter, setStatusFilter] = useState<
  "all" | "passed" | "failed" | "not_started"
>("all");

  const {
    data: attempts = [],
    isLoading,
    isError,
    error,
  } = useExamAttempts(examId);
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
                      Lần làm
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

                  </TableRow>

                </TableHeader>

                <TableBody>

                    {sortedAttempts.map(
                    (attempt) => (

                    <TableRow
                      key={attempt.student_id}
                      className={
                        attempt.id
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

                        {attempt.id ? (
                          <Badge variant="outline">
                            Lần {attempt.attempt_number}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Chưa làm
                          </Badge>
                        )}

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