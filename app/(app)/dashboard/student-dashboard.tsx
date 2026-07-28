
'use client'

import { useAuth } from '@/providers/auth-provider'

import { useStudentDashboard } from '@/hooks/use-dashboard'
import { useLeaderboard } from '@/hooks/use-leaderboard'

import { StatCard } from '@/components/dashboard/stat-card'
import { CountdownCard } from '@/components/dashboard/countdown-card'
import { StudentProgressChart } from '@/components/dashboard/dashboard-charts'
import { LeaderboardCard } from '@/components/dashboard/leaderboard-card'
import { NotificationsCard } from '@/components/dashboard/notifications-card'

function greeting() {
    const h = new Date().getHours()

    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'

    return 'Good evening'
}

export default function StudentDashboard() {

    const { profile } = useAuth()

    const studentDashboard =
        useStudentDashboard()

    const leaderboard =
        useLeaderboard()

    if (
        studentDashboard.isLoading ||
        leaderboard.isLoading
    ) {
        return (
            <div className="flex justify-center py-20">
                Loading dashboard...
            </div>
        )
    }

    const dashboard =
        studentDashboard.data

    const stats = [

        {
            label: "Khóa học",
            value: dashboard?.totalCourses ?? 0,
            icon: "book-open",
        },

        {
            label: "Bài học đã học",
            value: dashboard?.completedLessons ?? 0,
            displayValue: `${studentDashboard.data?.completedLessons ?? 0}/${studentDashboard.data?.totalLessons ?? 0}`,
            icon: "check-circle",
        },

        {
            label: "Bài kiểm tra",
            value: dashboard?.totalExams ?? 0,
            icon: "file-text",
        },

        {
            label: "Điểm trung bình",
            value: Number(
                (dashboard?.averagePeriodicScore ?? 0).toFixed(1)
            ),
            icon: "award",
        },

    ]

    return (

        <div className="flex flex-col gap-6">

            <div>

                <p className="text-sm text-muted-foreground">
                    {greeting()}
                </p>

                <h2 className="text-3xl font-bold">
                    {dashboard?.profile?.full_name ??
                        profile?.full_name}
                </h2>

                <div className="mt-1 flex items-center gap-2">
  <span className="text-muted-foreground">Những bạn học dở nhất:</span>
  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg">
    Võ Thị Như Ý
  </span>
</div>

            </div>

            <CountdownCard />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {stats.map((item, index) => (

                    <StatCard
                        key={item.label}
                        {...item}
                        index={index}
                    />

                ))}

            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                <div className="lg:col-span-2">

                    <StudentProgressChart />

                </div>

                <LeaderboardCard
                    title="Top 5 Overall"
                    entries={
                        leaderboard.data?.overall ?? []
                    }
                />

            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                <LeaderboardCard
                    title="Top 5 · Latest Exam"
                    entries={
                        leaderboard.data?.latest ?? []
                    }
                />

                <div className="lg:col-span-2">

                    <NotificationsCard />

                </div>

            </div>

        </div>

    )
}

