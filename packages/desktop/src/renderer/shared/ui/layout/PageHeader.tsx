import type { ReactNode } from 'react'

/** The top of every page: one display title, a quiet subtitle, and the page's actions. */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 p-gutter pb-8">
      <div className="min-w-0">
        <h1 className="truncate text-display">{title}</h1>
        {subtitle ? <p className="mt-2 text-body text-muted">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div>
    </div>
  )
}
