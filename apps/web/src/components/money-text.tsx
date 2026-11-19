import { cn } from '@/lib/utils'
import { currencyDisplayName, formatMoneyAmount } from '@/lib/format-money'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type MoneyTextProps = {
  amount: string | null | undefined
  currency?: string | null
  className?: string
}

function CurrencyTooltip({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  const fullName = currencyDisplayName(code) ?? code

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline cursor-help border-0 bg-transparent p-0 font-inherit text-inherit',
              'rounded-sm border-b border-dotted border-muted-foreground/45 transition-colors',
              'hover:border-primary hover:text-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              className,
            )}
            aria-label={`${code}: ${fullName}`}
          >
            {code}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/70">
              {code}
            </span>
            <span className="text-sm font-semibold leading-none">
              {fullName}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function MoneyText({ amount, currency, className }: MoneyTextProps) {
  if (amount == null || amount === '') {
    return <span className={cn('text-muted-foreground', className)}>-</span>
  }

  return (
    <span
      className={cn(
        'inline-flex items-baseline tabular-nums tracking-tight',
        className,
      )}
    >
      {formatMoneyAmount(amount, currency)}
      {currency ? (
        <CurrencyTooltip
          code={currency}
          className="ml-1.5 text-muted-foreground"
        />
      ) : null}
    </span>
  )
}

/** ISO currency code with a styled hover tooltip for the full name. */
export function CurrencyCode({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  return <CurrencyTooltip code={code} className={className} />
}
