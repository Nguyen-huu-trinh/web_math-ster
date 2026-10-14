"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { useAuth } from "@/providers/auth-provider";
import { profileClientService } from "@/services/profile-client.service";

export default function ChangePasswordPage() {
  const { user, profile, loading, login, logout } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || submitting) return;
    if (!user) router.replace("/login");
    else if (profile && !profile.must_change_password) router.replace("/dashboard");
  }, [loading, user, profile, router, submitting]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password) {
      toast.error("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (password !== confirmation) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!user?.email) {
      toast.error("Không thể xác định tài khoản. Vui lòng tải lại trang.");
      return;
    }

    setSubmitting(true);
    try {
      await profileClientService.changePassword("", password);
      // Renew both Supabase and application sessions with the new password.
      await login(user.email, password);
      setPassword("");
      setConfirmation("");
      toast.success("Đổi mật khẩu thành công!");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể đổi mật khẩu. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user || !profile || !profile.must_change_password) {
    return <main className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" aria-label="Đang tải" /></main>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-[440px] rounded-[28px] border border-slate-200 border-t-4 border-t-amber-400 bg-white p-7 shadow-lg sm:p-9">
        <BrandLogo className="mx-auto mb-6 h-16 w-auto max-w-[240px]" />
        <LockKeyhole className="mx-auto mb-3 h-8 w-8 text-amber-500" />
        <h1 className="text-center text-2xl font-black text-slate-900">Đổi mật khẩu bắt buộc</h1>
        <p className="mt-2 text-center text-sm text-slate-500">Vui lòng đặt mật khẩu mới để tiếp tục sử dụng tài khoản.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="block text-sm font-semibold text-slate-700">Mật khẩu mới</label>
            <input id="new-password" type="password" autoComplete="new-password" required disabled={submitting} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-700">Xác nhận mật khẩu mới</label>
            <input id="confirm-password" type="password" autoComplete="new-password" required disabled={submitting} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" />
          </div>
          <button type="submit" disabled={submitting} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 text-sm font-bold text-slate-950 hover:bg-amber-500 disabled:opacity-60">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Đang cập nhật..." : "Đổi mật khẩu và tiếp tục"}
          </button>
          <button type="button" disabled={submitting} onClick={async () => {
            try { await logout(); router.replace("/login"); }
            catch { toast.error("Không thể đăng xuất. Vui lòng thử lại."); }
          }} className="w-full text-sm font-semibold text-slate-500 hover:text-slate-800">Đăng xuất</button>
        </form>
      </div>
    </main>
  );
}
