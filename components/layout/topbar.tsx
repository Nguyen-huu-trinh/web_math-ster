'use client'

import { useState } from 'react'
import Link from 'next/link'

import {
  Menu,
  Sun,
  Moon,
  Bell,
  Search,
  LogOut,
  CircleUser,
  Settings,
} from 'lucide-react'

import { useAuth } from '@/providers/auth-provider'
import { useTheme } from '@/providers/theme-provider'

import { NOTIFICATIONS } from '@/lib/mock-data'

import { SidebarNav } from './sidebar-nav'

import { Button } from '@/components/ui/button'

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

import {
  Badge,
} from '@/components/ui/badge'

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

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

export function Topbar({
  title,
}: {
  title: string
}) {
  const {
    user,
    profile,
    logout,
  } = useAuth()

  const {
    theme,
    toggleTheme,
  } = useTheme()

  const [mobileOpen, setMobileOpen] =
    useState(false)

  if (!user || !profile) return null

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">

      <Sheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      >

        <SheetTrigger
  className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent lg:hidden"
>
  <Menu className="h-5 w-5" />
</SheetTrigger>

        <SheetContent
          side="left"
          className="w-72 p-0"
        >

          <SheetTitle className="sr-only">
            Navigation
          </SheetTitle>

          <SidebarNav
            onNavigate={() =>
              setMobileOpen(false)
            }
          />

        </SheetContent>

      </Sheet>

      <h1 className="text-lg font-semibold">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2">

        <div className="hidden md:block">

          <InputGroup className="w-64">

            <InputGroupAddon>
              <Search />
            </InputGroupAddon>

            <InputGroupInput
              placeholder="Search..."
            />

          </InputGroup>

        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
        >
          {theme === 'dark'
            ? <Sun />
            : <Moon />}
        </Button>

        <Popover>

          <PopoverTrigger className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">

        <Bell />

        <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />

      </PopoverTrigger>

          <PopoverContent
            align="end"
            className="w-80 p-0"
          >

            <div className="flex items-center justify-between border-b px-4 py-3">

              <p className="font-semibold">
                Notifications
              </p>

              <Badge>
                {NOTIFICATIONS.length}
              </Badge>

            </div>

            <div className="max-h-80 overflow-y-auto">

              {NOTIFICATIONS.map((item) => (

                <div
                  key={item.id}
                  className="border-b px-4 py-3"
                >

                  <p className="font-medium">
                    {item.title}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>

                </div>

              ))}

            </div>

          </PopoverContent>

        </Popover>

        <DropdownMenu>

          <DropdownMenuTrigger className="rounded-full">

            <Avatar className="size-9">


                <AvatarImage
                  src={
                    profile.avatar_url ||
                    '/placeholder.svg'
                  }
                  alt={profile.full_name}
                />

                <AvatarFallback>
                  {initials(profile.full_name)}
                </AvatarFallback>

              </Avatar>

          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56"
          >

            <DropdownMenuLabel>

              <div className="flex flex-col">

                <span>
                  {profile.full_name}
                </span>

                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>

              </div>

            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>

              <DropdownMenuItem
  onClick={() => {
    window.location.href = "/profile";
  }}
>

  <CircleUser className="mr-2 h-4 w-4" />

  Profile

</DropdownMenuItem>

              <DropdownMenuItem
  onClick={() => {
    window.location.href = "/settings";
  }}
>

  <Settings className="mr-2 h-4 w-4" />

  Settings

</DropdownMenuItem>

            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={logout}
              className="text-red-600"
            >

              <LogOut className="mr-2 h-4 w-4" />

              Log out

            </DropdownMenuItem>

          </DropdownMenuContent>

        </DropdownMenu>

      </div>

    </header>
  )
}