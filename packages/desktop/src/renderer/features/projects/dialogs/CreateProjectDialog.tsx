import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { RepoKind } from '@shared/contract'
import { CreateProjectInputSchema } from '@shared/contract'
import { api } from '@/shared/api'
import { cn } from '@/shared/lib/cn'
import { useUi } from '@/shared/state/ui-store'
import { Plus } from '@/shared/ui/icons'
import { Badge } from '@/shared/ui/primitives/Badge'
import { Button } from '@/shared/ui/primitives/Button'
import { Segmented } from '@/shared/ui/primitives/Segmented'
import { StatusDot } from '@/shared/ui/primitives/StatusDot'
import { Modal } from '@/shared/ui/overlays/Modal'
import { KindIcon } from '../components/KindIcon'
import { errorText } from '../hooks'
import { REPO_KIND } from '../lib/repo-kind'

type Draft = { name: string; kind: RepoKind; hub: boolean }

const KIND_ORDER: RepoKind[] = ['folder', 'git', 'github']
const KIND_OPTIONS = KIND_ORDER.map((kind) => ({ value: kind, label: REPO_KIND[kind].label, icon: <KindIcon kind={kind} className="size-3.5" /> }))

const field = 'no-drag h-control w-full rounded-full bg-field px-4 text-body outline-none transition-colors duration-150 placeholder:text-muted hover:bg-hover focus-visible:outline-primary'
const label = 'mb-2 block px-1 text-heading'

const START: Draft[] = [
  { name: 'contexto', kind: 'github', hub: true },
  { name: 'api', kind: 'github', hub: false },
]

/** Make a project: its folder, one folder per repository, git init, and Excalibur's own init in each. */
export function CreateProjectDialog() {
  const open = useUi((s) => s.dialog === 'create-project')
  const close = useUi((s) => s.closeDialog)
  const toast = useUi((s) => s.showToast)
  const client = useQueryClient()
  const [name, setName] = useState('')
  const [folder, setFolder] = useState<string | null>(null)
  const [repos, setRepos] = useState<Draft[]>(START)

  useEffect(() => {
    if (open) {
      setName('')
      setFolder(null)
      setRepos(START)
    }
  }, [open])

  const update = (i: number, patch: Partial<Draft>) => setRepos((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  /** Exactly one repository can be the hub: choosing one frees the others, and choosing it again clears it. */
  const toggleHub = (i: number) => setRepos((rs) => rs.map((r, j) => ({ ...r, hub: j === i ? !r.hub : false })))

  const input = { name: name.trim(), folder: folder ?? '', repos: repos.map((r) => ({ ...r, name: r.name.trim() })) }
  const parsed = CreateProjectInputSchema.safeParse(input)
  const duplicated = new Set(repos.map((r) => r.name.trim().toLowerCase())).size !== repos.length

  const create = useMutation({
    mutationFn: () => api.createProject(input),
    onSuccess: async (result) => {
      await client.invalidateQueries()
      close()
      toast(`Projeto criado em ${result.path}`)
    },
  })

  return (
    <Modal open={open} onOpenChange={(o) => !o && close()} title="Criar projeto" description="Defina o projeto e os repositórios que serão criados.">
      <div className="flex flex-col gap-6">
        <label className="block">
          <span className={label}>Nome do projeto</span>
          <input className={field} placeholder="Inter" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div>
          <span className={label}>Pasta</span>
          <button
            type="button"
            onClick={async () => {
              const picked = await api.pickFolder()
              if (picked) setFolder(picked)
            }}
            className={cn(field, 'flex items-center text-left')}
          >
            <span className={cn('truncate', !folder && 'text-muted')}>{folder ?? 'Nenhuma pasta escolhida'}</span>
            <span className="ml-auto shrink-0 pl-3 text-primary">escolher…</span>
          </button>
        </div>
        <div>
          <span className={label}>Repositórios</span>
          <ul className="flex flex-col gap-2">
            {repos.map((r, i) => (
              <li key={i} className="surface-card flex items-center gap-3 rounded-lg py-2 pl-4 pr-2">
                <KindIcon kind={r.kind} className="size-4.5 text-muted" />
                <input
                  value={r.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  className="no-drag min-w-0 flex-1 bg-transparent text-heading outline-none"
                  aria-label="Nome do repositório"
                />
                <button type="button" aria-pressed={r.hub} onClick={() => toggleHub(i)} className="no-drag rounded-full" title="Onde fica o SDD do projeto">
                  <Badge className={cn('transition-opacity duration-150', !r.hub && 'opacity-50 hover:opacity-100')}>hub</Badge>
                </button>
                <Segmented value={r.kind} options={KIND_OPTIONS} onChange={(kind) => update(i, { kind })} />
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setRepos((rs) => [...rs, { name: '', kind: 'git', hub: false }])}>
            <Plus className="size-3.5" /> Adicionar repositório
          </Button>
        </div>
        <div className="surface-card flex items-start gap-3 rounded-lg px-4 py-3 text-body">
          <StatusDot className="mt-2" />
          <span>Cria as pastas, roda git init e o init do Excalibur em cada repositório. O remoto no GitHub não é criado aqui: depois, em Saúde, "Criar remoto" pergunta antes e cria privado.</span>
        </div>
        {duplicated ? <p className="px-1 text-body text-warn">Dois repositórios com o mesmo nome.</p> : null}
        {create.isError ? <p className="px-1 text-body text-warn">{errorText(create.error)}</p> : null}
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <Button onClick={close}>Cancelar</Button>
        <Button variant="primary" disabled={!parsed.success || duplicated || create.isPending} onClick={() => create.mutate()}>
          {create.isPending ? 'Criando…' : 'Criar projeto'}
        </Button>
      </div>
    </Modal>
  )
}
