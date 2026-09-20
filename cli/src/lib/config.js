import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { projectPaths, packageRoot, CUSTOM_DIR } from './paths.js'
import { parse, stringify } from './yaml.js'
import { writeText, listFiles } from './fsx.js'

const require = createRequire(import.meta.url)

/** Version of the installed framework, read from the package's own package.json. */
export function frameworkVersion() {
  try {
    return require(path.join(packageRoot, 'package.json')).version
  } catch {
    return '0.0.0'
  }
}

/** The manifest that drives onboarding. */
export function loadManifest() {
  return parse(fs.readFileSync(path.join(packageRoot, 'wizard', 'manifest.yaml'), 'utf8'))
}

/** Every question resolved to its default — the "use the defaults" path. */
export function defaultAnswers(manifest) {
  const answers = {}
  for (const q of manifest.questions ?? []) answers[q.id] = q.default
  return answers
}

/** Reads the root `Excalibur` config file (no extension, YAML content). */
export function readConfig(cwd) {
  const p = projectPaths(cwd)
  if (!fs.existsSync(p.config)) return null
  try {
    return parse(fs.readFileSync(p.config, 'utf8'))
  } catch {
    return null
  }
}

export function writeConfig(cwd, config) {
  const p = projectPaths(cwd)
  const header = [
    '# Excalibur — project configuration.',
    '#',
    '# No extension on purpose, YAML content, same idea as a Dockerfile: the parser',
    '# reads the content, not the name. Lives at the root only, because that is where',
    '# the harness runs and therefore the one place reachable without resolving a',
    '# relative path.',
    '#',
    '# Written by `excalibur init`. Safe to edit by hand — `excalibur update` only ever',
    '# touches .excalibur/, so nothing here is overwritten by an update.',
    '',
  ].join('\n')
  writeText(p.config, header + stringify(config))
}

export function readAnswers(cwd) {
  const p = projectPaths(cwd)
  if (!fs.existsSync(p.answers)) return null
  try {
    return parse(fs.readFileSync(p.answers, 'utf8'))
  } catch {
    return null
  }
}

export function writeAnswers(cwd, answers, mode) {
  const p = projectPaths(cwd)
  const header = [
    '# Answers collected by `npx excalibur init`.',
    '#',
    '# This file COLLECTS, it does not implement. Run /excalibur-init in your harness',
    '# next: it picks this up and skips straight to materializing the SDD, instead of',
    '# asking everything again in chat.',
    '#',
    '# YAML rather than JSON: more compact for a model to read, and the same format the',
    '# rest of the framework already uses.',
    '',
  ].join('\n')
  writeText(p.answers, header + stringify({ version: 1, setup_mode: mode, answers }))
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
    `# Index of which paths under ${CUSTOM_DIR}/ are customized.`,
    '#',
    '# Metadata only — the customized content stays in normal files at the same relative',
    '# path. This exists so init/update can see what to apply without walking the tree.',
    '#',
    '# Updated automatically by `excalibur customize`.',
    '',
  ].join('\n')
  writeText(p.customManifest, header + stringify(manifest))
}

/** Rebuilds the index from what is actually on disk — the disk is the truth. */
export function syncCustomManifest(cwd) {
  const p = projectPaths(cwd)
  const files = listFiles(p.custom).filter((f) => f !== 'manifest.yaml')
  const manifest = { version: 1, customized: files.sort() }
  if (files.length > 0 || fs.existsSync(p.customManifest)) writeCustomManifest(cwd, manifest)
  return manifest
}

export function readSession(cwd) {
  const p = projectPaths(cwd)
  if (!fs.existsSync(p.session)) return null
  try {
    return parse(fs.readFileSync(p.session, 'utf8'))
  } catch {
    return null
  }
}

/** The nine session flags, from section 21. */
export const SESSION_FLAGS = {
  'dont-ask-me': 'Decide at ambiguous points instead of stopping to ask',
  'dry-run': 'Report what would happen; write and commit nothing',
  'skip-grillme': 'Skip the grill-me interview this session',
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
 * it, instead of guessing from a folder name — see `pipeline/sdd-path-recovery.md`.
 */
export const SDD_MARKER_FILE = '.excalibur-sdd-marker'

/**
 * Best-effort literal SDD path from the collected answers, where it's derivable
 * without the post-manifest interpretation step. `embedded` and `separate` are
 * deterministic from `cwd` alone; `external` and `new_repo` need a path only that
 * step resolves (a typed location, or a repo created on the spot), so those come
 * back `null` here. `sdd_path` in the config stays `null` until whichever step
 * actually materializes the destination fills it in.
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
 * already exists. Most of the time it doesn't yet at this point — the CLI's `init`
 * only collects answers and installs `.excalibur/`; the SDD folder itself is
 * materialized later, by the harness skill (see `wizard/entrypoint.md` and
 * `wizard/init.sh`). This is still worth calling: it covers a re-run of `init`
 * against a project whose SDD destination already exists, and it keeps the marker
 * logic in one place for whatever step creates the folder to reuse.
 */
export function writeSddMarker(sddPath) {
  if (!sddPath || !fs.existsSync(sddPath)) return false
  writeText(path.join(sddPath, SDD_MARKER_FILE), '')
  return true
}

export function writeSession(cwd, flags) {
  const p = projectPaths(cwd)
  const header = [
    '# Session directives, read by the orchestrator at the start of every session.',
    '#',
    '# Lives OUTSIDE .excalibur/ and .excalibur.custom/ on purpose: this is session state,',
    '# not a customization of a framework file. Because it sits outside .excalibur/,',
    '# `excalibur update` never touches it — editing it by hand is safe.',
    '#',
    '# Generated by `npx excalibur session <flag>`. Reset with `npx excalibur reset`.',
    '',
  ].join('\n')
  writeText(p.session, header + stringify({ version: 1, flags }))
}
