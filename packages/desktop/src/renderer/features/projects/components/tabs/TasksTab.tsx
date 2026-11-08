import type { Project, Repo, RepoDetail } from '@shared/contract'
import { useUi } from '@/shared/state/ui-store'
import { Plus } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/primitives/Button'
import { TaskRow } from '../TaskRow'

export function TasksTab({ repo, project, detail }: { repo: Repo; project: Project; detail: RepoDetail }) {
  const openNewTask = useUi((s) => s.openNewTask)
  const create = () => openNewTask({ repos: project.repos.map((r) => ({ id: r.id, name: r.name })), repoId: repo.id })
  if (!detail.tasks.length) {
    return (
      <div className="surface-control flex items-center gap-4 rounded-md p-5 text-body text-muted">
        <span className="flex-1">Nenhuma tarefa ainda. Uma tarefa nasce de uma spec: o agente lê a spec, não o seu pedido solto.</span>
        <Button variant="primary" size="sm" onClick={create}>
          Nova tarefa
        </Button>
      </div>
    )
  }
  return (
    <>
      <div className="mb-3 flex items-center">
        <Button size="sm" className="ml-auto" onClick={create}>
          <Plus className="size-3.5" /> Nova tarefa
        </Button>
      </div>
      <div className="flex flex-col gap-1.5">
        {detail.tasks.map((t) => (
          <TaskRow key={t.slug} task={t} projectId={project.id} repoId={repo.id} files={detail.files} />
        ))}
      </div>
    </>
  )
}
