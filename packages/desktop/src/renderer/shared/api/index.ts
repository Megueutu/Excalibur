import type { ExcaliburApi } from '@shared/contract'
import { mockApi } from './mock'

/** The single place the screen gets its data. Swap this for the preload bridge later. */
export const api: ExcaliburApi = mockApi
