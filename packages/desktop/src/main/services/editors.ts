import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)

/** Editors the app knows how to open: the id the screen uses, its name, and the commands that start it. */
const KNOWN = [
  { id: 'vscode', label: 'VS Code', commands: ['code'] },
  { id: 'cursor', label: 'Cursor', commands: ['cursor'] },
  { id: 'intellij', label: 'IntelliJ IDEA', commands: ['idea', 'idea64'] },
  { id: 'webstorm', label: 'WebStorm', commands: ['webstorm', 'webstorm64'] },
  { id: 'zed', label: 'Zed', commands: ['zed'] },
  { id: 'sublime', label: 'Sublime Text', commands: ['subl'] },
] as const

type Found = { id: string; label: string; command: string }

let found: Promise<Found[]> | null = null

async function onPath(command: string): Promise<boolean> {
  try {
    await run(process.platform === 'win32' ? 'where.exe' : 'which', [command], { timeout: 4000, windowsHide: true })
    return true
  } catch {
    return false
  }
}

/** The editors that are actually installed, found once by looking for their commands on the PATH. */
export function findEditors(): Promise<Found[]> {
  if (!found) {
    const look = async (e: (typeof KNOWN)[number]): Promise<Found | null> => {
      for (const command of e.commands) if (await onPath(command)) return { id: e.id, label: e.label, command }
      return null
    }
    found = Promise.all(KNOWN.map(look)).then((list) => list.filter((e): e is Found => e !== null))
  }
  return found
}

/** Start an editor on a path. The editor outlives the app, and a path with a quote in it is refused. */
export async function openInEditor(editorId: string, absolutePath: string): Promise<void> {
  const editor = (await findEditors()).find((e) => e.id === editorId)
  if (!editor) throw new Error(`Editor "${editorId}" was not found on this machine.`)
  if (absolutePath.includes('"')) throw new Error('Refusing a path that contains a quote.')
  // The command is a .cmd shim on Windows, which needs a shell; the path is quoted for it.
  const child = spawn(`${editor.command} "${absolutePath}"`, { shell: true, detached: true, stdio: 'ignore', windowsHide: true })
  child.unref()
}
