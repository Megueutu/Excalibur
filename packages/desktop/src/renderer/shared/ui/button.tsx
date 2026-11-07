import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md'
}

const variants = {
  primary: 'bg-text text-bg hover:bg-text/90',
  outline: 'border border-border bg-transparent hover:bg-panel-2',
  ghost: 'bg-transparent hover:bg-panel-2',
}

export function Button({ variant = 'outline', size = 'md', className, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={cn(
        'no-drag inline-flex items-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
        variants[variant],
        className,
      )}
      {...rest}
    />
  )
}
