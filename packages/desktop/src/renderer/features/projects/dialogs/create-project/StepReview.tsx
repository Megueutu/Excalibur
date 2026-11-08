import type { Catalog } from '@shared/contract'
import { Check } from '@/shared/ui/icons'
import { REPO_KIND } from '../../lib/repo-kind'
import { snapinName } from '../../lib/snapin-copy'
import { slug, type Draft } from './model'
import { hint } from './styles'

type Props = {
  folder: string
  name: string
  repos: Draft[]
  modules: string[]
  catalog: Catalog | undefined
}

const card = 'surface-card rounded-lg p-4'
const cardTitle = 'mb-2 text-caption font-semibold text-muted'

/** Step 4: what is about to happen, laid out so nothing comes as a surprise. */
export function StepReview({ folder, name, repos, modules, catalog }: Props) {
  const root = `${folder}/${slug(name)}`
  const git = repos.filter((r) => r.kind !== 'folder').length
  const names = modules.map((id) => catalog?.modules.find((m) => m.id === id)).filter((m) => !!m).map((m) => snapinName(m))
  const things = [
    `Cria ${repos.length + 1} ${repos.length + 1 === 1 ? 'pasta' : 'pastas'}`,
    git ? `Inicia o histórico (git) em ${git}` : null,
    'Prepara o Excalibur em cada repositório',
    repos.some((r) => r.hub) ? 'Guarda as especificações no hub' : null,
    names.length ? `Encaixa ${names.length} ${names.length === 1 ? 'snap-in' : 'snap-ins'}: ${names.join(', ')}` : 'Não encaixa nenhum snap-in por enquanto',
  ].filter((t): t is string => !!t)

  return (
    <div>
      <h3 className="text-title">Confira antes de criar</h3>
      <p className="mb-5 mt-1 text-body text-muted">É isto que o Excalibur vai fazer. Nada é enviado para a internet.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={card}>
          <p className={cardTitle}>Como vai ficar</p>
          <pre className="whitespace-pre-wrap break-all font-mono text-caption leading-relaxed">
            {[`${root}/`, ...repos.map((r, i) => `  ${i === repos.length - 1 ? '└' : '├'} ${r.name}/${r.hub ? '  (hub)' : ''}  ${REPO_KIND[r.kind].label}`)].join('\n')}
          </pre>
        </div>
        <div className={card}>
          <p className={cardTitle}>O que acontece</p>
          <ul className="flex flex-col gap-1.5 text-body">
            {things.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-ok" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className={hint}>O remoto no GitHub não é criado aqui. Depois, em Saúde, "Criar remoto" pergunta antes e cria privado.</p>
    </div>
  )
}
