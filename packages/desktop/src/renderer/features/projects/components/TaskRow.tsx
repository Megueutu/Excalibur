import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { RepoFile, Task } from '@shared/contract'
import { api } from '@/shared/api'
import { useUi } from '@/shared/state/ui-store'
import { Button } from '@/shared/ui/primitives/Button'
import { Pill } from '@/shared/ui/primitives/Pill'
import { ProgressBar } from '@/shared/ui/primitives/ProgressBar'
import { errorText } from '../hooks'
import { SPEC_STATUS, TASK_STATUS } from '../lib/task-status'

type Props = {
  task: Task
  projectId: string
  repoId: string
  /** The repository's files, to find the task's spec. */
  files: RepoFile[]
  /** Show the repository name in front of the task (the project overview). */
  repoName?: string
}

/** A task: its state, the spec's state, progress, and a warning when the spec fell behind the code. */
export function TaskRow({ task, projectId, repoId, files, repoName }: Props) {
  const status = TASK_STATUS[task.status]
  const navigate = useNavigate()
  const client = useQueryClient()
  const toast = useUi((s) => s.showToast)
  const resume = useMutation({
    mutationFn: () => api.resumeTask(repoId, task.slug),
    onSuccess: () => toast(`${task.slug} voltou a andar`),
    onError: (error) => toast(errorText(error)),
    onSettled: () => void client.invalidateQueries(),
  })

  /** Open the task's spec in the repository's files. Falls back to the files tab when the spec is not listed. */
  const openSpec = () => {
    const spec = files.find((f) => f.id.endsWith(`/${task.slug}/spec.md`))
    navigate(`/projects/${projectId}/repos/${repoId}?tab=arquivos${spec ? `&file=${encodeURIComponent(spec.id)}` : ''}`)
  }

  return (
    <div className="surface-control grid min-h-row grid-cols-[1fr_9.5rem_auto] items-center gap-4 rounded-md px-4 py-3 transition-colors duration-150 hover:bg-hover">
      <div className="min-w-0">
        <p className="truncate text-heading">{repoName ? `${repoName} · ${task.slug}` : task.slug}</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-muted">
          <Pill tone={status.tone}>{status.label}</Pill>
          spec {SPEC_STATUS[task.spec].label.toLowerCase()}
          {task.drift ? <span className="font-semibold text-warn">· {task.drift}</span> : null}
        </p>
      </div>
      <div>
        <ProgressBar value={task.stepsTotal ? task.stepsDone / task.stepsTotal : 0} tone={status.bar} />
        <p className="mt-1.5 text-caption text-muted">
          {task.stepsDone} de {task.stepsTotal} etapas
        </p>
      </div>
      <Button size="sm" disabled={resume.isPending} onClick={task.status === 'paused' ? () => resume.mutate() : openSpec}>
        {status.action}
      </Button>
    </div>
  )
}
