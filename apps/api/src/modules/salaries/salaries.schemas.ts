import { z } from 'zod'

export const payPeriodSchema = z.enum(['ANNUAL', 'MONTHLY'])

export const employeeIdParamsSchema = z.object({
  employeeId: z.string().min(1),
})

export const salaryBodySchema = z.object({
  amount: z
    .union([z.string(), z.number()])
    .transform((value) => String(value))
    .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), {
      message: 'amount must be a decimal with up to 2 fractional digits',
    })
    .refine((value) => Number(value) > 0, {
      message: 'amount must be greater than 0',
    }),
  currency: z
    .string()
    .trim()
    .length(3)
    .regex(/^[A-Za-z]{3}$/, 'currency must be a 3-letter ISO code')
    .transform((value) => value.toUpperCase()),
  period: payPeriodSchema.default('ANNUAL'),
  effectiveFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'effectiveFrom must be YYYY-MM-DD')
    .transform((value) => new Date(`${value}T00:00:00.000Z`)),
})

export type EmployeeIdParams = z.infer<typeof employeeIdParamsSchema>
export type SalaryBody = z.infer<typeof salaryBodySchema>
