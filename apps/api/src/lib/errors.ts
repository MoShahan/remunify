export class AppError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly details?: unknown

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export function notFound(message: string) {
  return new AppError(404, 'NOT_FOUND', message)
}

export function conflict(message: string) {
  return new AppError(409, 'CONFLICT', message)
}

export function badRequest(message: string, details?: unknown) {
  return new AppError(400, 'BAD_REQUEST', message, details)
}

export function unauthorized(message: string, details?: unknown) {
  return new AppError(401, 'UNAUTHORIZED', message, details)
}

export function forbidden(message: string, details?: unknown) {
  return new AppError(403, 'FORBIDDEN', message, details)
}
