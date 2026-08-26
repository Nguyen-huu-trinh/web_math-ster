'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import {
  TEACHER_ACTIVITY_CHART,
} from "@/lib/mock-data";

import { useStudentProgress } from "@/hooks/use-student-progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'

const studentConfig = {
  score: { label: 'Avg Score', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function StudentProgressChart() {
  const {
    data: progress = [],
    isLoading,
    isError,
  } = useStudentProgress();

  if (isLoading) {
    return (
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>
            Tiến bộ điểm số
          </CardTitle>

          <CardDescription>
            Điểm các bài kiểm tra định kỳ
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            Đang tải dữ liệu...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>
            Tiến bộ điểm số
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex h-[280px] items-center justify-center text-sm text-destructive">
            Không thể tải dữ liệu điểm.
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = progress.map(
    (item) => ({
      attempt: `Lần ${item.attemptNumber}`,
      score: item.score,
      examTitle: item.examTitle,
    })
  );

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>
          Tiến bộ điểm số
        </CardTitle>

        <CardDescription>
          Điểm các bài kiểm tra định kỳ
        </CardDescription>
      </CardHeader>

      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            Chưa có bài kiểm tra định kỳ.
          </div>
        ) : (
          <ChartContainer
            config={studentConfig}
            className="h-[280px] w-full"
          >
            <AreaChart
              data={chartData}
              margin={{
                left: -16,
                right: 8,
                top: 8,
              }}
            >
              <defs>
                <linearGradient
                  id="fillScore"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-score)"
                    stopOpacity={0.35}
                  />

                  <stop
                    offset="95%"
                    stopColor="var(--color-score)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="attempt"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />

              <YAxis
                domain={[0, 10]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(
                      value,
                      payload
                    ) => {
                      const item =
                        payload?.[0]
                          ?.payload;

                      return (
                        item?.examTitle ??
                        value
                      );
                    }}
                  />
                }
              />

              <Area
                dataKey="score"
                type="monotone"
                stroke="var(--color-score)"
                strokeWidth={2.5}
                fill="url(#fillScore)"
                dot={{
                  r: 3,
                  fill: "var(--color-score)",
                }}
                activeDot={{
                  r: 5,
                }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

