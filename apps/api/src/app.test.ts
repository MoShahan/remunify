import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { hashPassword } from './lib/password.js'
import { signAuthToken } from './lib/jwt.js'

const { userFindUniqueMock } = vi.hoisted(() => ({
  userFindUniqueMock: vi.fn(),
}))

vi.mock('./db/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: userFindUniqueMock,
    },
    employee: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { createApp } from './app.js'

describe('createApp', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret-for-app'
  })

  it('returns health status without auth', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      status: 'ok',
      service: 'remunify-api',
    })
  })

  it('rejects protected routes without a bearer token', async () => {
    const response = await request(app).get('/api/employees')

    expect(response.status).toBe(401)
    expect(response.body.error.message).toContain('Authorization header')
  })

  it('logs in and allows access with a bearer token', async () => {
    userFindUniqueMock.mockResolvedValue({
      id: 'user_hr_001',
      email: 'hr@remunify.com',
      role: 'HR',
      passwordHash: hashPassword('HR@123'),
    })

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'hr@remunify.com',
      password: 'HR@123',
    })

    expect(loginResponse.status).toBe(200)
    expect(loginResponse.body.data.token).toBeTruthy()

    const token = await signAuthToken({
      sub: 'user_hr_001',
      email: 'hr@remunify.com',
      role: 'HR',
    })

    const { prisma } = await import('./db/prisma.js')
    vi.mocked(prisma.$transaction).mockResolvedValue([
      0,
      [],
    ] as unknown as never)
    vi.mocked(prisma.employee.count).mockResolvedValue(0)
    vi.mocked(prisma.employee.findMany).mockResolvedValue([])

    const response = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.pagination.total).toBe(0)
  })
})
