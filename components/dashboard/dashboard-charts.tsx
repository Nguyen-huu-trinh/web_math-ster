"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useStudentProgress } from "@/hooks/use-student-progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface StudentProgressChartProps {
  averageScore?: number;
}

// Tooltip hiển thị khi rê chuột vào điểm trên biểu đồ (làm tròn 2 chữ số thập phân)
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formattedScore =
      data.score !== undefined && data.score !== null && !isNaN(Number(data.score))
        ? Number(data.score).toFixed(2)
        : "0.00";

    return (
      <div className="rounded-xl border border-amber-200/80 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-xs">
        <p className="text-xs font-bold text-slate-800">
          {data.examTitle || data.attempt}
        </p>
        <p className="mt-0.5 text-sm font-black text-amber-600">
          Điểm: {formattedScore}đ
        </p>
      </div>
    );
  }
  return null;
}

export function StudentProgressChart({ averageScore }: StudentProgressChartProps) {
  const {
    data: progress = [],
    isLoading,
    isError,
  } = useStudentProgress();

  // Lấy điểm trung bình từ StatCard truyền xuống và làm tròn chuẩn 2 chữ số thập phân
  const displayAverage =
    averageScore !== undefined && averageScore !== null && !isNaN(Number(averageScore))
      ? Number(averageScore).toFixed(2)
      : "7.20";

  if (isLoading) {
    return (
      <Card className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-[320px] items-center justify-center text-xs font-medium text-slate-400">
          Đang tải dữ liệu biểu đồ...
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-[320px] items-center justify-center text-xs font-medium text-rose-500">
          Không thể tải dữ liệu tiến độ điểm số.
        </div>
      </Card>
    );
  }

  // Dữ liệu hiển thị các lần thi
  const chartData =
    progress.length > 0
      ? progress.map((item) => ({
          attempt: `Lần ${item.attemptNumber}`,
          score: item.score,
          examTitle: item.examTitle,
        }))
      : [];

  return (
    <Card className="rounded-[28px] border border-slate-150/80 bg-white p-6 sm:p-7 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900">
      {/* HEADER & CHÚ THÍCH (LEGEND) */}
      <CardHeader className="p-0 pb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          {/* Tiêu đề góc trái */}
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Tiến Độ Điểm Số Cá Nhân
            </h3>
            <p className="text-xs sm:text-[13px] font-medium text-slate-400">
              Biểu đồ theo dõi qua các kỳ kiểm tra định kỳ (KTĐK)
            </p>
          </div>

          {/* Chú thích góc phải */}
          <div className="flex items-center gap-4 text-xs font-bold sm:justify-end">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="size-2.5 rounded-full bg-amber-500" />
              <span>Điểm của bạn</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="h-0.5 w-3.5 bg-slate-300 dark:bg-slate-700" />
              <span className="font-mono">Điểm TB: {displayAverage}đ</span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* VÙNG VẼ BIỂU ĐỒ */}
      <CardContent className="!p-0">
        {chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-xs font-medium text-slate-400">
            Chưa có bài kiểm tra định kỳ nào được hoàn thành.
          </div>
        ) : (
          <div className="h-[270px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 15,
                  right: 15,
                  left: -20,
                  bottom: 0,
                }}
              >
                <defs>
                  {/* Dải màu Gradient vàng cam chuyển mờ dần xuống đáy */}
                  <linearGradient id="studentScoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.25} />
                    <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.00} />
                  </linearGradient>
                </defs>

                {/* Lưới ngang nhẹ */}
                <CartesianGrid
                  vertical={false}
                  stroke="#F1F5F9"
                  strokeDasharray="0"
                />

                {/* Trục X: Lần 1, Lần 2... */}
                <XAxis
                  dataKey="attempt"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 11.5, fontWeight: 500 }}
                  tickMargin={12}
                />

                {/* Trục Y: Mốc 0, 3, 6, 9, 10 */}
                <YAxis
                  domain={[0, 10]}
                  ticks={[0, 3, 6, 9, 10]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 11.5, fontWeight: 500 }}
                  tickMargin={12}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Đường cong Area màu cam kèm chấm tròn viền nổi */}
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  fill="url(#studentScoreGradient)"
                  dot={{
                    r: 4.5,
                    fill: "#FFFFFF",
                    stroke: "#D97706",
                    strokeWidth: 2.5,
                  }}
                  activeDot={{
                    r: 6.5,
                    fill: "#F59E0B",
                    stroke: "#FFFFFF",
                    strokeWidth: 2.5,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}