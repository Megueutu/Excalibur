import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** primary: the one main action. secondary: takes the tone for its surface (bg-field). ghost: no fill until hovered. */
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
}

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-pressed disabled:bg-selected disabled:text-muted disabled:hover:bg-selected',
  secondary: 'bg-field hover:bg-hover disabled:text-muted disabled:hover:bg-field',
  ghost: 'bg-transparent hover:bg-hover disabled:text-muted disabled:hover:bg-transparent',
}

const sizes = {
  sm: 'h-control-sm px-4 text-caption',
  md: 'h-control px-5 text-body',
}

export function Button({ variant = 'secondary', size = 'md', className, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={cn(
        'no-drag inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,transform] duration-150',
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    />
  )
}
