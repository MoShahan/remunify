import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  employeeFindUniqueMock,
  salaryFindFirstMock,
  salaryFindManyMock,
  salaryCreateMock,
} = vi.hoisted(() => ({
  employeeFindUniqueMock: vi.fn(),
  salaryFindFirstMock: vi.fn(),
  salaryFindManyMock: vi.fn(),
  salaryCreateMock: vi.fn(),
}))

vi.mock('../../db/prisma.js', () => ({
  prisma: {
    employee: {
      findUnique: employeeFindUniqueMock,
    },
    salary: {
      findFirst: salaryFindFirstMock,
      findMany: salaryFindManyMock,
      create: salaryCreateMock,
    },
  },
}))

import { AppError } from '../../lib/errors.js'
import {
  createSalaryForEmployee,
  getSalaryForEmployee,
  listSalaryHistoryForEmployee,
  updateSalaryForEmployee,
} from './salaries.service.js'

const salaryRecord = {
  id: 'sal_00001',
  employeeId: 'emp_00001',
  amount: { toFixed: () => '90000.00' },
  currency: 'USD',
  period: 'ANNUAL',
  effectiveFrom: new Date('2024-01-01T00:00:00.000Z'),
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-02T00:00:00.000Z'),
}

describe('salaries.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    employeeFindUniqueMock.mockResolvedValue({ id: 'emp_00001' })
  })

  it('returns current salary for an employee', async () => {
    salaryFindFirstMock.mockResolvedValue(salaryRecord)

    const result = await getSalaryForEmployee('emp_00001')

    expect(result.currency).toBe('USD')
    expect(result.amount).toBe('90000.00')
  })

  it('lists salary history newest first', async () => {
    salaryFindManyMock.mockResolvedValue([
      {
        ...salaryRecord,
        id: 'sal_00002',
        amount: { toFixed: () => '95000.00' },
        effectiveFrom: new Date('2025-01-01T00:00:00.000Z'),
      },
      salaryRecord,
    ])

    const result = await listSalaryHistoryForEmployee('emp_00001')
    expect(result).toHaveLength(2)
    expect(result[0]?.amount).toBe('95000.00')
  })

  it('creates a salary when none exists', async () => {
    salaryFindFirstMock.mockResolvedValue(null)
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
    salaryFindFirstMock.mockResolvedValue({ id: 'sal_00001' })

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

  it('raises by inserting a new current salary row', async () => {
    salaryFindFirstMock.mockResolvedValue(salaryRecord)
    salaryCreateMock.mockResolvedValue({
      ...salaryRecord,
      id: 'sal_00002',
      amount: { toFixed: () => '95000.00' },
      effectiveFrom: new Date('2024-06-01T00:00:00.000Z'),
    })

    const result = await updateSalaryForEmployee('emp_00001', {
      amount: '95000.00',
      currency: 'USD',
      period: 'ANNUAL',
      effectiveFrom: new Date('2024-06-01T00:00:00.000Z'),
    })

    expect(salaryCreateMock).toHaveBeenCalledOnce()
    expect(result.amount).toBe('95000.00')
  })

  it('rejects raise when effectiveFrom is not after current', async () => {
    salaryFindFirstMock.mockResolvedValue(salaryRecord)

    await expect(
      updateSalaryForEmployee('emp_00001', {
        amount: '95000.00',
        currency: 'USD',
        period: 'ANNUAL',
        effectiveFrom: new Date('2024-01-01T00:00:00.000Z'),
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'BAD_REQUEST',
    })
  })

  it('throws when employee is missing', async () => {
    employeeFindUniqueMock.mockResolvedValue(null)

    await expect(getSalaryForEmployee('missing')).rejects.toBeInstanceOf(
      AppError,
    )
  })
})
