import { fileURLToPath } from 'node:url'
import path from 'node:path'

/**
 * Every path the CLI knows about, in one place.
 *
 * Where a harness expects agents and skills inside a target project is still an
 * open question (see PENDENCIAS.md item 4) — it needs a practical test to answer.
 * Keeping the answer here means correcting it later is a one-line change instead
 * of a search across the codebase.
 */

const here = path.dirname(fileURLToPath(import.meta.url))

/** Root of the Excalibur package itself (the source of truth for content). */
export const packageRoot = path.resolve(here, '..', '..', '..')

/** Folders of the package that get installed into a target project's .excalibur/. */
export const shippedFolders = ['lib', 'rules', 'reflection']

/** Names used inside a target project. Fixed convention — not configurable. */
export const BASE_DIR = '.excalibur'
export const CUSTOM_DIR = '.excalibur.custom'
export const CONFIG_FILE = 'Excalibur'
export const SESSION_FILE = '.excalibur-session.yaml'
export const ANSWERS_FILE = '.excalibur-answers.yaml'
export const CUSTOM_MANIFEST = 'manifest.yaml'
export const MIGRATIONS_DIR = '_migrations'

/** Where each harness actually reads its files from, inside a target project. */
export const harnessTargets = {
  claude: {
    agents: path.join('.claude', 'agents'),
    skills: path.join('.claude', 'skills'),
  },
}

/** Absolute paths inside a target project. */
export function projectPaths(cwd) {
  return {
    root: cwd,
    base: path.join(cwd, BASE_DIR),
    custom: path.join(cwd, CUSTOM_DIR),
    config: path.join(cwd, CONFIG_FILE),
    session: path.join(cwd, SESSION_FILE),
    answers: path.join(cwd, ANSWERS_FILE),
    customManifest: path.join(cwd, CUSTOM_DIR, CUSTOM_MANIFEST),
    migrations: path.join(cwd, BASE_DIR, MIGRATIONS_DIR),
    vscode: path.join(cwd, '.vscode'),
    gitignore: path.join(cwd, '.gitignore'),
  }
}
