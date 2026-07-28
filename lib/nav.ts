import type { Role } from './types'

export interface NavItem {
  label: string
  href: string
  icon: string
  roles: Role[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Trang chủ",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["teacher", "student"],
  },

  {
    label: "Khoá học",
    href: "/courses",
    icon: "GraduationCap",
    roles: ["teacher", "student"],
  },

  {
    label: "Bài Kiểm Tra",
    href: "/student-exams",
    icon: "FileText",
    roles: ["student"],
  },

  {
    label: "Quản Lý Bài Kiểm Tra",
    href: "/exams",
    icon: "ClipboardList",
    roles: ["teacher"],
  },

  {
    label: "Tạo Bài Kiểm Tra",
    href: "/exams/create",
    icon: "FilePlus2",
    roles: ["teacher"],
  },

  {
    label: "Học Sinh",
    href: "/students",
    icon: "Users",
    roles: ["teacher"],
  },

  {
    label: "Tài Khoản",
    href: "/accounts",
    icon: "UserCog",
    roles: ["teacher"],
  },
]

export const SECONDARY_NAV: NavItem[] = [
  { label: 'Hồ sơ', href: '/profile', icon: 'CircleUser', roles: ['teacher', 'student'] },
  { label: 'Cài đặt', href: '/settings', icon: 'Settings', roles: ['teacher', 'student'] },
]

export function navForRole(role: Role) {
  return {
    primary: NAV_ITEMS.filter((i) => i.roles.includes(role)),
    secondary: SECONDARY_NAV.filter((i) => i.roles.includes(role)),
  }
}
