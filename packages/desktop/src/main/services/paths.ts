import { homedir } from 'node:os'
import { relative, resolve, sep } from 'node:path'

const norm = (p: string) => (process.platform === 'win32' ? resolve(p).toLowerCase() : resolve(p))

/** Whether `child` is `parent` or inside it. Case-insensitive on Windows, like its file system. */
export function isInside(parent: string, child: string): boolean {
  const rel = relative(norm(parent), norm(child))
  return rel === '' || (!rel.startsWith('..') && !/^[a-z]:/i.test(rel))
}

/** A path as the screen shows it: the home folder written as "~", forward slashes. */
export function tilde(absolute: string): string {
  const home = homedir()
  if (!isInside(home, absolute)) return absolute.split(sep).join('/')
  const rel = relative(norm(home), norm(absolute))
  // `rel` is lowercase on Windows; rebuild from the real path to keep its casing.
  const real = resolve(absolute).slice(resolve(home).length)
  return `~${rel ? real.split(sep).join('/') : ''}`
}

/** The inverse of `tilde`. */
export function expandHome(shown: string): string {
  if (shown === '~') return homedir()
  if (shown.startsWith('~/') || shown.startsWith('~\\')) return resolve(homedir(), shown.slice(2))
  return resolve(shown)
}

/** A lowercase, URL-safe version of a name, for ids. */
export function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item'
}
