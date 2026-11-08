import { formatTokens } from '../../lib/context'

type Props = {
  /** What the framework and the files always read cost, in thousands of tokens. */
  base: number
  /** What the snap-ins switched on add, in thousands of tokens. */
  added: number
  /** The recommended ceiling, in thousands of tokens. */
  limit: number
}

/** How much the agent reads before the first task: the part that is always there, and the part the snap-ins add. */
export function ContextMeter({ base, added, limit }: Props) {
  const share = (n: number) => `${Math.min(100, (n / limit) * 100)}%`
  return (
    <div>
      <p className="mb-2 text-caption text-muted">
        O agente lê <b className="font-semibold text-ink">{formatTokens(base + added)}</b> antes da primeira tarefa ({formatTokens(base)} de base + {formatTokens(added)} dos snap-ins · limite recomendado {formatTokens(limit)})
      </p>
      <div role="img" aria-label={`${formatTokens(base + added)} de ${formatTokens(limit)}`} className="flex h-2 overflow-hidden rounded-full bg-field">
        <i className="block bg-muted transition-[width] duration-200" style={{ width: share(base) }} />
        <i className="block bg-primary transition-[width] duration-200" style={{ width: share(added) }} />
      </div>
    </div>
  )
}
