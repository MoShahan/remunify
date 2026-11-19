import type { ApiErrorBody, FieldErrorDetail } from './types'

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: unknown

  constructor(
    status: number,
    code: string,
    message: string,
    details: unknown = null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isFieldErrorDetails(
  details: unknown,
): details is FieldErrorDetail[] {
  return (
    Array.isArray(details) &&
    details.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'path' in item &&
        'message' in item &&
        typeof (item as FieldErrorDetail).path === 'string' &&
        typeof (item as FieldErrorDetail).message === 'string',
    )
  )
}

/** Map API `details` paths like `body.amount` or `amount` to form field keys. */
export function fieldErrorsFromDetails(
  details: unknown,
): Record<string, string> {
  if (!isFieldErrorDetails(details)) {
    return {}
  }

  const result: Record<string, string> = {}
  for (const item of details) {
    const parts = item.path.split('.').filter(Boolean)
    const key =
      parts[0] === 'body' || parts[0] === 'query' || parts[0] === 'params'
        ? (parts[1] ?? parts[0])
        : (parts[0] ?? item.path)
    if (key && !result[key]) {
      result[key] = item.message
    }
  }
  return result
}

export async function parseApiError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody | undefined
  try {
    body = (await response.json()) as ApiErrorBody
  } catch {
    // Non-JSON error bodies fall through to the generic message below.
  }

  const message =
    body?.error?.message ??
    `Request failed with status ${response.status}. Please try again.`
  const code = body?.error?.code ?? 'UNKNOWN'
  const details = body?.error?.details ?? null

  return new ApiError(response.status, code, message, details)
}
