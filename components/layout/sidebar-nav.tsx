"use client";

import { getAvatarUrl } from "@/lib/avatar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { navForRole } from "@/lib/nav";

import { Icon } from "@/components/icon";
import { NotificationBell } from "@/components/layout/notification-bell";
import { BrandLogo } from "@/components/brand-logo";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

function initials(name?: string) {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase();
}

export function SidebarNav({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, profile, logout } = useAuth();

  if (!user || !profile) {
    return null;
  }

  const { primary } = navForRole(profile.role.toLowerCase() as any);

  const renderItem = (item: {
    label: string;
    href: string;
    icon: string;
  }) => {
    const active =
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        title={item.label}
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-full transition-all duration-200",
          // Điện thoại: dạng nút tròn gọn gàng | Màn hình sm trở lên: dạng pill đầy đủ
          "p-2.5 sm:px-4 sm:py-2 text-sm font-semibold",
          active
            ? "bg-[#FACC15] text-slate-950 shadow-sm"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        )}
      >
        <Icon
          name={item.icon}
          className={cn("size-4 shrink-0", active ? "text-slate-950" : "text-slate-400")}
        />
        {/* Trên điện thoại ẩn chữ, chỉ hiện từ màn hình sm trở lên */}
        <span className="whitespace-nowrap hidden sm:inline">
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#0F172A] text-white shadow-md">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* =====================================================
            1. LOGO (CĂN TRÁI)
        ====================================================== */}
        <div className="flex shrink-0 items-center justify-start">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex items-center transition-opacity hover:opacity-90"
          >
            <BrandLogo variant="sidebar" className="h-10 w-auto" />
          </Link>
        </div>

        {/* =====================================================
            2. MAIN NAVIGATION (BỐ CỤC CŨ: NẰM LỆCH TRÁI CẠNH LOGO)
        ====================================================== */}
        <nav className="flex flex-1 ml-4 sm:ml-6 items-center justify-start gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          {primary.map(renderItem)}
        </nav>

        {/* =====================================================
            3. NOTIFICATION & USER MENU (CĂN PHẢI)
        ====================================================== */}
        <div className="flex shrink-0 items-center gap-3">
          
          {/* NÚT THÔNG BÁO */}
          <NotificationBell />

          {/* USER PILL BUTTON */}
          <DropdownMenu>
            <DropdownMenuTrigger className="group flex items-center gap-3 rounded-full border border-slate-700/80 bg-slate-850/80 px-3 py-1.5 outline-none transition-all duration-200 hover:bg-slate-800 focus-visible:ring-1 focus-visible:ring-[#FACC15]">
              
              {/* Tên & Mã học sinh */}
              <div className="hidden sm:flex flex-col text-right leading-tight min-w-0">
                <span className="truncate text-sm font-semibold text-white max-w-[140px]">
                  {profile.full_name}
                </span>
                <span className="text-[11px] font-medium text-[#FACC15] tracking-tight">
                  {profile.student_code ?? "MATH-STER"}
                </span>
              </div>

              {/* Avatar kèm viền và trạng thái active */}
              <div className="relative">
                <Avatar className="size-8 border border-amber-400/80 shadow-xs">
                  <AvatarImage
                    src={getAvatarUrl(profile.avatar_url)}
                    alt={profile.full_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-amber-500/20 text-[#FACC15] text-xs font-bold">
                    {initials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0F172A]" />
              </div>

              <ChevronDown className="size-3.5 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>

            {/* DROPDOWN MENU NỘI DUNG */}
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-52 rounded-xl border border-slate-800 bg-[#1E293B] !text-slate-100 p-1.5 shadow-2xl"
            >
              <DropdownMenuItem
                className="group cursor-pointer rounded-lg px-3 py-2 text-sm !text-slate-200 transition-colors focus:!bg-slate-700 focus:!text-white hover:!bg-slate-700 hover:!text-white"
                onClick={() => router.push("/profile")}
              >
                <User className="mr-2.5 size-4 !text-slate-400 group-hover:!text-white group-focus:!text-white transition-colors" />
                <span className="font-medium !text-inherit">Hồ sơ cá nhân</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 !bg-slate-700/60" />

              <DropdownMenuItem
                className="group cursor-pointer rounded-lg px-3 py-2 text-sm !text-rose-400 transition-colors focus:!bg-rose-500/20 focus:!text-rose-300 hover:!bg-rose-500/20 hover:!text-rose-300"
                onClick={logout}
              >
                <LogOut className="mr-2.5 size-4 !text-rose-400 group-hover:!text-rose-300 group-focus:!text-rose-300 transition-colors" />
                <span className="font-medium !text-inherit">Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}