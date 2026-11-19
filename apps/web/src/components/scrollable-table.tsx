import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ScrollableTableProps = {
  children: ReactNode
  className?: string
}

/** Constrains tall tables with sticky header and inner scroll. */
export function ScrollableTable({ children, className }: ScrollableTableProps) {
  return (
    <div
      className={cn(
        'max-h-80 overflow-auto rounded-md border border-border/60',
        className,
      )}
    >
      <div className="[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-card">
        {children}
      </div>
    </div>
  )
}
