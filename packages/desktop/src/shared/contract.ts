import { z } from 'zod'

/**
 * What the screen and the main process agree on. The prototype fills it with sample
 * data; later the same shapes come from the Excalibur core through the preload bridge.
 */

/** fresh: in step. stale: the profile changed. unsynced: a profile exists but was never synced here. none: no profile layer. */
export const SnapshotState = z.enum(['fresh', 'stale', 'unsynced', 'none'])

export const RepoKind = z.enum(['github', 'git', 'folder'])

export const RepoSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  frameworkVersion: z.string(),
  snapshot: SnapshotState,
  isHub: z.boolean(),
  /** What the repository is: git with a GitHub remote, local git, or a plain folder. */
  kind: RepoKind,
  remote: z.string().nullable(),
  branch: z.string().nullable(),
  /** Files changed and not committed. Zero for a plain folder. */
  uncommitted: z.number(),
  /** Simple Icons slugs from the stack detectors; the first is the main language. */
  stack: z.array(z.string()),
})

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  mode: z.enum(['public', 'discreet']),
  workMode: z.string().nullable(),
  modules: z.array(z.string()),
  profiles: z.array(z.string()),
  repos: z.array(RepoSchema),
})

export const TaskStatus = z.enum(['in-progress', 'paused', 'done'])
export const SpecStatus = z.enum(['draft', 'in_progress', 'done'])

/** One task: a spec folder under specs/<repo>/<task>/, with its progress from tasks.yaml. */
export const TaskSchema = z.object({
  slug: z.string(),
  status: TaskStatus,
  stepsDone: z.number(),
  stepsTotal: z.number(),
  spec: SpecStatus,
  /** Set when the code moved on after the spec was last updated (anti-spec-drift). */
  drift: z.string().nullable(),
})

/** Something `doctor`, `lint` or `status` found, with the one action that fixes it. */
export const HealthItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  detail: z.string(),
  action: z.string(),
  /** The action has a dry run ("see what changes"). */
  previewable: z.boolean(),
})

export const FileClass = z.enum(['context', 'spec', 'decision', 'report', 'profile'])

/** What a spec's frontmatter says, read from the file: its state, freshness and what it depends on. */
export const SpecMetaSchema = z.object({
  status: SpecStatus,
  /** ISO date of the last update to the spec. */
  updated: z.string(),
  /** Short hash of the commit the spec is linked to, if any. */
  commit: z.string().nullable(),
  /** Ids of the files this spec depends on. */
  dependsOn: z.array(z.string()),
  /** Set when the code moved on after the spec was last updated. */
  drift: z.string().nullable(),
})

export const RepoFileSchema = z.object({
  /** Path inside the repository, also the file's identity. */
  id: z.string(),
  class: FileClass,
  title: z.string(),
  /** Sub-group inside a class, e.g. the task a spec file belongs to. */
  group: z.string().nullable(),
  /** Thousands of tokens the file costs when an agent reads it. */
  tokens: z.number(),
  /** Read at the start of every task, as opposed to opened on demand. */
  alwaysRead: z.boolean(),
  /** Present for spec files only. */
  meta: SpecMetaSchema.nullable(),
  /** Where the file is, with the home folder written as "~". */
  path: z.string(),
  /** The module that put this file in the repository's context, if one did. */
  module: z.string().nullable(),
})

export const RepoDetailSchema = z.object({
  tasks: z.array(TaskSchema),
  health: z.array(HealthItemSchema),
  files: z.array(RepoFileSchema),
  /** Links between files: [from, to], from Markdown links and frontmatter such as depends_on. */
  links: z.array(z.tuple([z.string(), z.string()])),
  /** Thousands of tokens the framework itself adds. */
  frameworkTokens: z.number(),
})

export const ProfileFileSchema = z.object({
  rel: z.string(),
  scope: z.string(),
  when: z.string(),
  description: z.string(),
  body: z.string(),
})

export const UserProfileSchema = z.object({
  repoPath: z.string(),
  branch: z.string(),
  uncommitted: z.number(),
  /** The remote as "owner/name", or null when the profile repository has none. */
  remote: z.string().nullable(),
  files: z.array(ProfileFileSchema),
})

export const AttentionSchema = z.object({
  id: z.string(),
  text: z.string(),
  action: z.string(),
  /** What the button does: apply a health fix, forget a repository whose folder is gone, or open the profile. */
  kind: z.enum(['fix', 'remove', 'profile']),
  /** For a fix: the health item id (the same ids `runFix` takes). */
  fixId: z.string().optional(),
  /** For a fix: the repositories it applies to. */
  repos: z.array(z.object({ id: z.string(), name: z.string() })),
  /** For a removal: the registered path of the missing repository. */
  path: z.string().optional(),
})

export type RepoKind = z.infer<typeof RepoKind>
export type Task = z.infer<typeof TaskSchema>
export type HealthItem = z.infer<typeof HealthItemSchema>
export type FileClass = z.infer<typeof FileClass>
export type SpecMeta = z.infer<typeof SpecMetaSchema>
export type RepoFile = z.infer<typeof RepoFileSchema>
export type RepoDetail = z.infer<typeof RepoDetailSchema>
export const ProjectsOverviewSchema = z.object({
  projects: z.array(ProjectSchema),
  standalone: z.array(RepoSchema),
})

export const CatalogSchema = z.object({
  /** Editors found on this machine that the app can open a file or folder in. */
  editors: z.array(z.object({ id: z.string(), label: z.string() })),
  modes: z.array(z.string()),
  /** Optional modules and what each adds to the context, in thousands of tokens. */
  modules: z.array(z.object({ id: z.string(), tokens: z.number() })),
  /** Recommended ceiling for the context an agent reads before a task, in thousands of tokens. */
  contextLimit: z.number(),
})

/** A folder that may be a repository, found when scanning a folder to bring into the app. */
export const FoundRepoSchema = z.object({
  path: z.string(),
  name: z.string(),
  kind: RepoKind,
  stack: z.array(z.string()),
  /** Has an Excalibur config, so the app can manage it. */
  configured: z.boolean(),
  /** Already in the app. */
  registered: z.boolean(),
})

export type Repo = z.infer<typeof RepoSchema>
export type Project = z.infer<typeof ProjectSchema>
export type ProfileFile = z.infer<typeof ProfileFileSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>
export type Attention = z.infer<typeof AttentionSchema>
export type FoundRepo = z.infer<typeof FoundRepoSchema>
export type ProjectsOverview = z.infer<typeof ProjectsOverviewSchema>
export type Catalog = z.infer<typeof CatalogSchema>

export const SnapshotDefault = z.enum(['ignored', 'committed'])
export type SnapshotDefault = z.infer<typeof SnapshotDefault>

export const SettingsSchema = z.object({
  configPath: z.string(),
  registryPath: z.string(),
  frameworkVersion: z.string(),
  /** The GitHub CLI: ready, installed but signed out, or missing. */
  gh: z.enum(['ready', 'signed-out', 'missing']),
  snapshotDefault: SnapshotDefault,
})
export type Settings = z.infer<typeof SettingsSchema>

/** Names that are safe as a folder on any system: letters, digits, dot, hyphen and underscore. */
const FolderName = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, 'Use letras, números, ponto, hífen ou sublinhado.').max(64)

export const CreateProjectInputSchema = z.object({
  name: FolderName,
  /** The folder that will hold the project's own folder. */
  folder: z.string().min(1),
  repos: z.array(z.object({ name: FolderName, kind: RepoKind, hub: z.boolean() })).min(1).max(12),
})
export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>

export const ProfileLink = z.enum(['existing', 'create'])
export type ProfileLink = z.infer<typeof ProfileLink>

export const TaskClass = z.enum(['fix', 'feature', 'big-feature'])
export type TaskClass = z.infer<typeof TaskClass>

/** What a fix did (or, as a preview, would do), in a sentence the screen can show as is. */
export const FixResultSchema = z.object({ summary: z.string() })
export type FixResult = z.infer<typeof FixResultSchema>

export interface ExcaliburApi {
  listProjects(): Promise<ProjectsOverview>
  getRepoDetail(repoId: string): Promise<RepoDetail>
  readFile(repoId: string, fileId: string): Promise<string>
  /** The user profile, or null when none is linked. */
  getProfile(): Promise<UserProfile | null>
  listAttention(): Promise<Attention[]>
  getCatalog(): Promise<Catalog>
  /** Show a path in the file manager. */
  openPath(path: string): Promise<void>
  /** Open a file or folder in a specific editor. */
  openInEditor(editorId: string, path: string): Promise<void>
  /** Ask the person for a folder with the system dialog. Null when they cancel. */
  pickFolder(): Promise<string | null>
  /** Look inside a folder for repositories to bring into the app. */
  scanFolder(folder: string): Promise<FoundRepo[]>
  /** Bring repositories into the app. Only ones that already have an Excalibur config are accepted. */
  addRepos(paths: string[]): Promise<void>
  /** Apply the fix a health item offers, or only say what it would change. Throws with the reason when it cannot. */
  runFix(repoId: string, fixId: string, preview: boolean): Promise<FixResult>
  /** Create a task folder in the SDD from the template. Returns the new folder, as shown. */
  createTask(repoId: string, slug: string, klass: TaskClass): Promise<{ path: string }>
  /** Replace the text of one profile file (by its path inside the profile repository), keeping its frontmatter. */
  saveProfileFile(rel: string, body: string): Promise<void>
  /** Commit every change in the profile repository with this message. Never pushes. */
  commitProfile(message: string): Promise<FixResult>
  /** Link the profile repository: a folder that is already a git repository, or an empty one to start from the template. */
  linkProfile(folder: string, mode: ProfileLink): Promise<void>
  /** Forget a registered repository whose folder no longer exists. Refuses one that is still there; never deletes files. */
  removeMissingRepo(path: string): Promise<void>
  /** Set a paused task back to in-progress in its proposal's frontmatter. */
  resumeTask(repoId: string, slug: string): Promise<void>
  getSettings(): Promise<Settings>
  /** Choose whether new projects keep the profile snapshot out of git or commit it. */
  setSnapshotDefault(value: SnapshotDefault): Promise<void>
  /** Create the folders, run git init and the CLI's init for each repository, and register them. Never creates a GitHub remote. */
  createProject(input: CreateProjectInput): Promise<{ path: string }>
}
