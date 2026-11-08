import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TaskClass } from '@shared/contract'
import { api } from '@/shared/api'
import { useUi } from '@/shared/state/ui-store'
import { Button } from '@/shared/ui/primitives/Button'
import { Segmented } from '@/shared/ui/primitives/Segmented'
import { Modal } from '@/shared/ui/overlays/Modal'
import { errorText } from '../hooks'

const label = 'mb-2 block px-1 text-heading'

const CLASSES: { value: TaskClass; label: string }[] = [
  { value: 'fix', label: 'Correção' },
  { value: 'feature', label: 'Funcionalidade' },
  { value: 'big-feature', label: 'Funcionalidade grande' },
]

/** The same rule the CLI enforces: lowercase words joined by hyphens. */
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Turn what the person typed into a slug, so "Login com Google" becomes "login-com-google". */
function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** A new task: the folder with the proposal, spec, design and tasks, filled from the template. */
export function NewTaskDialog() {
  const target = useUi((s) => s.newTask)
  const open = useUi((s) => s.openNewTask)
  const toast = useUi((s) => s.showToast)
  const client = useQueryClient()
  const [name, setName] = useState('')
  const [klass, setKlass] = useState<TaskClass>('feature')
  const [repoId, setRepoId] = useState('')

  useEffect(() => {
    if (target) {
      setName('')
      setKlass('feature')
      setRepoId(target.repoId)
    }
  }, [target])

  const slug = toSlug(name)
  const create = useMutation({
    mutationFn: () => api.createTask(repoId, slug, klass),
    onSuccess: async (result) => {
      await client.invalidateQueries()
      open(null)
      toast(`Tarefa criada em ${result.path}`)
    },
  })

  return (
    <Modal open={!!target} onOpenChange={(o) => !o && open(null)} title="Nova tarefa" description="Cria a pasta da tarefa no SDD, com proposta, spec, design e passos. Preencha a proposta primeiro.">
      <div className="flex flex-col gap-6">
        <div>
          <label htmlFor="task-name" className={label}>
            Nome
          </label>
          <input
            id="task-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Login com Google"
            className="no-drag h-control w-full rounded-full bg-field px-4 text-body outline-none transition-colors duration-150 placeholder:text-muted hover:bg-hover"
          />
          <p className="mt-2 px-1 text-caption text-muted">{slug ? `Pasta: ${slug}` : 'Letras, números e hifens; o app ajusta o resto.'}</p>
        </div>
        <div>
          <span className={label}>Tipo</span>
          <Segmented value={klass} options={CLASSES} onChange={setKlass} />
        </div>
        {target && target.repos.length > 1 ? (
          <div>
            <span className={label}>Repositório</span>
            <Segmented value={repoId} options={target.repos.map((r) => ({ value: r.id, label: r.name }))} onChange={setRepoId} />
          </div>
        ) : null}
        {create.isError ? <p className="px-1 text-body text-warn">{errorText(create.error)}</p> : null}
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <Button onClick={() => open(null)}>Cancelar</Button>
        <Button variant="primary" disabled={!SLUG.test(slug) || create.isPending} onClick={() => create.mutate()}>
          Criar tarefa
        </Button>
      </div>
    </Modal>
  )
}
