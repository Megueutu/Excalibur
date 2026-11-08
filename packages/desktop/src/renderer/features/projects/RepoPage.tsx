import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { StatusDot } from '@/shared/ui/badge'
import { PageHeader } from '@/shared/ui/page'
import { KIND_LABEL, KindIcon, StackIcon, brandTitle } from '@/shared/ui/repo-icons'
import { SNAPSHOT_TEXT } from './ProjectPage'
import { useProjects } from './hooks'

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg bg-panel p-5">
      <h2 className="text-xs font-semibold text-muted">{label}</h2>
      {children}
    </section>
  )
}

export function RepoPage() {
  const { projectId, repoId } = useParams()
  const { data, isLoading } = useProjects()
  if (isLoading) return null

  const project = data?.projects.find((p) => p.id === projectId)
  const repo = project?.repos.find((r) => r.id === repoId) ?? data?.standalone.find((r) => r.id === repoId)
  if (!repo) return <PageHeader title="Repositório não encontrado" />

  const [language, ...others] = repo.stack

  return (
    <>
      <PageHeader
        title={repo.name}
        subtitle={`${repo.path}${project ? ` · projeto ${project.name}` : ' · avulso'}`}
        actions={
          <Button variant="primary" disabled title="Protótipo: nada é gravado">
            Sincronizar
          </Button>
        }
      />
      <div className="min-h-0 flex-1 overflow-auto px-8 pb-8">
        {repo.snapshot === 'stale' ? (
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-panel px-5 py-3 text-sm">
            <StatusDot />
            O repositório do perfil mudou desde o último sync.
          </div>
        ) : null}
        <div className="grid grid-cols-3 gap-4">
          <Tile label="Versionamento">
            <KindIcon kind={repo.kind} size={28} />
            <div>
              <p className="font-semibold">{KIND_LABEL[repo.kind]}</p>
              <p className="mt-1 text-sm text-muted">{repo.remote ?? 'sem remoto'}</p>
              {repo.branch ? <p className="text-sm text-muted">{repo.branch}</p> : null}
            </div>
          </Tile>
          <Tile label="Stack detectada">
            {language ? (
              <>
                <StackIcon tech={language} size={28} />
                <div>
                  <p className="font-semibold">{brandTitle(language)}</p>
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
                    {others.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1.5">
                        <StackIcon tech={t} size={14} /> {brandTitle(t)}
                      </span>
                    ))}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">Nada detectado.</p>
            )}
          </Tile>
          <Tile label="Excalibur">
            <p className="text-[28px] font-semibold leading-none tracking-[-0.02em]">v{repo.frameworkVersion}</p>
            <p className="flex items-center gap-2 text-sm text-muted">
              <StatusDot tone={repo.snapshot === 'stale' ? 'warn' : 'ok'} />
              {SNAPSHOT_TEXT[repo.snapshot]}
              {repo.isHub ? ' · hub de contexto' : ''}
            </p>
          </Tile>
        </div>
      </div>
    </>
  )
}
