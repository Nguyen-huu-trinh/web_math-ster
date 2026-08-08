
'use client'

import { useAuth } from '@/providers/auth-provider'

import { useStudentDashboard } from '@/hooks/use-dashboard'
import { useLeaderboard } from '@/hooks/use-leaderboard'

import { StatCard } from '@/components/dashboard/stat-card'
import { CountdownCard } from '@/components/dashboard/countdown-card'
import { LeaderboardCard } from '@/components/dashboard/leaderboard-card'
import { NotificationsCard } from '@/components/dashboard/notifications-card'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'

const StudentProgressChart = dynamic(
  () =>
    import('@/components/dashboard/dashboard-charts').then(
      (module) => module.StudentProgressChart
    ),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[350px] w-full rounded-xl" />
    ),
  }
)

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
                Đang tải ...
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
            label:"Bài kiểm tra chưa làm",

            value:dashboard?.pendingExams ?? 0,

            icon:"file-warning",
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

            {/* <div>

                <p className="text-sm text-muted-foreground">
                    {greeting()}
                </p>

                <h2 className="text-3xl font-bold">
                    {dashboard?.profile?.full_name ??
                        profile?.full_name}
                </h2>

                <div className="mt-4 rounded-xl border-2 border-orange-400 bg-orange-50 px-4 py-3 text-orange-800 font-medium shadow-md">
                    BÀI TẬP ĐIỂM DANH TRÊN WEB ĐÃ CÓ FILE, CHƯA CÓ LINK ĐIỀN NHƯ TRƯỚC CÁC EM VÀO MỞ FILE LÀM NHA<br />
                    Hằng tuần vào cuối tuần sẽ có bữa học BẮT BUỘC PHẢI VÀO để hỏi và trả lời<br />
                    ⏰ 21h ngày 3/8 — Học logarit, mũ, lượng giác, csc, csn <br />
                    ⏰ 20h ngày 4/8 - Chữa bài tập min max quãng đường thời gian <br />

                </div>
{/* 
                <p className="mt-1 text-muted-foreground">
                    <p className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent font-bold">
                        🔥 Những bạn học dở nhất:
                    </p>
                    <p className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-bold pl-4">
                        Võ Thị Như Ý (dở nhất)
                    </p>
                    <p className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-bold pl-4">
                        Thái Khánh Băng (phá nhất)
                    </p>
                    <p className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-bold pl-4">
                        Vũ Tina Diễm
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
                </p> */}

            {/* </div> */} 

                <div className="grid gap-4 lg:grid-cols-[1fr_220px]">

                <div className="rounded-xl border bg-card p-6 shadow-sm">

                    <p className="text-sm text-muted-foreground">
                        👋 {greeting()}
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                        {dashboard?.profile?.full_name ??
                            profile?.full_name}
                    </h2>

                    <p className="mt-2 text-muted-foreground">
                        Chúc bạn có một ngày học tập hiệu quả!
                    </p>

                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-center">

                <p className="text-sm font-medium text-muted-foreground">
                    👨‍🎓 Đang học
                </p>

                <div className="mt-3 flex items-end gap-2">

                    <span className="text-4xl font-bold text-primary">
                        --
                    </span>

                    <span className="pb-1 text-sm text-muted-foreground">
                        học sinh
                    </span>

                </div>

            </div>
            </div>
            
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm">

                <div className="flex items-center gap-2">

                    <span className="text-xl">📢</span>

                    <h3 className="font-semibold text-amber-900">
                        Thông báo 
                    </h3>

                </div>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-amber-800">

                    BÀI TẬP ĐIỂM DANH TRÊN WEB ĐÃ CÓ FILE, CHƯA CÓ LINK ĐIỀN NHƯ TRƯỚC CÁC EM VÀO MỞ FILE LÀM NHA<br />
                    Hằng tuần vào cuối tuần sẽ có bữa học BẮT BUỘC PHẢI VÀO để hỏi và trả lời<br />
                    ⏰ 21h ngày 3/8 — Học logarit, mũ, lượng giác, csc, csn <br />
                    ⏰ 20h ngày 4/8 - Chữa bài tập min max quãng đường thời gian <br />

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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 min-[1800px]:grid-cols-4">

            <LeaderboardCard
                title="😴 Cần cố gắng"
                description="Top 5 học sinh hoàn thành ít bài học nhất"
                entries={leaderboard.data?.lazy ?? []}
            />

            <LeaderboardCard
                title="📉 Làm bài ít"
                description="Top 5 học sinh làm ít bài tập nhất"
                entries={leaderboard.data?.lowHomework ?? []}
            />

            <LeaderboardCard
                title="🔥 Chăm học"
                description="Top 5 học sinh tích cực học tập nhất"
                entries={leaderboard.data?.hardworking ?? []}
            />

            <LeaderboardCard
                title="🏆 Học giỏi"
                description="Top 5 học sinh có điểm trung bình cao nhất"
                entries={leaderboard.data?.excellent ?? []}
            />

        </div>     

            <div>

        <StudentProgressChart />

    </div>      

     </div>
    )
}

