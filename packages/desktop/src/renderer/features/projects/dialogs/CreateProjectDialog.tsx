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
import { ContextMeter } from '../components/snapins/ContextMeter'
import { SnapInBoard } from '../components/snapins/SnapInBoard'
import { errorText, useCatalog } from '../hooks'
import { presetsFor } from '../lib/snapin-copy'
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

/** Snap-ins a new project starts with. */
const START_MODULES = ['decisions', 'commit-craft']

/**
 * Make a project in two steps: its folder and repositories, then which snap-ins to snap in. It makes
 * the folders, runs git init and Excalibur's own init in each repository, then switches the snap-ins on.
 */
export function CreateProjectDialog() {
  const open = useUi((s) => s.dialog === 'create-project')
  const close = useUi((s) => s.closeDialog)
  const toast = useUi((s) => s.showToast)
  const client = useQueryClient()
  const { data: catalog } = useCatalog()
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [folder, setFolder] = useState<string | null>(null)
  const [repos, setRepos] = useState<Draft[]>(START)
  const [modules, setModules] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setStep(1)
      setName('')
      setFolder(null)
      setRepos(START)
    }
  }, [open])

  // Start with the usual two, once the catalog says which exist.
  useEffect(() => {
    if (open && catalog) setModules(START_MODULES.filter((id) => catalog.modules.some((m) => m.id === id)))
  }, [open, catalog])

  const update = (i: number, patch: Partial<Draft>) => setRepos((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  /** Exactly one repository can be the hub: choosing one frees the others, and choosing it again clears it. */
  const toggleHub = (i: number) => setRepos((rs) => rs.map((r, j) => ({ ...r, hub: j === i ? !r.hub : false })))

  const input = { name: name.trim(), folder: folder ?? '', repos: repos.map((r) => ({ ...r, name: r.name.trim() })), modules }
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

  const added = modules.reduce((sum, id) => sum + (catalog?.modules.find((m) => m.id === id)?.tokens ?? 0), 0)

  return (
    <Modal
      wide
      open={open}
      onOpenChange={(o) => !o && close()}
      title="Criar projeto"
      description={step === 1 ? 'Defina o projeto e os repositórios que serão criados.' : 'Escolha o que encaixar. Dá para mudar depois, na aba Snap-ins de cada repositório.'}
    >
      {step === 1 ? (
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
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {catalog ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-1 text-caption text-muted">Atalhos:</span>
                {presetsFor(catalog).map((p) => (
                  <Button key={p.label} size="sm" onClick={() => setModules(p.ids)}>
                    {p.label}
                  </Button>
                ))}
              </div>
              <SnapInBoard catalog={catalog} value={modules} onChange={setModules} />
              <ContextMeter base={catalog.baseTokens} added={added} limit={catalog.contextLimit} />
            </>
          ) : null}
        </div>
      )}
      {create.isError ? <p className="mt-4 px-1 text-body text-warn">{errorText(create.error)}</p> : null}
      <div className="mt-8 flex justify-end gap-3">
        {step === 1 ? (
          <>
            <Button onClick={close}>Cancelar</Button>
            <Button variant="primary" disabled={!parsed.success || duplicated} onClick={() => setStep(2)}>
              Próximo
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setStep(1)}>Voltar</Button>
            <Button variant="primary" disabled={!parsed.success || duplicated || create.isPending} onClick={() => create.mutate()}>
              {create.isPending ? 'Criando…' : 'Criar projeto'}
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}
