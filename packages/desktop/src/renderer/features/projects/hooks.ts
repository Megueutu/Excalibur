import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import type { HealthItem, Project, Repo, RepoDetail } from '@shared/contract'
import { api } from '@/shared/api'
import { useUi } from '@/shared/state/ui-store'

export const STANDALONE_ID = 'standalone'

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: () => api.listProjects() })
}

export function useProject(id: string | undefined) {
  const query = useProjects()
  return { ...query, data: query.data?.projects.find((p) => p.id === id) }
}

/** The project, or a stand-in "Avulsos" project holding the repositories that belong to none. */
export function useProjectOrStandalone(id: string | undefined) {
  const query = useProjects()
  const data = query.data
  const project: Project | undefined =
    id === STANDALONE_ID
      ? data && { id: STANDALONE_ID, name: 'Avulsos', path: 'Repositórios sem projeto', mode: 'public', workMode: null, modules: [], profiles: [], repos: data.standalone }
      : data?.projects.find((p) => p.id === id)
  return { ...query, data: project }
}

export function useRepoDetail(repoId: string | undefined) {
  return useQuery({ queryKey: ['repo-detail', repoId], queryFn: () => api.getRepoDetail(repoId!), enabled: !!repoId })
}

export function useRepoFile(repoId: string | undefined, fileId: string | undefined) {
  return useQuery({ queryKey: ['repo-file', repoId, fileId], queryFn: () => api.readFile(repoId!, fileId!), enabled: !!repoId && !!fileId })
}

export function useCatalog() {
  return useQuery({ queryKey: ['catalog'], queryFn: () => api.getCatalog() })
}

/** The detail of every repository in a list, by repository id. Entries appear as each one loads. */
export function useRepoDetails(repos: Repo[]): Record<string, RepoDetail | undefined> {
  const results = useQueries({ queries: repos.map((r) => ({ queryKey: ['repo-detail', r.id], queryFn: () => api.getRepoDetail(r.id) })) })
  return Object.fromEntries(repos.map((r, i) => [r.id, results[i]?.data]))
}

/** The reason, without the wrapper Electron puts around an error that crossed the bridge. */
export function errorText(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error)
  return text.replace(/^Error invoking remote method '[^']+': (Error: )?/, '')
}

/** Fixes that stay on this machine apply at once. Creating the remote is the one that does not, so it is asked first. */
const ASKS_FIRST = new Set(['remote'])

type FixTarget = { repoId: string; repoName: string; item: HealthItem }

/** Apply or preview one health fix. The result, or the reason it failed, comes back as a toast. */
export function useFix() {
  const client = useQueryClient()
  const toast = useUi((s) => s.showToast)
  const askFix = useUi((s) => s.askFix)
  const mutation = useMutation({
    mutationFn: ({ repoId, item, preview }: FixTarget & { preview: boolean }) => api.runFix(repoId, item.id, preview),
    onSuccess: (result) => toast(result.summary),
    onError: (error) => toast(errorText(error)),
    onSettled: (_r, _e, vars) => {
      if (!vars.preview) void client.invalidateQueries()
    },
  })
  return {
    pending: mutation.isPending,
    preview: (target: FixTarget) => mutation.mutate({ ...target, preview: true }),
    apply: (target: FixTarget) => (ASKS_FIRST.has(target.item.id) ? askFix({ targets: [target] }) : mutation.mutate({ ...target, preview: false })),
  }
}

/**
 * Apply every fix in the list one after the other and say how it went. The ones that ask first are
 * skipped unless the person already said yes (`confirmed`). A single fix reports its own result or reason.
 */
export function useFixAll() {
  const client = useQueryClient()
  const toast = useUi((s) => s.showToast)
  const mutation = useMutation({
    mutationFn: async ({ targets, confirmed }: { targets: FixTarget[]; confirmed: boolean }) => {
      const todo = confirmed ? targets : targets.filter((t) => !ASKS_FIRST.has(t.item.id))
      let failed = 0
      let note = ''
      for (const t of todo) {
        try {
          note = (await api.runFix(t.repoId, t.item.id, false)).summary
        } catch (error) {
          failed++
          note = errorText(error)
        }
      }
      return { done: todo.length - failed, failed, skipped: targets.length - todo.length, note: todo.length === 1 ? note : '' }
    },
    onSuccess: ({ done, failed, skipped, note }) => {
      if (note) return toast(note)
      const parts = [`${done} resolvidos`]
      if (failed) parts.push(`${failed} falharam`)
      if (skipped) parts.push(`${skipped} esperam a sua confirmação`)
      toast(parts.join(' · '))
    },
    onSettled: () => void client.invalidateQueries(),
  })
  return { pending: mutation.isPending, run: (targets: FixTarget[], confirmed = false) => mutation.mutate({ targets, confirmed }) }
}
