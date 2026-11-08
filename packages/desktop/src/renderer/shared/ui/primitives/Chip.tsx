import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type Options = { size?: 'sm' | 'md'; muted?: boolean }

/** The look of a chip, for places that need it on a link instead of a button. */
export function chipStyles({ size = 'sm', muted = false }: Options = {}) {
  return cn(
    'no-drag inline-flex shrink-0 items-center gap-2 rounded-full bg-field font-semibold transition-[background-color,opacity,color] duration-150 hover:bg-hover',
    size === 'sm' ? 'h-control-sm px-3 text-caption' : 'h-control px-4 text-body',
    muted ? 'text-muted opacity-60' : 'text-ink',
  )
}

/** A small pill you can click: a filter, a link to another file. Same height as every control. */
export function Chip({ size, muted, className, type = 'button', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & Options) {
  return <button type={type} className={cn(chipStyles({ size, muted }), className)} {...rest} />
}
