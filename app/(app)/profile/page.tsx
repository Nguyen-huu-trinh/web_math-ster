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
  Mail,
  IdCard,
  Zap,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/providers/auth-provider'
import { useChangePassword } from '@/hooks/use-profile'

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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

export const dynamic = 'force-static';

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
  const { user, profile, refresh } = useAuth()
  const changePasswordMutation = useChangePassword()

  const [avatarUrl, setAvatarUrl] = useState("");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [zoomLink, setZoomLink] = useState("");
  const [savingZoom, setSavingZoom] = useState(false);

  // States ẩn/hiện mật khẩu
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setAvatarUrl(profile.avatar_url ?? "");
      setZoomLink(profile.link_zoom ?? "");
    }
  }, [profile]);

  if (!user || !profile) {
    return null;
  }

  // Lấy chỉ số Độ trâu (HP) từ profile hoặc fallback
  const studentHp =
    (profile as any).hp ??
    (profile as any).exp ??
    (profile as any).points ??
    1450;

  async function handleZoomUpdate() {
    const url = zoomLink.trim();

    if (!url) {
      toast.error("Vui lòng nhập link Zoom.");
      return;
    }

    try {
      const parsedUrl = new URL(url);
      if (
        parsedUrl.protocol !== "https:" ||
        !parsedUrl.hostname.includes("zoom.us")
      ) {
        toast.error("Vui lòng nhập đường link Zoom hợp lệ.");
        return;
      }
    } catch {
      toast.error("Vui lòng nhập đường link Zoom hợp lệ.");
      return;
    }

    setSavingZoom(true);

    try {
      const response = await fetch("/api/profile/zoom", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          link_zoom: url,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ?? "Không thể cập nhật link Zoom."
        );
      }

      await refresh();
      toast.success("Đã cập nhật link Zoom.");
    } catch (error) {
      console.error("[UPDATE ZOOM ERROR]", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật link Zoom."
      );
    } finally {
      setSavingZoom(false);
    }
  }

  async function handleAvatarUpdate() {
    const url = avatarUrl.trim();

    if (!url) {
      toast.error("Vui lòng nhập link Google Drive.");
      return;
    }

    if (!url.includes("drive.google.com")) {
      toast.error("Vui lòng nhập đường link Google Drive hợp lệ.");
      return;
    }

    setSavingAvatar(true);

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          avatar_url: url,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ?? "Không thể cập nhật ảnh đại diện."
        );
      }

      await refresh();
      setAvatarDialogOpen(false);
      toast.success("Đã cập nhật ảnh đại diện.");
    } catch (error) {
      console.error("[UPDATE AVATAR ERROR]", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật ảnh đại diện."
      );
    } finally {
      setSavingAvatar(false);
    }
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const currentPassword = form.get("current") as string;
    const newPassword = form.get("new") as string;
    const confirmPassword = form.get("confirm") as string;

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });

      setSuccessOpen(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1440px] mx-auto px-2 sm:px-4 pb-12">
      {/* 1. HEADER TRANG */}
      <div className="pt-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Hồ sơ
        </h1>
        <p className="mt-1 text-sm font-semibold italic text-slate-400">
          Thông tin cá nhân và mật khẩu
        </p>
      </div>

      {/* 2. LAYOUT MASTER-DETAIL: CỘT TRÁI 340px - CỘT PHẢI 1fr */}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr] items-start">
        {/* ========================================================
            CỘT TRÁI: THẺ PROFILE & ĐỘ TRÂU (HP)
        ======================================================== */}
        <div className="flex flex-col gap-4">
          <Card className="rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-2xs">
            <CardContent className="flex flex-col items-center p-0 text-center">
              {/* Avatar kèm Overlay Đổi ảnh */}
              <div className="relative mb-4">
                <button
                  type="button"
                  onClick={() => setAvatarDialogOpen(true)}
                  className="group relative rounded-full outline-hidden"
                >
                  <Avatar className="size-28 sm:size-32 cursor-pointer border-2 border-slate-100 ring-2 ring-transparent transition-all group-hover:scale-105 group-hover:ring-amber-300">
                    <AvatarImage
                      src={getAvatarUrl(profile.avatar_url)}
                      alt={profile.full_name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-slate-100 text-2xl font-black text-slate-600">
                      {initials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/50 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Đổi ảnh
                  </span>
                </button>
              </div>

              {/* Tên & Email */}
              <h2 className="text-lg font-black text-slate-900 sm:text-xl">
                {profile.full_name}
              </h2>
              <p className="mt-0.5 text-xs font-semibold text-slate-400">
                {user.email}
              </p>

              {/* Badge Role */}
              <div className="mt-3">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-mono text-[11px] font-black uppercase tracking-wider text-slate-600">
                  {profile.role}
                </span>
              </div>

              {/* KHỐI ĐỘ TRÂU (HP) CHUẨN MOCKUP */}
              <div className="mt-6 flex w-full items-center justify-between rounded-2xl border border-amber-200/80 bg-amber-50/60 p-3.5 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                    <Zap className="size-5 fill-current" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black uppercase tracking-tight text-slate-800">
                      ĐỘ TRÂU (HP)
                    </div>
                    <div className="text-[11px] font-semibold text-amber-700">
                      Tích lũy cày bài
                    </div>
                  </div>
                </div>

                <div className="font-mono text-base font-black text-amber-600">
                  {studentHp.toLocaleString("vi-VN")}{" "}
                  <span className="text-xs font-bold">HP</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================
            CỘT PHẢI: 3 KHỐI FORM CARD RIÊNG BIỆT
        ======================================================== */}
        <div className="flex flex-col gap-5">
          {/* CARD 1: THÔNG TIN CÁ NHÂN */}
          <Card className="rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-2xs">
            <CardHeader className="p-0 pb-5">
              <CardTitle className="text-base font-black text-slate-900 sm:text-lg">
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Họ tên */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold text-slate-500">
                    Họ tên
                  </Label>
                  <Input
                    id="name"
                    value={profile.full_name}
                    disabled
                    className="h-11 rounded-xl border-slate-200/80 bg-slate-50/60 text-xs sm:text-sm font-semibold text-slate-800 disabled:opacity-100"
                  />
                </div>

                {/* Email hệ thống */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Mail className="size-3.5 text-slate-400" />
                    <span>Email đăng nhập</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email ?? ""}
                    disabled
                    className="h-11 rounded-xl border-slate-200/80 bg-slate-50/60 text-xs sm:text-sm font-semibold text-slate-800 disabled:opacity-100"
                  />
                </div>

                {/* Email thông báo không làm bài */}
                <div className="space-y-1.5">
                  <Label htmlFor="personal_email" className="text-xs font-bold text-slate-500">
                    Email thông báo không làm bài
                  </Label>
                  <Input
                    id="personal_email"
                    value={profile.personal_email ?? ""}
                    disabled
                    className="h-11 rounded-xl border-slate-200/80 bg-slate-50/60 text-xs sm:text-sm font-semibold text-slate-800 disabled:opacity-100"
                  />
                </div>

                {/* Mã số học sinh */}
                {profile.student_code && (
                  <div className="space-y-1.5">
                    <Label htmlFor="code" className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <IdCard className="size-3.5 text-slate-400" />
                      <span>Mã số học sinh</span>
                    </Label>
                    <Input
                      id="code"
                      value={profile.student_code}
                      disabled
                      className="h-11 rounded-xl border-slate-200/80 bg-slate-50/60 font-mono text-xs sm:text-sm font-black text-slate-800 disabled:opacity-100"
                    />
                  </div>
                )}
              </div>

              <p className="mt-4 text-[11.5px] italic text-slate-400">
                * Thông tin học sinh do hệ thống quản trị, nếu có sai sót vui lòng liên hệ Trợ giảng để cập nhật.
              </p>
            </CardContent>
          </Card>

          {/* CARD 2: LỚP HỌC ZOOM */}
          <Card className="rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-2xs">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-black text-slate-900 sm:text-lg">
                Lớp học Zoom
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Nhập đường link Zoom để tham gia lớp học (sẽ tự động cập nhật ngoài Trang chủ).
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="zoom_link" className="text-xs font-bold text-slate-500">
                    Link Zoom
                  </Label>
                  <Input
                    id="zoom_link"
                    type="url"
                    value={zoomLink}
                    onChange={(e) => setZoomLink(e.target.value)}
                    placeholder="https://us06web.zoom.us/w/..."
                    className="h-11 rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleZoomUpdate}
                    disabled={savingZoom}
                    className="h-10 rounded-xl bg-amber-500 px-5 text-xs font-black text-slate-950 shadow-2xs hover:bg-amber-600"
                  >
                    {savingZoom ? "Đang lưu..." : "Lưu link Zoom"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 3: ĐỔI MẬT KHẨU */}
          <Card className="rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-2xs">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-black text-slate-900 sm:text-lg">
                Đổi mật khẩu
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Đổi mật khẩu xong ghi lại dùm còn không đừng đổi để xài đại đi
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <form onSubmit={changePassword} className="space-y-4">
                {/* Mật khẩu hiện tại */}
                <div className="space-y-1.5">
                  <Label htmlFor="current" className="text-xs font-bold text-slate-500">
                    Mật khẩu hiện tại
                  </Label>
                  <div className="relative">
                    <Input
                      id="current"
                      name="current"
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      className="h-11 rounded-xl border-slate-200 bg-white pr-10 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      tabIndex={-1}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Mật khẩu mới & Xác nhận mật khẩu */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="new" className="text-xs font-bold text-slate-500">
                      Mật khẩu mới
                    </Label>
                    <div className="relative">
                      <Input
                        id="new"
                        name="new"
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="••••••••••••"
                        className="h-11 rounded-xl border-slate-200 bg-white pr-10 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        tabIndex={-1}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm" className="text-xs font-bold text-slate-500">
                      Nhập lại mật khẩu
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm"
                        name="confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="••••••••••••"
                        className="h-11 rounded-xl border-slate-200 bg-white pr-10 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nút Submit Đổi mật khẩu Pill màu đen */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="h-11 rounded-full bg-[#181F2C] px-6 text-xs font-black text-white shadow-md hover:bg-slate-950 active:scale-[0.98]"
                  >
                    <KeyRound className="mr-2 size-3.5 stroke-[2.5]" />
                    {changePasswordMutation.isPending ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DIALOG ĐỔI AVATAR */}
      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">
              Đổi ảnh đại diện
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Dán đường link ảnh Google Drive của bạn. Hãy chắc chắn ảnh được chia sẻ với quyền &ldquo;Bất kỳ ai có đường liên kết&rdquo;.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="avatar_url" className="text-xs font-bold text-slate-600">
              Link ảnh Google Drive
            </Label>
            <Input
              id="avatar_url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              className="h-11 rounded-xl border-slate-200 text-xs font-semibold focus:border-amber-400"
            />
            <p className="text-[11px] text-slate-400">
              Google Drive → Chia sẻ → Bất kỳ ai có đường liên kết → Người xem.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAvatarDialogOpen(false)}
              disabled={savingAvatar}
              className="h-10 rounded-xl text-xs font-bold"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleAvatarUpdate}
              disabled={savingAvatar}
              className="h-10 rounded-xl bg-slate-900 text-xs font-black text-white hover:bg-slate-800"
            >
              {savingAvatar ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG THÀNH CÔNG */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-sm rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-2xl">
          <DialogHeader className="items-center">
            <DialogTitle className="text-lg font-black text-slate-900">
              🎉 Thành công
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Mật khẩu của bạn đã được cập nhật thành công.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 sm:justify-center">
            <Button
              onClick={() => setSuccessOpen(false)}
              className="h-10 w-full rounded-xl bg-slate-900 text-xs font-black text-white hover:bg-slate-800"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}