import { existsSync, readdirSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import type { FoundRepo } from '../../shared/contract'
import { core } from '../core'
import { gitInfo } from './git'
import { expandHome, isInside, tilde } from './paths'
import { detectStack } from './stack'

const MAX_CHILDREN = 60
const SKIP = new Set(['node_modules', '.git'])

const isRepo = (dir: string) => existsSync(join(dir, '.git')) || core().locateConfig(dir) !== null

/**
 * Look in a folder, and one level inside it, for repositories. A folder counts if it is a git
 * repository or has an Excalibur config. Only the ones with a config can be brought into the app.
 */
export async function scanFolder(shown: string): Promise<FoundRepo[]> {
  const c = core()
  const folder = expandHome(shown)
  if (!existsSync(folder) || !statSync(folder).isDirectory()) return []

  const children = readdirSync(folder, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !SKIP.has(e.name))
    .slice(0, MAX_CHILDREN)
    .map((e) => join(folder, e.name))
  const candidates = [folder, ...children].filter(isRepo)
  const registered = c.readRegistry().map((e) => e.path)

  const found: FoundRepo[] = []
  for (const dir of candidates) {
    const [git, stack] = await Promise.all([gitInfo(dir), detectStack(dir)])
    found.push({
      path: tilde(dir),
      name: basename(dir),
      kind: git.kind,
      stack,
      configured: c.locateConfig(dir) !== null,
      registered: registered.some((p) => c.samePath(p, dir)),
    })
  }
  return found
}

/** Put repositories in the registry. A folder without an Excalibur config is refused: the app does not run `init`. */
export function addRepos(shownPaths: string[]): void {
  const c = core()
  for (const shown of shownPaths) {
    const dir = expandHome(shown)
    if (!existsSync(dir)) throw new Error(`${shown} does not exist.`)
    if (!c.locateConfig(dir)) throw new Error(`${shown} has no Excalibur config. Run \`excalibur init\` there first.`)
    c.registerProject(dir)
  }
}

/** Folders the app may open or read: the registered repositories, their SDDs, and the user profile repository. */
export function allowedRoots(): string[] {
  const c = core()
  const roots = c.readRegistry().flatMap((e) => [e.path, c.configuredSddPath(e.path)].filter((p): p is string => !!p))
  const profile = c.getProfileRepo()
  return profile ? [...roots, profile] : roots
}

export function isAllowed(absolute: string): boolean {
  return allowedRoots().some((root) => isInside(root, absolute))
}

/** Forget a registered repository whose folder is gone. A folder that still exists is refused, so this can never drop a live repository. */
export function removeMissingRepo(path: string): void {
  const c = core()
  const entry = c.readRegistry().find((e) => c.samePath(e.path, path))
  if (!entry) throw new Error('Esse repositório não está no registro.')
  if (existsSync(entry.path)) throw new Error(`${tilde(entry.path)} ainda existe. Só repositórios sem pasta podem ser removidos.`)
  c.unregisterProject(entry.path)
}
