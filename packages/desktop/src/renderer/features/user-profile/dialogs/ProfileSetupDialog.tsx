import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProfileLink } from '@shared/contract'
import { api } from '@/shared/api'
import { errorText } from '@/features/projects/hooks'
import { useUi } from '@/shared/state/ui-store'
import { Modal } from '@/shared/ui/overlays/Modal'

const choices: { mode: ProfileLink; title: string; text: string }[] = [
  { mode: 'existing', title: 'Usar um repositório que já tenho', text: 'Escolha uma pasta com git. O app só liga: não muda nada nela.' },
  { mode: 'create', title: 'Criar um novo', text: 'Escolha uma pasta vazia: ela ganha git e um modelo inicial. O remoto no GitHub fica por sua conta.' },
]

/** Link the profile repository: pick the folder, and the app links it or fills it from the template. */
export function ProfileSetupDialog() {
  const open = useUi((s) => s.dialog === 'profile-setup')
  const close = useUi((s) => s.closeDialog)
  const toast = useUi((s) => s.showToast)
  const client = useQueryClient()

  const link = useMutation({
    mutationFn: async (mode: ProfileLink) => {
      const folder = await api.pickFolder()
      if (!folder) return null
      await api.linkProfile(folder, mode)
      return folder
    },
    onSuccess: async (folder) => {
      if (!folder) return
      await client.invalidateQueries()
      close()
      toast('Repositório do perfil ligado')
    },
  })

  return (
    <Modal open={open} onOpenChange={(o) => !o && close()} title="Perfil do usuário" description="Instruções suas para IAs, valendo em todos os projetos.">
      <div className="flex flex-col gap-3">
        {choices.map((c) => (
          <button
            key={c.mode}
            type="button"
            disabled={link.isPending}
            onClick={() => link.mutate(c.mode)}
            className="surface-card w-full rounded-lg px-5 py-4 text-left transition-colors duration-150 hover:bg-hover disabled:opacity-60"
          >
            <p className="text-heading">{c.title}</p>
            <p className="mt-1 text-body text-muted">{c.text}</p>
          </button>
        ))}
        {link.isError ? <p className="px-1 text-body text-warn">{errorText(link.error)}</p> : null}
      </div>
    </Modal>
  )
}
