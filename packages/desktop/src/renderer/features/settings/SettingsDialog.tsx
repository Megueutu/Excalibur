import { useUi } from '@/shared/state/ui-store'
import { Modal } from '@/shared/ui/modal'
import { Fact, Group, Section } from '@/shared/ui/page'

export function SettingsDialog() {
  const open = useUi((s) => s.dialog === 'settings')
  const close = useUi((s) => s.closeDialog)

  return (
    <Modal open={open} onOpenChange={(o) => !o && close()} title="Configurações" description="Padrões para novos projetos e arquivos do usuário.">
      <Section title="Novos projetos">
        <Group>
          <dl>
          <Fact label="Modo">público</Fact>
          <Fact label="Snapshot do perfil">fora do git</Fact>
          <Fact label="Módulos">nenhum</Fact>
        </dl>
        </Group>
      </Section>
      <Section title="Arquivos do usuário">
        <Group>
          <dl>
          <Fact label="Configuração">~/.excalibur/config.yaml</Fact>
          <Fact label="Registro">~/.excalibur/projects.yaml</Fact>
        </dl>
        </Group>
      </Section>
      <Section title="Ferramentas">
        <Group>
          <dl>
          <Fact label="CLI">instalada · v0.9.0</Fact>
          <Fact label="gh">autenticada</Fact>
        </dl>
        </Group>
      </Section>
    </Modal>
  )
}
