import { Trophy, ArrowUp, ArrowDown, Minus, ArrowRight } from 'lucide-react'
import type { LeaderboardEntry } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const RANK_STYLES = ['bg-primary text-primary-foreground', 'bg-primary/70 text-primary-foreground', 'bg-primary/40 text-foreground']

function initials(name: string) {
  return name.split(' ').slice(-2).map((n) => n[0]).join('')
}

export function LeaderboardCard({
  title,
  entries,
}: {
  title: string
  entries: LeaderboardEntry[]
}) {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-4 text-primary" />
          {title}
        </CardTitle>
        <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          View more
          <ArrowRight className="size-3" />
        </button>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {entries.map((e) => (
          <div
            key={e.rank}
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60"
          >
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                e.rank <= 3 ? RANK_STYLES[e.rank - 1] : 'bg-muted text-muted-foreground',
              )}
            >
              {e.rank}
            </span>
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials(e.name)}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{e.name}</span>
            <span className="flex items-center text-xs text-muted-foreground">
              {e.change > 0 ? (
                <ArrowUp className="size-3 text-primary" />
              ) : e.change < 0 ? (
                <ArrowDown className="size-3 text-destructive" />
              ) : (
                <Minus className="size-3" />
              )}
              {e.change !== 0 && Math.abs(e.change)}
            </span>
            <span className="w-10 text-right text-sm font-bold tabular-nums">{e.score}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
