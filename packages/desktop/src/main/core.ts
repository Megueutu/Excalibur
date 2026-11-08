import { pathToFileURL } from 'node:url'
import { join } from 'node:path'

/**
 * The Excalibur core (packages/core) is plain JavaScript shared with the CLI, so the app reads
 * projects with the same code the CLI uses. It is loaded at run time from its own folder rather
 * than bundled: it finds the framework content relative to its own file, which a bundle would break.
 * These interfaces describe only the parts the app calls.
 */

export type RegistryEntry = { path: string; name: string; framework_version: string; mode: string; last_seen: string }

export type ProfileEntry = { rel: string; scope: string; body: string; description: string; when: string; always: boolean }

export type ProfileState = {
  repo: string | null
  repoExists: boolean
  settings: { profiles: string[]; snapshot: string }
  problems: { file: string; issue: string }[]
  snapshot: 'fresh' | 'stale' | 'none'
  warnings: string[]
}

export type ModuleDescriptor = { name: string; description: string; context: string[] }

export type ContextMeasure = {
  layers: {
    standing: { label: string; tokens: number }[]
    task: { label: string; tokens: number }[]
  }
}

export type SyncResult = { status: 'no-profile' | 'repo-missing' | 'synced' | 'empty' | 'dry-run'; files?: string[]; missingProfiles?: string[] }

export interface Core {
  packageRoot: string
  projectPaths(cwd: string): { root: string; mode: string; configured: boolean; customDir: string; custom: string; context: string }
  locateConfig(cwd: string): { mode: string; file: string } | null
  readConfig(cwd: string): Record<string, unknown> | null
  configuredSddPath(cwd: string): string | null
  frameworkVersion(): string
  readRegistry(): RegistryEntry[]
  registerProject(path: string): RegistryEntry
  unregisterProject(path: string): boolean
  samePath(a: string, b: string): boolean
  getProfileRepo(): string | null
  getProjectSettings(path: string): { profiles: string[]; snapshot: string }
  profileState(cwd: string): ProfileState
  scanProfile(repo: string): { files: ProfileEntry[]; problems: { file: string; issue: string }[] }
  parseFrontmatter(text: string): { data: Record<string, unknown>; body: string; has: boolean }
  estimateTokens(text: string): number
  measureContext(cwd: string): ContextMeasure
  availableModules(cwd: string): Map<string, ModuleDescriptor>
  activeModules(cwd: string): string[]
  availableModes(cwd: string): Map<string, { name: string; description: string }>
  activeMode(cwd: string): string | null
  detectStack(cwd: string): { available: boolean; language?: string; framework?: string }
  syncUserProfile(cwd: string, options?: { dryRun?: boolean }): SyncResult
  setProfileRepo(repoPath: string): void
  userPaths(): { home: string; config: string; registry: string }
  getDefaultSnapshot(): 'ignored' | 'committed'
  setDefaultSnapshot(value: string): void
  updateConfig(cwd: string, patch: Record<string, unknown>): Record<string, unknown>
  storedSddPath(cwd: string, sddPath: string | null): string | null
  writeSddMarker(sddPath: string): boolean
  createProfileRepo(dir: string): { dir: string; created: string[]; git: boolean }
  createRemote(dir: string, options?: { name?: string; visibility?: 'private' | 'public' }): string
  createTask(cwd: string, sddRoot: string, task: { repo: string; slug: string; klass?: string; project?: string }): { dir: string; written: string[] }
}

let loaded: Core | null = null

/** Load the core from `dir` (the packages/core folder). Safe to call more than once. */
export async function loadCore(dir: string): Promise<Core> {
  if (loaded) return loaded
  const load = (file: string) => import(/* @vite-ignore */ pathToFileURL(join(dir, file)).href)
  const [paths, config, user, profile, budget, modules, modes, stack, skeleton] = await Promise.all(
    ['paths.js', 'config.js', 'user.js', 'profile.js', 'budget.js', 'modules.js', 'modes.js', 'stack-detection.js', 'skeleton.js'].map(load),
  )
  loaded = {
    packageRoot: paths.packageRoot,
    projectPaths: paths.projectPaths,
    locateConfig: paths.locateConfig,
    readConfig: config.readConfig,
    configuredSddPath: config.configuredSddPath,
    frameworkVersion: config.frameworkVersion,
    readRegistry: user.readRegistry,
    registerProject: user.registerProject,
    unregisterProject: user.unregisterProject,
    samePath: user.samePath,
    getProfileRepo: user.getProfileRepo,
    getProjectSettings: user.getProjectSettings,
    profileState: profile.profileState,
    scanProfile: profile.scanProfile,
    parseFrontmatter: profile.parseFrontmatter,
    estimateTokens: budget.estimateTokens,
    measureContext: budget.measureContext,
    availableModules: modules.availableModules,
    activeModules: modules.activeModules,
    availableModes: modes.availableModes,
    activeMode: modes.activeMode,
    detectStack: stack.detectStack,
    syncUserProfile: profile.syncUserProfile,
    setProfileRepo: user.setProfileRepo,
    userPaths: user.userPaths,
    getDefaultSnapshot: user.getDefaultSnapshot,
    setDefaultSnapshot: user.setDefaultSnapshot,
    updateConfig: config.updateConfig,
    storedSddPath: config.storedSddPath,
    writeSddMarker: config.writeSddMarker,
    createProfileRepo: profile.createProfileRepo,
    createRemote: profile.createRemote,
    createTask: skeleton.createTask,
  }
  return loaded
}

export function core(): Core {
  if (!loaded) throw new Error('The Excalibur core is not loaded yet.')
  return loaded
}
