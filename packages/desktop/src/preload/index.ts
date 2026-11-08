import { contextBridge, ipcRenderer } from 'electron'
import type { ExcaliburApi } from '../shared/contract'

/**
 * The only thing the screen can reach: the API, one method per question, each forwarded to the
 * main process. The list is checked against the contract, so a method added there cannot be forgotten here.
 */
const METHODS: (keyof ExcaliburApi)[] = ['listProjects', 'getRepoDetail', 'readFile', 'getProfile', 'listAttention', 'getCatalog', 'openPath', 'openInEditor', 'pickFolder', 'scanFolder', 'addRepos', 'runFix', 'createTask', 'saveProfileFile', 'commitProfile', 'linkProfile', 'removeMissingRepo', 'resumeTask', 'getSettings', 'setSnapshotDefault', 'createProject', 'applyRepoSettings']

const api = Object.fromEntries(METHODS.map((method) => [method, (...args: unknown[]) => ipcRenderer.invoke(`api:${method}`, ...args)])) as unknown as ExcaliburApi

contextBridge.exposeInMainWorld('excalibur', { platform: process.platform, api })
