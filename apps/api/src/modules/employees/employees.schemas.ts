import { z } from 'zod'

export const employmentStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])

export const employeeIdParamsSchema = z.object({
  id: z.string().min(1),
})

export const listEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  country: z.string().trim().optional(),
  department: z.string().trim().optional(),
  designation: z.string().trim().optional(),
  status: employmentStatusSchema.optional(),
  sortBy: z
    .enum([
      'fullName',
      'employeeNumber',
      'country',
      'department',
      'designation',
      'status',
      'createdAt',
    ])
    .default('fullName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>
export type EmployeeIdParams = z.infer<typeof employeeIdParamsSchema>
