import { z } from 'zod'

export const loginBodySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'email is required')
    .email('email must be a valid email address'),
  password: z.string().min(1, 'password is required'),
})

export type LoginBody = z.infer<typeof loginBodySchema>
