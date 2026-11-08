import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'
import type { RepoKind } from '../../shared/contract'

const run = promisify(execFile)
const GIT_TIMEOUT_MS = 8000

async function git(cwd: string, args: string[]): Promise<string | null> {
  try {
    const { stdout } = await run('git', args, { cwd, timeout: GIT_TIMEOUT_MS, windowsHide: true })
    return stdout.trim()
  } catch {
    return null
  }
}

/** "owner/name" out of a remote URL, whatever the protocol. Falls back to the whole URL. */
export function remoteSlug(url: string): string {
  const match = url.match(/[:/]([^/:]+\/[^/]+?)(?:\.git)?$/)
  return match?.[1] ?? url
}

export type GitInfo = { kind: RepoKind; remote: string | null; branch: string | null; uncommitted: number }

/** What git says changes within seconds, and one screen asks for it several times (list, detail, attention). */
const INFO_TTL_MS = 4000
const infoCache = new Map<string, { at: number; info: Promise<GitInfo> }>()

/** Forget what git said, after something that changes it (a commit, a new remote, a sync). */
export function forgetGitInfo(): void {
  infoCache.clear()
}

async function readGitInfo(cwd: string): Promise<GitInfo> {
  if (!existsSync(join(cwd, '.git'))) return { kind: 'folder', remote: null, branch: null, uncommitted: 0 }
  // Two processes, not three: `status --branch` carries the branch name along with the changed files.
  const [url, status] = await Promise.all([git(cwd, ['remote', 'get-url', 'origin']), git(cwd, ['status', '--porcelain=v2', '--branch'])])
  const lines = status ? status.split(/\r?\n/).filter(Boolean) : []
  const head = lines.find((l) => l.startsWith('# branch.head '))?.slice('# branch.head '.length)
  const isGitHub = !!url && /github\.com/i.test(url)
  return {
    kind: isGitHub ? 'github' : 'git',
    remote: url ? remoteSlug(url) : null,
    branch: head && head !== '(detached)' ? head : null,
    uncommitted: lines.filter((l) => !l.startsWith('#')).length,
  }
}

/** What git says about a folder: is it a repository, where does it push, which branch, how dirty. */
export function gitInfo(cwd: string): Promise<GitInfo> {
  const hit = infoCache.get(cwd)
  if (hit && Date.now() - hit.at < INFO_TTL_MS) return hit.info
  const info = readGitInfo(cwd)
  infoCache.set(cwd, { at: Date.now(), info })
  return info
}

/** How many commits the repository has made since `commit`. Null when it cannot tell. */
export async function commitsSince(cwd: string, commit: string): Promise<number | null> {
  if (!/^[0-9a-f]{4,40}$/i.test(commit)) return null
  const count = await git(cwd, ['rev-list', '--count', `${commit}..HEAD`])
  return count === null ? null : Number(count)
}
