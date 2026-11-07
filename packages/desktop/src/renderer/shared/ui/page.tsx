import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 px-8 pb-6 pt-8">
      <div className="min-w-0">
        <h1 className="truncate text-[28px] font-semibold leading-[1.14] tracking-[-0.02em]">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div>
    </div>
  )
}

/** A labelled block of content. The label is quiet; the content sits in a `Group` or stands alone. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8 last:mb-0">
      <h2 className="mb-2 px-1 text-xs font-semibold text-muted">{title}</h2>
      {children}
    </section>
  )
}

/** A raised, borderless group. Rows inside are separated by space, not lines. */
export function Group({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-lg bg-panel px-4 py-2', className)}>{children}</div>
}

export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-center gap-4 py-2.5 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}
