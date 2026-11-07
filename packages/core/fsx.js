import fs from 'node:fs'
import path from 'node:path'

/** Small filesystem helpers shared by the commands. */

export function exists(p) {
  return fs.existsSync(p)
}

export function isEmptyDir(p) {
  if (!fs.existsSync(p)) return true
  return fs.readdirSync(p).length === 0
}

export function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

export function copyDir(from, to) {
  ensureDir(to)
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name)
    const dst = path.join(to, entry.name)
    if (entry.isDirectory()) copyDir(src, dst)
    else if (entry.isFile()) fs.copyFileSync(src, dst)
  }
}

export function copyFile(from, to) {
  ensureDir(path.dirname(to))
  fs.copyFileSync(from, to)
}

export function removeDir(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true })
}

export function removeFile(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { force: true })
}

export function readText(p) {
  return fs.readFileSync(p, 'utf8')
}

export function writeText(p, text) {
  ensureDir(path.dirname(p))
  fs.writeFileSync(p, text, 'utf8')
}

/** Every file under `dir`, as paths relative to `dir`, with forward slashes. */
export function listFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listFiles(full, base))
    else if (entry.isFile()) out.push(path.relative(base, full).split(path.sep).join('/'))
  }
  return out
}

/** Adds lines to .gitignore that aren't in it yet. Never rewrites what's there. */
export function ensureGitignore(gitignorePath, entries, header) {
  const current = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : ''
  const lines = current.split(/\r?\n/).map((l) => l.trim())
  const missing = entries.filter((e) => !lines.includes(e))
  if (missing.length === 0) return []

  const prefix = current.length > 0 && !current.endsWith('\n') ? '\n' : ''
  const block = `${prefix}\n# ${header}\n${missing.join('\n')}\n`
  fs.writeFileSync(gitignorePath, current + block, 'utf8')
  return missing
}

/** Removes Excalibur-owned entries while preserving every unrelated rule. */
export function removeGitignoreEntries(gitignorePath, entries, headers = []) {
  if (!fs.existsSync(gitignorePath)) return []

  const current = fs.readFileSync(gitignorePath, 'utf8')
  const entrySet = new Set(entries)
  const headerSet = new Set(headers.map((header) => `# ${header}`))
  const removed = []
  const kept = []

  for (const line of current.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (entrySet.has(trimmed) || headerSet.has(trimmed)) {
      removed.push(trimmed)
      continue
    }
    kept.push(line)
  }

  while (kept.length && kept[0] === '') kept.shift()
  while (kept.length && kept.at(-1) === '') kept.pop()

  if (kept.length === 0) fs.rmSync(gitignorePath, { force: true })
  else fs.writeFileSync(gitignorePath, kept.join('\n') + '\n', 'utf8')

  return removed
}
