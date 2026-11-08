import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { Attention } from '@shared/contract'
import { api } from '@/shared/api'
import { useUi } from '@/shared/state/ui-store'
import { Button } from '@/shared/ui/primitives/Button'
import { StatusDot } from '@/shared/ui/primitives/StatusDot'
import { PageBody } from '@/shared/ui/layout/PageBody'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { ProjectSection } from '@/features/projects/components/ProjectSection'
import { errorText, useFixAll, useProjects } from '@/features/projects/hooks'

/** The start screen is the list of projects: open one, or add another from the header. */
export function HomePage() {
  const openDialog = useUi((s) => s.openDialog)
  const { data, isLoading } = useProjects()
  const { data: attention = [] } = useQuery({ queryKey: ['attention'], queryFn: () => api.listAttention() })
  const navigate = useNavigate()
  const client = useQueryClient()
  const toast = useUi((s) => s.showToast)
  const askFix = useUi((s) => s.askFix)
  const fixAll = useFixAll()
  const remove = useMutation({
    mutationFn: (path: string) => api.removeMissingRepo(path),
    onSuccess: () => toast('Removido do app. Nenhum arquivo foi apagado.'),
    onError: (error) => toast(errorText(error)),
    onSettled: () => void client.invalidateQueries(),
  })

  /** Each attention item says what its button does; fixes that leave the machine ask first. */
  const resolve = (item: Attention) => {
    if (item.kind === 'profile') return navigate('/profile')
    if (item.kind === 'remove') return item.path && remove.mutate(item.path)
    const targets = item.repos.map((r) => ({ repoId: r.id, repoName: r.name, item: { id: item.fixId ?? item.id, label: item.text, detail: '', action: item.action, previewable: false } }))
    if (item.fixId === 'remote') return askFix({ targets })
    fixAll.run(targets)
  }
  const empty = !isLoading && !data?.projects.length && !data?.standalone.length

  return (
    <>
      <PageHeader
        title="Seus projetos"
        subtitle="Tudo o que o Excalibur gerencia nesta máquina."
        actions={
          <>
            <Button onClick={() => openDialog('incorporate-project')}>Incorporar projeto</Button>
            <Button variant="primary" onClick={() => openDialog('create-project')}>
              Criar projeto
            </Button>
          </>
        }
      />
      <PageBody>
        {empty ? (
          <div className="surface-card flex items-center gap-6 rounded-lg p-6">
            <p className="flex-1 text-body text-muted">Nenhum repositório aqui ainda. Incorpore uma pasta com repositórios que já usam o Excalibur, ou crie um projeto novo.</p>
            <Button variant="primary" onClick={() => openDialog('incorporate-project')}>
              Incorporar projeto
            </Button>
          </div>
        ) : null}

        {attention.length ? (
          <ul className="surface-card mb-6 flex flex-col rounded-lg p-2">
            {attention.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-1.5 pl-3 pr-1.5">
                <StatusDot />
                <span className="flex-1 text-body">{item.text}</span>
                <Button size="sm" disabled={fixAll.pending || remove.isPending} onClick={() => resolve(item)}>
                  {item.action}
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-col gap-4">
          {data?.projects.map((p) => (
            <ProjectSection
              key={p.id}
              name={p.name}
              caption={`${p.path} · ${p.repos.length} ${p.repos.length === 1 ? 'repositório' : 'repositórios'}`}
              repos={p.repos}
              to={`/projects/${p.id}`}
              repoPath={(r) => `/projects/${p.id}/repos/${r.id}`}
            />
          ))}
          {data?.standalone.length ? (
            <ProjectSection name="Avulsos" caption={`${data.standalone.length} ${data.standalone.length === 1 ? 'repositório' : 'repositórios'} sem projeto`} repos={data.standalone} repoPath={(r) => `/projects/standalone/repos/${r.id}`} />
          ) : null}
        </div>
      </PageBody>
    </>
  )
}
