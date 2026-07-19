'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronLeft,
  FileText,
  Download,
  ClipboardList,
  CircleCheckBig,
  Circle,
  Play,
  ArrowRight,
} from 'lucide-react'
import { COURSES } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { toast } from 'sonner'

const DOC_LABEL: Record<string, string> = {
  pdf: 'PDF',
  slide: 'Slides',
  sheet: 'Worksheet',
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = use(params)
  const { role } = useAuth()

  const course = COURSES.find((c) => c.id === courseId)
  if (!course) notFound()

  const allLessons = course.chapters.flatMap((ch) => ch.lessons)
  const lessonIndex = allLessons.findIndex((l) => l.id === lessonId)
  const lesson = allLessons[lessonIndex]
  if (!lesson) notFound()

  const nextLesson = allLessons[lessonIndex + 1]
  const [completed, setCompleted] = useState(!!lesson.completed)

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/courses/${course.id}`}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {course.title}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-5">
          {/* Video */}
          <div className="relative aspect-video overflow-hidden rounded-xl border bg-foreground">
            <iframe
              className="size-full"
              src={`https://www.youtube.com/embed/${lesson.youtubeId}`}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Play className="size-3.5" />
              {lesson.duration}
              <span aria-hidden>·</span>
              Lesson {lessonIndex + 1} of {allLessons.length}
            </div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-balance">
              {lesson.title}
            </h1>
            <p className="leading-relaxed text-muted-foreground text-pretty">{lesson.description}</p>
          </div>

          {role === 'student' ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant={completed ? 'outline' : 'default'}
                onClick={() => {
                  setCompleted((v) => !v)
                  toast.success(completed ? 'Marked as not completed' : 'Lesson completed!')
                }}
              >
                {completed ? (
                  <CircleCheckBig data-icon="inline-start" />
                ) : (
                  <Circle data-icon="inline-start" />
                )}
                {completed ? 'Completed' : 'Mark as complete'}
              </Button>
              {nextLesson ? (
                <Button variant="ghost" render={<Link href={`/courses/${course.id}/lessons/${nextLesson.id}`} />}>
                  Next lesson
                  <ArrowRight data-icon="inline-end" />
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">Edit lesson</Button>
              <Button variant="outline">Upload document</Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {lesson.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents for this lesson.</p>
              ) : (
                lesson.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <FileText className="size-4.5" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{doc.title}</span>
                      <span className="text-xs text-muted-foreground">{DOC_LABEL[doc.type]}</span>
                    </div>
                    <Button variant="ghost" size="icon-sm" aria-label={`Download ${doc.title}`}>
                      <Download />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {lesson.assignmentId ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assignment</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <ClipboardList className="size-4.5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">Practice exercise</span>
                    <span className="text-xs text-muted-foreground">
                      Complete the linked quiz to reinforce this lesson.
                    </span>
                  </div>
                </div>
                <Separator />
                <Button
                  className="w-full"
                  render={<Link href={`/exams/${lesson.assignmentId}`} />}
                >
                  {role === 'student' ? 'Start assignment' : 'View assignment'}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {/* Lesson list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">In this course</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {allLessons.map((l, i) => (
                <Link
                  key={l.id}
                  href={`/courses/${course.id}/lessons/${l.id}`}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent',
                    l.id === lesson.id && 'bg-accent font-medium',
                  )}
                >
                  {role === 'student' && l.completed ? (
                    <CircleCheckBig className="size-4 shrink-0 text-primary" />
                  ) : (
                    <span className="w-4 shrink-0 text-center text-xs text-muted-foreground">
                      {i + 1}
                    </span>
                  )}
                  <span className="truncate">{l.title}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
