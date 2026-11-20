import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiJson = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({ apiJson }))

import {
  createSalary,
  getEmployee,
  getEmployeeFacets,
  listEmployees,
  raiseSalary,
  updateEmployeeStatus,
} from './employees'

describe('employees API helpers', () => {
  beforeEach(() => {
    apiJson.mockReset()
    apiJson.mockResolvedValue({ data: {} })
  })

  it('lists employees with query params', async () => {
    await listEmployees({
      search: 'aisha',
      page: 2,
      pageSize: 25,
      status: 'ACTIVE',
    })
    expect(apiJson).toHaveBeenCalledWith(
      '/api/employees?search=aisha&page=2&pageSize=25&status=ACTIVE',
    )
  })

  it('omits empty query params', async () => {
    await listEmployees({ search: '', country: undefined })
    expect(apiJson).toHaveBeenCalledWith('/api/employees')
  })

  it('fetches facets, detail, status update, and salary mutations', async () => {
    await getEmployeeFacets()
    await getEmployee('emp_1')
    await updateEmployeeStatus('emp_1', 'INACTIVE')
    await createSalary('emp_1', {
      amount: '100.00',
      currency: 'USD',
      effectiveFrom: '2024-01-01',
    })
    await raiseSalary('emp_1', {
      amount: '120.00',
      currency: 'USD',
      effectiveFrom: '2025-01-01',
    })

    expect(apiJson).toHaveBeenNthCalledWith(1, '/api/employees/facets')
    expect(apiJson).toHaveBeenNthCalledWith(2, '/api/employees/emp_1')
    expect(apiJson).toHaveBeenNthCalledWith(3, '/api/employees/emp_1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'INACTIVE' }),
    })
    expect(apiJson).toHaveBeenNthCalledWith(4, '/api/employees/emp_1/salary', {
      method: 'POST',
      body: JSON.stringify({
        amount: '100.00',
        currency: 'USD',
        effectiveFrom: '2024-01-01',
      }),
    })
    expect(apiJson).toHaveBeenNthCalledWith(5, '/api/employees/emp_1/salary', {
      method: 'PATCH',
      body: JSON.stringify({
        amount: '120.00',
        currency: 'USD',
        effectiveFrom: '2025-01-01',
      }),
    })
  })
})
