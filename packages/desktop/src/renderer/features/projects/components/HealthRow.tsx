import type { HealthItem } from '@shared/contract'
import { Warning } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/primitives/Button'
import { useFix } from '../hooks'

type Props = {
  item: HealthItem
  repoId: string
  repoName: string
  /** Show the repository name in front of the label (the project overview). */
  named?: boolean
}

/** One thing that needs doing, with its fix. "Ver o que muda" runs the action as a dry run. */
export function HealthRow({ item, repoId, repoName, named }: Props) {
  const fix = useFix()
  const target = { repoId, repoName, item }
  return (
    <div className="surface-control flex min-h-row items-center gap-4 rounded-md px-4 py-3">
      <Warning className="size-5 shrink-0 text-warn" />
      <div className="min-w-0 flex-1">
        <p className="text-heading">{named ? `${repoName}: ${item.label}` : item.label}</p>
        <p className="mt-0.5 text-caption text-muted">{item.detail}</p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        {item.previewable ? (
          <Button size="sm" disabled={fix.pending} onClick={() => fix.preview(target)}>
            Ver o que muda
          </Button>
        ) : null}
        <Button size="sm" variant="primary" disabled={fix.pending} onClick={() => fix.apply(target)}>
          {item.action}
        </Button>
      </div>
    </div>
  )
}
