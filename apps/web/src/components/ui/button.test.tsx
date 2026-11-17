import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Save salary</Button>)
    expect(
      screen.getByRole('button', { name: 'Save salary' }),
    ).toBeInTheDocument()
  })

  it('fires click handlers', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <Button type="button" onClick={onClick}>
        Click me
      </Button>,
    )

    await user.click(screen.getByRole('button', { name: 'Click me' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('can be disabled', () => {
    render(
      <Button type="button" disabled>
        Disabled
      </Button>,
    )

    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled()
  })
})
