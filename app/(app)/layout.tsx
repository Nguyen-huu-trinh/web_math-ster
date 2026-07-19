'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { Topbar } from '@/components/layout/topbar'
import { Spinner } from '@/components/ui/spinner'

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/courses': 'Courses',
  '/student-exams': 'My Exams',
  '/manage-exams': 'Manage Exams',
  '/create-exam': 'Create Exam',
  '/students': 'Student Management',
  '/accounts': 'Account Management',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/exam': 'Exam',
}

function titleFor(pathname: string) {
  const match = Object.keys(TITLES).find((k) => pathname === k || pathname.startsWith(k + '/'))
  return match ? TITLES[match] : 'Math-ster'
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-6 text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        <SidebarNav />
      </aside>
      <div className="flex min-h-screen flex-1 flex-col lg:pl-72">
        <Topbar title={titleFor(pathname)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  )
}
