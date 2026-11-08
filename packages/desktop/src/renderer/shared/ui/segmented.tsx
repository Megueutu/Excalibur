import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type Option<T extends string> = { value: T; label: string; icon?: ReactNode }

/** A pill-shaped single choice. Sits on a `panel` surface, so the track is `bg`. */
export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: Option<T>[]; onChange: (v: T) => void }) {
  return (
    <span className="no-drag inline-flex gap-0.5 rounded-full bg-bg p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs', o.value === value ? 'bg-panel-2 font-semibold' : 'text-muted hover:text-text')}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </span>
  )
}
