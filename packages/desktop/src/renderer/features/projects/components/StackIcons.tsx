import { cn } from '@/shared/lib/cn'
import { STACK } from '../lib/stack-icons'

/** One technology as an icon. Unknown technologies render nothing. */
export function StackIcon({ tech, className }: { tech: string; className?: string }) {
  const entry = STACK[tech]
  if (!entry) return null
  const { icon: Icon, label } = entry
  return <Icon role="img" aria-label={label} className={cn('size-4 shrink-0', className)} />
}

export function stackLabel(tech: string): string {
  return STACK[tech]?.label ?? tech
}

/** A short row of stack icons, all one color. */
export function StackIcons({ stack, max = 4, iconClassName, className }: { stack: string[]; max?: number; iconClassName?: string; className?: string }) {
  const known = stack.filter((t) => STACK[t]).slice(0, max)
  if (!known.length) return null
  return (
    <span className={cn('inline-flex items-center gap-2 text-muted', className)}>
      {known.map((t) => (
        <StackIcon key={t} tech={t} className={iconClassName} />
      ))}
    </span>
  )
}
