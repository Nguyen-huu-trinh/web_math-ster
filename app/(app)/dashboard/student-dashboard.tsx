'use client'

import { useOnlineCount } from "@/providers/presence-provider";
import { useAnnouncement } from "@/hooks/use-announcement";
import { useAuth } from '@/providers/auth-provider';
import Image from "next/image";
import { useStudentDashboard } from '@/hooks/use-dashboard';
import { useLeaderboard } from '@/hooks/use-leaderboard';
import { TopStudentsCard } from '@/components/dashboard/top-students-card';
import { useQueryClient } from "@tanstack/react-query";
import { StatCardsGrid } from '@/components/dashboard/stat-card';
import { CountdownCard } from '@/components/dashboard/countdown-card';
import { LeaderboardCard } from '@/components/dashboard/leaderboard-card';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Pencil,
  Check,
  X,
  Video,
  CalendarDays,
} from "lucide-react";
import { useSubmitAttendance } from "@/hooks/use-submit-attendance";
import { useUpdateLearningGoal } from "@/hooks/use-update-learning-goal";
import { useStudentExams } from "@/hooks/use-student-exams";
import { StudentScheduleCard } from "@/components/dashboard/student-schedule-card";

const StudentProgressChart = dynamic(
  () =>
    import('@/components/dashboard/dashboard-charts').then(
      (module) => module.StudentProgressChart
    ),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[350px] w-full rounded-2xl" />
    ),
  }
);

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function StudentDashboard() {
  const { profile } = useAuth();
  const studentDashboard = useStudentDashboard();
  const queryClient = useQueryClient();

  const updateLearningGoal = useUpdateLearningGoal();
  const submitAttendance = useSubmitAttendance();

  const [editingGoal, setEditingGoal] = useState(false);
  const [goal, setGoal] = useState("");
  const [attendanceCode, setAttendanceCode] = useState("");
  const [displayPoints, setDisplayPoints] = useState<number | null>(null);
  const onlineCount = useOnlineCount();
  const [showSchedule, setShowSchedule] = useState(false);
  const leaderboard = useLeaderboard();
  const announcement = useAnnouncement();
  const studentExams = useStudentExams();

  const dashboard = studentDashboard.data;
  const learningGoal = dashboard?.profile?.learning_goal ?? "";

  const points =
    displayPoints ??
    dashboard?.profile?.points ??
    profile?.points ??
    100;

  useEffect(() => {
    if (dashboard?.profile?.points !== undefined) {
      setDisplayPoints(dashboard.profile.points);
    }
  }, [dashboard?.profile?.points]);

  useEffect(() => {
    if (dashboard?.profile?.learning_goal !== undefined) {
      setGoal(dashboard.profile.learning_goal ?? "");
    }
  }, [dashboard?.profile?.learning_goal]);

  async function handleSaveAttendance() {
    const code = attendanceCode.trim();

    if (!code) {
      toast.error("Vui lòng nhập mã điểm danh");
      return;
    }

    try {
      const result = await submitAttendance.mutateAsync(code);
      setDisplayPoints(points + Number(result.pointsAdded ?? 10));
      setAttendanceCode("");
      await studentDashboard.refetch();
      toast.success("Điểm danh thành công! +10 điểm.");
    } catch (error) {
      console.error("SUBMIT ATTENDANCE ERROR:", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể điểm danh"
      );
    }
  }

  async function handleSaveGoal() {
    const value = goal.trim();
    try {
      await updateLearningGoal.mutateAsync(value);
      setEditingGoal(false);
      toast.success("Đã cập nhật mục tiêu học tập");
    } catch (error) {
      console.error("UPDATE LEARNING GOAL ERROR:", error);
      toast.error("Không thể cập nhật mục tiêu");
    }
  }

  function handleStartEditGoal() {
    setGoal(learningGoal);
    setEditingGoal(true);
  }

  if (
    studentDashboard.isLoading ||
    leaderboard.isLoading ||
    announcement.isLoading
  ) {
    return (
      <div className="flex justify-center py-20 font-medium text-slate-500">
        Đang tải ...
      </div>
    );
  }

  const periodicNotifications = (studentExams.data ?? []).filter(
    (exam) =>
      exam.category === "PERIODIC" &&
      exam.periodicDaysRemaining !== null
  );

  return (
    <div className="flex flex-col gap-6">
      {/* KHỐI HERO: Lời chào, Đang cày, Điểm danh */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-24">
        {/* KHỐI 1: Lời chào & Mục tiêu */}
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
                  KHÓA 2K9 CHIẾN BINH
                </span>
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {dashboard?.profile?.full_name ?? profile?.full_name}
              </h2>

              <div className="pt-0.5">
                {!editingGoal ? (
                  <button
                    type="button"
                    onClick={handleStartEditGoal}
                    className="group inline-flex items-center gap-2 rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-4 py-1.5 transition-all hover:bg-[#FEF3C7] dark:border-amber-900/50 dark:bg-amber-950/30"
                  >
                    <span className="text-base leading-none">🎯</span>
                    <span className="text-sm text-slate-800 dark:text-slate-200">
                      <strong className="font-extrabold uppercase text-[#9A3412] dark:text-[#FB923C]">
                        {learningGoal || "TRÂU LAI BÒ 2K9"}
                      </strong>
                    </span>
                    <Pencil className="h-3.5 w-3.5 text-amber-700/60 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ) : (
                  <div className="flex max-w-md items-center gap-2">
                    <span className="text-base">🎯</span>
                    <Input
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="Nhập mục tiêu hoặc danh hiệu..."
                      maxLength={200}
                      autoFocus
                      className="h-8.5 rounded-full border-[#FDE68A] bg-white px-3 text-sm font-bold text-slate-900 shadow-2xs focus-visible:ring-2 focus-visible:ring-amber-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void handleSaveGoal();
                        if (e.key === "Escape") {
                          setGoal(learningGoal);
                          setEditingGoal(false);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      disabled={updateLearningGoal.isPending}
                      onClick={() => void handleSaveGoal()}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      disabled={updateLearningGoal.isPending}
                      onClick={() => {
                        setGoal(learningGoal);
                        setEditingGoal(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
              {profile?.link_zoom && (
                <a
                  href={profile.link_zoom}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-blue-200/90 bg-blue-50/80 px-4 py-2 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-100 hover:border-blue-300 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/50"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Zoom</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setShowSchedule(true)}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/80 px-4 py-2 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 hover:border-emerald-300 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Thời khóa biểu</span>
              </button>
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

        {/* KHỐI 3: Độ trâu / Mã điểm danh */}
        <div
          className={`col-span-1 flex flex-col items-center justify-center rounded-xl border p-4 text-center shadow-xs transition-colors lg:col-span-5 ${
            points < 50 ? "border-red-300 bg-red-100" : "bg-card"
          }`}
        >
          <p className="text-base font-semibold tracking-wide text-foreground sm:text-xl">
            Độ trâu
          </p>

          <div className="mt-1">
            <span className="text-2xl font-bold leading-none tabular-nums text-primary sm:text-3xl">
              {points}
            </span>
            <span className="ml-1 text-xs font-semibold text-foreground sm:text-sm">
              máu
            </span>
          </div>

          <div className="mt-3 flex w-full max-w-[200px] items-center justify-center gap-1 sm:gap-2">
            <Input
              value={attendanceCode}
              onChange={(e) => setAttendanceCode(e.target.value)}
              placeholder="Mã điểm danh"
              maxLength={100}
              disabled={submitAttendance.isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSaveAttendance();
              }}
              className="h-8 w-full text-center text-xs sm:h-9 sm:text-sm"
            />
            <Button
              type="button"
              size="sm"
              disabled={submitAttendance.isPending || !attendanceCode.trim()}
              onClick={() => void handleSaveAttendance()}
              className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
            >
              {submitAttendance.isPending ? "..." : "Lưu"}
            </Button>
          </div>
        </div>
      </div>

      {/* THÔNG BÁO VÀ HẠN NỘP BÀI THI */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xl">📢</span>
          <h3 className="font-semibold text-amber-900">
            {announcement.data?.title ?? "Thông báo"}
          </h3>
        </div>

        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-amber-800">
          {announcement.data?.content ?? "Chưa có thông báo."}
        </p>

        {periodicNotifications.length > 0 && (
          <div className="mt-4 pt-4 border-t border-amber-200/80 space-y-2">
            {periodicNotifications.map((exam) => {
              const days = exam.periodicDaysRemaining;
              if (days === null) return null;
              const isOverdue = days < 0;
              const isToday = days === 0;

              return (
                <div
                  key={exam.id}
                  className="flex items-center gap-3 rounded-xl bg-red-100/70 border border-red-200/80 px-3.5 py-2.5 text-sm text-red-950 shadow-xs"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white font-bold text-xs">
                    🚨
                  </span>
                  <div className="flex-1 font-medium leading-snug">
                    Bài thi <strong className="font-bold underline underline-offset-2">{exam.title}</strong>{" "}
                    {isOverdue ? (
                      <span className="font-extrabold text-red-700">
                        đã quá hạn {Math.abs(days)} ngày!
                      </span>
                    ) : isToday ? (
                      <span className="font-extrabold text-red-700 uppercase tracking-wide">
                        sẽ HẾT HẠN trong HÔM NAY!
                      </span>
                    ) : (
                      <span className="font-bold text-red-600">
                        sẽ hết hạn sau {days} ngày
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ĐẾM NGƯỢC NGÀY THI */}
      <CountdownCard />

{/* 4 CARD THỐNG KÊ (STAT CARDS) */}
      <StatCardsGrid
        completedLessons={dashboard?.completedLessons ?? 0}
        totalLessons={dashboard?.totalLessons ?? 0}
        pendingExams={dashboard?.pendingExams ?? 0}
        averageScore={Number(dashboard?.averagePeriodicScore ?? 0)}
        rank={dashboard?.ranking?.rank ?? 1}
        totalStudents={dashboard?.ranking?.totalStudents ?? 1}
        topPercent={dashboard?.ranking?.topPercent}
      />

      {/* TOP 3 HỌC SINH XUẤT SẮC */}
<div id="top-students-section">
        <TopStudentsCard
          entries={leaderboard.data?.excellent ?? []}
          currentStudentScore={Number(dashboard?.averagePeriodicScore ?? 0)}
          currentStudentId={profile?.id}
        />
      </div>

      {/* 4 BẢNG XẾP HẠNG HỌC VIÊN */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 min-[1800px]:grid-cols-4">
        {/* 1. TOP HỌC GIỎI (Bắt đầu từ Rank 4) */}
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

      {/* BIỂU ĐỒ TIẾN ĐỘ ĐIỂM SỐ CÁ NHÂN */}
{/* 2. Gắn id="progress-chart-section" quanh StudentProgressChart */}
      <div id="progress-chart-section">
        <StudentProgressChart
          averageScore={Number(dashboard?.averagePeriodicScore ?? 0)}
        />
      </div>

      {/* POPUP THỜI KHÓA BIỂU */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="sm:max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Thời khóa biểu</DialogTitle>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto pr-1">
            <StudentScheduleCard />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}