import { cn } from '@/shared/lib/cn'
import { slug } from './model'
import { field, hint, label } from './styles'

type Props = {
  name: string
  onName: (name: string) => void
  folder: string | null
  onPickFolder: () => void
}

/** Step 1: what the project is called and where it goes. */
export function StepProject({ name, onName, folder, onPickFolder }: Props) {
  const made = slug(name)
  return (
    <div>
      <h3 className="text-title">Como se chama o projeto e onde ele fica?</h3>
      <p className="mb-6 mt-1 max-w-prose text-body text-muted">
        Um <b className="font-semibold text-ink">projeto</b> é a pasta que reúne tudo de uma ideia: o código, os documentos e as instruções para a IA.
      </p>

      <label className="block">
        <span className={label}>Nome do projeto</span>
        <input autoFocus className={field} placeholder="Ex.: Shotocar" value={name} onChange={(e) => onName(e.target.value)} />
      </label>

      <div className="mt-5">
        <span className={label}>Em qual pasta criar?</span>
        <button type="button" onClick={onPickFolder} className={cn(field, 'flex items-center text-left')}>
          <span className={cn('truncate', !folder && 'text-muted')}>{folder ?? 'Nenhuma pasta escolhida'}</span>
          <span className="ml-auto shrink-0 pl-3 text-primary">escolher…</span>
        </button>
        {folder && made ? (
          <p className={cn(hint, 'flex flex-wrap items-center gap-2')}>
            Vai criar <code className="rounded-xs bg-field px-2 py-0.5 font-mono text-caption text-ink">{`${folder}/${made}`}</code>
          </p>
        ) : null}
      </div>
    </div>
  )
}
