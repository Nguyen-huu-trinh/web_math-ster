"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { BrandLogo } from "@/components/brand-logo";
import { SessionMessageDialog } from "@/components/auth/session-message-dialog";

export default function LoginPage() {
  const { login, user, profile, loading } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !profile) return;
    router.replace("/dashboard");
  }, [loading, user, profile, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin đăng nhập");
      return;
    }

    try {
      setSubmitting(true);
      await login(identifier.trim(), password);
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      const message =
        error instanceof Error ? error.message : String(error);

      if (
        message.includes("Tài khoản đã bị vô hiệu hóa") ||
        message.includes("ACCOUNT_DISABLED")
      ) {
        toast.error("Tài khoản đã bị khóa", {
          description:
            "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ trợ giảng hoặc giáo viên để được hỗ trợ.",
        });
        return;
      }

      toast.error("Đăng nhập thất bại", {
        description: "Email/Mã học sinh hoặc mật khẩu không chính xác.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Tiện ích tự động điền tài khoản mẫu học sinh
  function fillDemoAccount() {
    setIdentifier("hocsinh.demo@mathster.edu.vn");
    setPassword("12345678");
    toast.success("Đã điền thông tin tài khoản mẫu!");
  }

  return (
    <>
      <main className="relative flex min-h-screen flex-col items-center justify-between bg-slate-50/70 px-4 py-8 antialiased selection:bg-amber-100 selection:text-amber-900">
        {/* Nền Grid kẻ ô ly toán học mờ */}
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#cbd5e125_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e125_1px,transparent_1px)] bg-[size:32px_32px]"
          aria-hidden="true"
        />

        {/* 1. HUY HIỆU PHÍA TRÊN CÙNG */}
        <div className="relative z-10 animate-fade-in-down pt-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/95 px-4 py-1.5 text-xs shadow-xs backdrop-blur-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-600">
              Cổng học tập nội bộ <strong className="font-bold text-slate-800">Toán Anh Huy</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-bold text-amber-600">THPT 2027</span>
          </div>
        </div>

        {/* 2. CARD FORM ĐĂNG NHẬP TRUNG TÂM */}
        <div className="relative z-10 my-auto w-full max-w-[440px]">
          <div className="overflow-hidden rounded-[28px] border border-slate-200/90 border-t-4 border-t-amber-400 bg-white p-7 sm:p-9 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)]">
            {/* Sử dụng component BrandLogo nguyên bản */}
<div className="flex flex-col items-center text-center">
  <div className="mb-3 flex justify-center">
    <BrandLogo className="h-16 w-auto sm:h-20 max-w-[240px] object-contain transition-transform hover:scale-105" />
  </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-[26px]">
                Chào mừng trở lại!
              </h1>
              <p className="mt-1.5 text-xs sm:text-[13px] font-medium text-slate-500">
                Đăng nhập hệ thống học tập & kiểm tra trực tuyến
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Trường Email hoặc Mã học sinh */}
              <div className="space-y-1.5">
                <label
                  htmlFor="identifier"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500"
                >
                  EMAIL HỌC SINH
                </label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-3.5 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@mathster.edu.vn"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-xs sm:text-sm font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400 shadow-2xs transition-all focus:border-amber-400 focus:outline-hidden focus:ring-3 focus:ring-amber-400/20"
                  />
                </div>
              </div>

              {/* Trường Mật khẩu */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500"
                  >
                    MẬT KHẨU TRUY CẬP
                  </label>
                  {/* <a
                    href="https://zalo.me/0769668368"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-amber-600 transition-colors hover:text-amber-700 hover:underline"
                  >
                    Quên mật khẩu?
                  </a> */}
                </div>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-3.5 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all focus:border-amber-400 focus:outline-hidden focus:ring-3 focus:ring-amber-400/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 text-slate-400 transition-colors hover:text-slate-600"
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Nhớ tài khoản */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-amber-500 focus:ring-amber-400"
                />
                <label
                  htmlFor="remember"
                  className="cursor-pointer text-xs font-semibold text-slate-600 select-none"
                >
                  Nhớ tài khoản trong 30 ngày
                </label>
              </div>

              {/* Nút Submit Đăng Nhập */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 text-sm font-black text-slate-950 shadow-md shadow-amber-400/25 transition-all hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập vào học</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* PHẦN CHÚ THÍCH & HỖ TRỢ TRỢ GIẢNG */}
            <div className="mt-6 space-y-3.5 border-t border-slate-100 pt-5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Tài khoản được cấp riêng sau khi đăng ký khóa học</span>
              </div>

              <p className="text-xs text-slate-500">
                Chưa nhận được tài khoản hoặc quên mật khẩu?
                <br />
                <a
                  href="https://zalo.me/0769668368"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-0.5 font-bold text-amber-600 transition-colors hover:text-amber-700 hover:underline"
                >
                  Liên hệ Trợ Giảng
                </a>
              </p>

              {/* Nút phụ điền demo (2K9) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={fillDemoAccount}
                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-slate-400 transition-colors hover:text-amber-600"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>Điền tài khoản học sinh mẫu (2k9)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CHÂN TRANG BẢN QUYỀN */}
        <footer className="relative z-10 animate-fade-in-up py-4 text-center text-[11.5px] font-medium text-slate-400">
          © 2026 Math-Ster • Hệ thống Toán Anh Huy. Bản quyền thuộc về học viện.
        </footer>
      </main>

      {/* Hộp thoại thông báo hết hạn phiên đăng nhập */}
      <SessionMessageDialog />
    </>
  );
}