import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  employeeFindUniqueMock,
  salaryFindUniqueMock,
  salaryCreateMock,
  salaryUpdateMock,
} = vi.hoisted(() => ({
  employeeFindUniqueMock: vi.fn(),
  salaryFindUniqueMock: vi.fn(),
  salaryCreateMock: vi.fn(),
  salaryUpdateMock: vi.fn(),
}))

vi.mock('../../db/prisma.js', () => ({
  prisma: {
    employee: {
      findUnique: employeeFindUniqueMock,
    },
    salary: {
      findUnique: salaryFindUniqueMock,
      create: salaryCreateMock,
      update: salaryUpdateMock,
    },
  },
}))

import { AppError } from '../../lib/errors.js'
import {
  createSalaryForEmployee,
  getSalaryForEmployee,
  updateSalaryForEmployee,
} from './salaries.service.js'

const salaryRecord = {
  id: 'sal_00001',
  employeeId: 'emp_00001',
  amount: { toFixed: () => '90000.00' },
  currency: 'USD',
  period: 'ANNUAL',
  effectiveFrom: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-02T00:00:00.000Z'),
}

describe('salaries.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    employeeFindUniqueMock.mockResolvedValue({ id: 'emp_00001' })
  })

  it('returns current salary for an employee', async () => {
    salaryFindUniqueMock.mockResolvedValue(salaryRecord)

    const result = await getSalaryForEmployee('emp_00001')

    expect(result.currency).toBe('USD')
    expect(result.amount).toBe('90000.00')
  })

  it('creates a salary when none exists', async () => {
    salaryFindUniqueMock.mockResolvedValue(null)
    salaryCreateMock.mockResolvedValue(salaryRecord)

    const result = await createSalaryForEmployee('emp_00001', {
      amount: '90000.00',
      currency: 'USD',
      period: 'ANNUAL',
      effectiveFrom: new Date('2024-01-01T00:00:00.000Z'),
    })

    expect(salaryCreateMock).toHaveBeenCalledOnce()
    expect(result.id).toBe('sal_00001')
  })

  it('rejects create when salary already exists', async () => {
    salaryFindUniqueMock.mockResolvedValue({ id: 'sal_00001' })

    await expect(
      createSalaryForEmployee('emp_00001', {
        amount: '90000.00',
        currency: 'USD',
        period: 'ANNUAL',
        effectiveFrom: new Date('2024-01-01T00:00:00.000Z'),
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'CONFLICT',
    })
  })

  it('updates an existing salary', async () => {
    salaryFindUniqueMock.mockResolvedValue({ id: 'sal_00001' })
    salaryUpdateMock.mockResolvedValue({
      ...salaryRecord,
      amount: { toFixed: () => '95000.00' },
    })

    const result = await updateSalaryForEmployee('emp_00001', {
      amount: '95000.00',
      currency: 'USD',
      period: 'ANNUAL',
      effectiveFrom: new Date('2024-06-01T00:00:00.000Z'),
    })

    expect(result.amount).toBe('95000.00')
  })

  it('throws when employee is missing', async () => {
    employeeFindUniqueMock.mockResolvedValue(null)

    await expect(getSalaryForEmployee('missing')).rejects.toBeInstanceOf(
      AppError,
    )
  })
})
