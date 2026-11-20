import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CardFooter } from '@/components/ui/card'
import { previewRangeLabel } from '@/features/analytics/rollup-table-model'

export function RollupPreviewFooter({
  to,
  total,
}: {
  to: string
  total: number
}) {
  return (
    <CardFooter className="justify-between gap-3 border-t border-border/70 bg-muted/25 px-6 py-3">
      <p className="text-sm text-muted-foreground">
        {previewRangeLabel(total)}
      </p>
      <Link
        to={to}
        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        View full table
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </CardFooter>
  )
}
