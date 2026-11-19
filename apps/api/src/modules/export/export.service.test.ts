import { describe, expect, it } from 'vitest'
import { buildSampleCsv } from './export.service.js'
import { escapeCsvValue } from './csv.js'

describe('export helpers', () => {
  it('escapes CSV values that contain commas or quotes', () => {
    expect(escapeCsvValue('a,b')).toBe('"a,b"')
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""')
  })

  it('builds a CSV snapshot with headers and one employee row', () => {
    const csv = buildSampleCsv({
      employeeNumber: 'E00001',
      fullName: 'Aisha Shah',
      email: 'e00001@employees.remunify.local',
      joinedAt: new Date('2022-01-01T00:00:00.000Z'),
      country: 'India',
      department: 'Engineering',
      designation: 'Manager',
      status: 'ACTIVE',
      amount: '600000.00',
      currency: 'INR',
      period: 'ANNUAL',
      effectiveFrom: new Date('2024-01-01T00:00:00.000Z'),
    })

    expect(csv.split('\n')[0]).toContain('employeeNumber')
    expect(csv).toContain('E00001')
    expect(csv).toContain('600000.00')
  })
})
