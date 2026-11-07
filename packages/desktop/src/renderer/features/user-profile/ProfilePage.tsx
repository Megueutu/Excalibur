import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { useUi } from '@/shared/state/ui-store'
import { Button } from '@/shared/ui/button'
import { Badge, StatusDot } from '@/shared/ui/badge'
import { FileText } from '@/shared/ui/icons'
import { PageHeader } from '@/shared/ui/page'
import { useProfile } from './hooks'

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const openDialog = useUi((s) => s.openDialog)
  const [selected, setSelected] = useState('global/commits.md')
  const [tab, setTab] = useState<'files' | 'index'>('files')

  if (isLoading || !profile) return null
  const file = profile.files.find((f) => f.rel === selected) ?? profile.files[0]!

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Perfil do usuário"
        subtitle={`${profile.repoPath} · ${profile.branch} · ${profile.uncommitted} alterações sem commit · remoto ${profile.remote === 'private' ? 'privado' : profile.remote}`}
        actions={
          <>
            <Button onClick={() => openDialog('profile-setup')}>Trocar repositório</Button>
            <Button disabled title="Protótipo: nada é gravado">
              Commit…
            </Button>
          </>
        }
      />
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_260px]">
        <div className="min-h-0 overflow-auto px-8 pb-8">
          <p className="mb-3 px-1 text-xs text-muted">{file.rel}</p>
          <div className="mb-4 flex flex-col gap-2 text-sm">
            <span className="truncate rounded-full bg-panel px-4 py-2 text-muted">description: {file.description}</span>
            <span className="truncate rounded-full bg-panel px-4 py-2 text-muted">when: {file.when}</span>
          </div>
          <pre className="min-h-48 whitespace-pre-wrap rounded-lg bg-panel p-5 font-mono text-[13px] leading-relaxed">{file.body}</pre>
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-panel px-4 py-3 text-sm">
            <StatusDot />
            Salvar vai modificar o repositório do perfil.
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="primary" disabled title="Protótipo: nada é gravado">
              Salvar
            </Button>
            <Button disabled title="Protótipo: nada é gravado">
              Descartar
            </Button>
          </div>
        </div>
        <aside className="min-h-0 overflow-auto bg-panel px-4 py-5 text-sm">
          <div className="mb-4 flex gap-1 rounded-full bg-panel-2 p-1 text-xs">
            {(['files', 'index'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn('flex-1 rounded-full px-3 py-1', tab === t ? 'bg-bg font-semibold' : 'text-muted')}
              >
                {t === 'files' ? 'Arquivos' : 'Índice'}
              </button>
            ))}
          </div>
          {tab === 'files' ? (
            <ul className="space-y-0.5">
              {profile.files.map((f) => (
                <li key={f.rel}>
                  <button
                    type="button"
                    onClick={() => setSelected(f.rel)}
                    className={cn('flex w-full items-center gap-2 rounded-md px-3 py-2 text-left font-mono text-xs hover:bg-panel-2', f.rel === file.rel && 'bg-panel-2')}
                  >
                    <FileText size={14} className="shrink-0 text-muted" />
                    <span className="truncate">{f.rel}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-4 px-3">
              {profile.files.map((f) => (
                <li key={f.rel}>
                  <p className="font-mono text-xs">{f.rel}</p>
                  <Badge className="mt-1.5">{f.when}</Badge>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}
