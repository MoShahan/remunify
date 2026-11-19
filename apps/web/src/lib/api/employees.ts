import { apiJson } from './client'
import type {
  EmployeeDetail,
  EmployeeFacets,
  EmployeeListParams,
  EmploymentStatus,
  ListEmployeesResponse,
  Salary,
  SalaryInput,
} from './types'

function toQuery(params: EmployeeListParams): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export async function listEmployees(params: EmployeeListParams = {}) {
  return apiJson<ListEmployeesResponse>(`/api/employees${toQuery(params)}`)
}

export async function getEmployeeFacets() {
  return apiJson<{ data: EmployeeFacets }>('/api/employees/facets')
}

export async function getEmployee(id: string) {
  return apiJson<{ data: EmployeeDetail }>(`/api/employees/${id}`)
}

export async function updateEmployeeStatus(
  id: string,
  status: EmploymentStatus,
) {
  return apiJson<{ data: EmployeeDetail }>(`/api/employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function createSalary(employeeId: string, input: SalaryInput) {
  return apiJson<{ data: Salary }>(`/api/employees/${employeeId}/salary`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function raiseSalary(employeeId: string, input: SalaryInput) {
  return apiJson<{ data: Salary }>(`/api/employees/${employeeId}/salary`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params: EmployeeListParams) =>
    [...employeeKeys.lists(), params] as const,
  facets: () => [...employeeKeys.all, 'facets'] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
}
