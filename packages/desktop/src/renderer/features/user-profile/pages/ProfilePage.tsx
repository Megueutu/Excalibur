import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api'
import { errorText } from '@/features/projects/hooks'
import { cn } from '@/shared/lib/cn'
import { openPath } from '@/shared/lib/use-open-path'
import { useUi } from '@/shared/state/ui-store'
import { FileText, GitBranch } from '@/shared/ui/icons'
import { Badge } from '@/shared/ui/primitives/Badge'
import { Button } from '@/shared/ui/primitives/Button'
import { PathLink } from '@/shared/ui/primitives/PathLink'
import { StatusDot } from '@/shared/ui/primitives/StatusDot'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { KindIcon } from '@/features/projects/components/KindIcon'
import { useProfile } from '../hooks'

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const openDialog = useUi((s) => s.openDialog)
  const [selected, setSelected] = useState('')
  const [tab, setTab] = useState<'files' | 'index'>('files')
  /** What the person typed in each file and has not saved yet, by path. */
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const client = useQueryClient()
  const toast = useUi((s) => s.showToast)
  const save = useMutation({
    mutationFn: ({ rel, body }: { rel: string; body: string }) => api.saveProfileFile(rel, body),
    onSuccess: async (_r, { rel }) => {
      await client.invalidateQueries()
      setDrafts(({ [rel]: _saved, ...rest }) => rest)
      toast('Arquivo salvo no repositório do perfil')
    },
    onError: (error) => toast(errorText(error)),
  })

  if (isLoading) return null
  if (!profile) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <PageHeader title="Perfil do usuário" subtitle="Instruções suas para IAs, valendo em todos os projetos." />
        <div className="px-gutter">
          <div className="surface-card flex items-center gap-4 rounded-lg p-6">
            <p className="flex-1 text-body text-muted">Nenhum repositório de perfil ligado ainda. Use um que você já tem ou deixe o Excalibur criar um.</p>
            <Button variant="primary" onClick={() => openDialog('profile-setup')}>
              Escolher repositório
            </Button>
          </div>
        </div>
      </div>
    )
  }
  const file = profile.files.find((f) => f.rel === selected) ?? profile.files[0]
  const text = file ? (drafts[file.rel] ?? file.body) : ''
  const dirty = !!file && text !== file.body
  const setText = (value: string) => file && setDrafts((d) => ({ ...d, [file.rel]: value }))
  const discard = () => file && setDrafts(({ [file.rel]: _gone, ...rest }) => rest)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Perfil do usuário"
        subtitle={<PathLink path={profile.repoPath} onOpen={() => openPath(profile.repoPath)} />}
        actions={
          <>
            <Button onClick={() => openDialog('profile-setup')}>Trocar repositório</Button>
            <Button disabled={!profile.uncommitted} onClick={() => openDialog('profile-commit')}>
              Commit…
            </Button>
          </>
        }
      />
      <div className="-mt-4 flex flex-wrap items-center gap-2 px-gutter pb-8">
        {profile.branch ? (
          <Badge>
            <GitBranch className="size-3" /> {profile.branch}
          </Badge>
        ) : null}
        <Badge>
          <StatusDot tone={profile.uncommitted ? 'warn' : 'ok'} />
          {profile.uncommitted ? `${profile.uncommitted} ${profile.uncommitted === 1 ? 'alteração' : 'alterações'} sem commit` : 'sem alterações'}
        </Badge>
        <Badge>
          <KindIcon kind="github" className="size-3" /> {profile.remote ? profile.remote : 'sem remoto'}
        </Badge>
      </div>
      {file ? (
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_var(--aside-width)]">
        <div className="min-h-0 select-text overflow-auto px-gutter pb-gutter">
          <p className="mb-3"><PathLink path={file.rel} onOpen={() => openPath(file.rel)} /></p>
          <div className="mb-4 flex flex-col gap-2 text-body">
            <span className="h-control truncate rounded-full bg-field px-4 py-2 text-muted">description: {file.description}</span>
            <span className="h-control truncate rounded-full bg-field px-4 py-2 text-muted">when: {file.when}</span>
          </div>
          <textarea
            key={file.rel}
            aria-label={`Texto de ${file.rel}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="surface-card block min-h-48 w-full resize-y rounded-lg p-5 font-mono text-body leading-relaxed outline-none"
            rows={Math.min(24, Math.max(8, text.split('\n').length + 1))}
          />
          <div className="surface-card mt-4 flex items-center gap-3 rounded-lg px-4 py-3 text-body">
            <StatusDot tone={dirty ? 'warn' : 'ok'} />
            {dirty ? 'Alterações ainda não salvas. Salvar modifica o repositório do perfil.' : 'Salvar modifica o repositório do perfil.'}
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="primary" disabled={!dirty || save.isPending} onClick={() => save.mutate({ rel: file.rel, body: text })}>
              Salvar
            </Button>
            <Button disabled={!dirty || save.isPending} onClick={discard}>
              Descartar
            </Button>
          </div>
        </div>
        <aside className="surface-card min-h-0 overflow-auto px-4 py-5 text-body">
          <div className="mb-4 flex h-control-sm gap-0.5 rounded-full bg-field p-1 text-caption">
            {(['files', 'index'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn('h-full flex-1 rounded-full px-3 font-semibold transition-colors duration-150', tab === t ? 'bg-selected text-ink' : 'text-muted hover:text-ink')}
              >
                {t === 'files' ? 'Arquivos' : 'Índice'}
              </button>
            ))}
          </div>
          {tab === 'files' ? (
            <ul className="flex flex-col gap-0.5">
              {profile.files.map((f) => (
                <li key={f.rel}>
                  <button
                    type="button"
                    onClick={() => setSelected(f.rel)}
                    className={cn('flex w-full items-center gap-2 rounded-md px-3 py-2 text-left font-mono text-caption transition-colors duration-150 hover:bg-hover', f.rel === file.rel && 'bg-selected')}
                  >
                    <FileText className="size-3.5 shrink-0 text-muted" />
                    <span className="truncate">{f.rel}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="flex flex-col gap-4 px-3">
              {profile.files.map((f) => (
                <li key={f.rel}>
                  <p className="font-mono text-caption">{f.rel}</p>
                  <Badge className="mt-1.5">{f.when}</Badge>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
      ) : (
        <p className="px-gutter text-body text-muted">O repositório do perfil ainda não tem arquivos de instruções.</p>
      )}
    </div>
  )
}
