
'use client'

import { useAuth } from '@/providers/auth-provider'

import StudentDashboard from './student-dashboard'
import TeacherDashboard from './teacher-dashboard'

export default function DashboardPage() {

    const { user, profile, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                Loading...
            </div>
        )
    }

    if (!user || !profile) {
        return null
    }

    if (profile.role === "TEACHER") {
        return <TeacherDashboard />
    }

    return <StudentDashboard />
}
