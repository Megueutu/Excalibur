import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

const tones = {
  ok: 'bg-ok/15 text-ok',
  warn: 'bg-warn/15 text-warn',
  info: 'bg-primary/15 text-primary',
  muted: 'bg-field text-muted',
}

/** A state written out in one tone: "Em dia", "Pausada". Stronger than a Badge, which is only metadata. */
export function Pill({ tone = 'muted', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return <span className={cn('inline-flex h-chip items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-caption font-semibold', tones[tone], className)} {...rest} />
}
