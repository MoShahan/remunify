import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SalaryFormDialog } from '@/features/employees/salary-form-dialog'
import { ApiError } from '@/lib/api/errors'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const createSalary = vi.hoisted(() => vi.fn())
const raiseSalary = vi.hoisted(() => vi.fn())

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    createSalary: (...args: unknown[]) => createSalary(...args),
    raiseSalary: (...args: unknown[]) => raiseSalary(...args),
  }
})

describe('SalaryFormDialog', () => {
  it('blocks raise when amount is not greater than current', async () => {
    const user = userEvent.setup()

    render(
      <SalaryFormDialog
        open
        onOpenChange={() => undefined}
        employeeId="emp_1"
        mode="raise"
        currentSalary={{
          id: 'sal_1',
          amount: '100.00',
          currency: 'USD',
          period: 'ANNUAL',
          effectiveFrom: '2024-01-01',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }}
        onSuccess={() => undefined}
      />,
    )

    await user.clear(screen.getByLabelText('Amount'))
    await user.type(screen.getByLabelText('Amount'), '100')
    await user.type(screen.getByLabelText('Effective from'), '2025-01-01')
    await user.click(screen.getByRole('button', { name: 'Save raise' }))

    expect(
      await screen.findByText(/greater than the current salary/i),
    ).toBeInTheDocument()
    expect(raiseSalary).not.toHaveBeenCalled()
  })

  it('maps API field details to helper text', async () => {
    const user = userEvent.setup()
    raiseSalary.mockRejectedValue(
      new ApiError(400, 'BAD_REQUEST', 'Validation failed for body.', [
        { path: 'body.amount', message: 'Amount must be greater than 0' },
      ]),
    )

    render(
      <SalaryFormDialog
        open
        onOpenChange={() => undefined}
        employeeId="emp_1"
        mode="raise"
        currentSalary={{
          id: 'sal_1',
          amount: '100.00',
          currency: 'USD',
          period: 'ANNUAL',
          effectiveFrom: '2024-01-01',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }}
        onSuccess={() => undefined}
      />,
    )

    await user.clear(screen.getByLabelText('Amount'))
    await user.type(screen.getByLabelText('Amount'), '200')
    await user.type(screen.getByLabelText('Effective from'), '2025-01-01')
    await user.click(screen.getByRole('button', { name: 'Save raise' }))

    expect(
      await screen.findByText('Amount must be greater than 0'),
    ).toBeInTheDocument()
  })
})
