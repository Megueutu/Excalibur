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

/**
 * Root of the excalibur package itself (the source of truth for content).
 *
 * Three levels up from here (excalibur/src/lib) is the repo root, where lib/,
 * rules/, reflection/ and harnesses/ live as siblings of excalibur/ and
 * create-excalibur/ — not inside excalibur/ itself. This only resolves correctly
 * when excalibur/ is used from within this repo checkout (directly, or as a
 * file: dependency of create-excalibur/, which npm resolves as a symlink back
 * into this same checkout). A real npm registry publish would break this — see
 * PENDENCIAS.md item 5, deliberately not solved here.
 */
export const packageRoot = path.resolve(here, '..', '..', '..')

/**
 * This package's own root folder (excalibur/ itself, two levels up from
 * excalibur/src/lib) — distinct from `packageRoot` above, which is the repo root.
 * Needed for anything that belongs to this package specifically, such as its own
 * `package.json` (for `frameworkVersion()`) — reading `packageRoot`'s package.json
 * would instead pick up the repo-root `excalibur-monorepo` marker, not this package.
 */
export const ownRoot = path.resolve(here, '..', '..')

/**
 * The onboarding manifest that drives `init` now lives in the sibling
 * `create-excalibur/onboarding/` package folder (see Task 9), not inside
 * `excalibur/` itself — `init`'s logic is shared, but the manifest content is
 * scaffold-only and belongs with `create-excalibur`.
 */
export const onboardingManifestPath = path.join(packageRoot, 'create-excalibur', 'onboarding', 'manifest.yaml')

/** Folders of the package that get installed into a target project's .excalibur/. */
export const shippedFolders = ['lib', 'rules', 'reflection']

/**
 * `onboarding` is shipped into `.excalibur/onboarding/` too, but it is not a plain
 * sibling of `shippedFolders` at the repo root — it lives under
 * `create-excalibur/onboarding/` (a different package) and is copied separately by
 * `init.js`/`update.js`, not looped over generically like `shippedFolders`.
 */

/** Names used inside a target project. Fixed convention — not configurable. */
export const BASE_DIR = '.excalibur'
export const CUSTOM_DIR = '.excalibur.custom'
export const CONFIG_FILE = 'Excalibur'
export const SESSION_FILE = '.excalibur-session.yaml'
export const ANSWERS_FILE = '.excalibur-answers.yaml'
export const CUSTOM_MANIFEST = 'manifest.yaml'
export const MIGRATIONS_DIR = '_migrations'
export const CONTEXT_DIR = 'context'

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
    context: path.join(cwd, BASE_DIR, CONTEXT_DIR),
    vscode: path.join(cwd, '.vscode'),
    gitignore: path.join(cwd, '.gitignore'),
  }
}
