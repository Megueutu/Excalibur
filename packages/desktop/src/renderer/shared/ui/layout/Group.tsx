import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/** A raised, borderless card. Rows inside are separated by space, not lines. */
export function Group({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('surface-card rounded-lg px-4 py-2', className)}>{children}</div>
}
