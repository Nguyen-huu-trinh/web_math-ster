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
import { STUDENT_PROGRESS_CHART, TEACHER_ACTIVITY_CHART } from '@/lib/mock-data'
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
  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Score Progression</CardTitle>
        <CardDescription>Your monthly average score over the school year</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={studentConfig} className="h-[280px] w-full">
          <AreaChart data={STUDENT_PROGRESS_CHART} margin={{ left: -16, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-score)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-score)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis domain={[0, 10]} tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="score"
              type="monotone"
              stroke="var(--color-score)"
              strokeWidth={2.5}
              fill="url(#fillScore)"
              dot={{ r: 3, fill: 'var(--color-score)' }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const teacherConfig = {
  submissions: { label: 'Submissions', color: 'var(--chart-1)' },
  active: { label: 'Active Students', color: 'var(--chart-3)' },
} satisfies ChartConfig

export function TeacherActivityChart() {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Platform Activity</CardTitle>
        <CardDescription>Assignment submissions and active students per month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={teacherConfig} className="h-[280px] w-full">
          <BarChart data={TEACHER_ACTIVITY_CHART} margin={{ left: -16, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="submissions" fill="var(--color-submissions)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="active" fill="var(--color-active)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
