import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import type { FileClass, HealthItem, RepoDetail, RepoFile, SpecMeta, Task } from '../../shared/contract'
import { core } from '../core'
import { commitsSince, gitInfo } from './git'
import { isInside, tilde } from './paths'

/**
 * Everything the project page shows for one repository, read from disk: its context files, the
 * specs in the SDD, how the files link to each other, what needs doing, and what it costs an agent.
 */

const MAX_FILES = 300
const MAX_FILE_BYTES = 400_000
const SKIP_DIRS = new Set(['node_modules', '.git'])
const TEXT_FILE = /\.(md|ya?ml)$/i

type Located = { file: RepoFile; abs: string }

const posix = (p: string) => p.split(sep).join('/')

/** Files under `dir`, as absolute paths, without walking into dependency or git folders. */
function walk(dir: string, depth = 6): string[] {
  if (depth < 0 || !existsSync(dir)) return []
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.excalibur')) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full, depth - 1))
    else if (entry.isFile() && TEXT_FILE.test(entry.name)) out.push(full)
  }
  return out.sort()
}

function readText(abs: string): string {
  try {
    if (statSync(abs).size > MAX_FILE_BYTES) return ''
    return readFileSync(abs, 'utf8')
  } catch {
    return ''
  }
}

function titleOf(text: string, fallback: string): string {
  return text.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallback
}

/** Frontmatter of a Markdown file, or an empty object. */
function frontmatter(text: string): Record<string, unknown> {
  return core().parseFrontmatter(text).data
}

const asString = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null)

function specStatus(raw: unknown): SpecMeta['status'] {
  const v = asString(raw)
  if (v === 'draft') return 'draft'
  if (v === 'done' || v === 'obsolete') return 'done'
  return 'in_progress'
}

type TaskItem = { status?: string; blocked?: boolean; items?: TaskItem[]; tasks?: TaskItem[] }

/** tasks.yaml tolerates a top-level `tasks:` or `items:` list, and ordered checklists nest phases; this flattens both. */
function flatten(list: unknown): TaskItem[] {
  if (!Array.isArray(list)) return []
  return list.flatMap((entry: TaskItem) => (!entry || typeof entry !== 'object' ? [] : !entry.status && (entry.items || entry.tasks) ? flatten(entry.items ?? entry.tasks) : [entry]))
}

/**
 * Parse a YAML document through the core's own parser, which `parseFrontmatter` already wraps:
 * a `tasks.yaml` is parsed as a frontmatter block so no second YAML reader is needed.
 */
function parseYaml(text: string): Record<string, unknown> {
  return core().parseFrontmatter(`---\n${text}\n---\n`).data
}

type SpecFolder = { slug: string; dir: string }

function specFolders(sdd: string | null, repoName: string): SpecFolder[] {
  if (!sdd) return []
  const base = join(sdd, 'specs', repoName)
  if (!existsSync(base)) return []
  return readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => ({ slug: e.name, dir: join(base, e.name) }))
}

function readTask(folder: SpecFolder): { items: TaskItem[]; proposalStatus: string | null } {
  const tasksText = readText(join(folder.dir, 'tasks.yaml'))
  const doc = tasksText ? parseYaml(tasksText) : {}
  const proposalStatus = asString(frontmatter(readText(join(folder.dir, 'proposal.md'))).status)
  return { items: flatten(doc.tasks ?? doc.items), proposalStatus }
}

async function readTasks(root: string, folders: SpecFolder[]): Promise<Task[]> {
  const tasks: Task[] = []
  for (const folder of folders) {
    const { items, proposalStatus } = readTask(folder)
    const done = items.filter((i) => i.status === 'done').length
    const specFm = frontmatter(readText(join(folder.dir, 'spec.md')))
    const commit = asString(specFm.linked_commit)
    const behind = commit ? await commitsSince(root, commit) : null
    const allDone = items.length > 0 && done === items.length
    const status: Task['status'] = allDone || proposalStatus === 'done' ? 'done' : proposalStatus === 'paused' ? 'paused' : 'in-progress'
    tasks.push({
      slug: folder.slug,
      status,
      stepsDone: done,
      stepsTotal: items.length,
      spec: existsSync(join(folder.dir, 'spec.md')) ? specStatus(specFm.status) : 'draft',
      drift: behind && behind > 0 ? `${behind} ${behind === 1 ? 'commit depois' : 'commits depois'} da última atualização da spec` : null,
    })
  }
  return tasks.sort((a, b) => a.slug.localeCompare(b.slug))
}

const tokensOf = (text: string) => Math.max(0.1, Math.round((core().estimateTokens(text) / 1000) * 10) / 10)

export type DetailResult = { detail: RepoDetail; located: Map<string, Located> }

/** Build everything for one repository. `located` maps a file id to its place on disk, for reading it later. */
export async function buildDetail(root: string): Promise<DetailResult> {
  const c = core()
  const paths = c.projectPaths(root)
  const sdd = c.configuredSddPath(root)
  const repoName = basename(root)
  const located = new Map<string, Located>()

  const moduleOfFile = new Map<string, string>()
  for (const mod of c.availableModules(root).values()) for (const f of mod.context) moduleOfFile.set(f, mod.name)

  const add = (rootLabel: 'repo' | 'sdd', base: string, abs: string, cls: FileClass, opts: { group?: string | null; alwaysRead: boolean; module?: string | null; meta?: SpecMeta | null }) => {
    if (located.size >= MAX_FILES) return
    const id = `${rootLabel}:${posix(relative(base, abs))}`
    if (located.has(id)) return
    const text = readText(abs)
    located.set(id, {
      abs,
      file: {
        id,
        class: cls,
        title: titleOf(text, basename(abs)),
        group: opts.group ?? null,
        tokens: tokensOf(text),
        alwaysRead: opts.alwaysRead,
        meta: opts.meta ?? null,
        path: tilde(abs),
        module: opts.module ?? null,
      },
    })
  }

  // The agent's entry point and the standing context written into the repository.
  const claude = join(root, 'CLAUDE.md')
  if (existsSync(claude)) add('repo', root, claude, 'context', { alwaysRead: true })
  if (paths.configured && existsSync(paths.context)) {
    for (const abs of walk(paths.context)) {
      const name = posix(relative(paths.context, abs))
      if (name === 'user-profile.md') add('repo', root, abs, 'profile', { alwaysRead: true })
      else add('repo', root, abs, 'context', { alwaysRead: true, module: moduleOfFile.get(name) ?? null })
    }
    for (const abs of walk(join(paths.custom, 'user-profile'))) add('repo', root, abs, 'profile', { alwaysRead: false })
  }

  // What lives in the SDD: architecture notes, specs of this repository, decisions and reports.
  const specs = specFolders(sdd, repoName.toLowerCase())
  if (sdd && existsSync(sdd)) {
    for (const abs of walk(sdd, 0).filter((f) => /^architecture/i.test(basename(f)))) add('sdd', sdd, abs, 'context', { alwaysRead: true })
    for (const folder of specs) {
      for (const abs of walk(folder.dir, 1)) {
        const isSpec = basename(abs) === 'spec.md'
        const fm = isSpec ? frontmatter(readText(abs)) : {}
        add('sdd', sdd, abs, 'spec', {
          group: folder.slug,
          alwaysRead: false,
          meta: isSpec
            ? { status: specStatus(fm.status), updated: asString(fm.last_updated) ?? '', commit: asString(fm.linked_commit), dependsOn: [], drift: null }
            : null,
        })
      }
    }
    for (const dir of ['decisions']) for (const abs of walk(join(sdd, dir), 2)) add('sdd', sdd, abs, 'decision', { alwaysRead: false })
    for (const dir of ['reports', 'relatorios']) for (const abs of walk(join(sdd, dir), 2)) add('sdd', sdd, abs, 'report', { alwaysRead: false })
  }

  const tasks = await readTasks(root, specs)

  // Spec files show how far behind the code they are, and what they depend on.
  const specIdToFile = new Map<string, string>()
  for (const { file, abs } of located.values()) {
    if (file.meta) {
      const id = asString(frontmatter(readText(abs)).spec_id)
      if (id) specIdToFile.set(id, file.id)
    }
  }
  for (const { file, abs } of located.values()) {
    if (!file.meta) continue
    const fm = frontmatter(readText(abs))
    const depends = Array.isArray(fm.depends_on) ? fm.depends_on.map(String) : []
    file.meta.dependsOn = depends.map((d) => specIdToFile.get(d)).filter((x): x is string => !!x)
    file.meta.drift = tasks.find((t) => t.slug === file.group)?.drift ?? null
  }

  const links = collectLinks(located)
  const health = await buildHealth(root)

  const m = c.measureContext(root)
  const frameworkTokens = Math.round(((m.layers.standing[3]?.tokens ?? 0) + (m.layers.task[0]?.tokens ?? 0) + (m.layers.task[1]?.tokens ?? 0) + (m.layers.task[2]?.tokens ?? 0)) / 100) / 10

  return { detail: { tasks, health, files: [...located.values()].map((l) => l.file), links, frameworkTokens }, located }
}

/** Links between files: relative Markdown links that land on another file in the list. */
function collectLinks(located: Map<string, Located>): [string, string][] {
  const byAbs = new Map<string, string>()
  for (const [id, { abs }] of located) byAbs.set(resolve(abs).toLowerCase(), id)
  const seen = new Set<string>()
  const links: [string, string][] = []
  for (const [id, { abs }] of located) {
    if (!abs.endsWith('.md')) continue
    for (const match of readText(abs).matchAll(/\]\(([^)\s#]+)(?:#[^)]*)?\)/g)) {
      const target = match[1]!
      if (/^[a-z]+:/i.test(target)) continue
      const to = byAbs.get(resolve(dirname(abs), decodeURIComponent(target)).toLowerCase())
      if (!to || to === id) continue
      const key = [id, to].sort().join('|')
      if (seen.has(key)) continue
      seen.add(key)
      links.push([id, to])
    }
  }
  return links
}

/** The few checks the app can answer today, each with the fix the CLI offers. */
export async function buildHealth(root: string): Promise<HealthItem[]> {
  const c = core()
  const health: HealthItem[] = []
  const config = c.readConfig(root)
  const installed = c.frameworkVersion()
  const current = typeof config?.framework_version === 'string' ? config.framework_version : null
  if (current && current !== installed) {
    health.push({ id: 'update', label: `Atualizar o Excalibur de ${current} para ${installed}`, detail: 'Regenera os arquivos do harness. Seus overrides não são tocados.', action: 'Atualizar', previewable: true })
  }
  try {
    const profile = c.profileState(root)
    if (profile.snapshot === 'stale') health.push({ id: 'profile', label: 'Perfil do usuário desatualizado', detail: 'O repositório do perfil mudou desde o último sync.', action: 'Sincronizar', previewable: true })
    else if (profile.snapshot === 'none' && profile.repoExists) health.push({ id: 'snapshot', label: 'Perfil do usuário ainda não sincronizado', detail: 'O projeto ainda não tem o snapshot do perfil.', action: 'Sincronizar', previewable: true })
  } catch {
    // A project without a config has no profile layer to check.
  }
  const git = await gitInfo(root)
  if (git.kind === 'git' && !git.remote) health.push({ id: 'remote', label: 'Sem remoto no GitHub', detail: 'O repositório só existe nesta máquina.', action: 'Criar remoto', previewable: false })
  return health
}

/** The text of a file the app listed, with the frontmatter removed (the screen shows it as properties). */
export function readLocated(located: Map<string, Located>, root: string, sdd: string | null, fileId: string): string {
  const entry = located.get(fileId)
  if (!entry) throw new Error(`Unknown file: ${fileId}`)
  const inside = isInside(root, entry.abs) || (sdd !== null && isInside(sdd, entry.abs))
  if (!inside) throw new Error('Refusing to read a file outside the repository.')
  const text = readText(entry.abs)
  if (/\.ya?ml$/i.test(entry.abs)) return `\`\`\`yaml\n${text}\n\`\`\``
  return core().parseFrontmatter(text).body
}
