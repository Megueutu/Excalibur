import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { parse } from './yaml.js'

/**
 * Every path the CLI knows about, in one place.
 */

const here = path.dirname(fileURLToPath(import.meta.url))

/**
 * Root of the running excalibur package — wherever npm actually put it. In a real
 * consuming project this already IS `node_modules/@spec/excalibur/`, because the code
 * currently executing (this very file) lives inside that installed package — no
 * separate lookup needed. Content (`lib/`, `rules/`, `reflection/`, `harnesses/`,
 * `onboarding/`) ships inside the same package at the same root, so this one
 * constant is also the content source. There is no copy step: nothing is ever
 * written under `packageRoot` by any command — it's read-only package content,
 * exactly like the rest of `node_modules`.
 */
export const packageRoot = path.resolve(here, '..', '..')

export const CONTEXT_DIR = 'context'
export const DEFAULT_CUSTOM_DIR = '.overrides'
export const PUBLIC_CONFIG_FILE = 'excalibur.yaml'
export const PACKAGE_JSON = 'package.json'
export const CUSTOM_MANIFEST_FILE = 'manifest.yaml'

/** Where each harness actually reads its files from, inside a target project. */
export const harnessTargets = {
  claude: {
    agents: path.join('.claude', 'agents'),
    skills: path.join('.claude', 'skills'),
  },
}

/**
 * Finds this project's config, wherever it lives, and says which mode it implies.
 * Public: `excalibur.yaml` at the project root. Discreet: an `"excalibur"` key
 * inside the project's own `package.json`. Checks both locations — a caller never
 * needs to already know the mode before it can find the config that states it.
 * Returns `null` for a project that hasn't been scaffolded yet.
 */
export function locateConfig(cwd) {
  const publicPath = path.join(cwd, PUBLIC_CONFIG_FILE)
  if (fs.existsSync(publicPath)) return { mode: 'public', file: publicPath }

  const pkgPath = path.join(cwd, PACKAGE_JSON)
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
      if (pkg.excalibur) return { mode: 'discreet', file: pkgPath }
    } catch {
      // A malformed package.json is treated the same as "no config" — not a crash.
    }
  }

  return null
}

/** Reads just enough of the config to resolve paths — custom_dir and mode. */
function loadPathConfig(cwd) {
  const located = locateConfig(cwd)
  if (!located) return { mode: 'public', customDir: DEFAULT_CUSTOM_DIR, located: null }

  try {
    if (located.mode === 'public') {
      const doc = parse(fs.readFileSync(located.file, 'utf8'))
      return { mode: doc.mode ?? 'public', customDir: doc.custom_dir ?? DEFAULT_CUSTOM_DIR, located }
    }
    const pkg = JSON.parse(fs.readFileSync(located.file, 'utf8'))
    const doc = pkg.excalibur ?? {}
    return { mode: doc.mode ?? 'discreet', customDir: doc.custom_dir ?? DEFAULT_CUSTOM_DIR, located }
  } catch {
    return { mode: located.mode, customDir: DEFAULT_CUSTOM_DIR, located }
  }
}

/**
 * Absolute paths inside a target project.
 *
 * `base` is always `packageRoot` — read-only, never written to. `configured` is
 * `true` only when a config was actually found; every command that used to check
 * `exists(paths.base)` to mean "is this project onboarded" must check
 * `paths.configured` instead, since `base` now always exists (it's wherever the
 * currently-running code lives).
 */
export function projectPaths(cwd) {
  const { mode, customDir, located } = loadPathConfig(cwd)

  return {
    root: cwd,
    mode,
    configured: Boolean(located),
    configFile: located?.file ?? null,
    base: packageRoot,
    customDir,
    custom: path.join(cwd, customDir),
    customManifest: path.join(cwd, customDir, CUSTOM_MANIFEST_FILE),
    context: path.join(cwd, customDir, CONTEXT_DIR),
    vscode: path.join(cwd, '.vscode'),
    gitignore: path.join(cwd, '.gitignore'),
  }
}
