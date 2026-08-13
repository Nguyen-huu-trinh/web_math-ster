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

  const {
    user,
    profile,
    logout,
  } = useAuth();

  if (!user || !profile) {
    return null;
  }

  const { primary } =
    navForRole(
      profile.role.toLowerCase() as any
    );

  const renderItem = (item: {
    label: string;
    href: string;
    icon: string;
  }) => {
    const active =
      pathname === item.href ||
      pathname.startsWith(item.href + "/");

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          // Base
          "group flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5",
          "text-sm font-medium transition-all duration-200",

          // Active
          active
            ? [
                "bg-sidebar-accent",
                "text-sidebar-accent-foreground",
                "shadow-sm",
              ]
            : [
                "text-sidebar-foreground/65",
                "hover:bg-sidebar-accent/60",
                "hover:text-sidebar-foreground",
              ]
        )}
      >
        {/* ICON */}

        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            "transition-all duration-200",

            active
              ? [
                  "bg-primary",
                  "text-primary-foreground",
                  "shadow-sm",
                ]
              : [
                  "bg-sidebar-accent/40",
                  "text-sidebar-foreground/60",
                  "group-hover:bg-sidebar-accent",
                  "group-hover:text-sidebar-foreground",
                ]
          )}
        >
          <Icon
            name={item.icon}
            className="size-4"
          />
        </span>

        {/* LABEL - Ẩn trên mobile bằng `hidden` và hiện từ màn hình `sm` trở lên bằng `sm:inline` */}
        <span className="whitespace-nowrap hidden sm:inline">
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <header
      className="
        sticky
        top-0
        z-50
        w-full
        border-b
        border-sidebar-border/80
        bg-sidebar/95
        text-sidebar-foreground
        shadow-sm
        backdrop-blur
      "
    >
      <div
        className="
          flex
          h-[72px]
          w-full
          items-center
          justify-between
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =====================================================
            LOGO (CĂN TRÁI)
        ====================================================== */}

        <div className="flex shrink-0 items-center justify-start">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="
              flex
              items-center
              rounded-xl
              transition-opacity
              hover:opacity-90
            "
          >
            <BrandLogo variant="sidebar" className="h-12 w-auto" />
          </Link>
        </div>


        {/* =====================================================
            MAIN NAVIGATION (LỆCH TRÁI & CÓ KHOẢNG CÁCH VỚI LOGO)
        ====================================================== */}

        <nav
          className="
            flex
            flex-1
            ml-6
            items-center
            justify-start
            gap-1
            overflow-x-auto
            scrollbar-none
          "
        >
          {primary.map(renderItem)}
        </nav>


        {/* =====================================================
            USER MENU (CĂN PHẢI)
        ====================================================== */}

        <div className="flex shrink-0 items-center justify-end">

          <DropdownMenu>

            <DropdownMenuTrigger
              className="
                group
                flex
                items-center
                gap-2
                rounded-xl
                p-1
                outline-none
                transition-all
                duration-200
                hover:bg-sidebar-accent
                focus-visible:ring-2
                focus-visible:ring-primary
                focus-visible:ring-offset-2
                focus-visible:ring-offset-sidebar
              "
            >
              <Avatar
                className="
                  size-10
                  border-2
                  border-sidebar-border
                  shadow-sm
                  transition-all
                  duration-200
                  group-hover:border-primary/50
                "
              >
              <AvatarImage
                src={getAvatarUrl(
                  profile.avatar_url
                )}
                alt={profile.full_name}
              />

                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials(profile.full_name)}
                </AvatarFallback>
              </Avatar>

              <ChevronDown
                className="
                  mr-1
                  hidden
                  size-4
                  text-sidebar-foreground/50
                  transition-transform
                  group-data-[state=open]:rotate-180
                  sm:block
                "
              />
            </DropdownMenuTrigger>


            {/* =================================================
                DROPDOWN
            ================================================== */}

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="
                w-52
                rounded-xl
                border
                bg-background
                p-1.5
                shadow-xl
              "
            >

              {/* PROFILE */}

              <DropdownMenuItem
                className="
                  cursor-pointer
                  rounded-lg
                  px-3
                  py-2.5
                "
                onClick={() =>
                  router.push("/profile")
                }
              >
                <User className="mr-2.5 size-4" />

                <span>
                  Hồ sơ
                </span>
              </DropdownMenuItem>


              <DropdownMenuSeparator className="my-1" />


              {/* LOGOUT */}

              <DropdownMenuItem
                variant="destructive"
                className="
                  cursor-pointer
                  rounded-lg
                  px-3
                  py-2.5
                "
                onClick={logout}
              >
                <LogOut className="mr-2.5 size-4" />

                <span>
                  Đăng xuất
                </span>
              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

        </div>

      </div>
    </header>
  );
}