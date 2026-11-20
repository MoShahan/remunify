import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetch = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({ apiFetch }))

import { exportEmployeesCsv, exportEmployeesXlsx } from './export'

describe('export download helpers', () => {
  beforeEach(() => {
    apiFetch.mockReset()
    apiFetch.mockResolvedValue({
      blob: async () => new Blob(['csv'], { type: 'text/csv' }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('downloads CSV via a temporary anchor', async () => {
    const click = vi.fn()
    const remove = vi.fn()
    const createObjectURL = vi.fn(() => 'blob:csv')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

    const createElement = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click,
      remove,
    } as unknown as HTMLAnchorElement)
    const appendChild = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((node) => node)

    await exportEmployeesCsv()

    expect(apiFetch).toHaveBeenCalledWith('/api/export/employees.csv', {
      headers: { Accept: '*/*' },
    })
    expect(createObjectURL).toHaveBeenCalled()
    expect(click).toHaveBeenCalled()
    expect(remove).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:csv')

    createElement.mockRestore()
    appendChild.mockRestore()
  })

  it('downloads XLSX via a temporary anchor', async () => {
    const click = vi.fn()
    const remove = vi.fn()
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:xlsx'),
      revokeObjectURL: vi.fn(),
    })
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click,
      remove,
    } as unknown as HTMLAnchorElement)
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)

    await exportEmployeesXlsx()

    expect(apiFetch).toHaveBeenCalledWith('/api/export/employees.xlsx', {
      headers: { Accept: '*/*' },
    })
    expect(click).toHaveBeenCalled()
  })
})
