import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { Settings } from '../../shared/contract'
import { core } from '../core'
import { tilde } from './paths'

const run = promisify(execFile)
const GH_TIMEOUT_MS = 5000

/** Is the GitHub CLI there, and is it signed in? Only the exit code is read: no token ever reaches the app. */
async function ghStatus(): Promise<Settings['gh']> {
  try {
    await run('gh', ['auth', 'status'], { timeout: GH_TIMEOUT_MS, windowsHide: true })
    return 'ready'
  } catch (error) {
    return (error as { code?: string }).code === 'ENOENT' ? 'missing' : 'signed-out'
  }
}

/** What the Settings dialog shows: where the user's files are, what the defaults are, which tools work. */
export async function getSettings(): Promise<Settings> {
  const c = core()
  const paths = c.userPaths()
  return {
    configPath: tilde(paths.config),
    registryPath: tilde(paths.registry),
    frameworkVersion: c.frameworkVersion(),
    gh: await ghStatus(),
    snapshotDefault: c.getDefaultSnapshot(),
  }
}

export function setSnapshotDefault(value: 'ignored' | 'committed'): void {
  core().setDefaultSnapshot(value)
}
