import { useUi } from '@/shared/state/ui-store'
import { Modal } from '@/shared/ui/modal'

const choices = [
  { title: 'Usar um repositório que já tenho', text: 'Escolha uma pasta com git. O app confere remoto e estrutura.' },
  { title: 'Criar um novo', text: 'Pasta local com git e um modelo inicial. O remoto no GitHub só nasce com a sua confirmação, privado.' },
]

export function ProfileSetupDialog() {
  const open = useUi((s) => s.dialog === 'profile-setup')
  const close = useUi((s) => s.closeDialog)

  return (
    <Modal open={open} onOpenChange={(o) => !o && close()} title="Perfil do usuário" description="Instruções suas para IAs, valendo em todos os projetos.">
      <div className="space-y-2">
        {choices.map((c) => (
          <button key={c.title} type="button" className="w-full rounded-lg border border-border p-3 text-left hover:border-text">
            <p className="text-sm font-medium">{c.title}</p>
            <p className="text-xs text-muted">{c.text}</p>
          </button>
        ))}
      </div>
    </Modal>
  )
}
