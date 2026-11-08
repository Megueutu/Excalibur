import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

/** A small chip of metadata (a branch, a stack, "hub"). It takes the tone for its surface, like a button, and is one height everywhere. */
export function Badge({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex h-chip shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-field px-2.5 text-caption text-muted', className)} {...rest} />
}
