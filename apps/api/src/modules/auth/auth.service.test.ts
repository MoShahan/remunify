import { beforeEach, describe, expect, it, vi } from 'vitest'
import { hashPassword } from '../../lib/password.js'

const { userFindUniqueMock } = vi.hoisted(() => ({
  userFindUniqueMock: vi.fn(),
}))

vi.mock('../../db/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: userFindUniqueMock,
    },
  },
}))

import { AppError } from '../../lib/errors.js'
import { login } from './auth.service.js'

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret-for-auth-service'
  })

  it('returns a token for valid credentials', async () => {
    userFindUniqueMock.mockResolvedValue({
      id: 'user_hr_001',
      email: 'hr@remunify.com',
      role: 'HR',
      passwordHash: hashPassword('HR@123'),
    })

    const result = await login({
      email: 'hr@remunify.com',
      password: 'HR@123',
    })

    expect(result.user.email).toBe('hr@remunify.com')
    expect(result.token.length).toBeGreaterThan(20)
  })

  it('rejects invalid credentials with a clear message', async () => {
    userFindUniqueMock.mockResolvedValue(null)

    await expect(
      login({ email: 'hr@remunify.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(AppError)

    await expect(
      login({ email: 'hr@remunify.com', password: 'wrong' }),
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'UNAUTHORIZED',
      message:
        'Invalid email or password. Check your credentials and try again.',
    })
  })
})
