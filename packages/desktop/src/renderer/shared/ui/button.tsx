import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
}

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-pressed',
  secondary: 'bg-panel hover:bg-panel-2',
  ghost: 'bg-transparent hover:bg-panel',
}

export function Button({ variant = 'secondary', size = 'md', className, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={cn(
        'no-drag inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[colors,transform] disabled:opacity-40',
        size === 'sm' ? 'h-8 px-4 text-xs' : 'h-9 px-5 text-sm',
        variants[variant],
        className,
      )}
      {...rest}
    />
  )
}
