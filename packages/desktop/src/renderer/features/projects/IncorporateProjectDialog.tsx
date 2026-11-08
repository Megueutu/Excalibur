import { useState } from 'react'
import type { Repo } from '@shared/contract'
import { cn } from '@/shared/lib/cn'
import { useUi } from '@/shared/state/ui-store'
import { Button } from '@/shared/ui/button'
import { Check, Info } from '@/shared/ui/icons'
import { Modal } from '@/shared/ui/modal'
import { KindIcon, StackIcons } from '@/shared/ui/repo-icons'
import { useProjects } from './hooks'

type Found = Pick<Repo, 'id' | 'name' | 'kind' | 'stack'>

/** What a scan of the folder would find. Sample data until the core is wired in. */
const EXTRA: Found = { id: 'rascunhos', name: 'rascunhos', kind: 'folder', stack: ['markdown'] }

export function IncorporateProjectDialog() {
  const open = useUi((s) => s.dialog === 'incorporate-project')
  const close = useUi((s) => s.closeDialog)
  const { data } = useProjects()
  const found: Found[] = [...(data?.projects[0]?.repos ?? []), EXTRA]
  const [off, setOff] = useState<Record<string, boolean>>({ rascunhos: true })
  const [hub, setHub] = useState('VersioSpec')
  const chosen = found.filter((r) => !off[r.id]).length

  return (
    <Modal open={open} onOpenChange={(o) => !o && close()} title="Incorporar projeto" description="Escolha a pasta. O app procura repositórios dentro dela e identifica o tipo e a stack.">
      <div className="flex flex-col gap-5">
        <div>
          <span className="mb-1.5 block px-1 text-xs font-semibold text-muted">Pasta</span>
          <div className="flex h-9 items-center rounded-full bg-panel px-4 text-sm">
            ~/Inter <span className="ml-auto text-primary">escolher…</span>
          </div>
        </div>
        <div>
          <span className="mb-1.5 block px-1 text-xs font-semibold text-muted">Encontrados · {found.length} pastas</span>
          <ul className="space-y-2">
            {found.map((r) => {
              const on = !off[r.id]
              return (
                <li key={r.id} className={cn('flex items-center gap-3 rounded-lg bg-panel py-2.5 pl-4 pr-3', !on && 'opacity-60')}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    aria-label={`Incluir ${r.name}`}
                    onClick={() => setOff((o) => ({ ...o, [r.id]: on }))}
                    className={cn('no-drag grid size-5 shrink-0 place-items-center rounded-full', on ? 'bg-primary text-on-primary' : 'bg-panel-2')}
                  >
                    {on ? <Check size={12} /> : null}
                  </button>
                  <KindIcon kind={r.kind} size={18} className="shrink-0 text-muted" />
                  <span className="truncate text-sm font-semibold">{r.name}</span>
                  <StackIcons stack={r.stack} className="ml-auto" />
                  <button
                    type="button"
                    disabled={!on}
                    onClick={() => setHub(r.name)}
                    className={cn('no-drag rounded-full px-3 py-0.5 text-xs', hub === r.name && on ? 'bg-primary text-on-primary' : 'bg-bg text-muted hover:text-text')}
                  >
                    hub
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="flex items-start gap-3 rounded-lg bg-panel px-4 py-3 text-sm">
          <Info size={16} className="mt-0.5 shrink-0 text-muted" />
          <span>Marque quem faz parte e escolha o hub de contexto. Cada repositório continua funcionando sozinho.</span>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={close}>Cancelar</Button>
        <Button variant="primary" disabled title="Protótipo: nada é gravado">
          Incorporar {chosen} repositórios
        </Button>
      </div>
    </Modal>
  )
}
