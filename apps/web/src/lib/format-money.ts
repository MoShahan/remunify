/**
 * Display grouping only:
 * - Indian-numbering currencies → en-IN (1,00,000.00)
 * - Everything else → en-US (100,000.00)
 *
 * Avoids locales that use spaces or `.` as thousand separators (e.g. ru-RU).
 */
const INDIAN_GROUPING_CURRENCIES = new Set(['INR', 'PKR', 'BDT', 'LKR', 'NPR'])

const INDIAN_LOCALE = 'en-IN'
const WESTERN_LOCALE = 'en-US'

export function localeForCurrency(currency: string | null | undefined): string {
  if (!currency) return WESTERN_LOCALE
  return INDIAN_GROUPING_CURRENCIES.has(currency.toUpperCase())
    ? INDIAN_LOCALE
    : WESTERN_LOCALE
}

/**
 * Format a decimal amount string with comma grouping for the currency.
 * Keeps 2 fractional digits to match API salary serialization.
 */
export function formatMoneyAmount(
  amount: string,
  currency?: string | null,
): string {
  const normalized = amount.trim().replace(/,/g, '')
  const value = Number(normalized)
  if (!Number.isFinite(value)) {
    return amount
  }

  return new Intl.NumberFormat(localeForCurrency(currency), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const currencyDisplayNames = new Intl.DisplayNames(['en'], { type: 'currency' })

/** Full English currency name for tooltips, e.g. INR → "Indian Rupee". */
export function currencyDisplayName(
  currency: string | null | undefined,
): string | undefined {
  if (!currency) return undefined
  const code = currency.toUpperCase()
  try {
    return currencyDisplayNames.of(code) ?? code
  } catch {
    return code
  }
}
