import fs from 'node:fs'
import path from 'node:path'
import { projectPaths } from './paths.js'
import { resolveFile } from './resolve.js'
import { copyFile, ensureDir } from './fsx.js'
import { parse } from './yaml.js'
import { readConfig } from './config.js'

/**
 * Work modes: one active bundle of interaction policy per project.
 *
 * A mode is `lib/modes/<name>/` with a `mode.yaml` (name, description) and a `mode.md`.
 * While a mode is active its `mode.md` is installed as standing context
 * (`<custom_dir>/context/mode.md`), which the entrypoint reads at the start of every
 * session; the mode text states what it overrides. The answers in the project config
 * are never rewritten, so turning a mode off only removes that one file.
 *
 * Projects define their own at `<custom_dir>/lib/modes/<name>/`.
 */

export const MODES_DIR = 'lib/modes'
export const MODE_CONTEXT_FILE = 'mode.md'

export function availableModes(cwd) {
  const p = projectPaths(cwd)
  const names = new Set()
  for (const root of [p.base, p.custom]) {
    const dir = path.join(root, MODES_DIR)
    if (!fs.existsSync(dir)) continue
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) names.add(entry.name)
    }
  }

  const found = new Map()
  for (const name of [...names].sort()) {
    const manifest = resolveFile(cwd, `${MODES_DIR}/${name}/mode.yaml`)
    const body = resolveFile(cwd, `${MODES_DIR}/${name}/${MODE_CONTEXT_FILE}`)
    if (!manifest || !body) continue
    const doc = parse(fs.readFileSync(manifest, 'utf8')) ?? {}
    const modules = doc.modules == null ? [] : (Array.isArray(doc.modules) ? doc.modules : [doc.modules]).map(String)
    found.set(name, { name, description: doc.description ?? '', body, modules })
  }
  return found
}

/** The active mode's name, or `null` when none is set or it no longer exists. */
export function activeMode(cwd) {
  const name = readConfig(cwd)?.work_mode
  return name && availableModes(cwd).has(String(name)) ? String(name) : null
}

/** Installs the active mode's text as standing context, or removes it when none is active. */
export function syncModeContext(cwd) {
  const p = projectPaths(cwd)
  const target = path.join(p.context, MODE_CONTEXT_FILE)
  const name = activeMode(cwd)

  if (!name) {
    if (fs.existsSync(target)) fs.rmSync(target)
    return null
  }

  ensureDir(p.context)
  copyFile(availableModes(cwd).get(name).body, target)
  return name
}
