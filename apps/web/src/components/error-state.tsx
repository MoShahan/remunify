import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isApiError } from '@/lib/api/errors'

type ErrorStateProps = {
  error: unknown
  onRetry?: () => void
  className?: string
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const message = isApiError(error)
    ? error.message
    : error instanceof Error
      ? error.message
      : 'Something went wrong. Please try again.'

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-card px-6 py-8',
        className,
      )}
    >
      <h2 className="font-display text-lg font-semibold text-foreground">
        Unable to load
      </h2>
      <p className="max-w-xl text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}
