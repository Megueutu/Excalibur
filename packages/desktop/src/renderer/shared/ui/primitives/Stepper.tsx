import { cn } from '@/shared/lib/cn'
import { Check } from '@/shared/ui/icons'
import { ProgressBar } from './ProgressBar'

/** The bar never starts empty, so the first step already shows that something is under way. */
const FIRST_STEP_SHARE = 0.06

/**
 * Where the person is in a flow of steps: a progress bar and the name of each step, with a check on
 * the ones done and a filled number on the current one. `current` counts from 1.
 */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  const share = steps.length > 1 ? (current - 1) / (steps.length - 1) : 1
  return (
    <div>
      <ProgressBar value={Math.max(FIRST_STEP_SHARE, share)} />
      <ol className="mt-2.5 flex justify-between text-caption font-semibold">
        {steps.map((name, i) => {
          const n = i + 1
          const done = n < current
          const here = n === current
          return (
            <li key={name} aria-current={here ? 'step' : undefined} className={cn('flex items-center gap-2', here ? 'text-ink' : done ? 'text-muted' : 'text-muted/60')}>
              <span className={cn('grid size-5 place-items-center rounded-full', here ? 'bg-primary text-on-primary' : done ? 'bg-ok text-on-primary' : 'bg-field')}>{done ? <Check className="size-3" /> : n}</span>
              {name}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
