import { Button } from '@/components/ui/button'
import { isApiError } from '@/lib/api'

type StaleDataBannerProps = {
  error: unknown
  onRetry: () => void
}

function messageFor(error: unknown): string {
  if (isApiError(error)) return error.message
  if (error instanceof TypeError) {
    return "Couldn't refresh - showing last loaded data."
  }
  if (error instanceof Error && error.message) {
    if (/failed to fetch/i.test(error.message)) {
      return "Couldn't refresh - showing last loaded data."
    }
    return error.message
  }
  return "Couldn't refresh - showing last loaded data."
}

export function StaleDataBanner({ error, onRetry }: StaleDataBannerProps) {
  return (
    <div
      role="status"
      className="mb-4 flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between"
    >
      <p>{messageFor(error)}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
