import { cn } from '@/shared/lib/cn'

/** A state in one color: warn needs attention, ok is fine. Never a large area. */
export function StatusDot({ tone = 'warn', className }: { tone?: 'warn' | 'ok'; className?: string }) {
  return <span aria-hidden className={cn('inline-block size-1.5 shrink-0 rounded-full', tone === 'warn' ? 'bg-warn' : 'bg-ok', className)} />
}
