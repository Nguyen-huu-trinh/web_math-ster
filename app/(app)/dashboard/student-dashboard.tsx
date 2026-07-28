
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

                <p className="mt-1 text-muted-foreground">
                    <p className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent font-bold">
                        🔥 Những bạn học dở nhất:
                    </p>
                    <p className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded pl-4 text-2xl">
                        Võ Thị Như Ý (dở nhất)
                    </p>
                     <p className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded pl-4 text-2xl">
                        Thái Khánh Băng (phá nhất)
                    </p>
                    <p className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-bold pl-4">
                        Vũ Tina Diễm
                    </p>
                    <p className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-bold pl-4">
                        Nguyễn Thị Phương Ly
                    </p>
                    <p className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-bold pl-4">
                        Chương Hồng Ân
                    </p>
                    <p className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-bold pl-4">
                        Trần Hải Yến
                    </p>
                    <p className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-bold pl-4">
                        Nguyễn Ngọc Bảo Trân
                    </p>
                    <p className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-bold pl-4">
                        Lương Yến Nhi
                    </p>
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

