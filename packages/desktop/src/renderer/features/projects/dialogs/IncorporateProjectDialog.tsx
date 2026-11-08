import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { FoundRepo } from '@shared/contract'
import { api } from '@/shared/api'
import { cn } from '@/shared/lib/cn'
import { useUi } from '@/shared/state/ui-store'
import { Check, Info } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/primitives/Button'
import { Modal } from '@/shared/ui/overlays/Modal'
import { KindIcon } from '../components/KindIcon'
import { StackIcons } from '../components/StackIcons'

const label = 'mb-2 block px-1 text-heading'

/** Can this row be brought in? Only repositories that have an Excalibur config and are not in the app yet. */
const selectable = (r: FoundRepo) => r.configured && !r.registered

function reason(r: FoundRepo): string | null {
  if (r.registered) return 'já está no app'
  if (!r.configured) return 'sem Excalibur: rode excalibur init nessa pasta'
  return null
}

/**
 * Bring repositories into the app. The person picks a folder, the app looks inside it, and the ones
 * that already use Excalibur can be added. The app never runs `init` for you.
 */
export function IncorporateProjectDialog() {
  const open = useUi((s) => s.dialog === 'incorporate-project')
  const close = useUi((s) => s.closeDialog)
  const client = useQueryClient()
  const [folder, setFolder] = useState<string | null>(null)
  const [off, setOff] = useState<Record<string, boolean>>({})

  const scan = useQuery({ queryKey: ['scan', folder], queryFn: () => api.scanFolder(folder!), enabled: open && !!folder })
  const found = scan.data ?? []
  const chosen = found.filter((r) => selectable(r) && !off[r.path])

  // Each time the dialog opens it starts empty.
  useEffect(() => {
    if (open) {
      setFolder(null)
      setOff({})
    }
  }, [open])

  const add = useMutation({
    mutationFn: () => api.addRepos(chosen.map((r) => r.path)),
    onSuccess: async () => {
      await client.invalidateQueries()
      close()
    },
  })

  return (
    <Modal open={open} onOpenChange={(o) => !o && close()} title="Incorporar projeto" description="Escolha a pasta. O app procura repositórios dentro dela e identifica o tipo e a stack.">
      <div className="flex flex-col gap-6">
        <div>
          <span className={label}>Pasta</span>
          <button
            type="button"
            onClick={async () => {
              const picked = await api.pickFolder()
              if (picked) setFolder(picked)
            }}
            className="no-drag flex h-control w-full items-center rounded-full bg-field px-4 text-body transition-colors duration-150 hover:bg-hover"
          >
            <span className="truncate">{folder ?? 'Nenhuma pasta escolhida'}</span>
            <span className="ml-auto shrink-0 pl-3 text-primary">escolher…</span>
          </button>
        </div>

        {folder ? (
          <div>
            <span className={label}>Encontrados · {scan.isLoading ? 'procurando…' : `${found.length} ${found.length === 1 ? 'pasta' : 'pastas'}`}</span>
            {!scan.isLoading && !found.length ? <p className="px-1 text-body text-muted">Nenhum repositório nessa pasta.</p> : null}
            <ul className="flex flex-col gap-2">
              {found.map((r) => {
                const can = selectable(r)
                const on = can && !off[r.path]
                const why = reason(r)
                return (
                  <li key={r.path} className={cn('surface-card flex items-center gap-3 rounded-lg py-2.5 pl-4 pr-3 transition-opacity duration-150', !can && 'opacity-60')}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      aria-label={`Incluir ${r.name}`}
                      disabled={!can}
                      onClick={() => setOff((o) => ({ ...o, [r.path]: on }))}
                      className={cn('no-drag grid size-5 shrink-0 place-items-center rounded-full transition-colors duration-150', on ? 'bg-primary text-on-primary' : 'bg-selected hover:bg-hover')}
                    >
                      {on ? <Check className="size-3" /> : null}
                    </button>
                    <KindIcon kind={r.kind} className="size-4.5 text-muted" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-heading">{r.name}</span>
                      {why ? <span className="block truncate text-caption text-muted">{why}</span> : null}
                    </span>
                    <StackIcons stack={r.stack} />
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        <div className="surface-card flex items-start gap-3 rounded-lg px-4 py-3 text-body">
          <Info className="mt-0.5 size-4 shrink-0 text-muted" />
          <span>O projeto e o hub aparecem sozinhos: repositórios na mesma pasta formam um projeto, e o hub é aquele onde os outros guardam o SDD.</span>
        </div>
        {add.isError ? <p className="px-1 text-body text-warn">{String(add.error)}</p> : null}
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <Button onClick={close}>Cancelar</Button>
        <Button variant="primary" disabled={!chosen.length || add.isPending} onClick={() => add.mutate()}>
          {chosen.length ? `Incorporar ${chosen.length} ${chosen.length === 1 ? 'repositório' : 'repositórios'}` : 'Incorporar'}
        </Button>
      </div>
    </Modal>
  )
}
