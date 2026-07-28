// export type Role =
//   | "ADMIN"
//   | "TEACHER"
//   | "STUDENT";

// export interface User {
//   id: string
//   name: string
//   email: string
//   role: Role
//   studentCode?: string
//   avatar?: string
//   bio?: string
//   joinedAt: string
// }

// export interface Lesson {
//   id: string
//   title: string
//   duration: string
//   youtubeId: string
//   completed?: boolean
//   documents: DocumentItem[]
//   assignmentId?: string
//   description: string
// }

// export interface DocumentItem {
//   id: string
//   title: string
//   type: 'pdf' | 'slide' | 'sheet'
// }

// export interface Chapter {
//   id: string
//   title: string
//   lessons: Lesson[]
// }

// export interface Course {
//   id: string
//   title: string
//   description: string
//   thumbnail: string
//   category: string
//   teacher: string
//   totalLessons: number
//   progress: number
//   chapters: Chapter[]
//   color: string
// }

// export type ExamType = 'attendance' | 'periodic' | 'free'
// export type ExamStatus = 'open' | 'locked' | 'draft'
// export type StudentExamStatus = 'passed' | 'failed' | 'not-started'
// export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer'

// export interface Question {
//   id: string
//   type: QuestionType
//   prompt: string
//   options?: string[]
//   answer: string
// }

// export interface Exam {
//   id: string
//   title: string
//   type: ExamType
//   status: ExamStatus
//   attempts: number
//   attemptLimit: 'one-time' | 'unlimited'
//   highestScore: number
//   duration: number
//   passingScore: number
//   driveLink: string
//   showAnswers: boolean
//   questions: Question[]
//   topStudents: { name: string; score: number }[]
//   // student facing
//   studentStatus?: StudentExamStatus
//   attemptsRemaining?: number
//   score?: number
// }

// export interface StudentRecord {
//   id: string
//   studentCode: string
//   name: string
//   email: string
//   courses: number
//   attendance: 'present' | 'absent' | 'partial'
//   disabled?: boolean
//   averageScore: number
// }

// export interface LeaderboardEntry {
//   rank: number
//   name: string
//   avatar?: string
//   score: number
//   change: number
// }

// export interface AppNotification {
//   id: string
//   title: string
//   description: string
//   type: 'lesson' | 'attendance' | 'exam'
//   time: string
// }


import type { Role } from "./types";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Trang chủ",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["ADMIN", "TEACHER", "STUDENT"],
  },

  {
    label: "Khoá học",
    href: "/courses",
    icon: "GraduationCap",
    roles: ["ADMIN", "TEACHER", "STUDENT"],
  },

  {
    label: "Bài Kiểm Tra",
    href: "/student-exams",
    icon: "FileText",
    roles: ["STUDENT"],
  },

  {
    label: "Quản Lý Bài Kiểm Tra",
    href: "/exams",
    icon: "ClipboardList",
    roles: ["ADMIN", "TEACHER"],
  },

  {
    label: "Tạo Bài Kiểm Tra",
    href: "/exams/create",
    icon: "FilePlus2",
    roles: ["ADMIN", "TEACHER"],
  },

  {
    label: "Học Sinh",
    href: "/students",
    icon: "Users",
    roles: ["ADMIN", "TEACHER"],
  },

  {
    label: "Tài Khoản",
    href: "/accounts",
    icon: "UserCog",
    roles: ["ADMIN"],
  },
]

export const SECONDARY_NAV: NavItem[] = [
  {
    label: "Hồ sơ",
    href: "/profile",
    icon: "CircleUser",
    roles: ["ADMIN", "TEACHER", "STUDENT"],
  },

  {
    label: "Cài đặt",
    href: "/settings",
    icon: "Settings",
    roles: ["ADMIN", "TEACHER", "STUDENT"],
  },
];

export function navForRole(role: Role) {
  return {
    primary: NAV_ITEMS.filter((i) =>
      i.roles.includes(role)
    ),
    secondary: SECONDARY_NAV.filter((i) =>
      i.roles.includes(role)
    ),
  };
}