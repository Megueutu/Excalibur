import type { Catalog } from '@shared/contract'
import { Button } from '@/shared/ui/primitives/Button'
import { ContextMeter } from '../../components/snapins/ContextMeter'
import { SnapInBoard } from '../../components/snapins/SnapInBoard'
import { presetsFor } from '../../lib/snapin-copy'

type Props = {
  catalog: Catalog
  modules: string[]
  onModules: (ids: string[]) => void
}

/** Step 3: which snap-ins to snap in, with shortcuts and what they cost in context. */
export function StepSnapIns({ catalog, modules, onModules }: Props) {
  const added = modules.reduce((sum, id) => sum + (catalog.modules.find((m) => m.id === id)?.tokens ?? 0), 0)
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-title">O que a IA deve ganhar de ferramentas?</h3>
        <p className="mt-1 max-w-prose text-body text-muted">Snap-ins são peças que dão mais capacidades ao agente. Encaixe só o que vai usar: cada uma custa um pouco de contexto em toda sessão. Dá para mudar depois.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-1 text-caption text-muted">Atalhos:</span>
        {presetsFor(catalog).map((p) => (
          <Button key={p.label} size="sm" onClick={() => onModules(p.ids)}>
            {p.label}
          </Button>
        ))}
      </div>
      <SnapInBoard catalog={catalog} value={modules} onChange={onModules} />
      <ContextMeter base={catalog.baseTokens} added={added} limit={catalog.contextLimit} />
    </div>
  )
}
