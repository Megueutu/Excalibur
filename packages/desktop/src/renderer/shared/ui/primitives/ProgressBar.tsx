import { cn } from '@/shared/lib/cn'

const tones = { primary: 'bg-primary', ok: 'bg-ok', muted: 'bg-muted' }

/** A thin bar for progress. `value` is between 0 and 1. */
export function ProgressBar({ value, tone = 'primary', className }: { value: number; tone?: keyof typeof tones; className?: string }) {
  return (
    <div role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100} className={cn('h-1.5 overflow-hidden rounded-full bg-selected', className)}>
      <div className={cn('h-full rounded-full transition-[width] duration-300', tones[tone])} style={{ width: `${Math.min(1, Math.max(0, value)) * 100}%` }} />
    </div>
  )
}
