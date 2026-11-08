import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import type { RepoDetail } from '@shared/contract'
import { openPath } from '@/shared/lib/use-open-path'
import { useUi } from '@/shared/state/ui-store'
import { Plus } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/primitives/Button'
import { PathLink } from '@/shared/ui/primitives/PathLink'
import { PageBody } from '@/shared/ui/layout/PageBody'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { FilesNav } from '../components/FilesNav'
import { OverviewPanel } from '../components/OverviewPanel'
import { RepoNav } from '../components/RepoNav'
import { REPO_TABS, RepoPanel, type RepoTab } from '../components/RepoPanel'
import { STANDALONE_ID, useFixAll, useProjectOrStandalone, useRepoDetails } from '../hooks'

/** The file a repository opens on: its first spec, or else its first file. */
function defaultFile(detail: RepoDetail | undefined): string {
  return (detail?.files.find((f) => f.id.endsWith('/spec.md')) ?? detail?.files[0])?.id ?? ''
}

/**
 * A project: two sidebars side by side (repositories, and the files of the repository being read),
 * only one open at a time, and the panel with the project or one repository and its tabs. The files
 * sidebar exists only on the Arquivos tab. The tab and the open file live in the URL.
 */
export function ProjectPage() {
  const { projectId, repoId } = useParams()
  const [params, setParams] = useSearchParams()
  const { data: project, isLoading } = useProjectOrStandalone(projectId)
  const { enterProject, leaveProject, focusFiles, focusRepos } = useUi.getState()
  const details = useRepoDetails(project?.repos ?? [])
  const fixAll = useFixAll()
  const openNewTask = useUi.getState().openNewTask

  const repo = project?.repos.find((r) => r.id === repoId)
  const detail = repo ? details[repo.id] : undefined
  const requestedTab = params.get('tab') as RepoTab | null
  const tab: RepoTab = requestedTab && REPO_TABS.includes(requestedTab) ? requestedTab : 'tarefas'
  const showFiles = !!repo && tab === 'arquivos' && !!detail?.files.length

  // The project lists its repositories itself, so the fixed sidebar steps aside. It only closes: the
  // person can open it again, and leaving the project gives them back their own choice.
  useEffect(() => {
    enterProject()
    return leaveProject
  }, [projectId, enterProject, leaveProject])

  // The files sidebar takes the room when it appears, and the repository sidebar gets it back when it goes.
  useEffect(() => {
    if (showFiles) focusFiles()
    else focusRepos()
  }, [showFiles, focusFiles, focusRepos])

  if (isLoading) return null
  if (!project) return <PageHeader title="Projeto não encontrado" />

  const file = params.get('file') ?? defaultFile(detail)
  const setTab = (next: RepoTab) => setParams((p) => ({ ...Object.fromEntries(p), tab: next }), { replace: true })
  const openFile = (id: string) => setParams({ tab: 'arquivos', file: id })

  const hub = project.repos.find((r) => r.isHub)
  const isProject = project.id !== STANDALONE_ID
  // Only the profile syncs: the project-wide button is not a way to update every repository's framework.
  const syncTargets = project.repos.flatMap((r) => (details[r.id]?.health ?? []).filter((h) => h.id === 'profile' || h.id === 'snapshot').map((item) => ({ repoId: r.id, repoName: r.name, item })))

  return (
    <>
      <PageHeader
        title={project.name}
        subtitle={
          isProject ? (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <PathLink path={project.path} onOpen={() => openPath(project.path)} />
              <span>
                · {project.repos.length} repositórios{hub ? ` · hub ${hub.name}` : ''}
              </span>
            </span>
          ) : (
            project.path
          )
        }
        actions={
          isProject ? (
            <>
              <Button disabled={fixAll.pending || !syncTargets.length} onClick={() => fixAll.run(syncTargets)}>
                Sincronizar tudo
              </Button>
              <Button variant="primary" onClick={() => openNewTask({ repos: project.repos.map((r) => ({ id: r.id, name: r.name })), repoId: (repo ?? hub ?? project.repos[0]!).id })}>
                <Plus className="size-4" /> Nova tarefa
              </Button>
            </>
          ) : null
        }
      />
      <PageBody>
        <div className="flex items-start gap-4">
          <RepoNav project={project} details={details} selectedRepo={repo?.id} />
          {showFiles && detail ? <FilesNav detail={detail} selectedFile={file} onSelectFile={openFile} /> : null}
          <div className="surface-card min-h-[28rem] min-w-0 flex-1 rounded-lg p-6">
            {repo ? (
              detail ? (
                <RepoPanel key={repo.id} project={project} repo={repo} detail={detail} tab={tab} onTab={setTab} file={file} onFile={openFile} />
              ) : null
            ) : (
              <OverviewPanel project={project} details={details} />
            )}
          </div>
        </div>
      </PageBody>
    </>
  )
}
