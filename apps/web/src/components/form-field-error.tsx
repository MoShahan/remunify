import { cn } from '@/lib/utils'

export function FormFieldError({
  message,
  className,
}: {
  message?: string
  className?: string
}) {
  if (!message) return null
  return (
    <p
      className={cn('mt-1.5 text-xs text-destructive', className)}
      role="alert"
    >
      {message}
    </p>
  )
}
