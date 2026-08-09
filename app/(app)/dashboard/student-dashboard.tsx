
'use client'
import { useAnnouncement } from "@/hooks/use-announcement";
import { useAuth } from '@/providers/auth-provider'
import Image from "next/image";
import { useStudentDashboard, useActiveStudentCount, } from '@/hooks/use-dashboard'
import { useLeaderboard } from '@/hooks/use-leaderboard'


import { StatCard } from '@/components/dashboard/stat-card'
import { CountdownCard } from '@/components/dashboard/countdown-card'
import { LeaderboardCard } from '@/components/dashboard/leaderboard-card'
import { NotificationsCard } from '@/components/dashboard/notifications-card'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    useEffect,
    useState,
} from "react";
import {
    Pencil,
    Check,
    X,
} from "lucide-react";
import {
    useSubmitAttendance,
} from "@/hooks/use-submit-attendance";
import {
    useUpdateLearningGoal,
} from "@/hooks/use-update-learning-goal";


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

    const updateLearningGoal =
    useUpdateLearningGoal();

    const submitAttendance =
    useSubmitAttendance();

    const [editingGoal, setEditingGoal] =
    useState(false);

    const [goal, setGoal] =
        useState("");
    const [attendanceCode, setAttendanceCode] =
    useState("");
    const leaderboard =
        useLeaderboard()
    const announcement =
    useAnnouncement()
    const activeStudentCount =
    useActiveStudentCount()
    

    const dashboard =
        studentDashboard.data


const learningGoal =
    dashboard?.profile?.learning_goal ?? "";

    const points =
    dashboard?.profile?.points ??
    profile?.points ??
    100;

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
useEffect(() => {
    if (
        dashboard?.profile?.learning_goal !==
        undefined
    ) {
        setGoal(
            dashboard.profile.learning_goal ?? ""
        );
    }
}, [
    dashboard?.profile?.learning_goal,
]);

async function handleSaveAttendance() {
    const code = attendanceCode.trim();

    if (!code) {
        toast.error(
            "Vui lòng nhập mã điểm danh"
        );
        return;
    }

    try {
        await submitAttendance.mutateAsync(
            code
        );

        setAttendanceCode("");

        toast.success(
            "Đã lưu mã điểm danh"
        );

    } catch (error) {

        console.error(
            "SUBMIT ATTENDANCE ERROR:",
            error
        );

        toast.error(
            error instanceof Error
                ? error.message
                : "Không thể lưu mã điểm danh"
        );
    }
}


async function handleSaveGoal() {
    const value = goal.trim();

    try {
        await updateLearningGoal.mutateAsync(
            value
        );

        setEditingGoal(false);

        toast.success(
            "Đã cập nhật mục tiêu học tập"
        );

    } catch (error) {

        console.error(
            "UPDATE LEARNING GOAL ERROR:",
            error
        );

        toast.error(
            "Không thể cập nhật mục tiêu"
        );
    }
}

function handleStartEditGoal() {
    setGoal(learningGoal);
    setEditingGoal(true);
}

if (
        studentDashboard.isLoading ||
        leaderboard.isLoading ||
        announcement.isLoading||
        activeStudentCount.isLoading
    ) {
        return (
            <div className="flex justify-center py-20">
                Đang tải ...
            </div>
        )
    }



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

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-24">

               <div className="col-span-2 rounded-xl border bg-card p-6 shadow-sm lg:col-span-14">

                    <p className="text-sm text-muted-foreground">
                        👋 {greeting()}
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                        {dashboard?.profile?.full_name ??
                            profile?.full_name}
                    </h2>

                    <div className="mt-3">
                    {!editingGoal ? (
                        <button
                            type="button"
                            onClick={handleStartEditGoal}
                            className="group flex items-center gap-2 text-left"
                        >
                        <span className="text-base font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                            🎯{" "}
                            {learningGoal ||
                                "Nhấn để đặt mục tiêu học tập"}
                        </span>

                        <Pencil
                            className="
                                h-4 w-4
                                text-muted-foreground
                                opacity-0
                                transition-all
                                group-hover:opacity-100
                            "
                        />
                    </button>
                ) : (
                    <div className="flex max-w-xl items-center gap-2">
                        
                        <span className="text-lg">
                            🎯
                        </span>

                        <Input
                            value={goal}
                            onChange={(e) =>
                                setGoal(e.target.value)
                            }
                            placeholder="Ví dụ: Đạt 9+ môn Toán"
                            maxLength={200}
                            autoFocus
                           className="h-9 text-base font-bold text-blue-700 placeholder:font-normal placeholder:text-muted-foreground"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    void handleSaveGoal();
                                }

                                if (e.key === "Escape") {
                                    setGoal(learningGoal);
                                    setEditingGoal(false);
                                }
                            }}
                        />

                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            disabled={
                                updateLearningGoal.isPending
                            }
                            onClick={() =>
                                void handleSaveGoal()
                            }
                        >
                            <Check className="h-4 w-4 text-green-600" />
                        </Button>

                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            disabled={
                                updateLearningGoal.isPending
                            }
                            onClick={() => {
                                setGoal(learningGoal);
                                setEditingGoal(false);
                            }}
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                )}
            </div>

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
            <p className="mt-1 text-xl font-semibold tracking-wide text-foreground">
                Độ trâu
            </p>

            <div className="mt-1">
                <span className="text-3xl font-bold leading-none tabular-nums text-primary">
                    {points}
                </span>

                <span className="ml-1 text-smfont-semibold text-foreground">
                    máu
                </span>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2">
                <Input
                    value={attendanceCode}
                    onChange={(e) =>
                        setAttendanceCode(e.target.value)
                    }
                    placeholder="Mã điểm danh"
                    maxLength={100}
                    disabled={submitAttendance.isPending}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            void handleSaveAttendance();
                        }
                    }}
                    className="h-9 w-[158px] text-center"
                />

                <Button
                    type="button"
                    size="sm"
                    disabled={
                        submitAttendance.isPending ||
                        !attendanceCode.trim()
                    }
                    onClick={() =>
                        void handleSaveAttendance()
                    }
                >
                    {submitAttendance.isPending
                        ? "..."
                        : "Lưu"}
                </Button>
            </div>
        </div>


            </div>
            
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm">

    <div className="flex items-center gap-2">

        <span className="text-xl">📢</span>

        <h3 className="font-semibold text-amber-900">

            {announcement.data?.title ?? "Thông báo"}

        </h3>

    </div>

    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-amber-800">

        {announcement.data?.content ??
            "Chưa có thông báo."}

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

