'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Pencil, Trash2, } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/providers/auth-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { Course } from '@/types/course'

interface Props {
  course: Course
  onEdit?: () => void
  onDelete?: () => void
}

export function CourseCard({
  course,
  onEdit,
  onDelete,
}: Props) {
  const { profile } = useAuth()

  const role = profile?.role

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group block h-full"
    >
      <Card className="h-full overflow-hidden pt-0 transition-all hover:shadow-md">
        <div className="relative aspect-video bg-muted overflow-hidden">
          <Image
            src={
              course.thumbnail_url ??
              "/placeholder.svg"
            }
            alt={course.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <Badge
            className="absolute top-3 left-3"
            variant={
              course.is_active
                ? "default"
                : "secondary"
            }
          >
            {course.is_active
              ? "Active"
              : "Inactive"}
          </Badge>
        </div>

        <CardContent className="space-y-3">

          <div>

            <h3 className="font-semibold text-lg">
              {course.name}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.description ??
                "No description"}
            </p>

          </div>

          <div className="flex items-center justify-between">

  <span className="text-xs text-muted-foreground">
    {role}
  </span>

  {role === "TEACHER" ? (

    <DropdownMenu>

      <DropdownMenuTrigger>

        <button
          onClick={(e) => e.preventDefault()}
          className="rounded-md p-1 hover:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">

        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            onEdit?.();
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-red-600"
          onClick={(e) => {
            e.preventDefault();
            onDelete?.();
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>

      </DropdownMenuContent>

    </DropdownMenu>

  ) : (

    <div className="flex items-center gap-1 text-primary text-sm font-medium">
      View
      <ArrowRight className="size-4" />
    </div>

  )}

</div>
        </CardContent>
      </Card>
    </Link>
  )
}