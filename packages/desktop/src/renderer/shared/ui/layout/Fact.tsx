import type { ReactNode } from 'react'

/** One label and value pair inside a Group. */
export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[var(--fact-label-width)_1fr] items-center gap-4 py-3 text-body">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}
