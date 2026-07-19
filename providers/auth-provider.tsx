'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Role, User } from '@/lib/types'
import { MOCK_USERS } from '@/lib/mock-data'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (role: Role) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'mathster-auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Role | null
    if (stored && MOCK_USERS[stored]) {
      setUser(MOCK_USERS[stored])
    }
    setLoading(false)
  }, [])

  const login = useCallback(
    (role: Role) => {
      setUser(MOCK_USERS[role])
      localStorage.setItem(STORAGE_KEY, role)
      router.push('/dashboard')
    },
    [router],
  )

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
