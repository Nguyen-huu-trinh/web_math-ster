'use client'

import Link from 'next/link'
import { ArrowRight, Pencil, Trash2, MoreHorizontal } from 'lucide-react'

import { useAuth } from '@/providers/auth-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Course } from '@/types/course'

interface Props {
  course: Course
  isActive?: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const THEME_STYLES: Record<string, { card: string; activeCard: string; badge: string; text: string }> = {
  S: {
    card: "border-red-200 bg-red-50/40 hover:bg-red-50 hover:border-red-300 dark:bg-red-950/20 dark:border-red-900",
    activeCard: "border-red-500 bg-red-100/70 shadow-sm ring-1 ring-red-400 dark:bg-red-950/50 dark:border-red-500",
    badge: "border-red-400 text-red-600 bg-white dark:bg-zinc-900",
    text: "text-red-700 dark:text-red-400",
  },
  T: {
    card: "border-blue-200 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-300 dark:bg-blue-950/20 dark:border-blue-900",
    activeCard: "border-blue-500 bg-blue-100/70 shadow-sm ring-1 ring-blue-400 dark:bg-blue-950/50 dark:border-blue-500",
    badge: "border-blue-400 text-blue-600 bg-white dark:bg-zinc-900",
    text: "text-blue-700 dark:text-blue-400",
  },
  E: {
    card: "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-900",
    activeCard: "border-emerald-500 bg-emerald-100/70 shadow-sm ring-1 ring-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-500",
    badge: "border-emerald-400 text-emerald-600 bg-white dark:bg-zinc-900",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  R: {
    card: "border-pink-200 bg-pink-50/40 hover:bg-pink-50 hover:border-pink-300 dark:bg-pink-950/20 dark:border-pink-900",
    activeCard: "border-pink-500 bg-pink-100/70 shadow-sm ring-1 ring-pink-400 dark:bg-pink-950/50 dark:border-pink-500",
    badge: "border-pink-400 text-pink-600 bg-white dark:bg-zinc-900",
    text: "text-pink-700 dark:text-pink-400",
  },
  V: {
    card: "border-purple-200 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-300 dark:bg-purple-950/20 dark:border-purple-900",
    activeCard: "border-purple-500 bg-purple-100/70 shadow-sm ring-1 ring-purple-400 dark:bg-purple-950/50 dark:border-purple-500",
    badge: "border-purple-400 text-purple-600 bg-white dark:bg-zinc-900",
    text: "text-purple-700 dark:text-purple-400",
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

  const badgeLetter = getCourseBadgeLetter(course.name)
  const theme = THEME_STYLES[badgeLetter] || {
    card: "border-slate-200 bg-slate-50/60 hover:bg-slate-100 dark:bg-zinc-900 dark:border-zinc-800",
    activeCard: "border-primary bg-primary/10 shadow-sm ring-1 ring-primary",
    badge: "border-slate-400 text-slate-700 bg-white dark:bg-zinc-800",
    text: "text-slate-800 dark:text-slate-200",
  }

  const textSizeClass = badgeLetter.length > 2 ? "text-xs" : "text-base"

  const cardContent = (
    <div
      className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-all duration-150 cursor-pointer ${
        isActive ? theme.activeCard : theme.card
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-bold tracking-wider shadow-xs ${textSizeClass} ${theme.badge}`}
        >
          {badgeLetter}
        </div>

        <h3 className={`truncate text-sm sm:text-base font-bold tracking-tight ${theme.text}`}>
          {course.name}
        </h3>
      </div>

      <div className="shrink-0">
        {role === "TEACHER" ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-white/80 hover:text-slate-900 dark:hover:bg-zinc-800 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Menu</span>
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
          <div className="flex size-7 items-center justify-center rounded-full text-slate-400 transition-all">
            <ArrowRight className="size-3.5" />
          </div>
        )}
      </div>
    </div>
  )

  // Nếu không có hàm onSelect (chạy độc lập), bọc trong Link
  if (!onSelect) {
    return (
      <Link href={`/courses/${course.id}`} className="block w-full">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}