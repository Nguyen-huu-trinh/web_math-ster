"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const value = email.trim();

    if (!value) {
      setError("Vui lòng nhập tài khoản.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: value,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Không thể gửi mã xác thực."
        );
      }

      setSuccess(
        data?.message ||
          "Mã xác thực đã được gửi đến email cá nhân."
      );

      // Lưu tài khoản để bước verify biết đang
      // xác thực tài khoản nào.
      sessionStorage.setItem(
        "forgot_password_email",
        value
      );

      // Chuyển sang trang nhập OTP
      setTimeout(() => {
        router.push(
          `/forgot-password/verify?email=${encodeURIComponent(
            value
          )}`
        );
      }, 800);
    } catch (err) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <Link
            href="/login"
            className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Mail className="h-5 w-5" />
            </div>

            <div>
              <CardTitle>
                Quên mật khẩu
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Khôi phục mật khẩu tài khoản học sinh
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email">
                Tài khoản
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="0000@mathster.edu.vn"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={loading}
                autoComplete="username"
              />

              <p className="text-xs text-muted-foreground">
                Nhập tài khoản Mathster của bạn.
                Mã xác thực sẽ được gửi đến email
                cá nhân đã đăng ký.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600">
                {success}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Đang gửi mã..."
                : "Gửi mã xác thực"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}