'use client'

import Link from 'next/link'
import { ChevronRight, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCourseDetail } from "@/hooks/use-course-detail"
import type { Course } from '@/types/course'

interface Props {
  course: Course
  isActive?: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

// Bảng màu viền và gradient tiến độ sắc nét, rõ ràng
const THEME_STYLES: Record<string, {
  borderActive: string
  backgroundActive: string
  badgeBg: string
  badgeText: string
  barGradient: string
  percentText: string
  arrowActive: string
  subText: string
}> = {
  S: {
    backgroundActive: "bg-gradient-to-r from-white to-rose-100",
    borderActive: "border-[2px] border-rose-500 shadow-sm shadow-rose-500/10",
    badgeBg: "bg-rose-50 border-rose-200",
    badgeText: "text-rose-600",
    barGradient: "bg-gradient-to-r from-rose-500 to-amber-500",
    percentText: "text-rose-600",
    arrowActive: "text-rose-600",
    subText: "Đang học",
  },
  T: {
    backgroundActive: "bg-gradient-to-r from-white to-blue-100",
    borderActive: "border-[2px] border-blue-500 shadow-sm shadow-blue-500/10",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-600",
    barGradient: "bg-blue-500",
    percentText: "text-slate-400",
    arrowActive: "text-blue-600",
    subText: "Luyện dạng",
  },
  E: {
    backgroundActive: "bg-gradient-to-r from-white to-emerald-100",
    borderActive: "border-[2px] border-emerald-500 shadow-sm shadow-emerald-500/10",
    badgeBg: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-600",
    barGradient: "bg-emerald-500",
    percentText: "text-slate-400",
    arrowActive: "text-emerald-600",
    subText: "Chuẩn cấu trúc",
  },
  R: {
    backgroundActive: "bg-gradient-to-r from-white to-pink-100",
    borderActive: "border-[2px] border-pink-500 shadow-sm shadow-pink-500/10",
    badgeBg: "bg-pink-50 border-pink-200",
    badgeText: "text-pink-600",
    barGradient: "bg-gradient-to-r from-pink-500 to-rose-500",
    percentText: "text-slate-500",
    arrowActive: "text-pink-600",
    subText: "Cấp tốc",
  },
  V: {
    backgroundActive: "bg-gradient-to-r from-white to-purple-100",
    borderActive: "border-[2px] border-purple-500 shadow-sm shadow-purple-500/10",
    badgeBg: "bg-purple-50 border-purple-200",
    badgeText: "text-purple-600",
    barGradient: "bg-purple-500",
    percentText: "text-slate-500",
    arrowActive: "text-purple-600",
    subText: "Tư duy định lượng",
  },
}

function getCourseBadgeLetter(name: string): string {
  const cleanName = name.trim()
  const matchKhoa = cleanName.match(/^kh[oó]a\s+([a-zA-Z0-9])/i)
  if (matchKhoa?.[1]) {
    return matchKhoa[1].toUpperCase()
  }
  const firstWord = cleanName.split(/[\s-]+/)[0]
  if (firstWord && firstWord.length <= 4) {
    return firstWord.toUpperCase()
  }
  return cleanName.charAt(0).toUpperCase() || "C"
}

export function CourseCard({
  course,
  isActive = false,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  const { profile } = useAuth()
  const role = profile?.role

  // LẤY DỮ LIỆU TIẾN ĐỘ THỰC TẾ ĐỒNG BỘ TỪ HOOK useCourseDetail
  const { course: detailCourse } = useCourseDetail(
    course.id,
    profile?.id
  )

  const chapters = detailCourse?.chapters ?? []
  const allLessons = chapters.flatMap((chapter: any) => chapter.lessons ?? [])

  // Số lượng bài thực tế
  const totalLessons =
    detailCourse?.totalLessons ?? allLessons.length ?? course.totalLessons ?? 0

  // Số lượng bài đã hoàn thành
  const completedLessons = allLessons.filter(
    (lesson: any) => lesson.progress?.completed ?? lesson.completed ?? false
  ).length

  // Tỉ lệ phần trăm
  const progressPercent =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : (detailCourse?.progress ?? course.progress ?? 0)

  const badgeLetter = getCourseBadgeLetter(course.name)
  const theme = THEME_STYLES[badgeLetter] || {
    backgroundActive: "bg-gradient-to-r from-white to-amber-100",
    borderActive: "border-[2px] border-amber-500 shadow-sm shadow-amber-500/10",
    badgeBg: "bg-slate-50 border-slate-200",
    badgeText: "text-slate-700",
    barGradient: "bg-amber-500",
    percentText: "text-slate-500",
    arrowActive: "text-amber-500",
    subText: "Khóa học",
  }

  const cardContent = (
    <div
      onClick={onSelect}
      className={`group relative flex flex-col justify-between rounded-[22px] p-4 transition-all duration-200 cursor-pointer ${
        isActive
          ? `${theme.borderActive} ${theme.backgroundActive}`
          : "border-[1.5px] border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      {/* Hàng 1: Icon chữ cái + Tên khóa học + Mũi tên */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Badge Icon bo góc tròn mềm chuẩn mẫu */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-[15px] font-black ${theme.badgeBg} ${theme.badgeText}`}
          >
            {badgeLetter}
          </div>

          <div className="flex flex-col min-w-0">
            <h3 className="truncate text-[14px] font-black uppercase tracking-tight text-slate-800">
              {course.name}
            </h3>
            <p className="text-[11.5px] font-medium text-slate-400">
              {totalLessons > 0
                ? `${totalLessons} bài học • ${theme.subText}`
                : "Chưa có bài học"}
            </p>
          </div>
        </div>

        {/* Nút tác vụ cho Giáo viên hoặc Mũi tên cho Học sinh */}
        <div className="shrink-0 pr-0.5">
          {role === "TEACHER" ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.()
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.()
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <ChevronRight
              className={`size-4.5 stroke-[2.5] transition-colors ${
                isActive ? theme.arrowActive : "text-slate-300 group-hover:text-slate-500"
              }`}
            />
          )}
        </div>
      </div>

      {/* Hàng 2: Thanh tiến trình đồng bộ dữ liệu chuẩn mẫu số 2 */}
      {role !== "TEACHER" && (
        <div className="mt-3.5 space-y-1.5 px-0.5">
          {/* Thanh progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${theme.barGradient}`}
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>

          {/* Dòng số bài và % hoàn thành */}
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-400 font-medium">
              {progressPercent > 0
                ? `Tiến độ: ${completedLessons}/${totalLessons} bài`
                : "Chưa bắt đầu"}
            </span>
            <span
              className={
                progressPercent > 0 ? theme.percentText : "text-slate-300 font-semibold"
              }
            >
              {progressPercent}%
            </span>
          </div>
        </div>
      )}
    </div>
  )

  if (!onSelect) {
    return (
      <Link href={`/courses/${course.id}`} className="block w-full">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
