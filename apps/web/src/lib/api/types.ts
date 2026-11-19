export type EmploymentStatus = 'ACTIVE' | 'INACTIVE'
export type PayPeriod = 'ANNUAL'
export type UserRole = 'HR'

export type ApiErrorBody = {
  error: {
    code: string
    message: string
    details: unknown
  }
}

export type FieldErrorDetail = {
  path: string
  message: string
}

export type AuthUser = {
  id: string
  email: string
  role: UserRole
}

export type LoginResponse = {
  data: {
    token: string
    user: AuthUser
  }
}

export type Salary = {
  id: string
  employeeId?: string
  amount: string
  currency: string
  period: PayPeriod
  effectiveFrom: string
  createdAt: string
  updatedAt: string
}

export type EmployeeListItem = {
  id: string
  employeeNumber: string
  fullName: string
  email: string
  joinedAt: string
  country: string
  department: string
  designation: string
  status: EmploymentStatus
  createdAt: string
  updatedAt: string
  salary: Salary | null
}

export type EmployeeDetail = EmployeeListItem & {
  salaryHistory: Salary[]
}

export type Pagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type ListEmployeesResponse = {
  data: EmployeeListItem[]
  pagination: Pagination
}

export type EmployeeListParams = {
  page?: number
  pageSize?: number
  search?: string
  country?: string
  department?: string
  designation?: string
  status?: EmploymentStatus
  sortBy?:
    | 'fullName'
    | 'employeeNumber'
    | 'country'
    | 'department'
    | 'designation'
    | 'status'
    | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export type CurrencyAgg = {
  currency: string
  employeeCount: number
  totalAmount: string
  averageAmount: string
  medianAmount: string
}

export type DimensionAgg = {
  country?: string
  department?: string
  currency: string
  employeeCount: number
  totalAmount: string
}

export type AnalyticsSummary = {
  headcount: {
    total: number
    active: number
    inactive: number
  }
  byCurrency: CurrencyAgg[]
  byCountry: Array<{
    country: string
    currency: string
    employeeCount: number
    totalAmount: string
  }>
  byDepartment: Array<{
    department: string
    currency: string
    employeeCount: number
    totalAmount: string
  }>
  companyWideUsd: {
    totalAmountUsd: string
    employeeCount: number
    ratesAsOf: string | null
    label: string
  }
}

export type AnalyticsSummaryResponse = {
  data: AnalyticsSummary
}

export type SalaryInput = {
  amount: string
  currency: string
  period?: PayPeriod
  effectiveFrom: string
}
