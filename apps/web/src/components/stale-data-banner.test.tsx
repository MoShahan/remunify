import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/errors'
import { StaleDataBanner } from '@/components/stale-data-banner'

describe('StaleDataBanner', () => {
  it('shows ApiError message and retries', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(
      <StaleDataBanner
        error={new ApiError(503, 'UNAVAILABLE', 'Refresh failed')}
        onRetry={onRetry}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Refresh failed')
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('maps network TypeError to refresh copy', () => {
    render(
      <StaleDataBanner
        error={new TypeError('Failed to fetch')}
        onRetry={() => {}}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      "Couldn't refresh - showing last loaded data.",
    )
  })

  it('maps failed-to-fetch Error messages', () => {
    render(
      <StaleDataBanner
        error={new Error('Failed to fetch resource')}
        onRetry={() => {}}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      "Couldn't refresh - showing last loaded data.",
    )
  })

  it('uses generic Error message when present', () => {
    render(
      <StaleDataBanner error={new Error('Custom stale')} onRetry={() => {}} />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Custom stale')
  })
})
