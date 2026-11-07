import { useUi } from '@/shared/state/ui-store'
import { Modal } from '@/shared/ui/modal'

const choices = [
  { title: 'Um repositório avulso', text: 'Um repositório que usa Excalibur e não pertence a um projeto.' },
  { title: 'Um projeto', text: 'Uma pasta com vários repositórios e um hub de contexto, como o Inter. Você marca quem faz parte.' },
]

export function AddProjectDialog() {
  const open = useUi((s) => s.dialog === 'add-project')
  const close = useUi((s) => s.closeDialog)

  return (
    <Modal open={open} onOpenChange={(o) => !o && close()} title="Adicionar pasta" description="Escolha o que a pasta representa.">
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
