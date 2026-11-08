import { useState } from 'react'
import type { Project, RepoDetail } from '@shared/contract'
import { Badge } from '@/shared/ui/primitives/Badge'
import { Segmented } from '@/shared/ui/primitives/Segmented'
import { Switch } from '@/shared/ui/primitives/Switch'
import { contextLayers, formatTokens } from '../../lib/context'
import { useCatalog } from '../../hooks'

const OFF = 'off'

/** The project's work mode and modules as controls. Changes here are drafts in the prototype. */
export function ConfigTab({ project, detail }: { project: Project; detail: RepoDetail }) {
  const { data: catalog } = useCatalog()
  const [mode, setMode] = useState(project.workMode ?? OFF)
  const [modules, setModules] = useState(new Set(project.modules))
  const toggle = (id: string) => setModules((m) => (m.has(id) ? new Set([...m].filter((x) => x !== id)) : new Set([...m, id])))
  const layers = contextLayers(detail, [...modules], catalog)

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="mb-2 px-1 text-caption font-semibold text-muted">Modo de trabalho</h3>
        <Segmented value={mode} onChange={setMode} options={[...(catalog?.modes ?? []).map((m) => ({ value: m, label: m })), { value: OFF, label: 'desligado' }]} />
      </section>

      <section>
        <h3 className="mb-2 px-1 text-caption font-semibold text-muted">Módulos</h3>
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
      </section>

      <section>
        <h3 className="mb-2 px-1 text-caption font-semibold text-muted">Perfis do usuário usados aqui</h3>
        <div className="flex gap-2">
          {project.profiles.map((p) => (
            <Badge key={p}>
              {p}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  )
}
