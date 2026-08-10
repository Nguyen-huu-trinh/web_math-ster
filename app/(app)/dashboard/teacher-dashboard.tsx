
'use client'
import Image from "next/image";
import { useEffect, useState } from "react";
import {
    useTeacherDashboard,
    useActiveStudentCount,
} from '@/hooks/use-dashboard'
import {
    useAnnouncement,
    useUpdateAnnouncement,
} from "@/hooks/use-announcement";

import { useProcessAttendance } from "@/hooks/use-process-attendance";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";

import { Save } from "lucide-react";

import { toast } from "sonner";


import { useLeaderboard } from '@/hooks/use-leaderboard'

import { StatCard } from '@/components/dashboard/stat-card'
import { CountdownCard } from '@/components/dashboard/countdown-card'
// import { TeacherActivityChart } from '@/components/dashboard/dashboard-charts'
// import { LeaderboardCard } from '@/components/dashboard/leaderboard-card'
// import { NotificationsCard } from '@/components/dashboard/notifications-card'

import dynamic from "next/dynamic";

const TeacherActivityChart = dynamic(
  () =>
    import("@/components/dashboard/dashboard-charts").then(
      (m) => ({
        default: m.TeacherActivityChart,
      })
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] rounded-xl border animate-pulse bg-muted" />
    ),
  }
);

const LeaderboardCard = dynamic(
  () =>
    import("@/components/dashboard/leaderboard-card").then(
      (m) => ({
        default: m.LeaderboardCard,
      })
    ),
  {
    loading: () => (
      <div className="h-72 rounded-xl border animate-pulse bg-muted" />
    ),
  }
);

const NotificationsCard = dynamic(
  () =>
    import("@/components/dashboard/notifications-card").then(
      (m) => ({
        default: m.NotificationsCard,
      })
    ),
  {
    loading: () => (
      <div className="h-72 rounded-xl border animate-pulse bg-muted" />
    ),
  }
);

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
    const announcement =
    useAnnouncement();
    const activeStudentCount =
    useActiveStudentCount()

   

    const updateAnnouncement =
    useUpdateAnnouncement();

    const processAttendance =
    useProcessAttendance();

    const [title, setTitle] = useState("");

    const [attendanceCode, setAttendanceCode] =useState("");

    const [content, setContent] = useState("");

    useEffect(() => {

    if (announcement.data) {

        setTitle(
            announcement.data.title
        );

        setContent(
            announcement.data.content
        );

    }

}, [announcement.data]);


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

const activeStudents =
    activeStudentCount.data
        ?.activeStudents ?? 0

    const stats = [

    {
        label: "Khóa học",
        value: dashboard?.totalCourses ?? 0,
        icon: "book-open",
    },

    {
        label: "Bài học",
        value: dashboard?.totalLessons ?? 0,
        icon: "play-circle",
    },

    {
        label: "Học sinh",
        value: dashboard?.totalStudents ?? 0,
        icon: "users",
    },

    {
        label: "Bài kiểm tra",
        value: dashboard?.totalExams ?? 0,
        icon: "clipboard-list",
    },

]

async function handleProcessAttendance() {
    const code = attendanceCode.trim();

    if (!code) {
        toast.error(
            "Vui lòng nhập mã điểm danh đúng."
        );
        return;
    }

    try {
        const result =
            await processAttendance.mutateAsync(
                code
            );

        toast.success(
            `Đã tạo lượt điểm danh cho ${result.studentCount} học sinh`
        );

        setAttendanceCode("");

    } catch (error) {
        console.error(
            "PROCESS ATTENDANCE ERROR:",
            error
        );

        toast.error(
            error instanceof Error
                ? error.message
                : "Không thể xử lý điểm danh"
        );
    }
}


async function saveAnnouncement() {
     

    if (!announcement.data) return;

    try {

        await updateAnnouncement.mutateAsync({

            ...announcement.data,

            title,

            content,

        });

        toast.success(
            "Đã cập nhật thông báo"
        );

    }

    catch {

        toast.error(
            "Không thể cập nhật"
        );

    }

}

    return (

        <div className="flex flex-col gap-6">

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-24">

    <div className="col-span-2 rounded-xl border bg-card p-6 shadow-sm lg:col-span-14">
        <p className="text-sm text-muted-foreground">

            👋 {greeting()}

        </p>

        <h2 className="mt-2 text-3xl font-bold">

            Giáo viên

        </h2>

        <p className="mt-2 text-muted-foreground">

            Chúc bạn có một ngày giảng dạy hiệu quả!

        </p>

            </div>

           <div className="col-span-1 flex flex-col items-center justify-center rounded-xl border bg-card p-6 shadow-sm lg:col-span-5"> 
                <div className="flex items-center justify-center gap-2">
            
                    <span className="text-4xl font-bold tabular-nums text-primary">
                        {activeStudentCount.isLoading ||
                        activeStudentCount.isError
                            ? "--"
                            : activeStudents+20}
                    </span>
            
                    <Image
                        src="/trau.png"
                        alt="Trâu đang cày"
                        width={52}
                        height={52}
                        className="object-contain"
                    />
            
                </div>
            
                <p className="mt-1 text-xl font-semibold tracking-wide text-foreground">
                    ĐANG CÀY
                </p>
            
            </div>

<div className="col-span-1 rounded-xl border bg-card p-4 text-center shadow-sm lg:col-span-5">
    <div className="text-center">

        <p className="mt-1 text-xl font-semibold tracking-wide text-foreground">
            Điểm danh
        </p>

    </div>

    <div className="mt-3 flex items-center gap-2">

        <Input
            value={attendanceCode}
            onChange={(e) =>
                setAttendanceCode(
                    e.target.value
                )
            }
            placeholder="Mã code"
            maxLength={100}
            disabled={
                processAttendance.isPending
            }
            className="h-9 text-center"
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    void handleProcessAttendance();
                }
            }}
        />

        <Button
            type="button"
            size="sm"
            disabled={
                processAttendance.isPending ||
                !attendanceCode.trim()
            }
            onClick={() =>
                void handleProcessAttendance()
            }
        >
            {processAttendance.isPending
                ? "..."
                : "Lưu"}
        </Button>

    </div>

</div>

        </div>

        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <h3 className="font-semibold text-amber-900">

                    📢 Thông báo học sinh

                </h3>

                <Button
                    size="sm"
                    onClick={saveAnnouncement}
                    disabled={updateAnnouncement.isPending}
                >

                    <Save className="mr-2 h-4 w-4"/>

                    Lưu

                </Button>

            </div>

            <div className="mt-4 space-y-4">

                <Input

                    placeholder="Tiêu đề"

                    value={title}

                    onChange={(e)=>

                        setTitle(e.target.value)

                    }

                />

                <Textarea

                    rows={6}

                    placeholder="Nhập nội dung..."

                    value={content}

                    onChange={(e)=>

                        setContent(e.target.value)

                    }

                />

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

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            <LeaderboardCard
                title="😴 Top làm biếng"
                description="Top lười biếng học nhất"
                entries={leaderboard.data?.lowHomework ?? []}
            />

            <LeaderboardCard
                title="🏆 Top học giỏi"
                description="Top học giỏi nhất"
                entries={leaderboard.data?.excellent ?? []}
            />

            <LeaderboardCard
                title="💪 Top ĐỘ TRÂU"
                description="Top trâu bò"
                entries={leaderboard.data?.dotrau ?? []}
                valueType="points"
            />

            <LeaderboardCard
                title="💰 Thợ săn tiền thưởng"
                description="Top kiếm tiền nhiều nhất lớp"
                entries={leaderboard.data?.rewardMoney ?? []}
                valueType="money"
            />
            </div>

            <div>

    <TeacherActivityChart />

</div>
        </div>

    )

}

