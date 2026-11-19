import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('space-y-6 animate-in fade-in-0 duration-300', className)}
    >
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </div>
      <CardSkeleton className="h-64" />
    </div>
  )
}

export function KpiSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/80 bg-card/80 p-5',
        className,
      )}
    >
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-4 h-8 w-24" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  )
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/80 bg-card/80 p-6',
        className,
      )}
    >
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-4 h-full min-h-32 w-full" />
    </div>
  )
}

export function DataTableSkeleton({
  rows = 8,
  columns = 6,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border/80 bg-card/90',
        className,
      )}
    >
      <div className="flex gap-3 border-b border-border/70 bg-muted/30 px-3 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border/60">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex gap-3 px-3 py-3.5">
            {Array.from({ length: columns }).map((_, col) => (
              <Skeleton
                key={col}
                className={cn('h-4 flex-1', col === 0 && 'max-w-[10rem]')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function TimelineSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="mt-1 h-3 w-3 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      ))}
    </div>
  )
}
