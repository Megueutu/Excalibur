import { useState } from 'react'
import { openPath } from '@/shared/lib/use-open-path'
import { useUi } from '@/shared/state/ui-store'
import { Button } from '@/shared/ui/primitives/Button'
import { PathLink } from '@/shared/ui/primitives/PathLink'
import { StatusDot } from '@/shared/ui/primitives/StatusDot'
import { PageBody } from '@/shared/ui/layout/PageBody'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { useProjects } from '@/features/projects/hooks'
import { InstructionEditor } from '../components/InstructionEditor'
import { InstructionList } from '../components/InstructionList'
import { ProfileStatus } from '../components/ProfileStatus'
import { NewInstructionDialog } from '../dialogs/NewInstructionDialog'
import { useProfile } from '../hooks'
import { isGlobal } from '../lib/format'
import { profileUsage } from '../lib/usage'

const SUBTITLE = 'Instruções suas que a IA lê em todos os seus projetos. Escreva uma vez, vale em todos.'

/** The user's own instructions for the AI, as a notebook: a list of instructions and the one being written. */
export function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const { data: overview } = useProjects()
  const openDialog = useUi((s) => s.openDialog)
  const [selected, setSelected] = useState('')
  const [creating, setCreating] = useState(false)

  if (isLoading) return null
  if (!profile) {
    return (
      <>
        <PageHeader title="Seu perfil" subtitle={SUBTITLE} />
        <PageBody>
          <div className="surface-card flex items-center gap-4 rounded-lg p-6">
            <p className="flex-1 text-body text-muted">Nenhuma pasta de perfil ligada ainda. Use uma que você já tem ou deixe o Excalibur criar uma.</p>
            <Button variant="primary" onClick={() => openDialog('profile-setup')}>
              Escolher pasta
            </Button>
          </div>
        </PageBody>
      </>
    )
  }

  const usage = profileUsage(overview)
  const file = profile.files.find((f) => f.rel === selected) ?? profile.files[0]
  const scopes = [...new Set(profile.files.filter((f) => !isGlobal(f)).map((f) => f.scope))]

  return (
    <>
      <PageHeader
        title="Seu perfil"
        subtitle={SUBTITLE}
        actions={
          <>
            <span className="inline-flex items-center gap-2 pr-1 text-caption text-muted">
              <StatusDot tone={profile.uncommitted ? 'warn' : 'ok'} />
              {profile.uncommitted ? `${profile.uncommitted} ${profile.uncommitted === 1 ? 'mudança' : 'mudanças'} sem versão` : 'Tudo guardado'}
            </span>
            <Button variant="primary" disabled={!profile.uncommitted} onClick={() => openDialog('profile-commit')}>
              Guardar versão
            </Button>
          </>
        }
      />
      <PageBody>
        <ProfileStatus profile={profile} usage={usage} onShowProjects={() => openDialog('profile-sync')} />

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[17rem_1fr]">
          <InstructionList files={profile.files} selected={file?.rel ?? ''} onSelect={setSelected} onNew={() => setCreating(true)} />
          {file ? (
            <InstructionEditor key={file.rel} file={file} />
          ) : (
            <div className="surface-card rounded-lg p-6 text-body text-muted">O perfil ainda não tem instruções. Crie a primeira em "Nova instrução".</div>
          )}
        </div>

        <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-caption text-muted">
          <span className="inline-flex min-w-0 items-center gap-2">
            Guardado em <PathLink path={profile.repoPath} onOpen={() => openPath(profile.repoPath)} />
          </span>
          <button type="button" onClick={() => openDialog('profile-setup')} className="no-drag underline underline-offset-2 hover:text-ink">
            trocar pasta
          </button>
        </p>
      </PageBody>

      <NewInstructionDialog open={creating} scopes={scopes} onClose={() => setCreating(false)} onCreated={setSelected} />
    </>
  )
}
