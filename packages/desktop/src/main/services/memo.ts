/**
 * Short-lived memory for answers that are expensive and asked for again at once: the home, the
 * sidebar and the attention list all want the list of projects, and each repository's profile state
 * is a synchronous scan that blocks the main process while it runs. Asking while an answer is still
 * fresh (or still being worked out) shares it. Writes call `forgetMemo` so nothing stale survives them.
 */
const entries = new Map<string, { at: number; value: unknown }>()

export function memo<T>(key: string, ttlMs: number, work: () => T): T {
  const hit = entries.get(key)
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T
  const value = work()
  entries.set(key, { at: Date.now(), value })
  // A promise that fails must not be served again.
  if (value instanceof Promise) value.catch(() => entries.delete(key))
  return value
}

export function forgetMemo(): void {
  entries.clear()
}
