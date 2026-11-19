export function getApiUrl(): string {
  const url = import.meta.env.VITE_API_URL as string | undefined
  if (!url || url.trim() === '') {
    throw new Error(
      'VITE_API_URL is not set. Copy apps/web/.env.example to apps/web/.env.',
    )
  }
  return url.replace(/\/$/, '')
}
