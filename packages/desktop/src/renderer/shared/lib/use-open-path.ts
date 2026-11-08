import { api } from '@/shared/api'

/** Open a path in the editor or the file manager. One place, so every path link behaves the same. */
export function openPath(path: string): void {
  void api.openPath(path)
}
