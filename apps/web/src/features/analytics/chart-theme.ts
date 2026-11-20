/** Shared Recharts styling for Dashboard / Analytics widgets. */

export const STATUS_COLORS = ['hsl(262 52% 36%)', 'hsl(270 14% 72%)'] as const

export const CHART_PRIMARY = 'hsl(262 52% 36%)'
export const CHART_SECONDARY = 'hsl(271 81% 56%)'
export const CHART_MUTED = 'hsl(270 14% 72%)'

export const chartTooltipContentStyle = {
  borderRadius: 8,
  border: '1px solid hsl(270 14% 88%)',
} as const

export const chartCursorFill = { fill: 'hsl(270 45% 95% / 0.7)' } as const

/** Compact axis ticks so large salary amounts stay readable in the gutter. */
export function formatAxisAmount(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}
