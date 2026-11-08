import type { Project, Repo, RepoDetail } from '@shared/contract'
import { cn } from '@/shared/lib/cn'
import { openPath } from '@/shared/lib/use-open-path'
import { GitBranch } from '@/shared/ui/icons'
import { Badge } from '@/shared/ui/primitives/Badge'
import { PathLink } from '@/shared/ui/primitives/PathLink'
import { KindIcon } from './KindIcon'
import { OpenInEditor } from './OpenInEditor'
import { StackIcons } from './StackIcons'
import { FilesTab } from './files/FilesTab'
import { ConfigTab } from './tabs/ConfigTab'
import { HealthTab } from './tabs/HealthTab'
import { TasksTab } from './tabs/TasksTab'

export const REPO_TABS = ['tarefas', 'saude', 'arquivos', 'config'] as const
export type RepoTab = (typeof REPO_TABS)[number]
const TAB_LABEL: Record<RepoTab, string> = { tarefas: 'Tarefas', saude: 'Saúde', arquivos: 'Arquivos', config: 'Configuração' }

type Props = {
  project: Project
  repo: Repo
  detail: RepoDetail
  tab: RepoTab
  onTab: (tab: RepoTab) => void
  file: string
  onFile: (id: string) => void
}

/** One repository: a one-line header, then tabs for what you can do or read in it. */
export function RepoPanel({ project, repo, detail, tab, onTab, file, onFile }: Props) {
  const counts: Partial<Record<RepoTab, number>> = {
    tarefas: detail.tasks.filter((t) => t.status === 'in-progress').length,
    saude: detail.health.length,
    arquivos: detail.files.length,
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start gap-x-4 gap-y-3">
        <KindIcon kind={repo.kind} className="mt-0.5 size-7" />
        <div className="min-w-48 flex-1">
          <h2 className="truncate text-title" title={repo.name}>
            {repo.name}
          </h2>
          <p className="mt-2">
            <PathLink path={repo.path} onOpen={() => openPath(repo.path)} />
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {repo.isHub ? <Badge>hub</Badge> : null}
            {repo.branch ? (
              <Badge>
                <GitBranch className="size-3.5" />
                {repo.branch}
                {repo.uncommitted ? ` · ${repo.uncommitted} ${repo.uncommitted === 1 ? 'alteração' : 'alterações'}` : ''}
              </Badge>
            ) : null}
            {repo.stack.length ? (
              <Badge>
                <StackIcons stack={repo.stack} max={6} iconClassName="size-3.5" className="gap-2" />
              </Badge>
            ) : null}
          </div>
        </div>
        <OpenInEditor path={repo.path} />
      </header>

      <div className="mb-6 flex">
        <div role="tablist" className="inline-flex h-control max-w-full gap-0.5 overflow-x-auto rounded-full bg-field p-1 [scrollbar-width:none]">
          {REPO_TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => onTab(t)}
              className={cn('no-drag h-full shrink-0 rounded-full px-4 text-body font-semibold transition-colors duration-150 focus-visible:-outline-offset-2', tab === t ? 'bg-selected text-ink' : 'text-muted hover:text-ink')}
            >
              {TAB_LABEL[t]}
              {counts[t] ? <span className="ml-1.5 text-caption font-normal opacity-70">{counts[t]}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {tab === 'tarefas' ? <TasksTab repo={repo} project={project} detail={detail} /> : null}
      {tab === 'saude' ? <HealthTab repo={repo} detail={detail} /> : null}
      {tab === 'arquivos' ? <FilesTab key={repo.id} repoId={repo.id} project={project} detail={detail} file={file} onFile={onFile} /> : null}
      {tab === 'config' ? <ConfigTab key={repo.id} project={project} repo={repo} detail={detail} /> : null}
    </div>
  )
}
