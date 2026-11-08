import type { Catalog, Project, RepoDetail } from '@shared/contract'
import { contextLayers, formatTokens } from '../../lib/context'

const LAYERS = [
  { key: 'framework', label: 'Framework', bar: 'bg-ink' },
  { key: 'context', label: 'Contexto', bar: 'bg-primary' },
  { key: 'profile', label: 'Perfil', bar: 'bg-ok' },
  { key: 'modules', label: 'Módulos', bar: 'bg-warn' },
] as const

/** How much an agent reads before the first task, split by where it comes from. */
export function ContextBudget({ detail, project, catalog }: { detail: RepoDetail; project: Project; catalog: Catalog | undefined }) {
  const layers = contextLayers(detail, null, catalog)
  const limit = catalog?.contextLimit ?? 1
  return (
    <section aria-label="Contexto lido sempre" className="surface-control rounded-md px-5 py-4">
      <p className="flex items-baseline gap-2">
        <span className="whitespace-nowrap text-display">{formatTokens(layers.total)}</span>
        <span className="text-body text-muted">de {formatTokens(limit)} lidos sempre pelo agente</span>
      </p>
      <div className="mt-3 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-selected">
        {LAYERS.map((l) => (
          <div key={l.key} className={`${l.bar} transition-[width] duration-300`} style={{ width: `${(layers[l.key] / limit) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-caption text-muted">
        {LAYERS.map((l) => (
          <li key={l.key} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${l.bar}`} />
            {l.label} {formatTokens(layers[l.key])}
          </li>
        ))}
      </ul>
    </section>
  )
}
