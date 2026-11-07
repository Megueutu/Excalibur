import type { ReactNode } from 'react'

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-7 pb-3 pt-5">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">{actions}</div>
    </div>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</h2>
      {children}
    </section>
  )
}

export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-4 border-b border-border/60 py-2 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
