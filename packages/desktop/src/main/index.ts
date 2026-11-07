import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'

/**
 * Main process of the prototype. It only opens the window: the screens run on sample
 * data, so nothing here reads or writes the user's files.
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

void app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
