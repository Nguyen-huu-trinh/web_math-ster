import { Icon } from '@/components/icon'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number
  suffix?: string
  total?: number
  icon: string
  trend?: string
  index?: number
}

export function StatCard({ label, value, suffix, total, icon, trend, index = 0 }: StatCardProps) {
  const pct = total ? Math.min(100, Math.round((value / total) * 100)) : null
  return (
    <Card
      className="animate-fade-in-up transition-shadow hover:shadow-md"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Icon name={icon} className="size-5" />
          </span>
          {trend && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {trend}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
            {value}
            {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
          </p>
        </div>
        {pct !== null && (
          <div className="flex flex-col gap-1.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full rounded-full bg-primary transition-all')}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {value}
              {suffix ?? ''} of {total}
              {suffix ?? ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
