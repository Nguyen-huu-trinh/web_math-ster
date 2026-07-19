'use client'

import { useEffect, useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { EXAM_DATE } from '@/lib/mock-data'
import { Card } from '@/components/ui/card'

function getParts(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now())
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds }
}

export function CountdownCard() {
  const [parts, setParts] = useState(() => getParts(EXAM_DATE))

  useEffect(() => {
    const id = setInterval(() => setParts(getParts(EXAM_DATE)), 1000)
    return () => clearInterval(id)
  }, [])

  const units = [
    { label: 'Days', value: parts.days },
    { label: 'Hours', value: parts.hours },
    { label: 'Minutes', value: parts.minutes },
    { label: 'Seconds', value: parts.seconds },
  ]

  return (
    <Card className="relative overflow-hidden bg-sidebar p-6 text-sidebar-foreground">
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <CalendarClock className="size-5" />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Countdown</p>
            <h3 className="text-balance text-lg font-bold">
              Vietnam High School Graduation Exam 2027
            </h3>
            <p className="text-sm text-sidebar-foreground/60">Target date · June 26, 2027</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {units.map((u) => (
            <div
              key={u.label}
              className="flex min-w-[56px] flex-col items-center rounded-2xl bg-sidebar-accent/60 px-2 py-3"
            >
              <span className="font-mono text-2xl font-bold tabular-nums text-sidebar-foreground sm:text-3xl">
                {String(u.value).padStart(2, '0')}
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-wide text-sidebar-foreground/50">
                {u.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
