import { SignJWT, jwtVerify, errors as joseErrors } from 'jose'
import { unauthorized } from './errors.js'

export type AuthTokenPayload = {
  sub: string
  email: string
  role: string
}

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ??
    (process.env.NODE_ENV === 'production'
      ? ''
      : 'remunify-dev-jwt-secret-change-me')

  if (!secret) {
    throw new Error(
      'JWT_SECRET is required. Set it in apps/api/.env before starting the API.',
    )
  }

  return new TextEncoder().encode(secret)
}

function getExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN ?? '8h'
}

export async function signAuthToken(
  payload: AuthTokenPayload,
): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(getExpiresIn())
    .sign(getJwtSecret())
}

export async function verifyAuthToken(
  token: string,
): Promise<AuthTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    const sub = payload.sub
    const email = payload.email
    const role = payload.role

    if (
      typeof sub !== 'string' ||
      typeof email !== 'string' ||
      typeof role !== 'string'
    ) {
      throw unauthorized(
        'Authentication token is missing required claims (sub, email, role). Sign in again.',
      )
    }

    return { sub, email, role }
  } catch (error) {
    if (error instanceof joseErrors.JWTExpired) {
      throw unauthorized(
        'Authentication token has expired. Sign in again to get a new token.',
      )
    }
    if (error instanceof joseErrors.JOSEError) {
      throw unauthorized(
        'Authentication token is invalid. Sign in again to get a new token.',
      )
    }
    throw error
  }
}
