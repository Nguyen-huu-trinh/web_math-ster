'use client'
import Image from "next/image";
import { useEffect, useState } from "react";
import {
    useTeacherDashboard,
    useActiveStudentCount,
} from '@/hooks/use-dashboard'
import { TeacherScheduleDialog } from "@/components/dashboard/teacher-schedule-dialog";
import {
    useAnnouncement,
    useUpdateAnnouncement,
} from "@/hooks/use-announcement";

import { TopStudentsCard } from '@/components/dashboard/top-students-card'
import { useProcessAttendance } from "@/hooks/use-process-attendance";
import { useCurrentAttendance } from "@/hooks/use-current-attendance";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Bell, Check, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { StatCard } from '@/components/dashboard/stat-card'
import { CountdownCard } from '@/components/dashboard/countdown-card'
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const LeaderboardCard = dynamic(
  () =>
    import("@/components/dashboard/leaderboard-card").then(
      (m) => ({
        default: m.LeaderboardCard,
      })
    ),
  {
    loading: () => (
      <div className="h-72 rounded-xl border animate-pulse bg-muted" />
    ),
  }
);

const NotificationsCard = dynamic(
  () =>
    import("@/components/dashboard/notifications-card").then(
      (m) => ({
        default: m.NotificationsCard,
      })
    ),
  {
    loading: () => (
      <div className="h-72 rounded-xl border animate-pulse bg-muted" />
    ),
  }
);

function greeting() {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
}

type ExamAlert = {
    id: string;
    type: "FAILED" | "OVERDUE";
    studentId: string;
    studentName: string;
    studentCode: string | null;
    examId: string;
    examTitle: string;
    attemptId: string | null;
    score?: number | null;
    overdueDays?: number;
    createdAt: string;
    enrolledAt?: string | null;
};

export default function TeacherDashboard() {
    const teacherDashboard = useTeacherDashboard();
    const leaderboard = useLeaderboard();
    const announcement = useAnnouncement();
    const activeStudentCount = useActiveStudentCount();

    const updateAnnouncement = useUpdateAnnouncement();
    const processAttendance = useProcessAttendance();
    const currentAttendance = useCurrentAttendance();
const [showTeacherSchedule, setShowTeacherSchedule] =
  useState(false);
    const [title, setTitle] = useState("");
    const [attendanceCode, setAttendanceCode] = useState("");
    const [content, setContent] = useState("");
const [showSchedule, setShowSchedule] = useState(false);
    const [examAlerts, setExamAlerts] = useState<ExamAlert[]>([]);
    const [loadingExamAlerts, setLoadingExamAlerts] = useState(false);
    const [readingAlertId, setReadingAlertId] = useState<string | null>(null);

    useEffect(() => {
        if (announcement.data) {
            setTitle(announcement.data.title);
            setContent(announcement.data.content);
        }
    }, [announcement.data]);

    async function loadExamAlerts() {
        try {
            setLoadingExamAlerts(true);
            const response = await fetch("/api/teachers/exam-alerts", {
                method: "GET",
                cache: "no-store",
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message ?? "Không thể tải cảnh báo.");
            }
            setExamAlerts(data.alerts ?? []);
        } catch (error) {
            console.error("LOAD EXAM ALERTS ERROR:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể tải cảnh báo kiểm tra."
            );
        } finally {
            setLoadingExamAlerts(false);
        }
    }

    useEffect(() => {
        void loadExamAlerts();
    }, []);

    async function handleReadExamAlert(alert: ExamAlert) {
        try {
            setReadingAlertId(alert.id);
            const response = await fetch("/api/teachers/exam-alerts/read", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    studentId: alert.studentId,
                    examId: alert.examId,
                    alertType: alert.type,
                    attemptId: alert.attemptId,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message ?? "Không thể đánh dấu đã xem.");
            }

            setExamAlerts((current) =>
                current.filter((item) => item.id !== alert.id)
            );
        } catch (error) {
            console.error("READ EXAM ALERT ERROR:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể đánh dấu cảnh báo đã xem."
            );
        } finally {
            setReadingAlertId(null);
        }
    }

    if (teacherDashboard.isLoading || leaderboard.isLoading) {
        return (
            <div className="flex justify-center py-20">
                Loading dashboard...
            </div>
        );
    }

    const dashboard = teacherDashboard.data;
    const activeStudents = activeStudentCount.data?.activeStudents ?? 0;

    const stats = [
        {
            label: "Khóa học",
            value: dashboard?.totalCourses ?? 0,
            icon: "book-open",
        },
        {
            label: "Bài học",
            value: dashboard?.totalLessons ?? 0,
            icon: "play-circle",
        },
        {
            label: "Học sinh",
            value: dashboard?.totalStudents ?? 0,
            icon: "users",
        },
        {
            label: "Bài kiểm tra",
            value: dashboard?.totalExams ?? 0,
            icon: "clipboard-list",
        },
    ];

    async function handleProcessAttendance() {
        if (processAttendance.isPending) return;
        const code = attendanceCode.trim();
        if (!code) {
            toast.error("Vui lòng nhập mã điểm danh đúng.");
            return;
        }

        try {
            const result = await processAttendance.mutateAsync(code);
            toast.success(`Đã tạo lượt điểm danh cho ${result.studentCount} học sinh`);
            setAttendanceCode("");
            await currentAttendance.refetch();
        } catch (error) {
            console.error("PROCESS ATTENDANCE ERROR:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể xử lý điểm danh"
            );
        }
    }

    async function saveAnnouncement() {
        if (!announcement.data) return;
        try {
            await updateAnnouncement.mutateAsync({
                ...announcement.data,
                title,
                content,
            });
            toast.success("Đã cập nhật thông báo");
        } catch {
            toast.error("Không thể cập nhật");
        }
    }

    return (
        <div className="flex flex-col gap-6">
<div className="grid grid-cols-2 gap-4 lg:grid-cols-24">
  <div className="relative col-span-2 rounded-xl border bg-card p-6 shadow-sm lg:col-span-14">
    <div className="flex items-start justify-between gap-4">
      {/* Khối lời chào & thông tin giáo viên */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          👋 {greeting()}
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Giáo viên
        </h2>
        <p className="text-sm text-muted-foreground">
          Chúc bạn có một ngày giảng dạy hiệu quả!
        </p>
      </div>

      {/* Khối nút hành động: Thời khóa biểu + Quả chuông thông báo */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowTeacherSchedule(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 hover:shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
          title="Thời khóa biểu"
        >
          <CalendarDays className="h-4 w-4" />
          <span className="hidden sm:inline">Thời khóa biểu</span>
        </button>

        {/* Nút quả chuông có Badge thông báo */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative h-9 w-9 rounded-lg"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {examAlerts.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-sm">
                {examAlerts.length > 99 ? "99+" : examAlerts.length}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  </div>


                <div className="col-span-1 flex flex-col items-center justify-center rounded-xl border bg-card p-6 shadow-sm lg:col-span-5">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-4xl font-bold tabular-nums text-primary">
                            {activeStudentCount.isLoading || activeStudentCount.isError
                                ? "--"
                                : activeStudents + 20}
                        </span>
                        <Image
                            src="/trau.png"
                            alt="Trâu đang cày"
                            width={52}
                            height={52}
                            className="object-contain"
                        />
                    </div>
                    <p className="mt-1 text-xl font-semibold tracking-wide text-foreground">
                        ĐANG CÀY
                    </p>
                </div>

                <div className="col-span-1 rounded-xl border bg-card p-4 text-center shadow-sm lg:col-span-5">
                    <div className="text-center">
                        <p className="mt-1 text-xl font-semibold tracking-wide text-foreground">
                            Điểm danh
                        </p>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                        <Input
                            value={attendanceCode}
                            onChange={(e) => setAttendanceCode(e.target.value)}
                            placeholder="Mã code"
                            maxLength={100}
                            disabled={processAttendance.isPending}
                            className="h-9 text-center"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (processAttendance.isPending) return;
                                    void handleProcessAttendance();
                                }
                            }}
                        />

                        <Button
                            type="button"
                            size="sm"
                            disabled={
                                processAttendance.isPending || !attendanceCode.trim()
                            }
                            onClick={() => {
                                if (processAttendance.isPending) return;
                                void handleProcessAttendance();
                            }}
                        >
                            {processAttendance.isPending ? "..." : "Lưu"}
                        </Button>
                    </div>

                    {currentAttendance.data?.code && (
                        <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-center">
                            <p className="mt-1 font-mono text-sm font-bold tracking-widest text-primary">
                                {currentAttendance.data.code}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-amber-900">
                        📢 Thông báo học sinh
                    </h3>
                    <Button
                        size="sm"
                        onClick={saveAnnouncement}
                        disabled={updateAnnouncement.isPending}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Lưu
                    </Button>
                </div>

                <div className="mt-4 space-y-4">
                    <Input
                        placeholder="Tiêu đề"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Textarea
                        rows={6}
                        placeholder="Nhập nội dung..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
            </div>

            {/* Bảng Cảnh báo kiểm tra */}
            <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-red-500" />
                        <h3 className="font-semibold text-foreground">
                            Cảnh báo kiểm tra
                        </h3>
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400">
                            {examAlerts.length}
                        </span>
                    </div>
                </div>

<div className="rounded-md border max-h-[400px] overflow-y-auto">
    <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
                <TableHead>Mã HS</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Ngày làm bài</TableHead>
                <TableHead>Bài kiểm tra</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Chi tiết</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {loadingExamAlerts ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Đang tải dữ liệu cảnh báo...
                    </TableCell>
                </TableRow>
            ) : examAlerts.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Không có cảnh báo kiểm tra nào.
                    </TableCell>
                </TableRow>
            ) : (
                examAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                        <TableCell className="font-mono text-xs">
                            {alert.studentCode ?? "--"}
                        </TableCell>
                        <TableCell className="font-medium">
                            {alert.studentName}
                        </TableCell>
                        <TableCell className="font-medium">
  {alert.createdAt ? (() => {
    const d = new Date(alert.createdAt);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");

    return `${hours}:${minutes} - ${day}/${month}`;
  })() : "--"}
</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                            {alert.examTitle}
                        </TableCell>
                        <TableCell>
                            <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    alert.type === "FAILED"
                                        ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                                }`}
                            >
                                {alert.type === "FAILED" ? "Chưa đạt" : "Quá hạn"}
                            </span>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-red-600 dark:text-red-400">
                            {alert.type === "FAILED" && alert.score != null && `Điểm: ${alert.score}`}
                            {alert.type === "OVERDUE" && alert.overdueDays != null && `Quá ${alert.overdueDays} ngày`}
                        </TableCell>
                        <TableCell className="text-right">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 px-2.5 text-xs"
                                disabled={readingAlertId === alert.id}
                                onClick={() => void handleReadExamAlert(alert)}
                            >
                                <Check className="mr-1 h-3.5 w-3.5 text-green-600" />
                                {readingAlertId === alert.id ? "Lưu..." : "Đã xem"}
                            </Button>
                        </TableCell>
                    </TableRow>
                ))
            )}
        </TableBody>
    </Table>
</div>
            </div>

            <CountdownCard />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item, index) => (
                    <StatCard key={item.label} {...item} index={index} />
                ))}
            </div>

            <TopStudentsCard entries={leaderboard.data?.excellent ?? []} />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 min-[1800px]:grid-cols-4">
                <LeaderboardCard
                    title="🏆 Top học giỏi"
                    description="Top học giỏi nhất"
                    entries={leaderboard.data?.excellent?.slice(3) ?? []}
                    startRank={4}
                />
                <LeaderboardCard
                    title="😿 Top học dở"
                    description="Top điểm thấp nhất"
                    entries={leaderboard.data?.lowHomework ?? []}
                />
                <LeaderboardCard
                    title="💪 Top ĐỘ TRÂU"
                    description="Top trâu bò"
                    entries={leaderboard.data?.dotrau ?? []}
                    valueType="points"
                />
                <LeaderboardCard
                    title="💰 Thợ săn tiền thưởng"
                    description="Top kiếm tiền nhiều nhất lớp"
                    entries={leaderboard.data?.rewardMoney ?? []}
                    valueType="money"
                />
            </div>

<TeacherScheduleDialog
  open={showTeacherSchedule}
  onOpenChange={setShowTeacherSchedule}
/>


        </div>
    );
}