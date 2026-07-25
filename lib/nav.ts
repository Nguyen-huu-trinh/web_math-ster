import type { Role } from './types'

export interface NavItem {
  label: string
  href: string
  icon: string
  roles: Role[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["teacher", "student"],
  },

  {
    label: "Courses",
    href: "/courses",
    icon: "GraduationCap",
    roles: ["teacher", "student"],
  },

  {
    label: "My Exams",
    href: "/student-exams",
    icon: "FileText",
    roles: ["student"],
  },

  {
    label: "Manage Exams",
    href: "/exams",
    icon: "ClipboardList",
    roles: ["teacher"],
  },

  {
    label: "Create Exam",
    href: "/exams/create",
    icon: "FilePlus2",
    roles: ["teacher"],
  },

  {
    label: "Students",
    href: "/students",
    icon: "Users",
    roles: ["teacher"],
  },

  {
    label: "Accounts",
    href: "/accounts",
    icon: "UserCog",
    roles: ["teacher"],
  },
]

export const SECONDARY_NAV: NavItem[] = [
  { label: 'Profile', href: '/profile', icon: 'CircleUser', roles: ['teacher', 'student'] },
  { label: 'Settings', href: '/settings', icon: 'Settings', roles: ['teacher', 'student'] },
]

export function navForRole(role: Role) {
  return {
    primary: NAV_ITEMS.filter((i) => i.roles.includes(role)),
    secondary: SECONDARY_NAV.filter((i) => i.roles.includes(role)),
  }
}
