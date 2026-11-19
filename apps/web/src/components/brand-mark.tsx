import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'flex h-10 w-10 items-center justify-end gap-0.5 rounded-lg bg-primary px-2',
        className,
      )}
    >
      <span className="h-2.5 w-1 rounded-sm bg-brand-muted/80" />
      <span className="h-4 w-1 rounded-sm bg-violet-200" />
      <span className="h-6 w-1 rounded-sm bg-brand-foreground" />
    </div>
  )
}
