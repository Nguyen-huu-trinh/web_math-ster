import { Sigma } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BrandLogo({
  className,
  showText = true,
  variant = 'default',
}: {
  className?: string
  showText?: boolean
  variant?: 'default' | 'sidebar'
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Sigma className="size-5" strokeWidth={2.5} />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              'text-lg font-bold tracking-tight',
              variant === 'sidebar' ? 'text-sidebar-foreground' : 'text-foreground',
            )}
          >
            Math<span className="text-primary">-ster</span>
          </span>
          <span
            className={cn(
              'text-[10px] font-medium uppercase tracking-widest',
              variant === 'sidebar' ? 'text-sidebar-foreground/50' : 'text-muted-foreground',
            )}
          >
            Learning Platform
          </span>
        </div>
      )}
    </div>
  )
}
