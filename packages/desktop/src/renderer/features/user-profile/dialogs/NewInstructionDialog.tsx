import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api'
import { errorText } from '@/features/projects/hooks'
import { Button } from '@/shared/ui/primitives/Button'
import { Segmented } from '@/shared/ui/primitives/Segmented'
import { Modal } from '@/shared/ui/overlays/Modal'

const label = 'mb-2 block px-1 text-heading'
const field = 'no-drag h-control w-full rounded-full bg-field px-4 text-body outline-none transition-colors duration-150 placeholder:text-muted hover:bg-hover focus-visible:outline-primary'

type Props = {
  open: boolean
  /** The profiles the repository already has, besides the one that applies everywhere. */
  scopes: string[]
  onClose: () => void
  /** Called with the path of the new instruction, so the page can open it. */
  onCreated: (rel: string) => void
}

/** Start a new instruction: a title, when the agent should read it, and where it applies. */
export function NewInstructionDialog({ open, scopes, onClose, onCreated }: Props) {
  const client = useQueryClient()
  const [title, setTitle] = useState('')
  const [when, setWhen] = useState('')
  const [scope, setScope] = useState('global')

  useEffect(() => {
    if (open) {
      setTitle('')
      setWhen('')
      setScope('global')
    }
  }, [open])

  const create = useMutation({
    mutationFn: () => api.createProfileFile({ scope, title: title.trim(), when }),
    onSuccess: async ({ rel }) => {
      await client.invalidateQueries()
      onClose()
      onCreated(rel)
    },
  })

  return (
    <Modal open={open} onOpenChange={(o) => !o && onClose()} title="Nova instrução" description="Escreva uma vez; a IA lê em todos os projetos onde ela valer.">
      <div className="flex flex-col gap-5">
        <label className="block">
          <span className={label}>Título</span>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Como escrever commits" className={field} />
        </label>
        <label className="block">
          <span className={label}>Quando a IA lê isto</span>
          <input value={when} onChange={(e) => setWhen(e.target.value)} placeholder="Em branco: sempre" className={field} />
        </label>
        {scopes.length ? (
          <div>
            <span className={label}>Vale</span>
            <Segmented value={scope} onChange={setScope} options={[{ value: 'global', label: 'Em todos os projetos' }, ...scopes.map((s) => ({ value: s, label: `Só no perfil ${s}` }))]} />
          </div>
        ) : null}
        {create.isError ? <p className="px-1 text-body text-warn">{errorText(create.error)}</p> : null}
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="primary" disabled={!title.trim() || create.isPending} onClick={() => create.mutate()}>
          Criar instrução
        </Button>
      </div>
    </Modal>
  )
}
