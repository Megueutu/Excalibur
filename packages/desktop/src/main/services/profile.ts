import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'
import type { Attention, FixResult, NewInstruction, ProfileFileEdit, UserProfile } from '../../shared/contract'
import { core } from '../core'
import { buildHealth } from './detail'
import { gitInfo, lastCommitDate } from './git'
import { tilde } from './paths'
import { listProjects, missingRepos } from './registry'

/** The user profile repository: its instruction files and how git sees it. Null when none is linked. */
export async function getProfile(): Promise<UserProfile | null> {
  const c = core()
  const repo = c.getProfileRepo()
  if (!repo || !existsSync(repo)) return null
  const [scan, git, lastVersionAt] = [c.scanProfile(repo), await gitInfo(repo), await lastCommitDate(repo)]
  return {
    repoPath: tilde(repo),
    branch: git.branch ?? '',
    uncommitted: git.uncommitted,
    remote: git.remote,
    lastVersionAt,
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

/** A frontmatter value, quoted when plain YAML would misread it (a colon, a hash, edges with spaces). */
function yamlValue(value: string): string {
  const flat = value.replace(/\s*\r?\n\s*/g, ' ').trim()
  return /[:#"'[\]{}&*!|>%@`,]/.test(flat) || flat !== value ? `"${flat.replace(/"/g, '\\"')}"` : flat
}

/**
 * Set one key of a frontmatter block, keeping every other line. An empty value removes the key (for
 * `when`, no key means "always"). The block is the text from the opening `---` to the closing one.
 */
function setKey(head: string, key: string, value: string, eol: string): string {
  const line = new RegExp(`^${key}:.*$`, 'm')
  const next = value.trim() ? `${key}: ${yamlValue(value.trim())}` : null
  if (line.test(head)) return next ? head.replace(line, next) : head.replace(new RegExp(`^${key}:.*(\\r?\\n)?`, 'm'), '')
  if (!next) return head
  const close = head.lastIndexOf(`${eol}---`)
  return `${head.slice(0, close)}${eol}${next}${head.slice(close)}`
}

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/

/**
 * Write one profile file: its text, its title (the `description`) and when the agent reads it (the
 * `when`). Every other frontmatter line stays as it was. Only files the profile scan lists can be
 * written, so a path that points anywhere else is refused.
 */
export function saveProfileFile(rel: string, edit: ProfileFileEdit): void {
  const repo = profileRepo()
  const known = core()
    .scanProfile(repo)
    .files.some((f) => f.rel === rel)
  if (!known) throw new Error(`${rel} não é um arquivo do perfil.`)
  const file = join(repo, rel)
  const text = readFileSync(file, 'utf8')
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  let head = text.match(FRONTMATTER)?.[0] ?? `---${eol}---${eol}`
  const gap = text.match(FRONTMATTER) ? (text.slice(head.length).match(/^(\r?\n)*/)?.[0] ?? '') : eol
  head = setKey(setKey(head, 'description', edit.description, eol), 'when', edit.when, eol)
  const clean = edit.body.replace(/\r?\n/g, eol).replace(/^(\r?\n)+/, '').replace(/(\r?\n)*$/, '')
  writeFileSync(file, `${head}${gap}${clean}${eol}`, 'utf8')
}

/** A file name out of a title: lowercase letters, digits and hyphens, without accents. */
function fileSlug(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Start a new instruction in the profile: `global/<name>.md`, or `profiles/<scope>/<name>.md`, with its frontmatter. */
export function createProfileFile(input: NewInstruction): { rel: string } {
  const repo = profileRepo()
  const slug = fileSlug(input.title)
  if (!slug) throw new Error('Dê um título à instrução.')
  const folders = input.scope === 'global' ? 'global' : `profiles/${input.scope}`
  if (input.scope !== 'global' && !core().scanProfile(repo).files.some((f) => f.scope === input.scope) && !existsSync(join(repo, folders))) throw new Error(`O perfil "${input.scope}" não existe.`)
  const rel = `${folders}/${slug}.md`
  const file = join(repo, rel)
  if (existsSync(file)) throw new Error(`Já existe uma instrução chamada ${slug}.`)
  mkdirSync(join(repo, folders), { recursive: true })
  const head = ['---', `description: ${yamlValue(input.title)}`, ...(input.when.trim() ? [`when: ${yamlValue(input.when)}`] : []), '---', '', ''].join('\n')
  writeFileSync(file, head, 'utf8')
  return { rel }
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
