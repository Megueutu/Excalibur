import type { Project, RepoDetail } from '@shared/contract'
import { Button } from '@/shared/ui/primitives/Button'
import { ProgressBar } from '@/shared/ui/primitives/ProgressBar'
import { contextLayers, formatTokens } from '../lib/context'
import { useCatalog, useFixAll } from '../hooks'
import { HealthRow } from './HealthRow'
import { KindIcon } from './KindIcon'
import { TaskRow } from './TaskRow'

const label = 'mb-2 px-1 text-caption font-semibold text-muted'

/** The project as a whole: what is in flight, what needs attention, and what each repo costs in context. */
export function OverviewPanel({ project, details }: { project: Project; details: Record<string, RepoDetail | undefined> }) {
  const { data: catalog } = useCatalog()
  const fixAll = useFixAll()
  const tasks = project.repos.flatMap((r) => (details[r.id]?.tasks ?? []).filter((t) => t.status !== 'done').map((t) => ({ repo: r, task: t, files: details[r.id]?.files ?? [] })))
  const health = project.repos.flatMap((r) => (details[r.id]?.health ?? []).map((h) => ({ repoId: r.id, repoName: r.name, item: h })))
  const limit = catalog?.contextLimit ?? 1

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className={label}>Em andamento</h3>
        {tasks.length ? (
          <div className="flex flex-col gap-1.5">
            {tasks.map(({ repo, task, files }) => (
              <TaskRow key={`${repo.id}/${task.slug}`} task={task} projectId={project.id} repoId={repo.id} repoName={repo.name} files={files} />
            ))}
          </div>
        ) : (
          <p className="surface-control rounded-md p-5 text-body text-muted">Nenhuma tarefa em andamento.</p>
        )}
      </section>

      {health.length ? (
        <section>
          <div className="mb-2 flex items-center">
            <h3 className="px-1 text-caption font-semibold text-muted">Precisa de atenção</h3>
            <Button size="sm" className="ml-auto" disabled={fixAll.pending} onClick={() => fixAll.run(health)}>
              Resolver tudo
            </Button>
          </div>
          <div className="flex flex-col gap-1.5">
            {health.map(({ repoId, repoName, item }) => (
              <HealthRow key={`${repoId}/${item.id}`} item={item} repoId={repoId} repoName={repoName} named />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h3 className={label}>Quanto contexto o agente lê, por repositório</h3>
        <ul className="surface-control flex flex-col gap-3 rounded-md px-5 py-4">
          {project.repos.map((r) => {
            const total = contextLayers(details[r.id], null, catalog).total
            return (
              <li key={r.id} className="flex items-center gap-3">
                <KindIcon kind={r.kind} className="text-muted" />
                <span className="w-28 truncate text-heading">{r.name}</span>
                <ProgressBar value={total / limit} className="flex-1" />
                <span className="w-16 text-right text-caption text-muted">{formatTokens(total)}</span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
