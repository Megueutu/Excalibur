/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/react" />

declare global {
  interface Window {
    /** Exposed by the preload script. */
    excalibur?: { platform: string; api: import('@shared/contract').ExcaliburApi }
  }
}

export {}
