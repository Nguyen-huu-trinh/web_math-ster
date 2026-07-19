'use client'

import Link from 'next/link'
import {
  Clock,
  CalendarClock,
  RotateCcw,
  ArrowRight,
  CircleCheckBig,
  CircleX,
  CircleDashed,
  Lock,
} from 'lucide-react'
import type { Exam } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  EXAM_TYPE_LABEL,
  STUDENT_STATUS_LABEL,
  studentStatusVariant,
} from '@/lib/exam-utils'
import { cn } from '@/lib/utils'

const STATUS_ICON = {
  passed: CircleCheckBig,
  failed: CircleX,
  'not-started': CircleDashed,
} as const

// Mock deadlines per exam
const DEADLINES: Record<string, string> = {
  'e-1': 'Closed',
  'e-2': 'Mar 28, 2027 · 22:00',
  'e-3': 'No deadline',
  'e-4': 'Apr 02, 2027 · 18:00',
  'e-5': 'Apr 10, 2027 · 07:00',
}

const COURSE_LABEL: Record<string, string> = {
  'e-1': 'Algebra & Functions',
  'e-2': 'Algebra & Functions',
  'e-3': 'Calculus Essentials',
  'e-4': 'Calculus Essentials',
  'e-5': 'Calculus Essentials',
}

export function StudentExamCard({ exam }: { exam: Exam }) {
  const status = exam.studentStatus ?? 'not-started'
  const StatusIcon = STATUS_ICON[status]
  const isLocked = exam.status === 'locked'
  const remaining = exam.attemptsRemaining ?? 0
  const unlimited = exam.attemptLimit === 'unlimited'
  const canStart = !isLocked && (unlimited || remaining > 0)

  return (
    <Card className="flex h-full flex-col transition-all hover:border-primary/50 hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="font-serif text-base font-semibold leading-tight text-balance">
              {exam.title}
            </h3>
            <p className="text-xs text-muted-foreground">{COURSE_LABEL[exam.id] ?? '—'}</p>
          </div>
          <Badge variant={studentStatusVariant(status)} className="shrink-0 gap-1">
            <StatusIcon className="size-3" />
            {STUDENT_STATUS_LABEL[status]}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{EXAM_TYPE_LABEL[exam.type]}</Badge>
          {typeof exam.score === 'number' ? (
            <Badge variant="secondary" className="tabular-nums">
              Score {exam.score.toFixed(1)}/10
            </Badge>
          ) : null}
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t pt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="size-4" />
            {exam.duration} minutes
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="size-4" />
            {unlimited ? 'Unlimited attempts' : `${remaining} attempt${remaining === 1 ? '' : 's'} remaining`}
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4" />
            {DEADLINES[exam.id] ?? 'No deadline'}
          </div>
        </div>

        <Button
          className={cn('w-full')}
          disabled={!canStart}
          render={canStart ? <Link href={`/exams/${exam.id}`} /> : undefined}
        >
          {isLocked ? (
            <>
              <Lock data-icon="inline-start" />
              Locked
            </>
          ) : !canStart ? (
            'No attempts left'
          ) : (
            <>
              {status === 'not-started' ? 'Start exam' : 'Retake exam'}
              <ArrowRight data-icon="inline-end" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
