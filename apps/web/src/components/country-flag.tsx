import type { ComponentType } from 'react'
import * as Flags from 'country-flag-icons/react/3x2'
import { isoCodeForCountry } from '@/lib/country-flags'
import { cn } from '@/lib/utils'

type FlagProps = { className?: string; title?: string }

type CountryFlagProps = {
  country: string
  className?: string
  showName?: boolean
}

export function CountryFlag({
  country,
  className,
  showName = true,
}: CountryFlagProps) {
  const iso = isoCodeForCountry(country)
  const Flag = iso
    ? (Flags as Record<string, ComponentType<FlagProps>>)[iso]
    : undefined

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {Flag ? (
        <Flag
          className="h-3.5 w-5 shrink-0 rounded-[2px] shadow-sm"
          title={country}
        />
      ) : null}
      {showName ? <span>{country}</span> : null}
    </span>
  )
}
