import { describe, expect, it } from 'vitest'
import {
  listEmployeesQuerySchema,
  updateEmployeeBodySchema,
} from './employees.schemas.js'

describe('listEmployeesQuerySchema', () => {
  it('applies defaults for pagination and sorting', () => {
    const parsed = listEmployeesQuerySchema.parse({})

    expect(parsed.page).toBe(1)
    expect(parsed.pageSize).toBe(20)
    expect(parsed.sortBy).toBe('fullName')
    expect(parsed.sortOrder).toBe('asc')
  })

  it('rejects invalid page sizes', () => {
    const result = listEmployeesQuerySchema.safeParse({ pageSize: '0' })
    expect(result.success).toBe(false)
  })

  it('accepts filters and search', () => {
    const parsed = listEmployeesQuerySchema.parse({
      search: 'Aisha',
      country: 'India',
      department: 'Engineering',
      status: 'ACTIVE',
      sortBy: 'employeeNumber',
      sortOrder: 'desc',
    })

    expect(parsed.search).toBe('Aisha')
    expect(parsed.country).toBe('India')
    expect(parsed.status).toBe('ACTIVE')
    expect(parsed.sortBy).toBe('employeeNumber')
  })
})

describe('updateEmployeeBodySchema', () => {
  it('accepts ACTIVE or INACTIVE', () => {
    expect(updateEmployeeBodySchema.parse({ status: 'ACTIVE' }).status).toBe(
      'ACTIVE',
    )
    expect(updateEmployeeBodySchema.parse({ status: 'INACTIVE' }).status).toBe(
      'INACTIVE',
    )
  })

  it('rejects unknown status', () => {
    expect(
      updateEmployeeBodySchema.safeParse({ status: 'PENDING' }).success,
    ).toBe(false)
  })
})
