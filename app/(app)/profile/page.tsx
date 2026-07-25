'use client'

import { useEffect, useState } from 'react'
import {
  Camera,
  Save,
  KeyRound,
  Mail,
  Phone,
  IdCard,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/providers/auth-provider'
import { profileClientService } from '@/services/profile-client.service'

import { PageHeader } from '@/components/layout/page-header'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

function initials(name?: string) {
  if (!name) return '?'

  return name
    .trim()
    .split(' ')
    .slice(-2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export default function ProfilePage() {
  const {
    user,
    profile,
    refresh,
  } = useAuth()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (!profile) return

    setName(profile.full_name)
    setPhone(profile.phone ?? '')
  }, [profile])

  if (!user || !profile) return null

  async function saveProfile(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    try {
      await profileClientService.update({
        full_name: name,
        phone,
      })

      await refresh()

      toast.success('Profile updated successfully')
    } catch (error) {
      console.error(error)

      toast.error('Failed to update profile')
    }
  }

  function changePassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
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
      <PageHeader
        title="Profile"
        description="Manage your personal information and password."
      />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">

        <Card className="h-fit">
          <CardContent className="flex flex-col items-center gap-4 py-6 text-center">

            <div className="relative">

              <Avatar className="size-24">

                <AvatarImage
                  src={
                    profile.avatar_url ??
                    '/placeholder.svg'
                  }
                  alt={profile.full_name}
                />

                <AvatarFallback className="text-2xl">
                  {initials(profile.full_name)}
                </AvatarFallback>

              </Avatar>

              <button
                type="button"
                onClick={() =>
                  toast.info(
                    'Avatar upload coming soon'
                  )
                }
                className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card"
              >
                <Camera className="size-4" />
              </button>

            </div>

            <div>

              <h2 className="font-serif text-lg font-semibold">
                {profile.full_name}
              </h2>

              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>

            </div>

            <Badge
              variant="secondary"
              className="gap-1 capitalize"
            >
              <ShieldCheck className="size-3" />
              {profile.role}
            </Badge>

            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                toast.info(
                  'Avatar upload coming soon'
                )
              }
            >
              <Camera className="mr-2 size-4" />
              Change avatar
            </Button>

          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">

          <Card>

            <CardHeader>
              <CardTitle>
                Personal information
              </CardTitle>

              <CardDescription>
                Update your account details.
              </CardDescription>
            </CardHeader>

            <CardContent>

              <form
                onSubmit={saveProfile}
                className="flex flex-col gap-4"
              >

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>

                    <Label htmlFor="name">
                      Full name
                    </Label>

                    <Input
                      id="name"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                    />

                  </div>

                  <div>

                    <Label htmlFor="email">
                      <Mail className="mr-1 inline size-3" />
                      Email
                    </Label>

                    <Input
                      id="email"
                      type="email"
                      value={user.email ?? ''}
                      disabled
                    />

                  </div>

                  <div>

                    <Label htmlFor="phone">
                      <Phone className="mr-1 inline size-3" />
                      Phone
                    </Label>

                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                    />

                  </div>

                  <div>

                    <Label htmlFor="role">
                      Role
                    </Label>

                    <Input
                      id="role"
                      value={profile.role}
                      disabled
                    />

                  </div>

                  {profile.student_code && (

                    <div>

                      <Label htmlFor="code">
                        <IdCard className="mr-1 inline size-3" />
                        Student Code
                      </Label>

                      <Input
                        id="code"
                        value={profile.student_code}
                        disabled
                        className="font-mono"
                      />

                    </div>

                  )}

                </div>

                <div className="flex justify-end">

                  <Button type="submit">
                    <Save className="mr-2 size-4" />
                    Save Changes
                  </Button>

                </div>

              </form>

            </CardContent>

          </Card>

          <Card>

            <CardHeader>

              <CardTitle>
                Change password
              </CardTitle>

              <CardDescription>
                Use a strong password you don't reuse elsewhere.
              </CardDescription>

            </CardHeader>

            <CardContent>

              <form
                onSubmit={changePassword}
                className="flex flex-col gap-4"
              >

                <div>

                  <Label htmlFor="current">
                    Current password
                  </Label>

                  <Input
                    id="current"
                    name="current"
                    type="password"
                    required
                  />

                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>

                    <Label htmlFor="new">
                      New password
                    </Label>

                    <Input
                      id="new"
                      name="new"
                      type="password"
                      required
                    />

                  </div>

                  <div>

                    <Label htmlFor="confirm">
                      Confirm password
                    </Label>

                    <Input
                      id="confirm"
                      name="confirm"
                      type="password"
                      required
                    />

                  </div>

                </div>

                <div className="flex justify-end">

                  <Button
                    type="submit"
                    variant="outline"
                  >
                    <KeyRound className="mr-2 size-4" />
                    Update Password
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