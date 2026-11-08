import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Project, Repo, RepoDetail } from '@shared/contract'
import { api } from '@/shared/api'
import { useUi } from '@/shared/state/ui-store'
import { Badge } from '@/shared/ui/primitives/Badge'
import { Button } from '@/shared/ui/primitives/Button'
import { Segmented } from '@/shared/ui/primitives/Segmented'
import { Switch } from '@/shared/ui/primitives/Switch'
import { contextLayers, formatTokens } from '../../lib/context'
import { errorText, useCatalog } from '../../hooks'

const OFF = 'off'

/** One repository's work mode and snap-ins, applied through the CLI's own commands. */
export function ConfigTab({ project, repo, detail }: { project: Project; repo: Repo; detail: RepoDetail }) {
  const { data: catalog } = useCatalog()
  const client = useQueryClient()
  const toast = useUi((s) => s.showToast)
  const saved = { mode: detail.settings.workMode ?? OFF, modules: detail.settings.modules }
  const [mode, setMode] = useState(saved.mode)
  const [modules, setModules] = useState(new Set(saved.modules))
  const toggle = (id: string) => setModules((m) => (m.has(id) ? new Set([...m].filter((x) => x !== id)) : new Set([...m, id])))
  const layers = contextLayers(detail, [...modules], catalog)

  const dirty = mode !== saved.mode || modules.size !== saved.modules.length || saved.modules.some((m) => !modules.has(m))
  const apply = useMutation({
    mutationFn: () => api.applyRepoSettings(repo.id, { workMode: mode === OFF ? null : mode, modules: [...modules] }),
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
        <ul className="flex flex-col gap-1.5">
          {catalog?.modules.map((m) => (
            <li key={m.id}>
              <label className="surface-control flex min-h-row cursor-pointer items-center gap-4 rounded-md px-4 transition-colors duration-150 hover:bg-hover">
                <Switch checked={modules.has(m.id)} onChange={() => toggle(m.id)} label={m.id} />
                <span className="text-heading">{m.id}</span>
                <span className="ml-auto text-caption text-muted">+{formatTokens(m.tokens)} de contexto</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="mt-3 px-1 text-caption text-muted">Com estas escolhas o agente lê {formatTokens(layers.total)} antes da primeira tarefa.</p>
        <div className="mt-4 flex gap-3">
          <Button variant="primary" disabled={!dirty || apply.isPending} onClick={() => apply.mutate()}>
            {apply.isPending ? 'Aplicando…' : 'Aplicar'}
          </Button>
          <Button
            disabled={!dirty || apply.isPending}
            onClick={() => {
              setMode(saved.mode)
              setModules(new Set(saved.modules))
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
