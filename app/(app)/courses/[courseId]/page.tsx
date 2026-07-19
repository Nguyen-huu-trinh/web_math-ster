'use client'

import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookOpen, CircleCheckBig, Circle, Play, ClipboardList, Plus, ChevronLeft } from 'lucide-react'
import { COURSES } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = use(params)
  const { role } = useAuth()
  const course = COURSES.find((c) => c.id === courseId)

  if (!course) notFound()

  const completedCount = course.chapters
    .flatMap((ch) => ch.lessons)
    .filter((l) => l.completed).length
  const totalCount = course.chapters.flatMap((ch) => ch.lessons).length

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/courses"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to courses
      </Link>

      {/* Hero */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
          <Image
            src={course.thumbnail || "/placeholder.svg"}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
          />
        </div>
        <div className="flex flex-col justify-center gap-4">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="w-fit">
              {course.category}
            </Badge>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-balance lg:text-3xl">
              {course.title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              {course.description}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <BookOpen className="size-4" />
            {course.totalLessons} lessons · {course.teacher}
          </div>

          {role === 'student' ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {completedCount} of {totalCount} lessons completed
                </span>
                <span className="font-medium tabular-nums">{course.progress}%</span>
              </div>
              <Progress value={course.progress} />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button>
                <Plus data-icon="inline-start" />
                Add chapter
              </Button>
              <Button variant="outline">Edit course</Button>
            </div>
          )}
        </div>
      </div>

      {/* Curriculum */}
      <Card>
        <CardContent className="flex flex-col gap-4 py-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold">Curriculum</h2>
            <span className="text-sm text-muted-foreground">
              {course.chapters.length} chapters
            </span>
          </div>

          <Accordion defaultValue={[course.chapters[0]?.id]} className="w-full">
            {course.chapters.map((chapter) => (
              <AccordionItem key={chapter.id} value={chapter.id}>
                <AccordionTrigger>
                  <span className="flex flex-1 items-center justify-between pr-2 text-left">
                    <span className="font-medium">{chapter.title}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {chapter.lessons.length} lessons
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="flex flex-col gap-1 pt-1">
                    {chapter.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <Link
                          href={`/courses/${course.id}/lessons/${lesson.id}`}
                          className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent"
                        >
                          {role === 'student' && lesson.completed ? (
                            <CircleCheckBig className="size-5 shrink-0 text-primary" />
                          ) : (
                            <Circle className="size-5 shrink-0 text-muted-foreground/50" />
                          )}
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium">{lesson.title}</span>
                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Play className="size-3" />
                              {lesson.duration}
                              {lesson.assignmentId ? (
                                <>
                                  <span aria-hidden>·</span>
                                  <ClipboardList className="size-3" />
                                  Assignment
                                </>
                              ) : null}
                            </span>
                          </div>
                          <span
                            className={cn(
                              'shrink-0 text-xs font-medium',
                              role === 'student' && lesson.completed
                                ? 'text-primary'
                                : 'text-muted-foreground',
                            )}
                          >
                            {role === 'student'
                              ? lesson.completed
                                ? 'Done'
                                : 'Start'
                              : 'Edit'}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
