'use client'

import { useAuth } from '@/providers/auth-provider'
import { STUDENT_STATS, TEACHER_STATS, LEADERBOARD_OVERALL, LEADERBOARD_LATEST } from '@/lib/mock-data'
import { StatCard } from '@/components/dashboard/stat-card'
import { CountdownCard } from '@/components/dashboard/countdown-card'
import { StudentProgressChart, TeacherActivityChart } from '@/components/dashboard/dashboard-charts'
import { LeaderboardCard } from '@/components/dashboard/leaderboard-card'
import { NotificationsCard } from '@/components/dashboard/notifications-card'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null
  const isTeacher = user.role === 'teacher'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          {user.name}
          {isTeacher ? ' 👋' : ''}
        </h2>
        <p className="mt-1 text-pretty text-muted-foreground">
          {isTeacher
            ? "Here's how your classes are performing this week."
            : "Stay on track — here's your progress toward the 2027 exam."}
        </p>
      </div>

      <CountdownCard />

      {/* Stats */}
      <div
        className={
          isTeacher
            ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
        }
      >
        {(isTeacher ? TEACHER_STATS : STUDENT_STATS).map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      {/* Chart + leaderboard row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isTeacher ? <TeacherActivityChart /> : <StudentProgressChart />}
        </div>
        <LeaderboardCard title="Top 5 Overall" entries={LEADERBOARD_OVERALL} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <LeaderboardCard title="Top 5 · Latest Exam" entries={LEADERBOARD_LATEST} />
        <div className="lg:col-span-2">
          <NotificationsCard />
        </div>
      </div>
    </div>
  )
}
