import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/logo-mark.svg"
      alt=""
      aria-hidden
      className={cn('h-10 w-10 rounded-lg', className)}
      width={40}
      height={40}
    />
  )
}
