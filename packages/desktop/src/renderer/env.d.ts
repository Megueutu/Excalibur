/// <reference types="vite/client" />

declare global {
  interface Window {
    /** Exposed by the preload script. */
    excalibur?: { platform: string; prototype: boolean }
  }
}

export {}
