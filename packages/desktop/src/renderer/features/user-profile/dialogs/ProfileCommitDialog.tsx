import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api'
import { errorText, useFixAll, useProjects } from '@/features/projects/hooks'
import { useUi } from '@/shared/state/ui-store'
import { Button } from '@/shared/ui/primitives/Button'
import { StatusDot } from '@/shared/ui/primitives/StatusDot'
import { Modal } from '@/shared/ui/overlays/Modal'
import { useProfile } from '../hooks'
import { profileUsage, syncTarget } from '../lib/usage'

/**
 * Keeping a version of the profile, in two steps: say what changed, then bring the projects up to
 * date with it. The second step also opens on its own ("ver quais" on the status strip). Everything
 * stays on this machine: nothing is pushed.
 */
export function ProfileCommitDialog() {
  const dialog = useUi((s) => s.dialog)
  const open = dialog === 'profile-commit' || dialog === 'profile-sync'
  const close = useUi((s) => s.closeDialog)
  const toast = useUi((s) => s.showToast)
  const { data: profile } = useProfile()
  const { data: overview } = useProjects()
  const client = useQueryClient()
  const fixAll = useFixAll()
  const [message, setMessage] = useState('')
  const [step, setStep] = useState<1 | 2>(1)
  const usage = profileUsage(overview)

  useEffect(() => {
    if (open) {
      setMessage('')
      setStep(dialog === 'profile-sync' ? 2 : 1)
    }
  }, [open, dialog])

  const commit = useMutation({
    mutationFn: () => api.commitProfile(message),
    onSuccess: async (result) => {
      toast(result.summary)
      // The second step shows at once; the projects behind it refresh while it is open.
      setStep(2)
      await client.invalidateQueries()
    },
  })
  // Which instructions changed is not tracked per file; the count is what git reports.
  const count = profile?.uncommitted ?? 0

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && close()}
      title={step === 1 ? 'Guardar versão' : 'Levar aos projetos'}
      description={step === 1 ? 'Uma versão é uma foto do seu perfil agora. Se errar depois, dá para voltar. Fica só no seu computador: nada é enviado.' : 'Cada projeto lê uma cópia do seu perfil. Atualize a cópia para a IA usar a versão mais nova.'}
    >
      {step === 1 ? (
        <>
          <p className="mb-4 px-1 text-body">
            {count} {count === 1 ? 'mudança entra' : 'mudanças entram'} nesta versão.
          </p>
          <label htmlFor="profile-commit-message" className="mb-2 block px-1 text-heading">
            Descreva em poucas palavras
          </label>
          <input
            id="profile-commit-message"
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && message.trim() && !commit.isPending && commit.mutate()}
            placeholder="Ex.: incluí a regra de uma mudança por commit"
            className="no-drag h-control w-full rounded-full bg-field px-4 text-body outline-none transition-colors duration-150 placeholder:text-muted hover:bg-hover focus-visible:outline-primary"
          />
          {commit.isError ? <p className="mt-3 px-1 text-body text-warn">{errorText(commit.error)}</p> : null}
          <div className="mt-8 flex justify-end gap-3">
            <Button onClick={close}>Cancelar</Button>
            <Button variant="primary" disabled={!message.trim() || commit.isPending} onClick={() => commit.mutate()}>
              Guardar versão
            </Button>
          </div>
        </>
      ) : (
        <>
          {usage.using.length ? (
            <ul className="flex flex-col gap-2">
              {usage.using.map((r) => (
                <li key={r.id} className="surface-card flex items-center gap-3 rounded-md px-4 py-2.5">
                  <span className="text-heading">{r.name}</span>
                  <span className="ml-auto inline-flex items-center gap-2 text-caption text-muted">
                    <StatusDot tone={usage.late.includes(r) ? 'warn' : 'ok'} />
                    {usage.late.includes(r) ? 'uma versão atrás' : 'em dia'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-1 text-body text-muted">Nenhum projeto usa o perfil ainda. Quando um usar, ele aparece aqui.</p>
          )}
          <div className="mt-8 flex justify-end gap-3">
            <Button onClick={close}>{usage.late.length ? 'Depois' : 'Fechar'}</Button>
            {usage.late.length ? (
              <Button
                variant="primary"
                disabled={fixAll.pending}
                onClick={() => {
                  fixAll.run(usage.late.map(syncTarget))
                  close()
                }}
              >
                Atualizar {usage.late.length === 1 ? 'o repositório' : `os ${usage.late.length} repositórios`}
              </Button>
            ) : null}
          </div>
        </>
      )}
    </Modal>
  )
}
