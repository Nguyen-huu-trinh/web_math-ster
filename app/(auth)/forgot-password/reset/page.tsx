"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleReset() {
    if (password.length < 8) {
      alert(
        "Mật khẩu phải có ít nhất 8 ký tự."
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      alert(
        "Mật khẩu nhập lại không khớp."
      );
      return;
    }

    const resetToken =
      sessionStorage.getItem(
        "reset_token"
      );

    if (!resetToken) {
      alert(
        "Phiên khôi phục không hợp lệ."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/auth/reset-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              resetToken,
              password,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message
        );
      }

      sessionStorage.removeItem(
        "reset_email"
      );

      sessionStorage.removeItem(
        "reset_token"
      );

      alert(
        "Đổi mật khẩu thành công."
      );

      router.push("/login");

    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Không thể đổi mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">

      <div>
        <h1 className="text-2xl font-bold">
          Đặt mật khẩu mới
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Nhập mật khẩu mới cho tài khoản
          Mathster của bạn.
        </p>
      </div>

      <Input
        type="password"
        placeholder="Mật khẩu mới"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <Input
        type="password"
        placeholder="Nhập lại mật khẩu"
        value={confirmPassword}
        onChange={(e) =>
          setConfirmPassword(
            e.target.value
          )
        }
      />

      <Button
        className="w-full"
        onClick={handleReset}
        disabled={loading}
      >
        {loading
          ? "Đang cập nhật..."
          : "Đổi mật khẩu"}
      </Button>

    </div>
  );
}