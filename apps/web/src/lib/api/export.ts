import { apiFetch } from './client'

async function downloadBlob(path: string, filename: string) {
  const response = await apiFetch(path, {
    headers: { Accept: '*/*' },
  })
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export async function exportEmployeesCsv() {
  await downloadBlob('/api/export/employees.csv', 'remunify-employees.csv')
}

export async function exportEmployeesXlsx() {
  await downloadBlob('/api/export/employees.xlsx', 'remunify-employees.xlsx')
}
