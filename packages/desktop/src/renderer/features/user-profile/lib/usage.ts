import type { ProjectsOverview, Repo } from '@shared/contract'
import { needsSync } from '@/features/projects/lib/snapshot'

export type ProfileUsage = {
  /** Repositories that use the profile (it has a snapshot there, or is about to). */
  using: Repo[]
  /** Of those, the ones that have not received the latest version. */
  late: Repo[]
}

/** Which repositories read the profile, and which of them are behind it. */
export function profileUsage(overview: ProjectsOverview | undefined): ProfileUsage {
  const repos = [...(overview?.projects.flatMap((p) => p.repos) ?? []), ...(overview?.standalone ?? [])]
  const using = repos.filter((r) => r.snapshot !== 'none')
  return { using, late: using.filter((r) => needsSync(r.snapshot)) }
}

/** The health item that brings a repository up to date: the profile changed, or it was never synced. */
export function syncTarget(repo: Repo) {
  return {
    repoId: repo.id,
    repoName: repo.name,
    item: { id: repo.snapshot === 'stale' ? 'profile' : 'snapshot', label: 'Perfil do usuário', detail: '', action: 'Sincronizar', previewable: false },
  }
}
