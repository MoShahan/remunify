import { prisma } from '../../db/prisma.js'
import { signAuthToken } from '../../lib/jwt.js'
import { unauthorized } from '../../lib/errors.js'
import { verifyPassword } from '../../lib/password.js'
import type { LoginBody } from './auth.schemas.js'

export async function login(body: LoginBody) {
  const user = await prisma.user.findUnique({
    where: { email: body.email },
    select: {
      id: true,
      email: true,
      role: true,
      passwordHash: true,
    },
  })

  if (!user || !verifyPassword(body.password, user.passwordHash)) {
    throw unauthorized(
      'Invalid email or password. Check your credentials and try again.',
    )
  }

  const token = await signAuthToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  }
}
