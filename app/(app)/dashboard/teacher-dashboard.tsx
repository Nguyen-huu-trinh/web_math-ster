
'use client'

import { useTeacherDashboard } from '@/hooks/use-dashboard'
import { useLeaderboard } from '@/hooks/use-leaderboard'

import { StatCard } from '@/components/dashboard/stat-card'
import { CountdownCard } from '@/components/dashboard/countdown-card'
import { TeacherActivityChart } from '@/components/dashboard/dashboard-charts'
import { LeaderboardCard } from '@/components/dashboard/leaderboard-card'
import { NotificationsCard } from '@/components/dashboard/notifications-card'

function greeting() {

    const h = new Date().getHours()

    if (h < 12) return 'Good morning'

    if (h < 18) return 'Good afternoon'

    return 'Good evening'

}

export default function TeacherDashboard() {

    const teacherDashboard =
        useTeacherDashboard()

    const leaderboard =
        useLeaderboard()

    if (
        teacherDashboard.isLoading ||
        leaderboard.isLoading
    ) {
        return (
            <div className="flex justify-center py-20">
                Loading dashboard...
            </div>
        )
    }

    const dashboard =
        teacherDashboard.data

    const stats = [

        {
            label: "Courses",
            value: dashboard?.totalCourses ?? 0,
            icon: "book-open",
        },

        {
            label: "Lessons",
            value: dashboard?.totalLessons ?? 0,
            icon: "play-circle",
        },

        {
            label: "Students",
            value: dashboard?.totalStudents ?? 0,
            icon: "users",
        },

        {
            label: "Exams",
            value: dashboard?.totalExams ?? 0,
            icon: "clipboard-list",
        },

    ]

    return (

        <div className="flex flex-col gap-6">

            <div>

                <p className="text-sm text-muted-foreground">
                    {greeting()}
                </p>

                <h2 className="text-3xl font-bold">
                    Teacher Dashboard 👋
                </h2>

                <p className="mt-1 text-muted-foreground">
                    Here's how your classes are performing this week.
                </p>

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

                    <TeacherActivityChart />

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

