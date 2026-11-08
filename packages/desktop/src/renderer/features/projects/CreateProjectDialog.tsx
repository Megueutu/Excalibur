import { useState } from 'react'
import type { RepoKind } from '@shared/contract'
import { useUi } from '@/shared/state/ui-store'
import { Badge, StatusDot } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Plus } from '@/shared/ui/icons'
import { Modal } from '@/shared/ui/modal'
import { KindIcon } from '@/shared/ui/repo-icons'
import { Segmented } from '@/shared/ui/segmented'

const KINDS = [
  { value: 'folder', label: 'Pasta', icon: <KindIcon kind="folder" size={14} /> },
  { value: 'git', label: 'Git', icon: <KindIcon kind="git" size={14} /> },
  { value: 'github', label: 'GitHub', icon: <KindIcon kind="github" size={14} /> },
] as const

type Draft = { name: string; kind: RepoKind; hub: boolean }

const input = 'no-drag h-9 w-full rounded-full bg-panel px-4 text-sm outline-none placeholder:text-muted focus-visible:outline-primary'

export function CreateProjectDialog() {
  const open = useUi((s) => s.dialog === 'create-project')
  const close = useUi((s) => s.closeDialog)
  const [repos, setRepos] = useState<Draft[]>([
    { name: 'contexto', kind: 'github', hub: true },
    { name: 'api', kind: 'github', hub: false },
  ])

  const update = (i: number, patch: Partial<Draft>) => setRepos((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  return (
    <Modal open={open} onOpenChange={(o) => !o && close()} title="Criar projeto" description="Defina o projeto e os repositórios que serão criados.">
      <div className="flex flex-col gap-5">
        <label className="block">
          <span className="mb-1.5 block px-1 text-xs font-semibold text-muted">Nome do projeto</span>
          <input className={input} placeholder="Inter" />
        </label>
        <label className="block">
          <span className="mb-1.5 block px-1 text-xs font-semibold text-muted">Pasta</span>
          <input className={input} placeholder="~/Inter" />
        </label>
        <div>
          <span className="mb-1.5 block px-1 text-xs font-semibold text-muted">Repositórios</span>
          <ul className="space-y-2">
            {repos.map((r, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg bg-panel py-2 pl-4 pr-2">
                <KindIcon kind={r.kind} size={18} className="shrink-0 text-muted" />
                <input
                  value={r.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  className="no-drag min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
                  aria-label="Nome do repositório"
                />
                {r.hub ? <Badge className="bg-bg">hub</Badge> : null}
                <Segmented value={r.kind} options={[...KINDS]} onChange={(kind) => update(i, { kind })} />
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setRepos((rs) => [...rs, { name: '', kind: 'git', hub: false }])}>
            <Plus size={14} /> Adicionar repositório
          </Button>
        </div>
        <div className="flex items-start gap-3 rounded-lg bg-panel px-4 py-3 text-sm">
          <StatusDot className="mt-2" />
          <span>Vai criar pastas e rodar git init. O remoto no GitHub só é criado com a sua confirmação, privado.</span>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={close}>Cancelar</Button>
        <Button variant="primary" disabled title="Protótipo: nada é gravado">
          Criar projeto
        </Button>
      </div>
    </Modal>
  )
}
