"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  LeaderboardStudent,
  RewardMoneyStudent,
  DoTrauStudent,
} from "@/services/dashboard-client.service";

interface LeaderboardCardProps {
  title: string;
  description: string;
  badgeLabel?: string;
  icon?: string;
  entries: LeaderboardStudent[] | RewardMoneyStudent[] | DoTrauStudent[];
  valueType?: "count" | "money" | "points";
  startRank?: number;
  variant?: "default" | "warning";
}

export function LeaderboardCard({
  title,
  description,
  badgeLabel,
  icon,
  entries,
  valueType = "count",
  startRank = 1,
  variant = "default",
}: LeaderboardCardProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const isTeacher = profile?.role?.toUpperCase() === "TEACHER";
  const isWarning = variant === "warning";

  // Nhận diện riêng bảng Top Học Giỏi (bắt đầu từ rank 4)
  const isTopExcellence = startRank > 1 && valueType === "count" && !isWarning;

  const handleStudentClick = (studentId?: string) => {
    if (!isTeacher || !studentId) return;
    router.push(`/students/${studentId}`);
  };

  // 1. Phân loại màu cho số thứ hạng (Rank)
  const renderRankBadge = (rank: number) => {
    if (isWarning) {
      if (rank === 1) return "bg-rose-500 text-white font-black shadow-xs shadow-rose-200";
      if (rank === 2) return "bg-rose-100 text-rose-600 font-extrabold border border-rose-200";
      if (rank === 3) return "bg-amber-100 text-amber-700 font-extrabold border border-amber-200";
      return "bg-slate-100 text-slate-500 font-bold dark:bg-slate-800 dark:text-slate-400";
    }

    if (isTopExcellence) {
      if (rank === 4) return "bg-amber-400 text-slate-950 font-black shadow-xs shadow-amber-200";
      if (rank === 5) return "bg-amber-200 text-amber-900 font-bold border border-amber-300";
      return "bg-amber-100/80 text-amber-800 font-bold border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40";
    }

    if (rank === 1) {
      if (valueType === "money") return "bg-emerald-500 text-white font-black shadow-xs shadow-emerald-200";
      return "bg-amber-400 text-slate-950 font-black shadow-xs shadow-amber-200";
    }
    if (rank === 2) return "bg-slate-200 text-slate-700 font-bold border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    if (rank === 3) return "bg-amber-100 text-amber-700 font-bold border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40";

    return "bg-slate-100 text-slate-500 font-semibold dark:bg-slate-800 dark:text-slate-400";
  };

  // 2. Phân loại màu cho Badge Giá trị (Điểm số / Máu / Tiền thưởng)
  const renderValueBadge = (student: any, rank: number) => {
    let text = "";
    if (valueType === "money") {
      text = `${Number((student as RewardMoneyStudent).reward_money ?? 0).toLocaleString("vi-VN")}đ`;
    } else if (valueType === "points") {
      text = `${Number((student as DoTrauStudent).points ?? 0)} Máu`;
    } else {
      text = Number((student as LeaderboardStudent).count ?? 0).toFixed(2);
    }

    // Bảng Khu Vực Cần Tăng Tốc
    if (isWarning) {
      if (rank <= 2) {
        return (
          <span className="inline-flex min-w-[58px] items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-mono text-xs font-black text-rose-600 shadow-2xs dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
            {text}
          </span>
        );
      }
      if (rank === 3) {
        return (
          <span className="inline-flex min-w-[58px] items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-mono text-xs font-black text-amber-600 shadow-2xs dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400">
            {text}
          </span>
        );
      }
      return (
        <span className="inline-flex min-w-[58px] items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
          {text}
        </span>
      );
    }

    // Bảng Top Học Giỏi (Rank 4+)
    if (isTopExcellence) {
      return (
        <span className="inline-flex min-w-[58px] items-center justify-center rounded-full border border-amber-300/80 bg-amber-50/90 px-3 py-1 font-mono text-xs font-black text-amber-700 shadow-2xs dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
          {text}
        </span>
      );
    }

    // Bảng Tiền thưởng
    if (valueType === "money") {
      return (
        <span className="inline-flex min-w-[76px] items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 font-mono text-xs font-black text-emerald-600 shadow-2xs dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
          {text}
        </span>
      );
    }

    // Bảng Độ trâu (Máu)
    if (rank <= 3) {
      return (
        <span className="inline-flex min-w-[64px] items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 font-mono text-xs font-black text-amber-700 shadow-2xs dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
          {text}
        </span>
      );
    }

    return (
      <span className="inline-flex min-w-[64px] items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 font-mono text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
        {text}
      </span>
    );
  };

  return (
    <Card className="rounded-[28px] border border-slate-150/80 bg-white p-5 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] dark:border-slate-800 dark:bg-slate-900">
      {/* HEADER: Có đường kẻ viền dưới nhẹ, khoảng cách cân đối */}
      <CardHeader className="p-0 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {icon && <span className="text-lg sm:text-xl">{icon}</span>}
              <span>{title}</span>
            </CardTitle>
            <p className="text-xs sm:text-[13px] font-medium leading-none text-slate-400">
              {description}
            </p>
          </div>

          {/* Badge nhãn phụ góc phải */}
          {badgeLabel && (
            <span
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1 text-xs font-extrabold tracking-tight",
                isWarning
                  ? "border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
                  : isTopExcellence
                  ? "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400"
                  : "border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              {badgeLabel}
            </span>
          )}
        </div>
      </CardHeader>

      {/* DANH SÁCH HỌC SINH */}
      <CardContent className="!p-0 !pt-3 space-y-2.5">
        {entries.length === 0 ? (
          <div className="py-7 text-center text-xs font-medium text-slate-400">
            Chưa có học sinh trong danh sách tuần này
          </div>
        ) : (
          entries.map((student, index) => {
            const rank = startRank + index;
            const studentId = student.student_id;

            return (
              <div
                key={studentId || index}
                className="flex items-center justify-between gap-3 rounded-xl px-1.5 py-0.5 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
              >
                {/* Khối bên trái: Thứ hạng + Mã học sinh + Họ tên */}
                <div className="flex min-w-0 items-center gap-3">
                  {/* Badge số thứ tự (26px) */}
                  <div
                    className={cn(
                      "flex size-6.5 shrink-0 items-center justify-center rounded-full text-xs",
                      renderRankBadge(rank)
                    )}
                  >
                    {rank}
                  </div>

                  {/* Mã học sinh */}
                  {student.student_code && (
                    <span className="shrink-0 rounded-md border border-slate-200/70 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {student.student_code}
                    </span>
                  )}

                  {/* Tên học sinh */}
                  <span
                    onClick={() => handleStudentClick(studentId)}
                    title={isTeacher ? "Xem trang cá nhân học sinh" : undefined}
                    className={cn(
                      "truncate text-[14px] sm:text-[14.5px] font-bold tracking-tight text-slate-800 dark:text-slate-100",
                      isTeacher &&
                        "cursor-pointer underline-offset-4 transition-colors hover:text-amber-600 hover:underline"
                    )}
                  >
                    {student.full_name}
                  </span>
                </div>

                {/* Khối bên phải: Badge chỉ số */}
                <div className="shrink-0">
                  {renderValueBadge(student, rank)}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}