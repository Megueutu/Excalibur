import { cn } from '@/shared/lib/cn'

/** An on/off control. The whole row around it should be clickable; this is only the visual and the role. */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('no-drag relative h-5.5 w-9 shrink-0 rounded-full transition-colors duration-200', checked ? 'bg-primary' : 'bg-selected')}
    >
      <span className={cn('absolute left-0.5 top-0.5 size-4.5 rounded-full bg-page shadow-sm transition-transform duration-200', checked && 'translate-x-3.5')} />
    </button>
  )
}
