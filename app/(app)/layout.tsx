"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Spinner } from "@/components/ui/spinner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  /*
   * Trang Lesson cần sử dụng toàn bộ chiều rộng.
   *
   * Ví dụ:
   * /courses/123/lessons/456
   */
  const isLessonPage =
    pathname.startsWith("/courses/") &&
    pathname.includes("/lessons/");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  /*
   * Đang kiểm tra authentication
   */
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-6 text-primary" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isLessonPage ? "bg-[#0f1426]" : "bg-background"}`}>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <SidebarNav />


      {/* =====================================================
          MAIN CONTENT (ĐÃ SỬA: Bỏ hoàn toàn px ở trang Lesson)
      ====================================================== */}

      <main
        className={
          isLessonPage
            ? "min-h-[calc(100dvh-4rem)] w-full bg-[#0f1426]"
            : "flex-1 px-4 py-6 sm:px-6 lg:px-8"
        }
      >

        {isLessonPage ? (

          /*
           * LESSON PAGE
           *
           * Không dùng max-w-7xl.
           * Cho phép LessonLayout sử dụng toàn bộ
           * chiều rộng màn hình.
           */
          <div className="w-full animate-fade-in">
            {children}
          </div>

        ) : (

          /*
           * CÁC TRANG KHÁC
           *
           * Vẫn giữ layout cũ.
           */
          <div className="mx-auto w-full max-w-7xl animate-fade-in">
            {children}
          </div>

        )}

      </main>

    </div>
  );
}
