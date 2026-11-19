import { cn } from '@/lib/utils'

type MoneyTextProps = {
  amount: string | null | undefined
  currency?: string | null
  className?: string
}

export function MoneyText({ amount, currency, className }: MoneyTextProps) {
  if (amount == null || amount === '') {
    return <span className={cn('text-muted-foreground', className)}>-</span>
  }

  return (
    <span className={cn('tabular-nums tracking-tight', className)}>
      {amount}
      {currency ? (
        <span className="ml-1.5 text-muted-foreground">{currency}</span>
      ) : null}
    </span>
  )
}
