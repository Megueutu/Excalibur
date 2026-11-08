import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import type { CreateProjectInput } from '../../shared/contract'
import { core } from '../core'
import { runCli } from './actions'
import { expandHome, tilde } from './paths'

const run = promisify(execFile)

const isEmpty = (dir: string) => !existsSync(dir) || readdirSync(dir).length === 0

/**
 * Make a project: one folder with a folder per repository. Every repository gets `git init` (unless it
 * is a plain folder) and the CLI's own `init --yes`, which also registers it. When one repository is
 * the hub, the SDD lives in it and the others point there. The GitHub remote is not created here:
 * it is the "Criar remoto" fix, which asks first.
 */
export async function createProject(input: CreateProjectInput): Promise<{ path: string }> {
  const c = core()
  const projectDir = resolve(expandHome(input.folder), input.name)
  if (!isEmpty(projectDir)) throw new Error(`${tilde(projectDir)} já existe e não está vazia.`)
  if (input.repos.filter((r) => r.hub).length > 1) throw new Error('Só um repositório pode ser o hub.')
  const names = new Set(input.repos.map((r) => r.name.toLowerCase()))
  if (names.size !== input.repos.length) throw new Error('Dois repositórios com o mesmo nome.')

  const dirs = input.repos.map((r) => ({ ...r, dir: join(projectDir, r.name) }))
  for (const r of dirs) {
    mkdirSync(r.dir, { recursive: true })
    if (r.kind !== 'folder') await run('git', ['init', '-q'], { cwd: r.dir, windowsHide: true })
    await runCli(r.dir, ['init', '--yes'])
  }

  const hub = dirs.find((r) => r.hub)
  if (hub) {
    for (const r of dirs) c.updateConfig(r.dir, { sdd_path: c.storedSddPath(r.dir, hub.dir) })
    c.writeSddMarker(hub.dir)
  }
  return { path: tilde(projectDir) }
}
