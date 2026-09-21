import fs from 'node:fs'
import path from 'node:path'
import { locateConfig, projectPaths, packageRoot, PUBLIC_CONFIG_FILE, PACKAGE_JSON, CUSTOM_MANIFEST_FILE } from './paths.js'
import { parse, stringify } from './yaml.js'
import { writeText, listFiles } from './fsx.js'

/** Version of the installed framework, read from the package's own package.json. */
export function frameworkVersion() {
  try {
    return JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8')).version
  } catch {
    return '0.0.0'
  }
}

/** The manifest that drives onboarding — ships inside this same package now. */
export function loadManifest() {
  return parse(fs.readFileSync(path.join(packageRoot, 'onboarding', 'manifest.yaml'), 'utf8'))
}

/** Every question resolved to its default — the "use the defaults" path. */
export function defaultAnswers(manifest) {
  const answers = {}
  for (const q of manifest.questions ?? []) answers[q.id] = q.default
  return answers
}

/**
 * Reads the whole config document, wherever it lives (`excalibur.yaml` in public
 * mode, the `package.json` `"excalibur"` key in discreet mode). `null` for a project
 * that hasn't been scaffolded yet.
 */
export function readConfig(cwd) {
  const located = locateConfig(cwd)
  if (!located) return null

  try {
    if (located.mode === 'public') {
      return parse(fs.readFileSync(located.file, 'utf8'))
    }
    const pkg = JSON.parse(fs.readFileSync(located.file, 'utf8'))
    return pkg.excalibur ?? null
  } catch {
    return null
  }
}

/**
 * Writes the whole config document. `config.mode` decides where: `excalibur.yaml`
 * at the project root for `'public'`, or the `"excalibur"` key of the project's own
 * `package.json` for `'discreet'` — read-modify-write, touching no other
 * `package.json` field.
 */
export function writeConfig(cwd, config) {
  if (config.mode === 'discreet') {
    const pkgPath = path.join(cwd, PACKAGE_JSON)
    const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf8')) : {}
    pkg.excalibur = config
    writeText(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    return
  }

  const publicPath = path.join(cwd, PUBLIC_CONFIG_FILE)
  const header = [
    '# excalibur.yaml — project configuration.',
    '#',
    '# base_dir and custom_dir are recorded here for documentation, not because',
    '# anything reads them back to resolve paths — base_dir is always wherever the',
    '# excalibur package itself is installed (node_modules/excalibur/), and custom_dir',
    '# is read directly by every command that needs it.',
    '#',
    '# Written by `npx create-excalibur`. Safe to edit by hand — `excalibur update`',
    '# only overwrites the `framework_version` field, and `excalibur session` only',
    '# the `session` field.',
    '',
  ].join('\n')
  writeText(publicPath, header + stringify(config))
}

/**
 * Read-patch-write. `patch` is either an object shallow-merged into the current
 * config's top level, or a function `(current) => next` for anything deeper (e.g.
 * setting one key inside `session.flags` without clobbering the rest of `session`).
 * Returns the config that was written.
 */
export function updateConfig(cwd, patch) {
  const current = readConfig(cwd) ?? {}
  const next = typeof patch === 'function' ? patch(current) : { ...current, ...patch }
  writeConfig(cwd, next)
  return next
}

/** The index of what has been customized — metadata only, never content. */
export function readCustomManifest(cwd) {
  const p = projectPaths(cwd)
  if (!fs.existsSync(p.customManifest)) return { version: 1, customized: [] }
  try {
    const doc = parse(fs.readFileSync(p.customManifest, 'utf8'))
    return { version: doc.version ?? 1, customized: doc.customized ?? [] }
  } catch {
    return { version: 1, customized: [] }
  }
}

export function writeCustomManifest(cwd, manifest) {
  const p = projectPaths(cwd)
  const header = [
    `# Index of which paths under ${p.customDir}/ are customized.`,
    '#',
    '# Metadata only — the customized content stays in normal files at the same relative',
    '# path. This exists so a caller can see what to apply without walking the tree.',
    '#',
    '# Updated automatically by `excalibur customize`.',
    '',
  ].join('\n')
  writeText(p.customManifest, header + stringify(manifest))
}

/** Rebuilds the index from what is actually on disk — the disk is the truth. */
export function syncCustomManifest(cwd) {
  const p = projectPaths(cwd)
  const files = listFiles(p.custom).filter((f) => f !== CUSTOM_MANIFEST_FILE)
  const manifest = { version: 1, customized: files.sort() }
  if (files.length > 0 || fs.existsSync(p.customManifest)) writeCustomManifest(cwd, manifest)
  return manifest
}

/** The nine session flags, from section 21. */
export const SESSION_FLAGS = {
  'dont-ask-me': 'Decide at ambiguous points instead of stopping to ask',
  'dry-run': 'Report what would happen; write and commit nothing',
  'skip-prober': 'Skip the prober interview this session',
  'skip-review': 'Skip the review checklist this session',
  'no-history': 'Write nothing to history.yaml this session',
  'strict-rules': 'Apply global and stack rules strictly; fail the task on a violation',
  'budget-limit': 'Token/cost ceiling for the session (takes a value)',
  'read-history': 'Set to `always` to pull task history into every handoff',
  'explain-decisions': 'Justify every relevant decision out loud',
}

/**
 * Hidden, empty marker file dropped inside the SDD destination. Its only job is to
 * survive a folder rename so a later session can still find the SDD by scanning for
 * it, instead of guessing from a folder name — see `lib/pipeline/sdd-path-recovery.md`.
 */
export const SDD_MARKER_FILE = '.excalibur-sdd-marker'

/**
 * Best-effort literal SDD path from the collected answers, where it's derivable
 * without the post-manifest interpretation step. `embedded` and `separate` are
 * deterministic from `cwd` alone; `external` and `new_repo` need a path only that
 * step resolves, so those come back `null` here.
 */
export function resolveSddPath(cwd, answers) {
  switch (answers?.destination) {
    case 'embedded':
      return path.join(cwd, '.sdd')
    case 'separate':
      return path.join(path.dirname(cwd), `${path.basename(cwd)}-sdd`)
    default:
      return null
  }
}

/**
 * Writes the empty marker file inside the SDD destination, if that destination
 * already exists.
 */
export function writeSddMarker(sddPath) {
  if (!sddPath || !fs.existsSync(sddPath)) return false
  writeText(path.join(sddPath, SDD_MARKER_FILE), '')
  return true
}
