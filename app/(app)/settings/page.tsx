'use client'

import { useState } from 'react'
import { Sun, Moon, Monitor, Languages, Bell, ShieldCheck, LogOut, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/providers/auth-provider'
import { useTheme } from '@/providers/theme-provider'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type ThemePref = 'light' | 'dark' | 'system'

const THEME_OPTIONS: { value: ThemePref; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()
  const { logout } = useAuth()
  const [pref, setPref] = useState<ThemePref>(theme)
  const [notifications, setNotifications] = useState({
    lessons: true,
    exams: true,
    attendance: false,
    weekly: true,
  })

  function selectTheme(value: ThemePref) {
    setPref(value)
    if (value === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    } else {
      setTheme(value)
    }
    toast.success(`Theme set to ${value}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Customise your experience and manage your account." />

      <div className="flex max-w-3xl flex-col gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Choose how Math-ster looks to you.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map((opt) => {
                const active = pref === opt.value
                const Icon = opt.icon
                return (
                  <button
                    key={opt.value}
                    onClick={() => selectTheme(opt.value)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all',
                      active
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    {active ? (
                      <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </span>
                    ) : null}
                    <Icon className="size-5" />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Languages className="size-4 text-muted-foreground" />
              Language
            </CardTitle>
            <CardDescription>Select your preferred language.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select defaultValue="en" onValueChange={(v) => toast.success(`Language: ${v}`)}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Bell className="size-4 text-muted-foreground" />
              Notifications
            </CardTitle>
            <CardDescription>Decide what updates you receive.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {[
              { key: 'lessons', label: 'Lesson reminders', desc: 'Incomplete lessons and new content' },
              { key: 'exams', label: 'Exam alerts', desc: 'Upcoming and graded exams' },
              { key: 'attendance', label: 'Attendance', desc: 'Weekly check-in reminders' },
              { key: 'weekly', label: 'Weekly summary', desc: 'Your progress digest every Sunday' },
            ].map((item, i, arr) => (
              <div key={item.key}>
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex flex-col">
                    <Label htmlFor={item.key} className="cursor-pointer">
                      {item.label}
                    </Label>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                  </div>
                  <Switch
                    id={item.key}
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                    }
                  />
                </div>
                {i < arr.length - 1 ? <Separator /> : null}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <ShieldCheck className="size-4 text-muted-foreground" />
              Security
            </CardTitle>
            <CardDescription>Protect your account.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Two-factor authentication</span>
                <span className="text-xs text-muted-foreground">Add an extra layer of security</span>
              </div>
              <Switch onCheckedChange={(c) => toast.success(c ? '2FA enabled' : '2FA disabled')} />
            </div>
            <Button variant="outline" className="w-fit" onClick={() => toast.info('Redirecting to profile')}>
              Change password
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardContent className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Log out</span>
              <span className="text-xs text-muted-foreground">
                Sign out of your Math-ster account on this device.
              </span>
            </div>
            <Button variant="destructive" onClick={logout} className="w-fit">
              <LogOut data-icon="inline-start" />
              Log out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
