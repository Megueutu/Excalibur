import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Settings, SnapshotDefault } from '@shared/contract'
import { api } from '@/shared/api'
import { useUi } from '@/shared/state/ui-store'
import { Fact } from '@/shared/ui/layout/Fact'
import { Group } from '@/shared/ui/layout/Group'
import { Section } from '@/shared/ui/layout/Section'
import { Modal } from '@/shared/ui/overlays/Modal'
import { Segmented } from '@/shared/ui/primitives/Segmented'
import { StatusDot } from '@/shared/ui/primitives/StatusDot'
import { PathLink } from '@/shared/ui/primitives/PathLink'
import { openPath } from '@/shared/lib/use-open-path'
import { errorText } from '@/features/projects/hooks'

const SNAPSHOT_OPTIONS: { value: SnapshotDefault; label: string }[] = [
  { value: 'ignored', label: 'Fora do git' },
  { value: 'committed', label: 'No git' },
]

const GH: Record<Settings['gh'], { label: string; tone: 'ok' | 'warn' }> = {
  ready: { label: 'instalado e autenticado', tone: 'ok' },
  'signed-out': { label: 'instalado, sem login (rode gh auth login)', tone: 'warn' },
  missing: { label: 'não instalado', tone: 'warn' },
}

/** What the app knows about this machine: where the user's files are, the defaults, and which tools work. */
export function SettingsDialog() {
  const open = useUi((s) => s.dialog === 'settings')
  const close = useUi((s) => s.closeDialog)
  const toast = useUi((s) => s.showToast)
  const client = useQueryClient()
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => api.getSettings(), enabled: open })

  const setSnapshot = useMutation({
    mutationFn: (value: SnapshotDefault) => api.setSnapshotDefault(value),
    onError: (error) => toast(errorText(error)),
    onSettled: () => void client.invalidateQueries({ queryKey: ['settings'] }),
  })

  return (
    <Modal open={open} onOpenChange={(o) => !o && close()} title="Configurações" description="Padrões para novos projetos e arquivos do usuário.">
      <Section title="Novos projetos">
        <Group>
          <dl>
            <Fact label="Snapshot do perfil">
              {settings ? <Segmented value={settings.snapshotDefault} options={SNAPSHOT_OPTIONS} onChange={(v) => setSnapshot.mutate(v)} /> : '…'}
            </Fact>
          </dl>
        </Group>
      </Section>
      <Section title="Arquivos do usuário">
        <Group>
          <dl>
            <Fact label="Configuração">{settings ? <PathLink path={settings.configPath} onOpen={() => openPath(settings.configPath)} /> : '…'}</Fact>
            <Fact label="Registro">{settings ? <PathLink path={settings.registryPath} onOpen={() => openPath(settings.registryPath)} /> : '…'}</Fact>
          </dl>
        </Group>
      </Section>
      <Section title="Ferramentas">
        <Group>
          <dl>
            <Fact label="Excalibur">{settings ? `v${settings.frameworkVersion}` : '…'}</Fact>
            <Fact label="GitHub CLI">
              {settings ? (
                <span className="inline-flex items-center gap-2">
                  <StatusDot tone={GH[settings.gh].tone} />
                  {GH[settings.gh].label}
                </span>
              ) : (
                '…'
              )}
            </Fact>
          </dl>
        </Group>
      </Section>
    </Modal>
  )
}
