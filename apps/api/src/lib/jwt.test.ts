import { afterEach, describe, expect, it } from 'vitest'
import { SignJWT } from 'jose'
import { AppError } from './errors.js'
import { signAuthToken, verifyAuthToken } from './jwt.js'

describe('jwt helpers', () => {
  afterEach(() => {
    delete process.env.JWT_SECRET
    delete process.env.JWT_EXPIRES_IN
    delete process.env.NODE_ENV
  })

  it('signs and verifies a token', async () => {
    process.env.JWT_SECRET = 'unit-test-secret'
    const token = await signAuthToken({
      sub: 'user_1',
      email: 'hr@remunify.com',
      role: 'HR',
    })
    await expect(verifyAuthToken(token)).resolves.toEqual({
      sub: 'user_1',
      email: 'hr@remunify.com',
      role: 'HR',
    })
  })

  it('rejects invalid tokens', async () => {
    process.env.JWT_SECRET = 'unit-test-secret'
    await expect(verifyAuthToken('not-a-jwt')).rejects.toBeInstanceOf(AppError)
  })

  it('rejects expired tokens', async () => {
    process.env.JWT_SECRET = 'unit-test-secret'
    const secret = new TextEncoder().encode('unit-test-secret')
    const token = await new SignJWT({ email: 'a@b.com', role: 'HR' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('user_1')
      .setIssuedAt()
      .setExpirationTime('0s')
      .sign(secret)

    await expect(verifyAuthToken(token)).rejects.toMatchObject({
      statusCode: 401,
      message: expect.stringContaining('expired'),
    })
  })

  it('rejects tokens missing claims', async () => {
    process.env.JWT_SECRET = 'unit-test-secret'
    const secret = new TextEncoder().encode('unit-test-secret')
    const token = await new SignJWT({ email: 'a@b.com' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('user_1')
      .setExpirationTime('1h')
      .sign(secret)

    await expect(verifyAuthToken(token)).rejects.toMatchObject({
      statusCode: 401,
      message: expect.stringContaining('required claims'),
    })
  })
})
