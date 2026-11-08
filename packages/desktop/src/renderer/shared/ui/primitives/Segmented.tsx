import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type Option<T extends string> = { value: T; label: string; icon?: ReactNode }

/** A pill-shaped single choice. The track takes the tone for its surface; the same height as a small button. */
export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: Option<T>[]; onChange: (v: T) => void }) {
  return (
    <span role="group" className="no-drag inline-flex h-control-sm shrink-0 gap-0.5 rounded-full bg-field p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex h-full items-center gap-1.5 rounded-full px-3 text-caption font-semibold transition-colors duration-150',
            o.value === value ? 'bg-selected text-ink' : 'text-muted hover:text-ink',
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </span>
  )
}
