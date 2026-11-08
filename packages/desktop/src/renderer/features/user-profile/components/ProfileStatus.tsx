import type { ReactNode } from 'react'
import type { UserProfile } from '@shared/contract'
import { StatusDot } from '@/shared/ui/primitives/StatusDot'
import { ago, isGlobal } from '../lib/format'
import type { ProfileUsage } from '../lib/usage'

function Cell({ big, children }: { big: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center gap-3 px-5 py-3">
      <span className="text-display leading-none">{big}</span>
      <span className="text-caption leading-snug text-muted">{children}</span>
    </div>
  )
}

type Props = { profile: UserProfile; usage: ProfileUsage; onShowProjects: () => void }

/** Three numbers that say where things stand: how many instructions, whether projects have the latest, and when the last version was kept. */
export function ProfileStatus({ profile, usage, onShowProjects }: Props) {
  const everywhere = profile.files.filter(isGlobal).length
  const some = profile.files.length - everywhere
  const upToDate = usage.using.length - usage.late.length
  return (
    <div className="surface-card flex divide-x divide-hover overflow-hidden rounded-lg">
      <Cell big={profile.files.length}>
        {profile.files.length === 1 ? 'instrução' : 'instruções'}
        <br />
        {everywhere} sempre{some ? ` · ${some} em alguns projetos` : ''}
      </Cell>
      <Cell big={usage.using.length ? `${upToDate} de ${usage.using.length}` : '0'}>
        {usage.using.length ? 'repositórios em dia' : 'repositórios usando'}
        <br />
        {usage.using.length ? (
          <button type="button" onClick={onShowProjects} className="no-drag underline underline-offset-2 hover:text-ink">
            {usage.late.length ? `ver os ${usage.late.length} atrasados` : 'ver quais'}
          </button>
        ) : (
          'nenhum usa ainda'
        )}
      </Cell>
      <Cell big={profile.lastVersionAt ? ago(profile.lastVersionAt).replace(/^há /, '') : '—'}>
        {profile.lastVersionAt ? 'desde a última versão' : 'nenhuma versão guardada'}
        <br />
        {profile.uncommitted ? (
          <span className="inline-flex items-center gap-1.5 text-warn">
            <StatusDot /> {profile.uncommitted} {profile.uncommitted === 1 ? 'mudança fora dela' : 'mudanças fora dela'}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <StatusDot tone="ok" /> nada fora dela
          </span>
        )}
      </Cell>
    </div>
  )
}
