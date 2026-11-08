import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { loadCore } from './core'
import { registerIpc } from './ipc'

/**
 * Main process. It opens the window, loads the Excalibur core and answers the screen's questions
 * over IPC (see ipc.ts). Set EXCALIBUR_HOME to read another registry than the one in your home folder.
 */

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0f0f10',
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#0f0f10', symbolColor: '#cfcfcf', height: 40 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  // The window never navigates away and never opens other windows.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  if (process.env['ELECTRON_RENDERER_URL']) void win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  else void win.loadFile(join(__dirname, '../renderer/index.html'))
}

// For development and checking: expose the window to a debugger, for example to take a screenshot.
if (process.env['EXCALIBUR_DEBUG_PORT']) app.commandLine.appendSwitch('remote-debugging-port', process.env['EXCALIBUR_DEBUG_PORT'])

void app.whenReady().then(async () => {
  // In development the app sits next to the core (packages/desktop and packages/core).
  await loadCore(process.env['EXCALIBUR_CORE_DIR'] ?? join(app.getAppPath(), '..', 'core'))
  registerIpc()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
