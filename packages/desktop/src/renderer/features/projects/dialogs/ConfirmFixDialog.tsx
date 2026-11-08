import { useUi } from '@/shared/state/ui-store'
import { Button } from '@/shared/ui/primitives/Button'
import { Modal } from '@/shared/ui/overlays/Modal'
import { useFixAll } from '../hooks'

/** What each fix that asks first will do, in the words the person decides on. */
const CONSEQUENCE: Record<string, string> = {
  remote: 'Cria um repositório privado no GitHub com o seu login do gh e liga ao remoto origin. Nada é enviado: o push continua com você.',
}

const joinNames = (names: string[]) => (names.length <= 2 ? names.join(' e ') : `${names.slice(0, -1).join(', ')} e ${names.at(-1)}`)

/** The yes for a fix that reaches outside this machine, for one repository or several. */
export function ConfirmFixDialog() {
  const pending = useUi((s) => s.pendingFix)
  const ask = useUi((s) => s.askFix)
  const fixAll = useFixAll()
  const first = pending?.targets[0]

  return (
    <Modal open={!!pending} onOpenChange={(o) => !o && ask(null)} title={first?.item.action ?? ''} description={pending ? `Em ${joinNames(pending.targets.map((t) => t.repoName))}` : ''}>
      <p className="px-1 text-body">{first ? (CONSEQUENCE[first.item.id] ?? first.item.detail) : ''}</p>
      <div className="mt-8 flex justify-end gap-3">
        <Button onClick={() => ask(null)}>Cancelar</Button>
        <Button
          variant="primary"
          onClick={() => {
            if (!pending) return
            fixAll.run(pending.targets, true)
            ask(null)
          }}
        >
          {first?.item.action}
        </Button>
      </div>
    </Modal>
  )
}
