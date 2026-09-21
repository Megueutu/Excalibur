import path from 'node:path'
import fs from 'node:fs'
import { projectPaths } from './paths.js'
import { listFiles } from './fsx.js'

/**
 * Base + override resolution.
 *
 * A customized file lives at `<custom_dir>/<same relative path>`. Resolution is
 * PER FILE, never per folder: customizing one file in a folder must not cost the
 * user the sibling files they never touched — those keep coming from the installed
 * package (`node_modules/excalibur/`).
 */

/** Absolute path of the effective version of `relPath`, or null if neither exists. */
export function resolveFile(cwd, relPath) {
  const p = projectPaths(cwd)
  const custom = path.join(p.custom, relPath)
  if (fs.existsSync(custom)) return custom
  const base = path.join(p.base, relPath)
  if (fs.existsSync(base)) return base
  return null
}

/** Where a file came from: 'custom', 'base' or 'missing'. */
export function resolveSource(cwd, relPath) {
  const p = projectPaths(cwd)
  if (fs.existsSync(path.join(p.custom, relPath))) return 'custom'
  if (fs.existsSync(path.join(p.base, relPath))) return 'base'
  return 'missing'
}

/**
 * The effective file list: everything in base, plus anything that exists only in
 * custom, with each entry saying where it resolved from.
 */
export function effectiveFiles(cwd) {
  const p = projectPaths(cwd)
  const base = listFiles(p.base)
  const custom = listFiles(p.custom).filter((f) => f !== 'manifest.yaml')
  const all = new Set([...base, ...custom])

  return [...all].sort().map((rel) => ({
    path: rel,
    source: custom.includes(rel) ? 'custom' : 'base',
    /** In custom but no longer in base — a rename or removal upstream left it behind. */
    orphan: custom.includes(rel) && !base.includes(rel),
  }))
}

/** Customized paths that no longer have a counterpart in base. */
export function orphanedCustomizations(cwd) {
  return effectiveFiles(cwd).filter((f) => f.orphan).map((f) => f.path)
}
