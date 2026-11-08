import { Link, useParams } from 'react-router-dom'
import type { Repo } from '@shared/contract'
import { useUi } from '@/shared/state/ui-store'
import { Badge, StatusDot } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page'
import { KindIcon, StackIcons } from '@/shared/ui/repo-icons'
import { useProject } from './hooks'

export const SNAPSHOT_TEXT = { fresh: 'Em dia', stale: 'Perfil desatualizado', none: 'Sem perfil' } as const

function RepoCard({ to, repo }: { to: string; repo: Repo }) {
  return (
    <Link to={to} className="no-drag flex flex-col gap-4 rounded-lg bg-panel p-5 hover:bg-panel-2">
      <div className="flex items-center gap-3">
        <KindIcon kind={repo.kind} size={20} className="text-muted" />
        <span className="truncate text-[15px] font-semibold">{repo.name}</span>
        {repo.isHub ? <Badge className="bg-bg">hub</Badge> : null}
      </div>
      <StackIcons stack={repo.stack} max={5} size={18} className="min-h-[18px]" />
      <p className="flex items-center gap-2 text-sm text-muted">
        <StatusDot tone={repo.snapshot === 'stale' ? 'warn' : 'ok'} />
        {SNAPSHOT_TEXT[repo.snapshot]}
        <span className="ml-auto text-xs">v{repo.frameworkVersion}</span>
      </p>
    </Link>
  )
}

export function ProjectPage() {
  const { projectId } = useParams()
  const { data: project, isLoading } = useProject(projectId)
  const openDialog = useUi((s) => s.openDialog)

  if (isLoading) return null
  if (!project) return <PageHeader title="Projeto não encontrado" />

  return (
    <>
      <PageHeader
        title={project.name}
        subtitle={project.path}
        actions={
          <>
            <Button disabled title="Protótipo: nada é gravado">
              Sincronizar
            </Button>
            <Button variant="primary" onClick={() => openDialog('create-project')}>
              Adicionar repositório
            </Button>
          </>
        }
      />
      <div className="min-h-0 flex-1 overflow-auto px-8 pb-8">
        <div className="mb-8 flex flex-wrap gap-2">
          <Badge>{project.mode === 'public' ? 'público' : 'discreto'}</Badge>
          {project.workMode ? <Badge>modo {project.workMode}</Badge> : null}
          {project.modules.map((m) => (
            <Badge key={m}>{m}</Badge>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {project.repos.map((r) => (
            <RepoCard key={r.id} to={`/projects/${project.id}/repos/${r.id}`} repo={r} />
          ))}
        </div>
      </div>
    </>
  )
}
