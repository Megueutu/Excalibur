import fs from 'node:fs'
import path from 'node:path'
import { projectPaths } from './paths.js'
import { resolveFile } from './resolve.js'
import { listFiles, copyFile, ensureDir } from './fsx.js'
import { parse } from './yaml.js'
import { readConfig } from './config.js'
import { estimateTokens } from './budget.js'

/**
 * Modules: optional bundles of framework content a project turns on or off.
 *
 * A module is a folder, `lib/modules/<name>/`, with a `module.yaml` (name,
 * description, default, requires) and whatever it contributes, found by
 * convention rather than declared twice:
 *
 *   context/<file>.md      standing context, copied into `<custom_dir>/context/`
 *   agents/<name>/         agents, built like the core ones
 *   skills/<name>/         skills, built like the core ones
 *
 * Modules resolve through the same base+override chain as every other file, so a
 * project defines its own at `<custom_dir>/lib/modules/<name>/`; a module with a
 * built-in name replaces the built-in one file by file.
 *
 * The active list lives in the project config as `modules:`.
 */

export const MODULES_DIR = 'lib/modules'

function moduleNames(cwd) {
  const p = projectPaths(cwd)
  const names = new Set()
  for (const root of [p.base, p.custom]) {
    const dir = path.join(root, MODULES_DIR)
    if (!fs.existsSync(dir)) continue
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) names.add(entry.name)
    }
  }
  return [...names].sort()
}

/** Relative files under one module sub-folder, from base and custom together. */
function moduleFiles(cwd, name, sub) {
  const p = projectPaths(cwd)
  const rel = `${MODULES_DIR}/${name}/${sub}`
  return [...new Set([...listFiles(path.join(p.base, rel)), ...listFiles(path.join(p.custom, rel))])].sort()
}

function asList(value) {
  if (value == null) return []
  return Array.isArray(value) ? value.map(String) : [String(value)]
}

/**
 * What turning a snap-in on adds to every session, in tokens (an estimate, like the whole budget):
 * the standing context files it copies in, plus the frontmatter of each agent and skill, because
 * their name and description are listed in every session whether or not they are ever used. The
 * bodies load only when invoked and are not counted.
 */
function alwaysLoadedTokens(cwd, mod) {
  const read = (rel) => {
    const file = resolveFile(cwd, `${MODULES_DIR}/${mod.name}/${rel}`)
    return file ? fs.readFileSync(file, 'utf8') : ''
  }
  const head = (text) => text.match(/^---\r?\n[\s\S]*?\r?\n---/)?.[0] ?? ''
  let chars = 0
  for (const f of mod.context) chars += read(`context/${f}`).length
  for (const a of mod.agents) chars += read(`agents/${a}/agent.yaml`).length
  for (const k of mod.skills) chars += head(read(`skills/${k}/SKILL.md`)).length
  return estimateTokens('x'.repeat(chars))
}

/** Every module the project can see: `Map<name, descriptor>`. */
export function availableModules(cwd) {
  const found = new Map()
  for (const name of moduleNames(cwd)) {
    const manifest = resolveFile(cwd, `${MODULES_DIR}/${name}/module.yaml`)
    if (!manifest) continue
    const doc = parse(fs.readFileSync(manifest, 'utf8')) ?? {}
    found.set(name, {
      name,
      description: doc.description ?? '',
      default: doc.default === true,
      family: typeof doc.family === 'string' ? doc.family : null,
      requires: asList(doc.requires),
      context: moduleFiles(cwd, name, 'context'),
      agents: [...new Set(moduleFiles(cwd, name, 'agents').filter((f) => f.endsWith('/agent.yaml')).map((f) => f.split('/')[0]))],
      skills: [...new Set(moduleFiles(cwd, name, 'skills').filter((f) => f.endsWith('/SKILL.md')).map((f) => f.split('/')[0]))],
      tokens: 0,
    })
  }
  for (const mod of found.values()) mod.tokens = alwaysLoadedTokens(cwd, mod)
  return found
}

/** `names` plus everything they require, in order. Throws on an unknown module. */
export function withRequirements(names, available) {
  const out = []
  const visit = (name, trail) => {
    const mod = available.get(name)
    if (!mod) throw new Error(`Unknown module "${name}". Available: ${[...available.keys()].join(', ') || 'none'}.`)
    if (trail.includes(name)) throw new Error(`Module requirements loop: ${[...trail, name].join(' -> ')}`)
    for (const dep of mod.requires) visit(dep, [...trail, name])
    if (!out.includes(name)) out.push(name)
  }
  for (const name of names) visit(name, [])
  return out
}

/**
 * The starting module list for a project: every default-on module, plus the ones the
 * onboarding answers imply (`obsidian_vault: vault` predates modules and still maps
 * to `obsidian`), plus `include`, minus `exclude`.
 */
export function deriveModules(cwd, answers = {}, { include = [], exclude = [] } = {}) {
  const available = availableModules(cwd)
  const wanted = [...available.values()].filter((m) => m.default).map((m) => m.name)
  if (answers.obsidian_vault === 'vault' && available.has('obsidian')) wanted.push('obsidian')
  const kept = [...wanted, ...include].filter((name) => !exclude.includes(name))
  return withRequirements(kept, available)
}

/** The active list: the config's `modules:` when present, else derived from its answers. */
export function activeModules(cwd) {
  const config = readConfig(cwd)
  const available = availableModules(cwd)
  if (Array.isArray(config?.modules)) return config.modules.map(String).filter((name) => available.has(name))
  return deriveModules(cwd, config?.answers)
}

function sameContent(a, b) {
  try {
    return fs.readFileSync(a, 'utf8') === fs.readFileSync(b, 'utf8')
  } catch {
    return false
  }
}

/**
 * Brings `<custom_dir>/context/` in line with the active modules: copies the context
 * of active ones, removes the managed copy of inactive ones. A copy someone edited is
 * never removed — it is reported in `kept` instead.
 */
export function syncModuleContext(cwd) {
  const p = projectPaths(cwd)
  const available = availableModules(cwd)
  const active = new Set(activeModules(cwd))
  const installed = []
  const removed = []
  const kept = []

  for (const mod of available.values()) {
    for (const file of mod.context) {
      const source = resolveFile(cwd, `${MODULES_DIR}/${mod.name}/context/${file}`)
      const target = path.join(p.context, file)
      if (active.has(mod.name)) {
        ensureDir(path.dirname(target))
        copyFile(source, target)
        installed.push(file)
      } else if (fs.existsSync(target)) {
        if (sameContent(source, target)) {
          fs.rmSync(target)
          removed.push(file)
        } else {
          kept.push(file)
        }
      }
    }
  }

  return { installed, removed, kept }
}
