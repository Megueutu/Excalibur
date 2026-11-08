import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/** The scrolling area under a PageHeader. Content text is selectable here. */
export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('min-h-0 flex-1 select-text overflow-auto px-gutter pb-gutter', className)}>{children}</div>
}
