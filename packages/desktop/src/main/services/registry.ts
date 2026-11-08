import { existsSync } from 'node:fs'
import { basename, dirname } from 'node:path'
import type { Project, Repo, ProjectsOverview } from '../../shared/contract'
import { core, type RegistryEntry } from '../core'
import { gitInfo } from './git'
import { slug, tilde } from './paths'
import { detectStack } from './stack'

/** Run `work` over `items`, a few at a time, so a long list of repositories does not start dozens of git processes at once. */
async function mapLimit<T, R>(items: T[], limit: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++
        out[i] = await work(items[i]!)
      }
    }),
  )
  return out
}

/**
 * Ids for the repositories in the registry. The name is the id unless two repositories share it,
 * and then the later one gets a number. The same registry always gives the same ids.
 */
export function repoIds(entries: RegistryEntry[]): Map<string, RegistryEntry> {
  const byId = new Map<string, RegistryEntry>()
  for (const entry of entries) {
    const base = slug(basename(entry.path))
    let id = base
    for (let n = 2; byId.has(id); n++) id = `${base}-${n}`
    byId.set(id, entry)
  }
  return byId
}

/** The registered repository with this id, or null. */
export function findRepo(repoId: string): RegistryEntry | null {
  return repoIds(core().readRegistry()).get(repoId) ?? null
}

function numberOf(value: unknown): string {
  return String(value ?? '?')
}

async function toRepo(id: string, entry: RegistryEntry, isHub: boolean): Promise<Repo> {
  const c = core()
  const config = c.readConfig(entry.path) ?? {}
  const [git, stack] = await Promise.all([gitInfo(entry.path), detectStack(entry.path)])
  let snapshot: Repo['snapshot'] = 'none'
  try {
    const state = c.profileState(entry.path)
    snapshot = state.snapshot === 'none' && state.repoExists ? 'unsynced' : state.snapshot
  } catch {
    snapshot = 'none'
  }
  return {
    id,
    name: basename(entry.path),
    path: tilde(entry.path),
    frameworkVersion: numberOf(config.framework_version ?? entry.framework_version),
    snapshot,
    isHub,
    kind: git.kind,
    remote: git.remote,
    branch: git.branch,
    uncommitted: git.uncommitted,
    stack,
  }
}

/**
 * Projects out of the registry. The registry only knows repositories, so the grouping is by folder:
 * repositories that share a parent folder form a project named after it, and the rest are standalone.
 * A repository is the hub when another one in its group keeps its SDD in it.
 */
export async function listProjects(): Promise<ProjectsOverview> {
  const c = core()
  const present = [...repoIds(c.readRegistry())].filter(([, entry]) => existsSync(entry.path))

  const byParent = new Map<string, [string, RegistryEntry][]>()
  for (const item of present) {
    const parent = dirname(item[1].path).toLowerCase()
    byParent.set(parent, [...(byParent.get(parent) ?? []), item])
  }

  const projects: Project[] = []
  const standalone: Repo[] = []
  const projectIds = new Set<string>()

  for (const group of byParent.values()) {
    const sddRoots = group.map(([, e]) => c.configuredSddPath(e.path)).filter((p): p is string => !!p)
    const isHub = (entry: RegistryEntry) => sddRoots.some((sdd) => c.samePath(sdd, entry.path)) && group.length > 1
    const repos = await mapLimit(group, 4, ([id, entry]) => toRepo(id, entry, isHub(entry)))

    if (group.length < 2) {
      standalone.push(...repos)
      continue
    }
    const lead = group.find(([, e]) => isHub(e))?.[1] ?? group[0]![1]
    const config = c.readConfig(lead.path) ?? {}
    const folder = dirname(lead.path)
    let id = slug(basename(folder))
    for (let n = 2; projectIds.has(id); n++) id = `${slug(basename(folder))}-${n}`
    projectIds.add(id)
    projects.push({
      id,
      name: basename(folder),
      path: tilde(folder),
      mode: config.mode === 'discreet' ? 'discreet' : 'public',
      workMode: c.activeMode(lead.path),
      modules: c.activeModules(lead.path),
      profiles: c.getProjectSettings(lead.path).profiles,
      repos,
    })
  }

  projects.sort((a, b) => a.name.localeCompare(b.name))
  standalone.sort((a, b) => a.name.localeCompare(b.name))
  return { projects, standalone }
}

/** Registered repositories whose folder is gone, for the "needs attention" list. */
export function missingRepos(): RegistryEntry[] {
  return core()
    .readRegistry()
    .filter((e) => !existsSync(e.path))
}
