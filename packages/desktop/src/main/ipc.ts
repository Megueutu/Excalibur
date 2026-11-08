import { BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { statSync } from 'node:fs'
import { z } from 'zod'
import { AttentionSchema, CatalogSchema, CreateProjectInputSchema, SettingsSchema, SnapshotDefault, FixResultSchema, FoundRepoSchema, ProfileLink, TaskClass, ProjectsOverviewSchema, RepoDetailSchema, UserProfileSchema } from '../shared/contract'
import { core } from './core'
import { getCatalog } from './services/catalog'
import { buildDetail, readLocated, type DetailResult } from './services/detail'
import { createTask, resumeTask, runFix } from './services/actions'
import { openInEditor } from './services/editors'
import { createProject } from './services/projects'
import { getSettings, setSnapshotDefault } from './services/settings'
import { addRepos, isAllowed, removeMissingRepo, scanFolder } from './services/folders'
import { expandHome } from './services/paths'
import { commitProfile, getProfile, linkProfile, listAttention, saveProfileFile } from './services/profile'
import { findRepo, listProjects } from './services/registry'

/**
 * The bridge's other end. Every method of the API has one handler here, and each answer is checked
 * against the same schema the screen uses before it leaves, so a wrong shape fails here, with a
 * stack trace, instead of as a blank screen.
 */

const DETAIL_TTL_MS = 5000
const detailCache = new Map<string, { at: number; root: string; sdd: string | null; result: DetailResult }>()

async function detailFor(repoId: string) {
  const entry = findRepo(repoId)
  if (!entry) throw new Error(`Unknown repository: ${repoId}`)
  const hit = detailCache.get(repoId)
  if (hit && Date.now() - hit.at < DETAIL_TTL_MS) return hit
  const next = { at: Date.now(), root: entry.path, sdd: core().configuredSddPath(entry.path), result: await buildDetail(entry.path) }
  detailCache.set(repoId, next)
  return next
}

function guard(shown: string): string {
  const absolute = expandHome(shown)
  if (!isAllowed(absolute)) throw new Error(`Refusing to open a path outside your repositories: ${shown}`)
  return absolute
}

const handle = <T>(channel: string, work: (...args: never[]) => Promise<T> | T) =>
  ipcMain.handle(`api:${channel}`, (_event, ...args) => (work as (...a: unknown[]) => Promise<T> | T)(...args))

export function registerIpc(): void {
  handle('listProjects', async () => ProjectsOverviewSchema.parse(await listProjects()))
  handle('getRepoDetail', async (repoId: string) => RepoDetailSchema.parse((await detailFor(z.string().parse(repoId))).result.detail))
  handle('readFile', async (repoId: string, fileId: string) => {
    const hit = await detailFor(z.string().parse(repoId))
    return readLocated(hit.result.located, hit.root, hit.sdd, z.string().parse(fileId))
  })
  handle('getProfile', async () => z.nullable(UserProfileSchema).parse(await getProfile()))
  handle('listAttention', async () => z.array(AttentionSchema).parse(await listAttention()))
  handle('getCatalog', async () => CatalogSchema.parse(await getCatalog()))

  handle('openPath', (shown: string) => {
    const absolute = guard(z.string().parse(shown))
    if (statSync(absolute).isDirectory()) void shell.openPath(absolute)
    else shell.showItemInFolder(absolute)
  })
  handle('openInEditor', (editorId: string, shown: string) => openInEditor(z.string().parse(editorId), guard(z.string().parse(shown))))

  handle('pickFolder', async () => {
    const window = BrowserWindow.getFocusedWindow() ?? undefined
    const result = await (window ? dialog.showOpenDialog(window, { properties: ['openDirectory'] }) : dialog.showOpenDialog({ properties: ['openDirectory'] }))
    return result.canceled || !result.filePaths[0] ? null : result.filePaths[0]
  })
  handle('scanFolder', async (folder: string) => z.array(FoundRepoSchema).parse(await scanFolder(z.string().parse(folder))))
  handle('addRepos', (paths: string[]) => {
    addRepos(z.array(z.string()).parse(paths))
    detailCache.clear()
  })

  // What these change is on disk, so the cached details are dropped whether or not they succeed.
  handle('runFix', async (repoId: string, fixId: string, preview: boolean) => {
    try {
      return FixResultSchema.parse(await runFix(z.string().parse(repoId), z.string().parse(fixId), z.boolean().parse(preview)))
    } finally {
      detailCache.clear()
    }
  })
  handle('saveProfileFile', (rel: string, body: string) => saveProfileFile(z.string().parse(rel), z.string().parse(body)))
  handle('commitProfile', async (message: string) => FixResultSchema.parse(await commitProfile(z.string().parse(message))))
  handle('linkProfile', async (folder: string, mode: string) => {
    await linkProfile(expandHome(z.string().parse(folder)), ProfileLink.parse(mode))
    detailCache.clear()
  })
  handle('removeMissingRepo', (path: string) => {
    removeMissingRepo(z.string().parse(path))
    detailCache.clear()
  })
  handle('resumeTask', (repoId: string, slug: string) => {
    try {
      resumeTask(z.string().parse(repoId), z.string().parse(slug))
    } finally {
      detailCache.clear()
    }
  })
  handle('getSettings', async () => SettingsSchema.parse(await getSettings()))
  handle('setSnapshotDefault', (value: string) => setSnapshotDefault(SnapshotDefault.parse(value)))
  handle('createProject', async (input: unknown) => {
    try {
      return await createProject(CreateProjectInputSchema.parse(input))
    } finally {
      detailCache.clear()
    }
  })
  handle('createTask', (repoId: string, slug: string, klass: string) => {
    try {
      return createTask(z.string().parse(repoId), z.string().parse(slug), TaskClass.parse(klass))
    } finally {
      detailCache.clear()
    }
  })
}
