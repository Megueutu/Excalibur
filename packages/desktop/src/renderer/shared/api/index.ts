import type { ExcaliburApi } from '@shared/contract'
import { mockApi } from './mock'

/**
 * The single place the screen gets its data. Inside the Electron app the preload script provides the
 * real API (it reads your repositories through the Excalibur core). In a plain browser, for example
 * while designing, there is no bridge and the screens run on sample data.
 */
export const api: ExcaliburApi = window.excalibur?.api ?? mockApi

/** True when the screens show sample data instead of the real machine. */
export const usingSampleData = !window.excalibur?.api
