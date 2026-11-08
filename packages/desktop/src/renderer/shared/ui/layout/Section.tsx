import type { ReactNode } from 'react'

/** A titled block of content: one title level above the cards under it. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10 last:mb-0">
      <h2 className="mb-3 px-1 text-title">{title}</h2>
      {children}
    </section>
  )
}
