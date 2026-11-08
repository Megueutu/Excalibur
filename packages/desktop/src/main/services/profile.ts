import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'
import type { Attention, FixResult, UserProfile } from '../../shared/contract'
import { core } from '../core'
import { buildHealth } from './detail'
import { gitInfo } from './git'
import { tilde } from './paths'
import { listProjects, missingRepos } from './registry'

/** The user profile repository: its instruction files and how git sees it. Null when none is linked. */
export async function getProfile(): Promise<UserProfile | null> {
  const c = core()
  const repo = c.getProfileRepo()
  if (!repo || !existsSync(repo)) return null
  const [scan, git] = [c.scanProfile(repo), await gitInfo(repo)]
  return {
    repoPath: tilde(repo),
    branch: git.branch ?? '',
    uncommitted: git.uncommitted,
    remote: git.remote,
    files: scan.files.map((f) => ({ rel: f.rel, scope: f.scope, when: f.when, description: f.description, body: f.body })),
  }
}

const GROUPED: Record<string, (names: string) => string> = {
  update: (names) => `Excalibur desatualizado em ${names}`,
  profile: (names) => `Perfil do usuário desatualizado em ${names}`,
  snapshot: (names) => `Perfil do usuário ainda não sincronizado em ${names}`,
  remote: (names) => `Sem remoto no GitHub: ${names}`,
}

const joinNames = (names: string[]) => (names.length <= 2 ? names.join(' e ') : `${names.slice(0, -1).join(', ')} e ${names.at(-1)}`)

/** What the home screen lists as needing attention: health findings grouped across repositories, missing folders, profile problems. */
export async function listAttention(): Promise<Attention[]> {
  const c = core()
  const { projects, standalone } = await listProjects()
  const repos = [...projects.flatMap((p) => p.repos), ...standalone]

  const byKind = new Map<string, { repos: { id: string; name: string }[]; action: string }>()
  for (const repo of repos) {
    const root = c.readRegistry().find((e) => tilde(e.path) === repo.path)?.path
    if (!root) continue
    for (const item of await buildHealth(root)) {
      const entry = byKind.get(item.id) ?? { repos: [], action: item.action }
      entry.repos.push({ id: repo.id, name: repo.name })
      byKind.set(item.id, entry)
    }
  }

  const items: Attention[] = []
  for (const [id, { repos: group, action }] of byKind) {
    items.push({ id, text: (GROUPED[id] ?? ((n) => `${id}: ${n}`))(joinNames(group.map((r) => r.name))), action, kind: 'fix', fixId: id, repos: group })
  }

  for (const gone of missingRepos()) items.push({ id: `gone:${gone.path}`, text: `${gone.name} não existe mais`, action: 'Remover', kind: 'remove', repos: [], path: gone.path })

  const repo = c.getProfileRepo()
  if (repo && existsSync(repo)) {
    const { problems } = c.scanProfile(repo)
    const withoutWhen = new Set(problems.filter((p) => p.issue.includes('`when`')).map((p) => p.file))
    if (withoutWhen.size) items.push({ id: 'profile-when', text: `O perfil tem ${withoutWhen.size} ${withoutWhen.size === 1 ? 'arquivo sem' : 'arquivos sem'} a chave when`, action: 'Abrir', kind: 'profile', repos: [] })
  }
  return items
}

const run = promisify(execFile)

/** The reason a git command failed, in its own words. */
function gitFailure(error: unknown): Error {
  const out = error as { stderr?: string; stdout?: string; message: string }
  return new Error((out.stderr || out.stdout || out.message).trim().split('\n').slice(-2).join(' '))
}

/** The profile repository, or a reason there is none. */
function profileRepo(): string {
  const repo = core().getProfileRepo()
  if (!repo || !existsSync(repo)) throw new Error('Nenhum repositório de perfil está vinculado.')
  return repo
}

/**
 * Replace the text of a profile file and keep its frontmatter exactly as it was. Only files the
 * profile scan lists can be written, so a path that points anywhere else is refused.
 */
export function saveProfileFile(rel: string, body: string): void {
  const repo = profileRepo()
  const known = core()
    .scanProfile(repo)
    .files.some((f) => f.rel === rel)
  if (!known) throw new Error(`${rel} não é um arquivo do perfil.`)
  const file = join(repo, rel)
  const text = readFileSync(file, 'utf8')
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  const head = text.match(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/)?.[0] ?? ''
  const gap = head ? (text.slice(head.length).match(/^(\r?\n)*/)?.[0] ?? '') : ''
  const clean = body.replace(/\r?\n/g, eol).replace(/^(\r?\n)+/, '').replace(/(\r?\n)*$/, '')
  writeFileSync(file, `${head}${gap}${clean}${eol}`, 'utf8')
}

/** Commit everything in the profile repository. Local only: the push stays with the person. */
export async function commitProfile(message: string): Promise<FixResult> {
  const repo = profileRepo()
  const text = message.trim()
  if (!text) throw new Error('Escreva a mensagem do commit.')
  try {
    await run('git', ['add', '-A'], { cwd: repo, windowsHide: true })
    const { stdout } = await run('git', ['commit', '-m', text], { cwd: repo, windowsHide: true })
    return { summary: `Commit feito: ${stdout.trim().split('\n')[0]}. Nada foi enviado.` }
  } catch (error) {
    throw gitFailure(error)
  }
}

/** Link the profile repository: an existing git repository, or an empty folder made from the template. */
export async function linkProfile(folder: string, mode: 'existing' | 'create'): Promise<void> {
  const c = core()
  if (mode === 'create') {
    mkdirSync(folder, { recursive: true })
    c.createProfileRepo(folder)
  } else {
    if (!existsSync(folder) || !statSync(folder).isDirectory()) throw new Error(`${tilde(folder)} não existe.`)
    if ((await gitInfo(folder)).kind === 'folder') throw new Error(`${tilde(folder)} não é um repositório git.`)
  }
  c.setProfileRepo(folder)
}
