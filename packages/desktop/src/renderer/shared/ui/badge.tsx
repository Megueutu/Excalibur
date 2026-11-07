import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export function Badge({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-muted', className)} {...rest} />
}

export function StatusDot({ tone = 'warn', className }: { tone?: 'warn' | 'ok'; className?: string }) {
  return <span aria-hidden className={cn('inline-block size-1.5 rounded-full', tone === 'warn' ? 'bg-warn' : 'bg-ok', className)} />
}
