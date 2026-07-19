'use client'

import { Trophy, Medal } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import type { Exam } from '@/lib/types'

const RANK_COLOR = ['text-primary', 'text-muted-foreground', 'text-amber-700 dark:text-amber-500']

export function TopStudentsDialog({
  exam,
  open,
  onOpenChange,
}: {
  exam: Exam | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="size-4 text-primary" />
            Top 5 Students
          </DialogTitle>
          <DialogDescription>{exam?.title ?? 'Exam ranking'}</DialogDescription>
        </DialogHeader>

        {exam && exam.topStudents.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {exam.topStudents.slice(0, 5).map((s, i) => (
              <li
                key={s.name}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold tabular-nums ${
                    RANK_COLOR[i] ?? 'text-muted-foreground'
                  }`}
                >
                  {i < 3 ? <Medal className="size-4" /> : i + 1}
                </span>
                <span className="flex-1 truncate text-sm font-medium">{s.name}</span>
                <span className="rounded-md bg-primary/15 px-2 py-0.5 text-sm font-semibold tabular-nums text-primary">
                  {s.score.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Trophy />
              </EmptyMedia>
              <EmptyTitle>No results yet</EmptyTitle>
              <EmptyDescription>
                Rankings will appear once students complete this exam.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
