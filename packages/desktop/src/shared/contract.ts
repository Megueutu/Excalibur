import { z } from 'zod'

/**
 * What the screen and the main process agree on. The prototype fills it with sample
 * data; later the same shapes come from the Excalibur core through the preload bridge.
 */

export const SnapshotState = z.enum(['fresh', 'stale', 'none'])

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
  remote: z.enum(['private', 'public', 'none']),
  files: z.array(ProfileFileSchema),
})

export const AttentionSchema = z.object({
  id: z.string(),
  text: z.string(),
  action: z.string(),
})

export type RepoKind = z.infer<typeof RepoKind>
export type Repo = z.infer<typeof RepoSchema>
export type Project = z.infer<typeof ProjectSchema>
export type ProfileFile = z.infer<typeof ProfileFileSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>
export type Attention = z.infer<typeof AttentionSchema>

export interface ProjectsOverview {
  projects: Project[]
  standalone: Repo[]
}

export interface ExcaliburApi {
  listProjects(): Promise<ProjectsOverview>
  getProfile(): Promise<UserProfile>
  listAttention(): Promise<Attention[]>
}
