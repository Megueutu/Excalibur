import { Link, useParams } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { Badge, StatusDot } from '@/shared/ui/badge'
import { Fact, PageHeader, Section } from '@/shared/ui/page'
import { useProject } from './hooks'

export function ProjectPage() {
  const { projectId } = useParams()
  const { data: project, isLoading } = useProject(projectId)

  if (isLoading) return null
  if (!project) return <PageHeader title="Projeto não encontrado" />

  const hub = project.repos.find((r) => r.isHub)
  const stale = project.repos.filter((r) => r.snapshot === 'stale').length

  return (
    <>
      <PageHeader
        title={project.name}
        subtitle={`${project.path} · hub de contexto: ${hub?.name ?? 'nenhum'} · ${project.repos.length} repositórios`}
        actions={
          <Button disabled title="Protótipo: nada é gravado">
            Sincronizar projeto
          </Button>
        }
      />
      <div className="overflow-auto px-7 py-5">
        <Section title="Configuração compartilhada">
          <dl>
            <Fact label="Modo">{project.mode === 'public' ? 'público' : 'discreto'}</Fact>
            <Fact label="Modo de trabalho">{project.workMode ?? 'nenhum'}</Fact>
            <Fact label="Módulos">
              <span className="flex gap-1.5">{project.modules.map((m) => <Badge key={m}>{m}</Badge>)}</span>
            </Fact>
            <Fact label="Perfis">
              <span className="flex gap-1.5">{project.profiles.map((m) => <Badge key={m}>{m}</Badge>)}</span>
            </Fact>
          </dl>
        </Section>
        <Section title={`Repositórios${stale ? ` · ${stale} com perfil velho` : ''}`}>
          <ul className="divide-y divide-border/60">
            {project.repos.map((r) => (
              <li key={r.id}>
                <Link to={`/projects/${project.id}/repos/${r.id}`} className="flex items-center gap-3 py-2.5 text-sm hover:text-text">
                  <span className="flex-1">
                    {r.name} {r.isHub ? <Badge className="ml-2">hub</Badge> : null}
                  </span>
                  <span className="text-xs text-muted">v{r.frameworkVersion}</span>
                  {r.snapshot === 'stale' ? <StatusDot /> : <StatusDot tone="ok" />}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  )
}
