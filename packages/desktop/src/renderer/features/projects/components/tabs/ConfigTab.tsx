import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Project, Repo, RepoDetail } from '@shared/contract'
import { api } from '@/shared/api'
import { useUi } from '@/shared/state/ui-store'
import { Badge } from '@/shared/ui/primitives/Badge'
import { Button } from '@/shared/ui/primitives/Button'
import { Segmented } from '@/shared/ui/primitives/Segmented'
import { contextLayers } from '../../lib/context'
import { errorText, useCatalog } from '../../hooks'
import { ContextMeter } from '../snapins/ContextMeter'
import { SnapInBoard } from '../snapins/SnapInBoard'

const OFF = 'off'

/** One repository's work mode and snap-ins, applied through the CLI's own commands. */
export function ConfigTab({ project, repo, detail }: { project: Project; repo: Repo; detail: RepoDetail }) {
  const { data: catalog } = useCatalog()
  const client = useQueryClient()
  const toast = useUi((s) => s.showToast)
  const saved = { mode: detail.settings.workMode ?? OFF, modules: detail.settings.modules }
  const [mode, setMode] = useState(saved.mode)
  const [modules, setModules] = useState(saved.modules)
  const layers = contextLayers(detail, modules, catalog)

  const dirty = mode !== saved.mode || modules.length !== saved.modules.length || saved.modules.some((m) => !modules.includes(m))
  const apply = useMutation({
    mutationFn: () => api.applyRepoSettings(repo.id, { workMode: mode === OFF ? null : mode, modules }),
    onSuccess: (result) => toast(result.summary),
    onError: (error) => toast(errorText(error)),
    onSettled: () => void client.invalidateQueries(),
  })

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="mb-2 px-1 text-caption font-semibold text-muted">Modo de trabalho</h3>
        <Segmented value={mode} onChange={setMode} options={[...(catalog?.modes ?? []).map((m) => ({ value: m, label: m })), { value: OFF, label: 'desligado' }]} />
      </section>

      <section>
        <h3 className="mb-2 px-1 text-caption font-semibold text-muted">Snap-ins</h3>
        <p className="mb-3 px-1 text-body text-muted">Peças que dão ao agente mais ferramentas. O que está encaixado vale para este repositório; o resto fica na prateleira.</p>
        {catalog ? <SnapInBoard catalog={catalog} value={modules} onChange={setModules} /> : null}
        <div className="mt-4">
          <ContextMeter base={layers.total - layers.modules} added={layers.modules} limit={catalog?.contextLimit ?? 1} />
        </div>
        <div className="mt-4 flex gap-3">
          <Button variant="primary" disabled={!dirty || apply.isPending} onClick={() => apply.mutate()}>
            {apply.isPending ? 'Aplicando…' : 'Aplicar'}
          </Button>
          <Button
            disabled={!dirty || apply.isPending}
            onClick={() => {
              setMode(saved.mode)
              setModules(saved.modules)
            }}
          >
            Descartar
          </Button>
        </div>
      </section>

      <section>
        <h3 className="mb-2 px-1 text-caption font-semibold text-muted">Perfis do usuário usados aqui</h3>
        <div className="flex gap-2">
          {project.profiles.map((p) => (
            <Badge key={p}>{p}</Badge>
          ))}
        </div>
      </section>
    </div>
  )
}
