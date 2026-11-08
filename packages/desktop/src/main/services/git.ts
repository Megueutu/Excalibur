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

/** What git says about a folder: is it a repository, where does it push, which branch, how dirty. */
export async function gitInfo(cwd: string): Promise<GitInfo> {
  if (!existsSync(join(cwd, '.git'))) return { kind: 'folder', remote: null, branch: null, uncommitted: 0 }
  const [url, branch, status] = await Promise.all([git(cwd, ['remote', 'get-url', 'origin']), git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']), git(cwd, ['status', '--porcelain'])])
  const isGitHub = !!url && /github\.com/i.test(url)
  return {
    kind: isGitHub ? 'github' : 'git',
    remote: url ? remoteSlug(url) : null,
    branch: branch && branch !== 'HEAD' ? branch : null,
    uncommitted: status ? status.split(/\r?\n/).filter(Boolean).length : 0,
  }
}

/** How many commits the repository has made since `commit`. Null when it cannot tell. */
export async function commitsSince(cwd: string, commit: string): Promise<number | null> {
  if (!/^[0-9a-f]{4,40}$/i.test(commit)) return null
  const count = await git(cwd, ['rev-list', '--count', `${commit}..HEAD`])
  return count === null ? null : Number(count)
}
