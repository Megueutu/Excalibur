import { execFile } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { promisify } from 'node:util'
import type { FixResult, TaskClass } from '../../shared/contract'
import { core } from '../core'
import { tilde } from './paths'
import { findRepo } from './registry'

const run = promisify(execFile)

/** `excalibur update` regenerates a lot; give it room, but not forever. */
const UPDATE_TIMEOUT_MS = 120_000

function repoRoot(repoId: string): string {
  const entry = findRepo(repoId)
  if (!entry) throw new Error(`Unknown repository: ${repoId}`)
  if (!existsSync(entry.path)) throw new Error(`${tilde(entry.path)} não existe mais.`)
  return entry.path
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

function syncProfile(root: string, preview: boolean): FixResult {
  const result = core().syncUserProfile(root, { dryRun: preview })
  switch (result.status) {
    case 'no-profile':
      throw new Error('Nenhum repositório de perfil está vinculado.')
    case 'repo-missing':
      throw new Error('O repositório de perfil vinculado não foi encontrado.')
    case 'empty':
      return { summary: 'Nenhum arquivo do perfil se aplica a este repositório.' }
    default: {
      const files = result.files ?? []
      const missing = result.missingProfiles?.length ? ` Perfis que não existem: ${result.missingProfiles.join(', ')}.` : ''
      return { summary: `${preview ? 'Sincronizaria' : 'Sincronizou'} ${count(files.length, 'arquivo', 'arquivos')} do perfil.${missing}` }
    }
  }
}

/** The CLI's own commands, run with the app's runtime as Node, so the app and the CLI never drift apart. */
export async function runCli(cwd: string, args: string[]): Promise<void> {
  const cli = join(core().packageRoot, 'packages', 'cli', 'excalibur.js')
  if (!existsSync(cli)) throw new Error('A CLI do Excalibur não foi encontrada ao lado do núcleo.')
  try {
    await run(process.execPath, [cli, ...args], { cwd, timeout: UPDATE_TIMEOUT_MS, env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } })
  } catch (error) {
    const out = error as { stderr?: string; stdout?: string; message: string }
    throw new Error((out.stderr || out.stdout || out.message).trim().split('\n').slice(-3).join(' '))
  }
}

async function updateFramework(root: string): Promise<FixResult> {
  await runCli(root, ['update'])
  return { summary: `Excalibur atualizado para ${core().frameworkVersion()}.` }
}

function createRemote(root: string): FixResult {
  try {
    const name = core().createRemote(root)
    return { summary: `Remoto ${name} criado no GitHub (privado). Nada foi enviado ainda.` }
  } catch (error) {
    const message = (error as { stderr?: Buffer; message: string }).stderr?.toString().trim() || (error as Error).message
    throw new Error(`Não foi possível criar o remoto: ${message}`)
  }
}

/**
 * Apply the fix a health item offers, or say what it would change. The ids are the ones the detail
 * reports: `profile` and `snapshot` sync the profile, `update` runs the CLI's update and `remote`
 * creates a private GitHub repository through the user's own `gh`. Nothing here pushes.
 */
export async function runFix(repoId: string, fixId: string, preview: boolean): Promise<FixResult> {
  const root = repoRoot(repoId)
  switch (fixId) {
    case 'profile':
    case 'snapshot':
      return syncProfile(root, preview)
    case 'update':
      if (preview) throw new Error('A atualização não tem pré-visualização.')
      return updateFramework(root)
    case 'remote':
      if (preview) throw new Error('Criar o remoto não tem pré-visualização.')
      return createRemote(root)
    default:
      throw new Error(`Não sei corrigir "${fixId}".`)
  }
}

/** A new task folder in the SDD, named for the repository, from the same template the CLI uses. */
export function createTask(repoId: string, slug: string, klass: TaskClass): { path: string } {
  const root = repoRoot(repoId)
  const sdd = core().configuredSddPath(root)
  if (!sdd || !existsSync(sdd)) throw new Error('A pasta do SDD ainda não existe. Termine o onboarding do repositório primeiro.')
  const { dir } = core().createTask(root, sdd, { repo: basename(root).toLowerCase(), slug, klass })
  return { path: tilde(dir) }
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

/**
 * Set a paused task back to in-progress. The task's state lives in its proposal's frontmatter
 * (`status: in-progress | done | paused`), so this changes that one line and nothing else.
 */
export function resumeTask(repoId: string, slug: string): void {
  const root = repoRoot(repoId)
  const sdd = core().configuredSddPath(root)
  if (!sdd || !SLUG.test(slug)) throw new Error('Tarefa inválida.')
  const file = join(sdd, 'specs', basename(root).toLowerCase(), slug, 'proposal.md')
  if (!existsSync(file)) throw new Error(`A tarefa ${slug} não tem proposta.`)
  const text = readFileSync(file, 'utf8')
  const head = text.match(/^---\r?\n[\s\S]*?\r?\n---/)?.[0]
  const line = head?.match(/^status:[ \t]*paused\b/m)
  if (!head || !line) throw new Error(`A tarefa ${slug} não está pausada.`)
  const next = head.replace(/^status:[ \t]*paused\b/m, 'status: in-progress')
  writeFileSync(file, next + text.slice(head.length), 'utf8')
}
