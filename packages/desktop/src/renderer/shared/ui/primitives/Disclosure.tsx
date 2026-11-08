import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/** Content that folds away. The height animates; folded content leaves the tab order and the screen reader. */
export function Disclosure({ open, children, className }: { open: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid transition-[grid-template-rows] duration-200 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]', className)} aria-hidden={!open} inert={!open}>
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}
