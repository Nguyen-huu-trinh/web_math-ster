'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'

import { useAuth } from '@/providers/auth-provider'
import { navForRole } from '@/lib/nav'

import { Icon } from '@/components/icon'
import { BrandLogo } from '@/components/brand-logo'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

import { cn } from '@/lib/utils'

function initials(name?: string) {
  if (!name) return '?'

  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
}

export function SidebarNav({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  const {
    user,
    profile,
    logout,
  } = useAuth()

  if (!user || !profile) return null

  const { primary, secondary } =
    navForRole(profile.role.toLowerCase() as any)

  const renderItem = (item: {
    label: string
    href: string
    icon: string
  }) => {
    const active =
      pathname === item.href ||
      pathname.startsWith(item.href + '/')

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
        )}
      >
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
            active
              ? 'bg-primary text-primary-foreground'
              : 'bg-sidebar-accent/40 text-sidebar-foreground/70 group-hover:text-sidebar-foreground',
          )}
        >
          <Icon
            name={item.icon}
            className="size-4"
          />
        </span>

        {item.label}
      </Link>
    )
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-5 pt-7">
        <BrandLogo variant="sidebar" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
          ...
        </p>

        <div className="flex flex-col gap-1">
          {primary.map(renderItem)}
        </div>

        <p className="px-3 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
          Tài khoản
        </p>

        <div className="flex flex-col gap-1">
          {secondary.map(renderItem)}
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">

          <Avatar className="size-9">
            <AvatarImage
              src={profile.avatar_url || '/placeholder.svg'}
              alt={profile.full_name || 'User'}
            />

            <AvatarFallback>
              {initials(profile.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">

            <p className="truncate text-sm font-semibold">
              {profile.full_name}
            </p>

            <p className="truncate text-xs capitalize text-sidebar-foreground/50">
              {profile.role}
            </p>

          </div>

          <button
            onClick={logout}
            className="flex size-8 items-center justify-center rounded-lg hover:bg-sidebar-accent"
          >
            <LogOut className="size-4" />
          </button>

        </div>
      </div>
    </div>
  )
}