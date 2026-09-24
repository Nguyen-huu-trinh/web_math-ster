'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useOnlineCount } from "@/providers/presence-provider";
import { useTeacherDashboard } from '@/hooks/use-dashboard';
import { TeacherScheduleDialog } from "@/components/dashboard/teacher-schedule-dialog";
import { useAnnouncement, useUpdateAnnouncement } from "@/hooks/use-announcement";
import { useExamAlerts, type ExamAlert } from "@/hooks/use-exam-alerts";
import { TopStudentsCard } from '@/components/dashboard/top-students-card';
import { useProcessAttendance } from "@/hooks/use-process-attendance";
import { useCurrentAttendance } from "@/hooks/use-current-attendance";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Bell, Check, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { useLeaderboard } from '@/hooks/use-leaderboard';
import { TeacherStatCardsGrid } from '@/components/dashboard/stat-card';
import { CountdownCard } from '@/components/dashboard/countdown-card';
import { LeaderboardCard } from '@/components/dashboard/leaderboard-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function TeacherDashboard() {
  const router = useRouter();
  const teacherDashboard = useTeacherDashboard();
  const onlineCount = useOnlineCount();
  const [readingAlertId, setReadingAlertId] = useState<string | null>(null);
  const leaderboard = useLeaderboard();
  const announcement = useAnnouncement();
  const queryClient = useQueryClient();
  const updateAnnouncement = useUpdateAnnouncement();
  const processAttendance = useProcessAttendance();
  const currentAttendance = useCurrentAttendance();
  const [showTeacherSchedule, setShowTeacherSchedule] = useState(false);
  const [title, setTitle] = useState("");
  const [attendanceCode, setAttendanceCode] = useState("");
  const [content, setContent] = useState("");
  const examAlertsQuery = useExamAlerts();

  useEffect(() => {
    if (announcement.data) {
      setTitle(announcement.data.title);
      setContent(announcement.data.content);
    }
  }, [announcement.data]);

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

      queryClient.setQueryData<ExamAlert[]>(
        ["teacher", "exam-alerts"],
        (current) => current?.filter((item) => item.id !== alert.id) ?? []
      );
    } catch (error) {
      console.error("READ EXAM ALERT ERROR:", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể đánh dấu cảnh báo đã xem."
      );
    } finally {
      setReadingAlertId(null);
    }
  }

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
        error instanceof Error ? error.message : "Không thể xử lý điểm danh"
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

  if (teacherDashboard.isLoading || leaderboard.isLoading) {
    return (
      <div className="flex justify-center py-20 font-medium text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  const dashboard = teacherDashboard.data;

  return (
    <div className="flex flex-col gap-6">
      {/* KHỐI HERO: Lời chào, Đang cày, Điểm danh */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-24">
        {/* KHỐI 1: Lời chào & Hành động */}
        <div className="col-span-2 rounded-2xl border border-slate-200/75 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-14">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                <span className="flex items-center gap-1.5 text-[#E68A00] dark:text-[#F59E0B]">
                  <span className="text-sm">👋</span>
                  <span>{greeting()}</span>
                </span>
                <span className="text-[#E68A00] dark:text-[#F59E0B]">•</span>
                <span className="text-slate-400 dark:text-slate-500 font-semibold">
                  KHÔNG GIAN GIẢNG DẠY
                </span>
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Giáo Viên
              </h2>

              <p className="text-xs sm:text-sm font-medium text-slate-500">
                Chúc bạn có một ngày đồng hành và hướng dẫn học sinh hiệu quả!
              </p>
            </div>

            {/* Nút Thời khóa biểu + Chuông cảnh báo */}
            <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
              <button
                type="button"
                onClick={() => setShowTeacherSchedule(true)}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/80 px-4 py-2 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 hover:border-emerald-300 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Thời khóa biểu</span>
              </button>

              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="relative h-9 w-9 rounded-full border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                >
                  <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  {(examAlertsQuery.data ?? []).length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                      {(examAlertsQuery.data ?? []).length > 99
                        ? "99+"
                        : (examAlertsQuery.data ?? []).length}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 2: Số người đang cày */}
        <div className="col-span-1 flex flex-col items-center justify-center rounded-xl border bg-card p-4 sm:p-6 shadow-xs lg:col-span-5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold tabular-nums text-primary sm:text-4xl">
              {20 + onlineCount}
            </span>
            <Image
              src="/trau.png"
              alt="Trâu đang cày"
              width={42}
              height={42}
              className="object-contain sm:h-[52px] sm:w-[52px]"
            />
          </div>
          <p className="mt-1 text-base font-semibold tracking-wide text-foreground sm:text-xl">
            ĐANG CÀY
          </p>
        </div>

        {/* KHỐI 3: Điểm danh cho giáo viên */}
        <div className="col-span-1 flex flex-col items-center justify-center rounded-xl border bg-card p-4 text-center shadow-xs lg:col-span-5">
          <p className="text-base font-semibold tracking-wide text-foreground sm:text-xl">
            Điểm danh
          </p>

          <div className="mt-2.5 flex w-full max-w-[200px] items-center justify-center gap-1.5">
            <Input
              value={attendanceCode}
              onChange={(e) => setAttendanceCode(e.target.value)}
              placeholder="Mã code"
              maxLength={100}
              disabled={processAttendance.isPending}
              className="h-8 w-full text-center text-xs sm:h-9 sm:text-sm"
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
              disabled={processAttendance.isPending || !attendanceCode.trim()}
              onClick={() => {
                if (processAttendance.isPending) return;
                void handleProcessAttendance();
              }}
              className="h-8 px-2.5 text-xs sm:h-9 sm:text-sm"
            >
              {processAttendance.isPending ? "..." : "Lưu"}
            </Button>
          </div>

          {currentAttendance.data?.code && (
            <div className="mt-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1 text-center">
              <p className="font-mono text-xs font-bold tracking-widest text-primary">
                {currentAttendance.data.code}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* THÔNG BÁO HỌC SINH */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📢</span>
            <h3 className="font-semibold text-amber-900">Thông báo học sinh</h3>
          </div>
          <Button
            size="sm"
            onClick={saveAnnouncement}
            disabled={updateAnnouncement.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Lưu
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          <Input
            placeholder="Tiêu đề thông báo..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-amber-200 bg-white"
          />
          <Textarea
            rows={4}
            placeholder="Nhập nội dung thông báo gửi toàn bộ học sinh..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-amber-200 bg-white"
          />
        </div>
      </div>

      {/* BẢNG CẢNH BÁO KIỂM TRA */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-rose-500" />
            <h3 className="font-bold text-foreground">Cảnh báo kiểm tra</h3>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              {(examAlertsQuery.data ?? []).length}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 overflow-hidden max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
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
              {examAlertsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Đang tải dữ liệu cảnh báo...
                  </TableCell>
                </TableRow>
              ) : (examAlertsQuery.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Không có cảnh báo kiểm tra nào.
                  </TableCell>
                </TableRow>
              ) : (
                (examAlertsQuery.data ?? []).map((alert) => (
                  <TableRow
                    key={alert.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => {
                      if (!alert.studentId) return;
                      router.push(`/students/${alert.studentId}`);
                    }}
                  >
                    <TableCell className="font-mono text-xs font-bold text-slate-500">
                      {alert.studentCode ?? "--"}
                    </TableCell>
                    <TableCell className="font-bold text-slate-800 dark:text-slate-100 hover:text-amber-600 hover:underline">
                      {alert.studentName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {alert.createdAt ? (() => {
                        const d = new Date(alert.createdAt);
                        const hours = String(d.getHours()).padStart(2, "0");
                        const minutes = String(d.getMinutes()).padStart(2, "0");
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        return `${hours}:${minutes} - ${day}/${month}`;
                      })() : "--"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs font-medium">
                      {alert.examTitle}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          alert.type === "FAILED"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                        }`}
                      >
                        {alert.type === "FAILED" ? "Chưa đạt" : "Quá hạn"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {alert.type === "FAILED" && alert.score != null && `Điểm: ${alert.score}`}
                      {alert.type === "OVERDUE" && alert.overdueDays != null && `Quá ${alert.overdueDays} ngày`}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs font-bold"
                        disabled={readingAlertId === alert.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleReadExamAlert(alert);
                        }}
                      >
                        <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" />
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

      {/* ĐẾM NGƯỢC THI */}
      <CountdownCard />

      {/* 4 CARD THỐNG KÊ (TEACHER STATS) GIAO DIỆN MỚI */}
      <TeacherStatCardsGrid
        totalCourses={dashboard?.totalCourses ?? 0}
        totalLessons={dashboard?.totalLessons ?? 0}
        totalStudents={dashboard?.totalStudents ?? 0}
        totalExams={dashboard?.totalExams ?? 0}
      />

      {/* TOP 3 HỌC SINH XUẤT SẮC */}
      <TopStudentsCard
        entries={leaderboard.data?.excellent ?? []}
      />

      {/* 4 BẢNG XẾP HẠNG HỌC VIÊN */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 min-[1800px]:grid-cols-4">
        {/* 1. TOP HỌC GIỎI */}
        <LeaderboardCard
          title="Top Học Giỏi"
          icon="🏆"
          description="Top học sinh có điểm kiểm tra cao nhất"
          badgeLabel="Tuần Này"
          entries={leaderboard.data?.excellent?.slice(3) ?? []}
          startRank={4}
        />

        {/* 2. KHU VỰC CẦN TĂNG TỐC (Màu đỏ cảnh báo) */}
        <LeaderboardCard
          title="Khu Vực Cần Tăng Tốc"
          icon="⚡"
          description="Nhóm học viên cần bứt phá chỉ tiêu tuần"
          badgeLabel="Đôn đốc"
          variant="warning"
          entries={leaderboard.data?.lowHomework ?? []}
        />

        {/* 3. TOP ĐỘ TRÂU */}
        <LeaderboardCard
          title="Top ĐỘ TRÂU"
          icon="💪"
          description="Bảng xếp hạng độ chăm chỉ cày bài tập"
          badgeLabel="🐂 Trâu Nhất"
          entries={leaderboard.data?.dotrau ?? []}
          valueType="points"
        />

        {/* 4. THỢ SĂN TIỀN THƯỞNG */}
        <LeaderboardCard
          title="Thợ Săn Tiền Thưởng"
          icon="💰"
          description="Học bổng tích luỹ từ điểm 10 định kỳ"
          badgeLabel="Học Bổng"
          entries={leaderboard.data?.rewardMoney ?? []}
          valueType="money"
        />
      </div>

      {/* POPUP THỜI KHÓA BIỂU GIÁO VIÊN */}
      <TeacherScheduleDialog
        open={showTeacherSchedule}
        onOpenChange={setShowTeacherSchedule}
      />
    </div>
  );
}