import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  ClipboardList,
  FilePlus2,
  Users,
  UserCog,
  CircleUser,
  Settings,
  BookOpen,
  CalendarCheck,
  CircleCheckBig,
  FileCheck,
  TrendingUp,
  Library,
  type LucideProps,
} from 'lucide-react'

const MAP = {
  LayoutDashboard,
  GraduationCap,
  FileText,
  ClipboardList,
  FilePlus2,
  Users,
  UserCog,
  CircleUser,
  Settings,
  BookOpen,
  CalendarCheck,
  CircleCheckBig,
  FileCheck,
  TrendingUp,
  Library,
} as const

export type IconName = keyof typeof MAP

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = MAP[name as IconName] ?? FileText
  return <Cmp {...props} />
}
