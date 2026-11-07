import { contextBridge } from 'electron'

/** The only thing the screen can reach: a small, typed, read-only surface. */
contextBridge.exposeInMainWorld('excalibur', {
  platform: process.platform,
  prototype: true,
})
