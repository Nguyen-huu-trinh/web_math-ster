import { BookOpen, CalendarCheck, FileText, ArrowRight } from 'lucide-react'
import { NOTIFICATIONS } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ICONS = {
  lesson: BookOpen,
  attendance: CalendarCheck,
  exam: FileText,
}

export function NotificationsCard() {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Needs your attention</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {NOTIFICATIONS.map((n) => {
          const Ico = ICONS[n.type]
          return (
            <div
              key={n.id}
              className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Ico className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{n.title}</p>
                <p className="truncate text-xs text-muted-foreground">{n.description}</p>
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
            </div>
          )
        })}
        <Button variant="ghost" className="mt-1 w-full text-primary">
          View all activity
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardContent>
    </Card>
  )
}
