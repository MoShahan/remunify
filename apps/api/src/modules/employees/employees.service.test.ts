import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  employeeCountMock,
  employeeFindManyMock,
  employeeFindUniqueMock,
  transactionMock,
} = vi.hoisted(() => ({
  employeeCountMock: vi.fn(),
  employeeFindManyMock: vi.fn(),
  employeeFindUniqueMock: vi.fn(),
  transactionMock: vi.fn(),
}))

vi.mock('../../db/prisma.js', () => ({
  prisma: {
    employee: {
      count: employeeCountMock,
      findMany: employeeFindManyMock,
      findUnique: employeeFindUniqueMock,
    },
    $transaction: transactionMock,
  },
}))

import { AppError } from '../../lib/errors.js'
import { getEmployeeById, listEmployees } from './employees.service.js'

describe('employees.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists employees with pagination metadata', async () => {
    const row = {
      id: 'emp_00001',
      employeeNumber: 'E00001',
      fullName: 'Aisha Shah',
      country: 'India',
      department: 'Engineering',
      designation: 'Manager',
      status: 'ACTIVE',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      salary: {
        id: 'sal_00001',
        amount: { toFixed: () => '600000.00' },
        currency: 'INR',
        period: 'ANNUAL',
        effectiveFrom: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      },
    }

    employeeCountMock.mockResolvedValue(1)
    employeeFindManyMock.mockResolvedValue([row])
    transactionMock.mockImplementation(async (ops: Promise<unknown>[]) =>
      Promise.all(ops),
    )

    const result = await listEmployees({
      page: 1,
      pageSize: 20,
      sortBy: 'fullName',
      sortOrder: 'asc',
    })

    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    })
    expect(result.data[0]?.fullName).toBe('Aisha Shah')
    expect(result.data[0]?.salary?.amount).toBe('600000.00')
  })

  it('throws when employee is missing', async () => {
    employeeFindUniqueMock.mockResolvedValue(null)

    await expect(getEmployeeById('missing')).rejects.toBeInstanceOf(AppError)
    await expect(getEmployeeById('missing')).rejects.toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  })
})
