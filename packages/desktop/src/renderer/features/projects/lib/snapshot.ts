import type { Repo } from '@shared/contract'

/** What the profile snapshot state means, in words. */
export const SNAPSHOT_TEXT: Record<Repo['snapshot'], string> = {
  fresh: 'Em dia',
  stale: 'Perfil desatualizado',
  unsynced: 'Perfil não sincronizado',
  none: 'Sem perfil',
}

/** Whether the profile layer needs a sync. */
export function needsSync(snapshot: Repo['snapshot']): boolean {
  return snapshot === 'stale' || snapshot === 'unsynced'
}

export function snapshotTone(snapshot: Repo['snapshot']): 'warn' | 'ok' {
  return needsSync(snapshot) ? 'warn' : 'ok'
}
