'use client'

import { useEffect, useState } from 'react'
import {
 
  Save,
  KeyRound,
  Mail,
  
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


  if (!user || !profile) return null



 async function changePassword(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault()

  const form = new FormData(e.currentTarget)

  const currentPassword =
    form.get("current") as string

  const newPassword =
    form.get("new") as string

  const confirmPassword =
    form.get("confirm") as string

  if (newPassword !== confirmPassword) {
    toast.error("New passwords do not match")
    return
  }

  try {
    await profileClientService.changePassword(
      currentPassword,
      newPassword
    )

    toast.success("Password changed")

    e.currentTarget.reset()

  } catch (err: any) {

    toast.error(err.message)

  }
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

            

          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">

          <Card>

            <CardHeader>
              <CardTitle>
                Personal information
              </CardTitle>
            </CardHeader>

            <CardContent>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>

                    <Label htmlFor="name">
                      Full name
                    </Label>
                      <Input
                          id="name"
                          value={profile.full_name}
                          disabled
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
                    <Label htmlFor="personal_email">
                      Personal Email
                    </Label>

                    <Input
                      id="personal_email"
                      value={profile.personal_email ?? ""}
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