'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/providers/auth-provider'
import type { Course } from '@/lib/types'

export function CourseCard({ course }: { course: Course }) {
  const { role } = useAuth()

  return (
    <Link href={`/courses/${course.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden pt-0 transition-all group-hover:border-primary/50 group-hover:shadow-md">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={course.thumbnail || "/placeholder.svg"}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <Badge variant="secondary" className="absolute left-3 top-3">
            {course.category}
          </Badge>
        </div>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-serif text-lg font-semibold leading-tight text-balance">
              {course.title}
            </h3>
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {course.description}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="size-3.5" />
            <span>{course.totalLessons} lessons</span>
            <span aria-hidden>·</span>
            <span>{course.teacher}</span>
          </div>

          {role === 'student' ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium tabular-nums">{course.progress}%</span>
              </div>
              <Progress value={course.progress} />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
              Manage course
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
