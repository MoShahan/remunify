import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiJson = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({ apiJson }))

import { loginRequest } from './auth'

describe('loginRequest', () => {
  beforeEach(() => {
    apiJson.mockReset()
  })

  it('posts credentials with skipAuth flags', async () => {
    apiJson.mockResolvedValue({
      data: {
        token: 't',
        user: { id: '1', email: 'hr@remunify.com', role: 'HR' },
      },
    })

    await expect(
      loginRequest('hr@remunify.com', 'HR@123'),
    ).resolves.toMatchObject({
      data: { token: 't' },
    })

    expect(apiJson).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'hr@remunify.com',
        password: 'HR@123',
      }),
      skipAuth: true,
      skipUnauthorizedRedirect: true,
    })
  })
})
