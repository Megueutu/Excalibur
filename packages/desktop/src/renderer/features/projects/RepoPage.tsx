import { useParams } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Fact, PageHeader, Section } from '@/shared/ui/page'
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
      <div className="overflow-auto px-7 py-5">
        {stale ? (
          <div className="mb-5 rounded-md border-l-2 border-warn bg-panel px-3 py-2 text-sm">
            Perfil do usuário desatualizado: o repositório do perfil mudou desde o último sync.
          </div>
        ) : null}
        <Section title="Estado">
          <dl>
            <Fact label="Versão">{repo.frameworkVersion}</Fact>
            <Fact label="Snapshot do perfil">{stale ? 'velho' : repo.snapshot === 'fresh' ? 'em dia' : 'sem perfil'}</Fact>
            <Fact label="Papel">{repo.isHub ? <Badge>hub de contexto</Badge> : 'repositório do projeto'}</Fact>
          </dl>
        </Section>
      </div>
    </>
  )
}
