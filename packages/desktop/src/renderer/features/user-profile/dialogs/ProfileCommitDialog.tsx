import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api'
import { errorText } from '@/features/projects/hooks'
import { useUi } from '@/shared/state/ui-store'
import { Button } from '@/shared/ui/primitives/Button'
import { Modal } from '@/shared/ui/overlays/Modal'
import { useProfile } from '../hooks'

/** Commit what changed in the profile repository. It stays local: pushing is the person's own step. */
export function ProfileCommitDialog() {
  const open = useUi((s) => s.dialog === 'profile-commit')
  const close = useUi((s) => s.closeDialog)
  const toast = useUi((s) => s.showToast)
  const { data: profile } = useProfile()
  const client = useQueryClient()
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (open) setMessage('')
  }, [open])

  const commit = useMutation({
    mutationFn: () => api.commitProfile(message),
    onSuccess: async (result) => {
      await client.invalidateQueries()
      close()
      toast(result.summary)
    },
  })
  const count = profile?.uncommitted ?? 0

  return (
    <Modal open={open} onOpenChange={(o) => !o && close()} title="Commit do perfil" description={`${count} ${count === 1 ? 'alteração entra' : 'alterações entram'} no commit. Nada é enviado ao remoto.`}>
      <label htmlFor="profile-commit-message" className="mb-2 block px-1 text-heading">
        Mensagem
      </label>
      <input
        id="profile-commit-message"
        autoFocus
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && message.trim() && !commit.isPending && commit.mutate()}
        placeholder="Descreva o que mudou"
        className="no-drag h-control w-full rounded-full bg-field px-4 text-body outline-none transition-colors duration-150 placeholder:text-muted hover:bg-hover"
      />
      {commit.isError ? <p className="mt-3 px-1 text-body text-warn">{errorText(commit.error)}</p> : null}
      <div className="mt-8 flex justify-end gap-3">
        <Button onClick={close}>Cancelar</Button>
        <Button variant="primary" disabled={!message.trim() || commit.isPending} onClick={() => commit.mutate()}>
          Fazer commit
        </Button>
      </div>
    </Modal>
  )
}
