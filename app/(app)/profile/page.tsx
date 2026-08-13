'use client'
import { useState, useEffect } from "react";
import { getAvatarUrl } from "@/lib/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
 
  Save,
  KeyRound,
  Mail,
  
  IdCard,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/providers/auth-provider'
import { useChangePassword } from '@/hooks/use-profile'

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
  const changePasswordMutation = useChangePassword()


 const [avatarUrl, setAvatarUrl] =
  useState("");

const [savingAvatar, setSavingAvatar] =
  useState(false);

const [successOpen, setSuccessOpen] =
  useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] =
  useState(false);

useEffect(() => {
  if (profile) {
    setAvatarUrl(
      profile.avatar_url ?? ""
    );
  }
}, [profile]);

if (!user || !profile) {
  return null;
}


async function handleAvatarUpdate() {
  const url = avatarUrl.trim();

  if (!url) {
    toast.error(
      "Vui lòng nhập link Google Drive."
    );
    return;
  }

  if (
    !url.includes("drive.google.com")
  ) {
    toast.error(
      "Vui lòng nhập đường link Google Drive hợp lệ."
    );
    return;
  }

  setSavingAvatar(true);

  try {
    const response = await fetch(
      "/api/profile/avatar",
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          avatar_url: url,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ??
          "Không thể cập nhật ảnh đại diện."
      );
    }

    await refresh();

    setAvatarDialogOpen(false);

    toast.success(
      "Đã cập nhật ảnh đại diện."
    );

  } catch (error) {
    console.error(
      "[UPDATE AVATAR ERROR]",
      error
    );

    toast.error(
      error instanceof Error
        ? error.message
        : "Không thể cập nhật ảnh đại diện."
    );

  } finally {
    setSavingAvatar(false);
  }
}

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
    toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp.")
    return
  }

  try {
    await changePasswordMutation.mutateAsync({
      currentPassword,
      newPassword,
    })

    setSuccessOpen(true);

// e.currentTarget.reset();

//     e.currentTarget.reset()

  } catch (err: any) {

    toast.error(err.message)

  }
}

function getGoogleDriveImageUrl(
  url?: string | null
) {
  if (!url) {
    return "/placeholder.svg";
  }

  /*
   * Link dạng:
   *
   * https://drive.google.com/file/d/FILE_ID/view
   */

  const match =
    url.match(
      /\/file\/d\/([^/]+)/
    );

  if (!match) {
    return url;
  }

  const fileId = match[1];

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w512`;
}

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Hồ sơ"
        description="Thông tin cá nhân và mật khẩu"
      />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">

        <Card className="h-fit">
          <CardContent className="flex flex-col items-center gap-4 py-6 text-center">

            <div className="relative">

<button
  type="button"
  onClick={() => setAvatarDialogOpen(true)}
  className="group relative rounded-full outline-none"
>
  <Avatar
    className="
      size-40
      cursor-pointer
      ring-2
      ring-transparent
      transition-all
      group-hover:ring-primary/30
      group-hover:scale-105
    "
  >
    <AvatarImage
      src={getAvatarUrl(
        profile.avatar_url
      )}
      alt={profile.full_name}
    />

    <AvatarFallback className="text-2xl">
      {initials(profile.full_name)}
    </AvatarFallback>
  </Avatar>

  {/* Overlay khi hover */}
  <span
    className="
      absolute
      inset-0
      flex
      items-center
      justify-center
      rounded-full
      bg-black/50
      text-xs
      font-medium
      text-white
      opacity-0
      transition-opacity
      group-hover:opacity-100
    "
  >
    Đổi ảnh
  </span>
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

            

          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">

          <Card>

            <CardHeader>
              <CardTitle>
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>

            <CardContent>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>

                    <Label htmlFor="name">
                      Họ tên
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
                      Email thông báo không làm bài
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
                        Mã số học sinh
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
                Đổi mật khẩu
              </CardTitle>

              <CardDescription>
                Đổi mật khẩu xong ghi lại dùm còn không đừng đổi để xài đại đi
              </CardDescription>

            </CardHeader>

            <CardContent>

              <form
                onSubmit={changePassword}
                className="flex flex-col gap-4"
              >

                <div>

                  <Label htmlFor="current">
                    Mật khẩu hiện tại
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
                      Mật khẩu mới
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
                      Nhập lại mật khẩu
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
                    disabled={changePasswordMutation.isPending}
                  >
                    <KeyRound className="mr-2 size-4" />
                    Cập nhập mật khẩu
                  </Button>

                </div>

              </form>

            </CardContent>

          </Card>

        </div>

      </div>
      <Dialog
        open={avatarDialogOpen}
        onOpenChange={setAvatarDialogOpen}
      >
        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle>
              Đổi ảnh đại diện
            </DialogTitle>

            <DialogDescription>
              Dán đường link ảnh Google Drive của bạn.
              Hãy chắc chắn ảnh được chia sẻ với
              quyền "Bất kỳ ai có đường liên kết".
            </DialogDescription>

          </DialogHeader>

          <div className="space-y-2">

            <Label htmlFor="avatar_url">
              Link ảnh Google Drive
            </Label>

            <Input
              id="avatar_url"
              value={avatarUrl}
              onChange={(e) =>
                setAvatarUrl(e.target.value)
              }
              placeholder="https://drive.google.com/..."
            />

            <p className="text-xs text-muted-foreground">
              Google Drive → Chia sẻ → Bất kỳ ai có
              đường liên kết → Người xem.
            </p>

          </div>

          <DialogFooter>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setAvatarDialogOpen(false)
              }
              disabled={savingAvatar}
            >
              Hủy
            </Button>

            <Button
              type="button"
              onClick={handleAvatarUpdate}
              disabled={savingAvatar}
            >
              {savingAvatar
                ? "Đang cập nhật..."
                : "Cập nhật"}
            </Button>

          </DialogFooter>

        </DialogContent>
      </Dialog>
                  <Dialog
          open={successOpen}
          onOpenChange={setSuccessOpen}
        >
          <DialogContent>

            <DialogHeader>

              <DialogTitle>
                🎉 Thành công
              </DialogTitle>

              <DialogDescription>
                Mật khẩu của bạn đã được cập nhật thành công.
              </DialogDescription>

            </DialogHeader>

            <DialogFooter>

              <Button
                onClick={() => setSuccessOpen(false)}
              >
                Đóng
              </Button>

            </DialogFooter>

          </DialogContent>
        </Dialog>

      
    </div>
  )
}
