'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Mail, Lock, ArrowRight, GraduationCap, Presentation, Sparkles } from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'
import type { Role } from '@/lib/types'
import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const { login, user, loading } = useAuth()
  const router = useRouter()
  const [role, setRole] = useState<Role>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard')
  }, [loading, user, router])

  useEffect(() => {
    setEmail(role === 'teacher' ? 'teacher@mathster.edu.vn' : 'student@mathster.edu.vn')
    setPassword('demo1234')
  }, [role])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => login(role), 650)
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm animate-fade-in-up">
          <BrandLogo className="mb-10" />

          <div className="mb-8">
            <h1 className="text-balance text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-pretty text-muted-foreground">
              Sign in to continue mastering mathematics for the 2027 Graduation Exam.
            </p>
          </div>

          {/* Role toggle */}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5">
            {(
              [
                { key: 'student', label: 'Student', icon: GraduationCap },
                { key: 'teacher', label: 'Teacher', icon: Presentation },
              ] as const
            ).map(({ key, label, icon: Ico }) => (
              <button
                key={key}
                type="button"
                onClick={() => setRole(key)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
                  role === key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Ico className="size-4" />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <Mail />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="email"
                    type="email"
                    placeholder="you@mathster.edu.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </InputGroup>
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <button type="button" className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <InputGroup>
                  <InputGroupAddon>
                    <Lock />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </InputGroup>
              </Field>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(Boolean(v))}
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground">
                  Remember me for 30 days
                </label>
              </div>

              <Button type="submit" size="lg" className="w-full font-semibold" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Signing in
                  </>
                ) : (
                  <>
                    Sign in as {role === 'teacher' ? 'Teacher' : 'Student'}
                    <ArrowRight data-icon="inline-end" />
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Demo mode — credentials are prefilled. Just pick a role and sign in.
          </p>
        </div>
      </div>

      {/* Right — artwork */}
      <div className="relative hidden overflow-hidden bg-sidebar lg:block">
        <Image
          src="/login-art.png"
          alt=""
          fill
          priority
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <blockquote className="max-w-md animate-fade-in-up">
            <p className="text-balance text-2xl font-semibold leading-relaxed text-sidebar-foreground">
              &ldquo;Math-ster turned exam prep into a daily habit. My average jumped from 6.8 to 8.4 in
              one semester.&rdquo;
            </p>
            <footer className="mt-4 text-sm text-sidebar-foreground/60">
              Nguyen Van A · Grade 12 · Class of 2027
            </footer>
          </blockquote>
        </div>
      </div>
    </main>
  )
}
