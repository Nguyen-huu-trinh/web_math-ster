'use client'

import { useState } from 'react'
import { Camera, Save, KeyRound, Mail, Phone, IdCard, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/providers/auth-provider'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

function initials(name: string) {
  return name.split(' ').slice(-2).map((n) => n[0]).join('')
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState('+84 912 345 678')

  if (!user) return null

  function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    toast.success('Profile updated')
  }

  function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    if (form.get('new') !== form.get('confirm')) {
      toast.error('New passwords do not match')
      return
    }
    toast.success('Password changed')
    e.currentTarget.reset()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" description="Manage your personal information and password." />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Avatar card */}
        <Card className="h-fit">
          <CardContent className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="relative">
              <Avatar className="size-24">
                <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.name} />
                <AvatarFallback className="text-2xl">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => toast.info('Avatar picker (mock)')}
                aria-label="Change avatar"
                className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card transition-transform hover:scale-105"
              >
                <Camera className="size-4" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-serif text-lg font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant="secondary" className="gap-1 capitalize">
              <ShieldCheck className="size-3" />
              {user.role}
            </Badge>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toast.info('Avatar picker (mock)')}
            >
              <Camera data-icon="inline-start" />
              Change avatar
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          {/* Personal info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal information</CardTitle>
              <CardDescription>Update your account details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveProfile} className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">
                      <Mail className="size-3.5" />
                      Email
                    </Label>
                    <Input id="email" type="email" defaultValue={user.email} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="phone">
                      <Phone className="size-3.5" />
                      Phone
                    </Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue={user.role} disabled className="capitalize" />
                  </div>
                  {user.studentCode ? (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="code">
                        <IdCard className="size-3.5" />
                        Student code
                      </Label>
                      <Input id="code" defaultValue={user.studentCode} disabled className="font-mono" />
                    </div>
                  ) : null}
                </div>
                <div className="flex justify-end">
                  <Button type="submit">
                    <Save data-icon="inline-start" />
                    Save changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change password</CardTitle>
              <CardDescription>Use a strong password you don&apos;t reuse elsewhere.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={changePassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="current">Current password</Label>
                  <Input id="current" name="current" type="password" placeholder="••••••••" required />
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="new">New password</Label>
                    <Input id="new" name="new" type="password" placeholder="••••••••" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="confirm">Confirm new password</Label>
                    <Input id="confirm" name="confirm" type="password" placeholder="••••••••" required />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="outline">
                    <KeyRound data-icon="inline-start" />
                    Update password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
