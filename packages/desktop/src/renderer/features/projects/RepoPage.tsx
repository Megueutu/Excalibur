import { useParams } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { Badge, StatusDot } from '@/shared/ui/badge'
import { Fact, Group, PageHeader, Section } from '@/shared/ui/page'
import { useProjects } from './hooks'

export function RepoPage() {
  const { projectId, repoId } = useParams()
  const { data, isLoading } = useProjects()
  if (isLoading) return null

  const project = data?.projects.find((p) => p.id === projectId)
  const repo = project?.repos.find((r) => r.id === repoId) ?? data?.standalone.find((r) => r.id === repoId)
  if (!repo) return <PageHeader title="Repositório não encontrado" />

  const stale = repo.snapshot === 'stale'

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
        {stale ? (
          <div className="mb-8 flex items-center gap-3 rounded-lg bg-panel px-4 py-3 text-sm">
            <StatusDot />
            Perfil do usuário desatualizado: o repositório do perfil mudou desde o último sync.
          </div>
        ) : null}
        <Section title="Estado">
          <Group>
          <dl>
            <Fact label="Versão">{repo.frameworkVersion}</Fact>
            <Fact label="Snapshot do perfil">{stale ? 'velho' : repo.snapshot === 'fresh' ? 'em dia' : 'sem perfil'}</Fact>
            <Fact label="Papel">{repo.isHub ? <Badge>hub de contexto</Badge> : 'repositório do projeto'}</Fact>
          </dl>
          </Group>
        </Section>
      </div>
    </>
  )
}
