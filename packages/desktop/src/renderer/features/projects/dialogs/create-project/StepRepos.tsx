import type { RepoKind } from '@shared/contract'
import { cn } from '@/shared/lib/cn'
import { Close, Info, Plus } from '@/shared/ui/icons'
import { Badge } from '@/shared/ui/primitives/Badge'
import { Button } from '@/shared/ui/primitives/Button'
import { Segmented } from '@/shared/ui/primitives/Segmented'
import { KindIcon } from '../../components/KindIcon'
import { REPO_KIND } from '../../lib/repo-kind'
import { layoutRepos, slug, type Draft, type Layout } from './model'
import { hint } from './styles'

const KIND_ORDER: RepoKind[] = ['folder', 'git', 'github']
const KIND_OPTIONS = KIND_ORDER.map((kind) => ({ value: kind, label: REPO_KIND[kind].label, icon: <KindIcon kind={kind} className="size-3.5" /> }))

type Props = {
  projectName: string
  layout: Layout
  onLayout: (layout: Layout, repos: Draft[]) => void
  repos: Draft[]
  onRepos: (repos: Draft[]) => void
}

const OPTIONS: { id: Exclude<Layout, 'custom'> | 'custom'; title: string; text: string; recommended?: boolean }[] = [
  { id: 'one', title: 'Um só', text: 'Tudo numa pasta. O mais simples para começar.' },
  { id: 'two', title: 'Contexto + código', text: 'Uma pasta guarda as especificações e as decisões; outra, o código.', recommended: true },
  { id: 'custom', title: 'Do meu jeito', text: 'Escolha quantas pastas e como se chamam.' },
]

/** The folders a layout would make, drawn as a small tree. */
function tree(id: Layout, projectName: string, repos: Draft[]): string {
  const root = `${slug(projectName) || 'projeto'}/`
  const list = id === 'custom' ? repos : layoutRepos(id, projectName)
  if (!list.length) return `${root}\n  └ …`
  return [root, ...list.map((r, i) => `  ${i === list.length - 1 ? '└' : '├'} ${r.name || '…'}${r.hub ? '  hub' : ''}`)].join('\n')
}

/** Step 2: which repositories the project is made of, explained and with ready-made arrangements. */
export function StepRepos({ projectName, layout, onLayout, repos, onRepos }: Props) {
  const update = (i: number, patch: Partial<Draft>) => onRepos(repos.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  /** Exactly one repository can be the hub: choosing one frees the others, and choosing it again clears it. */
  const toggleHub = (i: number) => onRepos(repos.map((r, j) => ({ ...r, hub: j === i ? !r.hub : false })))

  return (
    <div>
      <h3 className="text-title">Onde fica cada parte do projeto?</h3>
      <p className="mb-4 mt-1 text-body text-muted">
        Cada parte vive em um <b className="font-semibold text-ink">repositório</b>.
      </p>

      <div className="mb-5 flex items-start gap-3 rounded-md bg-primary/10 px-4 py-3 text-body">
        <Info className="mt-0.5 size-5 shrink-0 text-primary" />
        <p>
          <b className="font-semibold">O que é um repositório?</b> Uma pasta onde o código ou os documentos de uma parte do projeto moram, com o histórico de tudo o que mudou. Projeto pequeno costuma ter um; times separam, por exemplo, a API do site.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={layout === o.id}
            onClick={() => onLayout(o.id, o.id === 'custom' ? repos : layoutRepos(o.id, projectName))}
            className={cn('no-drag surface-card rounded-lg p-4 text-left transition-[background-color,box-shadow] duration-150 hover:bg-hover', layout === o.id && 'ring-2 ring-primary')}
          >
            <span className="flex flex-wrap items-center gap-2 text-heading">
              {o.title}
              {o.recommended ? <Badge>recomendado</Badge> : null}
            </span>
            <span className="mt-1 block text-caption text-muted">{o.text}</span>
            <pre className="mt-2.5 whitespace-pre font-mono text-caption leading-relaxed text-muted">{tree(o.id, projectName, repos)}</pre>
          </button>
        ))}
      </div>

      <h4 className="px-1 text-heading">Seus repositórios</h4>
      <p className="mb-3 mt-1 px-1 text-caption text-muted">
        <b className="font-semibold text-ink">Pasta:</b> só uma pasta, sem histórico · <b className="font-semibold text-ink">Git local:</b> com histórico, no seu computador · <b className="font-semibold text-ink">GitHub:</b> Git local; o remoto você cria depois
      </p>
      <ul className="flex flex-col gap-2">
        {repos.map((r, i) => (
          <li key={i} className="surface-card flex items-center gap-3 rounded-lg py-2 pl-4 pr-2">
            <KindIcon kind={r.kind} className="size-4.5 text-muted" />
            <input value={r.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="nome-do-repositorio" className="no-drag min-w-0 flex-1 bg-transparent text-heading outline-none placeholder:text-muted" aria-label="Nome do repositório" />
            <button type="button" aria-pressed={r.hub} onClick={() => toggleHub(i)} className="no-drag rounded-full" title="Onde ficam as especificações do projeto inteiro">
              <Badge className={cn('transition-opacity duration-150', !r.hub && 'opacity-50 hover:opacity-100')}>hub</Badge>
            </button>
            <Segmented value={r.kind} options={KIND_OPTIONS} onChange={(kind) => update(i, { kind })} />
            <button type="button" aria-label={`Remover ${r.name || 'repositório'}`} onClick={() => onRepos(repos.filter((_, j) => j !== i))} className="no-drag grid size-7 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-hover hover:text-ink">
              <Close className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" className="mt-2" onClick={() => onRepos([...repos, { name: '', kind: 'git', hub: false }])}>
        <Plus className="size-3.5" /> Adicionar repositório
      </Button>
      <p className={hint}>
        O <b className="font-semibold text-ink">hub</b> é o repositório que guarda as especificações (o SDD) de todos os outros.
      </p>
    </div>
  )
}
